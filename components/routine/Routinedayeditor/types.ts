import { RoutineExercisePayload } from '@/app/actions/routines.actions'
import { ExerciseDTO } from '@/lib/types'

export type DayExerciseWithName = RoutineExercisePayload & { name: string }

export type RoutineDayEditorProps = {
  routineId: string
  day: string
  exercises: DayExerciseWithName[]
  availableExercises: ExerciseDTO[]
}
