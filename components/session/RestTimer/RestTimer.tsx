'use client'

import { RestTimerProps } from './types'

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const RestTimer = ({ seconds, onSkip }: RestTimerProps) => {
  const progress = Math.max(0, Math.min(1, seconds / 90)) // assumes 90s default rest
  const circumference = 2 * Math.PI * 40

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-ll-black-300 text-[11px] uppercase tracking-wider">
        Descansando
      </p>

      {/* Circular progress */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          {/* Track */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="#2C2A26"
            strokeWidth="4"
          />
          {/* Progress */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="#E05C1A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-ll-white text-[28px]">
            {formatTime(seconds)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="bg-ll-black-600 hover:bg-ll-black-orange text-ll-white text-[12px] rounded-[8px] px-5 py-2.5 transition-colors"
      >
        Saltar descanso
      </button>
    </div>
  )
}
