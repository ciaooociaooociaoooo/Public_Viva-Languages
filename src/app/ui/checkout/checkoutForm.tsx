'use client'

import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe, Appearance } from '@stripe/stripe-js'
import { useState } from 'react'
import { useLoadingContext } from '@/app/ctx/loadingContext'
import { StripeCheckoutPaymentElementOptions } from '@stripe/stripe-js'
import LoaderOnBtn from '../loaderOnBtn'
import clsx from 'clsx'
import { CartItemWithIssueType } from '@/app/lib/definitions'
import { validateGuestOrder, validateSignedInOrder } from '@/app/lib/actions'
import EmailField from './emailField'
import NameField from './nameField'

// (Make sure to call loadStripe outside of a component’s render to avoid recreating the Stripe object on every render.)
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (!stripePublicKey) {
  throw new Error('No Stripe Public Key provided')
}
const stripePromise = loadStripe(stripePublicKey, {
  developerTools: {
    assistant: { enabled: false },
  },
})

const paymentElementOptions: StripeCheckoutPaymentElementOptions = {
  layout: 'accordion',
}

interface PaymentFormProps {
  paymentIntentId: string
  mainMsg: string
  setMainMsg: React.Dispatch<React.SetStateAction<string>>
  setCartItemsWithIssue: React.Dispatch<
    React.SetStateAction<CartItemWithIssueType[]>
  >
  setTriggerScroll: React.Dispatch<React.SetStateAction<boolean>>
  isSignedIn: boolean
  isStudent: boolean
}

function PaymentForm({
  paymentIntentId,
  mainMsg,
  setMainMsg,
  setCartItemsWithIssue,
  setTriggerScroll,
  isSignedIn,
  isStudent,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [name, setName] = useState<string>('')

  const [email, setEmail] = useState<string>('')

  const [errState, setErrState] = useState<
    | {
        email?: string[] | undefined
        name?: string[] | undefined
      }
    | undefined
  >(undefined)

  const { isGlobalLoading, setIsGlobalLoading } = useLoadingContext()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // (Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.)
      return
    }

    setIsGlobalLoading(true)

    // Validate order
    setMainMsg('')
    setCartItemsWithIssue([])
    setTriggerScroll(true)

    let res = null
    if (!isSignedIn) {
      const validateGuestOrderWithArgs = validateGuestOrder.bind(
        null,
        paymentIntentId,
        name.trim(),
        email.trim(),
      )
      res = await validateGuestOrderWithArgs()
    } else if (isSignedIn && isStudent) {
      const validateSignedInOrderWithArgs = validateSignedInOrder.bind(
        null,
        paymentIntentId,
      )
      res = await validateSignedInOrderWithArgs()
    }
    if (res !== null && !res.success) {
      if (
        (res?.cause === 'program_not_found' ||
          res?.cause === 'program_not_available') &&
        res?.cartItemsWithIssue?.length
      ) {
        setCartItemsWithIssue(res.cartItemsWithIssue)
      } else if (res?.cause === 'invalid_user_input') {
        setErrState(res.errors)
      }

      setMainMsg(res.message)
      setIsGlobalLoading(false)

      return
    }
    // End Validate order

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // (Make sure to change this to your payment completion page)
        return_url: `${window.location.origin}/payment-success`,
        payment_method_data: !isSignedIn
          ? {
              billing_details: {
                name,
                email,
              },
            }
          : undefined,
      },
    })

    // (This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.)
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMainMsg(error?.message ?? 'An unexpected error occurred.')
    } else {
      setMainMsg('An unexpected error occurred.')
    }

    setIsGlobalLoading(false)
  }

  return (
    <form
      id='payment-form'
      className='flex h-full flex-col gap-2'
      // (Commented for production mode)
      // onSubmit={handleSubmit}
    >
      {!isSignedIn && (
        <div className='rounded-[5px] border-1 border-solid border-[#e6e6e6] p-4 text-[#30313d]'>
          <NameField
            name={name}
            setName={setName}
            errStateName={errState?.name}
            setErrState={setErrState}
          />
          <EmailField
            email={email}
            setEmail={setEmail}
            errStateEmail={errState?.email}
            setErrState={setErrState}
          />
        </div>
      )}
      <PaymentElement
        id='payment-element'
        className='shrink-0 grow-1 basis-[180px]'
        options={paymentElementOptions}
      />
      <div className={clsx('shrink-0', mainMsg ? 'mt-8' : 'mt-10')}>
        {mainMsg && (
          <div
            className='text-stripe-error-text mb-3 text-center text-lg font-semibold text-pretty'
            id='payment-message'
            aria-hidden
          >
            {mainMsg}
          </div>
        )}
        <div className='sr-only' role='status'>
          {mainMsg && <p>{mainMsg}</p>}
        </div>
        <button
          className={clsx(
            'bg-gold-logo font-fredoka ctaBtn flex min-h-[44px] w-full items-center justify-center rounded-[24px] py-1.5 font-medium text-white',
            (isGlobalLoading || !stripe || !elements) && 'cursor-wait',
          )}
          disabled={
            // (Commented for production mode)
            // isGlobalLoading || !stripe || !elements
            true
          }
          id='submit'
        >
          <span className='h-full text-2xl' id='button-text'>
            {isGlobalLoading || !stripe || !elements ? (
              <LoaderOnBtn color='#a06204' size={21} />
            ) : (
              // (Commented for production mode)
              // 'Start Your Journey'
              'Demo Mode'
            )}
          </span>
        </button>
      </div>
    </form>
  )
}

interface CheckoutFormProps {
  clientSecret: string
  paymentIntentId: string
  mainMsg: string
  setMainMsg: React.Dispatch<React.SetStateAction<string>>
  setCartItemsWithIssue: React.Dispatch<
    React.SetStateAction<CartItemWithIssueType[]>
  >
  setTriggerScroll: React.Dispatch<React.SetStateAction<boolean>>
  isSignedIn: boolean
  isStudent: boolean
}

const appearance: Appearance = {
  theme: 'stripe',
}

export default function CheckoutForm({
  clientSecret,
  paymentIntentId,
  mainMsg,
  setMainMsg,
  setCartItemsWithIssue,
  setTriggerScroll,
  isSignedIn,
  isStudent,
}: CheckoutFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance,
        clientSecret,
      }}
    >
      <PaymentForm
        paymentIntentId={paymentIntentId}
        mainMsg={mainMsg}
        setMainMsg={setMainMsg}
        setCartItemsWithIssue={setCartItemsWithIssue}
        setTriggerScroll={setTriggerScroll}
        isSignedIn={isSignedIn}
        isStudent={isStudent}
      />
    </Elements>
  )
}
