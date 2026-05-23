'use client'

import { useState } from 'react'
import { ExerciseSetRowProps } from './types'

const inputClass =
  'w-full bg-ll-black-900 text-ll-white text-center text-[18px] rounded-[8px] py-3 border border-transparent focus:border-ll-orange focus:outline-none transition-colors'

export const ExerciseSetRow = ({
  setNumber,
  defaultWeight,
  defaultReps,
  onComplete,
  isLogging,
}: ExerciseSetRowProps) => {
  const [weight, setWeight] = useState(defaultWeight)
  const [reps, setReps] = useState(defaultReps)
  const [rir, setRir] = useState(2)

  const handleComplete = () => {
    onComplete(weight, reps, rir)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ll-black-300 text-[11px] uppercase tracking-wider text-center">
        Serie {setNumber}
      </p>

      {/* Weight / Reps / RIR inputs */}
      <div className="grid grid-cols-3 gap-[3px]">
        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider text-center mb-2">
            Peso (kg)
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
              className="text-ll-black-300 hover:text-ll-white text-[18px] w-7 shrink-0 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setWeight((w) => w + 2.5)}
              className="text-ll-black-300 hover:text-ll-white text-[18px] w-7 shrink-0 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider text-center mb-2">
            Reps
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setReps((r) => Math.max(1, r - 1))}
              className="text-ll-black-300 hover:text-ll-white text-[18px] w-7 shrink-0 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setReps((r) => r + 1)}
              className="text-ll-black-300 hover:text-ll-white text-[18px] w-7 shrink-0 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-ll-black-600 rounded-[10px] p-3">
          <p className="text-ll-black-300 text-[9px] uppercase tracking-wider text-center mb-2">
            RIR
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setRir((r) => Math.max(0, r - 1))}
              className="text-ll-black-300 hover:text-ll-white text-[18px] w-7 shrink-0 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              max={10}
              value={rir}
              onChange={(e) => setRir(Number(e.target.value))}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setRir((r) => Math.min(10, r + 1))}
              className="text-ll-black-300 hover:text-ll-white text-[18px] w-7 shrink-0 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Complete set button */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={isLogging}
        className="w-full bg-ll-orange text-ll-white rounded-[10px] py-4 text-[14px] font-medium transition-opacity disabled:opacity-50"
      >
        {isLogging ? 'Guardando...' : 'Serie completada'}
      </button>
    </div>
  )
}
