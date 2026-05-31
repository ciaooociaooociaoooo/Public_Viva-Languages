import ClimbingBoxLoader from 'react-spinners/ClimbingBoxLoader'
import PacmanLoader from 'react-spinners/PacmanLoader'

interface LoaderProps {
  className?: string
  isAdmin: boolean
  color?: string
  size?: number
  speed?: number
}

const Loader = ({
  className,
  isAdmin,
  color = '#e0a030',
  size = 15,
  speed = 1,
}: LoaderProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {isAdmin ? (
        <ClimbingBoxLoader size={size} color={color} speedMultiplier={speed} />
      ) : (
        <PacmanLoader
          size={size}
          color={color}
          speedMultiplier={speed}
        />
      )}
    </div>
  )
}

export default Loader
