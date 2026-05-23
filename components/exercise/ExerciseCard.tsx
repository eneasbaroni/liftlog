import Link from 'next/link'
import {
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS_LABELS_ICONS,
} from '@/lib/constants'
import { ExerciseCardProps } from './types'
import Image from 'next/image'

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  return (
    <Link href={`/exercises/${exercise._id}`} className="block group">
      <div className="bg-ll-black-600 rounded-lg p-3 flex items-center gap-3 transition-colors hover:bg-ll-black-orange">
        {/* Muscle group accent */}
        {/* <div className="w-1 self-stretch rounded-full bg-ll-orange shrink-0" /> */}

        {/* Muscle group icon */}
        <div className="w-10 h-10 rounded-full bg-ll-orange shrink-0">
          <Image
            src={`/icons/${MUSCLE_GROUPS_LABELS_ICONS[exercise.muscleGroup]}`}
            alt={exercise.muscleGroup}
            width={40}
            height={40}
            className="object-contain p-1"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-ll-white text-[13px] font-medium truncate">
            {exercise.name}
          </p>
          <p className="text-ll-black-300 text-[11px] mt-0.5">
            {MUSCLE_GROUP_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}
          </p>
        </div>

        {/* Default stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-ll-orange text-[15px] font-medium leading-none font-anton">
              {exercise.defaultSets}×{exercise.defaultReps}
            </p>
            <p className="text-ll-black-300 text-[10px] mt-0.5">series</p>
          </div>

          <div className="text-right">
            <p className="text-ll-white text-[15px] font-medium leading-none font-anton">
              {exercise.defaultWeight}
              <span className="text-ll-black-300 text-[10px] font-normal ml-0.5">
                kg
              </span>
            </p>
            <p className="text-ll-black-300 text-[10px] mt-0.5">peso</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
