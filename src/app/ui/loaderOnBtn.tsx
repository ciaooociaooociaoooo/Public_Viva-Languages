import ClipLoader from 'react-spinners/ClipLoader'

interface LoaderOnBtnProps {
  color?: string
  size?: number
  speed?: number
}

export default function LoaderOnBtn({
  color = '#ccd8e5',
  size = 17,
  speed = 1,
}: LoaderOnBtnProps) {
  return (
    <div className='flex size-full items-center justify-center'>
      <ClipLoader color={color} size={size} speedMultiplier={speed} />
    </div>
  )
}
