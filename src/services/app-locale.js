const STORAGE_KEY = 'kdc_locale'
const DEFAULT_LOCALE = 'en-US'
const SUPPORTED_LOCALES = ['en-US', 'km-KH']

export function getSavedLocale() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE
}

export function setSavedLocale(locale) {
  const next = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
  localStorage.setItem(STORAGE_KEY, next)
  return next
}

export function getSupportedLocales() {
  return [...SUPPORTED_LOCALES]
}

export function getDefaultLocale() {
  return DEFAULT_LOCALE
}
