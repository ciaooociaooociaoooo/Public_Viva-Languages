import { fetchGuestCart, fetchSignedInCart } from '@/app/lib/data'
import { CartResponseType } from '@/app/lib/definitions'
import { auth, isUserActive } from '@/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { stripe } from '@/app/lib/stripe'
import Checkout from '@/app/ui/checkout/checkout'
import Link from 'next/link'

export default async function Page() {
  // Authentication & Authorization for signed in users
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const headersList = await headers()
  const host = headersList.get('host')
  const pathname = '/checkout'

  const callbackUrl = `${protocol}://${host}${pathname}`

  const session = await auth()

  if (session) {
    const isActive = await isUserActive(session?.user?.email)
    if (!isActive)
      redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

    if (session?.user?.role === 'admin') redirect('/dashboard')

    if (session?.user?.role !== 'student') redirect('/')
  }
  // End Authentication & Authorization for signed in users

  // Fetch cart
  let cart: CartResponseType
  if (session && session.user.role === 'student') {
    cart = await fetchSignedInCart()
  } else {
    cart = await fetchGuestCart()
  }

  if (!cart?.items?.length) {
    redirect('/')
  }
  // End Fetch cart

  return (
    <div className='relative'>
      <Link className='absolute top-0 left-2 inline-block lg:left-14' href='/' aria-label='go to home page'>
        <div className='relative h-15 w-20 overflow-clip'>
          <img
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[36%] scale-150'
            src='/Logo2_nobg.svg'
            alt='Logo'
          />
        </div>
      </Link>

      <Checkout
        isSignedIn={!!session}
        isStudent={!!(session && session.user.role === 'student')}
        cart={cart}
      />
    </div>
  )
}
