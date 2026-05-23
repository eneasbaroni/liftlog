import { RoutineExercisePayload } from '@/app/actions/routines.actions'

export type RoutineExerciseTileProps = {
  exercise: RoutineExercisePayload & { name: string }
  isPrimary?: boolean
}
