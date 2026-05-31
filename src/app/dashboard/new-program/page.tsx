import { auth, isUserActive } from '@/auth'
import { redirect } from 'next/navigation'
import {
  fetchCategories,
  fetchLevels,
  fetchLanguages,
  fetchTeachers,
  fetchHosts,
} from '@/app/lib/data'
import NewProgramForm from '@/app/ui/dashboard/new-program/newProgramForm'

export default async function Page() {
  // Authentication & Authorization
  const callbackUrl = '/dashboard/new-program'

  const session = await auth()
  if (!session)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  const isActive = await isUserActive(session?.user?.email)
  if (!isActive)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  if (session?.user?.role !== 'admin') redirect('/')
  // End Authentication & Authorization

  const [categories, levels, languages, teachers, hosts] = await Promise.all([
    fetchCategories(),
    fetchLevels(),
    fetchLanguages(),
    fetchTeachers(),
    fetchHosts(),
  ])

  return (
    <div className='flex min-h-[calc(100vh-72px)] items-center justify-center sm:min-h-[calc(100vh-76px)]'>
      <div className='w-full max-w-[3024px] px-6 py-10 sm:px-12 sm:py-20'>
        <NewProgramForm
          categories={categories}
          levels={levels}
          languages={languages}
          teachers={teachers}
          hosts={hosts}
        />
      </div>
    </div>
  )
}
