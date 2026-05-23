'use client'

import { useState, useCallback } from 'react'
import { logSet, completeSession } from '@/app/actions/sessions.actions'
import { SessionDTO, SessionExerciseDTO } from '@/lib/types'

type UseActiveSessionReturn = {
  session: SessionDTO
  activeExerciseIndex: number
  activeSetIndex: number
  isResting: boolean
  isCompleted: boolean
  isLogging: boolean
  activeExercise: SessionExerciseDTO | null
  handleLogSet: (weight: number, reps: number, rir: number) => Promise<void>
  handleSkipRest: () => void
  handleComplete: (notes?: string) => Promise<void>
  goToExercise: (index: number) => void
}

export const useActiveSession = (
  initialSession: SessionDTO
): UseActiveSessionReturn => {
  const [session, setSession] = useState<SessionDTO>(initialSession)
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0)
  const [activeSetIndex, setActiveSetIndex] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLogging, setIsLogging] = useState(false)

  const activeExercise = session.exercises[activeExerciseIndex] ?? null

  const handleLogSet = useCallback(
    async (weight: number, reps: number, rir: number) => {
      if (!activeExercise) return

      setIsLogging(true)

      const result = await logSet(session._id, activeExercise.exerciseId, {
        setNumber: activeSetIndex + 1,
        repsCompleted: reps,
        weight,
        rir,
      })

      if (result.success) {
        // Optimistically update local session state
        setSession((prev) => ({
          ...prev,
          exercises: prev.exercises.map((ex, i) =>
            i === activeExerciseIndex
              ? {
                  ...ex,
                  sets: [
                    ...ex.sets,
                    {
                      setNumber: activeSetIndex + 1,
                      repsCompleted: reps,
                      weight,
                      rir,
                      completedAt: new Date().toISOString(),
                    },
                  ],
                }
              : ex
          ),
        }))

        const expectedSets = 4 // fallback; ideally passed from routine

        if (activeSetIndex + 1 >= expectedSets) {
          // Move to next exercise
          const nextExerciseIndex = activeExerciseIndex + 1
          if (nextExerciseIndex < session.exercises.length) {
            setActiveExerciseIndex(nextExerciseIndex)
            setActiveSetIndex(0)
          }
        } else {
          setActiveSetIndex((prev) => prev + 1)
        }

        setIsResting(true)
      }

      setIsLogging(false)
    },
    [session._id, activeExercise, activeExerciseIndex, activeSetIndex]
  )

  const handleSkipRest = useCallback(() => {
    setIsResting(false)
  }, [])

  const handleComplete = useCallback(
    async (notes?: string) => {
      const result = await completeSession(session._id, notes)
      if (result.success) {
        setIsCompleted(true)
        setSession(result.data)
      }
    },
    [session._id]
  )

  const goToExercise = useCallback((index: number) => {
    setActiveExerciseIndex(index)
    setActiveSetIndex(0)
    setIsResting(false)
  }, [])

  return {
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
  }
}
