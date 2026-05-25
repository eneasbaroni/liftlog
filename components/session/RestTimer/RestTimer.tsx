'use client'

import { useState, useRef } from 'react'
import { RestTimerProps } from './types'

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const PRESETS = [60, 90, 120, 180]
const circumference = 2 * Math.PI * 40

export const RestTimer = ({
  isRunning,
  secondsLeft,
  initialSeconds = 120,
  onStart,
  onSkip,
}: RestTimerProps) => {
  const [duration, setDuration] = useState(initialSeconds)
  const totalRef = useRef(duration)

  const handleStart = () => {
    totalRef.current = duration
    onStart(duration)
  }

  const progress = isRunning
    ? Math.max(0, Math.min(1, secondsLeft / totalRef.current))
    : 1

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-ll-black-300 text-[11px] uppercase tracking-wider">
        {isRunning ? 'Descansando' : 'Tiempo de descanso'}
      </p>

      {/* Circular display */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="#2C2A26"
            strokeWidth="4"
          />
          {isRunning && (
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
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-ll-white text-[28px]">
            {formatTime(isRunning ? secondsLeft : duration)}
          </span>
        </div>
      </div>

      {!isRunning ? (
        <>
          {/* +/- fino */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setDuration((d) => Math.max(10, d - 10))}
              className="text-ll-black-300 hover:text-ll-white text-[22px] w-8 transition-colors"
            >
              −
            </button>
            <span className="text-ll-white text-[15px] w-14 text-center tabular-nums">
              {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={() => setDuration((d) => d + 10)}
              className="text-ll-black-300 hover:text-ll-white text-[22px] w-8 transition-colors"
            >
              +
            </button>
          </div>

          {/* Presets */}
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDuration(p)}
                className={[
                  'px-3 py-1.5 rounded-[8px] text-[11px] transition-colors',
                  duration === p
                    ? 'bg-ll-orange text-ll-white'
                    : 'bg-ll-black-600 text-ll-black-300 hover:text-ll-white',
                ].join(' ')}
              >
                {p}s
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="bg-ll-orange text-ll-white text-xs rounded-[8px] px-8 py-2.5 hover:opacity-80 transition-opacity"
          >
            Iniciar descanso
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onSkip}
          className="bg-ll-black-600 hover:bg-ll-black-orange text-ll-white text-xs rounded-[8px] px-5 py-2.5 transition-colors"
        >
          Saltar descanso
        </button>
      )}
    </div>
  )
}
