import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getExerciseById } from '@/app/actions/exercises.actions'
import { ExerciseForm, ProgressChart } from '@/components'
import { MUSCLE_GROUP_LABELS } from '@/lib/constants'

type ExerciseDetailPageProps = {
  params: Promise<{ id: string }>
}

const ExerciseDetailPage = async ({ params }: ExerciseDetailPageProps) => {
  const { id } = await params
  const exercise = await getExerciseById(id)

  if (!exercise) notFound()

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/exercises"
          className="text-ll-black-300 hover:text-ll-white transition-colors text-[20px] leading-none"
        >
          ←
        </Link>
        <span className="text-ll-orange text-[11px] uppercase tracking-wider">
          {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
        </span>
      </div>

      <h1 className="text-ll-white text-[32px] leading-none mb-6 uppercase">
        {exercise.name}
      </h1>

      {/* Default stats */}
      <div className="grid grid-cols-3 gap-0.5 mb-0.5">
        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
            Series
          </p>
          <p className="text-ll-white text-[24px] leading-none">
            {exercise.defaultSets}
          </p>
        </div>
        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
            Reps
          </p>
          <p className="text-ll-white text-[24px] leading-none">
            {exercise.defaultReps}
          </p>
        </div>
        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
            Peso
          </p>
          <p className="leading-none">
            <span className="text-ll-white text-[24px]">
              {exercise.defaultWeight}
            </span>
            <span className="text-ll-black-300 text-xs ml-0.5">kg</span>
          </p>
        </div>
      </div>

      {/* Description */}
      {exercise.description && (
        <div className="bg-ll-black-600 rounded-[10px] p-4 mb-4">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-2">
            Descripción
          </p>
          <p className="text-ll-black-200 text-sm leading-relaxed">
            {exercise.description}
          </p>
        </div>
      )}

      {/* Progress chart */}
      <div className="bg-ll-black-600 rounded-[10px] p-4 mb-0.5">
        <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-4">
          Progreso
        </p>
        <ProgressChart exerciseId={exercise._id} exerciseName={exercise.name} />
      </div>

      {/* Edit form */}
      <div className="bg-ll-black-600 rounded-[10px] p-4">
        <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-4">
          Editar ejercicio
        </p>
        <ExerciseForm exercise={exercise} />
      </div>
    </div>
  )
}

export default ExerciseDetailPage
