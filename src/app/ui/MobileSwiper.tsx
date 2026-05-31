'use client'

import { useEffect, useCallback, useRef } from 'react'

interface MobileSwiperProps {
  children?: React.ReactNode
  className?: string
  onSwiping: (args: { x: number; y: number; e: TouchEvent }) => void
  onSwiped: (args: { deltaX: number; deltaY: number; e: TouchEvent }) => void
  disabled?: boolean
}

export default function MobileSwiper({
  children,
  className,
  onSwiping,
  onSwiped,
  disabled,
  ...rest
}: MobileSwiperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const startX = useRef<number>(0)
  const startY = useRef<number>(0)

  const positionRef = useRef({ x: 0, y: 0 })

  const isHorizontalSwipe = useRef<boolean | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!wrapperRef.current?.contains(e.target as Node)) {
      return
    }

    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY

    isHorizontalSwipe.current = null
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        return
      }

      if (!isHorizontalSwipe.current) {
        return
      }

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const deltaX = endX - startX.current
      const deltaY = endY - startY.current

      onSwiped({
        deltaX,
        deltaY,
        e,
      })
    },
    [onSwiped],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        return
      }

      const touch = e.touches[0]

      const deltaX = touch.clientX - startX.current
      const deltaY = touch.clientY - startY.current

      if (isHorizontalSwipe.current === null) {
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          isHorizontalSwipe.current = false

          return
        } else {
          isHorizontalSwipe.current = true
        }
      }

      if (!isHorizontalSwipe.current) {
        return
      }

      if (e.cancelable) {
        e.preventDefault()
      }

      positionRef.current = {
        x: positionRef.current.x + deltaX,
        y: positionRef.current.y + deltaY,
      }

      onSwiping({
        x: positionRef.current.x,
        y: positionRef.current.y,
        e,
      })

      positionRef.current = { x: 0, y: 0 }
    },
    [onSwiping],
  )

  useEffect(() => {
    if (disabled) {
      return
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleTouchStart, handleTouchEnd, handleTouchMove, disabled])

  return (
    <div className={`${className}`} ref={wrapperRef} {...rest}>
      {children}
    </div>
  )
}
