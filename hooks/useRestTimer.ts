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
      setSecondsLeft(seconds)
      setIsRunning(true)
    },
    [stop]
  )

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  return { secondsLeft, isRunning, start, stop }
}
