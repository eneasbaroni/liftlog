import Link from 'next/link'
import {
  getRoutines,
  setActiveRoutine,
  deleteRoutine,
} from '@/app/actions/routines.actions'
import { RoutineCard } from '@/components'

const RoutinesPage = async () => {
  const routines = await getRoutines()

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-ll-white text-[28px] leading-none">RUTINAS</h1>
        </div>
        <Link
          href="/routines/new"
          className="bg-ll-orange font-anton uppercase text-ll-white text-xs rounded-lg px-3 py-2 transition-opacity hover:opacity-90"
        >
          Nueva
        </Link>
      </div>

      {routines.length === 0 ? (
        <div className="bg-ll-black-600 rounded-[10px] p-6 text-center">
          <p className="text-ll-black-200 text-sm">
            No tenés rutinas creadas todavía.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[3px]">
          {routines.map((routine) => (
            <RoutineCard
              key={routine._id}
              routine={routine}
              onSetActive={setActiveRoutine}
              onDelete={deleteRoutine}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RoutinesPage
