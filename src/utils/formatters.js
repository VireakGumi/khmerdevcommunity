export function formatDate(value, options = {}) {
  if (!value) return ''

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export function formatRelative(value) {
  if (!value) return ''

  const date = new Date(value)
  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000)
  const abs = Math.abs(diffMinutes)

  if (abs < 60) return `${abs}m ${diffMinutes < 0 ? 'ago' : 'left'}`

  const hours = Math.round(abs / 60)
  if (hours < 24) return `${hours}h ${diffMinutes < 0 ? 'ago' : 'left'}`

  const days = Math.round(hours / 24)
  return `${days}d ${diffMinutes < 0 ? 'ago' : 'left'}`
}
