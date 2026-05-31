'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  ProgramsType,
  TeacherType,
  HostType,
  SortKey,
  SortOrder,
} from '../../../lib/definitions'
import THead from '../../tHead'
import Link from 'next/link'
import DeleteModal from '../../deleteModal'
import { deleteAdminProgram, deleteAdminPrograms } from '@/app/lib/actions'
import { usePathname, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { LocalTime } from '../../localTime'

interface ProgramsTableProps {
  tHeadColumns: {
    name: string
    dbColumn: string
    sortable: boolean
    bulkDelete?: boolean
  }[]
  programs: ProgramsType[]
  sortBy: SortKey
  sortOrder: SortOrder
  programsCount: number
  currentPage: number
  limit: number
}

export default function ProgramsTable({
  tHeadColumns,
  programs,
  sortBy,
  sortOrder,
  programsCount,
  currentPage,
  limit,
}: ProgramsTableProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchString = searchParams?.toString()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  const [isDeletingSingleProgram, setIsDeletingSingleProgram] =
    useState<boolean>(false)

  const [programId, setProgramId] = useState<string | null>(null)

  const [titleModal, setTitleModal] = useState<string | null>(null)

  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const deleteMultiBtnRef = useRef<HTMLButtonElement>(null)
  const deleteSingleBtnRef = useRef<HTMLButtonElement>(null)

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    )
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === programs.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(programs.map((program) => program.program_id))
    }
  }

  useEffect(() => {
    setSelectedItems([])
  }, [pathname, searchString])

  const handleDeleteSingleProgramClick = (id: string) => {
    setProgramId(id)
    setTitleModal('Are you sure you want to delete this item?')
    setIsDeletingSingleProgram(true)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteMultiProgramsClick = () => {
    setTitleModal(
      `Are you sure you want to delete these ${selectedItems?.length || ''} items?`,
    )
    setIsDeletingSingleProgram(false)
    setIsDeleteModalOpen(true)
  }

  const deleteFn =
    isDeletingSingleProgram && programId
      ? deleteAdminProgram.bind(null, programId)
      : deleteAdminPrograms.bind(null, selectedItems)

  const btnToFocusOnModalClose =
    isDeletingSingleProgram && programId
      ? deleteSingleBtnRef
      : deleteMultiBtnRef

  const callbackOnSuccess = () => {
    if (programId) {
      setProgramId(null)
    }
    setTitleModal(null)
    setSelectedItems([])
  }

  return (
    <div className='relative'>
      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
        title={titleModal ?? 'Are you sure you want to delete this item?'}
        actionFn={deleteFn}
        callBackOnSuccess={callbackOnSuccess}
        elToFocusOnModalClose={btnToFocusOnModalClose}
      />

      <div
        className='sr-only'
        role='status'
      >{`${selectedItems?.length || '0'} ${selectedItems?.length > 1 ? 'items' : 'item'} selected`}</div>
      <div
        id='dashboard-programs-delete-programs-container'
        className={clsx(
          'bg-dashboard-hovered/90 text-dashboard-text-4 absolute -top-10 left-[20px] flex gap-2 rounded-2xl px-5 py-1 text-lg',
          selectedItems?.length > 0
            ? 'pointer-events-auto visible opacity-100'
            : 'pointer-events-none invisible opacity-0',
        )}
      >
        <p>{`${selectedItems?.length || '0'} ${selectedItems?.length > 1 ? 'items' : 'item'} selected`}</p>
        <button
          ref={deleteMultiBtnRef}
          onClick={handleDeleteMultiProgramsClick}
          aria-label={`Delete ${selectedItems?.length} selected ${selectedItems?.length > 1 ? 'items' : 'item'}`}
        >
          <img
            className='size-6 cursor-pointer hover:scale-110'
            src='/delete-svgrepo-com.svg'
            alt='Delete Program'
          />
        </button>
      </div>

      <table
        id='dashboard-programs-table'
        className='dashboard-table text-lg'
        aria-rowcount={programsCount + 1}
      >
        <THead
          tHeadColumns={tHeadColumns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          toggleSelectAll={toggleSelectAll}
          isAllSelected={
            selectedItems.length === programs.length && programs.length > 0
          }
        />
        <tbody className='dashboard-tbody'>
          {programs.map((program, i) => {
            const ariaRowIndex = (currentPage - 1) * limit + i + 2

            return (
              <tr
                key={program.program_id}
                className='border-dashboard-table-border border-1 border-solid text-nowrap'
                aria-rowindex={ariaRowIndex}
              >
                <td className='text-dashboard-text-4'>
                  <div className='flex items-center justify-center'>
                    <input
                      className='size-4 cursor-pointer'
                      type='checkbox'
                      checked={selectedItems.includes(program.program_id)}
                      onChange={() => toggleItem(program.program_id)}
                    />
                  </div>
                </td>
                <td className='min-w-40'>
                  <div className='flex items-center justify-around'>
                    <Link
                      className=''
                      target='_blank'
                      href={`/program/${program.program_id}`}
                      aria-label={`Open new tab for ${program.program_name}`}
                    >
                      <img
                        className='size-6 cursor-pointer hover:scale-110'
                        src='/open-new-svgrepo-com.svg'
                        alt='Open New Tab'
                      />
                    </Link>
                    <Link
                      className=''
                      target='_blank'
                      href={`/dashboard/programs/${program.program_id}/edit`}
                      aria-label={`Open new tab to edit ${program.program_name}`}
                    >
                      <img
                        className='size-6 cursor-pointer hover:scale-110'
                        src='/edit-svgrepo-com.svg'
                        alt='Edit Program'
                      />
                    </Link>
                    <button
                      ref={
                        programId === program.program_id
                          ? deleteSingleBtnRef
                          : null
                      }
                      onClick={() =>
                        handleDeleteSingleProgramClick(program.program_id)
                      }
                      aria-label={`Delete ${program.program_name}`}
                    >
                      <img
                        className='size-6 cursor-pointer hover:scale-110'
                        src='/delete-svgrepo-com.svg'
                        alt='Delete Program'
                      />
                    </button>
                  </div>
                </td>
                <td className='text-dashboard-text-4'>
                  <Image
                    src={program.image_url}
                    alt='Poster of program'
                    width={program.image_width}
                    height={program.image_height}
                  />
                </td>
                <td className='text-dashboard-text-4'>
                  {program.program_name}
                </td>
                <td className='text-dashboard-text-4'>{program.program_id}</td>
                <td className='text-dashboard-text-4'>
                  {program.category_name}
                </td>
                <td className='text-dashboard-text-4'>
                  {program?.teachers?.length > 0
                    ? program.teachers.map(
                        (teacher: TeacherType) => teacher.name,
                      )
                    : program.hosts.map((host: HostType) => host.name)}
                </td>
                <td className='text-dashboard-text-4'>
                  {program?.language_name ?? '/'}
                </td>
                <td className='text-dashboard-text-4'>
                  {program?.total_lessons ?? '/'}
                </td>
                <td className='text-dashboard-text-4'>{program.level_code}</td>
                <td className='text-dashboard-text-4'>{program.age_group}</td>
                <td className='text-dashboard-text-4'>
                  {program.enrollment_limit}
                </td>
                <td className='text-dashboard-text-4'>&#36;{program.price}</td>
                <td className='text-dashboard-text-4'>
                  {program.purchase_count}
                </td>
                <td className='text-dashboard-text-4'>
                  &#36;{program.revenue}
                </td>
                <td className='text-dashboard-text-4'>
                  <LocalTime
                    isoString={new Date(program.created_at).toISOString()}
                  />
                </td>
                <td className='text-dashboard-text-4'>
                  <LocalTime
                    isoString={new Date(program.updated_at).toISOString()}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
