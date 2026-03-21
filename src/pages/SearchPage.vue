<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label">Search</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Search posts, builders, projects, and events</div>
        <div class="text-body2 muted-text q-mt-sm">A stronger search experience with clearer tabs, smarter sorting, and easier-to-scan results.</div>
      </div>
    </div>

    <div class="content-card q-pa-lg q-mb-lg">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-lg">
          <q-input
            v-model="query"
            outlined
            class="input-surface"
            label="Search everything"
            placeholder="Laravel, Roeun Vireak, OSS Radar, meetup..."
            @keyup.enter="submitSearch"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-lg-2">
          <q-select v-model="sortBy" outlined dense emit-value map-options class="input-surface" label="Sort" :options="sortOptions" />
        </div>
        <div class="col-6 col-lg-auto">
          <q-btn color="primary" no-caps label="Search" :loading="searching" @click="submitSearch" />
        </div>
      </div>

      <q-tabs v-if="results.query" v-model="activeTab" dense no-caps inline-label class="feed-tabs q-mt-md">
        <q-tab v-for="tab in searchTabs" :key="tab.value" :name="tab.value" :label="`${tab.label} (${tabCount(tab.value)})`" />
      </q-tabs>
    </div>

    <div v-if="searching && !hasResults" class="search-skeleton-grid">
      <div v-for="index in 4" :key="`search-skeleton-${index}`" class="content-card q-pa-lg utility-card">
        <q-skeleton type="text" width="42%" />
        <q-skeleton type="text" class="q-mt-sm" />
        <q-skeleton type="text" width="76%" class="q-mt-xs" />
      </div>
    </div>

    <div v-else-if="results.query && !activeItems.length" class="content-card q-pa-xl utility-empty text-center">
      <div class="text-h6 text-weight-bold">No results found</div>
      <div class="text-body2 muted-text q-mt-sm">Try broader keywords, switch tabs, or search for a person, stack, event, or project name.</div>
    </div>

    <div v-else-if="results.query" class="search-results-layout">
      <div class="content-card q-pa-lg">
        <div class="portfolio-section-head">
          <div class="section-label">{{ activeTabLabel }}</div>
          <h2 class="portfolio-section-title">{{ activeItems.length }} results</h2>
        </div>

        <transition-group name="feed-stack" tag="div" class="utility-list q-mt-md">
          <div v-for="item in visibleItems" :key="`${activeTab}-${item.id || item.slug}`" class="utility-card search-result-card">
            <div class="search-result-card__head">
              <div>
                <div class="mini-card-title" v-html="highlightText(resultTitle(item))" />
                <div v-if="resultSubtitle(item)" class="mini-card-copy q-mt-xs" v-html="highlightText(resultSubtitle(item))" />
              </div>
              <q-btn flat no-caps color="secondary" label="Open" :to="resultLink(item)" />
            </div>
            <div v-if="resultSummary(item)" class="mini-card-copy" v-html="highlightText(resultSummary(item))" />
            <div class="utility-card__meta">
              <span v-for="meta in resultMeta(item)" :key="meta" class="card-meta" v-html="highlightText(meta)" />
            </div>
          </div>
        </transition-group>

        <div v-if="activeItems.length > visibleItems.length" class="text-center q-mt-lg">
          <q-btn outline color="primary" no-caps label="Load more results" @click="loadMore" />
        </div>
      </div>

      <div class="content-card q-pa-lg search-side-card">
        <div class="section-label">Search Guide</div>
        <div class="text-h6 text-weight-bold q-mt-md">Search the whole product graph</div>
        <div class="text-body2 muted-text q-mt-sm">Use names for people, stack terms for jobs and projects, and event keywords for meetups or launches.</div>
        <div class="utility-list q-mt-md">
          <div class="utility-card">
            <div class="mini-card-title">Try keywords</div>
            <div class="utility-card__meta">
              <span class="card-meta">Laravel</span>
              <span class="card-meta">Remote</span>
              <span class="card-meta">Meetup</span>
              <span class="card-meta">Portfolio</span>
            </div>
          </div>
          <div class="utility-card">
            <div class="mini-card-title">Current query</div>
            <div class="mini-card-copy">{{ results.query }}</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunityStore } from 'src/stores/community-store'

const route = useRoute()
const router = useRouter()
const community = useCommunityStore()

const query = ref(route.query.q || '')
const searching = ref(false)
const activeTab = ref('all')
const sortBy = ref('relevance')
const visibleCount = ref(8)

const searchTabs = [
  { label: 'All', value: 'all' },
  { label: 'Posts', value: 'posts' },
  { label: 'Projects', value: 'projects' },
  { label: 'Developers', value: 'developers' },
  { label: 'Events', value: 'events' },
  { label: 'Jobs', value: 'jobs' },
]

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Latest', value: 'latest' },
]

const results = computed(() => ({
  query: community.searchQuery,
  posts: community.searchLists.posts,
  developers: community.searchLists.developers,
  projects: community.searchLists.projects,
  events: community.searchLists.events,
  jobs: community.searchLists.jobs,
}))

const allResults = computed(() => [
  ...results.value.posts.items.map((item) => ({ ...item, __type: 'posts' })),
  ...results.value.projects.items.map((item) => ({ ...item, __type: 'projects' })),
  ...results.value.developers.items.map((item) => ({ ...item, __type: 'developers' })),
  ...results.value.events.items.map((item) => ({ ...item, __type: 'events' })),
  ...results.value.jobs.items.map((item) => ({ ...item, __type: 'jobs' })),
])

const activeItems = computed(() => {
  const items = activeTab.value === 'all' ? allResults.value : results.value[activeTab.value].items.map((item) => ({ ...item, __type: activeTab.value }))

  if (sortBy.value === 'latest') {
    return [...items].sort((a, b) => new Date(b.created_at || b.starts_at || 0).getTime() - new Date(a.created_at || a.starts_at || 0).getTime())
  }

  return items
})

const visibleItems = computed(() => activeItems.value.slice(0, visibleCount.value))
const hasResults = computed(() => allResults.value.length > 0)
const activeTabLabel = computed(() => searchTabs.find((tab) => tab.value === activeTab.value)?.label || 'Results')

watch(
  () => route.query.q,
  async (value) => {
    if (!value) {
      return
    }

    query.value = value
    visibleCount.value = 8
    searching.value = true

    try {
      await community.search(value)
    } finally {
      searching.value = false
    }
  },
  { immediate: true },
)

watch([activeTab, sortBy], () => {
  visibleCount.value = 8
})

function tabCount(tab) {
  if (tab === 'all') return allResults.value.length
  return results.value[tab]?.total || 0
}

function loadMore() {
  visibleCount.value += 8
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function highlightText(value = '') {
  const safe = escapeHtml(value)
  const term = query.value.trim()

  if (!term) return safe

  const pattern = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return safe.replace(new RegExp(`(${pattern})`, 'ig'), '<mark>$1</mark>')
}

function resultTitle(item) {
  return item.title || item.name || item.company_name || ''
}

function resultSubtitle(item) {
  if (item.__type === 'developers') return `@${item.username} • ${item.followers_count || 0} followers`
  if (item.__type === 'jobs') return item.company_name
  if (item.__type === 'projects') return item.tagline
  return item.topic || item.format || ''
}

function resultSummary(item) {
  return item.excerpt || item.summary || item.portfolio_summary || item.bio || ''
}

function resultMeta(item) {
  if (item.__type === 'posts') return [item.user?.name, item.topic].filter(Boolean)
  if (item.__type === 'projects') return [item.user?.name, `${item.stars_count || 0} stars`].filter(Boolean)
  if (item.__type === 'developers') return [item.location || 'Cambodia', item.availability].filter(Boolean)
  if (item.__type === 'events') return [item.city, item.format].filter(Boolean)
  if (item.__type === 'jobs') return [item.job_type, item.work_mode].filter(Boolean)
  return []
}

function resultLink(item) {
  if (item.__type === 'developers') return `/u/${item.username}`
  if (item.__type === 'jobs') return `/jobs/${item.slug}`
  if (item.__type === 'events') return `/events/${item.id}`
  if (item.__type === 'projects') return '/projects'
  return '/feed'
}

async function submitSearch() {
  await router.push({
    path: route.meta.mobileShell ? '/m/search' : '/search',
    query: { q: query.value },
  })
}
</script>

