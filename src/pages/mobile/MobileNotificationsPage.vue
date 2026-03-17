<template>
  <q-page class="q-pa-md q-pb-xl">
    <div class="content-card q-pa-sm q-mb-sm" style="border-radius: 20px">
      <div class="section-label">Alerts</div>
      <div class="text-subtitle1 text-weight-bold q-mt-sm">Recent community activity</div>
      <div class="text-body2 muted-text q-mt-xs">Likes, comments, and direct activity show up here first.</div>
    </div>

    <div v-for="notification in notifications" :key="notification.id" class="stack-card q-pa-sm q-mb-sm">
      <div class="row items-center justify-between">
        <q-chip square class="theme-chip theme-chip-primary">{{ notification.type }}</q-chip>
        <div class="text-caption muted-text">{{ formatRelative(notification.sent_at) }}</div>
      </div>
      <div class="text-subtitle1 text-weight-bold q-mt-sm">{{ notification.title }}</div>
      <div class="text-body2 muted-text q-mt-xs">{{ notification.body }}</div>
      <div class="text-caption q-mt-sm" :style="{ color: notification.read_at ? 'var(--kdc-copy-soft)' : 'var(--kdc-primary)' }">
        {{ notification.read_at ? 'Read' : 'Unread' }}
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
