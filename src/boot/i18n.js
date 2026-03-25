import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import { getDefaultLocale, getSavedLocale } from 'src/services/app-locale'

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    locale: getSavedLocale(),
    fallbackLocale: getDefaultLocale(),
    globalInjection: true,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
})
