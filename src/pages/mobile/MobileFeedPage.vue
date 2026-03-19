<template>
  <q-page class="q-pa-md q-pb-xl mobile-feed-page">
    <div class="content-card q-pa-md mobile-feed-hero">
      <div class="section-label">Feed</div>
      <div class="text-h6 text-weight-bold q-mt-sm">What Khmer builders are shipping right now</div>
      <div class="text-body2 muted-text q-mt-sm">Fast scan first, deeper reading when something matters.</div>

      <div class="row items-center justify-between q-col-gutter-sm q-mt-md">
        <div class="col">
          <q-tabs v-model="activeTab" dense no-caps class="feed-tabs mobile-feed-tabs">
            <q-tab name="for-you" label="For you" />
            <q-tab name="trending" label="Trending" />
          </q-tabs>
        </div>
        <div class="col-auto">
          <q-btn flat round dense color="grey-5" icon="refresh" :loading="loading" @click="refreshFeed" />
        </div>
      </div>

      <div class="summary-grid q-mt-md">
        <div class="inline-stat">
          <div class="card-meta">Posts</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ feed.length }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Pinned</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ pinnedCount }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Topics</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ topicCount }}</div>
        </div>
      </div>
    </div>

    <div v-if="loading && !feed.length" class="q-mt-md">
      <div v-for="index in 3" :key="`mobile-feed-skeleton-${index}`" class="content-card q-pa-md q-mb-sm page-skeleton-panel">
        <div class="row items-center justify-between">
          <q-skeleton type="text" width="32%" />
          <q-skeleton type="text" width="18%" />
        </div>
        <q-skeleton type="text" width="72%" class="q-mt-md" />
        <q-skeleton type="text" class="q-mt-sm" />
        <q-skeleton square height="180px" class="rounded-borders q-mt-md" />
      </div>
    </div>

    <div v-else-if="!feed.length" class="content-card q-pa-xl utility-empty q-mt-md">
      <div class="text-subtitle1 text-weight-bold">No feed posts yet</div>
      <div class="text-body2 muted-text q-mt-sm">Once builders publish updates, launches, and requests for feedback, they will show up here.</div>
      <q-btn class="q-mt-md" color="primary" no-caps label="Create the first post" to="/m/post" />
    </div>

    <div v-else class="q-mt-md">
      <article v-for="post in feed" :key="post.id" class="stack-card q-pa-md q-mb-sm mobile-feed-card">
        <div class="row items-center justify-between no-wrap">
          <div class="min-w-0">
            <div class="text-caption muted-text">@{{ post.user?.username || 'builder' }}</div>
            <div class="text-caption muted-text q-mt-xs">{{ formatRelative(post.published_at) }}</div>
          </div>
          <div class="row items-center q-gutter-xs">
            <q-chip v-if="post.pinned" square dense class="theme-chip theme-chip-primary">Pinned</q-chip>
            <q-chip v-if="post.topic" square dense class="theme-chip">{{ post.topic }}</q-chip>
          </div>
        </div>

        <div class="text-subtitle1 text-weight-bold q-mt-md">{{ post.title }}</div>
        <div class="text-body2 muted-text q-mt-sm">{{ post.excerpt }}</div>

        <div v-if="post.media?.length" class="mobile-feed-media q-mt-md">
          <q-img :src="post.media[0]" fit="cover" class="rounded-borders mobile-feed-media__image" loading="lazy" />
          <div v-if="post.media.length > 1" class="mobile-feed-media__count">+{{ post.media.length - 1 }}</div>
        </div>

        <div class="row items-center justify-between q-mt-md text-caption muted-text">
          <div class="row q-gutter-md">
            <span>{{ post.likes_count }} likes</span>
            <span>{{ post.comments_count }} replies</span>
          </div>
          <q-btn flat dense no-caps color="primary" icon="north_east" label="Open" :to="`/m/feed/${post.id}`" />
        </div>
      </article>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCommunityStore } from 'src/stores/community-store'
import { formatRelative } from 'src/utils/formatters'

const community = useCommunityStore()
const activeTab = ref('for-you')
const loading = ref(false)

const feed = computed(() => community.feed)
const pinnedCount = computed(() => feed.value.filter((post) => post.pinned).length)
const topicCount = computed(() => new Set(feed.value.map((post) => post.topic).filter(Boolean)).size)

async function refreshFeed() {
  loading.value = true

  try {
    await community.fetchFeed(activeTab.value)
  } finally {
    loading.value = false
  }
}

watch(activeTab, () => {
  refreshFeed().catch(() => {})
})

onMounted(() => {
  refreshFeed().catch(() => {})
})
</script>
