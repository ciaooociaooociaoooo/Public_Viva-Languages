interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className_span?: string
}

const Button = ({
  children,
  className,
  className_span,
  ...rest
}: ButtonProps) => {
  return (
    <button className={` ${className}`} {...rest}>
      <span className={`${className_span}`}>{children}</span>
    </button>
  )
}

export default Button
