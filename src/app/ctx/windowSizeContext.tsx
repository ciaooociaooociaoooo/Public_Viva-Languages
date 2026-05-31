'use client'

import { createContext, useContext } from 'react'
import useMobileSizeDetector from '../lib/hooks/useMobileSizeDetector'

type WindowSizeContextValue = {
  windowSize: number
  isMobileSize: boolean
}

const WindowSizeContext = createContext<WindowSizeContextValue | null>(null)

export function WindowSizeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { windowSize, isMobileSize } = useMobileSizeDetector(1024)

  return (
    <WindowSizeContext.Provider value={{ windowSize, isMobileSize }}>
      {children}
    </WindowSizeContext.Provider>
  )
}

export function useWindowSizeContext() {
  const ctx = useContext(WindowSizeContext)
  if (!ctx) {
    throw new Error(
      'useWindowSizeContext must be used inside WindowSizeProvider',
    )
  }
  return ctx
}
