export type ExerciseSetRowProps = {
  setNumber: number
  defaultWeight: number
  defaultReps: number
  onComplete: (weight: number, reps: number, rir: number) => void
  isLogging: boolean
}
