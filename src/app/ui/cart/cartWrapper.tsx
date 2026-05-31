'use client'

import { useState, useEffect, useRef, useId } from 'react'
import clsx from 'clsx'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Overlay from '../overlay'
import Popup from '../popup'
import Cart from './cart'
import { CartResponseType } from '@/app/lib/definitions'
import { usePathname } from 'next/navigation'
import { isTopDialog, popDialog, pushDialog } from '@/app/lib/utils'

interface CartWrapperProps {
  isSignedIn: boolean
  isStudent: boolean
  cart: CartResponseType
}

gsap.registerPlugin(useGSAP)

const CartWrapper = ({ isSignedIn, isStudent, cart }: CartWrapperProps) => {
  const [isClicked, setIsClicked] = useState(false)

  const pathname = usePathname()

  const toggleCartBtnRef = useRef<HTMLButtonElement>(null)

  const cartFocusRef = useRef<HTMLDivElement>(null)

  const initRef = useRef<boolean>(true)

  const id = useId()

  // (Accessibility)
  // (So Esc key can close cart.)
  useEffect(() => {
    if (!isClicked) return

    pushDialog(id)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopDialog(id)) {
        setIsClicked(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      popDialog(id)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isClicked, id])

  // (Accessibility)
  // (So items under overlay are not tabbable.)
  useEffect(() => {
    if (initRef.current) {
      initRef.current = false
      return
    }

    const main = document.getElementById('main')
    const footer = document.getElementById('wave')
    const headerLogo = document.getElementById('header-logo')
    const topbar = document.getElementById('topbar')
    const cartBtn = document.getElementById('cart-button')
    const skipToContent = document.getElementById('skip-to-content')
    const burgerBtn = document.getElementById('burger-btn')

    if (isClicked) {
      main?.setAttribute('inert', '')
      footer?.setAttribute('inert', '')
      headerLogo?.setAttribute('inert', '')
      topbar?.setAttribute('inert', '')
      cartBtn?.setAttribute('inert', '')
      skipToContent?.setAttribute('inert', '')
      burgerBtn?.setAttribute('inert', '')
      // (So number of cart items will be announced automatically by screen reader when cart opens)
      // (setTimeout - to wait for the animation and scrollbar)
      setTimeout(() => {
        cartFocusRef.current?.focus()
      }, 150)
    } else {
      main?.removeAttribute('inert')
      footer?.removeAttribute('inert')
      headerLogo?.removeAttribute('inert')
      topbar?.removeAttribute('inert')
      cartBtn?.removeAttribute('inert')
      skipToContent?.removeAttribute('inert')
      burgerBtn?.removeAttribute('inert')
      // (So the cart toggle btn will be focused after cart is closed)
      // (setTimeout - to wait for the animation and scrollbar)
      setTimeout(() => {
        toggleCartBtnRef.current?.focus()
      }, 150)
    }
  }, [isClicked])

  useEffect(() => {
    if (isClicked) {
      // setTimeout - so users won't see the white space when scrollbar disappears.
      setTimeout(() => {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth

        document.body.style.overflow = 'hidden'
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }, 5)
    } else {
      setTimeout(() => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }, 100)
    }
  }, [isClicked])

  // On mount, if there's item in cart, do this cart number bouncing animation.
  useGSAP(
    () => {
      const tl = gsap.timeline()

      if (cart?.items?.length > 0) {
        tl.to('#gsapTarget_cartWrapper', {
          y: -40,
          scale: 2.5,
          ease: 'power1.out',
          duration: 0.8,
        })
        tl.to('#gsapTarget_cartWrapper', {
          y: 0,
          scale: 1,
          ease: 'bounce.out',
          duration: 0.8,
        })
      }
    },
    { dependencies: [cart], scope: toggleCartBtnRef },
  )

  useEffect(() => {
    setIsClicked(false)
  }, [pathname])

  return (
    <>
      <button
        id='cart-button'
        className='relative size-9 cursor-pointer content-center hover:scale-110 sm:size-[38px]'
        ref={toggleCartBtnRef}
        onClick={() => setIsClicked((prev) => !prev)}
        aria-haspopup='dialog'
        aria-expanded={isClicked}
        // aria-controls='cart-dialog'
      >
        <span title='My Cart' aria-hidden>
          <img
            className='h-full'
            src='/shopping-cart.svg'
            alt='Shopping Cart'
          />
          {cart?.items?.length > 0 && (
            <>
              <span
                id='gsapTarget_cartWrapper'
                className='border-theme-gold bg-theme-gold absolute -right-2.5 -bottom-[1px] flex size-4 items-center justify-center rounded-full border-2 text-xs text-white sm:-bottom-[2px] lg:right-[-14px] lg:size-5'
              >
                {cart.items.length}
              </span>
            </>
          )}
        </span>
        <span className='sr-only' aria-live='polite' aria-atomic='true'>
          your cart: {cart.items.length} items in cart
        </span>
      </button>

      <Overlay
        className={clsx(
          'bg-[#020f12]/30 transition-all duration-300',
          isClicked
            ? 'pointer-events-auto visible opacity-100'
            : 'pointer-events-none invisible opacity-0',
        )}
        onClick={() => setIsClicked(false)}
        aria-hidden='true'
      />

      <Popup
        // id='cart-dialog'
        className={clsx(
          'bg-overall-bg shadow-1 text-theme-brown border-dusty-rose/30 fixed top-0 right-0 z-1001 h-full w-full overflow-hidden rounded-l-4xl border-1 border-solid text-xl leading-10 transition-all duration-300 sm:max-lg:w-2/3 lg:w-[400px]',
          isClicked
            ? 'pointer-events-auto visible translate-x-0'
            : 'pointer-events-none invisible translate-x-full',
        )}
        role='dialog'
        // tabIndex={-1}
        aria-modal='true'
        aria-labelledby='cart-title'
      >
        <Cart
          isSignedIn={isSignedIn}
          isStudent={isStudent}
          cart={cart}
          setIsClicked={setIsClicked}
          isClicked={isClicked}
          cartFocusRef={cartFocusRef}
        />
      </Popup>
    </>
  )
}

export default CartWrapper
