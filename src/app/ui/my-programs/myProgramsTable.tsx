import {
  HostType,
  ProgramsType,
  MyProgramsSortKey,
  SortOrder,
  TeacherType,
} from '@/app/lib/definitions'
import THead from '../tHead'
import Image from 'next/image'
import { LocalTime } from '../localTime'

interface MyProgramsTableProps {
  tHeadColumns: {
    name: string
    dbColumn: string
    sortable: boolean
  }[]
  programs: ProgramsType[]
  sortBy: MyProgramsSortKey
  sortOrder: SortOrder
  programsCount: number
  currentPage: number
  limit: number
}

export default function MyProgramsTable({
  tHeadColumns,
  programs,
  sortBy,
  sortOrder,
  programsCount,
  currentPage,
  limit,
}: MyProgramsTableProps) {
  return (
    <table className='my-table text-lg' aria-rowcount={programsCount + 1}>
      <THead
        tHeadColumns={tHeadColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
        colorText='text-theme-brown'
        colorBg='bg-overall-bg'
        colorColumnBg='bg-gold-2/25'
        colorColumnBgHovered='hover:bg-gold-2/25'
      />
      <tbody className='my-tbody'>
        {programs.map((program, i) => {
          const ariaRowIndex = (currentPage - 1) * limit + i + 2

          return (
            <tr
              key={program.order_item_id}
              className='text-nowrap'
              aria-rowindex={ariaRowIndex}
            >
              <td className='text-theme-brown flex items-center justify-center'>
                <Image
                  className='2xl:max-w-[79.703px]'
                  src={program.image_url}
                  alt='Poster of program'
                  width={program.image_width}
                  height={program.image_height}
                />
              </td>
              <td className='text-theme-brown'>{program.program_name}</td>
              <td className='text-theme-brown'>
                {program.language_name ?? '/'}
              </td>
              <td className='text-theme-brown'>{program.level_code}</td>
              <td className='text-theme-brown'>{program.age_group}</td>
              <td className='text-theme-brown'>
                {program?.teachers?.length > 0
                  ? program.teachers.map((teacher: TeacherType) => teacher.name)
                  : program.hosts.map((host: HostType) => host.name)}
              </td>
              <td className='text-theme-brown'>
                {program.total_lessons ?? '/'}
              </td>
              <td className='text-theme-brown'>
                {!program?.enrollment_date ? (
                  '/'
                ) : (
                  <LocalTime
                    isoString={new Date(program.enrollment_date).toISOString()}
                  />
                )}
              </td>
              <td className='text-theme-brown'>&#36;{program.price}</td>
              <td className='text-theme-brown'>{program.payment_status}</td>
              <td className='text-theme-brown'>
                {!program?.paid_at ? (
                  '/'
                ) : (
                  <LocalTime
                    isoString={new Date(program.paid_at).toISOString()}
                  />
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
