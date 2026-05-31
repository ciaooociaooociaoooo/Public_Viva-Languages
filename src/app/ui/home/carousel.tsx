'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { feedBacks } from '../../lib/static'
import useMobileSizeDetector from '../../lib/hooks/useMobileSizeDetector'
import MobileSwiper from '../MobileSwiper'
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react'
import { deskSize } from '@/app/lib/utils'

const animationDuration = 70

// (data length has to be divisible evenly by colors' length, otherwise you'll see color shift when new loop starts.)
const gradients = {
  0: `linear-gradient(180deg, 
    #c8f4f9 0%, 
    #c8f4f9 12%, 
    #d1edf0 75%, 
    #daf8fb 100%)`,

  1: `linear-gradient(180deg, 
    #fcd553 0%, 
    #fcd553 12%, 
    #e2be46 75%, 
    #fcd967 100%)`,

  2: `linear-gradient(180deg, 
    #f9d8a2 0%, 
    #f9d8a2 12%,
    #ead4b1 75%,
    #fae0b4 100%)`,

  3: `linear-gradient(180deg, 
    #c8f6c9 0%, 
    #c8f6c9 12%, 
    #d2ecd2 75%, 
    #d9f9da 100%)`,
}

// (When screen size is < 1024, only when 1 item is shown on viewport --- lg:grid-cols-[repeat(var(--feedback-length),_minmax(33vw,_1fr))] lg:grid-rows-[minmax(33vw,_1fr)].)

const Carousel = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const slider1Ref = useRef<HTMLDivElement>(null)

  const slider2Ref = useRef<HTMLDivElement>(null)

  const timeoutRef1 = useRef<ReturnType<typeof setTimeout> | null>(null)

  const timeoutRef2 = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clickedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clickedSliderRef = useRef<null | HTMLDivElement>(null)

  const clickedItemRef = useRef<null | HTMLDivElement>(null)

  const isHandleSwipingsFirstSetStateRef = useRef<boolean>(true)

  const offSetRef = useRef<number>(0)

  const offSetRef2 = useRef<number>(0)

  const [stage, setStage] = useState<string | null>(null)

  const [animationPlayState_On_Slider1, setAnimationPlayState_On_Slider1] =
    useState<'running' | 'paused'>('running')

  const [animationPlayState_On_Slider2, setAnimationPlayState_On_Slider2] =
    useState<'running' | 'paused'>('running')

  const [animation_On_Slider1, setAnimation_On_Slider1] = useState<{
    name: 'animate-slide' | 'none'
    duration: string
    iteration: string
    timingFn: string
  }>({
    name: 'animate-slide',
    duration: `${animationDuration}s`,
    iteration: 'infinite',
    timingFn: 'linear',
  })

  const [animation_On_Slider2, setAnimation_On_Slider2] = useState<{
    name: 'animate-slide' | 'none'
    duration: string
    iteration: string
    timingFn: string
  }>({
    name: 'animate-slide',
    duration: `${animationDuration}s`,
    iteration: 'infinite',
    timingFn: 'linear',
  })

  const [translateX_slider1, setTranslateX_slider1] = useState<string>('0px')

  const [translateX_slider2, setTranslateX_slider2] = useState<string>('0px')

  const [transitionDuration_slider1, setTransitionDuration_slider1] =
    useState<string>('0.5s')

  const [transitionDuration_slider2, setTransitionDuration_slider2] =
    useState<string>('0.5s')

  const [transitionTimingFn_slider1, setTransitionTimingFn_slider1] = useState<
    'ease-out' | 'linear'
  >('ease-out')

  const [transitionTimingFn_slider2, setTransitionTimingFn_slider2] = useState<
    'ease-out' | 'linear'
  >('ease-out')

  const [isSlider2MovedToLeft, setIsSlider2MovedToLeft] =
    useState<boolean>(false)

  const [distance, setDistance] = useState<number>(0)

  const [distance2, setDistance2] = useState<number>(0)

  const [duration, setDuration] = useState<string>('0s')

  const { windowSize, isMobileSize } = useMobileSizeDetector(deskSize)

  const handleItemClick = useCallback(
    (index: number, slider: string) => {

      if (
        slider1Ref &&
        slider1Ref?.current &&
        slider2Ref &&
        slider2Ref?.current
      ) {
        // (Debounce. Otherwise slider1 quick 1 1 will have issue.)
        if (clickedTimeoutRef.current) {
          return
        }
        clickedTimeoutRef.current = setTimeout(() => {
          clickedTimeoutRef.current = null
        }, 300)

        if (
          stage === 'slider2_on_left_slider1_out_of_viewport' ||
          stage === 'last_slider2_item_clicked_centered'
          // ||
          // isSwiping
        ) {
          return
        }

        // When clicked again after 5s - during translation - but before translation finished. Change these back to let the new clicking translate like usual.
        if (timeoutRef2.current) {
          clearTimeout(timeoutRef2.current)
          setTransitionDuration_slider1(`0.5s`)
          setTransitionDuration_slider2(`0.5s`)
          setTransitionTimingFn_slider1('ease-out')
          setTransitionTimingFn_slider2('ease-out')
          setStage(null)
        }

        if (timeoutRef1.current) {
          clearTimeout(timeoutRef1.current)
        }

        const slider1 = slider1Ref.current
        const slider2 = slider2Ref.current
        clickedSliderRef.current = slider === 'slider1' ? slider1 : slider2
        clickedItemRef.current = clickedSliderRef.current.children[
          index
        ] as HTMLDivElement
        const clickedSlider = clickedSliderRef.current
        const clickedItem = clickedItemRef.current

        const slider1ComputedStyle = window.getComputedStyle(slider1)
        const matrix1 = new DOMMatrixReadOnly(slider1ComputedStyle.transform)
        const slider1TranslatedX = matrix1.m41

        const slider2ComputedStyle = window.getComputedStyle(slider2)
        const matrix2 = new DOMMatrixReadOnly(slider2ComputedStyle.transform)
        const slider2TranslatedX = matrix2.m41

        const clickSliderTranslatedX =
          slider === 'slider1' ? slider1TranslatedX : slider2TranslatedX

        const viewportWidth = document.documentElement.clientWidth
        const sliderWidth = clickedSlider.clientWidth
  
        const itemRect = clickedItem.getBoundingClientRect()
        const amountSliderToMoveToCenterItem =
          viewportWidth / 2 - (itemRect.left + itemRect.width / 2)
  
        const finalAmountSliderToMoveToCenterItem =
          clickSliderTranslatedX + amountSliderToMoveToCenterItem

        const slider1Rect = slider1.getBoundingClientRect()
        const slider1IsTwoItemsAwayFromTouchingLeftEdge =
          slider === 'slider1' && index === 1

        const slider1IsOneItemAwayFromTouchingLeftEdge =
          slider === 'slider1' && index === 0
        const isSlidingToTheRight = amountSliderToMoveToCenterItem > 0
        const isSlidingToTheLeft = amountSliderToMoveToCenterItem < 0

        const movingSlider2BackToRight =
          slider === 'slider1' &&
          isSlider2MovedToLeft &&
          index === feedBacks.length - 1

        const movingSlider2ToLeft =
          // // (clicked slider1)
          // (!isSlider2MovedToLeft &&
          //   isSlidingToTheRight &&
          //   slider1IsTwoItemsAwayFromTouchingLeftEdge) ||
          // (e.g. clicked slider1 1)
          (!isSlider2MovedToLeft &&
            isSlidingToTheRight &&
            slider1IsOneItemAwayFromTouchingLeftEdge) ||
          // (clicked slider2 item 2, after switching to slider1, slider1 will be two items away from touching left edge.) (We set movingSlider2ToLeft to true here so that it won't fall into ###Normal) (And actually slider2 is already on left now.)
          (slider !== 'slider2' &&
            !isSlider2MovedToLeft &&
            isSlidingToTheLeft &&
            index === 1)

        // ###Normal
        setAnimationPlayState_On_Slider1('paused')
        setAnimationPlayState_On_Slider2('paused')
        setAnimation_On_Slider1((prev) => ({
          ...prev,
          name: 'none',
        }))
        setAnimation_On_Slider2((prev) => ({
          ...prev,
          name: 'none',
        }))

        // When slider2 was moved to left, then keep clicking to the end of slider1 - hence without giving the chance to do the ###Switch-slider2-back - we need to switch slider2 back to right when clicking the last item of slider1. We switch slider2 to the right first, and then do the transition. ###Switch-slider2-to-left ###Switch-slider2-back-when-clicking
        if (movingSlider2BackToRight) {
          setTransitionDuration_slider2(`0s`)
          setTranslateX_slider2(`${viewportWidth - sliderWidth}px`)
          setIsSlider2MovedToLeft(false)
          setDistance(finalAmountSliderToMoveToCenterItem)
          setDistance2(amountSliderToMoveToCenterItem)
          setStage('Switch-slider2-back-when-clicking')
          return
        }

        // When slider1 is 2 items away from left edge of viewport, and is sliding to right, and slider2 is not already moved to the left, i.e. the first time that slider1 is within the range, let's move the slider2 to the left. ###Switch-slider2-to-left
        if (movingSlider2ToLeft) {
          // ---When it's the first item on slider1 being clicked instead of the second item, we need to do these two all at this one click: 1. switch slider2 to left, 2. translate the slider1 and slider2 as usual. So we switch slider2 to left here, and then when it's done we do the translation in useEffect. ###Switch-slider2-to-left
          if (slider1IsOneItemAwayFromTouchingLeftEdge) {
            const newAountSliderToMoveToCenterItem =
              viewportWidth / 2 - (itemRect.left + itemRect.width / 2)
            const newFinalAmountSliderToMoveToCenterItem =
              clickSliderTranslatedX + newAountSliderToMoveToCenterItem

            // (Often the setTransitionDuration_slider2(`0s`) is not yet set before updating the setTranslateX_slider2(`${-sliderWidth * 2}px`) here, on clicking and on swiping, hence the clicking slider1 8 slider2 1 slider2 2 slider1 1 issue, and the swiping slider1 8 slider2 1 short-swipe slider1 2 in the middle, towards right issue. So here we added plain JS to ensure it.)
            slider2Ref.current.style.transitionDuration = '0s'
            setTransitionDuration_slider2(`0s`)
            setTranslateX_slider2(`${-sliderWidth * 2}px`)
            setDistance(newFinalAmountSliderToMoveToCenterItem)
            setIsSlider2MovedToLeft(true)
            setStage('Slider2_On_left_waiting_To_Transit')
            return
          }
        }

        // Pause animate-slide and translate the clicked slider, in order to move the clicked item to center. ###Normal
        setTransitionDuration_slider1(`0.5s`)
        setTransitionTimingFn_slider1('ease-out')
        setTranslateX_slider1(`${finalAmountSliderToMoveToCenterItem}px`)
        // ---###Normal
        if (!isSlider2MovedToLeft && !movingSlider2ToLeft) {

          setTransitionDuration_slider2(`0.5s`)
          setTransitionTimingFn_slider2('ease-out')
          setTranslateX_slider2(`${finalAmountSliderToMoveToCenterItem}px`)
          // ---When slider1 is less than 2 items from left edge of viewport, i.e. the slider2 is already on the left, and it's not the first time that slider1 falls into this 2 items range. ###Switch-slider2-to-left
          // ----When clicked slider is still slider1 (e.g. slider2 3 2 2 or slider2 3 2 1). ###Switch-slider2-to-left
        } else if (
          slider !== 'slider2' &&
          isSlider2MovedToLeft &&
          !movingSlider2ToLeft
        ) {
          setTransitionDuration_slider2(`0.5s`)
          setTransitionTimingFn_slider2('ease-out')
          setTranslateX_slider2((prev) => {
            const newDistance =
              slider2TranslatedX + amountSliderToMoveToCenterItem
            return `${newDistance}px`
          })
          // ----clicked slider2 item 2, after switching to slider1, slider1 will be two items away from touching left edge. (And actually slider2 is already on left now.) ###Switch-slider2-to-left
        } else if (
          slider !== 'slider2' &&
          !isSlider2MovedToLeft &&
          isSlidingToTheLeft &&
          movingSlider2ToLeft &&
          index === 1
        ) {
          setTransitionDuration_slider2(`0.5s`)
          setTransitionTimingFn_slider2('ease-out')
          setTranslateX_slider2((prev) => {
            const newDistance =
              parseFloat(prev) + finalAmountSliderToMoveToCenterItem
            return `${newDistance}px`
          })

          // ----When clicked slider is slider2 (e.g. item 8 on slider2), we setTranslateX_slider1() a different value, because finalAmountSliderToMoveToCenterItem is now consisted of slider2's translated value, and that's too much distance for slider1 to move. ###Switch-slider2-to-left
        } else if (
          slider === 'slider2' &&
          isSlider2MovedToLeft &&
          !movingSlider2ToLeft
        ) {
          setTranslateX_slider1(
            `${finalAmountSliderToMoveToCenterItem + sliderWidth * 2}px`,
          )
          setTransitionDuration_slider2(`0.5s`)
          setTransitionTimingFn_slider2('ease-out')
          setTranslateX_slider2(`${finalAmountSliderToMoveToCenterItem}px`)
        }

        // When item clicked on slider2 is the last item right before switching to slider1 - do not let slider1 and slider2 slide further to left, otherwise it breaks the loop. So we switch slider2 to slider1 immediately after slider2 got to the clicked item centered position. ###Last-slider2-item-clicked
        if (
          slider === 'slider2' &&
          (Math.abs(finalAmountSliderToMoveToCenterItem) >= sliderWidth ||
            index === feedBacks.length - 1) &&
          !isSlider2MovedToLeft
        ) {
          setStage('last_slider2_item_clicked_centered')
          return
          // ---When slider1 has completely gone to the right side of viewport. ###Switch-slider2-to-left
        } else if (
          slider === 'slider2' &&
          // (document.documentElement.clientWidth --- viewport width without scrollbar)
          (slider1Rect.left + amountSliderToMoveToCenterItem >= viewportWidth ||
            index === feedBacks.length - 2) &&
          isSlider2MovedToLeft
        ) {
          setStage('slider2_on_left_slider1_out_of_viewport')
          return
        }

        // After 5s, translate the sliders to the original destination (i.e. translateX(-100%) in animate-slide in globals.css) once, with a proper speed that matches animate-slide's. ###Normal
        timeoutRef1.current = setTimeout(() => {
          // (-sliderWidth --- from translateX1(-100%) in globals.css)
          const remainingDistance =
            -sliderWidth - finalAmountSliderToMoveToCenterItem

          // Setting a correct duration for this translation, fitting the animate-slide's speed.
          let newDuration = Math.abs(
            (remainingDistance * animationDuration) / sliderWidth,
          ).toFixed(2)

          // Mob mode, when slider2 is moving to left, and no more other clicking, need to set it back to original start position, otherwise will see empty space when it runs the remainingDistance. (e.g. slider1 1 2) ###Mob ###Switch-slider2-to-left ###Switch-slider2-back
          if (
            (window.innerWidth <= deskSize &&
              slider === 'slider1' &&
              isSlider2MovedToLeft &&
              !movingSlider2ToLeft &&
              index === 1) ||
            (window.innerWidth <= deskSize &&
              slider === 'slider1' &&
              !isSlider2MovedToLeft &&
              movingSlider2ToLeft &&
              index === 1)
          ) {
            newDuration = Math.abs(
              (remainingDistance * animationDuration) / sliderWidth,
            ).toFixed(2)
            // ( + itemWidth --- When in Mob mode, the start position of slider1 is already in the middle of the viewport --- i.e. the position of the 2nd item when in Desk mode, so here we compensate it by adding 1 item.)
            setDistance(remainingDistance + itemRect.width)
            setDuration(newDuration)
            setTransitionDuration_slider2(`0s`)
            // ( -itemWidth --- When in Mob mode, the start position of slider1 is already in the middle of the viewport --- i.e. the position of the 2nd item when in Desk mode, so here we compensate it by adding 1 item.)
            setTranslateX_slider2(`${-itemRect.width}px`)
            setIsSlider2MovedToLeft(false)
            setStage('Mob_Slider2_Back_To_Original_Start_Position')
            return
          }

          // When slider2 is moving to left, and no more other clicking, need to set it back to original start position, otherwise will see empty space when it runs the remainingDistance. ###Switch-slider2-to-left ###Switch-slider2-back
          if (!isSlider2MovedToLeft && movingSlider2ToLeft) {
            newDuration =
              window.innerWidth >= deskSize
                ? newDuration
                : // ( + itemWidth --- When in Mob mode, the start position of slider1 is already in the middle of the viewport --- i.e. the position of the 2nd item when in Desk mode, so here we compensate it by adding 1 item.)
                  Math.abs(
                    ((remainingDistance + itemRect.width) * animationDuration) /
                      sliderWidth,
                  ).toFixed(2)
            setDistance(remainingDistance)
            setDuration(newDuration)
            setTransitionDuration_slider2(`0s`)
            setTranslateX_slider2(`0px`)
            setIsSlider2MovedToLeft(false)
            setStage('Slider2_Back_To_Original_Start_Position')
            return
          }

          setTransitionDuration_slider1(`${newDuration}s`)
          setTransitionTimingFn_slider1('linear')
          setTransitionTimingFn_slider2('linear')
          setTranslateX_slider1((prev) => {
            const newDistance = parseFloat(prev) + remainingDistance
            return `${newDistance}px`
          })
          // ###Normal
          if (!isSlider2MovedToLeft && !movingSlider2ToLeft) {
            setTransitionDuration_slider2(`${newDuration}s`)
            setTranslateX_slider2((prev) => {
              const newDistance = parseFloat(prev) + remainingDistance
              return `${newDistance}px`
            })
            // ###Switch-slider2-to-left
          } else if (
            slider !== 'slider2' &&
            isSlider2MovedToLeft &&
            !movingSlider2ToLeft
          ) {
            newDuration = Math.abs(
              (finalAmountSliderToMoveToCenterItem * animationDuration) /
                sliderWidth,
            ).toFixed(2)
            setTransitionDuration_slider2(`${newDuration}s`)
            setTransitionDuration_slider1(`${newDuration}s`)
            setTranslateX_slider1('0px')
            setTranslateX_slider2((prev) => {
              const newDistance =
                parseFloat(prev) - Math.abs(finalAmountSliderToMoveToCenterItem)
              return `${newDistance}px`
            })
            // ###Switch-slider2-to-left
          } else if (
            slider === 'slider2' &&
            isSlider2MovedToLeft &&
            !movingSlider2ToLeft
          ) {
            // (Must calculate slider1TranslatedX again here because this is in setTimeout, otherwise it'll be old data.)
            const slider1ComputedStyle = window.getComputedStyle(slider1)
            const matrix = new DOMMatrixReadOnly(slider1ComputedStyle.transform)
            const slider1TranslatedX = matrix.m41
            const newDistance = 0 - slider1TranslatedX

            setTranslateX_slider1((prev) => {
              return `0px`
            })

            setTranslateX_slider2((prev) => {
              const val = parseFloat(prev) + newDistance
              return `${val}px`
            })

            newDuration = Math.abs(
              (newDistance * animationDuration) / sliderWidth,
            ).toFixed(2)
            setTransitionDuration_slider1(`${newDuration}s`)
            setTransitionDuration_slider2(`${newDuration}s`)
          }

          // When the translation finished, setStage to trigger useEffect. ###Normal
          timeoutRef2.current = setTimeout(
            () => {
              setStage('animate-slide_clicked_translated')
            },
            Number(newDuration) * 1000,
          )
        }, 5000)
      }
    },
    [
      stage,
      isSlider2MovedToLeft,
      // , isSwiping
    ],
  )

  // ###Normal
  useEffect(() => {
    // When the translation finished, back to normal animate-slide animation loop.
    if (stage === 'animate-slide_clicked_translated') {
      setTranslateX_slider1('0px')
      setTranslateX_slider2('0px')
      setTransitionDuration_slider1(`0.5s`)
      setTransitionDuration_slider2(`0.5s`)
      setTransitionTimingFn_slider1('ease-out')
      setTransitionTimingFn_slider2('ease-out')
      setAnimationPlayState_On_Slider1('running')
      setAnimationPlayState_On_Slider2('running')
      setAnimation_On_Slider1((prev) => ({
        ...prev,
        name: 'animate-slide',
      }))
      setAnimation_On_Slider2((prev) => ({
        ...prev,
        name: 'animate-slide',
      }))

      setStage(null)
      setIsSlider2MovedToLeft(false)
    }
  }, [stage])

  // ###Last-slider2-item-clicked
  useEffect(() => {
    // When last item on slider2 is clicked and is centered.
    if (stage === 'last_slider2_item_clicked_centered') {
      // Switch slider2 to slider1 immediately.
      // (settimeout 500 --- wait for the transition time of item centering)
      setTimeout(() => {
        if (
          slider1Ref &&
          slider1Ref?.current &&
          slider2Ref &&
          slider2Ref?.current
        ) {
          const slider2ComputedStyle = window.getComputedStyle(
            slider2Ref.current,
          )
          const matrix = new DOMMatrixReadOnly(slider2ComputedStyle.transform)
          const slider2TranslatedX = matrix.m41
          const slider1Width = slider1Ref.current.clientWidth
          const slider2Width = slider2Ref.current.clientWidth
          const distanceSlider1ToMove =
            Math.abs(slider2TranslatedX) - slider1Width
          const distanceSlider2ToMove =
            Math.abs(slider2TranslatedX) - slider2Width

          setTransitionDuration_slider1(`0s`)
          setTransitionDuration_slider2(`0s`)
          setTranslateX_slider1(`-${Math.abs(distanceSlider1ToMove)}px`)
          setTranslateX_slider2(`-${Math.abs(distanceSlider2ToMove)}px`)

          setStage(null)

          // After 5s, translate the sliders to the original destination (i.e. translateX(-100%) in animate-slide in globals.css) once, with a proper speed that matches animate-slide's.
          timeoutRef1.current = setTimeout(() => {
            const remainingDistance = slider1Width - distanceSlider2ToMove

            const newDuration = Math.abs(
              (remainingDistance * animationDuration) / slider1Width,
            ).toFixed(2)

            setTransitionDuration_slider1(`${newDuration}s`)
            setTransitionDuration_slider2(`${newDuration}s`)
            setTransitionTimingFn_slider1('linear')
            setTransitionTimingFn_slider2('linear')
            setTranslateX_slider1((prev) => {
              const newDistance = parseFloat(prev) - remainingDistance
              return `${newDistance}px`
            })
            setTranslateX_slider2((prev) => {
              const newDistance = parseFloat(prev) - remainingDistance
              return `${newDistance}px`
            })

            // When the translation finished, setStage to trigger useEffect.
            timeoutRef2.current = setTimeout(
              () => {
                setStage('animate-slide_clicked_translated')
              },
              Number(newDuration) * 1000,
            )
          }, 5000)
        }
      }, 500)
    }
  }, [stage])

  // ###Switch-slider2-to-left
  useEffect(() => {
    if (stage === 'slider2_on_left_slider1_out_of_viewport') {
      // Switch slider2 to slider1 immediately.
      // (settimeout 500 --- wait for the transition time of item centering)
      setTimeout(() => {
        if (
          slider1Ref &&
          slider1Ref?.current &&
          slider2Ref &&
          slider2Ref?.current &&
          clickedItemRef &&
          clickedItemRef?.current
        ) {
          const viewportWidth = document.documentElement.clientWidth
          const slider1Width = slider1Ref.current.clientWidth
          const itemWidth = clickedItemRef.current.getBoundingClientRect().width
          const distanceSlider1ToMove =
            window.innerWidth >= deskSize
              ? viewportWidth - slider1Width
              : // ( + itemWidth --- When in Mob mode, the start position of slider1 is already in the middle of the viewport --- i.e. the position of the 2nd item when in Desk mode, so here we compensate it by adding 1 item.)
                viewportWidth - slider1Width + itemWidth

          setTransitionDuration_slider1(`0s`)
          setTransitionDuration_slider2(`0s`)
          setTranslateX_slider1(`${distanceSlider1ToMove}px`)
          setTranslateX_slider2(`${distanceSlider1ToMove}px`)
          setIsSlider2MovedToLeft(false)

          setStage(null)

          timeoutRef1.current = setTimeout(() => {
            const remainingDistance = slider1Width + distanceSlider1ToMove

            const newDuration = Math.abs(
              (remainingDistance * animationDuration) / slider1Width,
            ).toFixed(2)

            setTransitionDuration_slider1(`${newDuration}s`)
            setTransitionDuration_slider2(`${newDuration}s`)
            setTransitionTimingFn_slider1('linear')
            setTransitionTimingFn_slider2('linear')
            setTranslateX_slider1((prev) => {
              const newDistance = parseFloat(prev) - remainingDistance
              return `${newDistance}px`
            })
            setTranslateX_slider2((prev) => {
              const newDistance = parseFloat(prev) - remainingDistance
              return `${newDistance}px`
            })

            timeoutRef2.current = setTimeout(
              () => {
                setStage('animate-slide_clicked_translated')
              },
              Number(newDuration) * 1000,
            )
          }, 5000)
        }
      }, 500)
    }
  }, [stage])

  useEffect(() => {
    if (
      stage === 'Slider2_On_left_waiting_To_Transit' &&
      transitionDuration_slider2 === '0s'
    ) {
      if (
        slider1Ref &&
        slider1Ref?.current &&
        slider2Ref &&
        slider2Ref?.current
      ) {
        const slider1Width = slider1Ref.current.clientWidth

        setTransitionDuration_slider1(`0.5s`)
        setTranslateX_slider1(`${distance}px`)
        // (Now we set the plain JS back.)
        slider2Ref.current.style.transitionDuration = '0.5s'
        setTransitionDuration_slider2(`0.5s`)
        setTranslateX_slider2((prev) => {
          const newDistance = parseFloat(prev) + distance
          return `${newDistance}px`
        })

        timeoutRef1.current = setTimeout(() => {
          const remainingDistance = 0 - distance

          const newDuration = Math.abs(
            (remainingDistance * animationDuration) / slider1Width,
          ).toFixed(2)

          setTransitionDuration_slider1(`${newDuration}s`)
          setTransitionDuration_slider2(`${newDuration}s`)
          setTransitionTimingFn_slider1('linear')
          setTransitionTimingFn_slider2('linear')
          setTranslateX_slider1((prev) => {
            const newDistance = parseFloat(prev) + remainingDistance
            return `${newDistance}px`
          })
          setTranslateX_slider2((prev) => {
            const newDistance = parseFloat(prev) + remainingDistance
            return `${newDistance}px`
          })

          setStage(null)
          setDistance(0)

          timeoutRef2.current = setTimeout(
            () => {
              setStage('animate-slide_clicked_translated')
            },
            Number(newDuration) * 1000,
          )
        }, 5000)
      }
    }
  }, [stage, transitionDuration_slider2, distance])

  // ###Switch-slider2-to-left ###Switch-slider2-back
  // slider2 is on its original start position. Now needs to finish the remainingDistance for both slides and then back to normal animate-slide.
  useEffect(() => {
    // (Ensuring the setTranslateX_slider2(`0px`) and setTransitionDuration_slider2(`0s`) are completed before running this below.) (Same reason for settimeout.)
    if (
      stage === 'Slider2_Back_To_Original_Start_Position' &&
      translateX_slider2 === '0px' &&
      transitionDuration_slider2 === '0s'
    ) {
      setTimeout(() => {
        if (clickedItemRef && clickedItemRef?.current) {
          const itemWidth = clickedItemRef.current.getBoundingClientRect().width
          setTransitionDuration_slider1(`${duration}s`)
          setTransitionTimingFn_slider1('linear')
          setTransitionTimingFn_slider2('linear')
          setTranslateX_slider1((prev) => {
            const newDistance =
              window.innerWidth >= deskSize
                ? parseFloat(prev) + distance
                : // ( + itemWidth --- When in Mob mode, the start position of slider1 is already in the middle of the viewport --- i.e. the position of the 2nd item when in Desk mode, so here we compensate it by adding 1 item.)
                  parseFloat(prev) + distance + itemWidth
            return `${newDistance}px`
          })
          setTransitionDuration_slider2(`${duration}s`)
          setTranslateX_slider2((prev) => {
            const newDistance = parseFloat(prev) + distance
            return `${newDistance}px`
          })

          setDistance(0)
          setDuration('0s')
          setStage(null)

          timeoutRef2.current = setTimeout(
            () => {
              setStage('animate-slide_clicked_translated')
            },
            Number(duration) * 1000,
          )
        }
      }, 200)
    }
  }, [
    stage,
    distance,
    duration,
    translateX_slider2,
    transitionDuration_slider2,
  ])

  useEffect(() => {
    if (
      stage === 'Mob_Slider2_Back_To_Original_Start_Position' &&
      transitionDuration_slider2 === '0s'
    ) {
      setTimeout(() => {
        if (clickedItemRef && clickedItemRef?.current) {
          const itemWidth = clickedItemRef.current.getBoundingClientRect().width
          setTransitionTimingFn_slider1('linear')
          setTransitionTimingFn_slider2('linear')
          setTransitionDuration_slider1(`${duration}s`)
          setTranslateX_slider1((prev) => {
            // ( - itemWidth --- When in Mob mode, the start position of slider1 is already in the middle of the viewport --- i.e. the position of the 2nd item when in Desk mode, so here we compensate it by adding 1 item.)
            const newDistance = parseFloat(prev) + distance - itemWidth
            return `${newDistance}px`
          })
          setTransitionDuration_slider2(`${duration}s`)
          setTranslateX_slider2((prev) => {
            // ( - itemWidth --- When in Mob mode, the start position of slider1 is already in the middle of the viewport --- i.e. the position of the 2nd item when in Desk mode, so here we compensate it by adding 1 item.)
            const newDistance = parseFloat(prev) + distance - itemWidth
            return `${newDistance}px`
          })

          setDistance(0)
          setDuration('0s')
          setStage(null)

          timeoutRef2.current = setTimeout(
            () => {
              setStage('animate-slide_clicked_translated')
            },
            Number(duration) * 1000,
          )
        }
      }, 200)
    }
  }, [
    stage,
    distance,
    duration,
    translateX_slider2,
    transitionDuration_slider2,
  ])

  // ###Switch-slider2-to-left ###Switch-slider2-back-when-clicking
  // (slider2 is switched back to the right. Now do the transition.)
  useEffect(() => {
    if (
      stage === 'Switch-slider2-back-when-clicking' &&
      !isSlider2MovedToLeft
    ) {
      if (
        slider1Ref &&
        slider1Ref?.current &&
        slider2Ref &&
        slider2Ref?.current
      ) {
        const slider1Width = slider1Ref.current.clientWidth

        setTransitionDuration_slider1(`0.5s`)
        setTransitionDuration_slider2(`0.5s`)
        setTransitionTimingFn_slider1('ease-out')
        setTransitionTimingFn_slider2('ease-out')
        setTranslateX_slider1(`${distance}px`)
        setTranslateX_slider2((prev) => {
          const newDistance = parseFloat(prev) + distance2
          return `${newDistance}px`
        })

        timeoutRef1.current = setTimeout(() => {
          const remainingDistance = -slider1Width - distance

          const newDuration = Math.abs(
            (remainingDistance * animationDuration) / slider1Width,
          ).toFixed(2)

          setTransitionDuration_slider1(`${newDuration}s`)
          setTransitionDuration_slider2(`${newDuration}s`)
          setTransitionTimingFn_slider1('linear')
          setTransitionTimingFn_slider2('linear')
          setTranslateX_slider1((prev) => {
            const newDistance = parseFloat(prev) + remainingDistance
            return `${newDistance}px`
          })
          setTranslateX_slider2((prev) => {
            const newDistance = parseFloat(prev) + remainingDistance
            return `${newDistance}px`
          })

          setDistance(0)
          setDistance2(0)
          setStage(null)

          timeoutRef2.current = setTimeout(
            () => {
              setStage('animate-slide_clicked_translated')
            },
            Number(newDuration) * 1000,
          )
        }, 5000)
      }
    }
  }, [stage, isSlider2MovedToLeft, distance, distance2])

  const handleSwiped = useCallback(
    ({
      deltaX,
      deltaY,
      e,
    }: {
      deltaX: number
      deltaY: number
      e: TouchEvent
    }) => {
      if (
        slider1Ref &&
        slider1Ref?.current &&
        slider2Ref &&
        slider2Ref?.current &&
        containerRef?.current
      ) {
        if (!(e?.target as HTMLElement)?.dataset?.sliderAndIndex) {
          return
        }

        const arrStrSliderAndIndex = (
          e.target as HTMLElement
        ).dataset.sliderAndIndex?.split('-')

        if (arrStrSliderAndIndex?.[0] && arrStrSliderAndIndex?.[1]) {
          const slider = arrStrSliderAndIndex[0]
          const index = Number(arrStrSliderAndIndex[1])

          const slider1 = slider1Ref.current
          const slider2 = slider2Ref.current
          clickedSliderRef.current = slider === 'slider1' ? slider1 : slider2
          const touchedSlider = clickedSliderRef.current
          const strTheOtherSlider = slider === 'slider1' ? 'slider2' : 'slider1'
          clickedItemRef.current = touchedSlider.children[
            index
          ] as HTMLDivElement
          const touchedItem = clickedItemRef.current

          const slider1ComputedStyle = window.getComputedStyle(slider1)
          const matrix1 = new DOMMatrixReadOnly(slider1ComputedStyle.transform)
          const slider1TranslatedX = matrix1.m41
          const slider2ComputedStyle = window.getComputedStyle(slider2)
          const matrix2 = new DOMMatrixReadOnly(slider2ComputedStyle.transform)
          const slider2TranslatedX = matrix2.m41
          const touchedSliderTranslatedX =
            slider === 'slider1' ? slider1TranslatedX : slider2TranslatedX

          const viewportWidth = document.documentElement.clientWidth
          const sliderWidth = touchedSlider.clientWidth
          const slider1Rect = slider1.getBoundingClientRect()

          const containerRect = containerRef.current.getBoundingClientRect()
          const itemRect = touchedItem.getBoundingClientRect()
          const itemCenterX = itemRect.left + itemRect.width / 2
          const leftBoundary = containerRect.left + containerRect.width / 3
          const rightBoundary =
            containerRect.left + (2 * containerRect.width) / 3
 
          const amountSliderToMoveToCenterItem =
            viewportWidth / 2 - (itemRect.left + itemRect.width / 2)
          const finalAmountSliderToMoveToCenterItem =
            touchedSliderTranslatedX + amountSliderToMoveToCenterItem

          if (touchedItem) {
            const threshold = touchedItem.clientWidth * (1 / 4)
            const twoThirdsItemWidth = threshold * 2

            // (Don't allow swiping when it's slider2 7 and 2 --- the ones that will switch to slider1 when click/swipe, because if swiping these two, sliders will be mispositioned.)
            if (
              slider === 'slider2' &&
              (Math.abs(finalAmountSliderToMoveToCenterItem) >= sliderWidth ||
                index === feedBacks.length - 1) &&
              !isSlider2MovedToLeft
            ) {
              return
            } else if (
              slider === 'slider2' &&
              // (document.documentElement.clientWidth --- viewport width without scrollbar)
              (slider1Rect.left + amountSliderToMoveToCenterItem >=
                viewportWidth ||
                index === feedBacks.length - 2) &&
              isSlider2MovedToLeft
            ) {
              return
            }

            let touchedItemLeanToward
            if (itemCenterX < leftBoundary) {
              touchedItemLeanToward = 'left'
            } else if (itemCenterX > rightBoundary) {
              touchedItemLeanToward = 'right'
            } else {
              touchedItemLeanToward = 'center'
            }

            // (While swiping, transition duration 0s, transition timing fn ease. Now back to normal.)
            slider1Ref.current.style.transitionDuration = '0.5s'
            slider2Ref.current.style.transitionDuration = '0.5s'
            slider1Ref.current.style.transitionTimingFunction = 'ease-out'
            slider2Ref.current.style.transitionTimingFunction = 'ease-out'

            isHandleSwipingsFirstSetStateRef.current = true

            let argIndex = index
            let argSlider = slider

            // (Pass threshold)
            if (Math.abs(deltaX) >= threshold) {

              // (Going Backward)
              if (deltaX > 0) {
                if (index > 0) {
                  if (
                    touchedItemLeanToward === 'right' ||
                    // (When touch moved item more than 2/3 of item width to the center of viewport --- quite far --- we determine the user wants to view the item itself, not the next or previous item, so argIndex = index; and when item landed on center of viewport but only touch moved less than 2/3 of item width --- this case here --- we determine the user wants to slide.)
                    (Math.abs(deltaX) < twoThirdsItemWidth &&
                      touchedItemLeanToward === 'center')
                  ) {
                    argIndex = index - 1
                  }
                  // (it's first item touched)
                } else {
                  if (
                    touchedItemLeanToward === 'right' ||
                    (Math.abs(deltaX) < twoThirdsItemWidth &&
                      touchedItemLeanToward === 'center')
                  ) {
                    argIndex = feedBacks.length - 1
                    argSlider = strTheOtherSlider
                  }
                }

                // (Going Forward)
              } else {
                if (index < feedBacks.length - 1) {
                  if (
                    touchedItemLeanToward === 'left' ||
                    (Math.abs(deltaX) < twoThirdsItemWidth &&
                      touchedItemLeanToward === 'center')
                  ) {
                    argIndex = index + 1
                  }
                  // (it's last item touched)
                } else {
                  if (
                    touchedItemLeanToward === 'left' ||
                    (Math.abs(deltaX) < twoThirdsItemWidth &&
                      touchedItemLeanToward === 'center')
                  ) {
                    argIndex = 0
                    argSlider = strTheOtherSlider
                  }
                }

              }
              // (Threshold not passed with conditions)
              // (not passed, item on right, going backward)
            } else if (
              Math.abs(deltaX) < threshold &&
              touchedItemLeanToward === 'right' &&
              deltaX > 0
            ) {
              if (index > 0) {
                argIndex = index - 1
              } else {
                argIndex = feedBacks.length - 1
                argSlider = strTheOtherSlider
              }
              // (Threshold not passed with conditions)
              // (not passed, item on left, going forward)
            } else if (
              Math.abs(deltaX) < threshold &&
              touchedItemLeanToward === 'left' &&
              deltaX < 0
            ) {
              if (index < feedBacks.length - 1) {
                argIndex = index + 1
              } else {
                argIndex = 0
                argSlider = strTheOtherSlider
              }
            }
            // (Threshold not passed)
            else {

              if (deltaX === 0) {
                return
              }

              argIndex = index
              argSlider = slider
            }

            handleItemClick(argIndex, argSlider)
          }
        }
      }
    },
    [handleItemClick, isSlider2MovedToLeft],
  )

  const handleSwiping = useCallback(
    ({ x, y, e }: { x: number; y: number; e: TouchEvent }) => {
      if (x === 0) {

        return
      }

      if (
        stage === 'slider2_on_left_slider1_out_of_viewport' ||
        stage === 'last_slider2_item_clicked_centered'
      ) {
        return
      }

      if (!(e?.target as HTMLElement)?.dataset?.sliderAndIndex) {
        return
      }


      const arrStrSliderAndIndex = (
        e.target as HTMLElement
      ).dataset.sliderAndIndex?.split('-')

      if (arrStrSliderAndIndex?.[0] && arrStrSliderAndIndex?.[1]) {
        const slider = arrStrSliderAndIndex[0]
        const index = Number(arrStrSliderAndIndex[1])

        if (
          slider1Ref &&
          slider1Ref?.current &&
          slider2Ref &&
          slider2Ref?.current
        ) {
          const slider1 = slider1Ref.current
          const slider2 = slider2Ref.current
          const touchedSlider = slider === 'slider1' ? slider1 : slider2
          const touchedItem = touchedSlider.children[index] as HTMLDivElement

          const slider1ComputedStyle = window.getComputedStyle(slider1)
          const matrix1 = new DOMMatrixReadOnly(slider1ComputedStyle.transform)
          const slider1TranslatedX = matrix1.m41
          const slider2ComputedStyle = window.getComputedStyle(slider2)
          const matrix2 = new DOMMatrixReadOnly(slider2ComputedStyle.transform)
          const slider2TranslatedX = matrix2.m41
          const touchedSliderTranslatedX =
            slider === 'slider1' ? slider1TranslatedX : slider2TranslatedX
          const viewportWidth = document.documentElement.clientWidth
          const sliderWidth = touchedSlider.clientWidth
          const slider1Rect = slider1.getBoundingClientRect()
          const itemRect = touchedItem.getBoundingClientRect()
          const amountSliderToMoveToCenterItem =
            viewportWidth / 2 - (itemRect.left + itemRect.width / 2)

          const finalAmountSliderToMoveToCenterItem =
            touchedSliderTranslatedX + amountSliderToMoveToCenterItem

          // (Don't allow swiping when it's slider2 7 and 2 --- the ones that will switch to slider1 when click/swipe, because if swiping these two, sliders will be mispositioned.)
          if (
            slider === 'slider2' &&
            (Math.abs(finalAmountSliderToMoveToCenterItem) >= sliderWidth ||
              index === feedBacks.length - 1) &&
            !isSlider2MovedToLeft
          ) {
            return
          } else if (
            slider === 'slider2' &&
            // (document.documentElement.clientWidth --- viewport width without scrollbar)
            (slider1Rect.left + amountSliderToMoveToCenterItem >=
              viewportWidth ||
              index === feedBacks.length - 2) &&
            isSlider2MovedToLeft
          ) {
            return
          }

          if (timeoutRef2.current) {
            clearTimeout(timeoutRef2.current)
            setTransitionTimingFn_slider1('ease-out')
            setTransitionTimingFn_slider2('ease-out')
            setStage(null)
          }

          if (timeoutRef1.current) {
            clearTimeout(timeoutRef1.current)
          }

          // (While swiping, transition duration 0s, transition timing fn ease.)
          slider1Ref.current.style.transitionDuration = '0s'
          slider2Ref.current.style.transitionDuration = '0s'
          slider1Ref.current.style.transitionTimingFunction = 'ease'
          slider2Ref.current.style.transitionTimingFunction = 'ease'

          setAnimationPlayState_On_Slider1('paused')
          setAnimationPlayState_On_Slider2('paused')
          setAnimation_On_Slider1((prev) => ({
            ...prev,
            name: 'none',
          }))
          setAnimation_On_Slider2((prev) => ({
            ...prev,
            name: 'none',
          }))

          // (Have to close animation in order to have transform activated. But so now we need to compensate the distance that the animation previously made.)
          // (isHandleSwipingsFirstSetStateRef?.current === true --- so that we catch the first touchmove event, to catch the distance we need to compensate --- offSetRef.current.)
          let xVal: number
          // (The first touchmove event)
          if (isHandleSwipingsFirstSetStateRef?.current === true) {

            // (touchedSliderTranslatedX --- The distance that the animation previously made)
            offSetRef.current = touchedSliderTranslatedX
            xVal = x + offSetRef.current

            // (swiping slider2 last item or second last item)
            if (
              (index === feedBacks.length - 1 && slider === 'slider2') ||
              (index === feedBacks.length - 2 && slider === 'slider2')
            ) {
              offSetRef2.current = slider1TranslatedX

              const xVal2 = x + offSetRef2.current

              setTranslateX_slider1((prev) => {
                const newDistance = xVal2
                return `${newDistance}px`
              })
              //  ###Mob ###Swipe-Normal
            } else {
              setTranslateX_slider1((prev) => {
                const newDistance = xVal
                return `${newDistance}px`
              })
            }

            //  ###Mob ###Swipe-Switch-slider2-to-left
            // (Here we use plain JS, because: 1. state update is asynchronous, and react would batches state updates together, so most likely the state updates here will be replaced by the same state updates in the isHandleSwipingsFirstSetStateRef.current === false block; but if we use useEffect to guarantee the states here are updated before updating the states in isHandleSwipingsFirstSetStateRef.current === false, this creates a two phases process, which will block the continuity of touchmove events, the swiping will be stopped in the middle. And so we use plain JS to manipulate here.)
            if (index === 0 && slider === 'slider1') {
              slider2Ref.current.style.transform = `translate3d(${-sliderWidth * 2 + offSetRef.current}px, 0, 0)`

              // ###Mob ###Swipe-Switch-slider2-to-left ###Swipe-Switch-slider2-back (When slider2 is on the left, and swiping slider1 2, needs to set setTransitionDuration_slider2 to 0s, otherwise will see slider2 flying to the right.)
            } else if (
              isSlider2MovedToLeft &&
              index === 1 &&
              slider === 'slider1'
            ) {
              slider2Ref.current.style.transform = `translate3d(${xVal}px, 0, 0)`
              setIsSlider2MovedToLeft(false)
              //  ###Mob ###Swipe-Normal
            } else {
              setTranslateX_slider2((prev) => {
                const newDistance = xVal
                return `${newDistance}px`
              })
            }

            isHandleSwipingsFirstSetStateRef.current = false

            // (The rest of touchmove events)
          } else if (isHandleSwipingsFirstSetStateRef.current === false) {

            xVal = x

            // (swiping slider2 last item or second last item)
            if (
              (index === feedBacks.length - 1 && slider === 'slider2') ||
              (index === feedBacks.length - 2 && slider === 'slider2')
            ) {
              setTranslateX_slider1((prev) => {
                const newDistance = offSetRef2.current + xVal
                return `${newDistance}px`
              })
              //  ###Mob ###Swipe-Normal
            } else {
              setTranslateX_slider1((prev) => {
                const newDistance = offSetRef.current + xVal
                return `${newDistance}px`
              })
            }

            //  ###Mob ###Swipe-Switch-slider2-to-left
            if (index === 0 && slider === 'slider1') {
              setTranslateX_slider2((prev) => {
                const newDistance = -sliderWidth * 2 + offSetRef.current + xVal
                return `${newDistance}px`
              })
              setIsSlider2MovedToLeft(true)
              // }
            } else if (index === 1 && slider === 'slider1') {
              slider2Ref.current.style.transform = `translate3d(${offSetRef.current + xVal}px, 0, 0)`

              setTranslateX_slider2((prev) => {
                const newDistance = offSetRef.current + xVal
                return `${newDistance}px`
              })
              // ###Mob ###Swipe-Normal
            } else {
              setTranslateX_slider2((prev) => {
                const newDistance = offSetRef.current + xVal
                return `${newDistance}px`
              })
            }
          }
        }
      }
    },
    [stage, isSlider2MovedToLeft],
  )

  // (Kill timeouts when unmount, just in case.)
  useEffect(() => {
    return () => {
      if (timeoutRef1.current) {
        clearTimeout(timeoutRef1.current)
      }

      if (timeoutRef2.current) {
        clearTimeout(timeoutRef2.current)
      }
    }
  }, [])

  // (Lottie)
  const dotLottieRef_flower_yellow_blue = useRef<DotLottie | null>(null)

  useEffect(() => {
    dotLottieRef_flower_yellow_blue.current?.resize()
  }, [windowSize])
  // (Lottie)

  return (
    <section aria-roledescription='carousel'>
      {/* The only purpose of this svg is to have the clipPath for .sticky-note-content to use. So can be put anywhere. The width='0' height='0' makes it invisible.*/}
      <svg width='0' height='0'>
        <defs>
          <clipPath id='stickyClip' clipPathUnits='objectBoundingBox'>
            <path
              d='M 0 0 Q 0 0.69, 0.03 0.96 0.03 0.96, 1 0.96 Q 0.96 0.69, 0.96 0 0.96 0, 0 0'
              strokeLinejoin='round'
              strokeLinecap='square'
            />
          </clipPath>
        </defs>
      </svg>

      <div className='font-quicksand relative mt-[15vh] mb-[10vh] flex justify-center text-center text-2xl leading-0 font-medium text-nowrap text-[#5A3E1A]/80 sm:max-lg:text-4xl sm:max-lg:leading-5 lg:mt-0 lg:mb-[7.5vw] lg:text-[3vw] lg:font-normal'>
        <h2 className='w-full py-4 sm:w-8/10 lg:w-6/10 lg:py-5'>
          <span className='block py-4 lg:py-[2.7vw]'>What Our Learners </span>
          <span className='block py-4 lg:py-[2.7vw]'>
            and Their Families Think
          </span>
        </h2>
        <div className='absolute top-0 left-0 z-1 h-[10vw] w-[10vw] translate-x-[100%] translate-y-[12%] rotate-15 sm:max-lg:h-[9vw] sm:max-lg:w-[9vw] sm:max-lg:translate-x-[120%] sm:max-lg:-translate-y-[80%] lg:hidden'>
          <DotLottieReact
            dotLottieRefCallback={(dotLottie) => {
              dotLottieRef_flower_yellow_blue.current = dotLottie
            }}
            src='/lottie/flower_yellow_blue.lottie'
            autoplay={true}
            loop={true}
            speed={0.5}
          />
        </div>
      </div>

      <MobileSwiper
        className='touch-manipulation'
        onSwiping={handleSwiping}
        onSwiped={handleSwiped}
        disabled={!isMobileSize}
      >
        <div className='overflow-hidden'>
          <div
            ref={containerRef}
            className='border-t-gold-logo/50 border-b-gold-logo/50 bg-theme-brown/60 grid size-full grid-cols-[repeat(2,1fr)] border-t-6 border-b-6 border-solid'
          >
            <div
              id='slider1'
              ref={slider1Ref}
              style={
                {
                  '--feedback-length': `${feedBacks.length}`,
                  transform: `translate3d(${translateX_slider1}, 0, 0)`,
                  transitionProperty: 'all',
                  transitionTimingFunction: transitionTimingFn_slider1,
                  transitionDuration: transitionDuration_slider1,
                  animationPlayState: animationPlayState_On_Slider1,
                  animationName: animation_On_Slider1.name,
                  animationDuration: animation_On_Slider1.duration,
                  animationIterationCount: animation_On_Slider1.iteration,
                  animationTimingFunction: animation_On_Slider1.timingFn,
                } as React.CSSProperties
              }
              className={`grid size-full grid-cols-[repeat(var(--feedback-length),_minmax(85vw,_1fr))] grid-rows-[minmax(85vw,_1fr)] items-center justify-items-center will-change-transform lg:grid-cols-[repeat(var(--feedback-length),_minmax(33vw,_1fr))] lg:grid-rows-[minmax(33vw,_1fr)]`}
            >
              {feedBacks.map((feedback, i, arr) => {
                return (
                  <div
                    key={i}
                    data-slider-and-index={`slider1-${i}`}
                    className='flex size-[90%] cursor-pointer items-center justify-center'
                    onClick={() => handleItemClick(i, 'slider1')}
                    aria-label={`${i + 1} of ${arr.length}`}
                    role='group'
                    aria-roledescription='slide'
                  >
                    <div
                      data-slider-and-index={`slider1-${i}`}
                      className='size-full'
                    >
                      <div
                        data-slider-and-index={`slider1-${i}`}
                        className='relative size-full'
                      >
                        <div
                          data-slider-and-index={`slider1-${i}`}
                          className='absolute top-0 right-0 bottom-0 left-0 size-full before:absolute before:top-[30%] before:left-[5px] before:h-[70%] before:w-[90%] before:bg-[rgba(0,0,0,0.25)] before:shadow-[-2px_2px_15px_0_rgba(0,0,0,0.5)] before:content-[""]'
                        >
                          <div
                            data-slider-and-index={`slider1-${i}`}
                            className='sticky-note-content size-full content-center px-9 sm:max-md:px-12 md:max-lg:px-15 2xl:px-16'
                            style={{
                              background:
                                gradients[
                                  `${(i % 4) as keyof typeof gradients}`
                                ],
                            }}
                          >
                            <div
                              data-slider-and-index={`slider1-${i}`}
                              className='font-caveat text-2xl text-pretty text-[#333] min-[500px]:text-3xl min-[800px]:text-4xl lg:text-[2.2vw] lg:leading-[2.7vw]'
                            >
                              <div data-slider-and-index={`slider1-${i}`}>
                                <q
                                  data-slider-and-index={`slider1-${i}`}
                                  className='before:content-none after:content-none'
                                  aria-atomic
                                >
                                  {feedback.text}
                                </q>
                              </div>
                              <div
                                data-slider-and-index={`slider1-${i}`}
                                className='flex min-[375px]:pt-6'
                              >
                                <span
                                  data-slider-and-index={`slider1-${i}`}
                                  className='ml-auto'
                                >
                                  — {feedback.author}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div
              id='slider2'
              ref={slider2Ref}
              style={
                {
                  '--feedback-length': `${feedBacks.length}`,
                  transform: `translate3d(${translateX_slider2}, 0, 0)`,
                  transitionProperty: 'all',
                  transitionTimingFunction: transitionTimingFn_slider2,
                  transitionDuration: transitionDuration_slider2,
                  animationPlayState: animationPlayState_On_Slider2,
                  animationName: animation_On_Slider2.name,
                  animationDuration: animation_On_Slider2.duration,
                  animationIterationCount: animation_On_Slider2.iteration,
                  animationTimingFunction: animation_On_Slider2.timingFn,
                } as React.CSSProperties
              }
              className={`grid size-full grid-cols-[repeat(var(--feedback-length),_minmax(85vw,_1fr))] grid-rows-[minmax(85vw,_1fr)] items-center justify-items-center will-change-transform lg:grid-cols-[repeat(var(--feedback-length),_minmax(33vw,_1fr))] lg:grid-rows-[minmax(33vw,_1fr)]`}
            >
              {feedBacks.map((feedback, i) => {
                return (
                  <div
                    key={i}
                    data-slider-and-index={`slider2-${i}`}
                    className='flex size-[90%] cursor-pointer items-center justify-center'
                    onClick={() => handleItemClick(i, 'slider2')}
                    role='group'
                    aria-hidden
                  >
                    <div
                      data-slider-and-index={`slider2-${i}`}
                      className='size-full'
                    >
                      <div
                        data-slider-and-index={`slider2-${i}`}
                        className='relative size-full'
                      >
                        <div
                          data-slider-and-index={`slider2-${i}`}
                          className='absolute top-0 right-0 bottom-0 left-0 size-full before:absolute before:top-[30%] before:left-[5px] before:h-[70%] before:w-[90%] before:bg-[rgba(0,0,0,0.25)] before:shadow-[-2px_2px_15px_0_rgba(0,0,0,0.5)] before:content-[""]'
                        >
                          <div
                            data-slider-and-index={`slider2-${i}`}
                            className='sticky-note-content size-full content-center px-9 sm:max-md:px-12 md:max-lg:px-15 2xl:px-16'
                            style={{
                              background:
                                gradients[
                                  `${(i % 4) as keyof typeof gradients}`
                                ],
                            }}
                          >
                            <div
                              data-slider-and-index={`slider2-${i}`}
                              className='font-caveat text-2xl text-pretty text-[#333] min-[500px]:text-3xl min-[800px]:text-4xl lg:text-[2.2vw] lg:leading-[2.7vw]'
                            >
                              <div data-slider-and-index={`slider2-${i}`}>
                                <q
                                  data-slider-and-index={`slider2-${i}`}
                                  className='before:content-none after:content-none'
                                  aria-atomic
                                >
                                  {feedback.text}
                                </q>
                              </div>
                              <div
                                data-slider-and-index={`slider2-${i}`}
                                className='flex min-[375px]:pt-6'
                              >
                                <span
                                  data-slider-and-index={`slider2-${i}`}
                                  className='ml-auto'
                                >
                                  — {feedback.author}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </MobileSwiper>
    </section>
  )
}

export default Carousel
