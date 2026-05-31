'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type LoadingContextType = {
  isGlobalLoading: boolean
  setIsGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isGlobalLoading, setIsGlobalLoading }}>
      {children}

      <div className='sr-only' role='status' aria-busy={isGlobalLoading}>
        {isGlobalLoading ? 'Loading' : 'Loaded'}
      </div>
    </LoadingContext.Provider>
  )
}

export function useLoadingContext() {
  const ctx = useContext(LoadingContext)
  if (!ctx)
    throw new Error('useLoadingContext must be used inside LoadingProvider')
  return ctx
}
