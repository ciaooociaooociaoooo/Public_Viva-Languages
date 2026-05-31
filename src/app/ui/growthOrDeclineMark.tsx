import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'

interface GrowthOrDeclineMarkProps {
  isPositive: boolean
}

export default function GrowthOrDeclineMark({
  isPositive,
}: GrowthOrDeclineMarkProps) {
  return (
    <>
      {isPositive ? (
        <ArrowTrendingUpIcon className='[animate-[spin_1500ms_ease-in-out_1] text-dashboard-growth-text/70 w-10 animate-spin [animation-iteration-count:1]' />
      ) : (
        <ArrowTrendingDownIcon className='[animate-[spin_1500ms_ease-in-out_1] text-dashboard-decline-text/70 w-10 animate-spin [animation-iteration-count:1]' />
      )}
    </>
  )
}
