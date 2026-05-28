self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay } = event.data

    // Schedule notification after delay (in ms)
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'rest-timer', // replaces previous notification of same tag
        renotify: true,
        data: { url: '/session' },
      })
    }, delay)
  }

  if (event.data?.type === 'CANCEL_NOTIFICATION') {
    self.registration
      .getNotifications({ tag: 'rest-timer' })
      .then((notifications) => {
        notifications.forEach((n) => n.close())
      })
  }
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
