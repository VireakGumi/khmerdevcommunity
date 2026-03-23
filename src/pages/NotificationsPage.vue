<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label khmer-copy">Notifications</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Recent community activity on the web</div>
        <div class="text-body2 muted-text q-mt-sm">Likes, comments, project signals, and event updates collected into one calmer desktop inbox.</div>
      </div>
    </div>

    <div v-if="loading" class="utility-list">
      <div v-for="index in 4" :key="`notification-skeleton-${index}`" class="content-card q-pa-lg page-skeleton-panel">
        <div class="utility-card__head">
          <div class="utility-card__meta">
            <q-skeleton type="QChip" width="88px" />
            <q-skeleton type="text" width="56px" />
          </div>
          <q-skeleton type="text" width="72px" />
        </div>
        <q-skeleton type="text" width="48%" class="q-mt-md" />
        <q-skeleton type="text" class="q-mt-sm" />
        <q-skeleton type="text" width="82%" class="q-mt-xs" />
      </div>
    </div>

    <div v-else class="utility-list">
      <section v-for="group in groupedNotifications" :key="group.label" class="q-mb-lg">
        <div class="section-label q-mb-sm">{{ group.label }}</div>
        <div class="utility-list">
          <div v-for="notification in group.items" :key="notification.id" class="content-card q-pa-lg">
            <div class="utility-card__head">
              <div class="utility-card__meta">
                <q-chip square class="theme-chip theme-chip-primary">{{ notification.type }}</q-chip>
                <span class="card-meta" :style="{ color: notification.read_at ? 'var(--kdc-copy-soft)' : 'var(--kdc-primary)' }">
                  {{ notification.read_at ? 'Read' : 'Unread' }}
                </span>
              </div>
              <div class="card-meta">{{ formatRelative(notification.sent_at) }}</div>
            </div>
            <div class="mini-card-title q-mt-sm">{{ notification.title }}</div>
            <div class="mini-card-copy q-mt-xs">{{ notification.body }}</div>
            <div v-if="notificationTarget(notification)" class="q-mt-md">
              <q-btn flat no-caps color="primary" icon="open_in_new" label="Open" :to="notificationTarget(notification)" />
            </div>
          </div>
        </div>
      </section>

      <div v-if="!notifications.length" class="utility-empty">
        No notifications yet.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCommunityStore } from 'src/stores/community-store'
import { formatRelative } from 'src/utils/formatters'

const community = useCommunityStore()
const notifications = computed(() => community.notifications)
const loading = ref(false)

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
    return `/messages?conversation=${conversationId}`
  }

  const postId = nestedField(notification, 'post_id')
  if (postId) {
    return `/feed/${postId}`
  }

  const eventId = nestedField(notification, 'event_id')
  if (eventId) {
    return `/events/${eventId}`
  }

  const jobSlug = nestedField(notification, 'job_slug')
  if (jobSlug) {
    return `/jobs/${jobSlug}`
  }

  const username = nestedField(notification, 'username')
  if (username) {
    return `/u/${username}`
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
