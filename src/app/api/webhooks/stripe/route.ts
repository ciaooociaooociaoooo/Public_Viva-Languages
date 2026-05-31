import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../lib/stripe'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function processSuccessfulPayment(
  paymentIntentId: string,
  amount: number,
  name: string | null,
  receiptEmail: string,
  userId: string | null,
  guestId: string | null,
  cartId: string,
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Create or update student
    let studentId: string | undefined

    // 1A. If it's signed in user
    // (create new student; if a student with the same user_id already exists, update the student data with the user data.)
    if (userId) {
      const result = await client.query(
        `
            INSERT INTO student (user_id, email, name, mobile, date_of_birth)
            SELECT
                u.id, u.email, u.name, u.mobile, u.date_of_birth
            FROM "user" u
            WHERE u.id = $1
            ON CONFLICT (user_id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                mobile = EXCLUDED.mobile,
                date_of_birth = EXCLUDED.date_of_birth
            RETURNING id;
            `,
        [userId],
      )
      studentId = result.rows[0]?.id
      // 1B. If it's guest
      // (create new student; if a student with the same guest_id already exists, update the student data with the user input data.)
    } else if (guestId) {
      const result = await client.query(
        `
        INSERT INTO student (guest_id, email, name)
        VALUES ($1, $2, $3)
        ON CONFLICT (guest_id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name 
        RETURNING id;
        `,
        [guestId, receiptEmail, name],
      )
      studentId = result.rows[0]?.id
    }

    if (!studentId) {
      throw new Error('Failed to create or find student record.')
    }

    // 2. Create new order
    const newOrderResult = await client.query(
      `
      INSERT INTO "order" (
        user_id, guest_id, student_id, total, payment_intent_id, receipt_email, status, paid_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW()
      )
      RETURNING id, user_id;
    `,
      [
        userId,
        guestId,
        studentId,
        (amount / 100).toFixed(2), // (convert cents to dollars)
        paymentIntentId,
        receiptEmail,
        'Paid',
      ],
    )

    const newOrder = newOrderResult?.rows?.[0]
    const newOrderId = newOrder?.id
    if (!newOrderId) {
      throw new Error('Failed creating new order.')
    }

    // 3. Fetch snapshots
    const itemsSnapshotResult = await client.query(
      `
        SELECT
          ci.program_id,
          ci.quantity,
          p.id AS snapshot_program_id,
          p.name AS snapshot_program_name,
          p.price AS snapshot_program_price,
          p.created_at AS snapshot_program_created_at,
          p.description AS snapshot_program_description,
          p.enrollment_limit AS snapshot_program_enrollment_limit,
          c.name AS snapshot_program_category,
          l.code AS snapshot_program_level,
          p.age_group AS snapshot_program_age_group,

          -- Course specific data
          lang.name AS snapshot_course_language_name,
          co.total_lessons AS snapshot_course_total_lessons,
          (
            SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name))
            FROM course_teacher ct
            JOIN teacher t ON t.id = ct.teacher_id
            WHERE ct.course_id = co.id
          ) AS snapshot_course_teachers,

          -- Event specific data
          (
            SELECT jsonb_agg(jsonb_build_object('id', h.id, 'name', h.name, 'role', eh.role))
            FROM event_host eh
            JOIN host h ON h.id = eh.host_id
            WHERE eh.event_id = e.id
          ) AS snapshot_event_hosts,

          co.id AS course_id,
          e.id AS event_id,

          -- Image snapshot data
          i.url AS image_url,
          i.public_id AS image_public_id,
          i.width AS image_width,
          i.height AS image_height,
          i.bytes AS image_bytes

        FROM cart_item ci
        JOIN program p ON p.id = ci.program_id
        JOIN category c ON c.id = p.category_id
        JOIN level l ON l.id = p.level_id
        LEFT JOIN course co ON co.program_id = p.id
        LEFT JOIN language lang ON lang.code = co.language_code
        LEFT JOIN event e ON e.program_id = p.id
        LEFT JOIN image i ON i.target_id = p.id AND i.target_table = 'program' AND i.type = 'poster'
        WHERE ci.cart_id = $1;
      `,
      [cartId],
    )

    const itemsSnapshotRows = itemsSnapshotResult?.rows
    if (itemsSnapshotRows?.length === 0) {
      throw new Error('Cart is empty or not found for processing.')
    }

    // 4. Create new order items; Create new image snapshots; Create new student_course / student_event
    for (const row of itemsSnapshotRows) {
      // 4A. Create new order items
      const newOrderItemResult = await client.query(
        `
        INSERT INTO order_item (
          order_id, program_id, quantity,
          snapshot_program_id, snapshot_program_name, snapshot_program_price, snapshot_program_created_at,
          snapshot_program_category, snapshot_program_level, snapshot_program_age_group, snapshot_program_description, snapshot_program_enrollment_limit,
          snapshot_course_language_name, snapshot_course_teachers, snapshot_course_total_lessons, snapshot_event_hosts
        )
        VALUES (
          $1, $2, $3,
          $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16
        )
        RETURNING id;
      `,
        [
          newOrderId,
          row.program_id,
          row.quantity,
          // (snapshot values)
          row.snapshot_program_id,
          row.snapshot_program_name,
          row.snapshot_program_price,
          row.snapshot_program_created_at,
          row.snapshot_program_category,
          row.snapshot_program_level,
          row.snapshot_program_age_group,
          row.snapshot_program_description,
          row.snapshot_program_enrollment_limit,
          row.snapshot_course_language_name,
          JSON.stringify(row.snapshot_course_teachers),
          row.snapshot_course_total_lessons,
          JSON.stringify(row.snapshot_event_hosts),
        ],
      )

      const newOrderItemId = newOrderItemResult?.rows?.[0]?.id

      if (!newOrderItemId) {
        throw new Error('Failed creating new order items.')
      }

      // 4B. Create new image snapshots
      // (only if the program has poster image)
      if (row?.image_url) {
        await client.query(
          `
          INSERT INTO image (
            url, public_id, width, height, bytes,
            target_table, target_id, type
          )
          VALUES (
            $1, $2, $3, $4, $5,
            'order_item', $6, 'snapshot'
          );
        `,
          [
            row.image_url,
            row.image_public_id,
            row.image_width,
            row.image_height,
            row.image_bytes,
            newOrderItemId,
          ],
        )
      }

      // 4C. Create new student_course / student_event
      // (if it's course)
      if (row.course_id) {
        await client.query(
          `
            INSERT INTO student_course (student_id, course_id)
            VALUES ($1, $2)
            ON CONFLICT (student_id, course_id) DO NOTHING;
          `,
          [studentId, row.course_id],
        )
      }

      // (if it's event)
      // (create new student_event; if already exists, add the new quantity.)
      if (row.event_id) {
        await client.query(
          `
          INSERT INTO student_event (student_id, event_id, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (student_id, event_id)
          DO UPDATE SET
            quantity = student_event.quantity + EXCLUDED.quantity,
            updated_at = NOW();
        `,
          [studentId, row.event_id, row.quantity],
        )
      }
    }

    // 5. Clean up the cart
    await client.query(
      `
      DELETE FROM cart_item
      WHERE cart_id = $1;
    `,
      [cartId],
    )
    await client.query(
      `
      DELETE FROM cart
      WHERE id = $1;
    `,
      [cartId],
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function POST(req: Request) {
  let event

  const signature = (await headers()).get('stripe-signature')
  if (!signature) {
    return NextResponse.json(
      { message: 'Missing Stripe signature' },
      { status: 400 },
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      webhookSecret,
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    // On error, log and return the error message.
    if (err) {
      // console.log(err)
    }
    // console.log(`Error message: ${errorMessage}`)

    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    )
  }

  const permittedEvents = ['payment_intent.succeeded']

  if (permittedEvents.includes(event.type)) {
    let data

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          data = event.data.object

          const name = data.metadata.name || null
          const cartId = data.metadata.cart_id
          const userId = data.metadata.user_id || null
          const guestId = data.metadata.guest_id || null
          const receiptEmail = data.receipt_email

          if (!cartId || (!userId && !guestId) || !receiptEmail) {
            console.error(
              'Missing required Payment Intent metadata or email. Payment Intent ID:',
              data.id,
            )
            return NextResponse.json(
              { message: 'Missing metadata' },
              { status: 400 },
            )
          }

          try {
            await processSuccessfulPayment(
              data.id,
              data.amount,
              name,
              receiptEmail,
              userId,
              guestId,
              cartId,
            )

          } catch (dbError) {
            console.error('Database transaction failed:', dbError)
            return NextResponse.json(
              { message: 'Database transaction failed' },
              { status: 500 },
            )
          }

          break

        default:
          throw new Error(`Unhandled event: ${event.type}`)
      }
    } catch (error) {
      // console.log(error)
      return NextResponse.json(
        { message: 'Webhook handler failed' },
        { status: 500 },
      )
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: 'Received' }, { status: 200 })
}
