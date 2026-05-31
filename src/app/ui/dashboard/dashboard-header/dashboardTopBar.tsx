'use client'

import Link from 'next/link'
import Button from '../../button'
import { signOut } from 'next-auth/react'
import ToggleThemeBtn from '../../toggleThemeBtn'

const DashboardTopbar = () => {
  return (
    <div className='font-quicksand hidden h-full font-medium lg:block'>
      <nav className='h-full ease-in-out'>
        <ul
          className='text-dashboard-navbar-font flex h-full items-center text-center text-lg text-nowrap'
          role='menubar'
        >
          <li
            className='hover:text-gold-logo h-full cursor-pointer content-center'
            role='none'
          >
            <Link
              className='flex h-full items-center px-5'
              href='/dashboard'
              role='menuitem'
            >
              Dashboard
            </Link>
          </li>
          <li
            className='hover:text-gold-logo h-full cursor-pointer content-center'
            role='none'
          >
            <Link
              className='flex h-full items-center px-5'
              href='/dashboard/new-program'
              role='menuitem'
            >
              New Program
            </Link>
          </li>
          <li
            className='hover:text-gold-logo h-full cursor-pointer content-center'
            role='none'
          >
            <Link
              className='flex h-full items-center px-5'
              href='/dashboard/programs'
              role='menuitem'
            >
              Programs
            </Link>
          </li>
          <li
            className='hover:text-gold-logo h-full cursor-pointer content-center'
            role='none'
          >
            <Link
              className='flex h-full items-center px-5'
              href='/dashboard/users'
              role='menuitem'
            >
              Users
            </Link>
          </li>
          <li
            className='hover:text-gold-logo h-full cursor-pointer content-center'
            role='none'
          >
            <Link
              className='flex h-full items-center px-5'
              href='/dashboard/orders'
              role='menuitem'
            >
              Orders
            </Link>
          </li>
          <li
            className='hover:text-gold-logo h-full content-center'
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
          <li
            className='hover:text-gold-logo h-full content-center'
            role='none'
          >
            <ToggleThemeBtn
              className_btn='h-full px-3 w-13.5'
              role='menuitem'
            />
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default DashboardTopbar
