'use client'

import { startTransition, useState } from 'react'
import NumBar from '../numBar'
import clsx from 'clsx'
import Button from '../button'
import { addToGuestCart, addToSignedInCart } from '@/app/lib/actions'
import { useNotification } from '@/app/ctx/notificationContext'
import { useLoadingContext } from '@/app/ctx/loadingContext'
import { useRouter } from 'next/navigation'
import { useSRAnnouncer } from '@/app/ctx/SRAnnouncerContext'

interface ProgramNumBarWrapperProps {
  isSignedIn: boolean
  isStudent: boolean
  isEvent: boolean
  program_id: string
  program_name: string
  program_price: string
  program_category_name: string
  program_available: string
  program_image_id: string
  program_image_url: string
  program_image_public_id: string
  program_image_width: number
  program_image_height: number
  program_image_size: string
  program_image_type: string
}

export default function ProgramNumBarWrapper({
  isSignedIn,
  isStudent,
  isEvent,
  program_id,
  program_name,
  program_price,
  program_category_name,
  program_available,
  program_image_id,
  program_image_url,
  program_image_public_id,
  program_image_width,
  program_image_height,
  program_image_size,
  program_image_type,
}: ProgramNumBarWrapperProps) {
  const router = useRouter()

  const [value, setValue] = useState<number | ''>(1)

  const { isGlobalLoading, setIsGlobalLoading } = useLoadingContext()

  const [errMsg, setErrMsg] = useState<string>('')

  const { showGlobalNotification } = useNotification()

  const { SRAnnouncePolite, SRAnnounceAssertive } = useSRAnnouncer()

  const handleAddToCartBtnClick = () => {
    setErrMsg('')
    setIsGlobalLoading(true)

    if (isEvent && (!Number.isFinite(value) || value === 0)) {
      setErrMsg('Please choose a number in quantity field.')
      setIsGlobalLoading(false)
      return
    }

    let argQuantity: number = 1
    // (Already checked above, so value !== '' is just for TypeScript.)
    if (isEvent && value !== '') {
      argQuantity = value
    }

    startTransition(async () => {
      let res = null
      if (!isSignedIn) {
        res = await addToGuestCart(program_id, argQuantity)
      } else if (isSignedIn && isStudent) {
        res = await addToSignedInCart(program_id, argQuantity)
      }

      if (res !== null && !res.success) {
        if (res?.cause === 'program_only_allows_one_registration_per_person') {
          showGlobalNotification(res.message)
          setIsGlobalLoading(false)
          return
        }
        setErrMsg(res.message)
        SRAnnounceAssertive(res.message)
      }

      setIsGlobalLoading(false)

      if (res?.success) {
        SRAnnouncePolite(`${program_name} added to cart.`)
        router.refresh()
      }
    })
  }

  return (
    <>
      {isEvent && (
        <div id='program-num-bar' className='flex justify-center'>
          <div className='flex h-14 w-full flex-col sm:max-lg:w-60/100 lg:w-80/100 lg:max-w-[800px] [@media(min-width:1024px)_and_(orientation:portrait)]:w-60/100 [@media(min-width:1024px)_and_(orientation:portrait)]:max-w-none'>
            <NumBar
              value={value}
              setValue={setValue}
              minNum={1}
              isInteger={true}
              setMsg={setErrMsg}
              disabled={isGlobalLoading}
              handleDecrement={() => {
                setErrMsg('')

                setValue((prev) =>
                  Math.max(
                    // (minimum value 1)
                    1,
                    !Number.isFinite(prev)
                      ? // (if prev value is empty string, returns 1)
                        1
                      : (prev as number) - 1,
                  ),
                )
              }}
              handleIncrement={() => {
                setErrMsg('')

                setValue((prev) =>
                  // (if prev value is empty string, returns 1)
                  !Number.isFinite(prev) ? 1 : (prev as number) + 1,
                )
              }}
              divProps={{
                className: `w-full h-full border-1 border-solid border-[#fff1c8] flex items-center justify-center`,
              }}
              inputProps={{
                className: `w-full h-full text-lg sm:text-xl text-theme-brown text-center bg-overall-bg [&:hover:not(:focus):not(:disabled)]:shadow-[0_0_3px_var(--color-focus)] duration-100 ease-in`,
                id: 'program-number-input',
                name: 'program-number-input',
              }}
              btnProps={{
                className: `w-10 z-1 h-full bg-dusty-rose/30 text-theme-brown flex items-center justify-center btn-hover-scale-glow btn-no-hover-scale-glow duration-100 ease-in`,
              }}
              plusBtnProps={{
                'aria-label': `Increase number of attendees`,
              }}
              minusBtnProps={{
                'aria-label': `Decrease number of attendees`,
              }}
            />
            <div className='flex justify-center'>
              <label
                className='text-dusty-rose font-quicksand inline-block w-fit sm:max-lg:text-lg [@media(min-width:1024px)_and_(orientation:portrait)]:text-lg'
                htmlFor='program-number-input'
              >
                (number of attendees)
              </label>
            </div>
          </div>
        </div>
      )}

      <div
        id='program-num-bar-wrapper'
        className={clsx('lg:pt-2', !isEvent && 'pt-2 sm:max-lg:pt-2')}
      >
        {errMsg && (
          <div className='-mt-6 flex size-full items-center justify-center sm:max-lg:mb-1'>
            <p className='text-dashboard-inactive-select-text text-center font-semibold text-pretty sm:text-lg'>
              {errMsg}
            </p>
          </div>
        )}
        <Button
          className={clsx(
            'bg-gold-logo font-fredoka ctaBtn w-full rounded-[24px] px-5 py-1 text-xl font-medium text-white sm:max-lg:w-60/100 lg:w-80/100 lg:max-w-[800px] [@media(min-width:1024px)_and_(orientation:portrait)]:w-60/100 [@media(min-width:1024px)_and_(orientation:portrait)]:max-w-none',
            isGlobalLoading && 'cursor-wait',
          )}
          type='button'
          onClick={handleAddToCartBtnClick}
          disabled={
            (isSignedIn && !isStudent) ||
            isGlobalLoading ||
            Number(program_available) <= 0
          }
        >
          {Number(program_available) <= 0
            ? 'No Seats Available'
            : 'Start Your Journey'}
        </Button>
      </div>
    </>
  )
}
