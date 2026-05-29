'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNotification } from '@/providers/NotificationProvider'

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
  const endTimeRef = useRef<number>(0)

  const {
    scheduleNotification,
    cancelNotification,
    sendRestTimerNotification,
  } = useNotification()

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    cancelNotification()
    setIsRunning(false)
    setSecondsLeft(0)
  }, [cancelNotification])

  const start = useCallback(
    (seconds: number, onComplete?: () => void) => {
      stop()
      onCompleteRef.current = onComplete
      endTimeRef.current = Date.now() + seconds * 1000
      setSecondsLeft(seconds)
      setIsRunning(true)
      scheduleNotification(seconds)
    },
    [stop, scheduleNotification]
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
        sendRestTimerNotification()
        onCompleteRef.current?.()
      }
    }

    intervalRef.current = setInterval(tick, 500)

    const handleVisibilityChange = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning, sendRestTimerNotification])

  return { secondsLeft, isRunning, start, stop }
}
