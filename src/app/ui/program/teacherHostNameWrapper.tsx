'use client'

import { JSX, useState, useRef, useEffect, useId } from 'react'
import TeacherHostName from './teacherHostName'
import { Fragment } from 'react'
import {
  HostType,
  TeacherHostProfileType,
  TeacherType,
} from '@/app/lib/definitions'
import Overlay from '../overlay'
import clsx from 'clsx'
import { XCircleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import useMobileSizeDetector from '@/app/lib/hooks/useMobileSizeDetector'
import { isTopDialog, popDialog, pushDialog } from '@/app/lib/utils'

// Profile Images of each teacher and host
// (Because the images ratio are not unified, so we don't do it dynamically.)
type ProfileVariantsType = {
  id: string
  imageJSX: JSX.Element
  translate_X_text_1: string
  translate_X_text_2: string
}
const profileVariants: Record<string, ProfileVariantsType> = {
  '66357790-b53b-42a1-bef2-ad05dbf6c82d': {
    id: '66357790-b53b-42a1-bef2-ad05dbf6c82d',
    imageJSX: (
      <Image
        src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830012/Raoul_Bova_yehodk.jpg'
        alt='Profile Photo of Teacher Raoul Bova'
        width={3023}
        height={3023}
      />
    ),
    translate_X_text_1: 'translate-x-[-10px]',
    translate_X_text_2: 'translate-x-[-17px]',
  },
  '2f383a6d-cddf-4c76-9a90-d84d33a18f35': {
    id: '2f383a6d-cddf-4c76-9a90-d84d33a18f35',
    imageJSX: (
      <Image
        src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830012/Raoul_Bova_yehodk.jpg'
        alt='Profile Photo of Teacher Raoul Bova'
        width={3023}
        height={3023}
      />
    ),
    translate_X_text_1: 'translate-x-[-10px]',
    translate_X_text_2: 'translate-x-[-17px]',
  },
  '3d8eecab-0526-4313-80b4-f0cb362a1247': {
    id: '3d8eecab-0526-4313-80b4-f0cb362a1247',
    imageJSX: (
      <Image
        className='object-cover'
        src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830009/Marion_Cotillard_wlvyz3.jpg'
        alt='Profile Photo of Teacher Marion Cotillard'
        // width={3872}
        // height={2592}
        fill
        sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
      />
    ),
    translate_X_text_1: 'translate-x-[-25px]',
    translate_X_text_2: 'translate-x-[-45px]',
  },
  '676db069-f27a-44c7-8513-6495268c600c': {
    id: '676db069-f27a-44c7-8513-6495268c600c',
    imageJSX: (
      <Image
        className='object-cover'
        src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830009/Marion_Cotillard_wlvyz3.jpg'
        alt='Profile Photo of Teacher Marion Cotillard'
        // width={3872}
        // height={2592}
        fill
        sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
      />
    ),
    translate_X_text_1: 'translate-x-[-25px]',
    translate_X_text_2: 'translate-x-[-45px]',
  },
  '2310e49d-e85b-47bb-bf64-de59aad00989': {
    id: '2310e49d-e85b-47bb-bf64-de59aad00989',
    imageJSX: (
      <Image
        className='object-cover'
        src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830008/G%C3%A9rard_Depardieu_uyaas6.jpg'
        alt='Profile Photo of Teacher Gérard Depardieu'
        // width={5292}
        // height={4142}
        fill
        sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
      />
    ),
    translate_X_text_1: 'translate-x-[-30px]',
    translate_X_text_2: 'translate-x-[-55px]',
  },
  '75add3c2-4130-4331-b894-7177e1c61f77': {
    id: '75add3c2-4130-4331-b894-7177e1c61f77',
    imageJSX: (
      <Image
        className='object-cover'
        src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830008/G%C3%A9rard_Depardieu_uyaas6.jpg'
        alt='Profile Photo of Teacher Gérard Depardieu'
        // width={5292}
        // height={4142}
        fill
        sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
      />
    ),
    translate_X_text_1: 'translate-x-[-30px]',
    translate_X_text_2: 'translate-x-[-55px]',
  },
  '6505e54c-3ca7-4d5e-af57-9041c10f6a4e': {
    id: '6505e54c-3ca7-4d5e-af57-9041c10f6a4e',
    imageJSX: (
      <Image
        className='object-cover object-left'
        src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830025/Pen%C3%A9lope_Cruz_xxksj3.jpg'
        alt='Profile Photo of Teacher Penélope Cruz'
        // width={6016}
        // height={4016}
        fill
        sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
      />
    ),
    translate_X_text_1: 'translate-x-[15px]',
    translate_X_text_2: 'translate-x-[-35px]',
  },
  'e8c8c5c7-c10d-40a7-ad69-eae20e1ecd00': {
    id: 'e8c8c5c7-c10d-40a7-ad69-eae20e1ecd00',
    imageJSX: (
      <Image
        className='object-cover object-left'
        src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830025/Pen%C3%A9lope_Cruz_xxksj3.jpg'
        alt='Profile Photo of Teacher Penélope Cruz'
        // width={6016}
        // height={4016}
        fill
        sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
      />
    ),
    translate_X_text_1: 'translate-x-[15px]',
    translate_X_text_2: 'translate-x-[-35px]',
  },
}

interface TeacherHostNameWrapperProps {
  teachers: TeacherType[]
  hosts: HostType[]
}

export default function TeacherHostNameWrapper({
  teachers,
  hosts,
}: TeacherHostNameWrapperProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [profileData, setProfileData] = useState<TeacherHostProfileType | null>(
    null,
  )

  const toggleCardBtnRef = useRef<HTMLButtonElement>(null)

  const figureRef = useRef<HTMLElement>(null)

  const initRef = useRef<boolean>(true)

  const { isMobileSize } = useMobileSizeDetector(1024)

  const id = useId()

  // (Accessibility)
  // (So Esc key can close card.)
  useEffect(() => {
    if (!isOpen) return

    pushDialog(id)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopDialog(id)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      popDialog(id)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, id])

  // (Accessibility)
  // (So items under overlay are not tabbable.)
  useEffect(() => {
    if (initRef.current) {
      initRef.current = false
      return
    }

    const footer = document.getElementById('wave')
    const teacherHostNameBtn = document.getElementById('teacher-host-name-btn')
    const programNumBarWrapper = document.getElementById(
      'program-num-bar-wrapper',
    )
    // (only Events have programNumBar)
    const programNumBar = document.getElementById('program-num-bar')
    const skipToContent = document.getElementById('skip-to-content')
    const header = document.getElementById('header')
    const main = document.getElementById('main')

    // (separated Desk and Mob here because in Desk mode we want to be able to access Header when the profile card is open; but not in Mob mode.)
    if (isMobileSize) {
      if (isOpen) {
        footer?.setAttribute('inert', '')
        teacherHostNameBtn?.setAttribute('inert', '')
        programNumBarWrapper?.setAttribute('inert', '')
        programNumBar?.setAttribute('inert', '')
        skipToContent?.setAttribute('inert', '')
        header?.setAttribute('inert', '')
        main?.removeAttribute('tabindex')
        // (So card will be announced automatically by screen reader when opens)
        // (setTimeout - to wait for the animation and scrollbar)
        setTimeout(() => {
          figureRef.current?.focus()
        }, 150)
      } else {
        footer?.removeAttribute('inert')
        teacherHostNameBtn?.removeAttribute('inert')
        programNumBarWrapper?.removeAttribute('inert')
        programNumBar?.removeAttribute('inert')
        skipToContent?.removeAttribute('inert')
        header?.removeAttribute('inert')
        main?.setAttribute('tabindex', '-1')
        // (So the card toggle btn will be focused after card is closed)
        // (setTimeout - to wait for the animation and scrollbar)
        setTimeout(() => {
          toggleCardBtnRef.current?.focus()
        }, 150)
      }
    } else {
      if (isOpen) {
        footer?.setAttribute('inert', '')
        teacherHostNameBtn?.setAttribute('inert', '')
        programNumBarWrapper?.setAttribute('inert', '')
        programNumBar?.setAttribute('inert', '')
        skipToContent?.setAttribute('inert', '')
        header?.removeAttribute('inert')
        main?.removeAttribute('tabindex')
        // (So card will be announced automatically by screen reader when opens)
        // (setTimeout - to wait for the animation and scrollbar)
        setTimeout(() => {
          figureRef.current?.focus()
        }, 150)
      } else {
        footer?.removeAttribute('inert')
        teacherHostNameBtn?.removeAttribute('inert')
        programNumBarWrapper?.removeAttribute('inert')
        programNumBar?.removeAttribute('inert')
        skipToContent?.removeAttribute('inert')
        main?.setAttribute('tabindex', '-1')
        // (So the card toggle btn will be focused after card is closed)
        // (setTimeout - to wait for the animation and scrollbar)
        setTimeout(() => {
          toggleCardBtnRef.current?.focus()
        }, 150)
      }
    }

    // (cleanup fn to reverse inert and tabindex settings; so that when url changes, e.g. by pressing Back btn, hence this component unmounts, the settings will be reverted.)
    return () => {
      footer?.removeAttribute('inert')
      teacherHostNameBtn?.removeAttribute('inert')
      programNumBarWrapper?.removeAttribute('inert')
      programNumBar?.removeAttribute('inert')
      skipToContent?.removeAttribute('inert')
      header?.removeAttribute('inert')
      main?.setAttribute('tabindex', '-1')
    }
  }, [isOpen, isMobileSize])

  const handleTeacherHostNameClick = async (type: string, id: string) => {
    try {
      const res = await fetch(`/api/${type}/${id}`)

      if (!res.ok) throw new Error('Failed to fetch profile')

      const data = await res.json()

      setProfileData(data)
      setIsOpen(true)
    } catch (error) {
      console.error(error)
    }
  }

  let contentOverlayAndDialog

  if (profileData) {
    contentOverlayAndDialog = (
      <>
        <Overlay
          className={clsx(
            'transition-all duration-300 lg:!z-996 [@media(min-width:1024px)_and_(orientation:portrait)]:!z-1000',
            isOpen
              ? 'pointer-events-auto visible opacity-100'
              : 'pointer-events-none invisible opacity-0',
          )}
          onClick={() => setIsOpen(false)}
          aria-hidden='true'
        />

        <figure
          ref={figureRef}
          className={clsx(
            'font-nunito bg-overall-bg fixed top-1/2 right-1/2 z-1001 grid h-[70vh] max-h-[650px] min-h-[537px] w-[327px] translate-x-1/2 -translate-y-1/2 grid-rows-[auto_minmax(0,_1fr)] gap-15 overflow-hidden rounded-2xl pb-5.5 shadow-[var(--shadow-2)] transition-all duration-300 lg:absolute lg:top-[-150%] lg:-right-20 lg:z-997 lg:h-[75vh] lg:min-h-auto lg:translate-x-0 lg:translate-y-0 lg:shadow-[var(--shadow-1)] [@media(min-width:1024px)_and_(orientation:portrait)]:fixed [@media(min-width:1024px)_and_(orientation:portrait)]:top-1/2 [@media(min-width:1024px)_and_(orientation:portrait)]:right-1/2 [@media(min-width:1024px)_and_(orientation:portrait)]:z-1001 [@media(min-width:1024px)_and_(orientation:portrait)]:translate-x-1/2 [@media(min-width:1024px)_and_(orientation:portrait)]:-translate-y-1/2 [@media(min-width:1024px)_and_(orientation:portrait)]:shadow-[var(--shadow-2)]',
            isOpen
              ? 'pointer-events-auto visible'
              : 'pointer-events-none invisible',
          )}
          role='dialog'
          tabIndex={-1}
          aria-modal='true'
          aria-label='teacher or host profile'
        >
          <button
            className='absolute top-4 right-4 z-1002 w-6 cursor-pointer lg:z-998 [@media(min-width:1024px)_and_(orientation:portrait)]:z-1002'
            onClick={() => setIsOpen(false)}
          >
            <XCircleIcon className='stroke-[#6b6b6b]/50' />
            <span className='sr-only'>Close profile</span>
          </button>

          {/* (SVG colored shape) */}
          <div
            style={{ backgroundColor: profileData.color_1 }}
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              className='absolute bottom-[-60px] left-0 z-1'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                fill={profileData.color_1}
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              ></path>
            </svg>
          </div>
          {/* (SVG curved text 1) */}
          <div
            className={`absolute top-0 left-0 z-0 flex h-[213.328px] w-full translate-y-[20px] flex-col justify-end ${profileVariants[profileData.id].translate_X_text_1}`}
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='svg-path-1'
                fill='transparent'
                fillOpacity='1'
                d='M0,96 L1440,96 L1440,0 L0,0 Z'
              />
              <text
                // opacity='0'
                width='100%'
                // fontSize='110px'
                className='text-[116px]'
                fill={profileData.color_2}
                // style={{
                //   transform: 'translate3d(0, 0, 0)',
                // }}
              >
                <textPath
                  // style={{
                  //   transform: 'translate3d(0, 0, 0)',
                  // }}
                  href='#svg-path-1'
                  startOffset='800px'
                >
                  {profileData.name.split(' ')[1]}
                </textPath>
              </text>
            </svg>
          </div>
          {/* (SVG curved text 2) */}
          <div
            className={`absolute top-0 left-0 z-0 flex h-[213.328px] w-full translate-y-[20px] flex-col justify-end ${profileVariants[profileData.id].translate_X_text_2}`}
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='svg-path-2'
                fill='transparent'
                fillOpacity='1'
                d='M0,96 L1440,96 L1440,0 L0,0 Z'
              />
              <text
                // opacity='0'
                width='100%'
                // fontSize='110px'
                className='text-[116px]'
                fill={profileData.color_2}
                // style={{
                //   transform: 'translate3d(0, 0, 0)',
                // }}
              >
                <textPath
                  href='#svg-path-2'
                  // style={{
                  //   transform: 'translate3d(0, 0, 0)',
                  // }}
                  startOffset='500px'
                >
                  {profileData.name.split(' ')[0]}
                </textPath>
              </text>
            </svg>
          </div>
          <div className='flex w-full justify-center'>
            <div className='relative z-1 mt-6 size-45 overflow-hidden rounded-full'>
              {profileVariants[profileData.id].imageJSX}
            </div>
          </div>
          <div className='relative z-1 flex h-full items-center justify-center text-left'>
            <blockquote className='max-h-full overflow-y-auto px-6 text-lg text-[#6b6b6b]'>
              {profileData.bio}
            </blockquote>
          </div>
        </figure>
      </>
    )
  }

  return (
    <>
      {contentOverlayAndDialog}

      {teachers?.length > 0
        ? teachers.map(
            (teacher: TeacherType, i: number, arr: TeacherType[]) => {
              if (i < arr.length - 1) {
                return (
                  <Fragment key={teacher.id}>
                    <TeacherHostName
                      id={teacher.id}
                      type='teacher'
                      name={teacher.name}
                      isOpen={isOpen}
                      handleClick={handleTeacherHostNameClick}
                      toggleCardBtnRef={toggleCardBtnRef}
                    />
                    <span className='mx-1'>&#124;</span>
                  </Fragment>
                )
              } else {
                return (
                  <TeacherHostName
                    key={teacher.id}
                    id={teacher.id}
                    type='teacher'
                    name={teacher.name}
                    isOpen={isOpen}
                    handleClick={handleTeacherHostNameClick}
                    toggleCardBtnRef={toggleCardBtnRef}
                  />
                )
              }
            },
          )
        : hosts?.length > 0 &&
          hosts.map((host: HostType, i: number, arr: HostType[]) => {
            if (i < arr.length - 1) {
              return (
                <Fragment key={host.id}>
                  <TeacherHostName
                    id={host.id}
                    type='host'
                    name={host.name}
                    isOpen={isOpen}
                    handleClick={handleTeacherHostNameClick}
                    toggleCardBtnRef={toggleCardBtnRef}
                  />
                  <span className='mx-1'>&#124;</span>
                </Fragment>
              )
            } else {
              return (
                <TeacherHostName
                  key={host.id}
                  id={host.id}
                  type='host'
                  name={host.name}
                  isOpen={isOpen}
                  handleClick={handleTeacherHostNameClick}
                  toggleCardBtnRef={toggleCardBtnRef}
                />
              )
            }
          })}
    </>
  )
}
