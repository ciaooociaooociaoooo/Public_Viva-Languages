import { fetchProgramById } from '@/app/lib/data'
import { notFound } from 'next/navigation'
import Program from '@/app/ui/program/program'
import { auth } from '@/auth'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const session = await auth()

  const params = await props.params
  const id = params.id

  const program = await fetchProgramById(id)

  if (!program || !program?.length) {
    notFound()
  }

  return (
    <div>
      <Program
        isSignedIn={!!session}
        isStudent={session?.user?.role === 'student'}
        program={program}
      />
    </div>
  )
}
