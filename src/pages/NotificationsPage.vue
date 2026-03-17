<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label khmer-copy">Notifications</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Recent community activity on the web</div>
        <div class="text-body2 muted-text q-mt-sm">Likes, comments, project signals, and event updates collected into one calmer desktop inbox.</div>
      </div>
    </div>

    <div class="utility-list">
      <div v-for="notification in notifications" :key="notification.id" class="content-card q-pa-lg">
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
      </div>

      <div v-if="!notifications.length" class="utility-empty">
        No notifications yet.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCommunityStore } from 'src/stores/community-store'
import { formatRelative } from 'src/utils/formatters'

const community = useCommunityStore()
const notifications = computed(() => community.notifications)

onMounted(() => {
  community.fetchNotifications()
})
</script>
