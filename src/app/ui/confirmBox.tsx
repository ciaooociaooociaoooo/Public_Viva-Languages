'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import clsx from 'clsx'
import LoaderOnBtn from './loaderOnBtn'
import { useNotification } from '../ctx/notificationContext'

interface ConfirmBoxProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<{
    success: boolean
    message: string
  }>
  callBackOnSuccess?: () => void
  elToFocusOnClose: React.RefObject<HTMLButtonElement | null>
  confirmBtnLabel: string
  className_container: string
  className_text: string
  className_confirmBtn: string
  className_confirmBtnHovered: string
}

const elementsToBeInert = [
  'dashboard-programs-delete-programs-container',
  'dashboard-programs-table',
  'search-bar',
  'pagination',
  'dashboard-header',
]

export default function ConfirmBox({
  children,
  isOpen,
  onClose,
  onConfirm,
  callBackOnSuccess,
  elToFocusOnClose,
  confirmBtnLabel,
  className_container,
  className_text,
  className_confirmBtn,
  className_confirmBtnHovered,
}: ConfirmBoxProps) {
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  const { showGlobalNotification } = useNotification()

  const initRef = useRef<boolean>(true)

  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  // (Accessibility)
  // (So items under overlay are not tabbable.)
  useEffect(() => {
    if (initRef.current) {
      initRef.current = false
      return
    }

    if (isOpen) {
      elementsToBeInert.forEach((id) => {
        document.getElementById(id)?.setAttribute('inert', '')
      })

      // (So cancel btn will be focused when modal opens)
      // (setTimeout - to wait for the modal to be opened)
      setTimeout(() => {
        cancelBtnRef.current?.focus()
      }, 150)
    } else {
      elementsToBeInert.forEach((id) => {
        document.getElementById(id)?.removeAttribute('inert')
      })

      // (So the delete btn will be focused when modal is closed)
      // (setTimeout - to wait for the animation and scrollbar)
      setTimeout(() => {
        elToFocusOnClose.current?.focus()
      }, 150)
    }

    // (cleanup fn to reverse settings)
    return () => {
      elementsToBeInert.forEach((id) => {
        document.getElementById(id)?.removeAttribute('inert')
      })
    }
  }, [isOpen, elToFocusOnClose])

  const handleClick = () => {
    setErrMsg(null)
    startTransition(async () => {
      const res = await onConfirm()
      if (res.success) {
        onClose()
        showGlobalNotification(res.message)
        if (callBackOnSuccess) callBackOnSuccess()
      } else {
        setErrMsg(res.message)
      }
    })
  }

  return (
    <div
      className={clsx(
        'fixed top-1/2 left-1/2 z-1002 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-300',
        isOpen
          ? 'pointer-events-auto visible opacity-100'
          : 'pointer-events-none invisible opacity-0',
      )}
      role='alertdialog'
      aria-modal='true'
      aria-label='Confirmation'
      aria-describedby='confirm-box-title confirm-box-err-msg'
    >
      <div
        className={`max-w-[66.666vw] rounded-xl px-8 py-5 shadow-md md:max-w-none md:p-8 ${className_container}`}
      >
        <h2
          id='confirm-box-title'
          className={`mt-1 mb-7 text-xl text-pretty ${className_text}`}
        >
          {children}
        </h2>
        {errMsg && (
          <p
            className='mb-3 text-center font-semibold text-pretty text-red-700 lg:text-right'
            aria-hidden
          >
            {errMsg}
          </p>
        )}
        <div id='confirm-box-err-msg' className='sr-only' role='status'>
          {errMsg && <p>{errMsg}</p>}
        </div>
        <div className='flex justify-end gap-2'>
          <button
            className={clsx(
              `w-[85.53px] rounded px-4 py-2 text-white ${className_confirmBtn}`,
              !isPending
                ? `cursor-pointer ${className_confirmBtnHovered}`
                : 'cursor-wait',
            )}
            onClick={handleClick}
            disabled={isPending}
            tabIndex={0}
          >
            {isPending ? <LoaderOnBtn /> : confirmBtnLabel}
          </button>
          <button
            ref={cancelBtnRef}
            className={clsx(
              'bg-dashboard-cancel-btn-bg rounded px-4 py-2',
              !isPending ? 'cursor-pointer hover:bg-gray-200' : 'cursor-wait',
            )}
            onClick={() => {
              onClose()
              setErrMsg(null)
            }}
            disabled={isPending}
            tabIndex={0}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
