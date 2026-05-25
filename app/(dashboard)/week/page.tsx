import Link from 'next/link'
import { getActiveRoutine } from '@/app/actions/routines.actions'
import { getExercises } from '@/app/actions/exercises.actions'
import { WeekGrid } from '@/components'
import { WEEK_DAYS } from '@/lib/constants'

const getTodayKey = (): string => {
  const days = ['sunday', ...WEEK_DAYS.slice(0, 6)]
  return days[new Date().getDay()]
}

const WeekPage = async () => {
  const [routine, exercises] = await Promise.all([
    getActiveRoutine(),
    getExercises(),
  ])

  const exerciseNames = Object.fromEntries(
    exercises.map((e) => [e._id, e.name])
  )

  const todayKey = getTodayKey()

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-ll-white text-[28px] leading-none">LIFTLOG</h1>
        <Link
          href="/routines"
          className="bg-ll-black-600 font-anton uppercase hover:bg-ll-black-orange text-ll-black-200 text-[11px] rounded-lg px-3 py-2 transition-colors"
        >
          Rutinas
        </Link>
      </div>

      {routine && (
        <p className="text-ll-orange text-[11px] uppercase tracking-wider mb-6">
          {routine.name}
        </p>
      )}

      {/* No active routine */}
      {!routine && (
        <div className="bg-ll-black-600 rounded-[10px] p-6 flex flex-col items-center gap-3 mt-8">
          <p className="text-ll-black-200 text-sm text-center">
            No tenés una rutina activa todavía.
          </p>
          <Link
            href="/routines"
            className="bg-ll-orange font-anton uppercase text-ll-white text-xs rounded-lg px-4 py-2"
          >
            Crear rutina
          </Link>
        </div>
      )}

      {/* Week grid */}
      {routine && (
        <WeekGrid
          routine={routine}
          exerciseNames={exerciseNames}
          todayKey={todayKey}
        />
      )}
    </div>
  )
}

export default WeekPage
