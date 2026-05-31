import type { Metadata } from 'next'
import '@/app/ui/globals.css'
import {
  quicksand,
  fredoka,
  nunito,
  caveat,
  cormorant_garamond,
} from '../ui/fonts'
import {
  fetchGuestCart,
  fetchPrograms,
  fetchSignedInCart,
  fetchSixLatestPrograms,
} from '@/app/lib/data'
import { groupProgramsByCategoryAndLanguage } from '@/app/lib/utils'
import Header from '../ui/header/header'
import Footer from '../ui/footer'
import { auth } from '@/auth'
import { CartResponseType } from '../lib/definitions'
import { NotificationProvider } from '../ctx/notificationContext'
import { LoadingProvider } from '../ctx/loadingContext'
import { SRAnnouncerProvider } from '../ctx/SRAnnouncerContext'

export const metadata: Metadata = {
  title: {
    template: '%s | Viva Languages',
    default: 'Viva Languages',
  },
  description:
    'Viva Languages offers fun, interactive French, Spanish, and Italian courses for kids and adults in a friendly learning environment.',
  metadataBase: new URL('https://viva-languages.vercel.app'),
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  let cart: CartResponseType
  if (session && session?.user?.role === 'student') {
    cart = await fetchSignedInCart()
  } else {
    cart = await fetchGuestCart()
  }

  const [programs, latest6Programs] = await Promise.all([
    fetchPrograms(),
    fetchSixLatestPrograms(),
  ])

  const programsGroupedBy = groupProgramsByCategoryAndLanguage(programs)

  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/images/favicon.png' sizes='any' />
      </head>
      <body
        className={`${quicksand.className} ${fredoka.className} ${caveat.className} ${cormorant_garamond.className} ${nunito.className} antialiased`}
      >
        <SRAnnouncerProvider>
          <LoadingProvider>
            <NotificationProvider>
              <Header
                isSignedIn={!!session}
                isAdmin={session?.user?.role === 'admin'}
                isStudent={session?.user?.role === 'student'}
                programsGroupedBy={programsGroupedBy}
                latest6Programs={latest6Programs}
                cart={cart}
              />
              <main
                id='main'
                className='min-h-[calc(100vh-72px)] overflow-x-hidden sm:min-h-[calc(100vh-76px)]'
                tabIndex={-1}
              >
                {children}
              </main>
              <Footer programsGroupedBy={programsGroupedBy} />
            </NotificationProvider>
          </LoadingProvider>
        </SRAnnouncerProvider>
      </body>
    </html>
  )
}
