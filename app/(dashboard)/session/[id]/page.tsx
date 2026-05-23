import { notFound } from 'next/navigation'
import { getSessionById } from '@/app/actions/sessions.actions'
import { ActiveSession } from '@/components'

type SessionPageProps = {
  params: Promise<{ id: string }>
}

const SessionPage = async ({ params }: SessionPageProps) => {
  const { id } = await params
  const session = await getSessionById(id)

  if (!session) notFound()

  if (session.status === 'completed') {
    return (
      <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24 flex flex-col items-center justify-center gap-3">
        <p className="text-ll-orange text-[11px] uppercase tracking-wider">
          Sesión completada
        </p>
        <h1 className="text-ll-white text-[28px]">Ya terminaste esta sesión</h1>
        <a
          href="/week"
          className="bg-ll-black-600 hover:bg-ll-black-orange text-ll-white text-[13px] rounded-[8px] px-4 py-2.5 transition-colors"
        >
          Volver a la semana
        </a>
      </div>
    )
  }

  return <ActiveSession session={session} />
}

export default SessionPage
