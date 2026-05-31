import { auth } from '@/auth'
import { cloudinary } from '@/app/lib/cloudinaryConfig'

// src\app\ui\ImageUploader.tsx
// @access Private
// @role Admin Only
export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  if (session?.user?.role !== 'admin') {
    return new Response('Forbidden', { status: 403 })
  }

  const body = await request.json()
  const { paramsToSign } = body

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  )

  return Response.json({ signature })
}
