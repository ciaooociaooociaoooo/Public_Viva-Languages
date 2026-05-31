'use client'

import { useEffect } from 'react'
import { FaceFrownIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import Button from '@/app/ui/button'

export default function NotFound() {
  const router = useRouter()

  //   (To trigger page refresh when user clicks browser's Back button and URL changes back to previous one. Without this the URL will change back, but page won't reload.)
  useEffect(() => {
    const onPop = () => {
      window.location.reload()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <div className='flex min-h-[calc(100vh-72px)] items-center justify-center overflow-x-hidden sm:min-h-[calc(100vh-76px)]'>
      <div className='text-dashboard-navbar-bg flex h-full flex-col items-center justify-center gap-2'>
        <FaceFrownIcon className='w-10' />
        <h2 className='text-xl font-semibold'>404 Not Found</h2>
        <p>Could not find the requested resource.</p>
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
