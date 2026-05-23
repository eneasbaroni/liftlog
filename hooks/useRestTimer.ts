'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type UseRestTimerReturn = {
  secondsLeft: number
  isRunning: boolean
  start: (seconds: number) => void
  stop: () => void
}

export const useRestTimer = (): UseRestTimerReturn => {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setSecondsLeft(0)
  }, [])

  const start = useCallback(
    (seconds: number) => {
      stop()
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
