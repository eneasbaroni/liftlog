import { SessionSummaryProps } from './types'

export const SessionSummary = ({ session, onClose }: SessionSummaryProps) => {
  const totalSets = session.exercises.reduce((acc, e) => acc + e.sets.length, 0)

  const totalVolume = session.exercises.reduce(
    (acc, e) =>
      acc + e.sets.reduce((sAcc, s) => sAcc + s.weight * s.repsCompleted, 0),
    0
  )

  const maxWeights = session.exercises.map((e) => ({
    name: e.name,
    maxWeight: e.sets.length > 0 ? Math.max(...e.sets.map((s) => s.weight)) : 0,
    sets: e.sets.length,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-4">
        <p className="text-ll-orange text-[11px] uppercase tracking-wider mb-2">
          Sesión completada
        </p>
        <h2 className="text-ll-white text-[40px] leading-none">
          {session.durationMin ?? 0}
          <span className="text-ll-black-300 text-[16px] ml-1">min</span>
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-[3px]">
        <div className="bg-ll-black-600 rounded-[10px] p-4">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
            Volumen total
          </p>
          <p className="text-ll-white text-[22px] leading-none">
            {(totalVolume / 1000).toFixed(1)}
            <span className="text-ll-black-300 text-[11px] ml-0.5">t</span>
          </p>
        </div>
        <div className="bg-ll-black-600 rounded-[10px] p-4">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
            Series totales
          </p>
          <p className="text-ll-white text-[22px] leading-none">{totalSets}</p>
        </div>
      </div>

      {/* Exercise breakdown */}
      <div className="flex flex-col gap-[3px]">
        {maxWeights.map((ex) => (
          <div
            key={ex.name}
            className="bg-ll-black-600 rounded-[10px] px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="text-ll-white text-sm">{ex.name}</p>
              <p className="text-ll-black-300 text-[11px] mt-0.5">
                {ex.sets} series
              </p>
            </div>
            <p className="text-ll-orange text-[16px]">
              {ex.maxWeight}
              <span className="text-ll-black-300 text-[10px] ml-0.5">kg</span>
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full bg-ll-orange text-ll-white rounded-[10px] py-4 text-[14px] font-medium hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </button>
    </div>
  )
}
