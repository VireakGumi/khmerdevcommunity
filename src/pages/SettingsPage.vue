<template>
  <q-page padding>
    <template v-if="loading">
      <div class="page-intro q-mb-lg">
        <div>
          <q-skeleton type="text" width="18%" />
          <q-skeleton type="text" width="42%" class="q-mt-sm" />
          <q-skeleton type="text" width="68%" class="q-mt-sm" />
        </div>
        <div class="page-actions">
          <q-skeleton type="rect" width="132px" height="40px" />
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div v-for="index in 2" :key="`settings-skeleton-${index}`" class="col-12 col-xl-6">
          <div class="content-card q-pa-lg page-skeleton-panel">
            <q-skeleton type="text" width="24%" />
            <q-skeleton type="text" width="52%" class="q-mt-sm" />
            <div class="q-mt-md">
              <div v-for="item in 4" :key="`settings-row-${index}-${item}`" class="settings-toggle-row">
                <div class="settings-toggle-row__copy">
                  <q-skeleton type="text" width="34%" />
                  <q-skeleton type="text" class="q-mt-xs" />
                </div>
                <q-skeleton type="QToggle" width="48px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label">Settings</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Control notifications and privacy</div>
        <div class="text-body2 muted-text q-mt-sm">Keep the product usable by making communication and visibility preferences explicit.</div>
      </div>
      <div class="page-actions">
        <q-btn color="primary" no-caps label="Save settings" :loading="saving" @click="save" />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-6">
        <div class="content-card q-pa-lg">
          <div class="portfolio-section-head">
            <div class="section-label">Notifications</div>
            <h2 class="portfolio-section-title">What should reach you</h2>
          </div>
          <div class="settings-stack q-mt-md">
            <div class="settings-toggle-row">
              <div class="settings-toggle-row__copy">
                <strong>Mentions</strong>
                <span>Receive alerts when someone mentions you in a post or thread.</span>
              </div>
              <q-toggle v-model="form.notification_preferences.mentions" />
            </div>
            <div class="settings-toggle-row">
              <div class="settings-toggle-row__copy">
                <strong>Comments</strong>
                <span>Stay updated when discussions continue on your content.</span>
              </div>
              <q-toggle v-model="form.notification_preferences.comments" />
            </div>
            <div class="settings-toggle-row">
              <div class="settings-toggle-row__copy">
                <strong>Follows</strong>
                <span>Get notified when new builders follow your profile.</span>
              </div>
              <q-toggle v-model="form.notification_preferences.follows" />
            </div>
            <div class="settings-toggle-row">
              <div class="settings-toggle-row__copy">
                <strong>Messages</strong>
                <span>Receive direct-message alerts across web and mobile.</span>
              </div>
              <q-toggle v-model="form.notification_preferences.messages" />
            </div>
            <div class="settings-toggle-row">
              <div class="settings-toggle-row__copy">
                <strong>Events</strong>
                <span>Get reminders for tracked events and community sessions.</span>
              </div>
              <q-toggle v-model="form.notification_preferences.events" />
            </div>
          </div>
          <div class="stack-card q-pa-md q-mt-md">
            <div class="text-subtitle2 text-weight-bold">Phone and browser push</div>
            <div class="mini-card-copy q-mt-xs">Enable device notifications so replies, messages, follows, and alerts can reach your phone outside the app.</div>
            <div class="q-mt-md row q-col-gutter-sm">
              <div class="col-auto">
                <q-btn color="primary" no-caps icon="notifications_active" label="Enable push notifications" :loading="enablingPush" @click="enablePushNotifications" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-6">
        <div class="content-card q-pa-lg">
          <div class="portfolio-section-head">
            <div class="section-label">Privacy</div>
            <h2 class="portfolio-section-title">How your profile behaves</h2>
          </div>
          <div class="settings-stack q-mt-md">
            <div class="settings-toggle-row">
              <div class="settings-toggle-row__copy">
                <strong>Show email publicly</strong>
                <span>Let people contact you directly from your public profile.</span>
              </div>
              <q-toggle v-model="form.privacy_settings.show_email" />
            </div>
            <div class="settings-toggle-row">
              <div class="settings-toggle-row__copy">
                <strong>Show location publicly</strong>
                <span>Display your city or region on developer surfaces and search.</span>
              </div>
              <q-toggle v-model="form.privacy_settings.show_location" />
            </div>
            <div class="settings-toggle-row">
              <div class="settings-toggle-row__copy">
                <strong>Allow direct messages</strong>
                <span>Control whether builders can start a conversation from your profile.</span>
              </div>
              <q-toggle v-model="form.privacy_settings.allow_messages" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="session.isAdmin" class="col-12">
        <div class="content-card q-pa-lg">
          <div class="portfolio-section-head">
            <div class="section-label">Admin</div>
            <h2 class="portfolio-section-title">Operations and review tools</h2>
          </div>
          <div class="mini-card-copy q-mt-sm">Open the donation review dashboard to verify KHQR confirmations and manage supporter submissions.</div>
          <div class="q-mt-md row q-col-gutter-sm">
            <div class="col-auto">
            <q-btn color="primary" no-caps icon="shield" label="Open admin donations" to="/admin/donations" />
            </div>
            <div class="col-auto">
              <q-btn flat color="secondary" no-caps icon="flag" label="Open admin reports" to="/admin/reports" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { initializePushNotifications } from 'src/services/push-notifications'
import { useSessionStore } from 'src/stores/session-store'

const $q = useQuasar()
const router = useRouter()
const session = useSessionStore()
const loading = ref(false)
const saving = ref(false)
const enablingPush = ref(false)
const form = reactive({
  notification_preferences: {
    mentions: true,
    comments: true,
    follows: true,
    messages: true,
    events: true,
  },
  privacy_settings: {
    show_email: false,
    show_location: true,
    allow_messages: true,
  },
})

onMounted(async () => {
  loading.value = true
  try {
    const data = await session.fetchSettings()
    Object.assign(form.notification_preferences, data.notification_preferences || {})
    Object.assign(form.privacy_settings, data.privacy_settings || {})
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true

  try {
    await session.updateSettings(form)
    $q.notify({ type: 'positive', message: 'Settings saved' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save settings' })
  } finally {
    saving.value = false
  }
}

async function enablePushNotifications() {
  enablingPush.value = true

  try {
    const result = await initializePushNotifications({
      onForegroundNotification(payload) {
        const title = payload?.notification?.title || payload?.title || 'New notification'
        const message = payload?.notification?.body || payload?.body || payload?.data?.body || 'You have new activity.'

        $q.notify({
          type: 'info',
          message: `${title}: ${message}`,
          timeout: 3200,
        })
      },
      onOpenRoute(target) {
        if (!target) {
          return
        }

        try {
          const normalized = target.startsWith('http')
            ? new URL(target).hash.replace(/^#/, '') || new URL(target).pathname
            : target.replace(/^#/, '')

          router.push(normalized.startsWith('/') ? normalized : `/${normalized}`)
        } catch {
          router.push(target)
        }
      },
    })

    if (result?.enabled) {
      $q.notify({ type: 'positive', message: 'Push notifications enabled' })
      return
    }

    $q.notify({ type: 'warning', message: 'Push notifications are not available yet on this device' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || error.message || 'Failed to enable push notifications' })
  } finally {
    enablingPush.value = false
  }
}
</script>
