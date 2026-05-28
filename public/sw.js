/* eslint-env serviceworker */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

const showRestTimerNotification = (data) => {
  const title = data?.title || 'Liftlog — ¡A entrenar!'
  const body =
    data?.body || 'El descanso terminó. Es hora de la siguiente serie.'

  return self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'rest-timer',
    renotify: true,
    data: { url: data?.url ?? '/week' },
  })
}

// Local notification from the app (works while SW is alive, e.g. foreground)
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'REST_TIMER_DONE') return

  event.waitUntil(showRestTimerNotification(event.data))
})

// Handle push from server (works in background / app closed)
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = {}
  }

  event.waitUntil(showRestTimerNotification(data))
})

// Open app when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus()
      } else {
        self.clients.openWindow(event.notification.data?.url ?? '/')
      }
    })
  )
})
