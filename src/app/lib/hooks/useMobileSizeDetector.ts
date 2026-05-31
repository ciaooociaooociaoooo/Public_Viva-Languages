import { useState, useEffect } from 'react'

const useMobileSizeDetector = (targetSize: number) => {
  const [windowSize, setWindowSize] = useState(
    typeof window !== 'undefined' ? window.innerWidth : targetSize,
  )

  const [isMobileSize, setIsMobileSize] = useState(
    typeof window !== 'undefined' && window.innerWidth < targetSize,
  )

  useEffect(() => {
    const resizeHandler = () => {
      setWindowSize(window.innerWidth)
      setIsMobileSize(window.innerWidth < targetSize)
    }

    window.addEventListener('resize', resizeHandler)
    return () => window.removeEventListener('resize', resizeHandler)
  }, [targetSize])

  return { windowSize, isMobileSize }
}

export default useMobileSizeDetector
