import {
  Quicksand,
  Fredoka,
  Nunito,
  Caveat,
  Cormorant_Garamond,
} from 'next/font/google'

export const quicksand = Quicksand({ subsets: ['latin'] })

export const fredoka = Fredoka({ subsets: ['latin'] })

export const caveat = Caveat({ subsets: ['latin'] })

export const cormorant_garamond = Cormorant_Garamond({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
})

export const nunito = Nunito({ subsets: ['latin'] })
