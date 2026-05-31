'use client'

import { useRef, useEffect, useId } from 'react'
import clsx from 'clsx'
import Overlay from '../overlay'
import Popup from '../popup'
import { XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import ToggleThemeBtn from '../toggleThemeBtn'
import useMobileSizeDetector from '@/app/lib/hooks/useMobileSizeDetector'
import { isTopDialog, popDialog, pushDialog } from '@/app/lib/utils'

interface BurgerWrapperProps {
  bgColor: string
  xIconColor: string
  iconPath: string
  isClicked: boolean
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
  switchableTheme?: boolean
  sideBarMenuRef?: React.RefObject<HTMLDivElement | null>
}

const elementsToBeInert = [
  'main',
  'dashboard-main',
  'wave',
  'header-logo',
  'dashboard-header-logo',
  'topbar',
  'cart-button',
  'skip-to-content',
  'burger-btn',
]

const BurgerWrapper = ({
  bgColor,
  xIconColor,
  iconPath,
  isClicked,
  setIsClicked,
  children,
  switchableTheme = false,
  sideBarMenuRef,
}: BurgerWrapperProps) => {
  const toggleDialogBtnRef = useRef<HTMLButtonElement>(null)

  const initRef1 = useRef<boolean>(true)
  const initRef2 = useRef<boolean>(true)

  const { isMobileSize } = useMobileSizeDetector(1024)

  const id = useId()

  // (Accessibility)
  // (So Esc key can close sideBar.)
  useEffect(() => {
    if (!isClicked) return

    pushDialog(id)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopDialog(id)) {
        setIsClicked(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      popDialog(id)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isClicked, setIsClicked, id])

  // (Accessibility)
  // (So items under overlay are not tabbable.)
  useEffect(() => {
    if (initRef1.current) {
      initRef1.current = false
      return
    }

    if (isClicked) {
      elementsToBeInert.forEach((id) => {
        document.getElementById(id)?.setAttribute('inert', '')
      })
      // (So sideBar content will be announced automatically by screen reader when sideBar opens)
      // (setTimeout - to wait for the animation and scrollbar)
      setTimeout(() => {
        sideBarMenuRef?.current?.focus()
      }, 150)

      // (added isMobileSize for not running this when ###1 closes the sideBar when switching to Desk, ###1 already runs the inert reverting.)
    } else if (!isClicked && isMobileSize) {
      elementsToBeInert.forEach((id) => {
        document.getElementById(id)?.removeAttribute('inert')
      })
      // (So the sideBar toggle btn will be focused after sideBar is closed)
      // (setTimeout - to wait for the animation and scrollbar)
      setTimeout(() => {
        toggleDialogBtnRef.current?.focus()
      }, 150)
    }
  }, [isClicked, isMobileSize, sideBarMenuRef])

  // (###1)
  // (Accessibility)
  // (Because we set every other elements inert when sideBar opened, if we change viewport to >= 1024 without reverting the inert and closing the sideBar, the sideBar will be switched to topBar but those elements will still be inert and sideBar still be open.)
  useEffect(() => {
    if (initRef2.current) {
      initRef2.current = false
      return
    }

    if (!isMobileSize) {
      elementsToBeInert.forEach((id) => {
        document.getElementById(id)?.removeAttribute('inert')
      })

      setIsClicked(false)
    }
  }, [isMobileSize, setIsClicked])

  return (
    <>
      <button
        id='burger-btn'
        ref={toggleDialogBtnRef}
        className='cursor-pointer lg:hidden'
        onClick={() => setIsClicked((prev) => !prev)}
        aria-haspopup='dialog'
        aria-expanded={isClicked}
      >
        <img className='size-7' src={iconPath} alt='Menu' />
      </button>

      <Overlay
        className={clsx(
          'bg-[#020f12]/30 transition-all duration-300 lg:hidden',
          isClicked
            ? 'pointer-events-auto visible opacity-100'
            : 'pointer-events-none invisible opacity-0',
        )}
        onClick={() => setIsClicked(false)}
        aria-hidden='true'
      />

      <Popup
        // id='sidebar-popup'
        ref={sideBarMenuRef}
        className={clsx(
          'border-dusty-rose/30 shadow-1 fixed top-0 left-0 z-1001 h-full w-30/100 min-w-[280px] overflow-hidden rounded-r-4xl border-1 border-solid py-8 text-xl leading-12 transition-all duration-300 sm:max-lg:w-40/100 sm:max-lg:text-2xl sm:max-lg:leading-15 lg:hidden',
          isClicked
            ? 'pointer-events-auto visible translate-x-0'
            : 'pointer-events-none invisible -translate-x-full',
          bgColor,
        )}
        inert={!isClicked}
        role='dialog'
        tabIndex={-1}
        aria-modal='true'
        aria-label='Menu'
      >
        {switchableTheme && (
          <ToggleThemeBtn
            className_btn='absolute w-6 top-4 right-13.5'
            className_moon='text-white'
          />
        )}
        <button
          className='absolute top-4 right-4 w-6 cursor-pointer'
          onClick={() => setIsClicked(false)}
        >
          <XCircleIcon className={xIconColor} />
          <span className='sr-only'>Close Menu</span>
        </button>

        {children}

        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-[40%]'>
          <Link href='/' aria-label='go to viva languages home page'>
            <img src='/Logo_round_best.svg' alt='Logo' />
          </Link>
        </div>
      </Popup>
    </>
  )
}

export default BurgerWrapper
