'use server'

import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import {
  newProgramFormSchema,
  NewProgramForm_ActionState,
  editProgramFormSchema,
  EditProgramForm_ActionState,
  guestOrderSchema,
} from './schema'
import { cloudinary } from './cloudinaryConfig'
import { neon } from '@neondatabase/serverless'
import { revalidatePath, revalidateTag } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/auth'
import { cookies } from 'next/headers'
import {
  CartItemCheckoutType,
  CheckoutCartReturnType,
  GUEST_CART_COOKIE_MAX_AGE,
  GUEST_CART_COOKIE_NAME,
  ValidateOrderReturnType,
} from './definitions'
import { stripe } from '@/app/lib/stripe'
import { fetchGuestCart, fetchSignedInCart } from './data'

const sql = neon(process.env.DATABASE_URL!)

// @route /dashboard/new-program
// @access Private
// @role Admin Only
export async function createNewProgram(
  _prevState: NewProgramForm_ActionState,
  formData: FormData,
): Promise<NewProgramForm_ActionState> {
  const session = await auth()
  if (!session || session?.user?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  // (sanitize desc content again)
  const window = new JSDOM('').window
  const purify = DOMPurify(window)

  const rawDesc = formData.get('description')
  const cleanDesc = purify.sanitize(String(rawDesc ?? ''))

  // (Server Side Form Validation)
  const validatedFields = newProgramFormSchema.safeParse({
    programName: formData.get('program_name'),
    category: formData.get('category'),
    teacher: formData.get('teacher'),
    language: formData.get('language'),
    totalLessons: formData.get('total_lessons'),
    host: formData.get('host'),
    level: formData.get('level'),
    ageGroup: formData.get('age'),
    enrollmentLimit: formData.get('enrollment_limit'),
    price: formData.get('price'),
    description: cleanDesc,
    poster: formData.get('poster'),
    posterPublicId: formData.get('posterPublicId'),
    posterWidth: formData.get('posterWidth'),
    posterHeight: formData.get('posterHeight'),
    posterSize: formData.get('posterSize'),
  })

  // (when validation fails)
  if (!validatedFields.success) {
    return {
      type: 'validation',
      data: {
        category: formData.get('category') as 'Course' | 'Event',
        errors: validatedFields.error.flatten().fieldErrors,
      },
      message: 'Please submit correct input values.',
    }
  }

  // (when validation success)

  if (validatedFields.data.category === 'Course') {
    const {
      programName,
      category,
      teacher,
      language,
      totalLessons,
      level,
      ageGroup,
      enrollmentLimit,
      price,
      description,
      poster,
      posterPublicId,
      posterWidth,
      posterHeight,
      posterSize,
    } = validatedFields.data

    const programId = uuidv4()
    const courseId = uuidv4()

    try {
      const [categoryArr, levelArr, languageArr, teacherArr] =
        await Promise.all([
          sql`SELECT id FROM category WHERE name = ${category}`,
          sql`SELECT id FROM level WHERE code = ${level}`,
          sql`SELECT code FROM language WHERE name = ${language}`,
          sql`SELECT id FROM teacher WHERE id = ${teacher}`,
        ])

      if (!categoryArr?.length || !categoryArr?.[0]?.id) {
        throw new Error(`Category "${category}" does not exist`)
      }

      if (!levelArr?.length || !levelArr?.[0]?.id) {
        throw new Error(`Level "${level}" does not exist`)
      }

      if (!languageArr?.length || !languageArr?.[0]?.code) {
        throw new Error(`Language "${language}" does not exist`)
      }

      if (!teacherArr?.length || !teacherArr?.[0]?.id) {
        throw new Error(`Teacher "${teacher}" does not exist`)
      }

      await sql.transaction([
        sql`INSERT INTO program (
    id,
    name,
    description,
    age_group,
    price,
    category_id,
    level_id,
    enrollment_limit
  ) VALUES (
    ${programId},
    ${programName},
    ${description},
    ${ageGroup},
    ${price},
    ${categoryArr[0].id},
    ${levelArr[0].id},
    ${enrollmentLimit}
  )`,
        sql`INSERT INTO course (
    id,
    language_code,
    program_id,
    total_lessons
  ) VALUES (
    ${courseId},
    ${languageArr[0].code},
    ${programId},
    ${totalLessons}
  )`,
        sql`INSERT INTO course_teacher (
    course_id,
    teacher_id
  ) VALUES (
    ${courseId},
    ${teacherArr[0].id}
  )`,
        sql`INSERT INTO image (
   url,
   public_id,
   width,
   height,
   bytes,
   target_table,
   target_id,
   type
  ) VALUES (
    ${poster},
    ${posterPublicId},
    ${posterWidth},
    ${posterHeight},
    ${posterSize},
    ${'program'},
    ${programId},
    ${'poster'}
  )`,
      ])

      revalidateTag('fetchPrograms')

      return {
        type: 'operation',
        success: true,
        message: `New program ${programName} created.`,
      }
    } catch (error) {
      console.error(
        'There is an error occurred. Failed to create new program.',
        error,
      )
      return {
        type: 'operation',
        success: false,
        message: 'There is an error occurred. Failed to create new program.',
      }
    }
  } else if (validatedFields.data.category === 'Event') {
    const {
      programName,
      category,
      host,
      level,
      ageGroup,
      enrollmentLimit,
      price,
      description,
      poster,
      posterPublicId,
      posterWidth,
      posterHeight,
      posterSize,
    } = validatedFields.data

    const programId = uuidv4()
    const eventId = uuidv4()

    try {
      const [categoryArr, levelArr, hostArr] = await Promise.all([
        sql`SELECT id FROM category WHERE name = ${category}`,
        sql`SELECT id FROM level WHERE code = ${level}`,
        sql`SELECT id FROM host WHERE id = ${host}`,
      ])

      if (!categoryArr?.length || !categoryArr?.[0]?.id) {
        throw new Error(`Category "${category}" does not exist`)
      }

      if (!levelArr?.length || !levelArr?.[0]?.id) {
        throw new Error(`Level "${level}" does not exist`)
      }

      if (!hostArr?.length || !hostArr?.[0]?.id) {
        throw new Error(`hostArr "${host}" does not exist`)
      }

      await sql.transaction([
        sql`INSERT INTO program (
    id,
    name,
    description,
    age_group,
    price,
    category_id,
    level_id,
    enrollment_limit
  ) VALUES (
    ${programId},
    ${programName},
    ${description},
    ${ageGroup},
    ${price},
    ${categoryArr[0].id},
    ${levelArr[0].id},
    ${enrollmentLimit}
  )`,
        sql`INSERT INTO event (
    id,
    program_id
  ) VALUES (
    ${eventId},
    ${programId}
  )`,
        sql`INSERT INTO event_host (
    event_id,
    host_id
  ) VALUES (
    ${eventId},
    ${hostArr[0].id}
  )`,
        sql`INSERT INTO image (
   url,
   public_id,
   width,
   height,
   bytes,
   target_table,
   target_id,
   type
  ) VALUES (
    ${poster},
    ${posterPublicId},
    ${posterWidth},
    ${posterHeight},
    ${posterSize},
    ${'program'},
    ${programId},
    ${'poster'}
  )`,
      ])

      revalidateTag('fetchPrograms')

      return {
        type: 'operation',
        success: true,
        message: `New program ${programName} created.`,
      }
    } catch (error) {
      console.error(
        'There is an error occurred. Failed to create new program.',
        error,
      )
      return {
        type: 'operation',
        success: false,
        message: 'There is an error occurred. Failed to create new program.',
      }
    }
  } else {
    return {
      type: 'operation',
      success: false,
      message: 'Unknown category. Failed to create new program.',
    }
  }
}

// @route /dashboard/programs/[id]/edit
// @access Private
// @role Admin Only
export async function editProgram(
  _prevState: EditProgramForm_ActionState,
  formData: FormData,
): Promise<EditProgramForm_ActionState> {
  const session = await auth()
  if (!session || session?.user?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  // (sanitize desc content again)
  const window = new JSDOM('').window
  const purify = DOMPurify(window)

  const rawDesc = formData.get('description')
  const cleanDesc = purify.sanitize(String(rawDesc ?? ''))

  // (Server Side Form Validation)
  const validatedFields = editProgramFormSchema.safeParse({
    programId: formData.get('program_id'),
    programName: formData.get('program_name'),
    category: formData.get('category'),
    teacher: formData.get('teacher'),
    language: formData.get('language'),
    totalLessons: formData.get('total_lessons'),
    host: formData.get('host'),
    level: formData.get('level'),
    ageGroup: formData.get('age'),
    enrollmentLimit: formData.get('enrollment_limit'),
    price: formData.get('price'),
    description: cleanDesc,
    poster: formData.get('poster'),
    posterPublicId: formData.get('posterPublicId'),
    posterWidth: formData.get('posterWidth'),
    posterHeight: formData.get('posterHeight'),
    posterSize: formData.get('posterSize'),
  })

  // (when validation fails)
  if (!validatedFields.success) {
    return {
      type: 'validation',
      data: {
        category: formData.get('category') as 'Course' | 'Event',
        errors: validatedFields.error.flatten().fieldErrors,
      },
      message: 'Please submit correct input values.',
    }
  }

  // (when validation success)

  if (validatedFields.data.category === 'Course') {
    const {
      programId,
      programName,
      category,
      teacher,
      language,
      totalLessons,
      level,
      ageGroup,
      enrollmentLimit,
      price,
      description,
      poster,
      posterPublicId,
      posterWidth,
      posterHeight,
      posterSize,
    } = validatedFields.data

    try {
      // (Check values in DB)
      const [categoryArr, levelArr, languageArr, teacherArr] =
        await Promise.all([
          sql`SELECT id FROM category WHERE name = ${category}`,
          sql`SELECT id FROM level WHERE code = ${level}`,
          sql`SELECT code FROM language WHERE name = ${language}`,
          sql`SELECT id FROM teacher WHERE id = ${teacher}`,
        ])

      if (!categoryArr?.length || !categoryArr?.[0]?.id) {
        throw new Error(`Category "${category}" does not exist`)
      }

      if (!levelArr?.length || !levelArr?.[0]?.id) {
        throw new Error(`Level "${level}" does not exist`)
      }

      if (!languageArr?.length || !languageArr?.[0]?.code) {
        throw new Error(`Language "${language}" does not exist`)
      }

      if (!teacherArr?.length || !teacherArr?.[0]?.id) {
        throw new Error(`Teacher "${teacher}" does not exist`)
      }

      // (Fetch original from Db)
      const originalProgramArr = await sql`
      SELECT 
      p.id, p.name, p.description, p.age_group, p.price, p.enrollment_limit, p.category_id, 
      cat.name as category_name, 
      c.id as course_id, c.total_lessons, 
      c.language_code, ct.teacher_id,
      e.id as event_id, eh.host_id, i.url, 
      i.public_id, i.width, i.height, i.bytes
      FROM program p

      JOIN category cat ON cat.id = p.category_id
      LEFT JOIN course c ON c.program_id = p.id
      LEFT JOIN course_teacher ct ON ct.course_id = c.id
      LEFT JOIN event e ON e.program_id = p.id
      LEFT JOIN event_host eh ON eh.event_id = e.id
      LEFT JOIN image i ON i.target_table = 'program' AND i.target_id = p.id AND i.type = 'poster'
      
      WHERE p.id = ${programId}
    `

      if (!originalProgramArr?.length) {
        throw new Error(`Program ${programId} does not exist`)
      }

      const originalProgram = originalProgramArr[0]

      const updates = []

      // (if values in program table change)
      if (
        originalProgram.name !== programName ||
        originalProgram.description !== description ||
        originalProgram.age_group !== ageGroup ||
        originalProgram.price !== price ||
        originalProgram.enrollment_limit !== enrollmentLimit ||
        originalProgram.level_id !== levelArr[0].id ||
        originalProgram.category_id !== categoryArr[0].id
      ) {
        updates.push(sql`
        UPDATE program 
        SET name = ${programName},
            description = ${description},
            age_group = ${ageGroup},
            price = ${price},
            enrollment_limit = ${enrollmentLimit},
            level_id = ${levelArr[0].id},
            category_id = ${categoryArr[0].id}
        WHERE id = ${programId}
      `)
      }

      // (if category switches)
      let isCategorySwitched = false
      if (originalProgram.category_name !== category) {

        isCategorySwitched = true

        const courseId = uuidv4()

        // (Remove original event & original event_host)
        updates.push(
          sql`DELETE FROM event_host WHERE event_id = ${originalProgram.event_id}`,
        )
        updates.push(sql`DELETE FROM event WHERE program_id = ${programId}`)

        // (Create new course & course_teacher)
        updates.push(sql`
          INSERT INTO course (id, language_code, program_id, total_lessons)
          VALUES (${courseId}, ${languageArr[0].code}, ${programId}, ${totalLessons})
        `)
        updates.push(sql`
          INSERT INTO course_teacher (course_id, teacher_id)
          VALUES (${courseId}, ${teacher})
        `)

        // (Change quantity of programs in the cart to 1, since Course should only allows 1 quantity per person.)
        updates.push(sql`
          UPDATE cart_item SET quantity = 1
          WHERE program_id = ${programId}
        `)
      }

      // (if values in course table change)
      if (
        (originalProgram?.total_lessons !== Number(totalLessons) ||
          originalProgram?.language_code !== languageArr[0].code) &&
        isCategorySwitched === false
      ) {
        updates.push(sql`
            UPDATE course
            SET total_lessons = ${totalLessons},
                language_code = ${languageArr[0].code}
            WHERE program_id = ${programId}
          `)
      }

      // (if teacher changes)
      if (
        originalProgram.teacher_id !== teacher &&
        isCategorySwitched === false
      ) {
        updates.push(
          sql`DELETE FROM course_teacher WHERE course_id = ${originalProgram.course_id}`,
        )
        updates.push(sql`
            INSERT INTO course_teacher (course_id, teacher_id)
            VALUES (${originalProgram.course_id}, ${teacher})
          `)
      }

      // (if image changes)
      if (
        originalProgram.url !== poster ||
        originalProgram.public_id !== posterPublicId ||
        originalProgram.width !== Number(posterWidth) ||
        originalProgram.height !== Number(posterHeight) ||
        originalProgram.bytes !== Number(posterSize)
      ) {
        updates.push(sql`
        UPDATE image
        SET url = ${poster},
            public_id = ${posterPublicId},
            width = ${posterWidth},
            height = ${posterHeight},
            bytes = ${posterSize}
        WHERE target_table = 'program' AND target_id = ${programId} AND type = 'poster'
      `)
      }

      if (updates.length > 0) {
        await sql.transaction(updates)

        revalidateTag('fetchPrograms')

        return {
          type: 'operation',
          success: true,
          message: `Program ${programName} updated successfully.`,
        }
      } else {
        return {
          type: 'operation',
          success: true,
          message: `No changes detected for program ${programName}.`,
        }
      }
    } catch (error) {
      console.error('There was an error updating the program:', error)
      return {
        type: 'operation',
        success: false,
        message: 'There was an error updating the program.',
      }
    }
  } else if (validatedFields.data.category === 'Event') {
    const {
      programId,
      programName,
      category,
      host,
      level,
      ageGroup,
      enrollmentLimit,
      price,
      description,
      poster,
      posterPublicId,
      posterWidth,
      posterHeight,
      posterSize,
    } = validatedFields.data

    try {
      // (Check values in DB)
      const [categoryArr, levelArr, hostArr] = await Promise.all([
        sql`SELECT id FROM category WHERE name = ${category}`,
        sql`SELECT id FROM level WHERE code = ${level}`,
        sql`SELECT id FROM host WHERE id = ${host}`,
      ])

      if (!categoryArr?.length || !categoryArr?.[0]?.id) {
        throw new Error(`Category "${category}" does not exist`)
      }

      if (!levelArr?.length || !levelArr?.[0]?.id) {
        throw new Error(`Level "${level}" does not exist`)
      }

      if (!hostArr?.length || !hostArr?.[0]?.id) {
        throw new Error(`hostArr "${host}" does not exist`)
      }

      // (Fetch original from Db)
      const originalProgramArr = await sql`
      SELECT 
      p.id, p.name, p.description, p.age_group, p.price, p.enrollment_limit, p.category_id, 
      cat.name as category_name, 
      c.id as course_id, c.total_lessons, 
      c.language_code, ct.teacher_id,
      e.id as event_id, eh.host_id, i.url, 
      i.public_id, i.width, i.height, i.bytes
      FROM program p

      JOIN category cat ON cat.id = p.category_id
      LEFT JOIN course c ON c.program_id = p.id
      LEFT JOIN course_teacher ct ON ct.course_id = c.id
      LEFT JOIN event e ON e.program_id = p.id
      LEFT JOIN event_host eh ON eh.event_id = e.id
      LEFT JOIN image i ON i.target_table = 'program' AND i.target_id = p.id AND i.type = 'poster'
      
      WHERE p.id = ${programId}
    `

      if (!originalProgramArr?.length) {
        throw new Error(`Program ${programId} does not exist`)
      }

      const originalProgram = originalProgramArr[0]

      const updates = []

      // (if values in program table change)
      if (
        originalProgram.name !== programName ||
        originalProgram.description !== description ||
        originalProgram.age_group !== ageGroup ||
        originalProgram.price !== price ||
        originalProgram.enrollment_limit !== enrollmentLimit ||
        originalProgram.level_id !== levelArr[0].id ||
        originalProgram.category_id !== categoryArr[0].id
      ) {
        updates.push(sql`
        UPDATE program 
        SET name = ${programName},
            description = ${description},
            age_group = ${ageGroup},
            price = ${price},
            enrollment_limit = ${enrollmentLimit},
            level_id = ${levelArr[0].id},
            category_id = ${categoryArr[0].id}
        WHERE id = ${programId}
      `)
      }

      // (if category switches)
      let isCategorySwitched = false
      if (originalProgram.category_name !== category) {

        isCategorySwitched = true

        const eventId = uuidv4()

        // (Remove original course & original course_teacher)
        updates.push(
          sql`DELETE FROM course_teacher WHERE course_id = ${originalProgram.course_id}`,
        )
        updates.push(sql`DELETE FROM course WHERE program_id = ${programId}`)

        // (Create new event & event_host)
        updates.push(sql`
          INSERT INTO event (id, program_id)
          VALUES (${eventId}, ${programId})
        `)

        updates.push(sql`
          INSERT INTO event_host (event_id, host_id)
          VALUES (${eventId}, ${host})
        `)
      }

      // (if values in event table change)
      if (originalProgram.host_id !== host && isCategorySwitched === false) {
        updates.push(
          sql`DELETE FROM event_host WHERE event_id = ${originalProgram.event_id}`,
        )

        updates.push(sql`
            INSERT INTO event_host (event_id, host_id)
            VALUES (${originalProgram.event_id}, ${host})
          `)
      }

      // (if image changes)
      if (
        originalProgram.url !== poster ||
        originalProgram.public_id !== posterPublicId ||
        originalProgram.width !== Number(posterWidth) ||
        originalProgram.height !== Number(posterHeight) ||
        originalProgram.bytes !== Number(posterSize)
      ) {
        updates.push(sql`
        UPDATE image
        SET url = ${poster},
            public_id = ${posterPublicId},
            width = ${posterWidth},
            height = ${posterHeight},
            bytes = ${posterSize}
        WHERE target_table = 'program' AND target_id = ${programId} AND type = 'poster'
      `)
      }

      if (updates.length > 0) {
        await sql.transaction(updates)

        revalidateTag('fetchPrograms')
 
        return {
          type: 'operation',
          success: true,
          message: `Program ${programName} updated successfully.`,
        }
      } else {
        return {
          type: 'operation',
          success: true,
          message: `No changes detected for program ${programName}.`,
        }
      }
    } catch (error) {
      console.error('There was an error updating the program:', error)
      return {
        type: 'operation',
        success: false,
        message: 'There was an error updating the program.',
      }
    }
  } else {
    return {
      type: 'operation',
      success: false,
      message: 'Unknown category. Failed to edit program.',
    }
  }
}

// (For now, only admin can. If one day we let user do this, we need to check if it's admin or if user is the image's owner.)
// @route /dashboard/new-program, /dashboard/programs/[id]/edit
// @access Private
// @role Admin Only
export async function deleteImageInCloudinary(publicId: string) {
  const session = await auth()
  if (!session || session?.user?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  if (!publicId)
    return { success: false, error: 'Failed to delete image, no image ID.' }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    })
    return { success: true, result }
  } catch (error) {
    console.error('Cloudinary deletion error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

// @desc Delete a program from admin dashboard
// @route /dashboard/programs
// @access Private
// @role Admin Only
export async function deleteAdminProgram(id: string) {
  const session = await auth()
  if (!session || session?.user?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  try {
    // Get images from DB to delete them from Cloudinary later
    const images = await sql`
      SELECT public_id 
      FROM image 
      WHERE target_table = 'program' AND target_id = ${id};
      `

    // Delete the program with its associated data
    await sql.transaction([
      sql`
          DELETE FROM student_course
          WHERE course_id IN (
            SELECT id FROM course WHERE program_id = ${id}
          );
        `,
      sql`
          DELETE FROM course_teacher
          WHERE course_id IN (
            SELECT id FROM course WHERE program_id = ${id}
          );
        `,
      sql`
          DELETE FROM student_event
          WHERE event_id IN (
            SELECT id FROM event WHERE program_id = ${id}
          );
        `,
      sql`
          DELETE FROM event_host
          WHERE event_id IN (
            SELECT id FROM event WHERE program_id = ${id}
          );
        `,
      sql`
          DELETE FROM image
          WHERE target_table = 'program' AND target_id = ${id};
        `,
      sql`
          DELETE FROM event WHERE program_id = ${id};
        `,
      sql`
          DELETE FROM course WHERE program_id = ${id};
        `,
      sql`
          DELETE FROM cart_item WHERE program_id = ${id};
        `,
      sql`
          DELETE FROM program WHERE id = ${id};
        `,
    ])

    // Delete associated images from Cloudinary
    for (const { public_id } of images) {
      const res = await deleteImageInCloudinary(public_id)
    }

    revalidateTag('fetchPrograms')
   
    return { success: true, message: `Program ${id} deleted.` }
  } catch (error) {
    console.error(
      `Database Error: Failed to Delete program ${id}. Error:`,
      error,
    )
    return {
      success: false,
      message: `Database Error: Failed to delete program.`,
    }
  }
}

// @desc Delete many programs from admin dashboard
// @route /dashboard/programs
// @access Private
// @role Admin Only
export async function deleteAdminPrograms(ids: string[]) {
  const session = await auth()
  if (!session || session?.user?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  try {
    if (!ids.length) {
      return { success: false, message: 'No program IDs provided.' }
    }

    // Get images from DB to delete them from Cloudinary later
    const images = await sql`
      SELECT public_id 
      FROM image 
      WHERE target_table = 'program' AND target_id = ANY(${ids});
    `

    // Delete all programs related records
    await sql.transaction([
      sql`
        DELETE FROM student_course
        WHERE course_id IN (
          SELECT id FROM course WHERE program_id = ANY(${ids})
        );
      `,
      sql`
        DELETE FROM course_teacher
        WHERE course_id IN (
          SELECT id FROM course WHERE program_id = ANY(${ids})
        );
      `,
      sql`
        DELETE FROM student_event
        WHERE event_id IN (
          SELECT id FROM event WHERE program_id = ANY(${ids})
        );
      `,
      sql`
        DELETE FROM event_host
        WHERE event_id IN (
          SELECT id FROM event WHERE program_id = ANY(${ids})
        );
      `,
      sql`
        DELETE FROM image
        WHERE target_table = 'program' AND target_id = ANY(${ids});
      `,
      sql`
        DELETE FROM event WHERE program_id = ANY(${ids});
      `,
      sql`
        DELETE FROM course WHERE program_id = ANY(${ids});
      `,
      sql`
      DELETE FROM cart_item WHERE program_id = ANY(${ids});
      `,
      sql`
        DELETE FROM program WHERE id = ANY(${ids});
      `,
    ])

    // Delete associated images from Cloudinary
    for (const { public_id } of images) {
      const res = await deleteImageInCloudinary(public_id)
    }

    revalidateTag('fetchPrograms')
   
    return { success: true, message: `${ids.length} programs deleted.` }
  } catch (error) {
    console.error('Database Error: Failed to delete programs. Error:', error)
    return {
      success: false,
      message: `Database Error: Failed to delete programs.`,
    }
  }
}

// @desc Update a user's is_active column in DB
// @route /dashboard/users
// @access Private
// @role Admin Only
export async function updateUserActiveStatus(
  userId: string,
  val: boolean,
): Promise<{
  success: boolean
  message: string
}> {
  const session = await auth()
  if (!session || session?.user?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  if (!userId) {
    return { success: false, message: 'No user ID provided.' }
  }

  if (typeof val !== 'boolean') {
    return {
      success: false,
      message: 'Invalid value: must be a boolean value.',
    }
  }

  try {
    await sql`
        UPDATE "user" 
        SET is_active = ${val}
        WHERE id = ${userId}
      `

    revalidatePath('/dashboard/users')

    return {
      success: true,
      message: `User active status updated.`,
    }
  } catch (error) {
    console.error(
      `Database Error: Failed to update user's active status. Error:`,
      error,
    )
    return {
      success: false,
      message: `Database Error: Failed to update user's active status.`,
    }
  }
}

// @route /program/[id]
// @access Private
// @role Student Only
export async function addToSignedInCart(
  programId: string,
  quantity: number = 1,
) {
  const session = await auth()
  if (!session?.user?.id || session?.user?.role !== 'student') {
    return {
      success: false,
      message: `Please sign in to add program to your cart.`,
    }
  }

  const userId = session.user.id

  if (!programId) {
    return { success: false, message: `No program ID provided.` }
  }

  try {
    // Check if program exists
    const program = await sql`
      SELECT
      EXISTS(
        SELECT p.id
        FROM program p
        WHERE p.id = ${programId}
      );
    `
    if (!program[0]?.exists) {
      return {
        success: false,
        cause: 'not_found',
        message: `Program cannot be found.`,
      }
    }

    // If the program's category is not Event and already exists in cart, don't add it again.
    const res = await sql`
      SELECT
      EXISTS(
        SELECT p.id
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.id
        JOIN program p ON p.id = ci.program_id
        JOIN category cat ON cat.id = p.category_id
        WHERE c.user_id = ${userId} AND p.id = ${programId} AND cat.name != 'Event'
      );
    `
    if (res[0]?.exists) {
      return {
        success: false,
        cause: 'program_only_allows_one_registration_per_person',
        message: `Program is already in the cart : )`,
      }
    }

    // Add to cart
    const existingCart = await sql`
      SELECT id FROM cart
      WHERE user_id = ${userId};
    `

    const existingCartId = existingCart?.[0]?.id

    // If cart already exists
    if (existingCartId) {
      await sql`
        INSERT INTO cart_item (cart_id, program_id, quantity)
        VALUES (${existingCartId}, ${programId}, ${quantity})
        ON CONFLICT (cart_id, program_id)
        DO UPDATE SET
          quantity = cart_item.quantity + EXCLUDED.quantity;
      `
      // If cart doesn't exists yet
    } else {
      await sql`
        WITH new_cart AS (
          INSERT INTO cart (user_id)
          VALUES (${userId})
          RETURNING id
        )
        
        INSERT INTO cart_item (cart_id, program_id, quantity)
        SELECT id, ${programId}, ${quantity}
        
        FROM new_cart
        
        ON CONFLICT (cart_id, program_id)
        DO UPDATE SET
          quantity = cart_item.quantity + EXCLUDED.quantity;
       `
    }

    return { success: true, message: `Program added in cart.` }
  } catch (error) {
    console.error(
      `Database Error: Failed to add program in cart. Error:`,
      error,
    )
    return {
      success: false,
      message: `Database Error: Failed to add program in cart.`,
    }
  }
}

// @route In cart popup
// @access Private
// @role Student Only
export async function updateSignedInCartQuantity(
  programId: string,
  quantity: number,
) {
  const session = await auth()
  if (!session?.user?.id || session?.user?.role !== 'student') {
    return { success: false, message: `Please sign in to update cart.` }
  }

  const userId = session.user.id

  if (!programId) {
    return { success: false, message: `No program ID provided.` }
  }

  if (
    !quantity ||
    !Number.isFinite(quantity) ||
    quantity < 1 ||
    !Number.isInteger(quantity)
  ) {
    return { success: false, message: `No valid quantity provided.` }
  }

  try {
    // Check program exists
    const program = await sql`
      SELECT 1 FROM program WHERE id = ${programId};
    `
    if (!program?.length) {
      return { success: false, message: `Program not found.` }
    }

    // Update quantity & Check program exists in cart
    const updatedCart = await sql`
      UPDATE cart_item ci
      SET quantity = ${quantity}
      FROM cart c
      WHERE ci.cart_id = c.id
        AND c.user_id = ${userId}
        AND ci.program_id = ${programId}
      RETURNING c.user_id, ci.program_id, ci.quantity;
    `
    if (!updatedCart?.length) {
      return { success: false, message: `Program does not exist in cart.` }
    }

    return { success: true, message: `Quantity updated in cart.` }
  } catch (error) {
    console.error(
      `Database Error: Failed to update user's quantity in cart. Error:`,
      error,
    )
    return {
      success: false,
      message: `Database Error: Failed to update user's quantity in cart.`,
    }
  }
}

// @route In cart popup
// @access Private
// @role Student Only
export async function removeFromSignedInCart(programId: string) {
  const session = await auth()
  if (!session?.user?.id || session?.user?.role !== 'student') {
    return { success: false, message: `Please sign in to update cart.` }
  }

  const userId = session.user.id

  if (!programId) {
    return { success: false, message: `No program ID provided.` }
  }

  try {
    await sql`
      DELETE FROM cart_item ci
      USING cart c
      WHERE ci.cart_id = c.id
        AND c.user_id = ${userId}
        AND ci.program_id = ${programId}
      RETURNING c.user_id, ci.program_id, ci.quantity;
    `

    return { success: true, message: `Program removed from cart.` }
  } catch (error) {
    console.error(
      `Database Error: Failed to removed program from cart. Error:`,
      error,
    )
    return {
      success: false,
      message: `Database Error: Failed to removed program from cart.`,
    }
  }
}

async function refreshGuestCartCookie(guestId: string) {
  const cookieStore = await cookies()

  cookieStore.set({
    name: GUEST_CART_COOKIE_NAME,
    value: guestId,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: GUEST_CART_COOKIE_MAX_AGE,
  })
}

// @route /program/[id]
export async function addToGuestCart(programId: string, quantity: number = 1) {
  const cookieStore = await cookies()

  const guestCartCookie = cookieStore.get(GUEST_CART_COOKIE_NAME)

  let guestId = guestCartCookie?.value

  // If no guest cart cookie, set it.
  if (!guestCartCookie || !guestId) {
    const newGuestId = crypto.randomUUID()

    cookieStore.set({
      name: GUEST_CART_COOKIE_NAME,
      value: newGuestId,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: GUEST_CART_COOKIE_MAX_AGE,
    })

    guestId = newGuestId
    // If guest cart cookie already exists, refresh it.
  } else {
    await refreshGuestCartCookie(guestId)
  }

  if (!programId) {
    return { success: false, message: `No program ID provided.` }
  }

  try {
    // Check if program exists
    const program = await sql`
      SELECT
      EXISTS(
        SELECT p.id
        FROM program p
        WHERE p.id = ${programId}
      );
    `
    if (!program[0]?.exists) {
      return {
        success: false,
        cause: 'not_found',
        message: `Program cannot be found.`,
      }
    }

    // If the program's category is not Event and already exists in cart, don't add it again.
    const res = await sql`
      SELECT
      EXISTS(
        SELECT p.id
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.id
        JOIN program p ON p.id = ci.program_id
        JOIN category cat ON cat.id = p.category_id
        WHERE c.guest_id = ${guestId} AND p.id = ${programId} AND cat.name != 'Event'
      );
    `
    if (res[0]?.exists) {
      return {
        success: false,
        cause: 'program_only_allows_one_registration_per_person',
        message: `Program is already in the cart : )`,
      }
    }

    // Add to cart
    // Fetch existing cart
    const existingCart = await sql`
      SELECT id FROM cart
      WHERE guest_id = ${guestId};
    `

    const existingCartId = existingCart?.[0]?.id

    // If cart already exists
    if (existingCartId) {
      await sql`
        INSERT INTO cart_item (cart_id, program_id, quantity)
        VALUES (${existingCartId}, ${programId}, ${quantity})
        ON CONFLICT (cart_id, program_id)
        DO UPDATE SET
          quantity = cart_item.quantity + EXCLUDED.quantity;
      `
      // If cart doesn't exists yet
    } else {
      await sql`
        WITH new_cart AS (
          INSERT INTO cart (guest_id)
          VALUES (${guestId})
          RETURNING id
        )
        
        INSERT INTO cart_item (cart_id, program_id, quantity)
        SELECT id, ${programId}, ${quantity}
        
        FROM new_cart
        
        ON CONFLICT (cart_id, program_id)
        DO UPDATE SET
          quantity = cart_item.quantity + EXCLUDED.quantity;
       `
    }

    return { success: true, message: `Program added in guest cart.` }
  } catch (error) {
    console.error(
      `Database Error: Failed to add program in guest cart. Error:`,
      error,
    )
    return {
      success: false,
      message: `Database Error: Failed to add program in guest cart.`,
    }
  }
}

// @route In cart popup
export async function updateGuestCartQuantity(
  programId: string,
  quantity: number,
) {
  const cookieStore = await cookies()

  const guestCartCookie = cookieStore.get(GUEST_CART_COOKIE_NAME)

  const guestId = guestCartCookie?.value

  // If no guest cart cookie, return err msg.
  if (!guestCartCookie || !guestId) {
    return { success: false, message: `No guest ID provided.` }
  }

  // If guest cart cookie already exists, refresh it.
  await refreshGuestCartCookie(guestId)

  if (!programId) {
    return { success: false, message: `No program ID provided.` }
  }

  if (
    !quantity ||
    !Number.isFinite(quantity) ||
    quantity < 1 ||
    !Number.isInteger(quantity)
  ) {
    return { success: false, message: `No valid quantity provided.` }
  }

  try {
    // Check program exists
    const program = await sql`
      SELECT 1 FROM program WHERE id = ${programId};
    `
    if (!program?.length) {
      return { success: false, message: `Program not found.` }
    }

    // Update quantity & Check program exists in cart
    const updatedCart = await sql`
      UPDATE cart_item ci
      SET quantity = ${quantity}
      FROM cart c
      WHERE ci.cart_id = c.id
        AND c.guest_id = ${guestId}
        AND ci.program_id = ${programId}
      RETURNING c.guest_id, ci.program_id, ci.quantity;
    `
    if (!updatedCart?.length) {
      return { success: false, message: `Program does not exist in cart.` }
    }

    return { success: true, message: `Quantity updated in guest cart.` }
  } catch (error) {
    console.error(
      `Database Error: Failed to update user's quantity in guest cart. Error:`,
      error,
    )
    return {
      success: false,
      message: `Database Error: Failed to update user's quantity in guest cart.`,
    }
  }
}

// @route In cart popup
export async function removeFromGuestCart(programId: string) {
  const cookieStore = await cookies()

  const guestCartCookie = cookieStore.get(GUEST_CART_COOKIE_NAME)

  const guestId = guestCartCookie?.value

  // If no guest cart cookie, return err msg.
  if (!guestCartCookie || !guestId) {
    return { success: false, message: `No guest ID provided.` }
  }

  // If guest cart cookie already exists, refresh it.
  await refreshGuestCartCookie(guestId)

  if (!programId) {
    return { success: false, message: `No program ID provided.` }
  }

  try {
    await sql`
      DELETE FROM cart_item ci
      USING cart c
      WHERE ci.cart_id = c.id
        AND c.guest_id = ${guestId}
        AND ci.program_id = ${programId};
    `

    return { success: true, message: `Program removed from guest cart.` }
  } catch (error) {
    console.error(
      `Database Error: Failed to removed program from guest cart. Error:`,
      error,
    )
    return {
      success: false,
      message: `Database Error: Failed to removed program from guest cart.`,
    }
  }
}

async function checkProgramsAvailability(
  programIds: string[],
  quantities: number[],
) {
  const res = await sql`
    SELECT 
      c.program_id,
      c.quantity,
      p.enrollment_limit,
      COALESCE(SUM(oi.quantity), 0) AS enrolled,
      (p.enrollment_limit - COALESCE(SUM(oi.quantity), 0)) AS available
    FROM unnest(${programIds}::uuid[], ${quantities}::int[]) AS c(program_id, quantity)
    JOIN program p ON p.id = c.program_id
    LEFT JOIN order_item oi ON oi.program_id = p.id
    LEFT JOIN "order" o ON o.id = oi.order_id AND o.status = 'Paid'
    GROUP BY c.program_id, c.quantity, p.enrollment_limit
    ORDER BY array_position(${programIds}::uuid[], c.program_id);
  `

  const programsNotAvailable: {
    program_id: string
    messageOnItem: string
  }[] = res
    ?.filter((r) => r.quantity > Number(r.available))
    .map((r) => ({
      program_id: r.program_id,
      messageOnItem: `Available Seats: ${r.available}.`,
    }))

  return {
    isAllAvailable: programsNotAvailable.length === 0,
    programsNotAvailable,
  }
}

// @route In cart popup
// @access Private
// @role Student Only
export async function checkoutSignedInCart(): CheckoutCartReturnType {
  const session = await auth()
  if (!session?.user?.id || session?.user?.role !== 'student') {
    return {
      success: false,
      message: `Please sign in to checkout your cart.`,
    }
  }

  const userId = session.user.id

  try {
    // Fetch existing cart
    const query = `
      WITH user_cart AS (
        SELECT 
          ci.program_id, 
          ci.quantity,
          ci.created_at
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.id
        WHERE c.user_id = $1
      ),
      missing AS (
        SELECT 
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'program_id', program_id
              )
              ORDER BY created_at
            ), 
            '[]'::jsonb
          ) AS missing_programs
        FROM (
          SELECT uc.program_id, uc.created_at
          FROM user_cart uc
          LEFT JOIN program p ON p.id = uc.program_id
          WHERE p.id IS NULL
        ) AS missing_items
      )
      SELECT
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'program_id', p.id,
              'quantity', uc.quantity
            )
            ORDER BY uc.created_at
          ),
          '[]'::jsonb
        ) AS cart_items,
        (SELECT missing_programs FROM missing) AS programs_not_existing
      FROM user_cart uc
      JOIN program p ON p.id = uc.program_id;
    `

    const res = await sql.query(query, [userId])
    const result = res?.[0]
    if (!res?.length || !result?.cart_items?.length) {
      return {
        success: false,
        message: `Cart is empty.`,
      }
    }

    // Check if programs exist
    if (result?.programs_not_existing?.length > 0) {
      const cartItemsWithIssue = result.programs_not_existing.map(
        (id: string) => ({
          program_id: id,
          messageOnItem: `Program cannot be found.`,
        }),
      )
      return {
        success: false,
        cause: 'program_not_found',
        message: `One of more programs cannot be found.`,
        cartItemsWithIssue,
      }
    }

    // Check programs seats availability
    const programIds = result.cart_items.map(
      (c: CartItemCheckoutType) => c.program_id,
    )
    const quantities = result.cart_items.map(
      (c: CartItemCheckoutType) => c.quantity,
    )

    const res2 = await checkProgramsAvailability(programIds, quantities)
    if (!res2.isAllAvailable) {
      return {
        success: false,
        cause: 'program_not_available',
        message: `One or more programs are not available.`,
        cartItemsWithIssue: res2.programsNotAvailable,
      }
    }

    return {
      success: true,
      message: 'Success. Redirect to checkout page.',
    }
  } catch (error) {
    console.error(`Database Error: Failed to checkout. Error:`, error)
    return {
      success: false,
      message: `Database Error: Failed to checkout.`,
    }
  }
}

// @route In cart popup
export async function checkoutGuestCart(): CheckoutCartReturnType {
  const cookieStore = await cookies()

  const guestCartCookie = cookieStore.get(GUEST_CART_COOKIE_NAME)

  const guestId = guestCartCookie?.value

  // If no guest cart cookie, return err msg.
  if (!guestCartCookie || !guestId) {
    return { success: false, message: `No guest ID provided.` }
  }

  // If guest cart cookie already exists, refresh it.
  await refreshGuestCartCookie(guestId)

  try {
    // Fetch existing cart
    const query = `
      WITH guest_cart AS (
        SELECT 
          ci.program_id, 
          ci.quantity,
          ci.created_at
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.id
        WHERE c.guest_id = $1
      ),
      missing AS (
        SELECT 
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'program_id', program_id
              )
              ORDER BY created_at
            ), 
            '[]'::jsonb
          ) AS missing_programs
        FROM (
          SELECT gc.program_id, gc.created_at
          FROM guest_cart gc
          LEFT JOIN program p ON p.id = gc.program_id
          WHERE p.id IS NULL
        ) AS missing_items
      )
      SELECT
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'program_id', p.id,
              'quantity', gc.quantity
            )
            ORDER BY gc.created_at
          ),
          '[]'::jsonb
        ) AS cart_items,
        (SELECT missing_programs FROM missing) AS programs_not_existing
      FROM guest_cart gc
      JOIN program p ON p.id = gc.program_id;
    `

    const res = await sql.query(query, [guestId])
    const result = res?.[0]
    if (!res?.length || !result?.cart_items?.length) {
      return {
        success: false,
        message: `Cart is empty.`,
      }
    }

    // Check if programs exist
    if (result?.programs_not_existing?.length > 0) {
      const cartItemsWithIssue = result.programs_not_existing.map(
        (id: string) => ({
          program_id: id,
          messageOnItem: `Program cannot be found.`,
        }),
      )
      return {
        success: false,
        cause: 'program_not_found',
        message: `One of more programs cannot be found.`,
        cartItemsWithIssue,
      }
    }

    // Check programs seats availability
    const programIds = result.cart_items.map(
      (c: CartItemCheckoutType) => c.program_id,
    )
    const quantities = result.cart_items.map(
      (c: CartItemCheckoutType) => c.quantity,
    )

    const res2 = await checkProgramsAvailability(programIds, quantities)
    if (!res2.isAllAvailable) {
      return {
        success: false,
        cause: 'program_not_available',
        message: `One or more programs are not available.`,
        cartItemsWithIssue: res2.programsNotAvailable,
      }
    }

    return {
      success: true,
      message: 'Success. Redirect to checkout page.',
    }
  } catch (error) {
    console.error(`Database Error: Failed to checkout. Error:`, error)
    return {
      success: false,
      message: `Database Error: Failed to checkout.`,
    }
  }
}

// @route /checkout
// @access Private
// @role Student Only
export async function createPaymentIntent_signedInUser() {
  const session = await auth()

  if (!session?.user?.id || session?.user?.role !== 'student') {
    throw new Error('Unauthorized')
  }

  const cart = await fetchSignedInCart()

  if (!cart?.items?.length) {
    throw new Error('Cart is empty')
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(cart.total_amount) * 100,
    currency: 'USD',
    automatic_payment_methods: { enabled: true },
  })

  const clientSecret = paymentIntent?.client_secret
  const paymentIntentId = paymentIntent?.id

  if (!clientSecret || !paymentIntentId) {
    throw new Error('Failed to create Stripe Payment Intent.')
  }

  return {
    clientSecret,
    paymentIntentId,
  }
}

// @route /checkout
// @access Public
export async function createPaymentIntent_guest() {
  const cookieStore = await cookies()

  const guestCartCookie = cookieStore.get(GUEST_CART_COOKIE_NAME)

  const guestId = guestCartCookie?.value

  if (!guestCartCookie || !guestId) {
    throw new Error('No guest ID provided.')
  }

  const cart = await fetchGuestCart()

  if (!cart?.items?.length) {
    throw new Error('Cart is empty')
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(cart.total_amount) * 100,
    currency: 'USD',
    automatic_payment_methods: { enabled: true },
  })

  const clientSecret = paymentIntent?.client_secret
  const paymentIntentId = paymentIntent?.id

  if (!clientSecret || !paymentIntentId) {
    throw new Error('Failed to create Stripe Payment Intent.')
  }

  return {
    clientSecret,
    paymentIntentId,
  }
}

// @route /checkout
// @access Private
// @role Student Only
export async function validateSignedInOrder(
  paymentIntentId: string,
): ValidateOrderReturnType {
  if (!paymentIntentId) {
    return {
      success: false,
      message: 'No Stripe Payment Intent ID provided.',
    }
  }

  const session = await auth()
  if (!session?.user?.id || session?.user?.role !== 'student') {
    return {
      success: false,
      message: `Please sign in to checkout your cart.`,
    }
  }

  const userId = session.user.id

  try {
    // Fetch existing cart
    const query = `
      WITH user_cart AS (
        SELECT 
          ci.cart_id,
          ci.program_id, 
          ci.quantity,
          ci.created_at
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.id
        WHERE c.user_id = $1
      ),
      missing AS (
        SELECT 
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'program_id', program_id
              )
              ORDER BY created_at
            ), 
            '[]'::jsonb
          ) AS missing_programs
        FROM (
          SELECT uc.program_id, uc.created_at
          FROM user_cart uc
          LEFT JOIN program p ON p.id = uc.program_id
          WHERE p.id IS NULL
        ) AS missing_items
      ),
      totals AS (
        SELECT
          uc.cart_id,
          SUM(p.price * uc.quantity) AS total_amount
        FROM user_cart uc
        JOIN program p ON p.id = uc.program_id
        GROUP BY uc.cart_id
      )
      SELECT
        uc.cart_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'program_id', p.id,
              'quantity', uc.quantity
            )
            ORDER BY uc.created_at
          ),
          '[]'::jsonb
        ) AS cart_items,
        (SELECT missing_programs FROM missing) AS programs_not_existing,
        COALESCE(t.total_amount, 0) AS total_amount
      FROM user_cart uc
      JOIN program p ON p.id = uc.program_id
      LEFT JOIN totals t ON t.cart_id = uc.cart_id
      GROUP BY uc.cart_id, t.total_amount;
    `

    const res = await sql.query(query, [userId])
    const result = res?.[0]
    if (!res?.length || !result?.cart_items?.length || !result?.total_amount) {
      return {
        success: false,
        message: `Cart is empty.`,
      }
    }

    // Check if programs exist
    if (result?.programs_not_existing?.length > 0) {
      const cartItemsWithIssue = result.programs_not_existing.map(
        (id: string) => ({
          program_id: id,
          messageOnItem: `Program cannot be found.`,
        }),
      )
      return {
        success: false,
        cause: 'program_not_found',
        message: `One of more programs cannot be found.`,
        cartItemsWithIssue,
      }
    }

    // Check programs seats availability
    const programIds = result.cart_items.map(
      (c: CartItemCheckoutType) => c.program_id,
    )
    const quantities = result.cart_items.map(
      (c: CartItemCheckoutType) => c.quantity,
    )

    const res2 = await checkProgramsAvailability(programIds, quantities)
    if (!res2.isAllAvailable) {
      return {
        success: false,
        cause: 'program_not_available',
        message: `One or more programs are not available.`,
        cartItemsWithIssue: res2.programsNotAvailable,
      }
    }

    // Add client's email to Stripe Payment Intent
    const updated = await stripe.paymentIntents.update(paymentIntentId, {
      amount: Number(result.total_amount) * 100,
      receipt_email: session.user.email,
      metadata: { cart_id: result.cart_id, user_id: userId },
    })

    return {
      success: true,
      message: 'Success. Redirect to checkout page.',
    }
  } catch (error) {
    console.error(`Database Error: Failed to checkout. Error:`, error)
    return {
      success: false,
      message: `Database Error: Failed to checkout.`,
    }
  }
}

// @route /checkout
export async function validateGuestOrder(
  paymentIntentId: string,
  name: string,
  email: string,
): ValidateOrderReturnType {
  // Validate paymentIntentId
  if (!paymentIntentId) {
    return {
      success: false,
      message: 'No Stripe Payment Intent ID provided.',
    }
  }

  // Validate email
  const validatedFields = guestOrderSchema.safeParse({
    email,
    name,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      cause: 'invalid_user_input',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please submit correct input values.',
    }
  }

  // Validate guest cart cookie
  const cookieStore = await cookies()

  const guestCartCookie = cookieStore.get(GUEST_CART_COOKIE_NAME)

  const guestId = guestCartCookie?.value

  // (If no guest cart cookie, return err msg)
  if (!guestCartCookie || !guestId) {
    return { success: false, message: `No guest ID provided.` }
  }

  // (If guest cart cookie already exists, refresh it)
  await refreshGuestCartCookie(guestId)

  try {
    // Fetch existing cart
    const query = `
      WITH guest_cart AS (
        SELECT 
          ci.cart_id,
          ci.program_id, 
          ci.quantity,
          ci.created_at
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.id
        WHERE c.guest_id = $1
      ),
      missing AS (
        SELECT 
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'program_id', program_id
              )
              ORDER BY created_at
            ), 
            '[]'::jsonb
          ) AS missing_programs
        FROM (
          SELECT gc.program_id, gc.created_at
          FROM guest_cart gc
          LEFT JOIN program p ON p.id = gc.program_id
          WHERE p.id IS NULL
        ) AS missing_items
      ),
      totals AS (
        SELECT
          gc.cart_id,
          SUM(p.price * gc.quantity) AS total_amount
        FROM guest_cart gc
        JOIN program p ON p.id = gc.program_id
        GROUP BY gc.cart_id
      )
      SELECT
        gc.cart_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'program_id', p.id,
              'quantity', gc.quantity
            )
            ORDER BY gc.created_at
          ),
          '[]'::jsonb
        ) AS cart_items,
        (SELECT missing_programs FROM missing) AS programs_not_existing,
        COALESCE(t.total_amount, 0) AS total_amount
      FROM guest_cart gc
      JOIN program p ON p.id = gc.program_id
      LEFT JOIN totals t ON t.cart_id = gc.cart_id
      GROUP BY gc.cart_id, t.total_amount;
    `

    const res = await sql.query(query, [guestId])
    const result = res?.[0]
    if (!res?.length || !result?.cart_items?.length || !result?.total_amount) {
      return {
        success: false,
        message: `Cart is empty.`,
      }
    }

    // Check if programs exist
    if (result?.programs_not_existing?.length > 0) {
      const cartItemsWithIssue = result.programs_not_existing.map(
        (id: string) => ({
          program_id: id,
          messageOnItem: `Program cannot be found.`,
        }),
      )
      return {
        success: false,
        cause: 'program_not_found',
        message: `One of more programs cannot be found.`,
        cartItemsWithIssue,
      }
    }

    // Check programs seats availability
    const programIds = result.cart_items.map(
      (c: CartItemCheckoutType) => c.program_id,
    )
    const quantities = result.cart_items.map(
      (c: CartItemCheckoutType) => c.quantity,
    )

    const res2 = await checkProgramsAvailability(programIds, quantities)
    if (!res2.isAllAvailable) {
      return {
        success: false,
        cause: 'program_not_available',
        message: `One or more programs are not available.`,
        cartItemsWithIssue: res2.programsNotAvailable,
      }
    }

    // Add client's email to Stripe Payment Intent
    const updated = await stripe.paymentIntents.update(paymentIntentId, {
      amount: Number(result.total_amount) * 100,
      receipt_email: email,
      metadata: { name, cart_id: result.cart_id, guest_id: guestId },
    })

    return {
      success: true,
      message: 'Success. Redirect to checkout page.',
    }
  } catch (error) {
    console.error(`Database Error: Failed to checkout. Error:`, error)
    return {
      success: false,
      message: `Database Error: Failed to checkout.`,
    }
  }
}
