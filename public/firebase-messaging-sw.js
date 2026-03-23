/* eslint-disable no-undef */

const params = new URL(self.location.href).searchParams
const rawConfig = params.get('config')

if (rawConfig) {
  try {
    const firebaseConfig = JSON.parse(atob(rawConfig))

    importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js')
    importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js')

    firebase.initializeApp(firebaseConfig)

    const messaging = firebase.messaging()

    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'Khmer Dev Community'
      const body = payload.notification?.body || payload.data?.body || ''
      const actionUrl = payload?.fcmOptions?.link || payload?.data?.action_url || '/#/notifications'

      self.registration.showNotification(title, {
        body,
        icon: payload.notification?.icon || '/icons/icon-192x192.png',
        badge: payload.notification?.badge || '/icons/icon-128x128.png',
        data: {
          action_url: actionUrl,
        },
      })
    })
  } catch (error) {
    console.error('Failed to initialize firebase messaging service worker', error)
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = event.notification.data?.action_url || '/#/notifications'

  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const absoluteTarget = target.startsWith('http') ? target : `${self.location.origin}${target}`
    const existing = clients.find((client) => client.url === absoluteTarget)

    if (existing) {
      return existing.focus()
    }

    return self.clients.openWindow(absoluteTarget)
  }))
})
