'use client'

import { useCallback, useEffect, useState } from 'react'
import { CartItemWithIssueType, CartResponseType } from '@/app/lib/definitions'
import CheckoutCart from './checkoutCart'
import CheckoutForm from './checkoutForm'
import {
  createPaymentIntent_guest,
  createPaymentIntent_signedInUser,
} from '@/app/lib/actions'
import CheckoutSkeleton from '../skeletons/checkoutSkeleton'

interface CheckoutProps {
  isSignedIn: boolean
  isStudent: boolean
  cart: CartResponseType
}

export default function Checkout({
  isSignedIn,
  isStudent,
  cart,
}: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  const [mainMsg, setMainMsg] = useState<string>('')

  const [cartItemsWithIssue, setCartItemsWithIssue] = useState<
    CartItemWithIssueType[]
  >([])

  const [triggerScroll, setTriggerScroll] = useState<boolean>(true)

  useEffect(() => {
    let createPaymentIntent
    if (isSignedIn && isStudent) {
      createPaymentIntent = createPaymentIntent_signedInUser
    } else {
      createPaymentIntent = createPaymentIntent_guest
    }

    createPaymentIntent().then((res) => {
      setClientSecret(res.clientSecret)
      setPaymentIntentId(res.paymentIntentId)
    })
  }, [isSignedIn, isStudent])

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

  useEffect(() => {
    if (cartItemsWithIssue.length <= 0) {
      setMainMsg('')
    }
  }, [cartItemsWithIssue])

  let contentCheckoutForm
  if (!clientSecret || !paymentIntentId) {
    contentCheckoutForm = <CheckoutSkeleton />
  } else {
    contentCheckoutForm = (
      <CheckoutForm
        clientSecret={clientSecret}
        paymentIntentId={paymentIntentId}
        mainMsg={mainMsg}
        setMainMsg={setMainMsg}
        setCartItemsWithIssue={setCartItemsWithIssue}
        setTriggerScroll={setTriggerScroll}
        isSignedIn={isSignedIn}
        isStudent={isStudent}
      />
    )
  }

  return (
    <div className='grid min-h-screen grid-rows-[min-content_auto] gap-3 px-2 pt-15 pb-3 lg:grid-cols-2 lg:grid-rows-none lg:gap-2 lg:p-15'>
      {/* Cart */}
      <CheckoutCart
        isSignedIn={isSignedIn}
        isStudent={isStudent}
        cart={cart}
        cartItemsWithIssue={cartItemsWithIssue}
        removeCartItemFromIssueList={removeCartItemFromIssueList}
        updateCartItemIssueList={updateCartItemIssueList}
        triggerScroll={triggerScroll}
        setTriggerScroll={setTriggerScroll}
      />

      {/* Payment Info */}
      <section className='w-full'>
        <div
          id='checkout'
          className='shadow-4 flex size-full flex-col rounded-xl bg-white'
        >
          {/* Title */}
          <div className='shrink-0 px-4 py-9 sm:max-lg:px-8 lg:p-10 lg:pl-11'>
            <h2 className='text-theme-brown font-quicksand text-4xl'>
              Payment Info
            </h2>
          </div>
          {/* Stripe form */}
          <div className='grow-1 basis-[506.75px] px-2 pb-8 sm:max-lg:px-8 lg:px-12 lg:pb-12'>
            {contentCheckoutForm}
          </div>
        </div>
      </section>
    </div>
  )
}
