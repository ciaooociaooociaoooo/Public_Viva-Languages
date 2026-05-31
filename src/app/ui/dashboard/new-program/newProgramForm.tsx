'use client'

import {
  useState,
  useRef,
  useEffect,
  useActionState,
  startTransition,
} from 'react'
import { useRouter } from 'next/navigation'
import NumBar from '../../numBar'
import QuillEditor from '../../QuillEditor'
import Button from '../../button'
import clsx from 'clsx'
import DOMPurify from 'dompurify'
import { createNewProgram, deleteImageInCloudinary } from '@/app/lib/actions'
import {
  newProgramFormSchema,
  NewProgramForm_ActionState,
} from '@/app/lib/schema'
import ImageUploaderWrapper from '../../imageUploaderWrapper'
import LoaderOnBtn from '../../loaderOnBtn'
import { useNotification } from '@/app/ctx/notificationContext'

interface NewProgramFormProps {
  categories: Record<string, string>[]
  levels: Record<string, string>[]
  languages: Record<string, string>[]
  teachers: Record<string, string>[]
  hosts: Record<string, string>[]
}

const NewProgramForm = ({
  categories,
  levels,
  languages,
  teachers,
  hosts,
}: NewProgramFormProps) => {
  const router = useRouter()

  const { showGlobalNotification } = useNotification()

  const [categoryState, setCategoryState] = useState<string>('Course')

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const rawDescContentRef = useRef<string>('')

  const imageWidthRef = useRef<number | null>(null)

  const imageHeightRef = useRef<number | null>(null)

  const imageBytesRef = useRef<number | null>(null)

  const [imageURL, setImageURL] = useState<string>('')

  const imagePublicIDRef = useRef<string>('')

  const [totalLessons, setTotalLessons] = useState<number | ''>(1)

  const [enrollmentLimit, setEnrollmentLimit] = useState<number | ''>(1)

  const [price, setPrice] = useState<number | ''>(1)

  const [clientValErr, setClientValErr] = useState<Record<string, string[]>>({})

  const handleCancelClick = () => {
    const deleteImageInCloudinaryWithId = deleteImageInCloudinary.bind(
      null,
      String(imagePublicIDRef.current ?? ''),
    )

    // (if there's an image previously uploaded, delete it.)
    if (imagePublicIDRef.current) {
      deleteImageInCloudinaryWithId()
        .then((res) => {
          if (!res.success) console.error(res.error)
        })
        .catch((err) => console.error('Failed to delete previous image:', err))
        .finally(() => {
          router.push('/dashboard')
        })
    } else {
      router.push('/dashboard')
    }
  }

  const actionReducer = async (
    _prevState: NewProgramForm_ActionState,
    formData: FormData,
  ): Promise<NewProgramForm_ActionState> => {
    return await createNewProgram(_prevState, formData)
  }
  const initialState: NewProgramForm_ActionState = {
    type: null,
    errors: null,
    message: null,
    success: null,
  }
  const [actionState, formAction, _isPending] = useActionState(
    actionReducer,
    initialState,
  )

  let programNameErrors: string[] | undefined,
    categoryErrors: string[] | undefined,
    teacherErrors: string[] | undefined,
    languagesErrors: string[] | undefined,
    totalLessonsErrors: string[] | undefined,
    hostErrors: string[] | undefined,
    levelsErrors: string[] | undefined,
    ageGroupErrors: string[] | undefined,
    enrollmentLimitErrors: string[] | undefined,
    priceErrors: string[] | undefined,
    posterSizeErrors: string[] | undefined,
    posterErrors: string[] | undefined,
    posterWidthErrors: string[] | undefined,
    posterHeightErrors: string[] | undefined,
    descriptionErrors: string[] | undefined,
    validationMsg: string | undefined
  if (actionState?.type === 'validation') {
    programNameErrors = actionState?.data?.errors?.programName
    categoryErrors = actionState?.data?.errors?.category
    levelsErrors = actionState?.data?.errors?.level
    ageGroupErrors = actionState?.data?.errors?.ageGroup
    enrollmentLimitErrors = actionState?.data?.errors?.enrollmentLimit
    priceErrors = actionState?.data?.errors?.price
    posterSizeErrors = actionState?.data?.errors?.posterSize
    posterErrors = actionState?.data?.errors?.poster
    posterWidthErrors = actionState?.data?.errors?.posterWidth
    posterHeightErrors = actionState?.data?.errors?.posterHeight
    descriptionErrors = actionState?.data?.errors?.description

    if (actionState?.data?.category === 'Course') {
      teacherErrors = actionState?.data?.errors?.teacher
      languagesErrors = actionState?.data?.errors?.language
      totalLessonsErrors = actionState?.data?.errors?.totalLessons
    }

    if (actionState?.data?.category === 'Event') {
      hostErrors = actionState?.data?.errors?.host
    }

    if (actionState?.message) {
      validationMsg = actionState?.message
    }
  } else if (
    actionState?.type === 'operation' &&
    actionState?.success === false &&
    actionState?.message
  ) {
    validationMsg = actionState?.message
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)

    e.preventDefault()

    setClientValErr({})

    const form = e.currentTarget
    const formData = new FormData(form)

    // (sanitize desc content)
    const cleanDesc = DOMPurify.sanitize(rawDescContentRef.current)

    formData.set('description', cleanDesc)
    formData.set('poster', imageURL)
    formData.set('posterPublicId', imagePublicIDRef.current)
    formData.set('posterWidth', String(imageWidthRef.current))
    formData.set('posterHeight', String(imageHeightRef.current))
    formData.set('posterSize', String(imageBytesRef.current))

    // (Client Side Form Validation)
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
      description: formData.get('description'),
      poster: formData.get('poster'),
      posterPublicId: formData.get('posterPublicId'),
      posterWidth: formData.get('posterWidth'),
      posterHeight: formData.get('posterHeight'),
      posterSize: formData.get('posterSize'),
    })

    // (when validation fails)
    if (!validatedFields.success) {
      setClientValErr(validatedFields.error.flatten().fieldErrors)
      setIsLoading(false)

      return
    }

    // (when validation success)
    startTransition(() => {
      formAction(formData)
    })
  }

  useEffect(() => {
    // (When Server Side Form Validation fails.)
    if (
      actionState?.type === 'validation' &&
      Object.keys(actionState?.data)?.length > 0
    ) {
      setIsLoading(false)
      // (When Server Side Form Validation success but server action fails.)
    } else if (
      actionState?.type === 'operation' &&
      actionState?.success === false
    ) {
      setIsLoading(false)
      // (When server action success.)
    } else if (
      actionState?.type === 'operation' &&
      actionState?.success === true &&
      actionState?.message
    ) {
      showGlobalNotification(actionState.message)
      router.push('/dashboard/programs')
    }
  }, [actionState, router, showGlobalNotification])

  return (
    <form
      className='text-dashboard-label-1 text-xl font-medium'
      onSubmit={handleSubmit}
      noValidate
    >
      <div>
        <div className='lg:flex lg:items-center lg:justify-between lg:gap-22'>
          <div className='lg:w-[55%]'>
            <div className='flex flex-col gap-10'>
              {/* Program Name */}
              <div>
                <div
                  id='program_name-error'
                  aria-live='polite'
                  aria-atomic='true'
                >
                  {clientValErr?.programName &&
                    clientValErr.programName.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                  {programNameErrors &&
                    programNameErrors?.length > 0 &&
                    programNameErrors.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                </div>
                <div className='flex items-center justify-start gap-3'>
                  <label
                    className='text-dashboard-placeholder-1 w-[40%]'
                    htmlFor='program_name'
                  >
                    Program Name:
                  </label>
                  <input
                    className='border-dashboard-hovered focus:border-dashboard-placeholder-1/70 placeholder:text-dashboard-placeholder-1/50 bg-dashboard-input-1 block w-full rounded-2xl border-2 border-solid py-2 pl-6 shadow-none hover:scale-y-[102%]'
                    type='text'
                    id='program_name'
                    name='program_name'
                    placeholder='e.g. My Program...'
                    defaultValue=''
                    aria-describedby='program_name-error'
                    aria-invalid={
                      !!clientValErr?.programName ||
                      (programNameErrors?.length ?? 0) > 0
                    }
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <div id='category-error' aria-live='polite' aria-atomic='true'>
                  {clientValErr?.category &&
                    clientValErr.category.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                  {categoryErrors &&
                    categoryErrors?.length > 0 &&
                    categoryErrors.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                </div>
                <div className='flex items-center justify-around'>
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      htmlFor={category.id}
                      className='text-dashboard-placeholder-1 relative flex cursor-pointer items-center gap-2'
                    >
                      <input
                        className='peer hidden'
                        type='radio'
                        id={category.id}
                        name='category'
                        value={category.name}
                        checked={categoryState === category.name}
                        onChange={(e) => setCategoryState(e.target.value)}
                        aria-describedby='category-error'
                      />
                      <span className='border-dashboard-hovered absolue after:bg-dashboard-hovered peer-checked:hover:bg-dashboard-placeholder-1 hover:bg-dashboard-bg-grey peer-checked:bg-dashboard-placeholder-1 peer-checked:border-dashboard-placeholder-1 bg-dashboard-input-1 peer-checked:after:bg-dashboard-input-1 top-0 left-0 inline-block size-7 rounded-full border-2 border-solid after:absolute after:top-0 after:left-0 after:block after:size-3 after:translate-x-[65%] after:translate-y-[65%] after:rounded-full after:opacity-0 after:content-[""] peer-checked:after:opacity-100 peer-not-checked:hover:after:opacity-100'></span>
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              {categoryState === 'Course' && (
                <>
                  {/* Teacher */}
                  <div>
                    <div
                      id='teacher-error'
                      aria-live='polite'
                      aria-atomic='true'
                    >
                      {clientValErr?.teacher &&
                        clientValErr.teacher.map((error: string) => (
                          <p
                            key={error}
                            className='pr-3 text-right text-lg text-red-500'
                          >
                            {error}
                          </p>
                        ))}
                      {teacherErrors &&
                        teacherErrors?.length > 0 &&
                        teacherErrors.map((error: string) => (
                          <p
                            key={error}
                            className='pr-3 text-right text-lg text-red-500'
                          >
                            {error}
                          </p>
                        ))}
                    </div>
                    <div className='flex items-center justify-start gap-3'>
                      <label
                        className='text-dashboard-placeholder-1 w-[40%]'
                        htmlFor='teacher'
                      >
                        Teacher:
                      </label>
                      <select
                        className='border-dashboard-hovered focus:border-dashboard-placeholder-1/70 invalid:text-dashboard-placeholder-1/50 bg-dashboard-input-1 block w-full cursor-pointer rounded-2xl border-2 border-solid py-2 text-center shadow-none hover:scale-y-[102%]'
                        id='teacher'
                        name='teacher'
                        // size={0}
                        required
                        defaultValue=''
                        aria-describedby='teacher-error'
                        aria-invalid={
                          !!clientValErr?.teacher ||
                          (teacherErrors?.length ?? 0) > 0
                        }
                      >
                        <option className='hidden' value='' disabled>
                          Choose an option
                        </option>
                        {teachers.map((teacher) => (
                          <option
                            key={teacher.id}
                            className='text-dashboard-placeholder-1 hover:bg-dashboard-hovered'
                            value={teacher.id}
                          >
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <div
                      id='language-error'
                      aria-live='polite'
                      aria-atomic='true'
                    >
                      {clientValErr?.language &&
                        clientValErr.language.map((error: string) => (
                          <p
                            key={error}
                            className='pr-3 text-right text-lg text-red-500'
                          >
                            {error}
                          </p>
                        ))}
                      {languagesErrors &&
                        languagesErrors?.length > 0 &&
                        languagesErrors.map((error: string) => (
                          <p
                            key={error}
                            className='pr-3 text-right text-lg text-red-500'
                          >
                            {error}
                          </p>
                        ))}
                    </div>
                    <div className='flex items-center justify-start gap-3'>
                      <label
                        className='text-dashboard-placeholder-1 w-[40%]'
                        htmlFor='language'
                      >
                        Language:
                      </label>
                      <select
                        className='border-dashboard-hovered focus:border-dashboard-placeholder-1/70 invalid:text-dashboard-placeholder-1/50 bg-dashboard-input-1 block w-full cursor-pointer rounded-2xl border-2 border-solid py-2 text-center shadow-none hover:scale-y-[102%]'
                        id='language'
                        name='language'
                        // size={0}
                        required
                        defaultValue=''
                        aria-describedby='language-error'
                        aria-invalid={
                          !!clientValErr?.language ||
                          (languagesErrors?.length ?? 0) > 0
                        }
                      >
                        <option className='hidden' value='' disabled>
                          Choose an option
                        </option>
                        {languages.map((language) => (
                          <option
                            key={language.code}
                            className='text-dashboard-placeholder-1 hover:bg-dashboard-hovered'
                            value={language.name}
                          >
                            {language.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Total Lessons */}
                  <div>
                    <div
                      id='total_lessons-error'
                      aria-live='polite'
                      aria-atomic='true'
                    >
                      {clientValErr?.totalLessons &&
                        clientValErr.totalLessons.map((error: string) => (
                          <p
                            key={error}
                            className='pr-3 text-right text-lg text-red-500'
                          >
                            {error}
                          </p>
                        ))}
                      {totalLessonsErrors &&
                        totalLessonsErrors?.length > 0 &&
                        totalLessonsErrors.map((error: string) => (
                          <p
                            key={error}
                            className='pr-3 text-right text-lg text-red-500'
                          >
                            {error}
                          </p>
                        ))}
                    </div>
                    <div className='flex items-center justify-start gap-3'>
                      <label
                        className='text-dashboard-placeholder-1 w-[40%]'
                        htmlFor='total_lessons'
                      >
                        Total Lessons:
                      </label>
                      <div className='w-full py-2'>
                        <NumBar
                          value={totalLessons}
                          setValue={setTotalLessons}
                          minNum={1}
                          isInteger={true}
                          handleDecrement={() =>
                            setTotalLessons((prev) =>
                              Math.max(
                                // (minimum value 1)
                                1,
                                !Number.isFinite(prev)
                                  ? // (if prev value is empty string, returns 1)
                                    1
                                  : (prev as number) - 1,
                              ),
                            )
                          }
                          handleIncrement={() =>
                            setTotalLessons((prev) =>
                              // (if prev value is empty string, returns 1)
                              !Number.isFinite(prev) ? 1 : (prev as number) + 1,
                            )
                          }
                          divProps={{
                            className: `has-focus:border-dashboard-placeholder-1/70 w-full h-full border-2 focus:border-dashboard-placeholder-1/70 shadow-none border-solid border-dashboard-hovered flex items-center justify-center`,
                          }}
                          inputProps={{
                            className: `hover:scale-y-[102%] focus:scale-100 text-xl font-medium w-full h-full text-center shadow-none bg-dashboard-input-1 py-2`,
                            id: 'total_lessons',
                            name: 'total_lessons',
                            // defaultValue: 1,
                            'aria-describedby': 'total_lessons-error',
                            'aria-invalid':
                              !!clientValErr?.totalLessons ||
                              (totalLessonsErrors?.length ?? 0) > 0,
                          }}
                          btnProps={{
                            className: `w-10 z-1 h-full bg-dashboard-hovered shadow-none flex items-center justify-center py-2`,
                          }}
                          plusBtnProps={{
                            'aria-label': `Increase number of total lessons`,
                          }}
                          minusBtnProps={{
                            'aria-label': `Decrease number of total lessons`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Host */}
              {categoryState === 'Event' && (
                <div>
                  <div id='host-error' aria-live='polite' aria-atomic='true'>
                    {clientValErr?.host &&
                      clientValErr.host.map((error: string) => (
                        <p
                          key={error}
                          className='pr-3 text-right text-lg text-red-500'
                        >
                          {error}
                        </p>
                      ))}
                    {hostErrors &&
                      hostErrors?.length > 0 &&
                      hostErrors.map((error: string) => (
                        <p
                          key={error}
                          className='pr-3 text-right text-lg text-red-500'
                        >
                          {error}
                        </p>
                      ))}
                  </div>
                  <div className='flex items-center justify-start gap-3'>
                    <label
                      className='text-dashboard-placeholder-1 w-[40%]'
                      htmlFor='host'
                    >
                      Host:
                    </label>
                    <select
                      className='border-dashboard-hovered focus:border-dashboard-placeholder-1/70 invalid:text-dashboard-placeholder-1/50 bg-dashboard-input-1 block w-full cursor-pointer rounded-2xl border-2 border-solid py-2 text-center shadow-none hover:scale-y-[102%]'
                      id='host'
                      name='host'
                      // size={0}
                      required
                      defaultValue=''
                      aria-describedby='host-error'
                      aria-invalid={
                        !!clientValErr?.host || (hostErrors?.length ?? 0) > 0
                      }
                    >
                      <option className='hidden' value='' disabled>
                        Choose an option
                      </option>
                      {hosts.map((host) => (
                        <option
                          key={host.id}
                          className='text-dashboard-placeholder-1 hover:bg-dashboard-hovered'
                          value={host.id}
                        >
                          {host.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Level */}
              <div>
                <div id='level-error' aria-live='polite' aria-atomic='true'>
                  {clientValErr?.level &&
                    clientValErr.level.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                  {levelsErrors &&
                    levelsErrors?.length > 0 &&
                    levelsErrors.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                </div>
                <div className='flex items-center justify-start gap-3'>
                  <label
                    className='text-dashboard-placeholder-1 w-[40%]'
                    htmlFor='level'
                  >
                    Level:
                  </label>
                  <select
                    className='border-dashboard-hovered focus:border-dashboard-placeholder-1/70 invalid:text-dashboard-placeholder-1/50 bg-dashboard-input-1 block w-full cursor-pointer rounded-2xl border-2 border-solid py-2 text-center shadow-none hover:scale-y-[102%]'
                    id='level'
                    name='level'
                    // size={0}
                    required
                    defaultValue=''
                    aria-describedby='level-error'
                    aria-invalid={
                      !!clientValErr?.level || (levelsErrors?.length ?? 0) > 0
                    }
                  >
                    <option className='hidden' value='' disabled>
                      Choose an option
                    </option>
                    {levels.map((level) => (
                      <option
                        key={level.id}
                        className='text-dashboard-placeholder-1 hover:bg-dashboard-hovered'
                        value={level.code}
                      >
                        {level.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Age Group */}
              <div>
                <div id='age-error' aria-live='polite' aria-atomic='true'>
                  {clientValErr?.ageGroup &&
                    clientValErr.ageGroup.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                  {ageGroupErrors &&
                    ageGroupErrors?.length > 0 &&
                    ageGroupErrors.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                </div>
                <div className='flex items-center justify-start gap-3'>
                  <label
                    className='text-dashboard-placeholder-1 w-[40%]'
                    htmlFor='age'
                  >
                    Age Group:
                  </label>
                  <select
                    className='border-dashboard-hovered focus:border-dashboard-placeholder-1/70 invalid:text-dashboard-placeholder-1/50 bg-dashboard-input-1 block w-full cursor-pointer rounded-2xl border-2 border-solid py-2 text-center shadow-none hover:scale-y-[102%]'
                    id='age'
                    name='age'
                    // size={0}
                    required
                    defaultValue=''
                    aria-describedby='age-error'
                    aria-invalid={
                      !!clientValErr?.ageGroup ||
                      (ageGroupErrors?.length ?? 0) > 0
                    }
                  >
                    <option className='hidden' value='' disabled>
                      Choose an option
                    </option>
                    <option
                      className='text-dashboard-placeholder-1 hover:bg-dashboard-hovered'
                      value='Adults'
                    >
                      Adults
                    </option>
                    <option
                      className='text-dashboard-placeholder-1 hover:bg-dashboard-hovered'
                      value='Kids'
                    >
                      Kids
                    </option>
                    <option
                      className='text-dashboard-placeholder-1 hover:bg-dashboard-hovered'
                      value='All'
                    >
                      For All
                    </option>
                  </select>
                </div>
              </div>

              {/* Enrollment Limit */}
              <div>
                <div
                  id='enrollment_limit-error'
                  aria-live='polite'
                  aria-atomic='true'
                >
                  {clientValErr?.enrollmentLimit &&
                    clientValErr.enrollmentLimit.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                  {enrollmentLimitErrors &&
                    enrollmentLimitErrors?.length > 0 &&
                    enrollmentLimitErrors.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                </div>
                <div className='flex items-center justify-start gap-3'>
                  <label
                    className='text-dashboard-placeholder-1 w-[40%]'
                    htmlFor='enrollment_limit'
                  >
                    Enrollment Limit:
                  </label>
                  <div className='w-full py-2'>
                    <NumBar
                      value={enrollmentLimit}
                      setValue={setEnrollmentLimit}
                      minNum={1}
                      isInteger={true}
                      handleDecrement={() =>
                        setEnrollmentLimit((prev) =>
                          Math.max(
                            // (minimum value 1)
                            1,
                            // (if prev value is empty string, returns 1)
                            !Number.isFinite(prev) ? 1 : (prev as number) - 1,
                          ),
                        )
                      }
                      handleIncrement={() =>
                        setEnrollmentLimit((prev) =>
                          // (if prev value is empty string, returns 1)
                          !Number.isFinite(prev) ? 1 : (prev as number) + 1,
                        )
                      }
                      divProps={{
                        className: `has-focus:border-dashboard-placeholder-1/70 w-full h-full border-2 focus:border-dashboard-placeholder-1/70 shadow-none border-solid border-dashboard-hovered flex items-center justify-center`,
                      }}
                      inputProps={{
                        className: `hover:scale-y-[102%] focus:scale-100 text-xl font-medium w-full h-full text-center shadow-none bg-dashboard-input-1 py-2`,
                        id: 'enrollment_limit',
                        name: 'enrollment_limit',
                        // defaultValue: 1,
                        'aria-describedby': 'enrollment_limit-error',
                        'aria-invalid':
                          !!clientValErr?.enrollmentLimit ||
                          (enrollmentLimitErrors?.length ?? 0) > 0,
                      }}
                      btnProps={{
                        className: `w-10 z-1 h-full bg-dashboard-hovered shadow-none flex items-center justify-center py-2`,
                      }}
                      plusBtnProps={{
                        'aria-label': `Increase number of enrollment limit`,
                      }}
                      minusBtnProps={{
                        'aria-label': `Decrease number of enrollment limit`,
                      }}
                    />
                  </div>
                </div>
                <p className='-mt-1 text-end text-sm'>attendees</p>
              </div>

              {/* Price */}
              <div>
                <div id='price-error' aria-live='polite' aria-atomic='true'>
                  {clientValErr?.price &&
                    clientValErr.price.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                  {priceErrors &&
                    priceErrors?.length > 0 &&
                    priceErrors.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))}
                </div>
                <div className='flex items-center justify-start gap-3'>
                  <label
                    className='text-dashboard-placeholder-1 w-[40%]'
                    htmlFor='price'
                  >
                    Price:
                  </label>
                  <div className='w-full py-2'>
                    <NumBar
                      value={price}
                      setValue={setPrice}
                      handleDecrement={() =>
                        setPrice((prev) =>
                          Math.max(
                            // (minimum value 0)
                            0,
                            !Number.isFinite(prev)
                              ? // (if prev value is empty string, returns 0)
                                0
                              : parseFloat(
                                  // (step 0.01)
                                  ((prev as number) - 0.01).toFixed(2),
                                ),
                          ),
                        )
                      }
                      handleIncrement={() =>
                        setPrice((prev) =>
                          !Number.isFinite(prev)
                            ? // (if prev value is empty string, returns 1)
                              1
                            : // (step 0.01)
                              parseFloat(((prev as number) + 0.01).toFixed(2)),
                        )
                      }
                      divProps={{
                        className: `has-focus:border-dashboard-placeholder-1/70 w-full h-full border-2 focus:border-dashboard-placeholder-1/70 shadow-none border-solid border-dashboard-hovered flex items-center justify-center`,
                      }}
                      inputProps={{
                        className: `hover:scale-y-[102%] focus:scale-100 text-xl font-medium w-full h-full text-center shadow-none bg-dashboard-input-1 py-2`,
                        id: 'price',
                        name: 'price',
                        // defaultValue: 1,
                        'aria-describedby': 'price-error',
                        'aria-invalid':
                          !!clientValErr?.price ||
                          (priceErrors?.length ?? 0) > 0,
                      }}
                      btnProps={{
                        className: `w-10 z-1 h-full bg-dashboard-hovered shadow-none flex items-center justify-center py-2`,
                      }}
                      plusBtnProps={{
                        'aria-label': `Increase price`,
                      }}
                      minusBtnProps={{
                        'aria-label': `Decrease price`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Poster */}
          <div className='mt-10 lg:mt-0 lg:w-[45%]'>
            <div>
              <div id='poster-error' aria-live='polite' aria-atomic='true'>
                {clientValErr?.posterSize &&
                  clientValErr.posterSize.map((error: string) => (
                    <p
                      key={error}
                      className='pr-3 text-right text-lg text-red-500'
                    >
                      {error}
                    </p>
                  ))}
                {(clientValErr?.poster ||
                  clientValErr?.posterPublicId ||
                  clientValErr?.posterWidth ||
                  clientValErr?.posterHeight) && (
                  <>
                    <p className='pr-3 text-right text-lg text-red-500'>
                      Please upload a poster.
                    </p>
                    <p className='pr-3 text-right text-lg text-red-500'>
                      Must be a .jpg, .jpeg, .png, or .webp image.
                    </p>
                  </>
                )}
                {posterSizeErrors &&
                  posterSizeErrors?.length > 0 &&
                  posterSizeErrors.map((error: string) => (
                    <p
                      key={error}
                      className='pr-3 text-right text-lg text-red-500'
                    >
                      {error}
                    </p>
                  ))}
                {posterErrors && posterErrors?.length > 0
                  ? posterErrors.map((error: string) => (
                      <p
                        key={error}
                        className='pr-3 text-right text-lg text-red-500'
                      >
                        {error}
                      </p>
                    ))
                  : posterWidthErrors && posterWidthErrors?.length > 0
                    ? posterWidthErrors.map((error: string) => (
                        <p
                          key={error}
                          className='pr-3 text-right text-lg text-red-500'
                        >
                          {error}
                        </p>
                      ))
                    : posterHeightErrors &&
                      posterHeightErrors?.length > 0 &&
                      posterHeightErrors.map((error: string) => (
                        <p
                          key={error}
                          className='pr-3 text-right text-lg text-red-500'
                        >
                          {error}
                        </p>
                      ))}
              </div>
              {/* (size here based on Image size in ImageUploaderWrapper) */}
              <div className='flex h-50 items-center justify-start gap-3 lg:h-90'>
                <div className='w-[40%]'>
                  <p
                    className='text-dashboard-placeholder-1 lg:text-right'
                    id='poster-label'
                  >
                    Poster:
                  </p>
                </div>
                <div
                  className={clsx(
                    'relative flex size-full items-center justify-center py-2',
                    imageURL ? 'display-child-btn-on-hover' : '',
                  )}
                  aria-describedby='poster-error'
                >
                  <ImageUploaderWrapper
                    imageURL={imageURL}
                    setImageURL={setImageURL}
                    imageWidthRef={imageWidthRef}
                    imageHeightRef={imageHeightRef}
                    imagePublicIDRef={imagePublicIDRef}
                    imageBytesRef={imageBytesRef}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='mt-10'>
          <div id='description-error' aria-live='polite' aria-atomic='true'>
            {clientValErr?.description &&
              clientValErr.description.map((error: string) => (
                <p key={error} className='pr-3 text-right text-lg text-red-500'>
                  {error}
                </p>
              ))}
            {descriptionErrors &&
              descriptionErrors?.length > 0 &&
              descriptionErrors.map((error: string) => (
                <p key={error} className='pr-3 text-right text-lg text-red-500'>
                  {error}
                </p>
              ))}
          </div>
          <div className='flex flex-col gap-3'>
            <p
              className='text-dashboard-placeholder-1 w-full'
              id='description-label'
            >
              Description:
            </p>
            <div
              className='size-full'
              aria-labelledby='description-label'
              aria-multiline='true'
              aria-describedby='description-error'
              aria-invalid={
                !!clientValErr?.description ||
                (descriptionErrors?.length ?? 0) > 0
              }
            >
              <QuillEditor contentRef={rawDescContentRef} />
            </div>
          </div>
        </div>
      </div>

      <div className='mt-20'>
        {Object.keys(clientValErr)?.length > 0 && (
          <p className='mb-3 text-center font-semibold text-pretty text-red-700 lg:text-right'>
            Please submit correct input values.
          </p>
        )}
        {validationMsg && (
          <p className='mb-3 text-center font-semibold text-pretty text-red-700 lg:text-right'>
            {validationMsg}
          </p>
        )}
        <div className='flex flex-col items-center gap-5 lg:flex-row lg:justify-end lg:gap-4'>
          <Button
            type='button'
            className={clsx(
              'dashboard-btn dashboard-cancel-btn order-2 w-50 rounded-lg px-4 py-3 text-center lg:order-1 lg:w-52 lg:px-7 lg:py-4',
              isLoading && 'cursor-wait',
            )}
            onClick={handleCancelClick}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className={clsx(
              'dashboard-btn dashboard-main-action-btn order-1 h-15 w-50 rounded-lg px-4 py-3 lg:order-2 lg:w-52 lg:px-7 lg:py-4',
              isLoading && 'cursor-wait',
            )}
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? <LoaderOnBtn size={19} /> : 'Create Program'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default NewProgramForm
