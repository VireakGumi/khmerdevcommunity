<template>
  <q-page class="q-pa-md q-pb-xl mobile-notifications-page">
    <div class="content-card q-pa-md">
      <div class="section-label">Alerts</div>
      <div class="text-h6 text-weight-bold q-mt-sm">Recent community activity</div>
      <div class="text-body2 muted-text q-mt-sm">Likes, comments, follows, and important system signals show up here first.</div>

      <div class="summary-grid q-mt-md">
        <div class="inline-stat">
          <div class="card-meta">Unread</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ unreadCount }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Total</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ notifications.length }}</div>
        </div>
      </div>
    </div>

    <div v-if="loading && !notifications.length" class="q-mt-md">
      <div v-for="index in 4" :key="`mobile-alert-skeleton-${index}`" class="content-card q-pa-md q-mb-sm page-skeleton-panel">
        <div class="row items-center justify-between">
          <q-skeleton type="QChip" width="84px" />
          <q-skeleton type="text" width="18%" />
        </div>
        <q-skeleton type="text" width="68%" class="q-mt-md" />
        <q-skeleton type="text" class="q-mt-sm" />
      </div>
    </div>

    <div v-else-if="!notifications.length" class="content-card q-pa-xl utility-empty q-mt-md">
      <div class="text-subtitle1 text-weight-bold">No notifications yet</div>
      <div class="text-body2 muted-text q-mt-sm">Once people reply, follow you, or interact with your work, they will appear here.</div>
    </div>

    <div v-else class="q-mt-md">
      <article v-for="notification in notifications" :key="notification.id" class="stack-card q-pa-md q-mb-sm mobile-notification-card">
        <div class="row items-center justify-between">
          <q-chip square dense :class="['theme-chip', notification.read_at ? '' : 'theme-chip-primary']">{{ notification.type }}</q-chip>
          <div class="text-caption muted-text">{{ formatRelative(notification.sent_at) }}</div>
        </div>
        <div class="text-subtitle2 text-weight-bold q-mt-md">{{ notification.title }}</div>
        <div class="text-body2 muted-text q-mt-sm">{{ notification.body }}</div>
        <div class="row items-center justify-between q-mt-md">
          <div class="text-caption" :style="{ color: notification.read_at ? 'var(--kdc-copy-soft)' : 'var(--kdc-primary)' }">
            {{ notification.read_at ? 'Read' : 'Unread' }}
          </div>
          <q-btn v-if="notification.action_url" flat dense no-caps color="primary" label="Open" :to="notification.action_url" />
        </div>
      </article>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCommunityStore } from 'src/stores/community-store'
import { formatRelative } from 'src/utils/formatters'

const community = useCommunityStore()
const loading = ref(false)
const notifications = computed(() => community.notifications)
const unreadCount = computed(() => notifications.value.filter((item) => !item.read_at).length)

onMounted(async () => {
  loading.value = true

  try {
    await community.fetchNotifications()
  } finally {
    loading.value = false
  }
})
</script>
