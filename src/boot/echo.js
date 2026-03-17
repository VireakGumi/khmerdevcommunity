import { defineBoot } from '#q-app/wrappers'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echoInstance = null
let echoToken = null
let connectionDebugBound = false

function resolveTransportConfig() {
  const envScheme = process.env.REVERB_SCHEME || 'http'
  const forceTLS = envScheme === 'https'
  const fallbackHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  return {
    key: process.env.REVERB_APP_KEY,
    wsHost: process.env.REVERB_PUBLIC_HOST || process.env.REVERB_HOST || fallbackHost,
    wsPort: Number(process.env.REVERB_PORT || 8080),
    forceTLS,
    enabledTransports: [forceTLS ? 'wss' : 'ws'],
    authEndpoint: process.env.BROADCAST_AUTH_URL,
  }
}

function bindConnectionDebugging(echo) {
  if (connectionDebugBound) {
    return
  }

  const connection = echo.connector?.pusher?.connection

  if (!connection) {
    return
  }

  connection.bind('connected', () => {
    console.info('[echo] realtime connected')
  })

  connection.bind('error', (error) => {
    console.warn('[echo] realtime connection error', error)
  })

  connection.bind('unavailable', () => {
    console.warn('[echo] realtime unavailable')
  })

  connectionDebugBound = true
}

function buildEcho(token) {
  window.Pusher = Pusher

  const config = resolveTransportConfig()
  const echo = new Echo({
    broadcaster: 'reverb',
    key: config.key,
    wsHost: config.wsHost,
    wsPort: config.wsPort,
    wssPort: config.wsPort,
    forceTLS: config.forceTLS,
    enabledTransports: config.enabledTransports,
    authEndpoint: config.authEndpoint,
    disableStats: true,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  })

  bindConnectionDebugging(echo)

  return echo
}

export function getEcho(token) {
  if (!token) {
    return null
  }

  if (!echoInstance || echoToken !== token) {
    if (echoInstance) {
      echoInstance.disconnect()
    }

    echoInstance = buildEcho(token)
    echoToken = token
  }

  return echoInstance
}

export function clearEcho() {
  if (echoInstance) {
    echoInstance.disconnect()
  }

  echoInstance = null
  echoToken = null
  connectionDebugBound = false
}

export default defineBoot(() => {})
