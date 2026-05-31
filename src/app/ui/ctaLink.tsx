import Link from 'next/link'

type CTALinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  replace?: boolean
}

const CTALink = ({
  href,
  children,
  className,
  replace = false,
  ...rest
}: CTALinkProps) => {
  return (
    <Link
      href={href}
      replace={replace}
      className={`ctaBtn font-fredoka bg-gold-logo inline-block rounded-[24px] text-center align-baseline text-lg font-medium text-white hover:scale-98 active:scale-97 lg:inline-flex lg:items-center ${className}`}
      {...rest}
    >
      {children}
    </Link>
  )
}

export default CTALink
