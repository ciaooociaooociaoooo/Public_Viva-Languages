interface DashboardDataWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function DashboardDataWrapper({
  children,
  className,
  ...rest
}: DashboardDataWrapperProps) {
  return (
    <section
      // calc(33.333%-32px) --- 32px from gap-8 in Page.tsx)
      className={`shadow-3 bg-dashboard-block-bg-1 col-span-full h-full w-full rounded-xl px-8 py-3 lg:col-span-2 ${className}`}
      {...rest}
    >
      {children}
    </section>
  )
}
