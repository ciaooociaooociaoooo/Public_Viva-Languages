'use client'

import { JSX, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PaymentSuccessOrderItems from './paymentSuccessOrderItems'
import { PaymentSuccessOrderType } from '@/app/lib/definitions'
import CTALink from '../ctaLink'
import Loader from '../loader'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react'
import useMobileSizeDetector from '@/app/lib/hooks/useMobileSizeDetector'
import { deskSize } from '@/app/lib/utils'

interface PaymentSuccessWrapperProps {
  isSuccess: boolean
  icon: JSX.Element
  iconColor: string
  text: string
  href: string
  linkText: string
  paymentIntentId: string
  isSignedIn: boolean
  isStudent: boolean
}

export default function PaymentSuccessWrapper({
  isSuccess,
  icon,
  iconColor,
  text,
  href,
  linkText,
  paymentIntentId,
  isSignedIn,
  isStudent,
}: PaymentSuccessWrapperProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const router = useRouter()

  const [order, setOrder] = useState<PaymentSuccessOrderType | null>(null)

  const didRefresh = useRef(false)

  const containerRef = useRef(null)

  const { windowSize } = useMobileSizeDetector(deskSize)

  const celebrationLottie = useRef<DotLottie | null>(null)

  useEffect(() => {
    if (!paymentIntentId) return

    // (use poll to fetch order, because the order might not be created yet.)
    let attempts = 0

    const poll = async () => {
      attempts++

      const res = await fetch(
        `/api/payment-success/${isSignedIn && isStudent ? 'signed-in' : 'guest'}?payment_intent_id=${paymentIntentId}`,
        { cache: 'no-store' },
      )

      const data = await res.json()

      if (data?.order) {
        setOrder(data.order)
        setIsLoading(false)

        if (!didRefresh.current) {
          didRefresh.current = true
          router.refresh()
        }

        return
      }

      if (attempts < 20) {
        setTimeout(poll, 1000)
      }
    }

    poll()
  }, [isSignedIn, isStudent, paymentIntentId, router])

  useGSAP(() => {
    if (!isLoading) {
      gsap.to(containerRef.current, {
        delay: 1.5,
        opacity: 1,
        duration: 2,
      })
    }
  }, [isLoading])

  useEffect(() => {
    celebrationLottie.current?.resize()
  }, [windowSize])

  if (isLoading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <Loader size={28} isAdmin={false} />
      </div>
    )
  } else {
    return (
      <>
        {/* celebration lottie animation */}
        {isSuccess && (
          <div className='absolute top-1/2 left-1/2 size-full -translate-x-1/2 -translate-y-1/2 overflow-hidden'>
            <DotLottieReact
              dotLottieRefCallback={(dotLottie) => {
                celebrationLottie.current = dotLottie
              }}
              className='absolute top-1/2 left-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 sm:h-[80vw] sm:w-[80vw] lg:h-[50vw] lg:w-[50vw] [@media(min-width:1024px)_and_(orientation:portrait)]:h-[60vw] [@media(min-width:1024px)_and_(orientation:portrait)]:w-[60vw]'
              src='/lottie/celebration.json'
              autoplay={true}
              loop={false}
              speed={0.8}
            />
          </div>
        )}

        {/* Content */}
        <div
          ref={containerRef}
          className='flex flex-col items-center justify-center pb-10 opacity-0 sm:pb-8'
        >
          <div className='h-screen w-screen max-w-[2000px] overflow-x-hidden'>
            <div className='relative h-[calc(100vh-80px)] w-full'>
              {/* Icon */}
              <div className='absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-180 items-center justify-center sm:scale-105'>
                {icon}

                {/* Text */}
                <div className='absolute top-1/2 left-1/2 w-full -translate-x-1/2 translate-y-10/10 px-2 text-center font-semibold sm:text-2xl'>
                  <h1
                    style={{ color: iconColor }}
                    className='font-caveat text-xl text-nowrap sm:text-4xl'
                  >
                    {text}
                  </h1>
                </div>
              </div>

              {/* Keep Going Btn */}
              <div className='absolute top-3/4 left-1/2 -translate-x-1/2'>
                <CTALink
                  href={href}
                  className='relative z-1 px-6 py-1.5 text-xl leading-normal text-nowrap'
                  replace={true}
                >
                  <span className='text-center leading-normal text-nowrap lg:leading-tight'>
                    {linkText}
                  </span>
                </CTALink>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className='w-screen'>
            <PaymentSuccessOrderItems order={order} />
          </div>
        </div>
      </>
    )
  }
}
