interface AreaChartWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function AreaChartWrapper({
  children,
  className,
  ...rest
}: AreaChartWrapperProps) {
  return (
    <section
      className={`shadow-3 bg-dashboard-block-bg-1 col-span-full h-[40vh] min-h-[300px] w-full rounded-xl px-3 py-5 ${className}`}
      {...rest}
    >
      {children}
    </section>
  )
}
