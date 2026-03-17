<template>
  <q-page class="q-pa-md q-pb-xl">
    <div class="content-card q-pa-sm q-mb-sm" style="border-radius: 20px">
      <div class="section-label">Quick Scan</div>
      <div class="text-subtitle1 text-weight-bold q-mt-sm">What Khmer devs are shipping today</div>
      <div class="summary-grid q-mt-md">
        <div class="inline-stat">
          <div class="card-meta">Posts</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ feed.length }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Pinned</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ pinnedCount }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Topics</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ topicCount }}</div>
        </div>
      </div>
    </div>

    <div v-for="post in feed" :key="post.id" class="stack-card q-pa-sm q-mb-sm" style="border-radius: 16px">
      <div class="row items-center justify-between text-caption muted-text">
        <div>@{{ post.user.username }}</div>
        <div>{{ formatRelative(post.published_at) }}</div>
      </div>
      <div class="text-subtitle1 text-weight-bold q-mt-sm">{{ post.title }}</div>
      <div class="text-body2 muted-text q-mt-sm">{{ post.excerpt }}</div>
      <div class="row q-gutter-md q-mt-md text-caption muted-text">
        <div>{{ post.likes_count }} likes</div>
        <div>{{ post.comments_count }} replies</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCommunityStore } from 'src/stores/community-store'
import { formatRelative } from 'src/utils/formatters'

const community = useCommunityStore()
const feed = computed(() => community.feed)
const pinnedCount = computed(() => feed.value.filter((post) => post.pinned).length)
const topicCount = computed(() => new Set(feed.value.map((post) => post.topic).filter(Boolean)).size)

onMounted(() => {
  if (community.feed.length === 0) {
    community.fetchFeed()
  }
})
</script>
