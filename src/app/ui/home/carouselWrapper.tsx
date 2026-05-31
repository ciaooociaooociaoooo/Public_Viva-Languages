'use client'

import useMobileSizeDetector from '../../lib/hooks/useMobileSizeDetector'
import Carousel from './carousel'

const CarouselWrapper = () => {
  const { windowSize } = useMobileSizeDetector(1024)

  // (We remount the Carousel component whenever screen size changes, because after changing screen size --- from showing 1 item to 3 items, vice versa --- not every item in the Carousel will be shown.)
  return <Carousel key={windowSize} />
}

export default CarouselWrapper
