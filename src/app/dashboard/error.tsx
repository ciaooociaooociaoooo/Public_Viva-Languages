'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/app/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  useEffect(() => {
    const onPop = () => {
      window.location.reload()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <div className='bg-dashboard-bg-grey flex min-h-[calc(100vh-72px)] items-center justify-center sm:min-h-[calc(100vh-76px)]'>
      <div className='text-dashboard-navbar-bg flex flex-col items-center justify-center gap-2'>
        <h2 className='text-xl font-semibold'>Something went wrong.</h2>
        <Button
          className='dashboard-btn dashboard-second-action-btn mt-2 w-30 rounded-[24px] px-6 py-1 text-lg font-medium'
          type='button'
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    </div>
  )
}
