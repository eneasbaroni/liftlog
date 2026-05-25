import { RoutineExerciseTileProps } from './types'

export const RoutineExerciseTile = ({
  exercise,
  isPrimary = false,
}: RoutineExerciseTileProps) => {
  if (isPrimary) {
    return (
      <div className="bg-ll-black-600 hover:bg-ll-black-orange rounded-[10px] p-3 flex justify-between items-end transition-colors">
        <div className="flex flex-col gap-2">
          <p className="text-ll-white text-sm font-medium">{exercise.name}</p>
          <div className="flex gap-2">
            {Array.from({ length: exercise.sets }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-ll-orange/20 flex items-center justify-center"
              >
                <div className="w-0.5 h-0.5 rounded-full bg-ll-orange" />
              </div>
            ))}
          </div>
          <p className="text-ll-black-300 text-xs">
            {exercise.sets} series · {exercise.reps} reps
          </p>
        </div>
        <div className="text-right">
          <p className="text-ll-white text-[26px] leading-none">
            {exercise.targetWeight}
            <span className="text-ll-black-300 text-[11px] ml-0.5">kg</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ll-black-600 hover:bg-ll-black-orange rounded-[10px] p-3 flex justify-between items-center transition-colors">
      <div>
        <p className="text-ll-white text-sm font-medium">{exercise.name}</p>
        <p className="text-ll-black-300 text-xs mt-0.5">
          {exercise.sets} × {exercise.reps}
        </p>
      </div>
      <p className="text-ll-orange text-[15px] leading-none">
        {exercise.targetWeight}
        <span className="text-ll-black-300 text-[10px] ml-0.5">kg</span>
      </p>
    </div>
  )
}
