import Link from 'next/link'
import { MUSCLE_GROUPS_LABELS_ICONS } from '@/lib/constants'
import { ExerciseProgressRowProps } from './types'
import Image from 'next/image'

export const ExerciseProgressRow = ({ exercise }: ExerciseProgressRowProps) => {
  return (
    <Link href={`/exercises/${exercise._id}`} className="block group">
      <div className="bg-ll-black-600 hover:bg-ll-black-orange rounded-[10px] px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-ll-orange shrink-0">
            <Image
              src={`/icons/${MUSCLE_GROUPS_LABELS_ICONS[exercise.muscleGroup]}`}
              alt={exercise.muscleGroup}
              width={40}
              height={40}
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0">
            <p className="text-ll-white text-[13px] truncate">
              {exercise.name}
            </p>
            <p className="text-ll-black-300 text-[11px] mt-0.5">
              {exercise.defaultSets} × {exercise.defaultReps} ·{' '}
              {exercise.defaultWeight} kg
            </p>
          </div>
        </div>
        <span className="text-ll-black-300 text-[18px] ml-3 shrink-0">›</span>
      </div>
    </Link>
  )
}
