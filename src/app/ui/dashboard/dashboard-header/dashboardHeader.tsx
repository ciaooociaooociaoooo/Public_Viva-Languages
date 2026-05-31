'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import BurgerWrapper from '../../header/burgerWrapper'
import DashboardSideBar from './dashboardSideBar'
import DashboardTopbar from './dashboardTopBar'
import SkipToContent from '../../skipToContent'

const DashboardHeader = () => {
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

  return (
    <header
      id='dashboard-header'
      className='bg-dashboard-navbar-bg sticky top-0 right-0 z-999 flex h-18 max-h-18 w-full items-center justify-between pr-7 pl-5 sm:h-19 sm:max-h-19 lg:pr-4'
    >
      {/* (Accessibility) */}
      <SkipToContent mode='admin' />

      <Link
        id='dashboard-header-logo'
        className='h-82/100'
        href='/'
        aria-label='go to viva languages home page'
      >
        <img className='h-full' src='/Logo_round_best.svg' alt='Logo' />
      </Link>

      <div className='flex h-full items-center gap-4 lg:gap-2'>
        <BurgerWrapper
          bgColor='bg-(--color-dashboard-navbar-bg)'
          xIconColor='stroke-dashboard-navbar-font'
          iconPath={'/burger-menu-svgrepo-com.svg'}
          isClicked={isClicked}
          setIsClicked={setIsClicked}
          switchableTheme={true}
          sideBarMenuRef={sideBarMenuRef}
        >
          <DashboardSideBar />
        </BurgerWrapper>

        <DashboardTopbar />
      </div>
    </header>
  )
}

export default DashboardHeader
