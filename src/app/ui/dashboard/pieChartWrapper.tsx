'use client'

interface PieChartWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PieChartWrapper({
  children,
  className,
  ...rest
}: PieChartWrapperProps) {
  return (
    <section
      // (calc(50%-17px) --- 17px from gap-8 in Page.tsx)
      className={`shadow-3 bg-dashboard-block-bg-1 col-span-1 flex w-full flex-col items-center justify-center overflow-visible rounded-xl p-5 sm:col-span-3 ${className}`}
      {...rest}
    >
      {children}
    </section>
  )
}
