import Image from 'next/image'
import { ProgramType } from '@/app/lib/definitions'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import ProgramNumBarWrapper from './programNumBarWrapper'
import TeacherHostNameWrapper from './teacherHostNameWrapper'

interface ProgramProps {
  isSignedIn: boolean
  isStudent: boolean
  program: ProgramType
}

const Program = ({
  isSignedIn,
  isStudent,
  program: programArr,
}: ProgramProps) => {
  const program = programArr[0]

  const isEvent = program.category_name === 'Event'

  const window = new JSDOM('').window
  const purify = DOMPurify(window)
  const cleanDesc = purify.sanitize(program.description)

  return (
    <>
      {/* (
            [@media(min-width:1024px)_and_(orientation:portrait)] --- lg and Portrait mode.
            [@media(min-width:1024px)_and_(orientation:landscape)] --- lg and Landscape mode.
            Purpose: to make it display in flex column way when devices are lg and in Portrait mode, e.g. in iPad Pro Portrait mode (1024 x 1366). Because if we display it in flex row way on Portrait mode, it looks bad, despite being lg. 
    ) */}
      {/* (relative, lg:static, [@media(min-width:1024px)_and_(orientation:portrait)]:relative - for <figure> in <TeacherHostNameWrapper/>) */}
      <div className='relative mb-22 flex min-h-[calc(100vh-72px)] w-screen flex-col gap-9 sm:min-h-[calc(100vh-76px)] sm:gap-27 sm:max-lg:mb-35 lg:static lg:mb-33 lg:gap-15 [@media(min-width:1024px)_and_(orientation:portrait)]:relative [@media(min-width:1024px)_and_(orientation:portrait)]:mb-35 [@media(min-width:1024px)_and_(orientation:portrait)]:gap-27'>
        <div className='flex min-h-[calc(100vh-72px)] w-screen flex-wrap gap-3 pt-3 sm:min-h-[calc(100vh-76px)] sm:max-lg:gap-22 sm:max-lg:pt-22 lg:gap-0 lg:pt-0 [@media(min-width:1024px)_and_(orientation:landscape)]:content-center [@media(min-width:1024px)_and_(orientation:portrait)]:gap-22 [@media(min-width:1024px)_and_(orientation:portrait)]:pt-22'>
          <div className='min-h-[66.666%] w-full [@media(min-width:1024px)_and_(orientation:landscape)]:h-full [@media(min-width:1024px)_and_(orientation:landscape)]:w-[55%]'>
            <div className='flex size-full items-center justify-center'>
              <div className='w-60 sm:max-lg:w-60/100 [@media(min-width:1024px)_and_(orientation:landscape)]:w-auto [@media(min-width:1024px)_and_(orientation:portrait)]:w-60/100'>
                <Image
                  className='rounded-4xl lg:w-auto [@media(min-width:1024px)_and_(orientation:landscape)]:h-[calc(88vh-76px)]'
                  src={program.image_url}
                  alt={`Poster of ${program.program_name}`}
                  width={program.image_width}
                  height={program.image_height}
                  priority
                  // fill
                  // sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
                  // sizes='(min-width: 640px) 50vw, 100vw'
                />
              </div>
            </div>
          </div>
          <div className='w-full px-6 [@media(min-width:1024px)_and_(orientation:landscape)]:w-[45%] [@media(min-width:1024px)_and_(orientation:landscape)]:pr-10 [@media(min-width:1024px)_and_(orientation:landscape)]:pl-0'>
            <div className='flex min-h-[33.333%] flex-col gap-6 text-center [@media(min-width:1024px)_and_(orientation:landscape)]:h-full [@media(min-width:1024px)_and_(orientation:landscape)]:min-h-auto [@media(min-width:1024px)_and_(orientation:landscape)]:w-[90%] [@media(min-width:1024px)_and_(orientation:landscape)]:justify-center'>
              {/* (lg:relative, static, [@media(min-width:1024px)_and_(orientation:portrait)]:static - for <figure> in <TeacherHostNameWrapper/>) */}
              <div className='text-theme-brown static lg:relative [@media(min-width:1024px)_and_(orientation:portrait)]:static'>
                <h1 className='font-caveat text-4xl text-nowrap sm:text-5xl'>
                  {program.program_name}
                </h1>
                <div className='font-quicksand text-theme-brown/70 pt-5 sm:text-lg'>
                  with{' '}
                  <TeacherHostNameWrapper
                    teachers={program?.teachers}
                    hosts={program?.hosts}
                  />
                </div>
              </div>
              <div className=''>
                <div className='text-theme-brown font-quicksand text-2xl sm:text-3xl'>
                  <span aria-hidden>&#36;{program.price} </span>
                  <span className='sr-only'>{program.price} dollars</span>
                  {!isEvent && (
                    <span className='text-lg sm:max-lg:text-xl [@media(min-width:1024px)_and_(orientation:portrait)]:text-xl'>{`(${program.total_lessons} lessons)`}</span>
                  )}
                </div>
              </div>

              <ProgramNumBarWrapper
                isSignedIn={isSignedIn}
                isStudent={isStudent}
                isEvent={isEvent}
                program_id={program.program_id}
                program_name={program.program_name}
                program_price={program.price}
                program_category_name={program.category_name}
                program_available={program.available}
                program_image_id={program.image_id}
                program_image_url={program.image_url}
                program_image_public_id={program.image_public_id}
                program_image_width={program.image_width}
                program_image_height={program.image_height}
                program_image_size={program.image_size}
                program_image_type={program.image_type}
              />
            </div>
          </div>
        </div>
        <div
          className='text-theme-brown/70 min-h-[calc(100vh-72px)] w-screen px-8 text-xl sm:min-h-auto sm:px-14 [@media(min-width:1024px)_and_(orientation:landscape)]:px-18'
          dangerouslySetInnerHTML={{ __html: cleanDesc }}
        ></div>
      </div>
    </>
  )
}

export default Program
