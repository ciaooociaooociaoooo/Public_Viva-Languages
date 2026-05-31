'use client'

import { useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const Intro = () => {
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
          trigger.trigger?.classList.contains('gsapTarget_Intro_ScrollTrigger'),
      )
      .forEach((trigger) => {
        trigger.kill()
      })

    gsap.killTweensOf('.gsapTarget_Intro_ScrollTrigger')

    window.scrollTo(0, 0)

    gsap.to('#gsapTarget_Intro_1st_P', {
      y: -15,
      opacity: 1,
      duration: 1.5,
      ease: 'ease-in',
      // stagger: 0.2,
      scrollTrigger: {
        trigger: '#gsapTarget_Intro_1st_Container',
        start: 'top+=65% bottom',
        end: '+=10%',
        scrub: false,
        invalidateOnRefresh: true,
        // markers: true,
        // id: 'title',
      },
    })

    gsap.to('#gsapTarget_Intro_2nd_P', {
      y: -15,
      opacity: 1,
      duration: 1.5,
      ease: 'ease-in',
      // stagger: 0.2,
      scrollTrigger: {
        trigger: '#gsapTarget_Intro_2nd_Container',
        start: 'top+=65% bottom',
        end: '+=10%',
        scrub: false,
        invalidateOnRefresh: true,
        // markers: true,
        // id: 'title',
      },
    })

    gsap.to('#gsapTarget_Intro_3rd_P', {
      y: -15,
      opacity: 1,
      duration: 1.5,
      ease: 'ease-in',
      // stagger: 0.2,
      scrollTrigger: {
        trigger: '#gsapTarget_Intro_3rd_Container',
        start: 'top+=65% bottom',
        end: '+=10%',
        scrub: false,
        invalidateOnRefresh: true,
        // markers: true,
        // id: 'title',
      },
    })

    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)
  }, [windowSize])

  return (
    <section className='font-quicksand mt-25 mb-11 flex flex-col gap-18 text-xl text-[#5A3E1A]/70'>
      <div
        id='gsapTarget_Intro_1st_Container'
        className='gsapTarget_Intro_ScrollTrigger lg:w-2/5 lg:max-w-[600px]'
      >
        <h1
          id='gsapTarget_Intro_1st_Heading'
          className='gsapTarget_Intro_ScrollTrigger text-theme-brown/80 pb-9 text-justify text-4xl'
        >
          Welcome
        </h1>
        <p
          id='gsapTarget_Intro_1st_P'
          className='gsapTarget_Intro_ScrollTrigger translate-y-[15px] opacity-0 lg:text-justify'
        >
          At Viva Languages, we believe learning a new language should be fun,
          meaningful, and accessible for everyone — from curious kids to
          passionate adults. We’re a vibrant language center dedicated to
          sparking joy in language learning through creativity, connection, and
          culture.
        </p>
      </div>

      <div
        id='gsapTarget_Intro_2nd_Container'
        className='gsapTarget_Intro_ScrollTrigger lg:ml-auto lg:w-2/3 lg:max-w-[1000px]'
      >
        <h1
          id='gsapTarget_Intro_2nd_Heading'
          className='gsapTarget_Intro_ScrollTrigger text-theme-brown/80 pb-9 text-justify text-4xl lg:text-right'
        >
          Our Mission
        </h1>
        <div
          id='gsapTarget_Intro_2nd_P'
          className='gsapTarget_Intro_ScrollTrigger translate-y-[15px] opacity-0 lg:text-justify'
        >
          <p className='lg:ml-auto'>
            We’re here to open doors to the world through language. Whether it’s
            French, Spanish, Italian, or beyond — our goal is to help learners
            grow in confidence, communication, and cultural appreciation.
          </p>
          <p className='lg:ml-auto'>
            Through interactive lessons, friendly native-speaking teachers, and
            a warm learning environment, we make language learning enjoyable,
            engaging, and effective.
          </p>
        </div>
      </div>

      <div
        id='gsapTarget_Intro_3rd_Container'
        className='gsapTarget_Intro_ScrollTrigger lg:w-2/5 lg:max-w-[600px]'
      >
        <h1
          id='gsapTarget_Intro_3rd_Heading'
          className='gsapTarget_Intro_ScrollTrigger text-theme-brown/80 pb-9 text-justify text-4xl'
        >
          Who We Teach
        </h1>
        <div
          id='gsapTarget_Intro_3rd_P'
          className='gsapTarget_Intro_ScrollTrigger translate-y-[15px] opacity-0 lg:text-justify'
        >
          <p className=''>
            From energetic toddlers discovering their first foreign word, to
            teens prepping for exams, to adults chasing lifelong learning — Viva
            welcomes learners of all ages.
          </p>
          <p>
            Our classrooms are full of laughter, growth, and global curiosity.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Intro
