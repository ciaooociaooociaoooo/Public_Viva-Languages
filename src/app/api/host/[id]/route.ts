import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { TeacherHostProfileType } from '@/app/lib/definitions'

const sql = neon(process.env.DATABASE_URL!)

type Params = Promise<{ id: string }>

export async function GET(req: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params
    const hostId = params.id

    if (!hostId) {
      return NextResponse.json({ message: 'Missing host ID' }, { status: 400 })
    }

    const query = `
      SELECT 
        id,
        name,
        bio,
        color_1,
        color_2
      
      FROM host

      WHERE id = $1;
    `

    const res = (await sql.query(query, [hostId])) as TeacherHostProfileType[]

    if (!res.length) {
      return NextResponse.json(
        { message: `Host with ID ${hostId} not found` },
        { status: 404 },
      )
    }

    const host = res[0]

    return NextResponse.json(host)
  } catch (error) {
    console.error('Database Error:', error)

    return NextResponse.json(
      { message: 'Failed to fetch host' },
      { status: 500 },
    )
  }
}
