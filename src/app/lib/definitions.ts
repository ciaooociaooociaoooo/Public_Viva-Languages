import { z } from 'zod'
import { LanguageEnum, AgeGroupEnum, LevelEnum } from './schema'
import {
  fetchTeachers,
  fetchHosts,
  fetchProgramById,
  fetchPrograms,
  fetchUsers,
  fetchAdminOrders,
  fetchTeachersWithCourses,
  fetchHostsWithEvents,
} from './data'

export type CourseType = {
  id: string
  name: string
}

export type EventType = {
  id: string
  name: string
}

export type AgeGroupType = z.infer<typeof AgeGroupEnum>

export type LevelType = z.infer<typeof LevelEnum>

export type LanguageType = z.infer<typeof LanguageEnum>

export type CourseCategory = LanguageType | 'Kids'

export type FeedBackType = {
  text: string
  author: string
}

export type TeacherType = Awaited<ReturnType<typeof fetchTeachers>>[number]

export type HostType = Awaited<ReturnType<typeof fetchHosts>>[number]

export type ProgramType = Awaited<ReturnType<typeof fetchProgramById>>[number]

export type ProgramsType = Awaited<ReturnType<typeof fetchPrograms>>[number]

export type GroupedProgramsType = {
  [category: string]:
    | {
        [language: string]: ProgramsType[]
      }
    | ProgramsType[]
}

export const adminProgramsColumns = [
  { name: '', dbColumn: '', sortable: false, bulkDelete: true },
  { name: '', dbColumn: '', sortable: false },
  { name: 'Poster', dbColumn: '', sortable: false },
  { name: 'Program Name', dbColumn: 'program_name', sortable: true },
  { name: 'ID', dbColumn: 'program_id', sortable: true },
  { name: 'Category', dbColumn: 'category_name', sortable: true },
  { name: 'Teacher/Host', dbColumn: '', sortable: false },
  { name: 'Language', dbColumn: 'language_name', sortable: true },
  { name: 'Total Lessons', dbColumn: 'total_lessons', sortable: true },
  { name: 'Level', dbColumn: 'level_code', sortable: true },
  { name: 'Age Group', dbColumn: 'age_group', sortable: true },
  { name: 'Enrollment Limit', dbColumn: 'enrollment_limit', sortable: true },
  { name: 'Price', dbColumn: 'price', sortable: true },
  { name: 'Purchase Count', dbColumn: 'purchase_count', sortable: true },
  { name: 'Revenue', dbColumn: 'revenue', sortable: true },
  { name: 'Created At', dbColumn: 'created_at', sortable: true },
  { name: 'Updated At', dbColumn: 'updated_at', sortable: true },
]

const sortableDBColumns = adminProgramsColumns
  .filter((col) => col.sortable && col.dbColumn)
  .map((col) => col.dbColumn) as string[]

export type SortKey = (typeof sortableDBColumns)[number]
export type SortOrder = 'asc' | 'desc'

export const myProgramsColumns = [
  { name: 'Poster', dbColumn: '', sortable: false },
  { name: 'Program Name', dbColumn: 'program_name', sortable: true },
  { name: 'Language', dbColumn: 'language_name', sortable: true },
  { name: 'Level', dbColumn: 'level_code', sortable: true },
  { name: 'Age Group', dbColumn: 'age_group', sortable: true },
  { name: 'Teacher/Host', dbColumn: '', sortable: false },
  { name: 'Total Lessons', dbColumn: 'total_lessons', sortable: true },
  { name: 'Enrollment Date', dbColumn: 'enrollment_date', sortable: true },
  { name: 'Price', dbColumn: 'price', sortable: true },
  { name: 'Payment Status', dbColumn: 'payment_status', sortable: false },
  { name: 'Payment Date', dbColumn: 'paid_at', sortable: false },
]

const myPrograms_sortableDBColumns = myProgramsColumns
  .filter((col) => col.sortable && col.dbColumn)
  .map((col) => col.dbColumn) as string[]

export type MyProgramsSortKey = (typeof myPrograms_sortableDBColumns)[number]

export const usersColumns = [
  { name: 'Status', dbColumn: 'is_active', sortable: true },
  { name: 'ID', dbColumn: 'user_id', sortable: true },
  { name: 'Name', dbColumn: 'user_name', sortable: true },
  { name: 'Email', dbColumn: 'user_email', sortable: true },
  { name: 'Created At', dbColumn: 'created_at', sortable: true },
  { name: 'Updated At', dbColumn: 'updated_at', sortable: true },
]

const users_SortableDBColumns = usersColumns
  .filter((col) => col.sortable && col.dbColumn)
  .map((col) => col.dbColumn) as string[]

export type UsersSortKey = (typeof users_SortableDBColumns)[number]

export type UsersType = Awaited<ReturnType<typeof fetchUsers>>[number]

export const adminOrdersColumns = [
  { name: 'Order ID', dbColumn: 'order_id', sortable: true },
  { name: 'User ID', dbColumn: 'user_id', sortable: true },
  { name: 'Guest ID', dbColumn: 'guest_id', sortable: true },
  { name: 'Student ID', dbColumn: 'student_id', sortable: true },
  { name: 'Total', dbColumn: 'total', sortable: true },
  { name: 'Status', dbColumn: 'status', sortable: true },
  { name: 'Paid At', dbColumn: 'paid_at', sortable: true },
  { name: 'Receipt Email', dbColumn: 'receipt_email', sortable: true },
  { name: 'Created At', dbColumn: 'created_at', sortable: true },
  { name: 'Updated At', dbColumn: 'updated_at', sortable: true },
]

const adminOrders_sortableDBColumns = adminOrdersColumns
  .filter((col) => col.sortable && col.dbColumn)
  .map((col) => col.dbColumn) as string[]

export type AdminOrdersSortKey = (typeof adminOrders_sortableDBColumns)[number]

export type AdminOrdersType = Awaited<
  ReturnType<typeof fetchAdminOrders>
>[number]

export type CartItemType = {
  program_id: string
  program_name: string
  price: number
  quantity: number
  category_name: string
  image: {
    id: string
    url: string
    public_id: string
    width: number
    height: number
    size: number
    type: string
  }
}

export type CartResponseType = {
  items: CartItemType[]
  total_amount: string
}

export const GUEST_CART_COOKIE_NAME = 'guest_id'

export const GUEST_CART_COOKIE_MAX_AGE: number = 60 * 60 * 24 * 3 // 3 days.

export type CartItemCheckoutType = {
  program_id: number
  quantity: number
}

export type CartItemWithIssueType = {
  program_id: string
  messageOnItem: string
}

export type CheckoutCartReturnType = Promise<{
  success: boolean
  cause?: string
  message: string
  cartItemsWithIssue?: CartItemWithIssueType[]
}>

export type ValidateOrderReturnType = Promise<{
  success: boolean
  cause?: string
  message: string
  cartItemsWithIssue?: CartItemWithIssueType[]
  errors?: {
    email?: string[] | undefined
    name?: string[] | undefined
  }
}>

export const dateFormatLocale = 'en-US'

export const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
}

export type PaymentSuccessOrderType = {
  order_id: string
  total: number
  paid_at: Date
  items: {
    order_item_id: string
    program_id: string
    name: string
    price: number
    quantity: number
    image_url: string
    image_width: number
    image_height: number
  }[]
} | null

export type TeacherCourse = {
  program_id: string
  program_name: string
}

export type TeachersWithCoursesType = {
  [teacherId: string]: {
    id: string
    name: string
    bio: string | null
    courses: TeacherCourse[]
  }
}

export type HostEvent = {
  program_id: string
  program_name: string
}

export type HostsWithEventsType = {
  [hostId: string]: {
    id: string
    name: string
    bio: string | null
    events: HostEvent[]
  }
}

export type Latest6ProgramsType = {
  id: string
  name: string
}

export type TeacherHostProfileType = {
  id: string
  name: string
  bio: string
  color_1: string
  color_2: string
}

export type PieChartDataWithColors = {
  name: string
  value: number
  fill: string
}

export type MonthlyRevenueAndMOMGrowthType = {
  month: string
  revenue: string
  prev_month_revenue: string | null
  mom_growth_percent: string | null
}

export type RepurchaseRateType = {
  total_paying_students: string
  repurchasing_students: string
  repurchase_rate: number
}

export type CreatedProgramsByAgeGroupType = {
  age_group: string
  percentage: number
  program_count: number
}

export type CreatedProgramsByAgeGroupsType = {
  age_groups: CreatedProgramsByAgeGroupType[]
  total_programs: number
}

export type SoldProgramsByAgeGroupType = {
  age_group: string
  percentage: number
  total_sold: number
}

export type SoldProgramsByAgeGroupsType = {
  age_groups: SoldProgramsByAgeGroupType[]
  total_sold_programs: number
}

export type SoldCoursesByLanguageType = {
  language: string
  percentage: number
  total_sold: number
}

export type SoldCoursesByLanguagesType = {
  languages: SoldCoursesByLanguageType[]
  total_sold_courses: number
}

export type SoldCoursesByLevelType = {
  level: string
  percentage: number
  total_sold: number
}

export type SoldCoursesByLevelsType = {
  language: string
  levels: SoldCoursesByLevelType[]
  total_sold_per_language: string
}
