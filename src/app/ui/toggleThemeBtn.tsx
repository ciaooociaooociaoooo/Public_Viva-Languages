'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

interface ToggleThemeBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className_btn?: string
  className_sun?: string
  className_moon?: string
}

export default function ToggleThemeBtn({
  className_btn,
  className_sun,
  className_moon,
  ...rest
}: ToggleThemeBtnProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  // (to prevent hydration mismatch)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      type='button'
      className={`flex cursor-pointer items-center ${className_btn}`}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-pressed={resolvedTheme === 'dark'}
      aria-label='toggle dark mode'
      {...rest}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className={`${className_sun}`} />
      ) : (
        <MoonIcon className={`${className_moon}`} />
      )}
    </button>
  )
}
