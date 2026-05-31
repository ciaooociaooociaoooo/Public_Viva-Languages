'use client'

import clsx from 'clsx'
import Button from './button'
import ImageUploader from './ImageUploader'
import Image from 'next/image'

interface ImageUploaderWrapperProps {
  imageURL: string
  setImageURL: React.Dispatch<React.SetStateAction<string>>
  imageWidthRef: React.RefObject<number | null>
  imageHeightRef: React.RefObject<number | null>
  imagePublicIDRef: React.RefObject<string>
  imageBytesRef: React.RefObject<number | null>
  disabled: boolean
  shouldDeletePreviousImageOnUploadSuccess?: boolean
}

const ImageUploaderWrapper = ({
  imageURL,
  setImageURL,
  imageWidthRef,
  imageHeightRef,
  imagePublicIDRef,
  imageBytesRef,
  disabled,
  shouldDeletePreviousImageOnUploadSuccess = true,
}: ImageUploaderWrapperProps) => {

  return (
    <>
      {imageURL && imageWidthRef?.current && imageHeightRef?.current && (
        <Image
          className='absolute top-1/2 left-1/2 -z-1 h-50 w-[141.38px] -translate-x-1/2 -translate-y-1/2 lg:h-90 lg:w-[254.49px]'
          src={imageURL}
          width={imageWidthRef.current}
          height={imageHeightRef.current}
          alt='Uploaded Poster'
        />
      )}

      <ImageUploader
        setImageURL={setImageURL}
        imageWidthRef={imageWidthRef}
        imageHeightRef={imageHeightRef}
        imagePublicIDRef={imagePublicIDRef}
        imageBytesRef={imageBytesRef}
        shouldDeletePreviousImageOnUploadSuccess={
          shouldDeletePreviousImageOnUploadSuccess
        }
      >
        {(open) => (
          <Button
            className={clsx(
              `dashboard-btn dashboard-second-action-btn w-50 rounded-lg px-4 py-3 lg:w-52 lg:px-7 lg:py-4`,
              disabled && 'cursor-wait',
            )}
            type='button'
            onClick={() => open()}
            disabled={disabled}
            aria-labelledby='poster-label'
          >
            {imageURL ? 'Update Poster' : 'Upload Poster'}
          </Button>
        )}
      </ImageUploader>
    </>
  )
}

export default ImageUploaderWrapper
