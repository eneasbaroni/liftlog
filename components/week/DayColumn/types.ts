import { RoutineExercisePayload } from '@/app/actions/routines.actions'
import { WeekDay } from '@/lib/constants'

export type DayExercise = RoutineExercisePayload & { name: string }

export type DayColumnProps = {
  day: WeekDay
  exercises: DayExercise[]
  isToday: boolean
  isActive: boolean
  routineId: string
  onDayClick: (day: WeekDay) => void
}
