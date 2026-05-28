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

// Push from server (background / app closed)
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = {}
  }

  event.waitUntil(showRestTimerNotification(data))
})

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
