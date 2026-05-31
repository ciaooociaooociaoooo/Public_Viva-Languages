'use client'

import { CartItemType } from '@/app/lib/definitions'
import clsx from 'clsx'
import { useState, useEffect, useRef, startTransition } from 'react'
import NumBar from '../numBar'
import { useLoadingContext } from '@/app/ctx/loadingContext'
import { XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import {
  removeFromGuestCart,
  removeFromSignedInCart,
  updateGuestCartQuantity,
  updateSignedInCartQuantity,
} from '@/app/lib/actions'
import { useRouter } from 'next/navigation'
import { useSRAnnouncer } from '@/app/ctx/SRAnnouncerContext'

interface CheckoutCartItemProps {
  ref: (ref: HTMLDivElement) => () => void
  isSignedIn: boolean
  isStudent: boolean
  cartItem: CartItemType
  cartItemIdWithIssue?: string
  cartItemMessageWithIssue?: string
  removeCartItemFromIssueList: (currId: string) => void
  updateCartItemIssueList: (id: string, newMsg: string) => void
  setTriggerScroll: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CheckoutCartItem({
  ref,
  isSignedIn,
  isStudent,
  cartItem: {
    program_id,
    program_name,
    price,
    quantity,
    category_name,
    image: { id, url, public_id, width, height, size, type },
  },
  cartItemIdWithIssue,
  cartItemMessageWithIssue,
  removeCartItemFromIssueList,
  updateCartItemIssueList,
  setTriggerScroll,
}: CheckoutCartItemProps) {
  const router = useRouter()

  const [valueNumBar, setValueNumBar] = useState<number | ''>(quantity)

  const { isGlobalLoading, setIsGlobalLoading } = useLoadingContext()

  const initial = useRef<boolean>(true)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const skipEffect = useRef<boolean>(false)

  const { SRAnnouncePolite } = useSRAnnouncer()

  useEffect(() => {
    if (quantity) setValueNumBar(quantity)
  }, [quantity])

  useEffect(() => {
    if (valueNumBar || valueNumBar === '') {
      if (initial.current === false) {
        if (skipEffect.current) {
          skipEffect.current = false
          return
        }

        if (cartItemIdWithIssue) {
          setTriggerScroll(false)
          removeCartItemFromIssueList(cartItemIdWithIssue)
        }

        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }

        if (valueNumBar) {
          timerRef.current = setTimeout(async () => {
            setIsGlobalLoading(true)

            let res = null
            if (!isSignedIn) {
              res = await updateGuestCartQuantity(program_id, valueNumBar)
            } else if (isSignedIn && isStudent) {
              res = await updateSignedInCartQuantity(program_id, valueNumBar)
            }
            if (res !== null && !res.success) {
              skipEffect.current = true
              setValueNumBar(quantity)

              setTriggerScroll(true)
              updateCartItemIssueList(program_id, res.message)
            }

            setIsGlobalLoading(false)

            if (res?.success) {
              SRAnnouncePolite(
                `${program_name} quantity updated to ${valueNumBar}.`,
              )
              router.refresh()
            }
          }, 800)
        }

        if (timerRef.current && valueNumBar === quantity) {
          clearTimeout(timerRef.current)
        }
      }

      if (initial.current === true) {
        initial.current = false
      }
    }
    // (Disabled for cartItemIdWithIssue, if put it in dependency, it'll trigger this useEffect wrongly. And every time cartItemIdWithIssue changes, this CartItem.tsx will be re-render anyway, so it doesn't need to be added anyway.)
    // eslint-disable-next-line
  }, [
    isSignedIn,
    isStudent,
    valueNumBar,
    program_id,
    quantity,
    setIsGlobalLoading,
    // cartItemIdWithIssue,
    removeCartItemFromIssueList,
    updateCartItemIssueList,
    setTriggerScroll,
  ])

  const handleRemoveFromCart = () => {
    setIsGlobalLoading(true)

    if (cartItemIdWithIssue) {
      setTriggerScroll(false)
      removeCartItemFromIssueList(cartItemIdWithIssue)
    }

    startTransition(async () => {
      let res = null
      if (!isSignedIn) {
        res = await removeFromGuestCart(program_id)
      } else if (isSignedIn && isStudent) {
        res = await removeFromSignedInCart(program_id)
      }
      if (res !== null && !res.success) {
        setTriggerScroll(true)
        updateCartItemIssueList(program_id, res.message)
      }

      setIsGlobalLoading(false)

      if (res?.success) {
        SRAnnouncePolite(`${program_name} removed from cart.`)
        router.refresh()
      }
    })
  }

  const handleBlur = () => {
    if (!Number.isFinite(valueNumBar)) setValueNumBar(quantity)
  }

  return (
    <div
      ref={ref}
      className={clsx(
        'first:border-t-solid first:border-dusty-rose/30 relative overflow-hidden p-2 first:border-t-1',
        cartItemIdWithIssue
          ? 'cart-item-has-issue bg-dashboard-inactive-select-text/20 rounded-2xl'
          : 'border-b-dusty-rose/30 border-b-solid border-b-1 bg-white',
      )}
    >
      <button
        className={clsx(
          'absolute top-1 right-1 w-6',
          isGlobalLoading ? 'cursor-wait' : 'cursor-pointer',
        )}
        onClick={handleRemoveFromCart}
        title={`Remove ${program_name} from cart`}
        disabled={isGlobalLoading}
      >
        <XCircleIcon
          className={clsx(
            cartItemIdWithIssue ? 'stroke-white' : 'stroke-dusty-rose',
          )}
        />
      </button>
      <div className='flex justify-between'>
        <div className='w-[90px] shrink-0'>
          <Link
            href={`/program/${program_id}`}
            aria-label={`go to ${program_name} page`}
          >
            <Image
              className='rounded-2xl'
              src={url}
              alt={`Poster of ${program_name}`}
              width={width}
              height={height}
            />
          </Link>
        </div>
        <div className='mx-auto flex flex-col items-center justify-center gap-2'>
          {cartItemMessageWithIssue && (
            <div
              className='flex size-full h-1 items-center justify-center'
              aria-hidden
            >
              <p className='text-dashboard-inactive-select-text text-center text-base font-semibold text-pretty'>
                {cartItemMessageWithIssue}
              </p>
            </div>
          )}
          <div className='sr-only' role='status'>
            {cartItemMessageWithIssue && (
              <p>
                {program_name}: {cartItemMessageWithIssue}
              </p>
            )}
          </div>
          <span className='font-caveat text-2xl'>{program_name}</span>
          <span className='text-lg' aria-label={`${price} dollars`}>
            &#36;{price}
          </span>

          {category_name === 'Event' && (
            <div className='flex h-7 w-60/100 flex-col'>
              <NumBar
                value={valueNumBar}
                setValue={setValueNumBar}
                minNum={1}
                isInteger={true}
                disabled={isGlobalLoading}
                handleDecrement={() => {
                  if (cartItemIdWithIssue) {
                    setTriggerScroll(false)
                    removeCartItemFromIssueList(cartItemIdWithIssue)
                  }

                  setValueNumBar((prev) =>
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
                  if (cartItemIdWithIssue) {
                    setTriggerScroll(false)
                    removeCartItemFromIssueList(cartItemIdWithIssue)
                  }

                  setValueNumBar((prev) =>
                    // (if prev value is empty string, returns 1)
                    !Number.isFinite(prev) ? 1 : (prev as number) + 1,
                  )
                }}
                divProps={{
                  className: `bg-white w-full h-full border-1 border-solid border-[#fff1c8] flex items-center justify-center`,
                }}
                inputProps={{
                  className: `transition-transform origin-center w-full relative z-1 h-full text-lg text-center bg-overall-bg [&:hover:not(:focus):not(:disabled)]:shadow-[0_0_3px_var(--color-focus)] duration-100 ease-in`,
                  id: `checkout-cart-item-number-input-${program_id}`,
                  name: 'cart-item-number-input',
                  onBlur: () => handleBlur(),
                }}
                btnProps={{
                  className: `transition-transform origin-center w-10 relative z-2 h-full bg-dusty-rose/30 flex items-center justify-center btn-hover-scale-glow btn-no-hover-scale-glow duration-100 ease-in`,
                }}
                plusBtnProps={{
                  'aria-label': `Increase number of attendees for ${program_name}`,
                }}
                minusBtnProps={{
                  'aria-label': `Decrease number of attendees for ${program_name}`,
                }}
              />
              <div className='flex justify-end'>
                <label
                  className='inline-block w-fit text-xs'
                  htmlFor={`checkout-cart-item-number-input-${program_id}`}
                >
                  attendees
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
