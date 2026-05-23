import { RoutineDTO } from '@/app/actions/routines.actions'

export type WeekGridProps = {
  routine: RoutineDTO
  exerciseNames: Record<string, string>
  todayKey: string
}
