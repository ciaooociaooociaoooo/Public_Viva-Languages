'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import BurgerWrapper from './burgerWrapper'
import TopBar from './topBar'
import CartWrapper from '../cart/cartWrapper'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SideBar from './sideBar'
import { groupProgramsByCategoryAndLanguage } from '@/app/lib/utils'
import clsx from 'clsx'
import { CartResponseType, Latest6ProgramsType } from '@/app/lib/definitions'
import SkipToContent from '../skipToContent'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type HeaderProps = {
  isSignedIn: boolean
  isAdmin: boolean
  isStudent: boolean
  programsGroupedBy: ReturnType<typeof groupProgramsByCategoryAndLanguage>
  latest6Programs: Latest6ProgramsType[]
  cart: CartResponseType
}

const Header = ({
  isSignedIn,
  isAdmin,
  isStudent,
  programsGroupedBy,
  latest6Programs,
  cart,
}: HeaderProps) => {
  // (shadow for Header)
  useGSAP(() => {
    const docStyle = getComputedStyle(document.documentElement)
    const val = docStyle.getPropertyValue('--shadow-1')

    gsap.to('#header', {
      boxShadow: val,
      scrollTrigger: {
        trigger: '#header',
        start: 'bottom+=50 top',
        end: '+=150',
        scrub: true,
      },
    })

    ScrollTrigger.refresh()
  })
  // (End shadow for Header)

  const pathname = usePathname()

  const [isClicked, setIsClicked] = useState<boolean>(false)

  const sideBarMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isClicked) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth

      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isClicked])

  useEffect(() => {
    setIsClicked(false)
  }, [pathname])

  const isOnCheckoutPage = pathname.startsWith('/checkout')
  const isOnPaymentSuccessPage = pathname.startsWith('/payment-success')

  return (
    <header
      id='header'
      className={clsx(
        'sticky top-0 right-0 z-999 flex h-18 max-h-18 w-full items-center justify-between bg-(--color-theme-light-blue) sm:h-19 sm:max-h-19 lg:pl-5',
        isOnCheckoutPage || isOnPaymentSuccessPage
          ? 'pr-5 pl-2 lg:pr-4'
          : isSignedIn
            ? !isAdmin
              ? isStudent && cart?.items?.length > 0
                ? 'pr-5 pl-2 lg:pr-8'
                : 'pr-4 pl-2 lg:pr-7'
              : isAdmin && 'pr-4 pl-2 lg:pr-6'
            : cart?.items?.length > 0
              ? 'pr-5 pl-2 lg:pr-8'
              : 'pr-4 pl-2 lg:pr-7',
      )}
    >
      {/* (Accessibility) */}
      <SkipToContent />

      <Link id='header-logo' className='h-full' href='/'>
        <img
          className='h-full'
          src='/Logo_nobg_best.svg'
          alt='Viva Languages Logo'
        />
      </Link>

      <div className='flex h-full items-center gap-4 lg:gap-2'>
        <BurgerWrapper
          bgColor='bg-overall-bg'
          xIconColor='stroke-dusty-rose'
          iconPath={'/burger-simple-svgrepo-com.svg'}
          isClicked={isClicked}
          setIsClicked={setIsClicked}
          sideBarMenuRef={sideBarMenuRef}
        >
          <SideBar
            isSignedIn={isSignedIn}
            isAdmin={isAdmin}
            isStudent={isStudent}
            programsGroupedBy={programsGroupedBy}
            latest6Programs={latest6Programs}
            isClicked={isClicked}
            sideBarMenuRef={sideBarMenuRef}
          />
        </BurgerWrapper>

        <TopBar
          isSignedIn={isSignedIn}
          isAdmin={isAdmin}
          isStudent={isStudent}
          programsGroupedBy={programsGroupedBy}
          latest6Programs={latest6Programs}
        />

        {(!isSignedIn || (isSignedIn && isStudent)) && !isOnCheckoutPage && (
          <CartWrapper
            isSignedIn={isSignedIn}
            isStudent={isStudent}
            cart={cart}
          />
        )}

        {isSignedIn && isAdmin && (
          <div className='h-full content-center'>
            <span title='Admin Dashboard'>
              <Link href='/dashboard' aria-label='go to admin dashboard'>
                <img
                  className='h-1/2 cursor-pointer hover:scale-110'
                  src='/tools-svgrepo-com.svg'
                  alt='admin'
                />
              </Link>
            </span>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
