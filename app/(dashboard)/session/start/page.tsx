import { redirect } from 'next/navigation'
import { startSession } from '@/app/actions/sessions.actions'
import { WEEK_DAYS, WeekDay } from '@/lib/constants'

type StartSessionPageProps = {
  searchParams: Promise<{ routineId?: string; day?: string }>
}

const StartSessionPage = async ({ searchParams }: StartSessionPageProps) => {
  const { routineId, day } = await searchParams

  if (!routineId || !day || !(WEEK_DAYS as readonly string[]).includes(day)) {
    redirect('/week')
  }

  const result = await startSession(routineId, day as WeekDay, new Date())

  if (!result.success) {
    redirect('/week')
  }

  redirect(`/session/${result.data._id}`)
}

export default StartSessionPage
