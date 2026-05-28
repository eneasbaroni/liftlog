'use client'

import { useEffect } from 'react'

export const ServiceWorkerRegistrar = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
        return registration.update()
      })
      .catch((err) => console.error('SW registration failed:', err))
  }, [])

  return null
}
