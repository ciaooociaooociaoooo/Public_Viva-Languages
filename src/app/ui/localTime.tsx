'use client'

import { useEffect, useState } from 'react'
import { dateFormatLocale, dateFormatOptions } from '../lib/definitions'

export function LocalTime({ isoString }: { isoString: string }) {
  const [formatted, setFormatted] = useState(isoString) // safe default (SSR-stable)

  useEffect(() => {
    const date = new Date(isoString)
    setFormatted(date.toLocaleString(dateFormatLocale, dateFormatOptions))
  }, [isoString])

  return <span>{formatted}</span>
}
