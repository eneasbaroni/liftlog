'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type UseRestTimerReturn = {
  secondsLeft: number
  isRunning: boolean
  start: (seconds: number, onComplete?: () => void) => void
  stop: () => void
}

export const useRestTimer = (): UseRestTimerReturn => {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef<(() => void) | undefined>(undefined)
  const endTimeRef = useRef<number>(0) // timestamp when timer should end

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setSecondsLeft(0)
  }, [])

  const start = useCallback(
    (seconds: number, onComplete?: () => void) => {
      stop()
      onCompleteRef.current = onComplete
      endTimeRef.current = Date.now() + seconds * 1000 // store end timestamp
      setSecondsLeft(seconds)
      setIsRunning(true)
    },
    [stop]
  )

  useEffect(() => {
    if (!isRunning) return

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((endTimeRef.current - Date.now()) / 1000)
      )
      setSecondsLeft(remaining)

      if (remaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsRunning(false)
        onCompleteRef.current?.()
      }
    }

    intervalRef.current = setInterval(tick, 500) // check every 500ms for accuracy

    // Also recalculate when app comes back to foreground
    const handleVisibilityChange = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning])

  return { secondsLeft, isRunning, start, stop }
}
