import Link from 'next/link'
import { groupProgramsByCategoryAndLanguage } from '../lib/utils'
import { auth, signOut } from '@/auth'
import Button from './button'
import SignInLink from './signInLink'

type FooterProps = {
  programsGroupedBy: ReturnType<typeof groupProgramsByCategoryAndLanguage>
}

const Footer = async ({ programsGroupedBy }: FooterProps) => {
  const session = await auth()

  let content
  // check: programs is obj, has at least one property
  if (
    programsGroupedBy &&
    programsGroupedBy.constructor === Object &&
    Object.keys(programsGroupedBy)?.length > 0
  ) {
    content = Object.entries(programsGroupedBy).map(([key, value], i) => {
      // check: value is array, has at least one course
      if (Array.isArray(value) && value.length > 0) {
        return (
          <div key={`arr-${key}-${i}`}>
            <h5 className='mb-2 uppercase'>{key}</h5>
            <ul>
              {value.map(({ program_id: id, program_name: name }) => (
                <li key={id}>
                  <Link
                    className='text-theme-light-blue hover:text-gold-logo active:text-gold-logo transition duration-300'
                    href={`/program/${id}`}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      }
      // check: value is obj, has at least one course
      else if (
        value &&
        value.constructor === Object &&
        Object.values(value)?.some(
          (courses) => Array.isArray(courses) && courses.length > 0,
        )
      ) {
        return Object.entries(value).map(([language, courses]) => {
          if (language && Array.isArray(courses) && courses.length > 0) {
            return (
              <div key={language}>
                <h5 className='mb-2 uppercase'>{language}</h5>
                <ul>
                  {courses.map(({ program_id: id, program_name: name }) => (
                    <li key={id}>
                      <Link
                        className='text-theme-light-blue hover:text-gold-logo active:text-gold-logo transition duration-300'
                        href={`/program/${id}`}
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }
        })
      }
    })
  }

  return (
    <footer
      id='wave'
      className='font-nunito bg-theme-deep-blue relative pt-10 pb-13 font-medium sm:max-lg:pt-15 sm:max-lg:pb-24 lg:pt-20 lg:pb-30'
    >
      <div className='grid grid-cols-[minmax(4rem,_1fr)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(4rem,_1fr)] lg:grid-cols-[minmax(min-content,_4rem)_minmax(min-content,_20rem)_minmax(4rem,_1fr)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_20rem)_minmax(min-content,_4rem)]'>
        <div className='col-start-1 col-end-11 row-start-2 row-end-3 mt-20 flex flex-col items-center gap-12 sm:col-start-2 sm:col-end-10 lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2 lg:mt-1'>
          <div className='w-[150px] sm:w-[200px]'>
            <Link href='/' aria-label='Logo'>
              <img src='/Logo_round_best.svg' alt='Logo' />
            </Link>
          </div>
          <div className='flex w-full items-center justify-center gap-8 lg:justify-evenly lg:gap-2'>
            <Link className='w-10' href='/'>
              <img
                className='hover:scale-110'
                src='/facebook-svgrepo-com.svg'
                alt='Facebook'
              />
            </Link>
            <Link className='w-10' href='/'>
              <img
                className='hover:scale-110'
                src='/instagram-logo-facebook-2-svgrepo-com.svg'
                alt='Instagram'
              />
            </Link>
            <Link className='w-10' href='/'>
              <img
                className='hover:scale-110'
                src='/youtube-play-button-play-video-youtube-logo-svgrepo-com.svg'
                alt='Youtube'
              />
            </Link>
          </div>
          <address className='col-start-3 col-end-6 flex flex-col items-center gap-2 text-base font-normal text-white italic lg:items-stretch'>
            <span>viva-languages@example.com</span>
            <span>(217) 555-0198</span>
            <span className='text-nowrap'>
              123 Maplewood Drive Springfield, IL 62704 USA
            </span>
          </address>
        </div>
        <div className='col-start-1 col-end-11 mt-10 grid grid-cols-1 items-stretch gap-x-7 gap-y-14 text-center text-xl text-[#81e6f1] sm:col-start-2 sm:col-end-10 sm:grid-cols-3 sm:text-start md:gap-x-5 lg:col-start-4 lg:col-end-11 lg:gap-y-9'>
          <div>
            <h5 className='mb-2'>NAVIGATION</h5>
            <ul>
              <li>
                <Link
                  className='text-theme-light-blue hover:text-gold-logo active:text-gold-logo transition duration-300'
                  href='/about-us'
                >
                  About Us
                </Link>
              </li>
              {session && session?.user?.role === 'student' && (
                <li>
                  <Link
                    className='text-theme-light-blue hover:text-gold-logo active:text-gold-logo transition duration-300'
                    href='/my-programs'
                  >
                    My Programs
                  </Link>
                </li>
              )}
              {session ? (
                <li>
                  <form
                    action={async () => {
                      'use server'
                      await signOut()
                    }}
                  >
                    <Button
                      className='text-theme-light-blue hover:text-gold-logo active:text-gold-logo cursor-pointer transition duration-300'
                      type='submit'
                    >
                      Sign Out
                    </Button>
                  </form>
                </li>
              ) : (
                <li>
                  <SignInLink className='text-theme-light-blue hover:text-gold-logo active:text-gold-logo transition duration-300' />
                </li>
              )}
            </ul>
          </div>
          {content}
        </div>
      </div>
    </footer>
  )
}

export default Footer
