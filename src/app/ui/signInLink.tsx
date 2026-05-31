'use client'

import { usePathname } from 'next/navigation'
import Link, { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'

type OHeaderAttributes = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
>

interface SignInLinkProps extends Omit<LinkProps, 'href'>, OHeaderAttributes {
  className?: string
}

export default function SignInLink({ className, ...rest }: SignInLinkProps) {
  const pathname = usePathname()

  return (
    <Link
      {...rest}
      className={className}
      href={`/login${pathname && pathname !== '/' ? `?callbackUrl=${encodeURIComponent(pathname)}` : ''}`}
    >
      Sign In
    </Link>
  )
}
