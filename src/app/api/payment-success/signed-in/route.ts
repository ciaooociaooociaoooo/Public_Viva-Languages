import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@/auth'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session?.user?.role !== 'student') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!paymentIntentId) {
      return NextResponse.json(
        { message: 'Missing Payment Intent ID' },
        { status: 400 },
      )
    }

    const query = `
      SELECT 
        o.id,
        o.total,
        o.paid_at,
        jsonb_agg(
          jsonb_build_object(
            'order_item_id', oi.id,
            'program_id', oi.snapshot_program_id,
            'name', oi.snapshot_program_name,
            'price', oi.snapshot_program_price,
            'quantity', oi.quantity,
            'image_url', img.url,
            'image_width',img.width,
            'image_height',img.height
          )
        ) AS items
      FROM "order" o
      JOIN order_item oi ON o.id = oi.order_id
      LEFT JOIN image img ON
        img.target_id = oi.id 
        AND img.target_table = 'order_item' 
        AND img.type = 'snapshot'
      WHERE o.payment_intent_id = $1
        AND o.user_id = $2::uuid
      GROUP BY o.id;
    `

    const res = await sql.query(query, [paymentIntentId, session.user.id])

    // (order not created yet)
    if (!res.length) {
      return NextResponse.json({ order: null }, { status: 200 })
    }

    const order = res[0]

    return NextResponse.json({
      order: {
        order_id: order.id,
        total: order.total,
        paid_at: order.paid_at,
        items: order.items ?? [],
      },
    })
  } catch (error) {
    console.error('Database Error:', error)

    return NextResponse.json(
      { message: 'Failed to fetch order' },
      { status: 500 },
    )
  }
}
