'use client'

import Link from 'next/link'
import { HomeIcon } from '@heroicons/react/24/outline'
import { signOut } from 'next-auth/react'

const DashboardSideBar = () => {
  return (
    <div className='bg-dashboard-navbar-bg mt-[15%]'>
      <nav>
        <ul
          className='font-quicksand text-dashboard-navbar-font font-medium'
          role='menu'
        >
          <li className='text-dashboard-navbar-font px-5' role='none'>
            <Link
              className='flex size-full items-center gap-2.5'
              href='/dashboard'
              role='menuitem'
            >
              <HomeIcon
                className='text-dashboard-navbar-icon w-6'
                aria-hidden
              />
              Dashboard
            </Link>
          </li>
          <li className='text-dashboard-navbar-font px-5' role='none'>
            <Link
              className='flex size-full items-center gap-2.5'
              href='/dashboard/new-program'
              role='menuitem'
            >
              <img
                className='w-6'
                src='/event-not-available-svgrepo-com.svg'
                alt='New Program icon'
                aria-hidden
              />
              New Program
            </Link>
          </li>
          <li className='text-dashboard-navbar-font px-5' role='none'>
            <Link
              className='flex size-full items-center gap-2.5'
              href='/dashboard/programs'
              role='menuitem'
            >
              <img
                className='w-6'
                src='/list-svgrepo-com.svg'
                alt='Programs icon'
                aria-hidden
              />
              Programs
            </Link>
          </li>
          <li className='text-dashboard-navbar-font px-5' role='none'>
            <Link
              className='flex size-full items-center gap-2.5'
              href='/dashboard/users'
              role='menuitem'
            >
              <img
                className='w-6'
                src='/students-student-svgrepo-com.svg'
                alt='Users icon'
                aria-hidden
              />
              Users
            </Link>
          </li>
          <li className='text-dashboard-navbar-font px-5' role='none'>
            <Link
              className='flex size-full items-center gap-2.5'
              href='/dashboard/orders'
              role='menuitem'
            >
              <img
                className='w-6'
                src='/carry-out-svgrepo-com.svg'
                alt='Orders icon'
                aria-hidden
              />
              Orders
            </Link>
          </li>
          <li className='text-dashboard-navbar-font px-5' role='none'>
            <button
              className='size-full cursor-pointer'
              onClick={() => signOut()}
              role='menuitem'
            >
              <div className='flex size-full items-center gap-2.5'>
                <img
                  className='inline-block w-6'
                  src='/logout-svgrepo-com.svg'
                  alt='Signout icon'
                  aria-hidden
                />
                <span>Sign Out</span>
              </div>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default DashboardSideBar
