import type { Metadata } from 'next'
import '@/app/ui/globals.css'
import {
  quicksand,
  fredoka,
  nunito,
  caveat,
  cormorant_garamond,
} from '../ui/fonts'
import DashboardHeader from '../ui/dashboard/dashboard-header/dashboardHeader'
import { NotificationProvider } from '../ctx/notificationContext'
import { ThemeProvider } from 'next-themes'

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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/images/favicon.png' sizes='any' />
      </head>
      <body
        style={
          {
            '--color-focus': '#88dbf1',
          } as React.CSSProperties
        }
        className={`bg-dashboard-overall-bg ${quicksand.className} ${fredoka.className} ${caveat.className} ${cormorant_garamond.className} ${nunito.className} antialiased`}
      >
        <ThemeProvider attribute='class'>
          <NotificationProvider mode='admin'>
            <DashboardHeader />
            <main
              id='dashboard-main'
              className='min-h-[calc(100vh-72px)] overflow-x-hidden sm:min-h-[calc(100vh-76px)]'
              tabIndex={-1}
            >
              {children}
            </main>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
