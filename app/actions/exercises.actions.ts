'use server'

import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/db/mongoose'
import Exercise, { IExercise } from '@/lib/db/models/Exercise'
import { ExerciseDTO } from '@/lib/types'
import { MuscleGroup } from '@/lib/constants'
import { FlattenMaps, Types } from 'mongoose'

// ── Types ────────────────────────────────────────────────────────────────────

type LeanExercise = FlattenMaps<IExercise> & { _id: Types.ObjectId }

export type ExercisePayload = {
  name: string
  description?: string
  muscleGroup: MuscleGroup
  defaultSets: number
  defaultReps: number
  defaultWeight: number
}

type ActionSuccess<T> = { success: true; data: T }
type ActionError = { success: false; error: string }
type ActionResult<T> = ActionSuccess<T> | ActionError

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDTO(doc: LeanExercise): ExerciseDTO {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    muscleGroup: doc.muscleGroup,
    defaultSets: doc.defaultSets,
    defaultReps: doc.defaultReps,
    defaultWeight: doc.defaultWeight,
  }
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getExercises(
  muscleGroup?: MuscleGroup
): Promise<ExerciseDTO[]> {
  await connectDB()

  const filter = muscleGroup ? { muscleGroup } : {}
  const docs = await Exercise.find(filter)
    .sort({ name: 1 })
    .lean<LeanExercise[]>()

  return docs.map(toDTO)
}

export async function getExerciseById(id: string): Promise<ExerciseDTO | null> {
  if (!Types.ObjectId.isValid(id)) return null
  await connectDB()

  const doc = await Exercise.findById(id).lean<LeanExercise>()
  if (!doc) return null

  return toDTO(doc)
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function createExercise(
  payload: ExercisePayload
): Promise<ActionResult<ExerciseDTO>> {
  try {
    await connectDB()

    const doc = await Exercise.create(payload)
    const lean = doc.toObject() as LeanExercise

    revalidatePath('/exercises')

    return { success: true, data: toDTO(lean) }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create exercise'
    return { success: false, error: message }
  }
}

export async function updateExercise(
  id: string,
  payload: Partial<ExercisePayload>
): Promise<ActionResult<ExerciseDTO>> {
  try {
    await connectDB()

    const doc = await Exercise.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean<LeanExercise>()

    if (!doc) return { success: false, error: 'Exercise not found' }

    revalidatePath('/exercises')
    revalidatePath(`/exercises/${id}`)

    return { success: true, data: toDTO(doc) }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to update exercise'
    return { success: false, error: message }
  }
}

export async function deleteExercise(
  id: string
): Promise<{ success: true } | ActionError> {
  try {
    await connectDB()

    const doc = await Exercise.findByIdAndDelete(id)
    if (!doc) return { success: false, error: 'Exercise not found' }

    revalidatePath('/exercises')

    return { success: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to delete exercise'
    return { success: false, error: message }
  }
}
