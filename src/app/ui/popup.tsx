interface PopupProps extends React.ComponentPropsWithRef<'div'> {
  className?: string
  children?: React.ReactNode
}

const Popup = ({ children, className, ...rest }: PopupProps) => {
  return (
    <div className={` ${className}`} {...rest}>
      {children}
    </div>
  )
}

export default Popup
