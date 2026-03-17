<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label">Saved</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Your personal library</div>
        <div class="text-body2 muted-text q-mt-sm">Keep important posts, projects, events, and roles in one cleaner workspace for later review.</div>
      </div>
    </div>

    <div class="content-card q-pa-lg q-mb-lg">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-lg">
          <q-tabs v-model="activeTab" dense no-caps inline-label class="feed-tabs">
            <q-tab v-for="tab in tabs" :key="tab.value" :name="tab.value" :label="`${tab.label} (${tabCount(tab.value)})`" />
          </q-tabs>
        </div>
        <div class="col-12 col-lg-auto card-meta">
          {{ visibleItems.length }} saved items in this view
        </div>
      </div>
    </div>

    <div v-if="loading" class="utility-list">
      <div v-for="index in 4" :key="`saved-skeleton-${index}`" class="content-card q-pa-lg utility-card">
        <q-skeleton type="text" width="42%" />
        <q-skeleton type="text" class="q-mt-sm" />
        <q-skeleton type="text" width="76%" class="q-mt-xs" />
      </div>
    </div>

    <div v-else-if="!visibleItems.length" class="content-card q-pa-xl utility-empty text-center">
      <div class="text-h6 text-weight-bold">Nothing saved here yet</div>
      <div class="text-body2 muted-text q-mt-sm">Use bookmarks in the feed, projects, events, or jobs board to build your library.</div>
      <div class="q-gutter-sm q-mt-md">
        <q-btn color="primary" no-caps label="Browse feed" to="/feed" />
        <q-btn flat color="secondary" no-caps label="Browse jobs" to="/jobs" />
      </div>
    </div>

    <div v-else class="utility-list">
      <div v-for="item in visibleItems" :key="savedKey(item)" class="content-card q-pa-lg utility-card saved-card">
        <div class="saved-card__head">
          <div>
            <div class="mini-card-title">{{ savedTitle(item) }}</div>
            <div v-if="savedSubtitle(item)" class="mini-card-copy q-mt-xs">{{ savedSubtitle(item) }}</div>
          </div>
          <q-chip square :class="['theme-chip', savedTone(item)]">{{ savedTypeLabel(item) }}</q-chip>
        </div>
        <div v-if="savedSummary(item)" class="mini-card-copy">{{ savedSummary(item) }}</div>
        <div class="utility-card__meta">
          <span v-for="meta in savedMeta(item)" :key="meta" class="card-meta">{{ meta }}</span>
        </div>
        <div class="saved-card__actions">
          <q-btn flat no-caps color="secondary" label="Open" :to="savedLink(item)" />
          <q-btn
            flat
            no-caps
            color="negative"
            :loading="Boolean(removing[savedKey(item)])"
            label="Remove"
            @click="removeSaved(item)"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCommunityStore } from 'src/stores/community-store'

const $q = useQuasar()
const community = useCommunityStore()

const loading = ref(false)
const activeTab = ref('all')
const removing = reactive({})

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Posts', value: 'posts' },
  { label: 'Projects', value: 'projects' },
  { label: 'Events', value: 'events' },
  { label: 'Jobs', value: 'jobs' },
]

const saved = computed(() => community.saved)

const allItems = computed(() => [
  ...saved.value.posts.map((item) => ({ ...item, __type: 'posts' })),
  ...saved.value.projects.map((item) => ({ ...item, __type: 'projects' })),
  ...saved.value.events.map((item) => ({ ...item, __type: 'events' })),
  ...saved.value.jobs.map((item) => ({ ...item, __type: 'jobs' })),
])

const visibleItems = computed(() => {
  if (activeTab.value === 'all') return allItems.value
  return saved.value[activeTab.value].map((item) => ({ ...item, __type: activeTab.value }))
})

onMounted(async () => {
  loading.value = true
  try {
    await community.fetchSaved()
  } finally {
    loading.value = false
  }
})

function tabCount(tab) {
  if (tab === 'all') return allItems.value.length
  return saved.value[tab]?.length || 0
}

function savedKey(item) {
  return `${item.__type}-${item.id}`
}

function savedTypeLabel(item) {
  return item.__type.slice(0, -1).replace(/^\w/, (char) => char.toUpperCase())
}

function savedTone(item) {
  if (item.__type === 'posts') return 'theme-chip-primary'
  if (item.__type === 'projects') return 'theme-chip-secondary'
  if (item.__type === 'events') return 'theme-chip-warning'
  return 'theme-chip-success'
}

function savedTitle(item) {
  return item.title || item.name || item.company_name || ''
}

function savedSubtitle(item) {
  if (item.__type === 'posts') return item.user?.name
  if (item.__type === 'projects') return item.user?.name
  if (item.__type === 'jobs') return item.company_name
  return item.city || item.format || ''
}

function savedSummary(item) {
  return item.excerpt || item.tagline || item.summary || ''
}

function savedMeta(item) {
  if (item.__type === 'posts') return [item.topic].filter(Boolean)
  if (item.__type === 'projects') return [`${item.stars_count || 0} stars`]
  if (item.__type === 'events') return [item.city, item.format].filter(Boolean)
  if (item.__type === 'jobs') return [item.job_type, item.work_mode].filter(Boolean)
  return []
}

function savedLink(item) {
  if (item.__type === 'jobs') return `/jobs/${item.slug}`
  if (item.__type === 'events') return `/events/${item.id}`
  if (item.__type === 'projects') return '/projects'
  return '/feed'
}

async function removeSaved(item) {
  const key = savedKey(item)
  if (removing[key]) return
  removing[key] = true

  try {
    if (item.__type === 'posts') {
      await community.togglePostBookmark(item.id)
      community.saved.posts = community.saved.posts.filter((entry) => entry.id !== item.id)
    } else if (item.__type === 'projects') {
      await community.toggleProjectBookmark(item.id)
      community.saved.projects = community.saved.projects.filter((entry) => entry.id !== item.id)
    } else if (item.__type === 'events') {
      await community.toggleEventBookmark(item.id)
      community.saved.events = community.saved.events.filter((entry) => entry.id !== item.id)
    } else if (item.__type === 'jobs') {
      await community.toggleJobBookmark(item.id)
      community.saved.jobs = community.saved.jobs.filter((entry) => entry.id !== item.id)
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to remove item' })
  } finally {
    removing[key] = false
  }
}
</script>
