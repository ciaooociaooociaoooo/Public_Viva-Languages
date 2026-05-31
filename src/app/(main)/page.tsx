import HomeGallery from '../ui/home/homeGallery'
import CarouselWrapper from '../ui/home/carouselWrapper'
import CTA2 from '../ui/home/cta2'
import CTALink from '../ui/ctaLink'

export default function Home() {
  return (
    <>
      {/* Hero */}
      {/* (72, 76px - from header) */}
      <section className='relative aspect-4/5 h-[calc(100vh-72px)] w-full overflow-hidden sm:h-[calc(100vh-76px)] lg:aspect-auto'>
        <div className='absolute top-0 left-0 -z-1 size-full' aria-hidden>
          {/* desk */}
          <video
            className='hidden size-full object-cover object-center lg:block'
            autoPlay
            muted
            loop
            playsInline
            poster='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1744902129/Hero_video_poster_desk_dbbyws.png'
          >
            <source
              type='video/mp4'
              src='https://res.cloudinary.com/dyqjn9z7x/video/upload/v1744910194/Video_Hero_desk_compressed_2_jh5pjd.mp4'
            ></source>
            <source
              type='video/webm'
              src='https://res.cloudinary.com/dyqjn9z7x/video/upload/v1744901771/Video_Hero_desk_compressed_q7o3il.webm'
            ></source>
            Your browser is not supported for this video.
          </video>

          {/* mob */}
          <video
            className='block size-full object-cover object-center lg:hidden'
            autoPlay
            muted
            loop
            playsInline
            poster='https://res.cloudinary.com/dyqjn9z7x/image/upload/v1744944044/Hero_video_poster_mob_2_jj6cxb.png'
          >
            <source
              type='video/mp4'
              src='https://res.cloudinary.com/dyqjn9z7x/video/upload/v1744944266/Video_Hero_mob_compressed_2_h1hpof.mp4'
            ></source>
            <source
              type='video/webm'
              src='https://res.cloudinary.com/dyqjn9z7x/video/upload/v1744944351/Video_Hero_mob_compressed_2_dzpxin.webm'
            ></source>
            Your browser is not supported for this video.
          </video>
        </div>

        <div className='absolute top-1/2 left-1/25 w-full text-white lg:left-0'>
          <div className='min-[455px]:ml-20'>
            <h1 className='font-caveat mr-auto ml-3 -translate-y-1/2 text-5xl lg:ml-6 lg:text-6xl'>
              Speak the World!
            </h1>
            <p className='font-quicksand -mt-1 mr-auto ml-11 -translate-y-1/2 text-base lg:-mt-2.5 lg:ml-28 [@media(min-width:1024px)_and_(orientation:portrait)]:-mt-2'>
              Join our latest language courses
            </p>

            <div className='mt-[5px] w-full lg:mt-0.5 [@media(min-width:1024px)_and_(orientation:portrait)]:mt-1'>
              <CTALink
                href='/'
                className='mr-auto ml-18 px-4 py-[3px] leading-normal text-nowrap lg:ml-34 lg:px-4.5 lg:py-1.5 lg:text-xl [@media(min-width:1024px)_and_(orientation:portrait)]:ml-35 [@media(min-width:1024px)_and_(orientation:portrait)]:px-5 [@media(min-width:1024px)_and_(orientation:portrait)]:py-[7px]'
              >
                <span className='leading-normal text-nowrap lg:leading-tight'>
                  Start Your Journey
                </span>
              </CTALink>
            </div>
          </div>
        </div>
      </section>

      <HomeGallery />

      <CarouselWrapper />

      <CTA2 />
    </>
  )
}
