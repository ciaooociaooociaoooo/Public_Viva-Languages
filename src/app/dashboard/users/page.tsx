import { auth, isUserActive } from '@/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { fetchUsers, fetchUsersTotalPages } from '@/app/lib/data'
import { usersColumns, UsersSortKey, SortOrder } from '@/app/lib/definitions'
import UsersTable from '@/app/ui/dashboard/users/usersTable'
import Pagination from '@/app/ui/pagination'
import Search from '@/app/ui/search'

export default async function page(props: {
  searchParams?: Promise<{
    sortBy?: UsersSortKey
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
  const pathname = '/dashboard/users'

  const callbackUrl = `${protocol}://${host}${pathname}${searchParams && Object.keys(searchParams)?.length ? '/?' + new URLSearchParams(searchParams).toString() : ''}`

  const session = await auth()
  if (!session)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  const isActive = await isUserActive(session?.user?.email)
  if (!isActive)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  if (session?.user?.role !== 'admin') redirect('/')
  // End Authentication & Authorization

  const sortBy = searchParams?.sortBy || 'user_name'
  const sortOrder = searchParams?.sortOrder || 'asc'
  const currentPage = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 5
  const query = searchParams?.query || ''

  const [users, { totalPages: totalPagesUsers, usersCount }] =
    await Promise.all([
      fetchUsers(sortBy, sortOrder, limit, currentPage, query),
      fetchUsersTotalPages(limit, query),
    ])

  let content

  if (!users?.length) {
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
      <UsersTable
        tHeadColumns={usersColumns}
        users={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        usersCount={usersCount}
        currentPage={currentPage}
        limit={limit}
      />
    )
  }

  return (
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
        totalPages={totalPagesUsers}
        currentPage={currentPage}
        limit={limit}
        dataCount={usersCount}
        currentPageItemsCount={users.length}
      />
    </div>
  )
}
