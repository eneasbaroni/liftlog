import { getExercises } from '@/app/actions/exercises.actions'
import { MuscleGroupSection } from '@/components'
import { MUSCLE_GROUPS, MuscleGroup } from '@/lib/constants'

const ProgressPage = async () => {
  const exercises = await getExercises()

  const grouped = MUSCLE_GROUPS.reduce<
    Partial<Record<MuscleGroup, typeof exercises>>
  >((acc, group) => {
    const groupExercises = exercises.filter((e) => e.muscleGroup === group)
    if (groupExercises.length > 0) acc[group] = groupExercises
    return acc
  }, {})

  const hasExercises = exercises.length > 0

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      <h1 className="text-ll-white text-[28px] mb-6">PROGRESO</h1>

      {!hasExercises ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <p className="text-ll-black-300 text-[13px] text-center">
            Creá ejercicios para ver tu progreso.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {MUSCLE_GROUPS.map((group) => {
            const groupExercises = grouped[group]
            if (!groupExercises?.length) return null
            return (
              <MuscleGroupSection
                key={group}
                muscleGroup={group}
                exercises={groupExercises}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProgressPage
