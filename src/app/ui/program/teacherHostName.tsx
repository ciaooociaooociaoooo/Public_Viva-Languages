'use client'

interface TeacherHostNameProps {
  id: string
  type: string
  name: string
  isOpen: boolean
  handleClick: (type: string, id: string) => Promise<void>
  toggleCardBtnRef: React.RefObject<HTMLButtonElement | null>
}

export default function TeacherHostName({
  id,
  type,
  name,
  isOpen,
  handleClick,
  toggleCardBtnRef,
}: TeacherHostNameProps) {
  return (
    <button
      id='teacher-host-name-btn'
      ref={toggleCardBtnRef}
      className='decoration-theme-brown/30 underline-mob-default-desk-hover'
      onClick={() => handleClick(type, id)}
      aria-haspopup='dialog'
      aria-expanded={isOpen}
    >
      {name}
    </button>
  )
}
