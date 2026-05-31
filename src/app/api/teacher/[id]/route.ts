import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { TeacherHostProfileType } from '@/app/lib/definitions'

const sql = neon(process.env.DATABASE_URL!)

type Params = Promise<{ id: string }>

export async function GET(req: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params
    const teacherId = params.id

    if (!teacherId) {
      return NextResponse.json(
        { message: 'Missing teacher ID' },
        { status: 400 },
      )
    }

    const query = `
      SELECT 
        id,
        name,
        bio,
        color_1,
        color_2
      
      FROM teacher

      WHERE id = $1;
    `

    const res = (await sql.query(query, [
      teacherId,
    ])) as TeacherHostProfileType[]

    if (!res.length) {
      return NextResponse.json(
        { message: `Teacher with ID ${teacherId} not found` },
        { status: 404 },
      )
    }

    const teacher = res[0]

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Database Error:', error)

    return NextResponse.json(
      { message: 'Failed to fetch teacher' },
      { status: 500 },
    )
  }
}
