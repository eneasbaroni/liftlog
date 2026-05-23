import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSessionById } from '@/app/actions/sessions.actions'
import { SessionDetail } from '@/components'
import { WEEK_DAY_LABELS } from '@/lib/constants'
import { WeekDay } from '@/lib/constants'

type HistoryDetailPageProps = {
  params: Promise<{ id: string }>
}

const HistoryDetailPage = async ({ params }: HistoryDetailPageProps) => {
  const { id } = await params
  const session = await getSessionById(id)

  if (!session) notFound()

  const dayLabel = WEEK_DAY_LABELS[session.day as WeekDay] ?? session.day
  const date = new Date(session.date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/history"
          className="text-ll-black-300 hover:text-ll-white transition-colors text-[20px] leading-none"
        >
          ←
        </Link>
        <p className="text-ll-orange text-[11px] uppercase tracking-wider">
          {date}
        </p>
      </div>

      <h1 className="text-ll-white text-[28px] leading-none mb-6 uppercase">
        {dayLabel}
      </h1>

      <SessionDetail session={session} />
    </div>
  )
}

export default HistoryDetailPage
