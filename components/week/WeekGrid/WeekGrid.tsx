'use client'

import { useState } from 'react'
import { WEEK_DAYS } from '@/lib/constants'
import { WEEK_DAY_SHORT_LABELS } from '@/lib/constants'
import { DayColumn } from '../DayColumn/DayColumn'
import { WeekGridProps } from './types'
import { WeekDay } from '@/lib/constants'

export const WeekGrid = ({
  routine,
  exerciseNames,
  todayKey,
}: WeekGridProps) => {
  const [activeDay, setActiveDay] = useState<WeekDay>(
    (todayKey as WeekDay) ?? 'monday'
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Day picker — horizontal pill strip */}
      <div className="grid grid-cols-7 gap-[3px]">
        {WEEK_DAYS.map((day) => {
          const exercises = routine.days[day] ?? []
          const hasExercises = exercises.length > 0
          const isActive = day === activeDay

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={[
                'flex flex-col items-center py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-ll-orange'
                  : 'bg-ll-black-600 hover:bg-ll-black-orange',
              ].join(' ')}
            >
              <span
                className={[
                  'text-[9px] uppercase tracking-wider',
                  isActive ? 'text-ll-white' : 'text-ll-black-300',
                ].join(' ')}
              >
                {WEEK_DAY_SHORT_LABELS[day]}
              </span>
              <span
                className={[
                  'w-1 h-1 rounded-full mt-1',
                  hasExercises
                    ? isActive
                      ? 'bg-ll-white opacity-70'
                      : 'bg-ll-orange'
                    : 'bg-transparent',
                ].join(' ')}
              />
            </button>
          )
        })}
      </div>

      {/* Active day exercises */}
      <DayColumn
        day={activeDay}
        exercises={(routine.days[activeDay] ?? []).map((ex) => ({
          ...ex,
          name: exerciseNames[ex.exerciseId] ?? ex.exerciseId,
        }))}
        isToday={activeDay === todayKey}
        isActive
        routineId={routine._id}
        onDayClick={setActiveDay}
      />
    </div>
  )
}
