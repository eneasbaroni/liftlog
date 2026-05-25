import { WEEK_DAY_LABELS } from '@/lib/constants'
import { WeekDay } from '@/lib/constants'
import { SessionDetailProps } from './types'

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export const SessionDetail = ({ session }: SessionDetailProps) => {
  const totalVolume = session.exercises.reduce(
    (acc, e) =>
      acc + e.sets.reduce((sAcc, s) => sAcc + s.weight * s.repsCompleted, 0),
    0
  )
  const totalSets = session.exercises.reduce((acc, e) => acc + e.sets.length, 0)
  const dayLabel = WEEK_DAY_LABELS[session.day as WeekDay] ?? session.day

  return (
    <div className="flex flex-col gap-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-[3px]">
        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
            Duración
          </p>
          <p className="text-ll-white text-[22px] leading-none">
            {session.durationMin ?? '—'}
            <span className="text-ll-black-300 text-[10px] ml-0.5">min</span>
          </p>
        </div>
        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
            Volumen
          </p>
          <p className="text-ll-white text-[22px] leading-none">
            {(totalVolume / 1000).toFixed(1)}
            <span className="text-ll-black-300 text-[10px] ml-0.5">t</span>
          </p>
        </div>
        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
            Series
          </p>
          <p className="text-ll-white text-[22px] leading-none">{totalSets}</p>
        </div>
      </div>

      {/* Exercise breakdown */}
      {session.exercises.map((exercise) => {
        const exVolume = exercise.sets.reduce(
          (acc, s) => acc + s.weight * s.repsCompleted,
          0
        )
        const maxWeight = exercise.sets.length
          ? Math.max(...exercise.sets.map((s) => s.weight))
          : 0

        return (
          <div
            key={exercise.exerciseId}
            className="bg-ll-black-600 rounded-[10px] overflow-hidden"
          >
            {/* Exercise header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-ll-black-900">
              <p className="text-ll-white text-sm font-medium">
                {exercise.name}
              </p>
              <p className="text-ll-orange text-sm">
                {maxWeight}
                <span className="text-ll-black-300 text-[10px] ml-0.5">
                  kg máx
                </span>
              </p>
            </div>

            {/* Sets */}
            <div className="px-4 py-2 flex flex-col gap-[3px]">
              {exercise.sets.map((set) => (
                <div
                  key={set.setNumber}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="text-ll-black-300 text-[11px] w-12">
                    Serie {set.setNumber}
                  </span>
                  <span className="text-ll-white text-xs">
                    {set.weight} kg × {set.repsCompleted} reps
                  </span>
                  {set.rir !== undefined && (
                    <span className="text-ll-black-300 text-[11px]">
                      RIR {set.rir}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Volume footer */}
            <div className="px-4 py-2 border-t border-ll-black-900">
              <p className="text-ll-black-300 text-[10px]">
                Volumen: {(exVolume / 1000).toFixed(2)} t
              </p>
            </div>
          </div>
        )
      })}

      {/* General notes */}
      {session.generalNotes && (
        <div className="bg-ll-black-600 rounded-[10px] p-4">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-2">
            Notas
          </p>
          <p className="text-ll-black-200 text-sm leading-relaxed">
            {session.generalNotes}
          </p>
        </div>
      )}
    </div>
  )
}
