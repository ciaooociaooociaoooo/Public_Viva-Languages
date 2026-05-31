import type { Metadata } from 'next'
import '@/app/ui/globals.css'
import {
  quicksand,
  fredoka,
  nunito,
  caveat,
  cormorant_garamond,
} from '../ui/fonts'

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
    <html lang='en'>
      <head>
        <link rel='icon' href='/images/favicon.png' sizes='any' />
      </head>
      <body
        className={`${quicksand.className} ${fredoka.className} ${caveat.className} ${cormorant_garamond.className} ${nunito.className} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
