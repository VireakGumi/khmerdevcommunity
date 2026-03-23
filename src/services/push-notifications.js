import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { PushNotifications } from '@capacitor/push-notifications'
import { initializeApp, getApps } from 'firebase/app'
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { api } from 'boot/axios'

let initialized = false
let foregroundBound = false
let nativeListenersBound = false
let webToken = null
let nativeToken = null
let foregroundUnsubscribe = null
let routeHandler = null
let foregroundHandler = null

const firebaseConfig = {
  apiKey: process.env.FIREBASE_WEB_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    process.env.FIREBASE_WEB_VAPID_KEY
  )
}

function resolveDeviceLabel() {
  if (typeof navigator === 'undefined') {
    return null
  }

  return `${navigator.platform || 'device'} | ${navigator.userAgent || 'unknown'}`
}

async function saveSubscription(token, platform, metadata = {}) {
  await api.post('/me/push-subscriptions', {
    provider: 'fcm',
    platform,
    token,
    device_label: resolveDeviceLabel(),
    metadata,
  })
}

async function removeSubscription(token) {
  if (!token) {
    return
  }

  try {
    await api.delete('/me/push-subscriptions', {
      data: { token },
    })
  } catch {
    // ignore cleanup failures
  }
}

function getFirebaseApp() {
  return getApps()[0] || initializeApp(firebaseConfig)
}

function handleActionUrl(actionUrl) {
  if (!actionUrl || !routeHandler) {
    return
  }

  routeHandler(actionUrl)
}

async function registerWebPush() {
  if (!hasFirebaseConfig() || typeof window === 'undefined') {
    return { enabled: false, reason: 'missing_config' }
  }

  if (!('Notification' in window) || !('serviceWorker' in navigator) || !(await isSupported())) {
    return { enabled: false, reason: 'unsupported' }
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : (Notification.permission === 'denied' ? 'denied' : await Notification.requestPermission())

  if (permission !== 'granted') {
    return { enabled: false, reason: 'permission_denied' }
  }

  const configParam = btoa(JSON.stringify(firebaseConfig))
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?config=${encodeURIComponent(configParam)}`)
  const messaging = getMessaging(getFirebaseApp())
  const token = await getToken(messaging, {
    vapidKey: process.env.FIREBASE_WEB_VAPID_KEY,
    serviceWorkerRegistration: registration,
  })

  if (!token) {
    return { enabled: false, reason: 'no_token' }
  }

  webToken = token
  await saveSubscription(token, 'web', { permission })

  if (!foregroundBound) {
    foregroundUnsubscribe = onMessage(messaging, (payload) => {
      foregroundHandler?.(payload)
    })
    foregroundBound = true
  }

  return { enabled: true, platform: 'web' }
}

async function registerNativePush() {
  const permission = await PushNotifications.requestPermissions()

  if (permission.receive !== 'granted') {
    return { enabled: false, reason: 'permission_denied' }
  }

  if (!nativeListenersBound) {
    PushNotifications.addListener('registration', async (token) => {
      nativeToken = token.value
      await saveSubscription(token.value, Capacitor.getPlatform(), { source: 'capacitor' })
    })

    PushNotifications.addListener('registrationError', () => {})

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      foregroundHandler?.(notification)
    })

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      const actionUrl =
        notification.notification?.data?.action_url ||
        notification.notification?.data?.link ||
        '/notifications'

      handleActionUrl(actionUrl)
    })

    CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      handleActionUrl(url)
    })

    nativeListenersBound = true
  }

  await PushNotifications.register()

  return { enabled: true, platform: Capacitor.getPlatform() }
}

export async function initializePushNotifications({ onForegroundNotification, onOpenRoute } = {}) {
  foregroundHandler = onForegroundNotification || null
  routeHandler = onOpenRoute || null

  if (initialized) {
    return { enabled: true }
  }

  const result = Capacitor.isNativePlatform()
    ? await registerNativePush()
    : await registerWebPush()

  initialized = Boolean(result?.enabled)

  return result
}

export async function unregisterPushNotifications() {
  try {
    if (webToken && hasFirebaseConfig() && typeof window !== 'undefined' && await isSupported()) {
      const messaging = getMessaging(getFirebaseApp())
      await deleteToken(messaging)
    }
  } catch {
    // ignore web token teardown failures
  }

  await removeSubscription(webToken)
  await removeSubscription(nativeToken)

  webToken = null
  nativeToken = null
  initialized = false

  if (foregroundUnsubscribe) {
    foregroundUnsubscribe()
    foregroundUnsubscribe = null
  }

  foregroundBound = false
}
