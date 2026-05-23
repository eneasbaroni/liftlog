import { RoutineDTO } from '@/app/actions/routines.actions'

export type RoutineCardProps = {
  routine: RoutineDTO
  onSetActive: (
    id: string
  ) => Promise<{ success: true } | { success: false; error: string }>
  onDelete: (
    id: string
  ) => Promise<{ success: true } | { success: false; error: string }>
}
