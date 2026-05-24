import { RoutineExercisePayload } from '@/app/actions/routines.actions'
import { ExerciseDTO } from '@/lib/types'

export type DayExerciseWithName = RoutineExercisePayload & { name: string }

export type RoutineDayEditorProps = {
  routineId: string
  day: string
  exercises: DayExerciseWithName[]
  availableExercises: ExerciseDTO[]
}

export type RoutineExerciseRow = {
  exerciseId: string
  name: string
  order: number
  sets: number
  reps: number
  targetWeight: number
  restSeconds?: number
  notes?: string
}
