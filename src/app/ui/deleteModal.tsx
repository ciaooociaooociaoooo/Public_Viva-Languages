'use client'

import { useEffect, useId } from 'react'
import ConfirmBox from './confirmBox'
import clsx from 'clsx'
import Overlay from './overlay'
import { isTopDialog, popDialog, pushDialog } from '@/app/lib/utils'

interface DeleteModalProps {
  isModalOpen: boolean
  closeModal: () => void
  title: string
  actionFn: () => Promise<{
    success: boolean
    message: string
  }>
  callBackOnSuccess?: () => void
  elToFocusOnModalClose: React.RefObject<HTMLButtonElement | null>
}

export default function DeleteModal({
  isModalOpen,
  closeModal,
  title,
  actionFn,
  callBackOnSuccess,
  elToFocusOnModalClose,
}: DeleteModalProps) {
  // (Accessibility)
  // (So Esc key can close cart.)
  const id = useId()

  useEffect(() => {
    if (!isModalOpen) return

    pushDialog(id)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopDialog(id)) {
        closeModal()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      popDialog(id)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isModalOpen, id, closeModal])

  useEffect(() => {
    if (isModalOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth

      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      setTimeout(() => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }, 300)
    }
  }, [isModalOpen])

  return (
    <>
      <Overlay
        className={clsx(
          'bg-overlay-1 transition-all duration-300',
          isModalOpen
            ? 'pointer-events-auto visible opacity-100'
            : 'pointer-events-none invisible opacity-0',
        )}
      />

      <ConfirmBox
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={actionFn}
        confirmBtnLabel='Delete'
        callBackOnSuccess={callBackOnSuccess}
        elToFocusOnClose={elToFocusOnModalClose}
        className_container='bg-dashboard-navbar-bg'
        className_text='text-dashboard-text-5'
        className_confirmBtn='bg-dashboard-delete-btn'
        className_confirmBtnHovered='hover:bg-red-700'
      >
        {title}
      </ConfirmBox>
    </>
  )
}
