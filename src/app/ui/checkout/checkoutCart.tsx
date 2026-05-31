'use client'

import { CartItemWithIssueType, CartResponseType } from '@/app/lib/definitions'
import { useEffect, useRef } from 'react'
import CheckoutCartItem from '@/app/ui/checkout/checkoutCartItem'

interface CheckoutCartProps {
  isSignedIn: boolean
  isStudent: boolean
  cart: CartResponseType
  cartItemsWithIssue: CartItemWithIssueType[]
  removeCartItemFromIssueList: (currId: string) => void
  updateCartItemIssueList: (id: string, newMsg: string) => void
  triggerScroll: boolean
  setTriggerScroll: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CheckoutCart({
  isSignedIn,
  isStudent,
  cart,
  cartItemsWithIssue,
  removeCartItemFromIssueList,
  updateCartItemIssueList,
  triggerScroll,
  setTriggerScroll,
}: CheckoutCartProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

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

  return (
    <section className='text-theme-brown w-full'>
      <div className='shadow-4 size-full rounded-xl bg-white'>
        {/* Title */}
        <div className='flex items-center gap-5 px-4 py-9 sm:max-lg:px-8 lg:p-10 lg:pl-11'>
          <h2 className='font-quicksand text-4xl'>Your Cart</h2>
          <span
            className='border-theme-gold bg-theme-gold font-quicksand flex size-8 items-center justify-center rounded-full border-2 text-xl text-white'
            aria-hidden
          >
            {cart?.items?.length}
          </span>
          <span className='sr-only' role='status'>
            {cart?.items?.length} items in cart
          </span>
        </div>
        {/* Items */}
        <div className='px-2 pb-12 sm:max-lg:px-8 lg:px-12'>
          {cart?.items?.length > 0 &&
            cart.items.map((el) => {
              const cartItemWithIssue = cartItemsWithIssue.find(
                (item) => item.program_id === el.program_id,
              )

              return (
                <CheckoutCartItem
                  key={el.program_id}
                  ref={(ref: HTMLDivElement) => {
                    itemRefs.current[el.program_id] = ref
                    // (cleanup function to reset the ref when element is removed from DOM.)
                    return () => {}
                  }}
                  isSignedIn={isSignedIn}
                  isStudent={isStudent}
                  cartItem={el}
                  cartItemIdWithIssue={cartItemWithIssue?.program_id}
                  cartItemMessageWithIssue={cartItemWithIssue?.messageOnItem}
                  removeCartItemFromIssueList={removeCartItemFromIssueList}
                  updateCartItemIssueList={updateCartItemIssueList}
                  setTriggerScroll={setTriggerScroll}
                />
              )
            })}
          <p className='font-quicksand pt-6 text-right text-xl font-medium underline underline-offset-2'>
            <span aria-hidden>Total: &#36;{cart.total_amount}</span>
            <span className='sr-only' role='status'>
              Total: {cart.total_amount} dollars
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
