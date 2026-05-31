'use client'

interface OverlayProps {
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
  children?: React.ReactNode
}

const Overlay = ({ children, className, ...rest }: OverlayProps) => {
  return (
    <div
      className={`fixed top-0 left-0 z-1000 size-full ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Overlay
