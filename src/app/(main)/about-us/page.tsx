import { fetchHostsWithEvents, fetchTeachersWithCourses } from '@/app/lib/data'
import Intro from '@/app/ui/about-us/intro'
import Team from '@/app/ui/about-us/team'

export default async function Page() {
  const [teachers, hosts] = await Promise.all([
    fetchTeachersWithCourses(),
    fetchHostsWithEvents(),
  ])

  return (
    <div className='flex min-h-[calc(100vh-72px)] items-center justify-center sm:min-h-[calc(100vh-76px)]'>
      <div className='max-w-[3024px] px-6 sm:px-10'>
        <Intro />
        <Team teachers={teachers} hosts={hosts} />
      </div>
    </div>
  )
}
