'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchProps {
  query: string
  hasLabel?: boolean
  className_wrapper?: string
  className_input?: string
  placeholder?: string
  className_magnifyingGlassIcon?: string
}

export default function Search({
  query,
  hasLabel = false,
  className_wrapper,
  className_input,
  placeholder = '',
  className_magnifyingGlassIcon,
}: SearchProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { push } = useRouter()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [searchInput, setSearchInput] = useState<string>('')

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  const onChangedSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const params = new URLSearchParams(searchParams)

    setSearchInput(val)

    // (debounce)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (val) {
        params.set('page', '1')
        params.set('query', val)
      } else {
        params.delete('query')
      }

      push(`${pathname}?${params.toString()}`)
    }, 1200)
  }

  const searchBar = (
    <div id='search-bar' className={`relative ${className_wrapper}`}>
      {hasLabel && <label htmlFor='search'>Search</label>}
      <input
        className={`peer pl-10 ${className_input}`}
        value={searchInput}
        type='search'
        id='search'
        name='search'
        placeholder={placeholder}
        onChange={onChangedSearchInput}
      />
      <MagnifyingGlassIcon
        className={`absolute top-1/2 left-8 h-[18px] w-[18px] -translate-y-1/2 ${className_magnifyingGlassIcon}`}
      />
    </div>
  )

  return searchBar
}
