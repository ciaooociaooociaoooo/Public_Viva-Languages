'use client'

import { useState, useEffect, useMemo, useRef, Fragment } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { groupProgramsByCategoryAndLanguage } from '../../lib/utils'
import { signOut } from 'next-auth/react'
import Button from '../button'
import SignInLink from '../signInLink'
import { usePathname } from 'next/navigation'
import { Latest6ProgramsType } from '../../lib/definitions'

type SideBarProps = {
  isSignedIn: boolean
  isAdmin: boolean
  isStudent: boolean
  programsGroupedBy: ReturnType<typeof groupProgramsByCategoryAndLanguage>
  isClicked?: boolean
  latest6Programs: Latest6ProgramsType[]
  sideBarMenuRef: React.RefObject<HTMLDivElement | null>
}

const SideBar = ({
  isSignedIn,
  isAdmin,
  isStudent,
  programsGroupedBy,
  isClicked,
  latest6Programs,
  sideBarMenuRef,
}: SideBarProps) => {
  const pathname = usePathname()

  const [pathForSideBar, setPathForSideBar] = useState<string | null>(pathname)

  const [target1, setTarget1] = useState<string | null>(null)
  const [target2, setTarget2] = useState<string | null>(null)

  const initRef = useRef<boolean>(true)

  useEffect(() => {
    if (!isClicked) {
      setTarget1(null)
      setTarget2(null)
    }
  }, [isClicked])

  useEffect(() => {
    setPathForSideBar(pathname)
  }, [pathname])

  const focusRefs = useMemo(() => {
    const level2Refs: Partial<
      Record<
        keyof typeof programsGroupedBy,
        React.RefObject<HTMLHeadingElement | null>
      >
    > = {}
    const level3Refs: Partial<
      Record<
        keyof typeof programsGroupedBy,
        React.RefObject<HTMLHeadingElement | null>
      >
    > = {}

    // Course Event Kids
    // check: programs is obj, has at least one property
    if (
      programsGroupedBy &&
      programsGroupedBy.constructor === Object &&
      Object.keys(programsGroupedBy)?.length > 0
    ) {
      for (const [key, value] of Object.entries(programsGroupedBy)) {
        // check: value is array, has at least one course
        if (Array.isArray(value) && value.length > 0) {
          level2Refs[key] = {
            current: null,
          }
          // check: value is obj, has at least one course
        } else if (
          value &&
          value.constructor === Object &&
          Object.values(value)?.some(
            (courses) => Array.isArray(courses) && courses.length > 0,
          )
        ) {
          level2Refs[key] = {
            current: null,
          }

          for (const language of Object.keys(value)) {
            level3Refs[language] = {
              current: null,
            }
          }
        }
      }
    }

    // New Programs
    if (Array?.isArray(latest6Programs) && latest6Programs?.length > 0) {
      level2Refs['new-programs'] = {
        current: null,
      }
    }

    return { level2Refs, level3Refs }
  }, [programsGroupedBy, latest6Programs])

  useEffect(() => {
    if (initRef.current) {
      initRef.current = false
      return
    }

    // (about sideBarMenuRef tabindex --- make it focusable only when we're on the first level. )
    if (!target1) {
      sideBarMenuRef.current?.setAttribute('tabindex', '-1')
      setTimeout(() => {
        sideBarMenuRef.current?.focus()
      }, 150)
    } else if (target1 && !target2) {
      sideBarMenuRef.current?.removeAttribute('tabindex')
      setTimeout(() => {
        focusRefs?.level2Refs[target1]?.current?.focus()
      }, 150)
    } else if (target1 && target2) {
      sideBarMenuRef.current?.removeAttribute('tabindex')
      setTimeout(() => {
        focusRefs?.level3Refs[target2]?.current?.focus()
      }, 150)
    }
  }, [
    target1,
    target2,
    focusRefs?.level2Refs,
    focusRefs?.level3Refs,
    sideBarMenuRef,
  ])

  let contentNewPrograms, contentCourseEventKids

  // New Programs
  if (Array?.isArray(latest6Programs) && latest6Programs?.length > 0) {
    contentNewPrograms = (
      <Fragment>
        {/* Level 1 - Title New Programs */}
        <li
          className='text-theme-brown'
          role='none'
          inert={target1 ? (target1 === 'new-programs' ? false : true) : false}
        >
          <button
            className='active:bg-gold-2/25 flex w-full cursor-pointer items-center justify-between rounded-3xl px-5'
            onClick={() => setTarget1('new-programs')}
            role='menuitem'
            aria-haspopup='true'
            aria-expanded={target1 === 'new-programs'}
            inert={!!target1}
          >
            <span>New Programs</span>
            <ChevronRightIcon className='w-4 stroke-3' />
          </button>
          {/* Level 2 - Programs */}
          <div
            className={clsx(
              `pointer-events-none invisible absolute top-0 left-full size-full opacity-0 transition-all duration-150 ease-in-out`,
              target1 === 'new-programs'
                ? 'group-[.open]/1:pointer-events-auto group-[.open]/1:visible group-[.open]/1:opacity-100'
                : '',
            )}
          >
            <div className='border-b-dusty-rose border-b-solid flex items-center justify-center gap-3 border-b-1 px-5 pt-6 pb-4 sm:max-lg:pb-7'>
              <button
                className='active:bg-gold-2/25 -ml-3 cursor-pointer rounded-3xl p-3'
                onClick={(e) => {
                  e.stopPropagation()
                  setTarget1(null)
                }}
              >
                <ChevronLeftIcon className='w-4 stroke-3' />
                <span className='sr-only'>Back to navigation main menu</span>
              </button>
              <h4
                ref={focusRefs?.level2Refs['new-programs']}
                className='font-nunito mr-auto text-2xl font-bold sm:max-lg:text-3xl'
                tabIndex={-1}
              >
                New Programs
              </h4>
            </div>
            <ul className='pt-4' role='menu' aria-label='new programs menu'>
              {latest6Programs.map(({ id, name }) => (
                <li className='text-theme-brown' key={id} role='none'>
                  <Link
                    className={clsx(
                      'inline-block size-full rounded-3xl px-5',
                      pathForSideBar === `/program/${id}` && 'bg-gold-2/25',
                    )}
                    href={`/program/${id}`}
                    onClick={() => setPathForSideBar(`/program/${id}`)}
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

  // Course Event Kids
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
                className='text-theme-brown'
                role='none'
                inert={target1 ? (target1 === key ? false : true) : false}
              >
                <button
                  className='active:bg-gold-2/25 flex w-full cursor-pointer items-center justify-between rounded-3xl px-5'
                  onClick={() => setTarget1(key)}
                  role='menuitem'
                  aria-haspopup='true'
                  aria-expanded={target1 === key}
                  inert={!!target1}
                >
                  <span>{key}</span>
                  <ChevronRightIcon className='w-4 stroke-3' />
                </button>
                {/* Level 2 - Events */}
                <div
                  className={clsx(
                    `pointer-events-none invisible absolute top-0 left-full size-full opacity-0 transition-all duration-150 ease-in-out`,
                    target1 === key
                      ? 'group-[.open]/1:pointer-events-auto group-[.open]/1:visible group-[.open]/1:opacity-100'
                      : '',
                  )}
                >
                  <div className='border-b-dusty-rose border-b-solid flex items-center justify-center gap-3 border-b-1 px-5 pt-6 pb-4 sm:max-lg:pb-7'>
                    <button
                      className='active:bg-gold-2/25 -ml-3 cursor-pointer rounded-3xl p-3'
                      onClick={(e) => {
                        e.stopPropagation()
                        setTarget1(null)
                      }}
                    >
                      <ChevronLeftIcon className='w-4 stroke-3' />
                      <span className='sr-only'>
                        Back to navigation main menu
                      </span>
                    </button>
                    <h4
                      ref={focusRefs?.level2Refs[key]}
                      className='font-nunito mr-auto text-2xl font-bold sm:max-lg:text-3xl'
                      tabIndex={-1}
                    >
                      {key}
                    </h4>
                  </div>
                  <ul className='pt-4' role='menu' aria-label={`${key} menu`}>
                    {value.map(({ program_id: id, program_name: name }) => (
                      <li className='text-theme-brown' key={id} role='none'>
                        <Link
                          className={clsx(
                            'inline-block size-full rounded-3xl px-5',
                            pathForSideBar === `/program/${id}` &&
                              'bg-gold-2/25',
                          )}
                          href={`/program/${id}`}
                          onClick={() => setPathForSideBar(`/program/${id}`)}
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
                className='text-theme-brown'
                role='none'
                inert={target1 ? (target1 === key ? false : true) : false}
              >
                <button
                  className='active:bg-gold-2/25 flex w-full cursor-pointer items-center justify-between rounded-3xl px-5'
                  onClick={() => setTarget1(key)}
                  role='menuitem'
                  aria-haspopup='true'
                  aria-expanded={target1 === key}
                  inert={!!target1}
                >
                  <span>{key}</span>
                  <ChevronRightIcon className='w-4 stroke-3' />
                </button>
                {/* Level 2 - Languages */}
                <div
                  className={clsx(
                    `group/2 pointer-events-none invisible absolute top-0 left-full size-full opacity-0 transition-all duration-150 ease-in-out`,
                    target1 === key
                      ? 'group-[.open]/1:pointer-events-auto group-[.open]/1:visible group-[.open]/1:opacity-100'
                      : '',
                    target2
                      ? 'open -translate-x-full opacity-0 transition-opacity duration-150 ease-in-out'
                      : '',
                  )}
                >
                  <div
                    className='border-b-dusty-rose border-b-solid flex items-center justify-center gap-3 border-b-1 px-5 pt-6 pb-4 sm:max-lg:pb-7'
                    inert={!!target2}
                  >
                    <button
                      className='active:bg-gold-2/25 -ml-3 cursor-pointer rounded-3xl p-3'
                      onClick={(e) => {
                        e.stopPropagation()
                        setTarget1(null)
                      }}
                    >
                      <ChevronLeftIcon className='w-4 stroke-3' />
                      <span className='sr-only'>
                        Back to navigation main menu
                      </span>
                    </button>
                    <h4
                      ref={focusRefs?.level2Refs[key]}
                      className='font-nunito mr-auto text-2xl font-bold sm:max-lg:text-3xl'
                      tabIndex={target2 ? undefined : -1}
                    >
                      {key}
                    </h4>
                  </div>
                  <ul className='pt-4' role='menu' aria-label={`${key} menu`}>
                    {Object.entries(value).map(([language, courses]) => {
                      if (
                        language &&
                        Array.isArray(courses) &&
                        courses.length > 0
                      ) {
                        return (
                          <li
                            className='text-theme-brown'
                            key={language}
                            role='none'
                            inert={
                              target2
                                ? target2 === language
                                  ? false
                                  : true
                                : false
                            }
                          >
                            <button
                              className='active:bg-gold-2/25 flex w-full cursor-pointer items-center justify-between rounded-3xl px-5'
                              onClick={(e) => {
                                e.stopPropagation()
                                setTarget2(language)
                              }}
                              role='menuitem'
                              aria-haspopup='true'
                              aria-expanded={target2 === language}
                              inert={!!target2}
                            >
                              <span>{language}</span>
                              <ChevronRightIcon className='w-4 stroke-3' />
                            </button>
                            {/* Level 3 - Courses */}
                            <div
                              className={clsx(
                                'pointer-events-none invisible absolute top-0 left-full size-full opacity-0 transition-all duration-150 ease-in-out',
                                target2 === language
                                  ? 'group-[.open]/2:pointer-events-auto group-[.open]/2:visible group-[.open]/2:opacity-100'
                                  : '',
                              )}
                            >
                              <div className='border-b-dusty-rose border-b-solid flex items-center justify-center gap-3 border-b-1 px-5 pt-6 pb-4 sm:max-lg:pb-7'>
                                <button
                                  className='active:bg-gold-2/25 -ml-3 cursor-pointer rounded-3xl p-3'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setTarget2(null)
                                  }}
                                >
                                  <ChevronLeftIcon className='w-4 stroke-3' />
                                  <span className='sr-only'>{`Back to ${key} menu`}</span>
                                </button>
                                <h4
                                  ref={focusRefs?.level3Refs[language]}
                                  className='font-nunito mr-auto text-2xl font-bold sm:max-lg:text-3xl'
                                  tabIndex={-1}
                                >
                                  {language}
                                </h4>
                              </div>
                              <ul
                                className='pt-4'
                                role='menu'
                                aria-label={`${language} menu`}
                              >
                                {courses.map(
                                  ({ program_id: id, program_name: name }) => (
                                    <li
                                      className='text-theme-brown'
                                      key={id}
                                      role='none'
                                    >
                                      <Link
                                        className={clsx(
                                          'inline-block size-full rounded-3xl px-5',
                                          pathForSideBar === `/program/${id}` &&
                                            'bg-gold-2/25',
                                        )}
                                        href={`/program/${id}`}
                                        onClick={() =>
                                          setPathForSideBar(`/program/${id}`)
                                        }
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
      <div className='relative mt-[15%]'>
        <nav
          className={clsx(
            `group/1 pointer-events-auto visible opacity-100 transition-all duration-150 ease-in-out`,
            target1
              ? 'open -translate-x-full opacity-0 transition-opacity duration-150 ease-in-out'
              : '',
          )}
        >
          <ul
            className='font-fredoka'
            role='menu'
            aria-label='navigation main menu'
          >
            <li className='text-theme-brown' role='none' inert={!!target1}>
              <Link
                className={clsx(
                  'inline-block size-full rounded-3xl px-5',
                  pathForSideBar === '/about-us' && 'bg-gold-2/25',
                )}
                href='/about-us'
                onClick={() => setPathForSideBar('/about-us')}
                role='menuitem'
              >
                About Us
              </Link>
            </li>
            {contentNewPrograms}
            {contentCourseEventKids}
            {!isSignedIn && (
              <li
                className='text-theme-brown'
                onClick={() => setPathForSideBar('sign-in')}
                role='none'
                inert={!!target1}
              >
                <SignInLink
                  className={clsx(
                    'inline-block size-full rounded-3xl px-5',
                    pathForSideBar === 'sign-in' && 'bg-gold-2/25',
                  )}
                  role='menuitem'
                />
              </li>
            )}
            {isSignedIn && isStudent && (
              <li className='text-theme-brown' role='none' inert={!!target1}>
                <Link
                  className={clsx(
                    'inline-block size-full rounded-3xl px-5',
                    pathForSideBar === '/my-programs' && 'bg-gold-2/25',
                  )}
                  href='/my-programs'
                  onClick={() => setPathForSideBar('/my-programs')}
                  role='menuitem'
                >
                  My Programs
                </Link>
              </li>
            )}
            {isSignedIn && (
              <li
                className='text-theme-brown'
                onClick={() => setPathForSideBar('sign-out')}
                role='none'
                inert={!!target1}
              >
                <Button
                  className={clsx(
                    'size-full rounded-3xl px-5',
                    pathForSideBar === 'sign-out' && 'bg-gold-2/25',
                  )}
                  onClick={() => signOut()}
                  role='menuitem'
                >
                  <div className='text-left'>Sign Out</div>
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    )
  }
}

export default SideBar
