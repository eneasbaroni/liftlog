import { MUSCLE_GROUP_LABELS } from '@/lib/constants'
import { ExerciseProgressRow } from '../ExerciseProgressRow/ExerciseProgressRow'
import { MuscleGroupSectionProps } from './types'

export const MuscleGroupSection = ({
  muscleGroup,
  exercises,
}: MuscleGroupSectionProps) => {
  return (
    <div className="flex flex-col gap-[3px]">
      <p className="text-ll-black-300 text-xs font-anton uppercase tracking-wider px-1 mb-1">
        {MUSCLE_GROUP_LABELS[muscleGroup]}
      </p>
      {exercises.map((exercise) => (
        <ExerciseProgressRow key={exercise._id} exercise={exercise} />
      ))}
    </div>
  )
}
