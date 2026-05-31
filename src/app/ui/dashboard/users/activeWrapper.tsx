'use client'

import { useState, useTransition } from 'react'
import Button from '../../button'
import clsx from 'clsx'
import { updateUserActiveStatus } from '@/app/lib/actions'
import LoaderOnBtn from '../../loaderOnBtn'
import { useNotification } from '@/app/ctx/notificationContext'

interface ActiveWrapperProps {
  userId: string
  isUserActive: boolean
}

export default function ActiveWrapper({
  userId,
  isUserActive,
}: ActiveWrapperProps) {
  const [stateIsUserActive, setStateIsUserActive] =
    useState<boolean>(isUserActive)

  const [isPending, startTransition] = useTransition()

  const { showGlobalNotification } = useNotification()

  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setErrMsg(null)
    setStateIsUserActive(e.target.value === 'true')
  }

  const handleCancelClick = () => {
    setErrMsg(null)
    setStateIsUserActive(isUserActive)
  }

  const handleSaveClick = () => {
    const updateUserActiveStatusWithArgs = updateUserActiveStatus.bind(
      null,
      userId,
      stateIsUserActive,
    )

    setErrMsg(null)

    startTransition(async () => {
      const res = await updateUserActiveStatusWithArgs()

      if (res.success) {
        showGlobalNotification(res.message)
      } else {
        setErrMsg(res.message)
      }
    })
  }

  return (
    <div>
      {errMsg && (
        <p className='text-dashboard-delete-btn mb-2 text-pretty'>{errMsg}</p>
      )}
      <div className='flex min-w-[280px] items-center justify-evenly'>
        {stateIsUserActive !== isUserActive && (
          <Button
            className={clsx(
              'dashboard-btn dashboard-cancel-btn w-20 rounded-lg text-center',
              isPending && 'cursor-wait',
            )}
            onClick={handleCancelClick}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <select
          className={clsx(
            'min-h-[28px] min-w-20 cursor-pointer rounded-lg px-2 text-center',
            stateIsUserActive
              ? 'bg-dashboard-active-select-bg text-dashboard-active-select-text'
              : 'bg-dashboard-inactive-select-bg text-dashboard-inactive-select-text',
            isPending && 'cursor-wait',
          )}
          name='user-active-status'
          value={stateIsUserActive.toString()}
          onChange={handleSelectChange}
          disabled={isPending}
        >
          <option
            className='bg-dashboard-active-select-bg text-dashboard-active-select-text'
            value='true'
          >
            Active
          </option>
          <option
            className='bg-dashboard-inactive-select-bg text-dashboard-inactive-select-text'
            value='false'
          >
            Inactive
          </option>
        </select>
        {stateIsUserActive !== isUserActive && (
          <Button
            className={clsx(
              'dashboard-btn dashboard-main-action-btn min-h-[28px] w-20 rounded-lg',
              isPending && 'cursor-wait',
            )}
            onClick={handleSaveClick}
            disabled={isPending}
          >
            {isPending ? <LoaderOnBtn /> : 'Save'}
          </Button>
        )}
      </div>
    </div>
  )
}
