'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'

const SRAnnouncerContext = createContext<{
  SRAnnouncePolite: (msg: string) => void
  SRAnnounceAssertive: (msg: string) => void
} | null>(null)

export function SRAnnouncerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [politeQueue, setPoliteQueue] = useState<string[]>([])
  const [politeMsg, setPoliteMsg] = useState('')
  const [assertiveQueue, setAssertiveQueue] = useState<string[]>([])
  const [assertiveMsg, setAssertiveMsg] = useState('')

  const SRAnnouncePolite = useCallback((msg: string) => {
    setPoliteQueue((q) => [...q, msg])
  }, [])

  const SRAnnounceAssertive = useCallback((msg: string) => {
    setAssertiveQueue((q) => [...q, msg])
  }, [])

  useEffect(() => {
    if (!politeQueue.length) return

    const msg = politeQueue[0]
    setPoliteMsg(msg)

    setTimeout(() => {
      setPoliteMsg('')
      setPoliteQueue((q) => q.slice(1))
    }, 300)

  }, [politeQueue])

  useEffect(() => {
    if (!assertiveQueue.length) return

    const msg = assertiveQueue[0]
    setAssertiveMsg(msg)

    setTimeout(() => {
      setAssertiveMsg('')
      setAssertiveQueue((q) => q.slice(1))
    }, 300)

  }, [assertiveQueue])

  return (
    <SRAnnouncerContext.Provider
      value={{ SRAnnouncePolite, SRAnnounceAssertive }}
    >
      {children}

      <div className='sr-only' role='status'>
        {politeMsg}
      </div>

      <div
        className='sr-only'
        role='status'
        aria-live='assertive'
        aria-atomic='true'
      >
        {assertiveMsg}
      </div>
    </SRAnnouncerContext.Provider>
  )
}

export function useSRAnnouncer() {
  const ctx = useContext(SRAnnouncerContext)
  if (!ctx) {
    throw new Error('useSRAnnouncer must be used inside SRAnnouncerProvider')
  }
  return ctx
}
