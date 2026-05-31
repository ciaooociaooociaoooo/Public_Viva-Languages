import { z } from 'zod'

export const AgeGroupEnum = z.enum(['Adults', 'Kids', 'All'], {
  error: 'Please select an age group.',
})

export const LevelEnum = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'All'], {
  error: 'Please select a level.',
})

export const LanguageEnum = z.enum(['French', 'Italian', 'Spanish'], {
  error: 'Please select a language.',
})

const programSchema = z.object({
  programName: z.string().min(1, 'Program name is required'),
  level: LevelEnum,
  ageGroup: AgeGroupEnum,
  enrollmentLimit: z.coerce
    .number()
    .int({ message: 'Must be an integer.' })
    .gt(0, { message: 'Must be greater than 0.' }),
  price: z.coerce.number().gt(0, { message: 'Must be greater than $0.' }),
  description: z.string().min(1, 'Description is required'),
  poster: z
    .string()
    .url({
      protocol: /^https$/,
      hostname: /^res\.cloudinary\.com$/,
    })
    .refine(
      (value) => {
        try {
          const url = new URL(value)
          return url.pathname.startsWith('/dyqjn9z7x/image/upload/')
        } catch {
          return false
        }
      },
      {
        message: 'Invalid pathname',
      },
    )
    .refine(
      (value) => {
        try {
          const url = new URL(value)
          return /\.(jpe?g|png|webp)$/i.test(url.pathname)
        } catch {
          return false
        }
      },
      {
        message: 'File must be a .jpg, .jpeg, .png, or .webp image.',
      },
    ),
  posterPublicId: z.string().min(1, 'Poster publicId is required'),
  posterWidth: z.coerce.number().gt(0, { message: 'Invalid poster width.' }),
  posterHeight: z.coerce.number().gt(0, { message: 'Invalid poster height.' }),
  posterSize: z.coerce
    .number()
    .max(5_500_000, { message: 'File must be smaller than 5.5MB.' }),
})

// New Program
export const courseSchema = programSchema.extend({
  category: z.literal('Course'),
  teacher: z.string().min(1, 'Teacher is required'),
  language: LanguageEnum,
  totalLessons: z.coerce
    .number()
    .int({ message: 'Must be an integer.' })
    .gt(0, { message: 'Must be greater than 0.' }),
})

export const eventSchema = programSchema.extend({
  category: z.literal('Event'),
  host: z.string().min(1, 'Host is required'),
})

// (use either of them based on the category value)
export const newProgramFormSchema = z.discriminatedUnion('category', [
  courseSchema,
  eventSchema,
])

type FormErrors<T> = {
  [K in keyof T]?: string[]
}

type CourseFormErrors = FormErrors<z.infer<typeof courseSchema>>
type EventFormErrors = FormErrors<z.infer<typeof eventSchema>>

type NewProgramForm_ValidationErrors =
  | {
      category: 'Course'
      errors: CourseFormErrors
    }
  | {
      category: 'Event'
      errors: EventFormErrors
    }

type NewProgramForm_ValidationErrorMsg = {
  type: 'validation'
  data: NewProgramForm_ValidationErrors
  message: string
}

type NewProgramForm_OperationFailureMsg = {
  type: 'operation'
  success: false
  message: string
}

type NewProgramForm_OperationSuccessMsg = {
  type: 'operation'
  success: true
  message: string
}

type NewProgramForm_InitialState = {
  type: null
  errors: null
  message: null
  success: null
}

export type NewProgramForm_ActionState =
  | NewProgramForm_ValidationErrorMsg
  | NewProgramForm_OperationFailureMsg
  | NewProgramForm_OperationSuccessMsg
  | NewProgramForm_InitialState

// End New Program

// Edit Program
const editProgramSchema = programSchema.extend({
  programId: z.string().uuid({ message: 'Program ID is required' }),
})

export const editCourseSchema = editProgramSchema.extend({
  category: z.literal('Course'),
  teacher: z.string().min(1, 'Teacher is required'),
  language: LanguageEnum,
  totalLessons: z.coerce
    .number()
    .int({ message: 'Must be an integer.' })
    .gt(0, { message: 'Must be greater than 0.' }),
})

export const editEventSchema = editProgramSchema.extend({
  category: z.literal('Event'),
  host: z.string().min(1, 'Host is required'),
})

export const editProgramFormSchema = z.discriminatedUnion('category', [
  editCourseSchema,
  editEventSchema,
])

type EditCourseFormErrors = FormErrors<z.infer<typeof editCourseSchema>>
type EditEventFormErrors = FormErrors<z.infer<typeof editEventSchema>>

type EditProgramForm_ValidationErrors =
  | { category: 'Course'; errors: EditCourseFormErrors }
  | { category: 'Event'; errors: EditEventFormErrors }

type EditProgramForm_ValidationErrorMsg = {
  type: 'validation'
  data: EditProgramForm_ValidationErrors
  message: string
}

export type EditProgramForm_ActionState =
  | EditProgramForm_ValidationErrorMsg
  | NewProgramForm_OperationFailureMsg
  | NewProgramForm_OperationSuccessMsg
  | NewProgramForm_InitialState
// End Edit Program

// Validate email and name
export const guestOrderSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character' })
    .max(100, { message: 'Name must be at most 100 characters' }),
  email: z.email({ message: 'Invalid email address' }),
})
