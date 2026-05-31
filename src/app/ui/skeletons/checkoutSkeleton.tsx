export default function CheckoutSkeleton() {
  return (
    <div
      className='flex h-full flex-col rounded-[5px] bg-white'
      aria-busy='true'
      aria-hidden='true'
      aria-label='Loading payment methods'
    >
      <span className='sr-only'>Loading, please wait</span>

      <div className='grow-1'>
        <div className='mb-2'>
          <div className='mb-1 h-4 w-1/3 animate-pulse rounded bg-gray-200' />
          <div className='h-10 min-h-[42.3906px] w-full animate-pulse rounded-[5px] bg-gray-100' />
          <div className='mt-1 h-4 animate-pulse rounded bg-gray-100' />
        </div>

        <div className='mb-2'>
          <div className='mb-1 h-4 w-1/3 animate-pulse rounded bg-gray-200' />
          <div className='h-10 min-h-[42.3906px] w-full animate-pulse rounded-[5px] bg-gray-100' />
          <div className='mt-1 h-4 animate-pulse rounded bg-gray-100' />
        </div>

        <div className='mb-2'>
          <div className='mb-1 h-4 w-1/3 animate-pulse rounded bg-gray-200' />
          <div className='h-10 min-h-[42.3906px] w-full animate-pulse rounded-[5px] bg-gray-100' />
          <div className='mt-1 h-4 animate-pulse rounded bg-gray-100' />
        </div>

        <div className='mb-2'>
          <div className='mb-1 h-4 w-1/3 animate-pulse rounded bg-gray-200' />
          <div className='h-10 min-h-[42.3906px] w-full animate-pulse rounded-[5px] bg-gray-100' />
          <div className='mt-1 h-4 animate-pulse rounded bg-gray-100' />
        </div>
      </div>

      <div className='mt-10 flex min-h-[44px] w-full animate-pulse items-center justify-center rounded-[24px] bg-[#fdde77]'></div>
    </div>
  )
}
