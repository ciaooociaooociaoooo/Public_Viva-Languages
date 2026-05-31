'use client'

import { useRef, useEffect } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { deleteImageInCloudinary } from '../lib/actions'

interface ImageUploaderProps {
  children: (open: () => void) => React.ReactNode
  setImageURL: React.Dispatch<React.SetStateAction<string>>
  imageWidthRef: React.RefObject<number | null>
  imageHeightRef: React.RefObject<number | null>
  imagePublicIDRef: React.RefObject<string>
  imageBytesRef: React.RefObject<number | null>
  shouldDeletePreviousImageOnUploadSuccess?: boolean
}

export default function ImageUploader({
  children,
  setImageURL,
  imageWidthRef,
  imageHeightRef,
  imagePublicIDRef,
  imageBytesRef,
  shouldDeletePreviousImageOnUploadSuccess = true,
}: ImageUploaderProps) {
  const shouldDeleteRef = useRef(shouldDeletePreviousImageOnUploadSuccess)

  // (To let onSuccess get the latest shouldDeletePreviousImageOnUploadSuccess value)
  useEffect(() => {
    shouldDeleteRef.current = shouldDeletePreviousImageOnUploadSuccess
  }, [shouldDeletePreviousImageOnUploadSuccess])

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      signatureEndpoint='/api/sign-cloudinary-params'
      onSuccess={(result) => {
        if (typeof result.info === 'object' && 'secure_url' in result.info) {
          // (if there's an image previously uploaded, delete it.)
          if (shouldDeleteRef.current === true && imagePublicIDRef.current) {
            const deleteImageInCloudinaryWithId = deleteImageInCloudinary.bind(
              null,
              String(imagePublicIDRef.current ?? ''),
            )

            deleteImageInCloudinaryWithId()
              .then((res) => {
                if (!res.success) console.error(res.error)
              })
              .catch((err) => console.error('Delete failed:', err))
          }

          setImageURL(result.info.secure_url)
          imageWidthRef.current = result.info.width
          imageHeightRef.current = result.info.height
          imagePublicIDRef.current = result.info.public_id
          imageBytesRef.current = result.info.bytes
        }
      }}
      options={{
        singleUploadAutoClose: false,
        multiple: false,
        maxFileSize: 5500000,
        resourceType: 'image',
      }}
    >
      {/* {({ open }) => {
        return (
          <button
            type="button"
            onClick={() => open()}
            className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Upload Avatar
          </button>
        );
      }} */}
      {({ open }) => children(open)}
    </CldUploadWidget>
  )
}
