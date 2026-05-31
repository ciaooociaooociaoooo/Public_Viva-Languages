import { auth, isUserActive, signIn } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Button from '../ui/button'
import { AuthError } from 'next-auth'

export default async function Page(props: {
  searchParams?: Promise<{
    callbackUrl?: string
    error?: string
  }>
}) {
  const session = await auth()
  if (session) {
    if (session?.user?.email) {
      const isActive = await isUserActive(session.user.email)
      if (isActive) {
        if (session?.user?.role === 'admin') redirect('/dashboard')
        if (session?.user?.role !== 'admin') redirect('/')
      }
    }
  }

  const searchParams = await props.searchParams

  const callbackUrl = searchParams?.callbackUrl || '/'

  const error = searchParams?.error

  let errorMsg
  if (error === 'CredentialsSignin') {
    errorMsg = (
      <div className='bg-theme-light-blue fixed top-0 left-1/2 z-1 w-screen -translate-x-1/2 text-center'>
        <p className='text-dashboard-inactive-select-text font-quicksand py-1 text-2xl'>
          Invalid Admin Credentials
        </p>
      </div>
    )
  } else if (error === 'AccessDenied') {
    errorMsg = (
      <div className='bg-theme-light-blue fixed top-0 left-1/2 z-1 w-screen -translate-x-1/2 text-center'>
        <p className='text-dashboard-inactive-select-text font-quicksand py-1 text-2xl'>
          Access Denied
        </p>
      </div>
    )
  } else {
    errorMsg = (
      <div className='bg-theme-light-blue fixed top-0 left-1/2 z-1 w-screen -translate-x-1/2 text-center'>
        <p className='text-dashboard-inactive-select-text font-quicksand py-1 text-2xl'>
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className='h-screen w-screen'>
      {error && <div aria-hidden>{errorMsg}</div>}
      <div className='sr-only' aria-live='assertive'>
        {error && <div role='alert'>{errorMsg}</div>}
      </div>

      <div className='relative size-full'>
        <div className='absolute top-0 left-0 h-auto w-[23%] max-w-[200px] translate-x-[30%] translate-y-[30%] lg:translate-x-[45%]'>
          <Link href='/' aria-label='go to home page'>
            <img src='/Logo_round_best.svg' alt='Logo' />
          </Link>
        </div>
        <div className='absolute top-1/2 right-1/2 w-full translate-x-1/2 -translate-y-1/2 px-5 lg:top-1/3 lg:right-1/4 lg:w-auto lg:translate-0 lg:px-0'>
          <div className='mt-7 flex flex-col items-center justify-center'>
            <div className='font-cormorant_garamond text-theme-light-blue text-4xl font-medium sm:text-5xl'>
              <h1 className='fade-in-bottom-right'>Sign In / Sign Up</h1>
            </div>

            {/* Demo Admin Sign In Button */}
            <form
              className='mt-11'
              action={async (_formData) => {
                'use server'
                try {
                  await signIn('credentials', {
                    email: process.env.DEMO_ADMIN_EMAIL,
                    password: process.env.DEMO_ADMIN_PASSWORD,
                    redirectTo: callbackUrl,
                  })
                } catch (error) {
                  if (error instanceof AuthError) {
                    return redirect(
                      `/login?callbackUrl=${encodeURIComponent(callbackUrl)}&error=${error.type}`,
                    )
                  }
                  throw error
                }
              }}
            >
              <Button
                className='fade-in-top ctaBtn2 relative w-full rounded-4xl bg-white px-15 py-3 lg:px-25'
                type='submit'
              >
                <img
                  className='absolute top-1/2 left-0 size-8 translate-x-4.5 -translate-y-1/2 lg:translate-x-7.5'
                  src='/tools-svgrepo-com.svg'
                  alt='Sign In as Admin'
                  aria-hidden
                />
                <div className='font-cormorant_garamond -mr-2 min-w-[197.13px] pl-2 text-center text-2xl font-medium text-black lg:mr-0 lg:min-w-[189.13px] lg:pl-0'>
                  Sign In as Admin
                </div>
              </Button>
            </form>

            {/* Google Login Button */}
            <form
              className='mt-9'
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: callbackUrl })
              }}
            >
              <Button
                className='fade-in-top ctaBtn2 relative rounded-4xl bg-white px-15 py-3 lg:px-25'
                type='submit'
              >
                <img
                  className='absolute top-1/2 left-0 size-7 translate-x-5 -translate-y-1/2 lg:translate-x-8'
                  src='/google-color-svgrepo-com.svg'
                  alt='Google Sign In'
                  aria-hidden
                />
                <div className='font-cormorant_garamond -mr-2 pl-2 text-center text-2xl font-medium text-black lg:mr-0 lg:pl-0'>
                  Sign In with Google
                </div>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
