<template>
  <q-page padding>
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
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useSessionStore } from 'src/stores/session-store'

const $q = useQuasar()
const session = useSessionStore()
const saving = ref(false)
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
  const data = await session.fetchSettings()
  Object.assign(form.notification_preferences, data.notification_preferences || {})
  Object.assign(form.privacy_settings, data.privacy_settings || {})
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
</script>
