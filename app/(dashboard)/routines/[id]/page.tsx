import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRoutineById } from '@/app/actions/routines.actions'
import { getExercises } from '@/app/actions/exercises.actions'
import { RoutineDayEditor } from '@/components'
import { WEEK_DAYS } from '@/lib/constants'
import { WEEK_DAY_LABELS } from '@/lib/constants'
import { RoutineDetailPageProps } from './types'

const RoutineDetailPage = async ({
  params,
  searchParams,
}: RoutineDetailPageProps) => {
  const { id } = await params
  const { day } = await searchParams

  const [routine, exercises] = await Promise.all([
    getRoutineById(id),
    getExercises(),
  ])

  if (!routine) notFound()

  const activeDay =
    day && (WEEK_DAYS as readonly string[]).includes(day) ? day : WEEK_DAYS[0]

  const exerciseNames = Object.fromEntries(
    exercises.map((e) => [e._id, e.name])
  )

  const dayExercises = (
    routine.days[activeDay as keyof typeof routine.days] ?? []
  ).map((ex) => ({
    ...ex,
    name: exerciseNames[ex.exerciseId] ?? ex.exerciseId,
  }))

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Link
          href="/routines"
          className="text-ll-black-300 hover:text-ll-white transition-colors text-[20px] leading-none"
        >
          ←
        </Link>
        <h1 className="text-ll-white text-[28px] leading-none uppercase">
          {routine.name}
        </h1>
      </div>

      {routine.active && (
        <p className="text-ll-orange text-[11px] uppercase tracking-wider mb-6 ml-8">
          Activa
        </p>
      )}

      {/* Day tabs */}
      <div className="grid grid-cols-7 gap-[3px] mb-4">
        {WEEK_DAYS.map((d) => {
          const hasExercises = (routine.days[d] ?? []).length > 0
          const isActive = d === activeDay

          return (
            <Link
              key={d}
              href={`/routines/${id}?day=${d}`}
              className={[
                'flex flex-col items-center py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-ll-orange'
                  : 'bg-ll-black-600 hover:bg-ll-black-orange',
              ].join(' ')}
            >
              <span
                className={[
                  'text-[9px] uppercase tracking-wider',
                  isActive ? 'text-ll-white' : 'text-ll-black-300',
                ].join(' ')}
              >
                {d.slice(0, 1).toUpperCase()}
              </span>
              <span
                className={[
                  'w-1 h-1 rounded-full mt-1',
                  hasExercises
                    ? isActive
                      ? 'bg-ll-white opacity-70'
                      : 'bg-ll-orange'
                    : 'bg-transparent',
                ].join(' ')}
              />
            </Link>
          )
        })}
      </div>

      <p className="text-ll-black-200 text-[11px] uppercase tracking-wider mb-3">
        {WEEK_DAY_LABELS[activeDay as keyof typeof WEEK_DAY_LABELS]}
      </p>

      <RoutineDayEditor
        routineId={id}
        day={activeDay}
        exercises={dayExercises}
        availableExercises={exercises}
      />
    </div>
  )
}

export default RoutineDetailPage
