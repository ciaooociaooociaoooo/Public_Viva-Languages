import { neon } from '@neondatabase/serverless'
import { unstable_cache } from 'next/cache'
import {
  AdminOrdersSortKey,
  CartResponseType,
  CreatedProgramsByAgeGroupsType,
  GUEST_CART_COOKIE_NAME,
  Latest6ProgramsType,
  MonthlyRevenueAndMOMGrowthType,
  MyProgramsSortKey,
  RepurchaseRateType,
  SoldCoursesByLanguagesType,
  SoldCoursesByLevelsType,
  SoldProgramsByAgeGroupsType,
  SortKey,
  SortOrder,
  UsersSortKey,
} from './definitions'
import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const sql = neon(process.env.DATABASE_URL!)

// Authentication & Authorization wrapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function authWrapper_WithAdminRole<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const session = await auth()

    if (!session || session?.user?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    return fn(...args)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function authWrapper_WithStudentRole<TArgs extends any[], TReturn>(
  fn: (userId: string, ...args: TArgs) => Promise<TReturn>,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const session = await auth()

    if (!session?.user?.id || session?.user?.role !== 'student') {
      throw new Error('Unauthorized')
    }

    return fn(session.user.id, ...args)
  }
}
// End Authentication & Authorization wrapper

//  Get guest cart cookie wrapper
function getGuestCartCookieWrapper<TReturn>(
  fn: (guestCartCookie: RequestCookie | undefined) => Promise<TReturn>,
) {
  return async (): Promise<TReturn> => {
    const cookieStore = await cookies()

    const guestCartCookie = cookieStore.get(GUEST_CART_COOKIE_NAME)

    return fn(guestCartCookie)
  }
}
// End Get guest cart cookie wrapper

// @route /dashboard/new-program, /dashboard/programs/[id]/edit
// @access Private
// @role Admin Only
// @cached true
export const fetchCategories = authWrapper_WithAdminRole(
  unstable_cache(async () => {
    try {
      const categories = await sql`SELECT *
    FROM category
  `
      return categories
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch categories.')
    }
  }),
)

// @route /dashboard/new-program, /dashboard/programs/[id]/edit
// @access Private
// @role Admin Only
// @cached true
export const fetchLevels = authWrapper_WithAdminRole(
  unstable_cache(async () => {
    try {
      const levels = await sql`SELECT *
    FROM level ORDER BY order_index
  `
      return levels
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch levels.')
    }
  }),
)

// @route /dashboard/new-program, /dashboard/programs/[id]/edit
// @access Private
// @role Admin Only
// @cached true
export const fetchLanguages = authWrapper_WithAdminRole(
  unstable_cache(async () => {
    try {
      const languages = await sql`SELECT *
    FROM language
  `
      return languages
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch languages.')
    }
  }),
)

// @route /dashboard/new-program, /dashboard/programs/[id]/edit
// @access Private
// @role Admin Only
// @cached true
export const fetchTeachers = authWrapper_WithAdminRole(
  unstable_cache(async () => {
    try {
      const teachers = await sql`SELECT *
    FROM teacher
  `
      return teachers
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch teachers.')
    }
  }),
)

// @route /dashboard/new-program, /dashboard/programs/[id]/edit
// @access Private
// @role Admin Only
// @cached true
export const fetchHosts = authWrapper_WithAdminRole(
  unstable_cache(async () => {
    try {
      const hosts = await sql`SELECT *
    FROM host
  `
      return hosts
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch hosts.')
    }
  }),
)

// @route /about-us
// @access Public
// @cached false
export const fetchTeachersWithCourses = async () => {
  try {
    const teachers = await sql`
      SELECT jsonb_object_agg(
        t.id,
        jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'bio', t.bio,
          'courses', courses.courses
        )
      ) AS teachers

      FROM teacher t

      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            'program_id', course.program_id,
            'program_name', course.program_name
          )
          ORDER BY
            course.language_name ASC,
            course.age_group_sort,
            course.level_sort,
            course.program_name DESC
        ) AS courses

        FROM (
          SELECT DISTINCT
            p.id AS program_id,
            p.name AS program_name,
            lang.name AS language_name,
            
            CASE p.age_group
              WHEN 'Adults' THEN 1
              WHEN 'All' THEN 1
              WHEN 'Kids' THEN 2
              ELSE 3
            END AS age_group_sort,

            CASE 
              WHEN l.code = 'A1' THEN 1
              WHEN l.code = 'A2' THEN 2
              WHEN l.code = 'B1' THEN 3
              WHEN l.code = 'B2' THEN 4
              WHEN l.code = 'C1' THEN 5
              WHEN l.code = 'C2' THEN 6
              WHEN p.name LIKE '%Advanced%' THEN 7
              ELSE 8
            END AS level_sort
            
          FROM course_teacher ct
          JOIN course cr ON cr.id = ct.course_id
          JOIN program p ON p.id = cr.program_id
          JOIN level l ON p.level_id = l.id
          JOIN language lang ON cr.language_code = lang.code
          WHERE ct.teacher_id = t.id
        ) course
      ) courses ON true;
    `

    if (!teachers || teachers.length === 0 || !teachers[0]?.teachers) {
      throw new Error('Failed to fetch teachers with courses.')
    }

    return teachers[0].teachers
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch teachers with courses.')
  }
}

// @route /about-us
// @access Public
// @cached false
export const fetchHostsWithEvents = async () => {
  try {
    const hosts = await sql`
      SELECT jsonb_object_agg(
        h.id,
        jsonb_build_object(
          'id', h.id,
          'name', h.name,
          'bio', h.bio,
          'events', events.events
        )
      ) AS hosts

      FROM host h

      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            'program_id', event.program_id,
            'program_name', event.program_name
          )
          ORDER BY
            event.age_group_sort,
            event.level_sort,
            event.program_name DESC
        ) AS events

        FROM (
          SELECT DISTINCT
            p.id AS program_id,
            p.name AS program_name,

            CASE p.age_group
              WHEN 'Adults' THEN 1
              WHEN 'All' THEN 1
              WHEN 'Kids' THEN 2
              ELSE 3
            END AS age_group_sort,

            CASE 
              WHEN l.code = 'A1' THEN 1
              WHEN l.code = 'A2' THEN 2
              WHEN l.code = 'B1' THEN 3
              WHEN l.code = 'B2' THEN 4
              WHEN l.code = 'C1' THEN 5
              WHEN l.code = 'C2' THEN 6
              WHEN p.name LIKE '%Advanced%' THEN 7
              ELSE 8
            END AS level_sort

          FROM event_host eh
          JOIN event e ON e.id = eh.event_id
          JOIN program p ON p.id = e.program_id
          JOIN level l ON p.level_id = l.id
          WHERE eh.host_id = h.id
        ) event
      ) events ON true;
    `

    if (!hosts || hosts.length === 0 || !hosts[0]?.hosts) {
      throw new Error('Failed to fetch hosts with events.')
    }

    return hosts[0].hosts
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch hosts with events.')
  }
}

// @route /program/[id], /dashboard/programs/[id]/edit
// @access Public
// @cached false
export const fetchProgramById = async (id: string) => {
  try {
    const query = `
    SELECT
      p.id AS program_id,
      p.name AS program_name,
      p.description,
      p.age_group,
      p.price,
      p.enrollment_limit,
      p.created_at,
      p.updated_at,
      
      c.name AS category_name,
      
      l.code AS level_code,
      l.name AS level_name,
      l.description AS level_description,
      
      cr.id AS course_id,
      cr.total_lessons,
      
      lang.code AS language_code,
      lang.name AS language_name,
      
      e.id AS event_id,
      
      img.id AS image_id,
      img.url AS image_url,
      img.public_id AS image_public_id,
      img.width AS image_width,
      img.height AS image_height,
      img.bytes AS image_size,
      img.type AS image_type,
      
      COALESCE(SUM(oi.quantity), 0) AS enrolled,
      (p.enrollment_limit - COALESCE(SUM(oi.quantity), 0)) AS available,

      json_agg(
        DISTINCT jsonb_build_object(
          'id', t.id,
          'name', t.name
        )
      ) FILTER (WHERE t.id IS NOT NULL) AS teachers,

      json_agg(
        DISTINCT jsonb_build_object(
          'id', h.id,
          'name', h.name,
          'role', eh.role
        )
      ) FILTER (WHERE h.id IS NOT NULL) AS hosts

      FROM program p
      JOIN category c ON p.category_id = c.id
      JOIN level l ON p.level_id = l.id
      LEFT JOIN course cr ON cr.program_id = p.id
      LEFT JOIN language lang ON cr.language_code = lang.code
      LEFT JOIN event e ON e.program_id = p.id
      LEFT JOIN image img ON img.target_id = p.id AND img.target_table = 'program' AND img.type = 'poster'
     
      LEFT JOIN course_teacher ct ON cr.id = ct.course_id
      LEFT JOIN teacher t ON ct.teacher_id = t.id

      LEFT JOIN event_host eh ON e.id = eh.event_id
      LEFT JOIN host h ON eh.host_id = h.id
     
      LEFT JOIN order_item oi ON oi.program_id = p.id
      LEFT JOIN "order" o ON o.id = oi.order_id AND o.status = 'Paid'

      WHERE p.id = $1
        
      GROUP BY
      p.id, c.name, l.code, l.name, l.description, cr.id, cr.total_lessons, lang.code, lang.name, e.id, img.id, img.url;
    `

    const program = await sql.query(query, [id])

    return program
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch program.')
  }
}

// @route /
// @access Public
// @cached true
export const fetchPrograms = unstable_cache(
  async () => {
    try {
      const programs = await sql`
    SELECT
      p.id AS program_id,
      p.name AS program_name,
      p.description,
      p.age_group,
      p.price,
      p.enrollment_limit,
      p.created_at,
      p.updated_at,
      
      c.name AS category_name,
      
      l.code AS level_code,
      l.name AS level_name,
      l.description AS level_description,
      
      cr.id AS course_id,
      cr.total_lessons,
      
      lang.code AS language_code,
      lang.name AS language_name,
      
      e.id AS event_id,
      
      img.id AS image_id,
      img.url AS image_url,
      img.public_id AS image_public_id,
      img.width AS image_width,
      img.height AS image_height,
      img.type AS image_type,
      
      json_agg(
        DISTINCT jsonb_build_object(
          'id', t.id,
          'name', t.name
        )
      ) FILTER (WHERE t.id IS NOT NULL) AS teachers,

      json_agg(
        DISTINCT jsonb_build_object(
          'id', h.id,
          'name', h.name,
          'role', eh.role
        )
      ) FILTER (WHERE h.id IS NOT NULL) AS hosts

      FROM program p
      JOIN category c ON p.category_id = c.id
      JOIN level l ON p.level_id = l.id
      LEFT JOIN course cr ON cr.program_id = p.id
      LEFT JOIN language lang ON cr.language_code = lang.code
      LEFT JOIN event e ON e.program_id = p.id
      LEFT JOIN image img ON img.target_id = p.id AND img.target_table = 'program' AND img.type = 'poster'
     
      LEFT JOIN course_teacher ct ON cr.id = ct.course_id
      LEFT JOIN teacher t ON ct.teacher_id = t.id

      LEFT JOIN event_host eh ON e.id = eh.event_id
      LEFT JOIN host h ON eh.host_id = h.id
     
      GROUP BY
      p.id, c.name, l.code, l.name, l.description, cr.id, cr.total_lessons, lang.code, lang.name, e.id, img.id, img.url
      
      ORDER BY 

        CASE p.age_group
            WHEN 'Adults' THEN 1
            WHEN 'All' THEN 1
            WHEN 'Kids' THEN 2
            ELSE 3
        END,

        CASE c.name
            WHEN 'Course' THEN 1
            WHEN 'Event' THEN 2
            ELSE 3
        END,

        lang.name ASC,

        CASE 
            WHEN l.code = 'A1' THEN 1
            WHEN l.code = 'A2' THEN 2
            WHEN l.code = 'B1' THEN 3
            WHEN l.code = 'B2' THEN 4
            WHEN l.code = 'C1' THEN 5
            WHEN l.code = 'C2' THEN 6
            WHEN p.name LIKE '%Advanced%' THEN 7
            ELSE 8
        END,

        p.name DESC;
    `

      return programs
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch programs.')
    }
  },
  [],
  {
    tags: ['fetchPrograms'],
  },
)

// @route /
// @access Public
// @cached false
export const fetchSixLatestPrograms = async () => {
  try {
    const programs = (await sql`
      SELECT
        id,
        name
      FROM program
      ORDER BY created_at DESC
      LIMIT 6;
    `) as Latest6ProgramsType[]

    return programs
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch latest programs.')
  }
}

// @route /dashboard/programs
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminPrograms = authWrapper_WithAdminRole(
  async (
    argSortBy: SortKey = 'program_name',
    argSortOrder: SortOrder = 'asc',
    argLimit: number,
    argCurrentPage: number,
    argQuery: string,
  ) => {
    const validSortKeys: Record<SortKey, string> = {
      program_name: 'p.name',
      program_id: 'p.id',
      category_name: 'c.name',
      language_name: 'lang.name',
      total_lessons: 'cr.total_lessons',
      level_code: 'l.code',
      age_group: 'p.age_group',
      enrollment_limit: 'p.enrollment_limit',
      price: 'p.price',
      purchase_count: 'purchase_count',
      revenue: 'revenue',
      created_at: 'p.created_at',
      updated_at: 'p.updated_at',
    }

    const sortBy = validSortKeys[argSortBy] || 'p.name'
    const sortOrder = argSortOrder === 'asc' ? 'ASC' : 'DESC'
    const limit = Number(argLimit) || 5
    const currentPage = Number(argCurrentPage) || 1
    const unsafeOffset = (currentPage - 1) * limit
    const offset = Number(unsafeOffset) || 0

    try {
      const query = `
        SELECT
          p.id AS program_id,
          p.name AS program_name,
          p.description,
          p.age_group,
          p.price,
          p.enrollment_limit,
          p.created_at,
          p.updated_at,
          
          c.name AS category_name,
          
          l.code AS level_code,
          l.name AS level_name,
          l.description AS level_description,
          
          cr.id AS course_id,
          cr.total_lessons,
          
          lang.code AS language_code,
          lang.name AS language_name,
          
          e.id AS event_id,
          
          img.id AS image_id,
          img.url AS image_url,
          img.public_id AS image_public_id,
          img.width AS image_width,
          img.height AS image_height,
          img.type AS image_type,
          
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name,
              'email', t.email,
              'bio', t.bio
            )
          ) FILTER (WHERE t.id IS NOT NULL) AS teachers,

          json_agg(
            DISTINCT jsonb_build_object(
              'id', h.id,
              'name', h.name,
              'email', h.email,
              'bio', h.bio,
              'role', eh.role
            )
          ) FILTER (WHERE h.id IS NOT NULL) AS hosts,

          COALESCE((
            SELECT SUM(oi.quantity)
            FROM order_item oi
            JOIN "order" o ON o.id = oi.order_id
            WHERE oi.program_id = p.id
              AND o.status = 'Paid'
          ), 0) AS purchase_count,

           COALESCE((
            SELECT SUM(oi.quantity * oi.snapshot_program_price)
            FROM order_item oi
            JOIN "order" o ON o.id = oi.order_id
            WHERE oi.program_id = p.id
              AND o.status = 'Paid'
          ), 0) AS revenue

          FROM program p
          JOIN category c ON p.category_id = c.id
          JOIN level l ON p.level_id = l.id
          LEFT JOIN course cr ON cr.program_id = p.id
          LEFT JOIN language lang ON cr.language_code = lang.code
          LEFT JOIN event e ON e.program_id = p.id
          LEFT JOIN image img ON img.target_id = p.id AND img.target_table = 'program' AND img.type = 'poster'
        
          LEFT JOIN course_teacher ct ON cr.id = ct.course_id
          LEFT JOIN teacher t ON ct.teacher_id = t.id

          LEFT JOIN event_host eh ON e.id = eh.event_id
          LEFT JOIN host h ON eh.host_id = h.id
          
          WHERE
            p.id::text LIKE $1 OR
            p.name LIKE $1 OR
            p.age_group::text LIKE $1 OR
            p.price::text LIKE $1 OR
            c.name LIKE $1 OR
            lang.name LIKE $1 OR
            l.code LIKE $1 OR
            t.name LIKE $1 OR
            h.name LIKE $1

          GROUP BY
            p.id, c.name, l.code, l.name, l.description, cr.id, cr.total_lessons, lang.code, lang.name, e.id, img.id, img.url
          
          ORDER BY ${sortBy} ${sortOrder}
          
          LIMIT ${limit} OFFSET ${offset};
        `

      const values = [`%${argQuery}%`]
      const programs = await sql.query(query, values)

      return programs
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch admin programs.')
    }
  },
)

// @route /dashboard/programs
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminProgramsTotalPages = authWrapper_WithAdminRole(
  async (argLimit: number, argQuery: string) => {
    const limit = Number(argLimit) || 5

    try {
      const query = `
      SELECT COUNT(*) 
      
      FROM program p
        JOIN category c ON p.category_id = c.id
        JOIN level l ON p.level_id = l.id
        LEFT JOIN course cr ON cr.program_id = p.id
        LEFT JOIN language lang ON cr.language_code = lang.code
        LEFT JOIN event e ON e.program_id = p.id
        LEFT JOIN image img ON img.target_id = p.id AND img.target_table = 'program' AND img.type = 'poster'
      
        LEFT JOIN course_teacher ct ON cr.id = ct.course_id
        LEFT JOIN teacher t ON ct.teacher_id = t.id

        LEFT JOIN event_host eh ON e.id = eh.event_id
        LEFT JOIN host h ON eh.host_id = h.id
      
        WHERE 
          p.id::text LIKE $1 OR
          p.name LIKE $1 OR
          p.age_group::text LIKE $1 OR
          p.price::text LIKE $1 OR
          c.name LIKE $1 OR
          lang.name LIKE $1 OR
          l.code LIKE $1 OR
          t.name LIKE $1 OR
          h.name LIKE $1;
      `

      const values = [`%${argQuery}%`]
      const res = await sql.query(query, values)

      const programsCount = Number(res[0].count)

      const totalPages = Math.ceil(programsCount / limit)

      return { totalPages, programsCount }
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch total admin programs pages.')
    }
  },
)

// @route /dashboard/users
// @access Private
// @role Admin Only
// @cached false
export const fetchUsers = authWrapper_WithAdminRole(
  async (
    argSortBy: UsersSortKey = 'user_name',
    argSortOrder: SortOrder = 'asc',
    argLimit: number,
    argCurrentPage: number,
    argQuery: string,
  ) => {
    const validSortKeys: Record<UsersSortKey, string> = {
      is_active: 'u.is_active',
      user_id: 'u.id',
      user_name: 'u.name',
      user_email: 'u.email',
      created_at: 'u.created_at',
      updated_at: 'u.updated_at',
    }

    const sortBy = validSortKeys[argSortBy] || 'u.name'
    const sortOrder = argSortOrder === 'asc' ? 'ASC' : 'DESC'
    const limit = Number(argLimit) || 5
    const currentPage = Number(argCurrentPage) || 1
    const unsafeOffset = (currentPage - 1) * limit
    const offset = Number(unsafeOffset) || 0

    try {
      const query = `
          SELECT 
            u.is_active,
            u.id,
            u.name,
            u.email,
            u.created_at,
            u.updated_at

          FROM "user" u
          JOIN role r ON u.role_id = r.id

          WHERE r.name = 'student'
            AND (
                  CASE 
                    WHEN u.is_active = TRUE THEN 'Active'
                    ELSE 'Inactive'
                  END LIKE $1
              OR u.id::TEXT LIKE $1
              OR u.name LIKE $1
              OR u.email LIKE $1
            )

          ORDER BY ${sortBy} ${sortOrder}
          
          LIMIT ${limit} OFFSET ${offset};
        `

      const values = [`%${argQuery}%`]
      const users = await sql.query(query, values)

      return users
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch users.')
    }
  },
)

// @route /dashboard/users
// @access Private
// @role Admin Only
// @cached false
export const fetchUsersTotalPages = authWrapper_WithAdminRole(
  async (argLimit: number, argQuery: string) => {
    const limit = Number(argLimit) || 5

    try {
      const query = `
      SELECT COUNT(*) 
      
      FROM "user" u
        JOIN role r ON u.role_id = r.id

      WHERE r.name = 'student'
        AND (
              CASE 
                WHEN u.is_active = TRUE THEN 'Active'
                ELSE 'Inactive'
              END LIKE $1
          OR u.id::TEXT LIKE $1
          OR u.name LIKE $1
          OR u.email LIKE $1
        )
    `

      const values = [`%${argQuery}%`]
      const res = await sql.query(query, values)

      const usersCount = Number(res[0].count)

      const totalPages = Math.ceil(usersCount / limit)

      return { totalPages, usersCount }
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch total users pages.')
    }
  },
)

// @route /dashboard/orders
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminOrders = authWrapper_WithAdminRole(
  async (
    argSortBy: AdminOrdersSortKey = 'order_id',
    argSortOrder: SortOrder = 'asc',
    argLimit: number,
    argCurrentPage: number,
    argQuery: string,
  ) => {
    const validSortKeys: Record<AdminOrdersSortKey, string> = {
      order_id: 'o.id',
      user_id: 'o.user_id',
      guest_id: 'o.guest_id',
      student_id: 'o.student_id',
      total: 'o.total',
      status: 'o.status',
      paid_at: 'o.paid_at',
      receipt_email: 'o.receipt_email',
      created_at: 'o.created_at',
      updated_at: 'o.updated_at',
    }

    const sortBy = validSortKeys[argSortBy] || 'o.id'
    const sortOrder = argSortOrder === 'asc' ? 'ASC' : 'DESC'
    const limit = Number(argLimit) || 5
    const currentPage = Number(argCurrentPage) || 1
    const unsafeOffset = (currentPage - 1) * limit
    const offset = Number(unsafeOffset) || 0

    try {
      const query = `
        SELECT
          o.id,
          o.user_id,
          o.guest_id,
          o.student_id,
          o.total,
          o.status,
          o.paid_at,
          o.receipt_email,
          o.created_at,
          o.updated_at
        
        FROM "order" AS o

       WHERE
        (
          o.id::text LIKE $1 OR
          o.user_id::text LIKE $1 OR
          o.guest_id::text LIKE $1 OR
          o.student_id::text LIKE $1 OR
          o.total::text LIKE $1 OR
          o.status::text LIKE $1 OR
          o.receipt_email LIKE $1
        )
        
        ORDER BY ${sortBy} ${sortOrder}
        
        LIMIT ${limit} OFFSET ${offset};
      `

      const values = [`%${argQuery}%`]
      const orders = await sql.query(query, values)

      return orders
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch admin orders.')
    }
  },
)

// @route /dashboard/orders
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminOrdersTotalPages = authWrapper_WithAdminRole(
  async (argLimit: number, argQuery: string) => {
    const limit = Number(argLimit) || 5

    try {
      const query = `
        SELECT COUNT(*) 
        
        FROM "order" AS o
        
        WHERE
          (
            o.id::text LIKE $1 OR
            o.user_id::text LIKE $1 OR
            o.guest_id::text LIKE $1 OR
            o.student_id::text LIKE $1 OR
            o.total::text LIKE $1 OR
            o.status::text LIKE $1 OR
            o.receipt_email LIKE $1
          )
      `

      const values = [`%${argQuery}%`]
      const res = await sql.query(query, values)

      const ordersCount = Number(res[0].count)

      const totalPages = Math.ceil(ordersCount / limit)

      return { totalPages, ordersCount }
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch total admin orders pages.')
    }
  },
)

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminTotalRevenue = authWrapper_WithAdminRole(async () => {
  try {
    const res = await sql`
        SELECT
          COALESCE(SUM(total), 0) AS total_revenue
        FROM "order"
        WHERE status = 'Paid';
    `

    if (!res || !res?.length || !res[0]?.total_revenue) {
      throw new Error('Failed to fetch total revenue.')
    }

    return res[0].total_revenue as string
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch total revenue.')
  }
})

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminMonthlyRevenueAndMOMGrowth = authWrapper_WithAdminRole(
  async () => {
    try {
      const res = await sql`
        WITH monthly_revenue AS (
          SELECT
            m.month,
            COALESCE(SUM(o.total), 0) AS revenue
          FROM (
            SELECT generate_series(
              date_trunc('month', MIN(paid_at)),
              date_trunc('month', CURRENT_DATE),
              interval '1 month'
            ) AS month
            FROM "order"
            WHERE status = 'Paid'
          ) m
          LEFT JOIN "order" o
            ON date_trunc('month', o.paid_at) = m.month
            AND o.status = 'Paid'
          GROUP BY m.month
        ),
        with_lag AS (
        SELECT
          month,
          revenue,
          LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue
        FROM monthly_revenue
        )
        SELECT
          to_char(month, 'YYYY-MM') AS month,
          revenue,
          prev_month_revenue,
          CASE
            WHEN prev_month_revenue = 0 OR prev_month_revenue IS NULL THEN NULL
            ELSE ROUND(
              (revenue - prev_month_revenue) / prev_month_revenue * 100,
              2
            )
            END AS mom_growth_percent
        FROM with_lag
        ORDER BY month;
    `

      if (!res) {
        throw new Error('Failed to fetch monthly revenue and MOM growth.')
      }

      return res as MonthlyRevenueAndMOMGrowthType[]
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch monthly revenue and MOM growth.')
    }
  },
)

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminTotalStudents = authWrapper_WithAdminRole(async () => {
  try {
    const res = await sql`
        SELECT COUNT(*) AS total_students
        FROM student;
      `

    if (!res || !res?.length || !res[0]?.total_students) {
      throw new Error('Failed to fetch total students.')
    }

    return res[0].total_students as string
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch total students.')
  }
})

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminStudentsGrowth = authWrapper_WithAdminRole(async () => {
  try {
    const res = await sql`
        WITH monthly_counts AS (
          SELECT
            date_trunc('month', created_at) AS month,
            COUNT(*) AS total
          FROM student
          GROUP BY 1
        ),
        comparison AS (
          SELECT
            COALESCE(
              MAX(CASE WHEN month = date_trunc('month', now()) THEN total END),
              0
            ) AS current_month,
            COALESCE(
              MAX(CASE WHEN month = date_trunc('month', now() - interval '1 month') THEN total END),
              0
            ) AS last_month
          FROM monthly_counts
        )
        SELECT
          current_month,
          last_month,
          CASE
            WHEN last_month = 0 THEN NULL
            ELSE ROUND(((current_month - last_month)::numeric / last_month) * 100, 2)
          END AS growth_percentage
        FROM comparison;
      `

    if (!res || !res?.length) {
      throw new Error('Failed to fetch students growth.')
    }

    return res[0].growth_percentage as string | null
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch students growth.')
  }
})

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminRepurchaseRate = authWrapper_WithAdminRole(async () => {
  try {
    const res = await sql`
        WITH paid_orders AS (
          SELECT 
            student_id, 
            COUNT(*) AS order_count
          FROM "order"
          WHERE status = 'Paid'
          GROUP BY student_id
        )
        SELECT
          COUNT(*) AS total_paying_students,
          COUNT(*) FILTER (WHERE order_count > 1) AS repurchasing_students,
          COALESCE(
            COUNT(*) FILTER (WHERE order_count > 1)::float
            / NULLIF(COUNT(*), 0) * 100,
            0
          ) AS repurchase_rate
        FROM paid_orders;
    `

    if (
      !res ||
      !res?.length ||
      !res[0]?.total_paying_students ||
      !res[0]?.repurchasing_students ||
      (!res[0]?.repurchase_rate && res[0]?.repurchase_rate !== 0)
    ) {
      throw new Error('Failed to fetch repurchase rate.')
    }

    return {
      total_paying_students: res[0].total_paying_students,
      repurchasing_students: res[0].repurchasing_students,
      repurchase_rate: res[0].repurchase_rate,
    } as RepurchaseRateType
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch repurchase rate.')
  }
})

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminCreatedProgramsByAgeGroups = authWrapper_WithAdminRole(
  async () => {
    try {
      const res = await sql`
        WITH counts AS (
          SELECT
            age_group,
            COUNT(*) AS cnt
          FROM program
          GROUP BY age_group
        ),
        totals AS (
          SELECT COALESCE(SUM(cnt), 0) AS total
          FROM counts
        ),
        counts_with_total AS (
          SELECT
            counts.age_group,
            counts.cnt,
            totals.total
          FROM counts
          CROSS JOIN totals
        )
        SELECT jsonb_build_object(
          'total_programs', total,
          'age_groups',
            COALESCE(
              jsonb_agg(
                jsonb_build_object(
                  'age_group', age_group,
                  'program_count', cnt,
                  'percentage',
                    CASE
                      WHEN total = 0 THEN 0
                      ELSE ROUND(cnt * 100.0 / total, 2)
                    END
                )
                ORDER BY age_group
              ),
              '[]'::jsonb
            )
        ) AS data
        FROM counts_with_total
        GROUP BY total;
    `

      if (
        !res ||
        !res?.length ||
        !res[0]?.data ||
        (!res[0]?.data?.total_programs && res[0]?.data?.total_programs !== 0)
      ) {
        throw new Error('Failed to fetch created programs by age groups.')
      }

      return res[0].data as CreatedProgramsByAgeGroupsType
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch created programs by age groups.')
    }
  },
)

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminSoldProgramsByAgeGroups = authWrapper_WithAdminRole(
  async () => {
    try {
      const res = await sql`
        WITH sales_by_age AS (
          SELECT
            snapshot_program_age_group AS age_group,
            SUM(quantity) AS total_sold
          FROM order_item
          GROUP BY snapshot_program_age_group
        ),
        totals AS (
          SELECT COALESCE(SUM(total_sold), 0) AS total_sold_all
          FROM sales_by_age
        ),
        sales_with_total AS (
          SELECT
            s.age_group,
            s.total_sold,
            t.total_sold_all
          FROM sales_by_age s
          CROSS JOIN totals t
        )
        SELECT
          jsonb_build_object(
            'total_sold_programs', total_sold_all,
            'age_groups',
              COALESCE(
                jsonb_agg(
                  jsonb_build_object(
                    'age_group', age_group,
                    'total_sold', total_sold,
                    'percentage',
                      CASE
                        WHEN total_sold_all = 0 THEN 0
                        ELSE ROUND(total_sold * 100.0 / total_sold_all, 2)
                      END
                  )
                  ORDER BY age_group
                ),
                '[]'::jsonb
              )
          ) AS data
        FROM sales_with_total
        GROUP BY total_sold_all;
      `

      if (!res || (!res?.length && res?.length !== 0)) {
        throw new Error('Failed to fetch sold programs by age groups.')
      }

      if (res.length === 0) {
        return {
          age_groups: [],
          total_sold_programs: 0,
        } as SoldProgramsByAgeGroupsType
      }

      return res[0].data as SoldProgramsByAgeGroupsType
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch sold programs by age groups.')
    }
  },
)

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminSoldCoursesByLanguages = authWrapper_WithAdminRole(
  async () => {
    try {
      const res = await sql`
        WITH sales_by_language AS (
          SELECT
            oi.snapshot_course_language_name AS language,
            SUM(oi.quantity) AS total_sold
          FROM order_item oi
          JOIN "order" o ON o.id = oi.order_id
          WHERE o.status = 'Paid'
             AND oi.snapshot_course_language_name IS NOT NULL
          GROUP BY oi.snapshot_course_language_name
        ),
        totals AS (
          SELECT COALESCE(SUM(total_sold), 0) AS total_sold_overall
          FROM sales_by_language
        ),
        sales_with_total AS (
          SELECT
            s.language,
            s.total_sold,
            t.total_sold_overall
          FROM sales_by_language s
          CROSS JOIN totals t
        )
        SELECT jsonb_build_object(
          'total_sold_courses', total_sold_overall,
          'languages',
            COALESCE(
              jsonb_agg(
                jsonb_build_object(
                  'language', language,
                  'total_sold', total_sold,
                  'percentage',
                    CASE
                      WHEN total_sold_overall = 0 THEN 0
                      ELSE ROUND(
                        total_sold * 100.0 / total_sold_overall,
                        2
                      )
                    END
                )
                ORDER BY total_sold DESC
              ),
              '[]'::jsonb
            )
        ) AS data
        FROM sales_with_total
        GROUP BY total_sold_overall;
      `

      if (!res || (!res?.length && res?.length !== 0)) {
        throw new Error('Failed to fetch sold courses by languages.')
      }

      if (res.length === 0) {
        return {
          languages: [],
          total_sold_courses: 0,
        } as SoldCoursesByLanguagesType
      }

      return res[0].data as SoldCoursesByLanguagesType
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch sold courses by languages.')
    }
  },
)

// @route /dashboard
// @access Private
// @role Admin Only
// @cached false
export const fetchAdminSoldCoursesByLevels = authWrapper_WithAdminRole(
  async (languageName: string) => {
    try {
      const query = `
        WITH sales_by_level AS (
          SELECT
            oi.snapshot_course_language_name AS language,
            oi.snapshot_program_level AS level,
            SUM(oi.quantity) AS total_sold
          FROM order_item oi
          JOIN "order" o ON o.id = oi.order_id
          WHERE o.status = 'Paid'
            AND oi.snapshot_course_language_name IS NOT NULL
            AND oi.snapshot_course_language_name = $1
          GROUP BY oi.snapshot_course_language_name, oi.snapshot_program_level
        ),
        totals_per_language AS (
          SELECT
            language,
            COALESCE(SUM(total_sold), 0) AS total_sold_per_language
          FROM sales_by_level
          GROUP BY language
        ),
        levels_agg AS (
          SELECT
            s.language,
            t.total_sold_per_language,
            COALESCE(
              jsonb_agg(
                jsonb_build_object(
                  'level', s.level,
                  'total_sold', s.total_sold,
                  'percentage',
                    CASE
                      WHEN t.total_sold_per_language = 0 THEN 0
                      ELSE ROUND(
                        s.total_sold * 100.0 / t.total_sold_per_language,
                        2
                      )
                    END
                )
                ORDER BY s.level
              ),
              '[]'::jsonb
            ) AS levels
          FROM sales_by_level s
          JOIN totals_per_language t USING (language)
          GROUP BY
            s.language,
            t.total_sold_per_language
        )
        SELECT
          language,
          total_sold_per_language,
          levels
        FROM levels_agg
        ORDER BY language;
      `

      const res = await sql.query(query, [languageName])

      if (!res || (!res?.length && res?.length !== 0)) {
        throw new Error('Failed to fetch sold courses by levels.')
      }

      if (res.length === 0) {
        return {
          language: languageName,
          levels: [],
          total_sold_per_language: '0',
        } as SoldCoursesByLevelsType
      }

      return res[0] as SoldCoursesByLevelsType
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch sold courses by levels.')
    }
  },
)

// @route /my-programs
// @access Private
// @role Student Only
// @cached false
export const fetchStudentOrders = authWrapper_WithStudentRole(
  async (
    userId: string,
    argSortBy: MyProgramsSortKey = 'program_name',
    argSortOrder: SortOrder = 'asc',
    argLimit: number,
    argCurrentPage: number,
    argQuery: string,
  ) => {
    const validSortKeys: Record<MyProgramsSortKey, string> = {
      program_name: 'program_name',
      language_name: 'language_name',
      total_lessons: 'total_lessons',
      level_code: 'level_code',
      age_group: 'age_group',
      enrollment_date: 'enrollment_date',
      price: 'price',
    }

    const sortBy = validSortKeys[argSortBy] || 'program_name'
    const sortOrder = argSortOrder === 'asc' ? 'ASC' : 'DESC'
    const limit = Number(argLimit) || 5
    const currentPage = Number(argCurrentPage) || 1
    const unsafeOffset = (currentPage - 1) * limit
    const offset = Number(unsafeOffset) || 0

    try {
      const query = `
          SELECT
            o.id AS order_id,
            oi.id AS order_item_id,
            o.status AS payment_status,
            o.paid_at,
            oi.created_at AS enrollment_date,

            oi.snapshot_program_id AS program_id,
            oi.snapshot_program_name AS program_name,
            oi.snapshot_program_age_group AS age_group,
            oi.snapshot_program_price AS price,
            oi.snapshot_program_level AS level_code,
            oi.snapshot_program_description AS program_description,
            oi.snapshot_program_category AS category_name,

            oi.snapshot_course_total_lessons AS total_lessons,
            oi.snapshot_course_language_name AS language_name,

            COALESCE(oi.snapshot_course_teachers, '[]'::jsonb) AS teachers,
            COALESCE(oi.snapshot_event_hosts, '[]'::jsonb) AS hosts,

            img.id AS image_id,
            img.url AS image_url,
            img.public_id AS image_public_id,
            img.width AS image_width,
            img.height AS image_height,
            img.type AS image_type

          FROM "order" o
          JOIN order_item oi ON oi.order_id = o.id
          LEFT JOIN image img 
              ON img.target_table = 'order_item'
              AND img.target_id = oi.id
              AND img.type = 'snapshot'

          WHERE o.user_id = $1
            AND (
              $2::text IS NULL OR
              oi.snapshot_program_name LIKE $2 OR
              oi.snapshot_program_age_group LIKE $2 OR
              oi.snapshot_program_price::text LIKE $2 OR
              oi.snapshot_program_level LIKE $2 OR
              oi.snapshot_course_language_name LIKE $2 OR
              EXISTS (
                SELECT 1
                FROM jsonb_array_elements(
                  CASE
                    WHEN jsonb_typeof(oi.snapshot_course_teachers) = 'array'
                      THEN oi.snapshot_course_teachers
                    ELSE '[]'::jsonb
                  END
                ) AS t(elem)
                WHERE t.elem ->> 'name' LIKE $2
              )
              OR
              EXISTS (
                SELECT 1
                FROM jsonb_array_elements(
                  CASE
                    WHEN jsonb_typeof(oi.snapshot_event_hosts) = 'array'
                      THEN oi.snapshot_event_hosts
                    ELSE '[]'::jsonb
                  END
                ) AS h(elem)
                WHERE h.elem ->> 'name' LIKE $2
              ) 
              OR
              o.status::text LIKE $2
            )

          ORDER BY ${sortBy} ${sortOrder}
          
          LIMIT ${limit} OFFSET ${offset};
    `

      const searchValue = argQuery ? `%${argQuery}%` : null
      const programs = await sql.query(query, [userId, searchValue])

      return programs
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch student orders.')
    }
  },
)

// @route /my-programs
// @access Private
// @role Student Only
// @cached false
export const fetchStudentOrdersTotalPages = authWrapper_WithStudentRole(
  async (userId: string, argLimit: number, argQuery: string) => {
    const limit = Number(argLimit) || 5

    try {
      const query = `
          SELECT COUNT(*) 
          
          FROM "order" o
          JOIN order_item oi ON oi.order_id = o.id
          LEFT JOIN image img 
              ON img.target_table = 'order_item'
              AND img.target_id = oi.id
              AND img.type = 'snapshot'

          WHERE o.user_id = $1
            AND (
              $2::text IS NULL OR
              oi.snapshot_program_name LIKE $2 OR
              oi.snapshot_program_age_group LIKE $2 OR
              oi.snapshot_program_price::text LIKE $2 OR
              oi.snapshot_program_level LIKE $2 OR
              oi.snapshot_course_language_name LIKE $2 OR
              EXISTS (
                SELECT 1
                FROM jsonb_array_elements(
                  CASE
                    WHEN jsonb_typeof(oi.snapshot_course_teachers) = 'array'
                      THEN oi.snapshot_course_teachers
                    ELSE '[]'::jsonb
                  END
                ) AS t(elem)
                WHERE t.elem ->> 'name' LIKE $2
              )
              OR
              EXISTS (
                SELECT 1
                FROM jsonb_array_elements(
                  CASE
                    WHEN jsonb_typeof(oi.snapshot_event_hosts) = 'array'
                      THEN oi.snapshot_event_hosts
                    ELSE '[]'::jsonb
                  END
                ) AS h(elem)
                WHERE h.elem ->> 'name' LIKE $2
              )
              OR
              o.status::text LIKE $2
            )
        `

      const searchValue = argQuery ? `%${argQuery}%` : null
      const res = await sql.query(query, [userId, searchValue])

      const programsCount = Number(res[0].count)

      const totalPages = Math.ceil(programsCount / limit)

      return { totalPages, programsCount }
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch student orders total pages.')
    }
  },
)

// @route / & /checkout
// @access Private
// @role Student Only
// @cached false
export const fetchSignedInCart = authWrapper_WithStudentRole(
  async (userId: string): Promise<CartResponseType> => {
    try {
      const query = `
          SELECT 
            jsonb_agg(
              jsonb_build_object(
                'program_id', p.id,
                'program_name', p.name,
                'price', p.price,
                'quantity', ci.quantity,
                'category_name', cat.name,
                'image', jsonb_build_object(
                  'id', img.id,
                  'url', img.url,
                  'public_id', img.public_id,
                  'width', img.width,
                  'height', img.height,
                  'size', img.bytes,
                  'type', img.type
                )
              )
              ORDER BY ci.created_at
            ) AS items,
            SUM(p.price * ci.quantity) AS total_amount
          
          FROM cart_item ci
          JOIN cart c ON ci.cart_id = c.id
          JOIN program p ON p.id = ci.program_id
          JOIN category cat ON p.category_id = cat.id
          JOIN image img 
            ON img.target_id = p.id 
            AND img.target_table = 'program' 
            AND img.type = 'poster'
          
          WHERE c.user_id = $1;
        `

      const cart = await sql.query(query, [userId])

      return {
        items: cart[0].items || [],
        total_amount: cart[0].total_amount || '0',
      }
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch signed in user cart.')
    }
  },
)

// @route / & /checkout
// @cached false
export const fetchGuestCart = getGuestCartCookieWrapper(
  async (guestCartCookie): Promise<CartResponseType> => {
    if (!guestCartCookie || !guestCartCookie?.value) {
      return {
        items: [],
        total_amount: '0',
      }
    }

    try {
      const query = `
          SELECT 
            jsonb_agg(
              jsonb_build_object(
                'program_id', p.id,
                'program_name', p.name,
                'price', p.price,
                'quantity', ci.quantity,
                'category_name', cat.name,
                'image', jsonb_build_object(
                  'id', img.id,
                  'url', img.url,
                  'public_id', img.public_id,
                  'width', img.width,
                  'height', img.height,
                  'size', img.bytes,
                  'type', img.type
                )
              )
              ORDER BY ci.created_at
            ) AS items,
            SUM(p.price * ci.quantity) AS total_amount
          
          FROM cart_item ci
          JOIN cart c ON ci.cart_id = c.id
          JOIN program p ON p.id = ci.program_id
          JOIN category cat ON p.category_id = cat.id
          JOIN image img 
            ON img.target_id = p.id 
            AND img.target_table = 'program' 
            AND img.type = 'poster'
          
          WHERE c.guest_id = $1;
        `

      const cart = await sql.query(query, [guestCartCookie.value])

      return {
        items: cart[0].items || [],
        total_amount: cart[0].total_amount || '0',
      }
    } catch (error) {
      console.error('Database Error:', error)
      throw new Error('Failed to fetch guest cart.')
    }
  },
)
