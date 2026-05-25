'use client'

import { useRouter } from 'next/navigation'
import { useActiveSession } from '@/hooks/useActiveSession'
import { useRestTimer } from '@/hooks/useRestTimer'
import { ExerciseSetRow } from '../ExerciseSetRow/ExerciseSetRow'
import { RestTimer } from '../RestTimer/RestTimer'
import { SessionSummary } from '../SessionSummary/SessionSummary'
import { ActiveSessionProps } from './types'

export const ActiveSession = ({
  session: initialSession,
}: ActiveSessionProps) => {
  const router = useRouter()
  const timer = useRestTimer()

  const {
    session,
    activeExerciseIndex,
    activeSetIndex,
    isResting,
    isCompleted,
    isLogging,
    activeExercise,
    handleLogSet,
    handleSkipRest,
    handleComplete,
    goToExercise,
  } = useActiveSession(initialSession)

  const handleSetComplete = async (
    weight: number,
    reps: number,
    rir: number
  ) => {
    await handleLogSet(weight, reps, rir)
    timer.start(90) // default 90s rest
  }

  const handleSkip = () => {
    timer.stop()
    handleSkipRest()
  }

  if (isCompleted) {
    return (
      <div className="px-4 pt-6 pb-24">
        <SessionSummary
          session={session}
          onClose={() => router.push('/week')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ll-black-900 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/week')}
          className="text-ll-black-300 hover:text-ll-white transition-colors text-[20px] leading-none"
        >
          ←
        </button>
        <p className="text-ll-black-300 text-[11px] uppercase tracking-wider">
          {activeExerciseIndex + 1} / {session.exercises.length}
        </p>
        <button
          type="button"
          onClick={() => handleComplete()}
          className="text-ll-orange text-xs hover:opacity-80 transition-opacity"
        >
          Terminar
        </button>
      </div>

      {/* Exercise tabs */}
      <div className="flex gap-[3px] px-4 mb-4 overflow-x-auto scrollbar-none">
        {session.exercises.map((ex, i) => {
          const isActive = i === activeExerciseIndex
          return (
            <button
              key={ex.exerciseId}
              type="button"
              onClick={() => goToExercise(i)}
              className={[
                'shrink-0 px-3 py-1.5 rounded-[8px] text-[11px] transition-colors',
                isActive
                  ? 'bg-ll-orange text-ll-white'
                  : 'bg-ll-black-600 text-ll-black-300 hover:bg-ll-black-orange hover:text-ll-white',
              ].join(' ')}
            >
              {ex.name}
            </button>
          )
        })}
      </div>

      {/* Active exercise */}
      {activeExercise && (
        <div className="flex-1 px-4 flex flex-col gap-4">
          {/* Exercise name + sets done */}
          <div className="bg-ll-black-600 rounded-[10px] p-4">
            <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
              Ejercicio principal
            </p>
            <h2 className="text-ll-white text-[22px] leading-none mb-3">
              {activeExercise.name}
            </h2>
            <div className="flex gap-1.5">
              {Array.from({ length: activeExercise.targetSets }).map((_, i) => (
                <div
                  key={i}
                  className={[
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i < activeExercise.sets.length
                      ? 'bg-ll-orange'
                      : i === activeExercise.sets.length
                        ? 'bg-ll-black-300'
                        : 'bg-ll-black-900',
                  ].join(' ')}
                />
              ))}
            </div>
            <p className="text-ll-black-300 text-[11px] mt-2">
              Serie {activeSetIndex + 1} de {activeExercise.targetSets}
            </p>
          </div>

          {/* Rest timer or set input */}
          {isResting && timer.isRunning ? (
            <div className="bg-ll-black-600 rounded-[10px]">
              <RestTimer seconds={timer.secondsLeft} onSkip={handleSkip} />
            </div>
          ) : (
            <ExerciseSetRow
              setNumber={activeSetIndex + 1}
              defaultWeight={
                activeExercise.sets.length > 0
                  ? activeExercise.sets[activeExercise.sets.length - 1].weight
                  : 0
              }
              defaultReps={10}
              onComplete={handleSetComplete}
              isLogging={isLogging}
            />
          )}
        </div>
      )}
    </div>
  )
}
