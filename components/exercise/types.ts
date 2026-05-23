import { ExerciseDTO } from '@/lib/types'
import { MuscleGroup } from '@/lib/constants'

export type ExerciseCardProps = {
  exercise: ExerciseDTO
}

export type ExerciseFormProps = {
  exercise?: ExerciseDTO // If provided → edit mode
  onSuccess?: () => void
}

export type FormState = {
  name: string
  description: string
  muscleGroup: MuscleGroup
  defaultSets: number
  defaultReps: number
  defaultWeight: number
}

export type ExerciseListProps = {
  exercises: ExerciseDTO[]
  activeFilter: MuscleGroup | 'all'
}
