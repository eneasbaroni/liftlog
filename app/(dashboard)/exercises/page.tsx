import Link from 'next/link'
import { getExercises } from '@/app/actions/exercises.actions'
import { ExerciseList } from '@/components'
import { MUSCLE_GROUPS } from '@/lib/types'
import { ExercisesPageProps } from './types'
import { MuscleGroup } from '@/lib/constants'

const ExercisesPage = async ({ searchParams }: ExercisesPageProps) => {
  const { muscle } = await searchParams

  const activeFilter: MuscleGroup | 'all' =
    muscle && (MUSCLE_GROUPS as readonly string[]).includes(muscle)
      ? (muscle as MuscleGroup)
      : 'all'

  const exercises = await getExercises(
    activeFilter === 'all' ? undefined : activeFilter
  )

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-ll-white text-[28px] leading-none font-anton">
          EJERCICIOS
        </h1>
        <Link
          href="/exercises/new"
          className="bg-ll-orange font-anton uppercase text-white text-[12px] rounded-lg px-3 py-2 flex items-center gap-1.5 transition-opacity hover:opacity-90"
        >
          Nuevo
        </Link>
      </div>

      <ExerciseList exercises={exercises} activeFilter={activeFilter} />
    </div>
  )
}

export default ExercisesPage
