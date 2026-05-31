'use client'

import { useEffect } from 'react'
import { useQuill } from 'react-quilljs'

import 'quill/dist/quill.snow.css' // Add css for snow theme

import DOMPurify from 'dompurify'

export default function QuillEditor({
  contentRef,
  initialValue,
}: {
  contentRef: React.MutableRefObject<string>
  initialValue?: string
}) {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ align: [] }],

      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],

      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [
        'link',
      ],
      [{ color: [] }, { background: [] }],
    ],
    clipboard: {
      matchVisual: false,
    },
  }

  const { quill, quillRef } = useQuill({ modules })

  useEffect(() => {
    if (quill) {
      // (Loading initial value)
      if (initialValue) {
        const clean = DOMPurify.sanitize(initialValue)
        quill.clipboard.dangerouslyPasteHTML(clean)
      }

      // (On change)
      quill.on('text-change', (delta, oldDelta, source) => {
  
        if (contentRef) {
          contentRef.current = quill.root.innerHTML
        }
      })
    }
  }, [quill, contentRef, initialValue])

  return (
    <div
      style={{
        color: 'var(--color-dashboard-text-3)',
        fontSize: 30,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          minHeight: 300,
          fontSize: 20,
          backgroundColor: 'var(--color-dashboard-block-bg-1)',
        }}
        ref={quillRef}
      />
    </div>
  )
}
