'use client'

import { useState, useEffect, useId, Fragment } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useDebouncedCallback } from 'use-debounce'
import { groupProgramsByCategoryAndLanguage } from '../../lib/utils'
import { signOut } from 'next-auth/react'
import Button from '../button'
import SignInLink from '../signInLink'
import { usePathname } from 'next/navigation'
import { Latest6ProgramsType } from '../../lib/definitions'
import { isTopDialog, popDialog, pushDialog } from '@/app/lib/utils'

type TopBarProps = {
  isSignedIn: boolean
  isAdmin: boolean
  isStudent: boolean
  programsGroupedBy: ReturnType<typeof groupProgramsByCategoryAndLanguage>
  latest6Programs: Latest6ProgramsType[]
}

const TopBar = ({
  isSignedIn,
  isAdmin,
  isStudent,
  programsGroupedBy,
  latest6Programs,
}: TopBarProps) => {
  const pathname = usePathname()

  const [target1, setTarget1] = useState<string | null>(null)
  const [target2, setTarget2] = useState<string | null>(null)

  const debounced1 = useDebouncedCallback((val: string | null) => {
    setTarget1(val)
  }, 300)

  const debounced2 = useDebouncedCallback((val: string | null) => {
    setTarget2(val)
  }, 300)

  const id = useId()

  // (Accessibility)
  // (So Esc key can close menu.)
  useEffect(() => {
    if (!target1 && !target2) return

    pushDialog(id)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopDialog(id)) {
        if (target1) debounced1(null)
        if (target2) debounced2(null)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      popDialog(id)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [target1, target2, debounced1, debounced2, id])

  let contentNewPrograms, contentCourseEventKids

  // New Programs
  if (Array?.isArray(latest6Programs) && latest6Programs?.length > 0) {
    contentNewPrograms = (
      <Fragment>
        {/* Level 1 - Title New Programs */}
        <li
          className={clsx(
            'group/1 relative h-full cursor-pointer content-center',
            target1 ? 'open' : '',
          )}
          onMouseEnter={() => debounced1('new-programs')}
          onMouseLeave={() => debounced1(null)}
          onFocus={() => debounced1('new-programs')}
          onBlur={() => debounced1(null)}
          role='none'
        >
          <button
            className={clsx(
              'hover:text-theme-gold flex size-full cursor-pointer items-center gap-1 px-5',
              target1 === 'new-programs' ? 'text-theme-gold' : '',
            )}
            role='menuitem'
            aria-haspopup='true'
            aria-expanded={target1 === 'new-programs'}
          >
            <span>New Programs</span>
            <ChevronDownIcon className='w-3 stroke-3' />
          </button>
          {/* Level 2 - Programs */}
          <div
            className={clsx(
              `border-theme-gold bg-overall-bg rouned-4 shadow-1 pointer-events-none invisible absolute top-90/100 left-[calc((100%-10px)/2)] z-1000 min-w-[200px] -translate-x-1/2 rounded-3xl border-1 border-solid leading-10 opacity-0 ease-in-out`,
              target1 === 'new-programs'
                ? 'group-[.open]/1:pointer-events-auto group-[.open]/1:visible group-[.open]/1:opacity-100'
                : '',
            )}
          >
            <ul className='flex flex-col gap-2' role='menu'>
              {latest6Programs.map(({ id, name }) => (
                <li
                  key={id}
                  className={clsx(
                    'hover:bg-gold-2/25 cursor-pointer rounded-3xl',
                    pathname === `/program/${id}` && 'bg-gold-2/25',
                  )}
                  role='none'
                >
                  <Link
                    className='inline-block size-full px-5'
                    href={`/program/${id}`}
                    role='menuitem'
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </li>
      </Fragment>
    )
  }

  // Course, Event, Kids
  // check: programs is obj, has at least one property
  if (
    programsGroupedBy &&
    programsGroupedBy.constructor === Object &&
    Object.keys(programsGroupedBy)?.length > 0
  ) {
    contentCourseEventKids = Object.entries(programsGroupedBy).map(
      ([key, value], i) => {
        // check: value is array, has at least one course
        if (Array.isArray(value) && value.length > 0) {
          return (
            <Fragment key={`${key}-${i}`}>
              {/* Level 1 - Title Event */}
              <li
                className={clsx(
                  'group/1 relative h-full cursor-pointer content-center',
                  target1 ? 'open' : '',
                )}
                onMouseEnter={() => debounced1(key)}
                onMouseLeave={() => debounced1(null)}
                onFocus={() => debounced1(key)}
                onBlur={() => debounced1(null)}
                role='none'
              >
                <button
                  className={clsx(
                    'hover:text-theme-gold flex size-full cursor-pointer items-center gap-1 px-5',
                    target1 === key ? 'text-theme-gold' : '',
                  )}
                  role='menuitem'
                  aria-haspopup='true'
                  aria-expanded={target1 === key}
                >
                  <span>{key}</span>
                  <ChevronDownIcon className='w-3 stroke-3' />
                </button>
                {/* Level 2 - Events */}
                <div
                  className={clsx(
                    `border-theme-gold bg-overall-bg rouned-4 shadow-1 pointer-events-none invisible absolute top-90/100 left-[calc((100%-10px)/2)] z-1000 min-w-[200px] -translate-x-1/2 rounded-3xl border-1 border-solid leading-10 opacity-0 ease-in-out`,
                    target1 === key
                      ? 'group-[.open]/1:pointer-events-auto group-[.open]/1:visible group-[.open]/1:opacity-100'
                      : '',
                  )}
                >
                  <ul className='flex flex-col gap-2' role='menu'>
                    {value.map(({ program_id: id, program_name: name }) => (
                      <li
                        key={id}
                        className={clsx(
                          'hover:bg-gold-2/25 cursor-pointer rounded-3xl',
                          pathname === `/program/${id}` && 'bg-gold-2/25',
                        )}
                        role='none'
                      >
                        <Link
                          className='inline-block size-full px-5'
                          href={`/program/${id}`}
                          role='menuitem'
                        >
                          {name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </Fragment>
          )
          // check: value is obj, has at least one course
        } else if (
          value &&
          value.constructor === Object &&
          Object.values(value)?.some(
            (courses) => Array.isArray(courses) && courses.length > 0,
          )
        ) {
          return (
            <Fragment key={`${key}-${i}`}>
              {/* Level 1 - Title Course */}
              <li
                className={clsx(
                  'group/2 relative h-full cursor-pointer content-center',
                  target1 ? 'open' : '',
                )}
                onMouseEnter={() => debounced1(key)}
                onMouseLeave={() => debounced1(null)}
                onFocus={() => debounced1(key)}
                onBlur={() => debounced1(null)}
                role='none'
              >
                <button
                  className={clsx(
                    'hover:text-theme-gold flex size-full cursor-pointer items-center gap-1 px-5',
                    target1 === key ? 'text-theme-gold' : '',
                  )}
                  role='menuitem'
                  aria-haspopup='true'
                  aria-expanded={target1 === key}
                >
                  <span className=''>{key}</span>
                  <ChevronDownIcon className='w-3 stroke-3' />
                </button>
                {/* Level 2 - Languages */}
                <div
                  className={clsx(
                    `bg-overall-bg border-theme-gold rouned-4 shadow-1 pointer-events-none invisible absolute top-90/100 left-[calc((100%-10px)/2)] z-1000 min-w-[200px] -translate-x-1/2 rounded-3xl border-1 border-solid leading-10 opacity-0 ease-in-out`,
                    target1 === key
                      ? 'group-[.open]/2:pointer-events-auto group-[.open]/2:visible group-[.open]/2:opacity-100'
                      : '',
                  )}
                >
                  <ul className='relative flex flex-col gap-1' role='menu'>
                    {Object.entries(value).map(([language, courses]) => {
                      if (
                        language &&
                        Array.isArray(courses) &&
                        courses.length > 0
                      ) {
                        return (
                          <li
                            className={clsx(
                              'group/3 hover:bg-gold-2/25 cursor-pointer rounded-3xl',
                              target2 ? 'open' : '',
                            )}
                            key={language}
                            onMouseEnter={() => {
                              // debounced1(key)
                              debounced2(language)
                            }}
                            onMouseLeave={() => {
                              // debounced1(null)
                              debounced2(null)
                            }}
                            onFocus={() => {
                              // debounced1(key)
                              debounced2(language)
                            }}
                            onBlur={() => {
                              // debounced1(null)
                              debounced2(null)
                            }}
                            role='none'
                          >
                            <button
                              className='relative flex size-full cursor-pointer items-center justify-center px-5'
                              role='menuitem'
                              aria-haspopup='true'
                              aria-expanded={target1 === key}
                            >
                              <span>{language}</span>
                              <ChevronRightIcon className='absolute top-1/2 right-0 w-3 -translate-x-full -translate-y-1/2 stroke-3' />
                            </button>
                            {/* Level 3 - Courses */}
                            {/* 12px - from li's px-5; -top-4 - from its own py-4 */}
                            <div
                              className={clsx(
                                'bg-overall-bg border-theme-gold rouned-4 shadow-1 pointer-events-none invisible absolute top-0 left-full z-1000 min-w-[200px] rounded-3xl border-1 border-solid leading-10 opacity-0 ease-in-out',
                                target2 === language
                                  ? 'group-[.open]/3:pointer-events-auto group-[.open]/3:visible group-[.open]/3:opacity-100'
                                  : '',
                              )}
                              // onMouseEnter={() => {
                              //   debounced1(key)
                              //   debounced2(language)
                              // }}
                              // onMouseLeave={() => {
                              //   debounced2(null)
                              // }}
                            >
                              <ul className='flex flex-col gap-2' role='menu'>
                                {courses.map(
                                  ({ program_id: id, program_name: name }) => (
                                    <li
                                      key={id}
                                      className={clsx(
                                        'hover:bg-gold-2/25 rounded-3xl',
                                        pathname === `/program/${id}` &&
                                          'bg-gold-2/25',
                                      )}
                                      role='none'
                                    >
                                      <Link
                                        className='inline-block size-full px-5'
                                        href={`/program/${id}`}
                                        role='menuitem'
                                      >
                                        {name}
                                      </Link>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </li>
                        )
                      }
                    })}
                  </ul>
                </div>
              </li>
            </Fragment>
          )
        }
      },
    )

    return (
      <div id='topbar' className='font-fredoka hidden h-full lg:block'>
        <nav className='h-full ease-in-out'>
          <ul
            className='text-theme-brown flex h-full items-center text-center text-lg text-nowrap'
            role='menubar'
          >
            <li
              className='hover:text-theme-gold h-full cursor-pointer content-center'
              role='none'
            >
              <Link
                className='flex h-full items-center px-5'
                href='/about-us'
                role='menuitem'
              >
                About Us
              </Link>
            </li>
            {contentNewPrograms}
            {contentCourseEventKids}
            {!isSignedIn && (
              <li
                className='hover:text-theme-gold h-full cursor-pointer content-center'
                role='none'
              >
                <SignInLink
                  className='flex h-full items-center px-5'
                  role='menuitem'
                />
              </li>
            )}
            {isSignedIn && isStudent && (
              <li
                className='hover:text-theme-gold h-full cursor-pointer content-center'
                role='none'
              >
                <Link
                  className='flex h-full items-center px-5'
                  href='/my-programs'
                  role='menuitem'
                >
                  My Programs
                </Link>
              </li>
            )}
            {isSignedIn && (
              <li
                className='hover:text-theme-gold h-full cursor-pointer content-center'
                role='none'
              >
                <Button
                  className='flex h-full cursor-pointer items-center px-5'
                  onClick={() => signOut()}
                  role='menuitem'
                >
                  Sign Out
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    )
  }
}

export default TopBar
