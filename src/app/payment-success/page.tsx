import { redirect } from 'next/navigation'
import { stripe } from '@/app/lib/stripe'
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { auth } from '@/auth'
import PaymentSuccessWrapper from '../ui/checkout/paymentSuccessWrapper'

const SuccessIcon = <img className='' src='/Logo2_nobg.svg' alt='Logo' />

const InfoIcon = (
  <ClockIcon className='w-12 translate-y-18/10 text-[#a06204] sm:translate-y-60 lg:translate-y-50' />
)

const ErrorIcon = (
  <ExclamationTriangleIcon className='w-12 translate-y-18/10 text-[#991b1b] sm:translate-y-60 lg:translate-y-50' />
)

const STATUS_CONTENT_MAP = {
  succeeded: {
    text: 'Your journey has begun.',
    iconColor: '#e0a030',
    icon: SuccessIcon,
    href: '/',
    linkText: 'Keep Going',
  },
  processing: {
    text: 'Your payment is processing..',
    iconColor: '#a06204',
    icon: InfoIcon,
    href: '/',
    linkText: 'Back to home page',
  },
  requires_payment_method: {
    text: 'Your payment was not successful, please try again.',
    iconColor: '#991b1b',
    icon: ErrorIcon,
    href: '/checkout',
    linkText: 'Back to checkout',
  },
  default: {
    text: 'Something went wrong, please try again.',
    iconColor: '#991b1b',
    icon: ErrorIcon,
    href: '/checkout',
    linkText: 'Back to checkout',
  },
}

export default async function Page(props: {
  searchParams: Promise<{
    payment_intent: string
  }>
}) {
  const searchParams = await props.searchParams
  const paymentIntentId = searchParams.payment_intent

  if (!paymentIntentId) redirect('/')

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (!paymentIntent) redirect('/')

  const { status } = paymentIntent

  const statusContent =
    STATUS_CONTENT_MAP[status as keyof typeof STATUS_CONTENT_MAP] ||
    STATUS_CONTENT_MAP.default

  const session = await auth()

  return (
    <PaymentSuccessWrapper
      isSuccess={status === 'succeeded'}
      icon={statusContent.icon}
      iconColor={statusContent.iconColor}
      text={statusContent.text}
      href={statusContent.href}
      linkText={statusContent.linkText}
      paymentIntentId={paymentIntentId}
      isSignedIn={!!session}
      isStudent={session?.user?.role === 'student'}
    />
  )
}
