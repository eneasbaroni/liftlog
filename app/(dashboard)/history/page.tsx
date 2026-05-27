import { getSessions } from '@/app/actions/sessions.actions'
import { SessionCard } from '@/components'

const HistoryPage = async () => {
  const sessions = await getSessions(50)

  const inProgress = sessions.filter((s) => s.status === 'in_progress')
  const completed = sessions.filter((s) => s.status === 'completed')

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      <h1 className="text-ll-white text-[28px] mb-6">HISTORIAL</h1>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <p className="text-ll-black-300 text-sm text-center">
            Todavía no completaste ninguna sesión.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* In progress */}
          {inProgress.length > 0 && (
            <div className="flex flex-col gap-[3px]">
              <p className="text-ll-black-300 text-sm uppercase tracking-wider px-1 mb-1">
                En curso
              </p>
              {inProgress.map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="flex flex-col gap-[3px]">
              {inProgress.length > 0 && (
                <p className="text-ll-black-300 text-sm uppercase tracking-wider px-1 mb-1">
                  Completadas
                </p>
              )}
              {completed.map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryPage
