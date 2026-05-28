'use client'

import { useCallback, useEffect, useRef } from 'react'

type UseNotificationReturn = {
  scheduleNotification: (delaySeconds: number) => void
  cancelNotification: () => void
}

export const useNotification = (): UseNotificationReturn => {
  const swRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return

    // Get existing SW registration
    navigator.serviceWorker.ready.then((registration) => {
      swRef.current = registration
    })
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [])

  const scheduleNotification = useCallback(
    async (delaySeconds: number) => {
      const granted = await requestPermission()
      if (!granted || !swRef.current) return

      swRef.current.active?.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title: 'Liftlog — ¡A entrenar!',
        body: 'El descanso terminó. Es hora de la siguiente serie.',
        delay: delaySeconds * 1000,
      })
    },
    [requestPermission]
  )

  const cancelNotification = useCallback(() => {
    swRef.current?.active?.postMessage({ type: 'CANCEL_NOTIFICATION' })
  }, [])

  return { scheduleNotification, cancelNotification }
}
