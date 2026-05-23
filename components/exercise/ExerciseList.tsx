import { MUSCLE_GROUPS } from '@/lib/types'
import { MUSCLE_GROUP_LABELS, MuscleGroup } from '@/lib/constants'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseListProps } from './types'

export const ExerciseList = ({
  exercises,
  activeFilter,
}: ExerciseListProps) => {
  const filters: Array<{ value: MuscleGroup | 'all'; label: string }> = [
    { value: 'all', label: 'Todos' },
    ...MUSCLE_GROUPS.map((g) => ({ value: g, label: MUSCLE_GROUP_LABELS[g] })),
  ]

  const filtered =
    activeFilter === 'all'
      ? exercises
      : exercises.filter((e) => e.muscleGroup === activeFilter)

  return (
    <div className="flex flex-col gap-4">
      {/* Filter chips — horizontal scroll */}
      <div className="flex gap-0.5 overflow-x-auto pb-3 scrollbar-none">
        {filters.map((f) => (
          <a
            key={f.value}
            href={
              f.value === 'all' ? '/exercises' : `/exercises?muscle=${f.value}`
            }
            className={[
              'shrink-0 px-3 py-1.5 rounded-lg text-[11px] transition-colors',
              activeFilter === f.value
                ? 'bg-ll-orange text-white'
                : 'bg-ll-black-600 text-ll-black-200 hover:text-ll-white',
            ].join(' ')}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-ll-black-300 text-[13px] text-center py-8">
          No hay ejercicios en este grupo.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {filtered.map((exercise) => (
            <ExerciseCard key={exercise._id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  )
}
