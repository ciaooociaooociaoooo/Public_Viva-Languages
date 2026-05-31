import clsx from 'clsx'
import Link from 'next/link'

export default function SkipToContent({
  mode = 'default',
}: {
  mode?: 'default' | 'admin'
}) {
  return (
    <Link
      id='skip-to-content'
      href={mode === 'admin' ? '#dashboard-main' : '#main'}
      className={clsx(
        'fixed top-0 left-0 inline-block translate-y-0 rounded-b-2xl px-5 py-2 text-xl duration-300 ease-in not-focus-visible:-translate-y-full',
        mode === 'admin'
          ? 'bg-dashboard-accessibility-bg-1 text-dashboard-accessibility-color-1'
          : 'bg-accessibility-bg-1 text-accessibility-color-1',
      )}
    >
      Skip to content
    </Link>
  )
}
