'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'

interface PaginationProps {
  totalPages: number
  currentPage: number
  limit: number
  dataCount: number
  currentPageItemsCount: number
  colorText?: string
  colorTextDisabled?: string
  bgInput?: string
}

export default function Pagination({
  totalPages,
  currentPage,
  limit,
  dataCount,
  currentPageItemsCount,
  colorText = 'text-dashboard-search-text',
  colorTextDisabled = 'text-dashboard-search-text/50',
  bgInput = 'bg-dashboard-search-bg/90',
}: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { push } = useRouter()

  const [goToPageValue, setGoToPageValue] = useState<string>(
    String(currentPage),
  )

  const [stateLimit, setStateLimit] = useState<string>(String(limit))

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)

    params.set('page', pageNumber.toString())

    return `${pathname}?${params.toString()}`
  }

  const inputPageURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageValue = e.target.value
    const params = new URLSearchParams(searchParams)

    // (When input is cleared or when input value is the current page.)
    if (pageValue === '' || pageValue === String(currentPage)) {
      setGoToPageValue(pageValue)
      return
    }

    let pageToSet: number | undefined
    const pageNumber = Number(pageValue)
    // (When input value is valid)
    if (
      Number.isFinite(pageNumber) &&
      pageNumber > 0 &&
      totalPages - pageNumber >= 0
    ) {
      pageToSet = pageNumber
    } else {
      // (When input value is greater than total page number.)
      if (pageNumber > totalPages) {
        // (And when current page is already the last page.)
        if (currentPage === totalPages) {
          setGoToPageValue(String(totalPages))
          return
        }

        pageToSet = totalPages
        // (When input value is less than 0.)
      } else if (pageNumber <= 0) {
        pageToSet = 1
      } else {
        return
      }
    }

    setGoToPageValue(String(pageToSet))

    // (debounce)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (pageToSet) {
        params.set('page', pageToSet.toString())
      } else {
        params.delete('page')
      }

      push(`${pathname}?${params.toString()}`)
    }, 1800)
  }

  useEffect(() => {
    setGoToPageValue(String(currentPage))
  }, [currentPage])

  useEffect(() => {
    setStateLimit(String(limit))
  }, [limit])

  const onBlurred = () => {
    if (goToPageValue === '') {
      setGoToPageValue(String(currentPage))
    }
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const limitValue = e.target.value
    const params = new URLSearchParams(searchParams)

    params.set('page', '1')

    if (limitValue) {
      setStateLimit(limitValue)
      params.set('limit', limitValue)
    } else {
      params.delete('limit')
    }

    push(`${pathname}?${params.toString()}`)
  }

  const prevPageBtn = (
    <Link
      className={clsx(
        (currentPage <= 1 || currentPage - totalPages > 1) &&
          `${colorTextDisabled} cursor-default`,
      )}
      href={createPageURL(currentPage - 1)}
      onClick={(e) => {
        const isDisabled = currentPage <= 1 || currentPage - totalPages > 1
        if (isDisabled) {
          e.preventDefault()
        }
      }}
      aria-label='previous page'
      aria-disabled={currentPage <= 1 || currentPage - totalPages > 1}
    >
      <ChevronLeftIcon className='w-5' />
    </Link>
  )

  const nextPageBtn = (
    <Link
      className={clsx(
        currentPage >= totalPages && `${colorTextDisabled} cursor-default`,
      )}
      href={createPageURL(currentPage + 1)}
      onClick={(e) => {
        const isDisabled = currentPage >= totalPages
        if (isDisabled) {
          e.preventDefault()
        }
      }}
      aria-label='next page'
      aria-disabled={currentPage >= totalPages}
    >
      <ChevronRightIcon className='w-5' />
    </Link>
  )

  const firstPageBtn = (
    <Link
      className={clsx(
        currentPage === 1 && `${colorTextDisabled} cursor-default`,
      )}
      href={createPageURL(1)}
      onClick={(e) => {
        const isDisabled = currentPage === 1
        if (isDisabled) {
          e.preventDefault()
        }
      }}
      aria-disabled={currentPage === 1}
    >
      First Page
    </Link>
  )

  const lastPageBtn = (
    <Link
      className={clsx(
        currentPage >= totalPages && `${colorTextDisabled} cursor-default`,
      )}
      href={createPageURL(totalPages)}
      onClick={(e) => {
        const isDisabled = currentPage >= totalPages
        if (isDisabled) {
          e.preventDefault()
        }
      }}
      aria-disabled={currentPage >= totalPages}
    >
      Last Page
    </Link>
  )

  // Middle Pages Btn
  let numPagesBtn = 5
  if (totalPages < 5) numPagesBtn = totalPages

  let startBtnIndex
  // Case 1: fewer total pages than buttons → start from 1
  if (totalPages <= numPagesBtn) {
    startBtnIndex = 1
    // Case 2: near the beginning
  } else if (currentPage <= 3) {
    startBtnIndex = 1
    // Case 3: near the end
  } else if (totalPages - currentPage < 2) {
    startBtnIndex = totalPages - numPagesBtn + 1
    // Case 4: middle
  } else {
    startBtnIndex = currentPage - 2
  }

  const middlePagesBtn = [...Array(numPagesBtn)].map((_, i) => {
    const pageNumber = startBtnIndex + i
    const isCurrentPage = pageNumber === currentPage

    return (
      <Link
        key={pageNumber}
        className={clsx(
          isCurrentPage &&
            'border-b-solid cursor-default border-b-1 border-current text-xl font-medium lg:text-2xl',
        )}
        href={createPageURL(pageNumber)}
        onClick={(e) => {
          if (isCurrentPage) {
            e.preventDefault()
          }
        }}
        aria-label={`page ${pageNumber} ${isCurrentPage ? ', current page' : ''}`}
      >
        {pageNumber}
      </Link>
    )
  })
  // End Middle Pages Btn

  // Range
  let firstElement = (currentPage - 1) * limit + 1
  let lastElement = (currentPage - 1) * limit + currentPageItemsCount
  let range = `${firstElement} - ${lastElement}`
  const count = dataCount

  if (currentPageItemsCount === 0) {
    firstElement = 0
    lastElement = 0
    range = '0'
  }

  const rangeContent = (
    <>
      <p className='text-right'>
        {range} of <span className='sr-only'>total </span>
        {count} items<span className='sr-only'> are displayed</span>
      </p>

      <p className='text-right'>
        {totalPages} pages<span className='sr-only'> in total</span>
      </p>
    </>
  )
  // End Range

  // Go To Page
  const goToPage = (n: number) => (
    <div>
      <label htmlFor={`go-to-page-${n}`}>Go To Page: </label>
      <input
        className={`${bgInput} ml-1 w-10 rounded-md text-center`}
        type='number'
        id={`go-to-page-${n}`}
        name='go-to-page'
        value={goToPageValue}
        onChange={inputPageURL}
        onWheel={(e) => (e.target as HTMLElement).blur()}
        onBlur={onBlurred}
      />
    </div>
  )
  // End Go To Page

  const limitContent = (
    <select
      className={`${bgInput} rounded-md px-1 text-center`}
      name='limit'
      value={stateLimit}
      onChange={handleLimitChange}
      aria-label='select number of items to display'
    >
      <option value='5'>5</option>
      <option value='10'>10</option>
      <option value='15'>15</option>
      <option value='20'>20</option>
    </select>
  )

  return (
    <div
      id='pagination'
      className={`${colorText} flex flex-col items-center justify-between gap-10 px-5 font-medium lg:flex-row lg:gap-0`}
    >
      <div className='hidden lg:block'>{limitContent} items</div>
      <div className='flex items-center justify-between gap-5 lg:text-lg'>
        {firstPageBtn}
        {prevPageBtn}
        {middlePagesBtn}
        {nextPageBtn}
        {lastPageBtn}
      </div>

      {/* Desk */}
      <div className='hidden lg:block'>
        <div>{rangeContent}</div>
        <div>{goToPage(1)}</div>
      </div>

      {/* Mob */}
      <div className='block w-full lg:hidden'>
        <div className='flex flex-col items-end'>
          <div className='block'>{limitContent} items</div>
          <div>{rangeContent}</div>
          <div>{goToPage(2)}</div>
        </div>
      </div>
    </div>
  )
}
