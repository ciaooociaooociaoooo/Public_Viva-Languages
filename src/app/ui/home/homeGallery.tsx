'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useMobileSizeDetector from '../../lib/hooks/useMobileSizeDetector'
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const HomeGallery = () => {
  const dotLottieRef_sunflower = useRef<DotLottie | null>(null)
  const dotLottieRef_leaf = useRef<DotLottie | null>(null)
  const dotLottieRef_flower_long_yellow = useRef<DotLottie | null>(null)
  const dotLottieRef_bird = useRef<DotLottie | null>(null)
  const dotLottieRef_tree = useRef<DotLottie | null>(null)
  const dotLottieRef_flower_theme_colors = useRef<DotLottie | null>(null)
  const dotLottieRef_flower_yellow = useRef<DotLottie | null>(null)
  const dotLottieRef_plant_green = useRef<DotLottie | null>(null)
  const dotLottieRef_flower_yellow_blue = useRef<DotLottie | null>(null)

  const { windowSize, isMobileSize } = useMobileSizeDetector(1024)

  useGSAP(() => {
    ScrollTrigger.getAll()
      .filter(
        (trigger) =>
          trigger?.trigger &&
          trigger.trigger?.classList.contains('gsapTarget_HomeGallery'),
      )
      .forEach((trigger) => {
        trigger.kill()
      })

    gsap.killTweensOf('.gsapTarget_HomeGallery')

    if (!isMobileSize) {
      gsap.set('#gsapTarget_title_2', { opacity: 0 })
    } else {
      gsap.set('#gsapTarget_title_2', { opacity: 1 })
    }

    if (!isMobileSize) {
      gsap.to('#gsapTarget_img_1', {
        y: '-=15%',
        x: '-=10%',
        rotate: -7,
        scrollTrigger: {
          trigger: '#gsapTarget_title_1',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_2', {
        y: '-=10%',
        x: '+=10%',
        rotate: 6,
        scrollTrigger: {
          trigger: '#gsapTarget_title_1',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_3', {
        y: '+=20%',
        x: '-=10%',
        rotate: 12,
        scrollTrigger: {
          trigger: '#gsapTarget_title_1',
          start: 'top center',
          end: '+=' + window.innerHeight * 1.5,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_4', {
        y: '+=8%',
        x: '+=10%',
        rotate: -4,
        scrollTrigger: {
          trigger: '#gsapTarget_title_1',
          start: 'top center',
          end: '+=' + window.innerHeight * 1.5,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_title_2', {
        y: '+=240%',
        opacity: 1,
        scrollTrigger: {
          trigger: '#gsapTarget_title_2',
          start: 'center+=5% center',
          endTrigger: '#gsapTarget_container_1',
          end: 'center-=5% center',
          scrub: 2,
          invalidateOnRefresh: true,
          // pin: true,
          // markers: true,
        },
      })

      gsap.to('#gsapTarget_img_5', {
        y: '-=4%',
        x: '+=8%',
        rotate: 4,
        scrollTrigger: {
          trigger: '#gsapTarget_container_1',
          start: '50% center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_6', {
        y: '-=8%',
        x: '-=12%',
        rotate: -4,
        scrollTrigger: {
          trigger: '#gsapTarget_container_1',
          start: '50% center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_7', {
        y: '+=12%',
        x: '+=16%',
        rotate: 6,
        scrollTrigger: {
          trigger: '#gsapTarget_container_1',
          start: '50% center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_8', {
        y: '-=' + window.innerHeight * 0.1,
        scrollTrigger: {
          trigger: '#gsapTarget_img_9',
          start: 'top-=30% bottom',
          end: '+=' + window.innerHeight * 0.3,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_9', {
        y: '-=' + window.innerHeight * 0.1,
        scrollTrigger: {
          trigger: '#gsapTarget_img_9',
          start: 'top-=30% bottom',
          end: '+=' + window.innerHeight * 0.3,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_10', {
        y: '+=30%',
        scrollTrigger: {
          trigger: '#gsapTarget_img_10',
          start: 'top-=176 top',
          endTrigger: '#gsapTarget_container_2',
          end: 'bottom+=5% bottom',
          scrub: 2,
          invalidateOnRefresh: true,
          // markers: true,
        },
      })
    } else if (isMobileSize && windowSize < 640) {
      gsap.to('#gsapTarget_img_1', {
        rotate: 2,
        scrollTrigger: {
          trigger: '#gsapTarget_img_1',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_2', {
        rotate: -2,
        x: -3,
        scrollTrigger: {
          trigger: '#gsapTarget_img_2',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_3', {
        rotate: 2,
        x: 3,
        scrollTrigger: {
          trigger: '#gsapTarget_img_3',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_5', {
        rotate: 2,
        scrollTrigger: {
          trigger: '#gsapTarget_img_5',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_6', {
        rotate: -2,
        x: -3,
        scrollTrigger: {
          trigger: '#gsapTarget_img_6',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_7', {
        rotate: 2,
        x: 3,
        scrollTrigger: {
          trigger: '#gsapTarget_img_7',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_8', {
        rotate: 2,
        scrollTrigger: {
          trigger: '#gsapTarget_img_8',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_9', {
        rotate: -2,
        x: -3,
        scrollTrigger: {
          trigger: '#gsapTarget_img_9',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('#gsapTarget_img_10', {
        rotate: 2,
        x: 3,
        scrollTrigger: {
          trigger: '#gsapTarget_img_10',
          start: 'top center',
          end: '+=' + window.innerHeight * 1,
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })
    }

    ScrollTrigger.refresh()
  }, [windowSize, isMobileSize])

  useEffect(() => {
    dotLottieRef_sunflower.current?.resize()
    dotLottieRef_leaf.current?.resize()
    dotLottieRef_flower_long_yellow.current?.resize()
    dotLottieRef_bird.current?.resize()
    dotLottieRef_tree.current?.resize()
    dotLottieRef_flower_theme_colors.current?.resize()
    dotLottieRef_flower_yellow.current?.resize()
    dotLottieRef_plant_green.current?.resize()
    dotLottieRef_flower_yellow_blue.current?.resize()
  }, [windowSize])

  return (
    <section className='overflow-x-hidden px-5 sm:max-lg:px-10 lg:flex lg:flex-col lg:gap-[18vw]'>
      <div className='lg:relative'>
        <div
          id='gsapTarget_title_1'
          className='gsapTarget_HomeGallery text-theme-gold mt-[calc(20vh/2)] mb-[calc(10vh/2)] flex justify-center text-center text-2xl leading-0 font-bold text-nowrap sm:max-lg:text-4xl sm:max-lg:leading-4 lg:my-0 lg:py-[25vw] lg:text-[3.5vw]'
        >
          <div className='font-caveat relative w-full py-4 sm:w-8/10 lg:w-6/10 lg:py-5'>
            <h2>
              <span className='block py-4 lg:py-[2.7vw]'>Welcome to the</span>
              <span className='block py-4 lg:py-[2.7vw]'>Classroom!</span>
            </h2>
            <div className='absolute top-0 left-1/2 h-7.5 w-7.5 -translate-x-[380%] -translate-y-[50%] sm:max-lg:h-11.25 sm:max-lg:w-11.25 lg:h-[5vw] lg:w-[5vw] lg:-translate-x-[340%] lg:-translate-y-[10%]'>
              <DotLottieReact
                dotLottieRefCallback={(dotLottie) => {
                  dotLottieRef_sunflower.current = dotLottie
                }}
                src='/lottie/sunflower.lottie'
                autoplay={true}
                loop={true}
                speed={0.4}
              />
            </div>
            <div className='absolute right-1/2 bottom-0 h-11 w-11 translate-x-[270%] translate-y-[25%] rotate-15 sm:max-lg:h-16 sm:max-lg:w-16 lg:h-[8.5vw] lg:w-[8.5vw] lg:translate-x-[220%] lg:-translate-y-[0%]'>
              <DotLottieReact
                dotLottieRefCallback={(dotLottie) => {
                  dotLottieRef_leaf.current = dotLottie
                }}
                src='/lottie/leaf.lottie'
                autoplay={true}
                loop={false}
                speed={0.5}
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-5 sm:max-lg:gap-10 lg:block'>
          <div
            id='gsapTarget_img_1'
            className='gsapTarget_HomeGallery border-theme-gold/70 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:top-[8vw] lg:left-[1vw] lg:w-[38vw]'
          >
            <Image
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829783/jarritos-mexican-soda--84tQTSV_aE-unsplash_iao5el.jpg'
              alt='Students laughing'
              width={6000}
              height={3376}
            />
          </div>
          <div
            id='gsapTarget_img_2'
            className='gsapTarget_HomeGallery border-theme-gold/70 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:top-[2vw] lg:right-0 lg:w-[38vw]'
          >
            <Image
              className=''
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1745222397/zachary-nelson-98Elr-LIvD8-unsplash_kqik3r.jpg'
              alt='Students playing on the street'
              width={5184}
              height={3456}
            />
          </div>
          <div
            id='gsapTarget_img_3'
            className='gsapTarget_HomeGallery border-theme-gold/70 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:bottom-[4vw] lg:left-[1.2vw] lg:w-[38vw]'
          >
            <Image
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829852/thisisengineering-TXxiFuQLBKQ-unsplash_nfyzva.jpg'
              alt='Teacher smiling'
              width={7730}
              height={5156}
            />
          </div>
          <div
            id='gsapTarget_img_4'
            className='gsapTarget_HomeGallery border-theme-gold/70 hidden w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:right-[2vw] lg:bottom-[2vw] lg:block lg:w-[38vw]'
          >
            <Image
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829799/helena-lopes-e3OUQGT9bWU-unsplash_a3tzpj.jpg'
              alt='Group of students talking and laughing'
              width={5090}
              height={3393}
            />
          </div>
        </div>
      </div>

      <div
        id='gsapTarget_container_1'
        className='gsapTarget_HomeGallery relative'
      >
        <div className='text-theme-deep-blue font-caveat mt-[calc(20vh/2)] mb-[calc(10vh/2)] flex w-full justify-center py-4 text-center text-2xl font-bold sm:max-lg:text-4xl lg:my-0 lg:w-1/2 lg:pb-[75vw] lg:pl-[1vw] lg:text-[3vw]'>
          <h2
            id='gsapTarget_title_2'
            className='gsapTarget_HomeGallery opacity-100 lg:pt-[5vw] lg:opacity-0'
          >
            Learning a Language Has Never Been This Fun!
          </h2>
          <div className='absolute top-0 left-1/8 z-1 mt-[-10%] hidden h-[7vw] w-[7vw] translate-x-[10%] rotate-9 lg:block'>
            <DotLottieReact
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef_flower_long_yellow.current = dotLottie
              }}
              src='/lottie/flower_long_yellow.lottie'
              autoplay={true}
              loop={false}
              speed={0.5}
            />
          </div>
          <div className='absolute top-0 right-0 z-1 h-40 w-40 translate-x-[25%] -rotate-20 sm:max-lg:h-60 sm:max-lg:w-60 lg:hidden'>
            <DotLottieReact
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef_bird.current = dotLottie
              }}
              src='/lottie/bird.lottie'
              autoplay={true}
              loop={true}
              speed={0.5}
            />
          </div>
          <div className='absolute top-0 right-1/9 z-1 mt-[-1vw] hidden h-[30vw] w-[30vw] translate-x-[23%] -rotate-5 lg:block'>
            <DotLottieReact
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef_tree.current = dotLottie
              }}
              src='/lottie/tree.lottie'
              autoplay={true}
              loop={true}
              speed={0.3}
            />
          </div>
        </div>
        <div className='flex flex-col gap-5 sm:max-lg:gap-10 lg:block'>
          <div
            id='gsapTarget_img_5'
            className='gsapTarget_HomeGallery border-theme-deep-blue/50 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:right-[3vw] lg:bottom-[39%] lg:w-[40vw]'
          >
            <Image
              className=''
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829826/frank-mckenna-EgB1uSU5tRA-unsplash_lb3kaa.jpg'
              alt='Kid laughing and running'
              width={4928}
              height={3280}
            />
          </div>
          <div
            id='gsapTarget_img_6'
            className='gsapTarget_HomeGallery border-theme-deep-blue/50 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:bottom-[6%] lg:left-[3vw] lg:w-[40vw]'
          >
            <Image
              className=''
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829932/gautam-arora-78Ae6N7rNvI-unsplash_iuopjs.jpg'
              alt='Classroom shot'
              width={3000}
              height={2000}
            />
          </div>
          <div
            id='gsapTarget_img_7'
            className='gsapTarget_HomeGallery border-theme-deep-blue/50 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:right-[3vw] lg:bottom-[5.57%] lg:w-[40vw]'
          >
            <Image
              className=''
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829890/priscilla-du-preez-XkKCui44iM0-unsplash_rmrwzx.jpg'
              alt='Students around a laptop discussing'
              width={5472}
              height={3648}
            />
          </div>
        </div>
      </div>

      <div
        id='gsapTarget_container_2'
        className='gsapTarget_HomeGallery relative lg:mt-[-2vw]'
      >
        <div
          id='gsapTarget_title_3'
          className='gsapTarget_HomeGallery text-theme-brown mt-[calc(20vh/2)] mb-[calc(10vh/2)] flex justify-center text-center text-2xl leading-0 font-bold text-nowrap sm:max-lg:text-4xl sm:max-lg:leading-4 lg:my-0 lg:pb-[94.67vw] lg:text-[3.5vw]'
        >
          <h2 className='font-caveat w-full py-4 sm:w-8/10 lg:w-6/10 lg:py-0'>
            <span className='block py-4 lg:py-[2.7vw]'>At Viva Languages,</span>
            <span className='block py-4 lg:py-[2.7vw]'>We Make</span>
            <span className='block py-4 lg:py-[2.7vw]'>
              Classroom Feel Like Home
            </span>
          </h2>
          <div className='absolute top-0 left-1/6 z-1 hidden h-[5.03vw] w-[5.03vw] translate-x-[95%] -translate-y-[230%] lg:block'>
            <DotLottieReact
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef_flower_theme_colors.current = dotLottie
              }}
              src='/lottie/flower_theme_colors.lottie'
              autoplay={true}
              loop={true}
              speed={0.1}
            />
          </div>
          <div className='absolute top-0 left-1/20 z-1 h-11 w-11 -translate-y-[50%] -rotate-20 sm:max-lg:h-20 sm:max-lg:w-20 lg:right-1/5 lg:left-auto lg:h-[7vw] lg:w-[7vw] lg:-translate-x-[20%] lg:-translate-y-[110%] lg:rotate-15'>
            <DotLottieReact
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef_flower_yellow.current = dotLottie
              }}
              src='/lottie/flower_yellow.lottie'
              autoplay={true}
              loop={true}
              speed={0.5}
            />
          </div>
          <div className='absolute top-0 right-1/5 z-1 hidden h-[5vw] w-[5vw] translate-x-[70%] translate-y-[360%] -rotate-25 lg:block'>
            <DotLottieReact
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef_plant_green.current = dotLottie
              }}
              src='/lottie/plant_green.lottie'
              autoplay={true}
              loop={false}
              speed={0.5}
            />
          </div>
          <div className='absolute bottom-0 left-1/5 z-1 hidden h-[7vw] w-[7vw] -translate-x-[20%] -translate-y-[110%] rotate-15 lg:block'>
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
        <div className='flex flex-col gap-5 pb-[2.51vw] sm:max-lg:gap-10 lg:block'>
          <div
            id='gsapTarget_img_8'
            className='gsapTarget_HomeGallery border-theme-brown/50 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:top-[57%] lg:left-[3vw] lg:w-[40vw]'
          >
            <Image
              className=''
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829979/m-monk-E813FON0wDQ-unsplash_vy2bm9.jpg'
              alt='Classroom shot'
              width={8688}
              height={5792}
            />
          </div>
          <div
            id='gsapTarget_img_9'
            className='gsapTarget_HomeGallery border-theme-brown/50 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:top-[32%] lg:left-[3vw] lg:w-[40vw]'
          >
            <Image
              className=''
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829939/haseeb-modi-CoVhe91yY0E-unsplash_orizku.jpg'
              alt='Classroom shot'
              width={5351}
              height={3568}
            />
          </div>
          <div
            id='gsapTarget_img_10'
            className='gsapTarget_HomeGallery border-theme-brown/50 w-full overflow-hidden rounded-4xl border-6 border-solid lg:absolute lg:top-[28.94%] lg:right-[3vw] lg:w-[40vw]'
          >
            <Image
              src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743829917/victoria-nazaruk-0nyR0Aw5fCA-unsplash_ix1ohp.jpg'
              alt='Teacher carefully looks after a little student'
              width={2768}
              height={3467}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeGallery
