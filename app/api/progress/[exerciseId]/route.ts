import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Session from '@/lib/db/models/Session'
import { buildProgressPoint } from '@/lib/utils/calculations'
import { ProgressPoint } from '@/lib/types'
import { Types } from 'mongoose'

type LeanSessionSet = {
  setNumber: number
  repsCompleted: number
  weight: number
  rir?: number
  rpe?: number
  completedAt: Date
}

type LeanSessionExercise = {
  exerciseId: Types.ObjectId
  sets: LeanSessionSet[]
}

type LeanSession = {
  date: Date
  exercises: LeanSessionExercise[]
}

type RouteParams = {
  params: Promise<{ exerciseId: string }>
}

export const GET = async (req: NextRequest, { params }: RouteParams) => {
  const { exerciseId } = await params

  if (!Types.ObjectId.isValid(exerciseId)) {
    return NextResponse.json({ error: 'Invalid exercise ID' }, { status: 400 })
  }

  await connectDB()

  const sessions = await Session.find(
    {
      status: 'completed',
      'exercises.exerciseId': new Types.ObjectId(exerciseId),
    },
    { date: 1, 'exercises.$': 1 } // Only return the matching exercise per session
  )
    .sort({ date: 1 })
    .lean<LeanSession[]>()

  const points: ProgressPoint[] = sessions
    .map((session) => {
      const exercise = session.exercises.find(
        (e) => e.exerciseId.toString() === exerciseId
      )
      if (!exercise || exercise.sets.length === 0) return null

      return buildProgressPoint(
        session.date,
        exercise.sets as Parameters<typeof buildProgressPoint>[1]
      )
    })
    .filter((p): p is ProgressPoint => p !== null)

  return NextResponse.json(points)
}
