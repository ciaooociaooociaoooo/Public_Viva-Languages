'use client'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useMobileSizeDetector from '../../lib/hooks/useMobileSizeDetector'
import CTALink from '../ctaLink'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const CTA2 = () => {
  const { windowSize, isMobileSize } = useMobileSizeDetector(1024)

  useGSAP(() => {
    ScrollTrigger.getAll()
      .filter(
        (trigger) =>
          trigger?.trigger &&
          trigger.trigger?.classList.contains('gsapTarget_CTA2'),
      )
      .forEach((trigger) => {
        trigger.kill()
      })

    gsap.killTweensOf('.gsapTarget_CTA2')

    gsap.set('#gsapTarget_CTA2_container', { clearProps: 'all' })
    gsap.set('#gsapTarget_CTA2_1', { clearProps: 'all' })
    gsap.set('#gsapTarget_CTA2_2', { clearProps: 'all' })
    gsap.set('#gsapTarget_CTA2_3', { clearProps: 'all' })

    gsap.to('#gsapTarget_CTA2_1', {
      opacity: 1,
      scrollTrigger: {
        trigger: '#gsapTarget_CTA2_container',
        start: 'top-=20% center',
        end: isMobileSize ? '+=58%' : '+=56.5%',
        scrub: 2,
        once: true,
        invalidateOnRefresh: true,
        // markers: true,
        // id: 'Logo',
      },
    })

    gsap.to('#gsapTarget_CTA2_2', {
      y: `${isMobileSize ? '+=400%' : '+=275%'}`,
      scrollTrigger: {
        trigger: '#gsapTarget_CTA2_container',
        start: 'top-=20% center',
        end: isMobileSize ? '+=58%' : '+=56.5%',
        scrub: 2,
        once: true,
        invalidateOnRefresh: true,
        // markers: true,
        // id: 'Title',
      },
    })

    gsap.to('#gsapTarget_CTA2_3', {
      y: () => {
        const el = document.getElementById('CTALink')
        const height = el?.clientHeight || 0
        return 1.25 * height
      },
      scrollTrigger: {
        trigger: '#gsapTarget_CTA2_container',
        start: 'top-=20% center',
        end: isMobileSize ? '+=58%' : '+=56.5%',
        scrub: 2,
        once: true,
        invalidateOnRefresh: true,
        // markers: true,
        // id: 'Btn',
      },
    })

    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)
  }, [windowSize, isMobileSize])

  return (
    <section
      id='gsapTarget_CTA2_container'
      className='gsapTarget_CTA2 relative h-[calc(100vh-72px)] w-full overflow-x-hidden sm:h-[calc(100vh-76px)]'
    >
      <img
        id='gsapTarget_CTA2_1'
        className='gsapTarget_CTA2 absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-[70%] scale-90 opacity-0 sm:max-lg:scale-100 lg:hidden'
        src='/Logo2_nobg.svg'
        alt='Logo'
      />

      <h3
        id='gsapTarget_CTA2_2'
        className='gsapTarget_CTA2 text-theme-gold absolute top-1/2 right-0 w-full -translate-y-[500%] text-center text-3xl sm:max-lg:text-4xl lg:-translate-y-[400%] lg:text-[3.5vw]'
      >
        Learn. Explore. Connect.
      </h3>

      <div
        id='gsapTarget_CTA2_3'
        className='gsapTarget_CTA2 absolute top-1/2 right-0 w-full translate-y-[350%] text-center'
      >
        <CTALink
          href='/'
          className='px-5 py-1.5 text-xl leading-none text-nowrap sm:max-lg:text-xl lg:px-5 lg:py-3 lg:text-xl'
        >
          <span
            id='CTALink'
            className='leading-[29.4px] text-nowrap lg:leading-none'
          >
            Start Your Journey
          </span>
        </CTALink>
      </div>
    </section>
  )
}

export default CTA2
