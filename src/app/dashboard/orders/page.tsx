import { auth, isUserActive } from '@/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  adminOrdersColumns,
  AdminOrdersSortKey,
  SortOrder,
} from '@/app/lib/definitions'
import Pagination from '@/app/ui/pagination'
import Search from '../../ui/search'
import OrdersTable from '@/app/ui/dashboard/orders/ordersTable'
import { fetchAdminOrders, fetchAdminOrdersTotalPages } from '@/app/lib/data'

export default async function Page(props: {
  searchParams?: Promise<{
    sortBy?: AdminOrdersSortKey
    sortOrder?: SortOrder
    page: string
    limit: string
    query: string
  }>
}) {
  const searchParams = await props.searchParams

  // Authentication & Authorization
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const headersList = await headers()
  const host = headersList.get('host')
  const pathname = '/dashboard/orders'

  const callbackUrl = `${protocol}://${host}${pathname}${searchParams && Object.keys(searchParams)?.length ? '/?' + new URLSearchParams(searchParams).toString() : ''}`

  const session = await auth()
  if (!session)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  const isActive = await isUserActive(session?.user?.email)
  if (!isActive)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  if (session?.user?.role !== 'admin') redirect('/')
  // End Authentication & Authorization

  const sortBy = searchParams?.sortBy || 'order_id'
  const sortOrder = searchParams?.sortOrder || 'asc'
  const currentPage = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 5
  const query = searchParams?.query || ''

  const [orders, { totalPages: totalPagesOrders, ordersCount }] =
    await Promise.all([
      fetchAdminOrders(sortBy, sortOrder, limit, currentPage, query),
      fetchAdminOrdersTotalPages(limit, query),
    ])

  let content

  if (!orders?.length) {
    content = (
      <div
        className='dashboard-table bg-dashboard-overall-bg flex items-center justify-center text-xl'
        tabIndex={-1}
      >
        <p className='text-dashboard-search-text'>No Result...</p>
      </div>
    )
  } else {
    content = (
      <OrdersTable
        tHeadColumns={adminOrdersColumns}
        orders={orders}
        sortBy={sortBy}
        sortOrder={sortOrder}
        ordersCount={ordersCount}
        currentPage={currentPage}
        limit={limit}
      />
    )
  }

  return (
    <div className='flex min-h-[calc(100vh-72px)] flex-col justify-center sm:min-h-[calc(100vh-76px)]'>
      <div className='dashboard-table-wrapper'>
        <Search
          query={query}
          hasLabel={false}
          className_wrapper='px-5 w-screen lg:w-[33.333vw] mb-12'
          className_input='block w-full rounded-2xl px-5 bg-dashboard-search-bg/90 text-lg text-dashboard-search-text py-2 placeholder:text-dashboard-search-text/50'
          placeholder='Search... (case sensitive)'
          className_magnifyingGlassIcon='text-dashboard-search-text/50 peer-focus:text-dashboard-search-text/60'
        />
        {content}
        <Pagination
          totalPages={totalPagesOrders}
          currentPage={currentPage}
          limit={limit}
          dataCount={ordersCount}
          currentPageItemsCount={orders.length}
        />
      </div>
    </div>
  )
}
