'use client'

import { useEffect } from 'react'
import { FaceFrownIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import Button from '@/app/ui/button'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const onPop = () => {
      window.location.reload()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <div className='flex min-h-[calc(100vh-72px)] items-center justify-center overflow-x-hidden sm:min-h-[calc(100vh-76px)]'>
      <div className='text-theme-brown flex h-full flex-col items-center justify-center gap-2'>
        <FaceFrownIcon className='w-10' />
        <h2 className='text-xl font-semibold'>404 Not Found</h2>
        <p>Could not find the requested resource.</p>
        <Button
          className='bg-theme-brown hover:bg-theme-gold font-fredoka mt-2 w-30 cursor-pointer rounded-[24px] px-6 py-1 text-lg font-medium text-white transition duration-300'
          type='button'
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    </div>
  )
}
