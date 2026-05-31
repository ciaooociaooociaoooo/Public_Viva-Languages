'use client'

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import {
  MyProgramsSortKey,
  SortKey,
  SortOrder,
  UsersSortKey,
} from '../lib/definitions'

interface THeadProps {
  tHeadColumns: {
    name: string
    dbColumn: string
    sortable: boolean
    bulkDelete?: boolean
  }[]
  sortBy: SortKey | MyProgramsSortKey | UsersSortKey
  sortOrder: SortOrder
  toggleSelectAll?: () => void
  isAllSelected?: boolean
  colorText?: string
  colorBg?: string
  colorColumnBg?: string
  colorColumnBgHovered?: string
}

export default function THead({
  tHeadColumns,
  sortBy,
  sortOrder,
  toggleSelectAll,
  isAllSelected,
  colorText = 'text-dashboard-th-text',
  colorBg = 'bg-dashboard-overall-bg',
  colorColumnBg = 'bg-dashboard-th-hovered/90',
  colorColumnBgHovered = 'hover:bg-dashboard-th-hovered/90',
}: THeadProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { push } = useRouter()

  const handleColumnClick = useDebouncedCallback((sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams)

    params.set('page', '1')

    if (sortBy && sortOrder) {
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
    } else {
      params.delete('sortBy')
      params.delete('sortOrder')
    }

    push(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <thead className={`${colorText} ${colorBg} text-xl`}>
      <tr aria-rowindex={1}>
        {tHeadColumns.map(
          ({ name: columnName, dbColumn, sortable, bulkDelete }, i) => (
            <th
              key={`${columnName}-${i}`}
              className='group'
              aria-sort={
                !bulkDelete && sortable && sortBy === dbColumn
                  ? sortOrder === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
            >
              {bulkDelete === true ? (
                <div className='flex items-center justify-center'>
                  <input
                    className='size-4 cursor-pointer'
                    type='checkbox'
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </div>
              ) : sortable && sortBy === dbColumn ? (
                sortOrder === 'asc' ? (
                  <div
                    className={clsx(
                      `flex h-full items-center justify-center rounded-t-2xl ${colorColumnBgHovered}`,
                      sortBy === dbColumn && colorColumnBg,
                    )}
                  >
                    <button
                      className='size-full cursor-pointer px-8'
                      onClick={() => handleColumnClick(dbColumn, 'desc')}
                      aria-label={`${columnName}, activate to sort descending`}
                    >
                      <span className='relative text-nowrap'>
                        {columnName}
                        <ChevronUpIcon className='pointer-events-auto visible absolute top-1/2 -right-5 w-3 -translate-y-1/2 stroke-3 opacity-100' />
                      </span>
                    </button>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      `flex h-full items-center justify-center rounded-t-2xl ${colorColumnBgHovered}`,
                      sortBy === dbColumn && colorColumnBg,
                    )}
                  >
                    <button
                      className='size-full cursor-pointer px-8'
                      onClick={() => handleColumnClick(dbColumn, 'asc')}
                      aria-label={`${columnName}, activate to sort ascending`}
                    >
                      <span className='relative text-nowrap'>
                        {columnName}
                        <ChevronDownIcon className='pointer-events-auto visible absolute top-1/2 -right-5 w-3 -translate-y-1/2 stroke-3 opacity-100' />
                      </span>
                    </button>
                  </div>
                )
              ) : sortable ? (
                <div
                  className={`flex h-full items-center justify-center rounded-t-2xl ${colorColumnBgHovered}`}
                >
                  <button
                    className='size-full cursor-pointer px-8'
                    onClick={() => handleColumnClick(dbColumn, 'asc')}
                    aria-label={`${columnName}, activate to sort ascending`}
                  >
                    <span className='relative text-nowrap'>
                      {columnName}
                      <ChevronUpIcon className='pointer-events-none invisible absolute top-1/2 -right-5 w-3 -translate-y-1/2 stroke-3 opacity-0 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100' />
                    </span>
                  </button>
                </div>
              ) : (
                <div className='flex h-full items-center justify-center rounded-t-2xl px-8'>
                  <span className='text-nowrap'>{columnName}</span>
                </div>
              )}
            </th>
          ),
        )}
      </tr>
    </thead>
  )
}
