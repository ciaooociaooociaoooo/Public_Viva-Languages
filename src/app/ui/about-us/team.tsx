'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MorphSVGPlugin } from 'gsap/all'
import {
  HostsWithEventsType,
  TeachersWithCoursesType,
} from '@/app/lib/definitions'

gsap.registerPlugin(useGSAP, ScrollTrigger, MorphSVGPlugin)

interface TeamProps {
  teachers: TeachersWithCoursesType
  hosts: HostsWithEventsType
}

const Team = ({ teachers, hosts }: TeamProps) => {
  const [windowSize, setWindowSize] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  )

  useEffect(() => {
    const resizeHandler = () => setWindowSize(window.innerWidth)

    function debounce<T extends (...args: unknown[]) => void>(
      callback: T,
      delay: number,
    ): (...args: Parameters<T>) => void {
      let timeoutId: ReturnType<typeof setTimeout>

      return function (...args: Parameters<T>): void {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          callback(...args)
        }, delay)
      }
    }

    const debouncedResizeHandler = debounce(resizeHandler, 1000)

    window.addEventListener('resize', debouncedResizeHandler)
    return () => window.removeEventListener('resize', debouncedResizeHandler)
  }, [])

  useGSAP(() => {
    ScrollTrigger.getAll()
      .filter(
        (trigger) =>
          trigger?.trigger &&
          trigger.trigger?.classList.contains('gsapTarget_Team_ScrollTrigger'),
      )
      .forEach((trigger) => {
        trigger.kill()
      })

    gsap.killTweensOf('.gsapTarget_Team_ScrollTrigger')

    const headerHeight = document.getElementById('header')?.offsetHeight

    if (headerHeight) {
      const straightPath = 'M0,96 L1440,96 L1440,0 L0,0 Z'

      const tl_teacher_1 = gsap.timeline({
        scrollTrigger: {
          trigger: `#gsapTarget_Team_Teacher_1_SVG_Shape`,
          start: `top+=65% bottom`,
          end: '+=10%',
          scrub: false,
          invalidateOnRefresh: true,
          // markers: true,
          // id: 'title',
        },
      })

      tl_teacher_1
        .to(
          `#gsapTarget_Team_Teacher_1_TextPath_1`,
          {
            attr: { startOffset: '800px' },
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_1_TextPath_2`,
          {
            attr: { startOffset: '500px' },
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_1_Text_1`,
          {
            opacity: 1,
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_1_text_2`,
          {
            opacity: 1,
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_1_Path_1`,
          {
            duration: 1.5,
            ease: 'power2.inOut',
            morphSVG: {
              shape: straightPath,
            },
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_1_Path_2`,
          {
            duration: 1.5,
            ease: 'power2.inOut',
            morphSVG: {
              shape: straightPath,
            },
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_1_SVG_Curved_Text_Div_1`,
          {
            y: 20,
            x: -10,
            duration: 1.5,
            ease: 'power2.inOut',
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_1_SVG_Curved_Text_Div_2`,
          {
            y: 20,
            x: -17,
            duration: 1.5,
            ease: 'power2.inOut',
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )

      const tl_teacher_2 = gsap.timeline({
        scrollTrigger: {
          trigger: `#gsapTarget_Team_Teacher_2_SVG_Shape`,
          start: `top+=65% bottom`,
          end: '+=10%',
          scrub: false,
          invalidateOnRefresh: true,
          // markers: true,
          // id: 'title',
        },
      })

      tl_teacher_2
        .to(
          `#gsapTarget_Team_Teacher_2_TextPath_1`,
          {
            attr: { startOffset: '800px' },
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_2_TextPath_2`,
          {
            attr: { startOffset: '500px' },
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_2_Text_1`,
          {
            opacity: 1,
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_2_text_2`,
          {
            opacity: 1,
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_2_Path_1`,
          {
            duration: 1.5,
            ease: 'power2.inOut',
            morphSVG: {
              shape: straightPath,
            },
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_2_Path_2`,
          {
            duration: 1.5,
            ease: 'power2.inOut',
            morphSVG: {
              shape: straightPath,
            },
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_2_SVG_Curved_Text_Div_1`,
          {
            y: 20,
            x: -25,
            duration: 1.5,
            ease: 'power2.inOut',
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_2_SVG_Curved_Text_Div_2`,
          {
            y: 20,
            x: -45,
            duration: 1.5,
            ease: 'power2.inOut',
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )

      const tl_teacher_3 = gsap.timeline({
        scrollTrigger: {
          trigger: `#gsapTarget_Team_Teacher_3_SVG_Shape`,
          start: `top+=65% bottom`,
          end: '+=10%',
          scrub: false,
          invalidateOnRefresh: true,
          // markers: true,
          // id: 'title',
        },
      })

      tl_teacher_3
        .to(
          `#gsapTarget_Team_Teacher_3_TextPath_1`,
          {
            attr: { startOffset: '800px' },
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_3_TextPath_2`,
          {
            attr: { startOffset: '500px' },
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_3_Text_1`,
          {
            opacity: 1,
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_3_text_2`,
          {
            opacity: 1,
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_3_Path_1`,
          {
            duration: 1.5,
            ease: 'power2.inOut',
            morphSVG: {
              shape: straightPath,
            },
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_3_Path_2`,
          {
            duration: 1.5,
            ease: 'power2.inOut',
            morphSVG: {
              shape: straightPath,
            },
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_3_SVG_Curved_Text_Div_1`,
          {
            y: 20,
            x: -30,
            duration: 1.5,
            ease: 'power2.inOut',
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_3_SVG_Curved_Text_Div_2`,
          {
            y: 20,
            x: -55,
            duration: 1.5,
            ease: 'power2.inOut',
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )

      const tl_teacher_4 = gsap.timeline({
        scrollTrigger: {
          trigger: `#gsapTarget_Team_Teacher_4_SVG_Shape`,
          start: `top+=65% bottom`,
          end: '+=10%',
          scrub: false,
          invalidateOnRefresh: true,
          // markers: true,
          // id: 'title',
        },
      })

      tl_teacher_4
        .to(
          `#gsapTarget_Team_Teacher_4_TextPath_1`,
          {
            attr: { startOffset: '800px' },
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_4_TextPath_2`,
          {
            attr: { startOffset: '500px' },
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_4_Text_1`,
          {
            opacity: 1,
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_4_text_2`,
          {
            opacity: 1,
            duration: 3,
            ease: 'power1.inOut',
            // repeat: -1,
            // yoyo: true,
          },
          0,
        )
        .to(
          `#gsapTarget_Team_Teacher_4_Path_1`,
          {
            duration: 1.5,
            ease: 'power2.inOut',
            morphSVG: {
              shape: straightPath,
            },
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_4_Path_2`,
          {
            duration: 1.5,
            ease: 'power2.inOut',
            morphSVG: {
              shape: straightPath,
            },
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_4_SVG_Curved_Text_Div_1`,
          {
            y: 20,
            x: 15,
            duration: 1.5,
            ease: 'power2.inOut',
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
        .to(
          `#gsapTarget_Team_Teacher_4_SVG_Curved_Text_Div_2`,
          {
            y: 20,
            x: -35,
            duration: 1.5,
            ease: 'power2.inOut',
            // yoyo: true,
            // repeat: -1,
          },
          1.5,
        )
    }

    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)
  }, [windowSize])

  return (
    <section className='mt-18 mb-30 lg:mt-27'>
      <h1 className='font-quicksand text-theme-brown/80 pb-10 text-center text-4xl'>
        Meet Our Team
      </h1>
      <div className='flex flex-col items-center gap-10 sm:flex-row sm:flex-wrap sm:justify-center'>
        {/* Teacher 1 */}
        <figure className='relative flex h-[828px] w-[327px] flex-col gap-5 overflow-hidden rounded-2xl bg-white pb-8 shadow-[var(--shadow-1)]'>
          <h2 className='sr-only'>Raoul Bova</h2>
          {/* (SVG colored shape) */}
          <div
            id='gsapTarget_Team_Teacher_1_SVG_Shape'
            className='gsapTarget_Team_ScrollTrigger bg-theme-light-blue absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              className='absolute bottom-[-60px] left-0 z-1'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                fill='#c8f4f9'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              ></path>
            </svg>
          </div>
          {/* (SVG curved text 1) */}
          <div
            id='gsapTarget_Team_Teacher_1_SVG_Curved_Text_Div_1'
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='gsapTarget_Team_Teacher_1_Path_1'
                fill='transparent'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              />
              <text
                id='gsapTarget_Team_Teacher_1_Text_1'
                opacity='0'
                width='100%'
                // fontSize='110px'
                className='text-[116px]'
                fill='#0b4b5c'
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <textPath
                  id='gsapTarget_Team_Teacher_1_TextPath_1'
                  href='#gsapTarget_Team_Teacher_1_Path_1'
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  startOffset='0px'
                >
                  Bova
                </textPath>
              </text>
            </svg>
          </div>
          {/* (SVG curved text 2) */}
          <div
            id='gsapTarget_Team_Teacher_1_SVG_Curved_Text_Div_2'
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='gsapTarget_Team_Teacher_1_Path_2'
                fill='transparent'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              />
              <text
                id='gsapTarget_Team_Teacher_1_text_2'
                opacity='0'
                width='100%'
                // fontSize='110px'
                className='text-[116px]'
                fill='#0b4b5c'
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <textPath
                  id='gsapTarget_Team_Teacher_1_TextPath_2'
                  href='#gsapTarget_Team_Teacher_1_Path_2'
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  startOffset='900px'
                >
                  Raoul
                </textPath>
              </text>
            </svg>
          </div>
          <div className='flex w-full shrink-0 grow-0 justify-center'>
            <div className='relative z-1 mt-6 size-45 overflow-hidden rounded-full'>
              <Image
                src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830012/Raoul_Bova_yehodk.jpg'
                alt='Profile Photo of Teacher Raoul Bova'
                width={3023}
                height={3023}
              />
            </div>
          </div>
          <div className='relative z-1 mt-12 flex h-[336px] shrink-0 grow-0 items-start text-center'>
            <div className='flex h-full items-center justify-center'>
              <blockquote className='max-h-full overflow-y-auto px-6 text-lg text-[#6b6b6b]'>
                Ciao! I’m Raoul, your Italian teacher at Viva Languages. I grew
                up in Florence and have been teaching Italian for over 8 years.
                I love helping students discover the beauty of Italian language
                and culture — from everyday expressions to opera, food, and
                history. My classes are full of conversation, laughter, and a
                lot of hand gestures (it’s very Italian! 🤞). I can’t wait to
                share my passion with you!
              </blockquote>
            </div>
          </div>
          <div className='h-[172px] shrink-0 grow-0 rounded-2xl px-6 text-center'>
            <h3 className='font-quicksand text-lg text-[#6b6b6b]/90'>
              My Latest Programs
            </h3>
            <div className='mt-3 flex h-[132px] flex-wrap items-center justify-evenly overflow-y-auto'>
              {teachers?.['66357790-b53b-42a1-bef2-ad05dbf6c82d']?.courses?.map(
                (course) => (
                  <div
                    key={course.program_id}
                    className='my-2 min-w-[33.333%] hover:scale-98 active:scale-97'
                  >
                    <Link
                      href={`program/${course.program_id}`}
                      className='bg-theme-light-blue text-theme-deep-blue w-[188px] rounded-[24px] px-3 py-1 text-center text-lg font-medium'
                    >
                      <span>{course.program_name}</span>
                    </Link>
                  </div>
                ),
              )}
              {hosts?.['2f383a6d-cddf-4c76-9a90-d84d33a18f35']?.events?.map(
                (event) => (
                  <div
                    key={event.program_id}
                    className='my-2 min-w-[33.333%] hover:scale-98 active:scale-97'
                  >
                    <Link
                      href={`program/${event.program_id}`}
                      className='bg-theme-light-blue text-theme-deep-blue w-[188px] rounded-[24px] px-3 py-1 text-center text-lg font-medium'
                    >
                      <span>{event.program_name}</span>
                    </Link>
                  </div>
                ),
              )}
            </div>
          </div>
        </figure>

        {/* Teacher 2 */}
        <figure className='relative flex h-[828px] w-[327px] flex-col gap-5 overflow-hidden rounded-2xl bg-white pb-8 shadow-[var(--shadow-1)]'>
          <h2 className='sr-only'>Marion Cotillard</h2>
          {/* (SVG colored shape) */}
          <div
            id='gsapTarget_Team_Teacher_2_SVG_Shape'
            className='gsapTarget_Team_ScrollTrigger absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end bg-[#f9d8a2]'
            aria-hidden
          >
            <svg
              className='absolute bottom-[-60px] left-0 z-1'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                fill='#f9d8a2'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              ></path>
            </svg>
          </div>
          {/* (SVG curved text 1) */}
          <div
            id='gsapTarget_Team_Teacher_2_SVG_Curved_Text_Div_1'
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='gsapTarget_Team_Teacher_2_Path_1'
                fill='transparent'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              />
              <text
                id='gsapTarget_Team_Teacher_2_Text_1'
                opacity='0'
                width='100%'
                // fontSize='116px'
                className='text-[116px]'
                fill='#6e4707'
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <textPath
                  id='gsapTarget_Team_Teacher_2_TextPath_1'
                  href='#gsapTarget_Team_Teacher_2_Path_1'
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  startOffset='0px'
                >
                  Cotillard
                </textPath>
              </text>
            </svg>
          </div>
          {/* (SVG curved text 2) */}
          <div
            id='gsapTarget_Team_Teacher_2_SVG_Curved_Text_Div_2'
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='gsapTarget_Team_Teacher_2_Path_2'
                fill='transparent'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              />
              <text
                id='gsapTarget_Team_Teacher_2_text_2'
                opacity='0'
                width='100%'
                // fontSize='116px'
                className='text-[116px]'
                fill='#6e4707'
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <textPath
                  id='gsapTarget_Team_Teacher_2_TextPath_2'
                  href='#gsapTarget_Team_Teacher_2_Path_2'
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  startOffset='900px'
                >
                  Marion
                </textPath>
              </text>
            </svg>
          </div>
          <div className='flex w-full shrink-0 grow-0 justify-center'>
            <div className='relative z-1 mt-6 block size-45 overflow-hidden rounded-full'>
              <Image
                className='object-cover'
                src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830009/Marion_Cotillard_wlvyz3.jpg'
                alt='Profile Photo of Teacher Marion Cotillard'
                // width={3872}
                // height={2592}
                fill
                sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
              />
            </div>
          </div>
          <div className='relative z-1 mt-12 flex h-[336px] shrink-0 grow-0 items-start text-center'>
            <div className='flex h-full items-center justify-center'>
              <blockquote className='max-h-full overflow-y-auto px-6 text-lg text-[#6b6b6b]'>
                Bonjour, je m’appelle Marion! I’m your French teacher and a
                lifelong language enthusiast from Lyon. I’ve worked with
                learners of all ages and believe that curiosity, creativity, and
                connection are the keys to mastering French. In my class, you’ll
                find a mix of structure and play — from grammar games to
                real-life dialogues. Let’s explore the beauty of French
                together, one smile at a time!
              </blockquote>
            </div>
          </div>
          <div className='h-[172px] shrink-0 grow-0 rounded-2xl px-6 text-center'>
            <h3 className='font-quicksand text-lg text-[#6b6b6b]/90'>
              My Latest Programs
            </h3>
            <div className='mt-3 flex h-[132px] flex-wrap items-center justify-evenly overflow-y-auto'>
              {teachers?.['3d8eecab-0526-4313-80b4-f0cb362a1247']?.courses?.map(
                (course) => (
                  <div
                    key={course.program_id}
                    className='my-2 min-w-[33.333%] hover:scale-98 active:scale-97'
                  >
                    <Link
                      href={`program/${course.program_id}`}
                      className='text-theme-brown w-[188px] rounded-[24px] bg-[#f9d8a2] px-3 py-1 text-center text-lg font-medium'
                    >
                      <span>{course.program_name}</span>
                    </Link>
                  </div>
                ),
              )}
              {hosts?.['676db069-f27a-44c7-8513-6495268c600c']?.events?.map(
                (event) => (
                  <div
                    key={event.program_id}
                    className='my-2 min-w-[33.333%] hover:scale-98 active:scale-97'
                  >
                    <Link
                      href={`program/${event.program_id}`}
                      className='text-theme-brown w-[188px] rounded-[24px] bg-[#f9d8a2] px-3 py-1 text-center text-lg font-medium'
                    >
                      <span>{event.program_name}</span>
                    </Link>
                  </div>
                ),
              )}
            </div>
          </div>
        </figure>

        {/* Teacher 3 */}
        <figure className='relative flex h-[828px] w-[327px] flex-col gap-5 overflow-hidden rounded-2xl bg-white pb-8 shadow-[var(--shadow-1)]'>
          <h2 className='sr-only'>Gérard Depardieu</h2>
          {/* (SVG colored shape) */}
          <div
            id='gsapTarget_Team_Teacher_3_SVG_Shape'
            className='gsapTarget_Team_ScrollTrigger absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end bg-[#c8f6c9]'
            aria-hidden
          >
            <svg
              className='absolute bottom-[-60px] left-0 z-1'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                fill='#c8f6c9'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              ></path>
            </svg>
          </div>
          {/* (SVG curved text 1) */}
          <div
            id='gsapTarget_Team_Teacher_3_SVG_Curved_Text_Div_1'
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='gsapTarget_Team_Teacher_3_Path_1'
                fill='transparent'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              />
              <text
                id='gsapTarget_Team_Teacher_3_Text_1'
                opacity='0'
                width='100%'
                // fontSize='118px'
                className='text-[118px]'
                fill='#0d500f'
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <textPath
                  id='gsapTarget_Team_Teacher_3_TextPath_1'
                  href='#gsapTarget_Team_Teacher_3_Path_1'
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  startOffset='0px'
                >
                  Depardieu
                </textPath>
              </text>
            </svg>
          </div>
          {/* (SVG curved text 2) */}
          <div
            id='gsapTarget_Team_Teacher_3_SVG_Curved_Text_Div_2'
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='gsapTarget_Team_Teacher_3_Path_2'
                fill='transparent'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              />
              <text
                id='gsapTarget_Team_Teacher_3_text_2'
                opacity='0'
                width='100%'
                // fontSize='118px'
                className='text-[118px]'
                fill='#0d500f'
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <textPath
                  id='gsapTarget_Team_Teacher_3_TextPath_2'
                  href='#gsapTarget_Team_Teacher_3_Path_2'
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  startOffset='900px'
                >
                  Gérard
                </textPath>
              </text>
            </svg>
          </div>
          <div className='flex w-full shrink-0 grow-0 justify-center'>
            <div className='relative z-1 mt-6 block size-45 overflow-hidden rounded-full'>
              <Image
                className='object-cover'
                src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830008/G%C3%A9rard_Depardieu_uyaas6.jpg'
                alt='Profile Photo of Teacher Gérard Depardieu'
                // width={5292}
                // height={4142}
                fill
                sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
              />
            </div>
          </div>
          <div className='relative z-1 mt-12 flex h-[336px] shrink-0 grow-0 items-start text-center'>
            <div className='flex h-full items-center justify-center'>
              <blockquote className='max-h-full overflow-y-auto px-6 text-lg text-[#6b6b6b]'>
                Salut! I’m Gérard, your fun-loving French teacher. I work mostly
                with younger students — and I make sure learning French is never
                boring! We sing, draw, act out stories, and learn with movement
                and laughter. I love seeing my students grow in confidence and
                curiosity. French is a beautiful language, and I’m here to make
                it feel exciting and easy!
              </blockquote>
            </div>
          </div>
          <div className='h-[172px] shrink-0 grow-0 rounded-2xl px-6 text-center'>
            <h3 className='font-quicksand text-lg text-[#6b6b6b]/90'>
              My Latest Programs
            </h3>
            <div className='mt-3 flex h-[132px] flex-wrap items-center justify-evenly overflow-y-auto'>
              {teachers?.['2310e49d-e85b-47bb-bf64-de59aad00989']?.courses?.map(
                (course) => (
                  <div
                    key={course.program_id}
                    className='my-2 min-w-[33.333%] hover:scale-98 active:scale-97'
                  >
                    <Link
                      href={`program/${course.program_id}`}
                      className='w-[188px] rounded-[24px] bg-[#c8f6c9] px-3 py-1 text-center text-lg font-medium text-[#5C3B0B]'
                    >
                      <span>{course.program_name}</span>
                    </Link>
                  </div>
                ),
              )}
              {hosts?.['75add3c2-4130-4331-b894-7177e1c61f77']?.events?.map(
                (event) => (
                  <div
                    key={event.program_id}
                    className='my-2 min-w-[33.333%] hover:scale-98 active:scale-97'
                  >
                    <Link
                      href={`program/${event.program_id}`}
                      className='w-[188px] rounded-[24px] bg-[#c8f6c9] px-3 py-1 text-center text-lg font-medium text-[#5C3B0B]'
                    >
                      <span>{event.program_name}</span>
                    </Link>
                  </div>
                ),
              )}
            </div>
          </div>
        </figure>

        {/* Teacher 4 */}
        <figure className='relative flex h-[828px] w-[327px] flex-col gap-5 overflow-hidden rounded-2xl bg-white pb-8 shadow-[var(--shadow-1)]'>
          <h2 className='sr-only'>Penélope Cruz</h2>
          {/* (SVG colored shape) */}
          <div
            id='gsapTarget_Team_Teacher_4_SVG_Shape'
            className='gsapTarget_Team_ScrollTrigger absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end bg-[#fcd553]'
            aria-hidden
          >
            <svg
              className='absolute bottom-[-60px] left-0 z-1'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                fill='#fcd553'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              ></path>
            </svg>
          </div>
          {/* (SVG curved text 1) */}
          <div
            id='gsapTarget_Team_Teacher_4_SVG_Curved_Text_Div_1'
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='gsapTarget_Team_Teacher_4_Path_1'
                fill='transparent'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              />
              <text
                id='gsapTarget_Team_Teacher_4_Text_1'
                opacity='0'
                width='100%'
                // fontSize='110px'
                className='text-[116px]'
                fill='#624c02'
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <textPath
                  id='gsapTarget_Team_Teacher_4_TextPath_1'
                  href='#gsapTarget_Team_Teacher_4_Path_1'
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  startOffset='0px'
                >
                  Cruz
                </textPath>
              </text>
            </svg>
          </div>
          {/* (SVG curved text 2) */}
          <div
            id='gsapTarget_Team_Teacher_4_SVG_Curved_Text_Div_2'
            className='absolute top-0 left-0 z-0 flex h-[213.328px] w-full flex-col justify-end'
            aria-hidden
          >
            <svg
              width='100%'
              className='absolute bottom-[-60px] left-0 z-2 overflow-visible'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1440 320'
            >
              <path
                id='gsapTarget_Team_Teacher_4_Path_2'
                fill='transparent'
                fillOpacity='1'
                d='M0,96L80,133.3C160,171,320,245,480,229.3C640,213,800,107,960,80C1120,53,1280,107,1360,133.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z'
              />
              <text
                id='gsapTarget_Team_Teacher_4_text_2'
                opacity='0'
                width='100%'
                // fontSize='110px'
                className='text-[116px]'
                fill='#624c02'
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
              >
                <textPath
                  id='gsapTarget_Team_Teacher_4_TextPath_2'
                  href='#gsapTarget_Team_Teacher_4_Path_2'
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  startOffset='850px'
                >
                  Penélope
                </textPath>
              </text>
            </svg>
          </div>
          <div className='flex w-full shrink-0 grow-0 justify-center'>
            <div className='relative z-1 mt-6 block size-45 overflow-hidden rounded-full'>
              <Image
                className='object-cover object-left'
                src='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1743830025/Pen%C3%A9lope_Cruz_xxksj3.jpg'
                alt='Profile Photo of Teacher Penélope Cruz'
                // width={6016}
                // height={4016}
                fill
                sizes='(min-width: 1024px) 33.33vw, (min-width: 640px) 50vw, 100vw'
              />
            </div>
          </div>
          <div className='relative z-1 mt-12 flex h-[336px] shrink-0 grow-0 items-start text-center'>
            <div className='flex h-full items-center justify-center'>
              <blockquote className='max-h-full overflow-y-auto px-6 text-lg text-[#6b6b6b]'>
                ¡Hola! I’m Penélope, and I teach Spanish here at Viva. I’m
                originally from Madrid, and I’ve been teaching children and
                teens for more than 10 years. My goal is to make Spanish fun,
                engaging, and full of life. Expect games, stories, songs, and
                cultural adventures in every lesson. Whether you’re a complete
                beginner or ready for deeper conversation, I’m here to help you
                grow with confidence.
              </blockquote>
            </div>
          </div>
          <div className='h-[172px] shrink-0 grow-0 rounded-2xl px-6 text-center'>
            <h3 className='font-quicksand text-lg text-[#6b6b6b]/90'>
              My Latest Programs
            </h3>
            <div className='mt-3 flex h-[132px] flex-wrap items-center justify-evenly overflow-y-auto'>
              {teachers?.['6505e54c-3ca7-4d5e-af57-9041c10f6a4e']?.courses?.map(
                (course) => (
                  <div
                    key={course.program_id}
                    className='my-2 min-w-[33.333%] hover:scale-98 active:scale-97'
                  >
                    <Link
                      href={`program/${course.program_id}`}
                      className='text-theme-brown w-[188px] rounded-[24px] bg-[#fcd553] px-3 py-1 text-center text-lg font-medium'
                    >
                      <span>{course.program_name}</span>
                    </Link>
                  </div>
                ),
              )}
              {hosts?.['e8c8c5c7-c10d-40a7-ad69-eae20e1ecd00']?.events?.map(
                (event) => (
                  <div
                    key={event.program_id}
                    className='my-2 min-w-[33.333%] hover:scale-98 active:scale-97'
                  >
                    <Link
                      href={`program/${event.program_id}`}
                      className='text-theme-brown w-[188px] rounded-[24px] bg-[#fcd553] px-3 py-1 text-center text-lg font-medium'
                    >
                      <span>{event.program_name}</span>
                    </Link>
                  </div>
                ),
              )}
            </div>
          </div>
        </figure>
      </div>
    </section>
  )
}

export default Team
