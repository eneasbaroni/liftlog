import { MuscleGroup } from '../constants'

// ── Domain primitives ────────────────────────────────────────────────────────
export { MUSCLE_GROUPS, WEEK_DAYS } from '@/lib/constants'

// ── Mongoose document interfaces ─────────────────────────────────────────────
export type { IExercise } from '@/lib/db/models/Exercise'
export type { IRoutine, IRoutineExercise } from '@/lib/db/models/Routine'
export type {
  ISession,
  ISessionExercise,
  ISessionSet,
  SessionStatus,
} from '@/lib/db/models/Session'

// ── Frontend DTOs (plain objects, no Mongoose internals) ─────────────────────

export type ExerciseDTO = {
  _id: string
  name: string
  description?: string
  muscleGroup: MuscleGroup
  defaultSets: number
  defaultReps: number
  defaultWeight: number
}

export type SessionSetDTO = {
  setNumber: number
  repsCompleted: number
  weight: number
  rir?: number
  rpe?: number
  notes?: string
  completedAt: string
}

export type SessionExerciseDTO = {
  exerciseId: string
  name: string
  order: number
  sets: SessionSetDTO[]
  notes?: string
}

export type SessionDTO = {
  _id: string
  routineId: string
  day: string
  date: string
  status: 'pending' | 'in_progress' | 'completed'
  exercises: SessionExerciseDTO[]
  startedAt?: string
  completedAt?: string
  durationMin?: number
}

export type ProgressPoint = {
  date: string
  maxWeight: number
  totalVolume: number
  estimated1RM: number
}
