'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type UseNotificationReturn = {
  isSubscribed: boolean
  isSupported: boolean
  subscribe: () => Promise<void>
  scheduleNotification: (delaySeconds: number) => void
  cancelNotification: () => void
}

const urlBase64ToUint8Array = (
  base64String: string
): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const useNotification = (): UseNotificationReturn => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)

      // Check if already subscribed
      navigator.serviceWorker.ready.then(async (registration) => {
        const existing = await registration.pushManager.getSubscription()
        setIsSubscribed(!!existing)
      })
    }
  }, [])

  // Must be called from a user gesture (button click)
  const subscribe = useCallback(async () => {
    if (!isSupported) return

    try {
      const registration = await navigator.serviceWorker.ready

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      // Serialize and save to server
      const serialized = JSON.parse(JSON.stringify(sub))
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serialized),
      })

      if (res.ok) setIsSubscribed(true)
    } catch (err) {
      console.error('Push subscribe failed:', err)
    }
  }, [isSupported])

  const scheduleNotification = useCallback(
    (delaySeconds: number) => {
      if (!isSubscribed) return
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(async () => {
        try {
          await fetch('/api/push/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Liftlog — ¡A entrenar!',
              body: 'El descanso terminó. Es hora de la siguiente serie.',
            }),
          })
        } catch (err) {
          console.warn('Failed to send push notification:', err)
        }
      }, delaySeconds * 1000)
    },
    [isSubscribed]
  )

  const cancelNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return {
    isSubscribed,
    isSupported,
    subscribe,
    scheduleNotification,
    cancelNotification,
  }
}
