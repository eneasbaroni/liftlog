'use client'

import { useCallback, useEffect, useRef } from 'react'

type UseNotificationReturn = {
  scheduleNotification: (delaySeconds: number) => void
  cancelNotification: () => void
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

const urlBase64ToUint8Array = (
  base64String: string
): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
}

export const useNotification = (): UseNotificationReturn => {
  const swRef = useRef<ServiceWorkerRegistration | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return

    const registerAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        swRef.current = registration

        if (Notification.permission !== 'granted') return

        // Check if already subscribed
        const existing = await registration.pushManager.getSubscription()
        if (existing) return

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })

        // Save subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      } catch (err) {
        console.warn('Push subscription failed:', err)
      }
    }

    registerAndSubscribe()
  }, [])

  const scheduleNotification = useCallback((delaySeconds: number) => {
    if (!('Notification' in window) || Notification.permission !== 'granted')
      return

    // Cancel any pending notification
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // Schedule server push after delay
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
  }, [])

  const cancelNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return { scheduleNotification, cancelNotification }
}
