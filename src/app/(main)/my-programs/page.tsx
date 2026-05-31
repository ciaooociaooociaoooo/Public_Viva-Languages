import { auth, isUserActive } from '@/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  fetchStudentOrders,
  fetchStudentOrdersTotalPages,
} from '@/app/lib/data'
import MyProgramsTable from '@/app/ui/my-programs/myProgramsTable'
import {
  myProgramsColumns,
  MyProgramsSortKey,
  SortOrder,
} from '@/app/lib/definitions'
import Pagination from '@/app/ui/pagination'
import Search from '@/app/ui/search'

export default async function Page(props: {
  searchParams?: Promise<{
    sortBy?: MyProgramsSortKey
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
  const pathname = '/my-programs'

  const callbackUrl = `${protocol}://${host}${pathname}${searchParams && Object.keys(searchParams)?.length ? '/?' + new URLSearchParams(searchParams).toString() : ''}`

  const session = await auth()
  if (!session)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  const isActive = await isUserActive(session?.user?.email)
  if (!isActive)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  if (session?.user?.role === 'admin') redirect('/dashboard')

  if (session?.user?.role !== 'student') redirect('/')
  // End Authentication & Authorization

  const sortBy = searchParams?.sortBy || 'program_name'
  const sortOrder = searchParams?.sortOrder || 'asc'
  const currentPage = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 5
  const query = searchParams?.query || ''

  const [programs, { totalPages: totalPagesProgram, programsCount }] =
    await Promise.all([
      fetchStudentOrders(sortBy, sortOrder, limit, currentPage, query),
      fetchStudentOrdersTotalPages(limit, query),
    ])

  let content

  if (!programs?.length) {
    content = (
      <div
        className='my-table bg-overall-bg flex items-center justify-center text-xl'
        tabIndex={-1}
      >
        <p className='text-theme-brown'>No Result...</p>
      </div>
    )
  } else {
    content = (
      <MyProgramsTable
        tHeadColumns={myProgramsColumns}
        programs={programs}
        sortBy={sortBy}
        sortOrder={sortOrder}
        programsCount={programsCount}
        currentPage={currentPage}
        limit={limit}
      />
    )
  }

  return (
    <div className='flex min-h-[calc(100vh-72px)] flex-col justify-center sm:min-h-[calc(100vh-76px)]'>
      <div className='my-table-wrapper'>
        <Search
          query={query}
          hasLabel={false}
          className_wrapper='px-5 w-screen lg:w-[33.333vw] mb-12'
          className_input='block w-full rounded-2xl px-5 bg-gold-2/25 text-lg text-theme-brown py-2 placeholder:text-theme-brown/50'
          placeholder='Search... (case sensitive)'
          className_magnifyingGlassIcon='text-theme-brown/50 peer-focus:text-theme-brown/60'
        />
        {content}
        <Pagination
          totalPages={totalPagesProgram}
          currentPage={currentPage}
          limit={limit}
          dataCount={programsCount}
          currentPageItemsCount={programs.length}
          colorText='text-theme-brown'
          colorTextDisabled='text-theme-brown/50'
          bgInput='bg-gold-2/25'
        />
      </div>
    </div>
  )
}
