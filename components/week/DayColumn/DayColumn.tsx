import Link from 'next/link'
import { WEEK_DAY_LABELS } from '@/lib/constants'
import { RoutineExerciseTile } from '../RoutineExerciseTile/RoutineExerciseTile'
import { DayColumnProps } from './types'

export const DayColumn = ({
  day,
  exercises,
  isToday,
  isActive,
  routineId,
  onDayClick,
}: DayColumnProps) => {
  const label = WEEK_DAY_LABELS[day]
  const hasExercises = exercises.length > 0
  const [primary, ...rest] = exercises

  return (
    <div
      className={[
        'flex flex-col gap-0.75',
        isActive ? 'opacity-100' : 'opacity-60',
      ].join(' ')}
    >
      {/* Day header */}
      <button
        onClick={() => onDayClick(day)}
        className={[
          'flex items-center justify-between px-3 py-2 rounded-[10px] transition-colors',
          isActive
            ? 'bg-ll-orange text-ll-white'
            : 'bg-ll-black-600 hover:bg-ll-black-orange text-ll-white',
        ].join(' ')}
      >
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
        {isToday && (
          <span className="text-[9px] bg-ll-white text-ll-orange px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Hoy
          </span>
        )}
        {hasExercises && !isToday && (
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
        )}
      </button>

      {/* Start session button */}
      {isActive && hasExercises && (
        <Link
          href={`/session/start?routineId=${routineId}&day=${day}`}
          className="bg-ll-orange text-ll-white rounded-[10px] px-3 py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="text-sm font-medium">Iniciar sesión</span>
        </Link>
      )}

      {/* Exercises */}
      {hasExercises ? (
        <>
          {primary && <RoutineExerciseTile exercise={primary} isPrimary />}
          {rest.map((ex) => (
            <RoutineExerciseTile key={ex.exerciseId} exercise={ex} />
          ))}
        </>
      ) : (
        <div className="bg-ll-black-600 rounded-[10px] px-3 py-4 flex items-center justify-center">
          <p className="text-ll-black-300 text-xs">Descanso</p>
        </div>
      )}

      {/* Add exercise shortcut */}
      {isActive && (
        <Link
          href={`/routines/${routineId}?day=${day}`}
          className="bg-ll-black-600 hover:bg-ll-black-orange rounded-[10px] px-3 py-2 flex items-center justify-center gap-1 transition-colors"
        >
          <span className="text-ll-black-300 text-xs uppercase font-anton">
            + ejercicio
          </span>
        </Link>
      )}
    </div>
  )
}
