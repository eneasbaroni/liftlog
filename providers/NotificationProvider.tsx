'use client'

import {
  REST_TIMER_BODY,
  REST_TIMER_ICON,
  REST_TIMER_TITLE,
  REST_TIMER_URL,
} from '@/lib/push/rest-timer-message'
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
  sendRestTimerNotification: () => void
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

const getPushSubscription = async (): Promise<PushSubscription | null> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null
  }
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const scheduleIdRef = useRef<string | null>(null)
  const notifyInFlightRef = useRef(false)

  const syncSubscriptionToServer = useCallback(
    async (subscription: PushSubscription) => {
      const serialized = JSON.parse(JSON.stringify(subscription))
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serialized),
      })
      return res.ok
    },
    []
  )

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    setIsSupported(true)

    getPushSubscription().then(async (existing) => {
      if (!existing) return
      const synced = await syncSubscriptionToServer(existing)
      if (synced) setIsSubscribed(true)
    })
  }, [syncSubscriptionToServer])

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

      const synced = await syncSubscriptionToServer(sub)
      if (synced) setIsSubscribed(true)
    } catch (err) {
      console.error('Push subscribe failed:', err)
    }
  }, [isSupported, syncSubscriptionToServer])

  const showLocalNotification = useCallback(async () => {
    if (Notification.permission !== 'granted') return

    const registration = await navigator.serviceWorker.ready

    const message = {
      type: 'REST_TIMER_DONE',
      title: REST_TIMER_TITLE,
      body: REST_TIMER_BODY,
      url: REST_TIMER_URL,
    }

    if (registration.active) {
      registration.active.postMessage(message)
      return
    }

    await registration.showNotification(REST_TIMER_TITLE, {
      body: REST_TIMER_BODY,
      icon: REST_TIMER_ICON,
      tag: 'rest-timer',
      data: { url: REST_TIMER_URL },
    })
  }, [])

  const cancelNotification = useCallback(() => {
    const scheduleId = scheduleIdRef.current
    scheduleIdRef.current = null

    if (!scheduleId) return

    fetch('/api/push/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId }),
      keepalive: true,
    }).catch((err) => {
      console.warn('Failed to cancel scheduled notification:', err)
    })
  }, [])

  const sendRestTimerNotification = useCallback(() => {
    if (notifyInFlightRef.current) return
    notifyInFlightRef.current = true

    void (async () => {
      try {
        cancelNotification()
        await showLocalNotification()

        // Backup server push when the tab was in the background (scheduled push may have failed)
        if (!document.hidden) return

        const sub = await getPushSubscription()
        if (!sub) return

        await fetch('/api/push/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: REST_TIMER_TITLE,
            body: REST_TIMER_BODY,
          }),
          keepalive: true,
        })
      } catch (err) {
        console.warn('Failed to send rest timer notification:', err)
      } finally {
        notifyInFlightRef.current = false
      }
    })()
  }, [showLocalNotification, cancelNotification])

  const scheduleNotification = useCallback(
    (delaySeconds: number) => {
      void (async () => {
        const sub = await getPushSubscription()
        if (!sub) return

        cancelNotification()

        const endsAt = Date.now() + delaySeconds * 1000

        try {
          const res = await fetch('/api/push/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endsAt,
              title: REST_TIMER_TITLE,
              body: REST_TIMER_BODY,
            }),
            keepalive: true,
          })

          if (!res.ok) {
            console.warn(
              'Failed to schedule push notification:',
              await res.text()
            )
            return
          }

          const data = (await res.json()) as { scheduleId?: string }
          if (data.scheduleId) scheduleIdRef.current = data.scheduleId
        } catch (err) {
          console.warn('Failed to schedule push notification:', err)
        }
      })()
    },
    [cancelNotification]
  )

  return (
    <NotificationContext.Provider
      value={{
        isSubscribed,
        isSupported,
        subscribe,
        scheduleNotification,
        cancelNotification,
        sendRestTimerNotification,
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
