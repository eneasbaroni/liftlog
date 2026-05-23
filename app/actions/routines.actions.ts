'use server'

import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/db/mongoose'
import Routine, { IRoutineExercise } from '@/lib/db/models/Routine'
import { WeekDay } from '@/lib/constants'
import { Types } from 'mongoose'

// ── Types ────────────────────────────────────────────────────────────────────

// Plain object shape returned by .lean() for a routine exercise subdocument
type LeanRoutineExercise = {
  exerciseId: Types.ObjectId
  order: number
  sets: number
  reps: number
  targetWeight: number
  restSeconds?: number
  notes?: string
}

// Plain object shape returned by .lean() for a routine document
type LeanRoutine = {
  _id: Types.ObjectId
  name: string
  active: boolean
  days: Record<string, LeanRoutineExercise[]>
  createdAt: Date
  updatedAt: Date
}

export type RoutineExercisePayload = {
  exerciseId: string
  order: number
  sets: number
  reps: number
  targetWeight: number
  restSeconds?: number
  notes?: string
}

export type RoutineDTO = {
  _id: string
  name: string
  active: boolean
  days: Partial<Record<WeekDay, RoutineExercisePayload[]>>
  createdAt: string
}

type ActionError = { success: false; error: string }
type ActionResult<T> = { success: true; data: T } | ActionError

// ── Helpers ──────────────────────────────────────────────────────────────────

function exerciseToPayload(e: LeanRoutineExercise): RoutineExercisePayload {
  return {
    exerciseId: e.exerciseId.toString(),
    order: e.order,
    sets: e.sets,
    reps: e.reps,
    targetWeight: e.targetWeight,
    restSeconds: e.restSeconds,
    notes: e.notes,
  }
}

function toDTO(doc: LeanRoutine): RoutineDTO {
  const days: Partial<Record<WeekDay, RoutineExercisePayload[]>> = {}

  const daysMap = doc.days as unknown as Map<string, LeanRoutineExercise[]>
  if (daysMap instanceof Map) {
    daysMap.forEach((exercises, day) => {
      days[day as WeekDay] = exercises.map(exerciseToPayload)
    })
  } else {
    for (const [day, exercises] of Object.entries(doc.days)) {
      days[day as WeekDay] = exercises.map(exerciseToPayload)
    }
  }

  return {
    _id: doc._id.toString(),
    name: doc.name,
    active: doc.active,
    days,
    createdAt: doc.createdAt.toISOString(),
  }
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getRoutines(): Promise<RoutineDTO[]> {
  await connectDB()
  const docs = await Routine.find()
    .sort({ createdAt: -1 })
    .lean<LeanRoutine[]>()
  return docs.map(toDTO)
}

export async function getActiveRoutine(): Promise<RoutineDTO | null> {
  await connectDB()
  const doc = await Routine.findOne({ active: true }).lean<LeanRoutine>()
  if (!doc) return null
  return toDTO(doc)
}

export async function getRoutineById(id: string): Promise<RoutineDTO | null> {
  if (!Types.ObjectId.isValid(id)) return null
  await connectDB()
  const doc = await Routine.findById(id).lean<LeanRoutine>()
  if (!doc) return null
  return toDTO(doc)
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function createRoutine(
  name: string
): Promise<ActionResult<RoutineDTO>> {
  try {
    await connectDB()
    const doc = await Routine.create({ name, active: false, days: new Map() })
    const lean = await Routine.findById(doc._id).lean<LeanRoutine>()
    if (!lean)
      return { success: false, error: 'Failed to retrieve created routine' }

    revalidatePath('/week')
    revalidatePath('/routines')

    return { success: true, data: toDTO(lean) }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create routine'
    return { success: false, error: message }
  }
}

export async function setActiveRoutine(
  id: string
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()
    await Routine.updateMany({}, { active: false })
    const doc = await Routine.findByIdAndUpdate(id, { active: true })
    if (!doc) return { success: false, error: 'Routine not found' }

    revalidatePath('/week')
    revalidatePath('/routines')

    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to set active routine'
    return { success: false, error: message }
  }
}

export async function deleteRoutine(
  id: string
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()
    const doc = await Routine.findByIdAndDelete(id)
    if (!doc) return { success: false, error: 'Routine not found' }

    revalidatePath('/routines')
    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to delete routine'
    return { success: false, error: message }
  }
}

// ── Day management ───────────────────────────────────────────────────────────

export async function addExerciseToDay(
  routineId: string,
  day: WeekDay,
  exercise: RoutineExercisePayload
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()

    const routine = await Routine.findById(routineId)
    if (!routine) return { success: false, error: 'Routine not found' }

    const dayExercises = routine.days.get(day) ?? []
    const newExercise: IRoutineExercise = {
      exerciseId: new Types.ObjectId(exercise.exerciseId),
      order: dayExercises.length,
      sets: exercise.sets,
      reps: exercise.reps,
      targetWeight: exercise.targetWeight,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
    }

    dayExercises.push(newExercise)
    routine.days.set(day, dayExercises)
    await routine.save()

    revalidatePath('/week')
    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to add exercise'
    return { success: false, error: message }
  }
}

export async function removeExerciseFromDay(
  routineId: string,
  day: WeekDay,
  exerciseId: string
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()

    const routine = await Routine.findById(routineId)
    if (!routine) return { success: false, error: 'Routine not found' }

    const dayExercises = routine.days.get(day) ?? []
    const filtered: IRoutineExercise[] = dayExercises
      .filter((e) => e.exerciseId.toString() !== exerciseId)
      .map((e, i) => ({ ...e, order: i }) as IRoutineExercise)

    routine.days.set(day, filtered)
    await routine.save()

    revalidatePath('/week')
    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to remove exercise'
    return { success: false, error: message }
  }
}

export async function updateExerciseInDay(
  routineId: string,
  day: WeekDay,
  exerciseId: string,
  updates: Partial<Omit<RoutineExercisePayload, 'exerciseId'>>
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()

    const routine = await Routine.findById(routineId)
    if (!routine) return { success: false, error: 'Routine not found' }

    const dayExercises = routine.days.get(day) ?? []
    const idx = dayExercises.findIndex(
      (e) => e.exerciseId.toString() === exerciseId
    )
    if (idx === -1)
      return { success: false, error: 'Exercise not found in day' }

    const current = dayExercises[idx]
    dayExercises[idx] = {
      exerciseId: current.exerciseId,
      order: updates.order ?? current.order,
      sets: updates.sets ?? current.sets,
      reps: updates.reps ?? current.reps,
      targetWeight: updates.targetWeight ?? current.targetWeight,
      restSeconds: updates.restSeconds ?? current.restSeconds,
      notes: updates.notes ?? current.notes,
    }

    routine.days.set(day, dayExercises)
    await routine.save()

    revalidatePath('/week')
    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to update exercise'
    return { success: false, error: message }
  }
}

export async function reorderDayExercises(
  routineId: string,
  day: WeekDay,
  orderedExerciseIds: string[]
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()

    const routine = await Routine.findById(routineId)
    if (!routine) return { success: false, error: 'Routine not found' }

    const dayExercises = routine.days.get(day) ?? []

    const reordered = orderedExerciseIds.reduce<IRoutineExercise[]>(
      (acc, id, i) => {
        const ex = dayExercises.find((e) => e.exerciseId.toString() === id)
        if (ex) acc.push({ ...ex, order: i })
        return acc
      },
      []
    )

    routine.days.set(day, reordered)
    await routine.save()

    revalidatePath('/week')
    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to reorder exercises'
    return { success: false, error: message }
  }
}
