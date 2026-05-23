'use server'

import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/db/mongoose'
import Session, { ISessionSet } from '@/lib/db/models/Session'
import Routine from '@/lib/db/models/Routine'
import Exercise from '@/lib/db/models/Exercise'
import { SessionDTO, SessionSetDTO } from '@/lib/types'
import { Types } from 'mongoose'
import { WeekDay } from '@/lib/constants'

// ── Types ────────────────────────────────────────────────────────────────────

type LeanSessionSet = {
  setNumber: number
  repsCompleted: number
  weight: number
  rir?: number
  rpe?: number
  notes?: string
  completedAt: Date
}

type LeanSessionExercise = {
  exerciseId: Types.ObjectId
  name: string
  order: number
  sets: LeanSessionSet[]
  notes?: string
}

type LeanSession = {
  _id: Types.ObjectId
  routineId: Types.ObjectId
  day: WeekDay
  date: Date
  status: 'pending' | 'in_progress' | 'completed'
  exercises: LeanSessionExercise[]
  startedAt?: Date
  completedAt?: Date
  durationMin?: number
  generalNotes?: string
  createdAt: Date
  updatedAt: Date
}

type LeanExercise = {
  _id: Types.ObjectId
  name: string
}

type ActionError = { success: false; error: string }
type ActionResult<T> = { success: true; data: T } | ActionError

// ── Helpers ──────────────────────────────────────────────────────────────────

function setToDTO(s: LeanSessionSet): SessionSetDTO {
  return {
    setNumber: s.setNumber,
    repsCompleted: s.repsCompleted,
    weight: s.weight,
    rir: s.rir,
    rpe: s.rpe,
    notes: s.notes,
    completedAt: new Date(s.completedAt).toISOString(),
  }
}

function toDTO(doc: LeanSession): SessionDTO {
  return {
    _id: doc._id.toString(),
    routineId: doc.routineId.toString(),
    day: doc.day,
    date: new Date(doc.date).toISOString(),
    status: doc.status,
    exercises: doc.exercises.map((ex) => ({
      exerciseId: ex.exerciseId.toString(),
      name: ex.name,
      order: ex.order,
      notes: ex.notes,
      sets: ex.sets.map(setToDTO),
    })),
    startedAt: doc.startedAt
      ? new Date(doc.startedAt).toISOString()
      : undefined,
    completedAt: doc.completedAt
      ? new Date(doc.completedAt).toISOString()
      : undefined,
    durationMin: doc.durationMin,
  }
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getSessions(limit = 20): Promise<SessionDTO[]> {
  await connectDB()
  const docs = await Session.find()
    .sort({ date: -1 })
    .limit(limit)
    .lean<LeanSession[]>()
  return docs.map(toDTO)
}

export async function getSessionById(id: string): Promise<SessionDTO | null> {
  if (!Types.ObjectId.isValid(id)) return null
  await connectDB()
  const doc = await Session.findById(id).lean<LeanSession>()
  if (!doc) return null
  return toDTO(doc)
}

export async function getSessionByDate(date: Date): Promise<SessionDTO | null> {
  await connectDB()

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const doc = await Session.findOne({
    date: { $gte: start, $lte: end },
  }).lean<LeanSession>()
  if (!doc) return null
  return toDTO(doc)
}

// ── Start session ────────────────────────────────────────────────────────────

export async function startSession(
  routineId: string,
  day: WeekDay,
  date: Date
): Promise<ActionResult<SessionDTO>> {
  try {
    await connectDB()

    const routine = await Routine.findById(routineId)
    if (!routine) return { success: false, error: 'Routine not found' }

    const dayExercises = routine.days.get(day) ?? []
    if (!dayExercises.length)
      return { success: false, error: 'No exercises found for this day' }

    const exerciseIds = dayExercises.map((e) => e.exerciseId)
    const exerciseDocs = await Exercise.find({
      _id: { $in: exerciseIds },
    }).lean<LeanExercise[]>()
    const nameMap = new Map(exerciseDocs.map((e) => [e._id.toString(), e.name]))

    const exercises: LeanSessionExercise[] = dayExercises.map((e, i) => ({
      exerciseId: e.exerciseId,
      name: nameMap.get(e.exerciseId.toString()) ?? 'Unknown',
      order: i,
      sets: [],
      notes: e.notes,
    }))

    const created = await Session.create({
      routineId: new Types.ObjectId(routineId),
      day,
      date,
      status: 'in_progress',
      exercises,
      startedAt: new Date(),
    })

    // ✅ Sin revalidatePath: no puede usarse durante el render de un Server Component
    // (StartSessionPage llama esta acción durante su render y revalidatePath lanzaría error)
    return { success: true, data: toDTO(created.toObject() as LeanSession) }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to start session'
    return { success: false, error: message }
  }
}

// ── Log a set ────────────────────────────────────────────────────────────────

export async function logSet(
  sessionId: string,
  exerciseId: string,
  set: Omit<SessionSetDTO, 'completedAt'>
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()

    const session = await Session.findById(sessionId)
    if (!session) return { success: false, error: 'Session not found' }
    if (session.status !== 'in_progress')
      return { success: false, error: 'Session is not active' }

    const exercise = session.exercises.find(
      (e) => e.exerciseId.toString() === exerciseId
    )
    if (!exercise)
      return { success: false, error: 'Exercise not found in session' }

    const newSet: ISessionSet = {
      setNumber: set.setNumber,
      repsCompleted: set.repsCompleted,
      weight: set.weight,
      rir: set.rir,
      rpe: set.rpe,
      notes: set.notes,
      completedAt: new Date(),
    }

    exercise.sets.push(newSet)
    await session.save()

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to log set'
    return { success: false, error: message }
  }
}

// ── Complete session ─────────────────────────────────────────────────────────

export async function completeSession(
  sessionId: string,
  generalNotes?: string
): Promise<ActionResult<SessionDTO>> {
  try {
    await connectDB()

    const session = await Session.findById(sessionId)
    if (!session) return { success: false, error: 'Session not found' }

    const completedAt = new Date()
    const durationMin = session.startedAt
      ? Math.round(
          (completedAt.getTime() - session.startedAt.getTime()) / 60000
        )
      : undefined

    session.status = 'completed'
    session.completedAt = completedAt
    session.durationMin = durationMin
    session.generalNotes = generalNotes

    await session.save()

    // ✅ Usamos el documento en memoria, sin re-fetch innecesario
    revalidatePath('/week')
    revalidatePath('/history')
    revalidatePath(`/history/${sessionId}`)

    return { success: true, data: toDTO(session.toObject() as LeanSession) }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to complete session'
    return { success: false, error: message }
  }
}

// ── Delete session ───────────────────────────────────────────────────────────

export async function deleteSession(
  sessionId: string
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()

    const doc = await Session.findByIdAndDelete(sessionId)
    if (!doc) return { success: false, error: 'Session not found' }

    revalidatePath('/week')
    revalidatePath('/history')

    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to delete session'
    return { success: false, error: message }
  }
}
