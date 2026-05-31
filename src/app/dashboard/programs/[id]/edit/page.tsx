import { auth, isUserActive } from '@/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  fetchProgramById,
  fetchCategories,
  fetchLevels,
  fetchLanguages,
  fetchTeachers,
  fetchHosts,
} from '@/app/lib/data'
import EditProgramForm from '@/app/ui/dashboard/edit-program/editProgramForm'
import { notFound } from 'next/navigation'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = params.id

  // Authentication & Authorization
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const headersList = await headers()
  const host = headersList.get('host')
  const pathname = '/dashboard/programs'

  const callbackUrl = `${protocol}://${host}${pathname}/${id}/edit`

  const session = await auth()
  if (!session)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  const isActive = await isUserActive(session?.user?.email)
  if (!isActive)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  if (session?.user?.role !== 'admin') redirect('/')
  // End Authentication & Authorization

  const [program, categories, levels, languages, teachers, hosts] =
    await Promise.all([
      fetchProgramById(id),
      fetchCategories(),
      fetchLevels(),
      fetchLanguages(),
      fetchTeachers(),
      fetchHosts(),
    ])

  if (!program || !program?.length) {
    notFound()
  }

  return (
    <div className='w-full max-w-[3024px] px-6 py-10 sm:px-12 sm:py-20'>
      <EditProgramForm
        program={program[0]}
        categories={categories}
        levels={levels}
        languages={languages}
        teachers={teachers}
        hosts={hosts}
      />
    </div>
  )
}
