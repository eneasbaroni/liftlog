import { SessionDTO } from '@/lib/types'

export type SessionSummaryProps = {
  session: SessionDTO
  onClose: () => void
}
