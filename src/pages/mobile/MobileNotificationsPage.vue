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
      <section v-for="group in groupedNotifications" :key="group.label" class="q-mb-md">
        <div class="section-label q-mb-sm">{{ group.label }}</div>
        <article v-for="notification in group.items" :key="notification.id" class="stack-card q-pa-md q-mb-sm mobile-notification-card">
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
            <q-btn v-if="notificationTarget(notification)" flat dense no-caps color="primary" label="Open" :to="notificationTarget(notification)" />
          </div>
        </article>
      </section>
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
const groupedNotifications = computed(() => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - 7)

  const groups = [
    { label: 'Today', items: [] },
    { label: 'This week', items: [] },
    { label: 'Earlier', items: [] },
  ]

  for (const notification of notifications.value) {
    const sentAt = new Date(notification.sent_at)

    if (sentAt >= startOfToday) {
      groups[0].items.push(notification)
    } else if (sentAt >= startOfWeek) {
      groups[1].items.push(notification)
    } else {
      groups[2].items.push(notification)
    }
  }

  return groups.filter((group) => group.items.length)
})

function nestedField(source, key) {
  return source?.[key] ?? source?.data?.[key] ?? source?.meta?.[key] ?? source?.payload?.[key] ?? null
}

function notificationTarget(notification) {
  if (notification.action_url) {
    return notification.action_url
  }

  const conversationId = nestedField(notification, 'conversation_id')
  if (conversationId) {
    return `/m/messages?conversation=${conversationId}`
  }

  const postId = nestedField(notification, 'post_id')
  if (postId) {
    return `/m/feed/${postId}`
  }

  const eventId = nestedField(notification, 'event_id')
  if (eventId) {
    return `/m/events/${eventId}`
  }

  const jobSlug = nestedField(notification, 'job_slug')
  if (jobSlug) {
    return `/m/jobs/${jobSlug}`
  }

  const username = nestedField(notification, 'username')
  if (username) {
    return `/m/u/${username}`
  }

  return null
}

onMounted(async () => {
  loading.value = true

  try {
    await community.fetchNotifications()
  } finally {
    loading.value = false
  }
})
</script>
