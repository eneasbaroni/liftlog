import { ExerciseDTO } from '@/lib/types'
import { MuscleGroup } from '@/lib/constants'

export type MuscleGroupSectionProps = {
  muscleGroup: MuscleGroup
  exercises: ExerciseDTO[]
}
