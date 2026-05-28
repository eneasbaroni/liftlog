'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type NotificationContextValue = {
  isSubscribed: boolean
  isSupported: boolean
  subscribe: () => Promise<void>
  scheduleNotification: (delaySeconds: number) => void
  cancelNotification: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

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

const REST_TIMER_TITLE = 'Liftlog — ¡A entrenar!'
const REST_TIMER_BODY = 'El descanso terminó. Es hora de la siguiente serie.'

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const scheduleIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    setIsSupported(true)

    navigator.serviceWorker.ready.then(async (registration) => {
      const existing = await registration.pushManager.getSubscription()
      if (!existing) return

      setIsSubscribed(true)

      // Re-sync in case the subscription exists in the browser but not in DB
      const serialized = JSON.parse(JSON.stringify(existing))
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serialized),
      }).catch(() => {})
    })
  }, [])

  const subscribe = useCallback(async () => {
    if (!isSupported) return

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      console.error('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const registration = await navigator.serviceWorker.ready

      let sub = await registration.pushManager.getSubscription()
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
      }

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

  const cancelNotification = useCallback(() => {
    const scheduleId = scheduleIdRef.current
    scheduleIdRef.current = null

    if (!scheduleId) return

    fetch('/api/push/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId }),
    }).catch((err) => {
      console.warn('Failed to cancel scheduled notification:', err)
    })
  }, [])

  const scheduleNotification = useCallback(
    (delaySeconds: number) => {
      if (!isSubscribed) return

      cancelNotification()

      const endsAt = Date.now() + delaySeconds * 1000

      fetch('/api/push/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endsAt,
          title: REST_TIMER_TITLE,
          body: REST_TIMER_BODY,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            console.warn(
              'Failed to schedule push notification:',
              await res.text()
            )
            return
          }
          const data = (await res.json()) as { scheduleId?: string }
          if (data.scheduleId) scheduleIdRef.current = data.scheduleId
        })
        .catch((err) => {
          console.warn('Failed to schedule push notification:', err)
        })
    },
    [isSubscribed, cancelNotification]
  )

  return (
    <NotificationContext.Provider
      value={{
        isSubscribed,
        isSupported,
        subscribe,
        scheduleNotification,
        cancelNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return ctx
}
