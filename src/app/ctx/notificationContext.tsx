'use client'

import clsx from 'clsx'
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

type Notification = {
  id: number
  message: string
  variant?: 'default' | 'success' | 'error'
}

type NotificationContextType = {
  showGlobalNotification: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
)

export function NotificationProvider({
  children,
  mode = 'default',
}: {
  children: ReactNode
  mode?: 'default' | 'admin'
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showGlobalNotification = useCallback(
    (message: string, variant: Notification['variant'] = 'default') => {
      const id = Date.now()
      setNotifications((prev) => [...prev, { id, message, variant }])

      //   Auto remove after 5s (same amount of time as .animate-slideUpFade)
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 5000)
    },
    [],
  )

  return (
    <NotificationContext value={{ showGlobalNotification }}>
      {children}

      {/* Notification container (fixed at bottom) */}
      <div
        className='fixed right-1/2 bottom-4 z-2000 flex w-full translate-x-1/2 flex-col gap-2 px-4 md:right-4 md:w-auto md:translate-x-0 md:px-0'
        role='status'
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            className={clsx(
              'animate-slideUpFade w-full px-4 py-2 shadow-lg md:w-auto',
              mode === 'admin'
                ? 'bg-dashboard-navbar-bg text-overall-bg rounded-lg'
                : 'bg-theme-brown text-overall-bg rounded-2xl',
            )}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx)
    throw new Error('useNotification must be used inside NotificationProvider')
  return ctx
}
