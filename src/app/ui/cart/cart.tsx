'use client'

import { useState, useRef, useTransition, useEffect, useCallback } from 'react'
import { XCircleIcon } from '@heroicons/react/24/outline'
import Button from '../button'
import CartItem from './cartItem'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { CartResponseType, CartItemWithIssueType } from '@/app/lib/definitions'
import LoaderOnBtn from '../loaderOnBtn'
import { checkoutGuestCart, checkoutSignedInCart } from '@/app/lib/actions'
import clsx from 'clsx'
import { useLoadingContext } from '@/app/ctx/loadingContext'
import { useRouter } from 'next/navigation'

gsap.registerPlugin(useGSAP)

interface CartProps {
  isSignedIn: boolean
  isStudent: boolean
  cart: CartResponseType
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>
  isClicked: boolean
  cartFocusRef: React.RefObject<HTMLDivElement | null>
}

const Cart = ({
  isSignedIn,
  isStudent,
  cart,
  setIsClicked,
  isClicked,
  cartFocusRef,
}: CartProps) => {
  const container = useRef<HTMLDivElement>(null)

  // On clicking cart popup, if there's item in cart, do cart number moving animation.
  useGSAP(
    () => {
      if (isClicked && cart?.items?.length > 0) {
        gsap.set('#gsapTarget2', {
          x: 0,
          rotate: 0,
        })

        const tl = gsap.timeline()

        tl.to('#gsapTarget2', {
          x: -70,
          rotate: -750,
          ease: 'power1.out',
          duration: 1,
          delay: 0.4,
        })
        tl.to('#gsapTarget2', {
          x: 0,
          rotate: 0,
          ease: 'elastic.out(1, 0.3)',
          duration: 2.5,
        })
      }
    },
    { dependencies: [isClicked], scope: container },
  )

  const [isPending, startTransition] = useTransition()

  const { isGlobalLoading, setIsGlobalLoading } = useLoadingContext()

  const [errMsgOnCart, setErrMsgOnCart] = useState<string>('')

  const [cartItemsWithIssue, setCartItemsWithIssue] = useState<
    CartItemWithIssueType[]
  >([])

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const router = useRouter()

  const [triggerScroll, setTriggerScroll] = useState<boolean>(true)

  const handleClick = () => {
    setErrMsgOnCart('')
    setCartItemsWithIssue([])
    setTriggerScroll(true)

    startTransition(async () => {
      let res = null
      if (!isSignedIn) {
        res = await checkoutGuestCart()
      } else if (isSignedIn && isStudent) {
        res = await checkoutSignedInCart()
      }
      if (res !== null && !res.success) {
        if (
          (res?.cause === 'program_not_found' ||
            res?.cause === 'program_not_available') &&
          res?.cartItemsWithIssue?.length
        ) {
          setCartItemsWithIssue(res.cartItemsWithIssue)
        }
        setErrMsgOnCart(res.message)
        // (Here we don't do server side redirecting but do client side redirecting instead, because we need to close the cart popup before redirecting away.)
      } else if (res?.success) {
        setIsClicked(false)
        router.push('/checkout')
      }
    })
  }

  useEffect(() => {
    setIsGlobalLoading(isPending)

    // (set back to false when router.push('/checkout') hence unmount.)
    return () => setIsGlobalLoading(false)
  }, [isPending, setIsGlobalLoading])

  const removeCartItemFromIssueList = useCallback((currId: string) => {
    setCartItemsWithIssue((prev) =>
      prev.filter((obj) => obj.program_id !== currId),
    )
  }, [])

  const updateCartItemIssueList = useCallback((id: string, newMsg: string) => {
    setCartItemsWithIssue((prev) => {
      const index = prev.findIndex((obj) => obj.program_id === id)

      if (index !== -1) {
        const copy = [...prev]
        copy[index] = { ...copy[index], messageOnItem: newMsg }
        return copy
      }

      return [{ program_id: id, messageOnItem: newMsg }, ...prev]
    })
  }, [])

  // (scroll into view the first cart item with issue, when suitable.)
  useEffect(() => {
    if (triggerScroll) {
      if (cartItemsWithIssue.length > 0) {
        const targetId = cartItemsWithIssue[0].program_id
        const el = itemRefs.current[targetId]
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }
    }
  }, [triggerScroll, cartItemsWithIssue])

  useEffect(() => {
    if (cartItemsWithIssue.length <= 0) {
      setErrMsgOnCart('')
    }
  }, [cartItemsWithIssue])

  return (
    <div className='flex h-full flex-col'>
      {/* header */}
      <div
        className='font-fredoka border-b-dusty-rose/30 border-b-solid relative flex items-center justify-center gap-4 border-b-1 pt-4 pb-3'
        ref={container}
      >
        <div id='gsapTarget2' className='font-nunito -ml-7'>
          <span
            className='border-theme-gold bg-theme-gold flex size-12 items-center justify-center rounded-full border-2 text-2xl text-white'
            aria-hidden
          >
            {cart?.items?.length}
          </span>
          {/* (tabIndex -1 --- so it can be focused) */}
          <span
            ref={cartFocusRef}
            className='sr-only'
            tabIndex={-1}
            role='status'
          >
            {cart?.items?.length} items in cart
          </span>
        </div>
        <h2 id='cart-title' className='text-3xl'>
          Your Cart
        </h2>
        <button
          className='absolute top-1 right-1 w-6 cursor-pointer'
          onClick={() => setIsClicked(false)}
        >
          <XCircleIcon className='stroke-dusty-rose' />
          <span className='sr-only'>Close Cart</span>
        </button>
      </div>

      {/* content box */}
      <div className='flex-1 overflow-auto'>
        {cart?.items?.length === 0 && (
          <div className='flex h-full items-center justify-center'>
            <p aria-hidden>Your cart is empty..</p>
            <span className='sr-only'>Your cart is empty.</span>
          </div>
        )}

        {cart?.items?.length > 0 &&
          cart.items.map((el) => {
            const cartItemWithIssue = cartItemsWithIssue.find(
              (item) => item.program_id === el.program_id,
            )

            return (
              <CartItem
                key={el.program_id}
                ref={(ref: HTMLDivElement) => {
                  itemRefs.current[el.program_id] = ref
                  // (cleanup function to reset the ref when element is removed from DOM.)
                  return () => {}
                }}
                isSignedIn={isSignedIn}
                isStudent={isStudent}
                cartItem={el}
                isCartClicked={isClicked}
                cartItemIdWithIssue={cartItemWithIssue?.program_id}
                cartItemMessageWithIssue={cartItemWithIssue?.messageOnItem}
                removeCartItemFromIssueList={removeCartItemFromIssueList}
                updateCartItemIssueList={updateCartItemIssueList}
                setTriggerScroll={setTriggerScroll}
              />
            )
          })}
      </div>

      {/* footer */}
      {cart?.items?.length > 0 && (
        <div className='border-t-dusty-rose/30 border-t-solid flex flex-col justify-center gap-2 border-t-1 px-6 pt-3 pb-4'>
          <p className='text-center text-lg'>
            <span aria-hidden>Total: &#36;{cart.total_amount}</span>
            <span className='sr-only' role='status'>
              Total: {cart.total_amount} dollars
            </span>
          </p>
          {errMsgOnCart && (
            <p
              className='text-dashboard-inactive-select-text mb-2 text-center text-lg font-semibold text-pretty'
              aria-hidden
            >
              {errMsgOnCart}
            </p>
          )}
          <div className='sr-only' role='status'>
            {errMsgOnCart && <p>{errMsgOnCart}</p>}
          </div>
          <Button
            className={clsx(
              'bg-gold-logo font-fredoka ctaBtn rounded-[24px] py-1 font-medium text-white',
              isGlobalLoading && 'cursor-wait',
            )}
            className_span='h-full'
            type='button'
            onClick={handleClick}
            disabled={isGlobalLoading}
          >
            {isGlobalLoading ? (
              <LoaderOnBtn color='#a06204' size={21} />
            ) : (
              'Start Your Journey'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Cart
