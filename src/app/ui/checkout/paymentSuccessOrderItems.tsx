'use client'

import { PaymentSuccessOrderType } from '@/app/lib/definitions'
import Image from 'next/image'
import Link from 'next/link'

interface PaymentSuccessOrderItemsProps {
  order: PaymentSuccessOrderType | null
}

export default function PaymentSuccessOrderItems({
  order,
}: PaymentSuccessOrderItemsProps) {
  let orderItemsContent, totalContent

  if (order && order?.items?.length > 0) {
    orderItemsContent = order.items.map((orderItem) => (
      <div
        key={orderItem.order_item_id}
        className='text-theme-brown font-quicksand w-full max-w-[500px] px-20 py-6 text-center text-xl font-medium sm:w-1/3 sm:px-10 lg:w-1/3 lg:px-20'
      >
        <Link
          href={`/program/${orderItem.program_id}`}
          replace={true}
          aria-label={`go to ${orderItem.name} page`}
        >
          <Image
            className='rounded-4xl'
            src={orderItem.image_url}
            alt={`Poster of ${orderItem.name}`}
            width={orderItem.image_width}
            height={orderItem.image_height}
          />
        </Link>
        <div className='mt-4'>&times; {orderItem.quantity}</div>
      </div>
    ))

    totalContent = order.total
  } else {
    orderItemsContent = null
    totalContent = null
  }

  return (
    <>
      <div className='font-quicksand text-theme-brown mb-7 w-full text-center text-[26px] font-medium'>
        <span className='border-b-solid border-b-1 border-b-inherit'>
          Total: &#36;{totalContent}
        </span>
      </div>
      <div className='flex flex-wrap justify-around lg:px-8'>
        {orderItemsContent}
      </div>
    </>
  )
}
