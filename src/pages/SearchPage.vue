<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label">{{ $t('search.pageLabel') }}</div>
        <div class="text-h4 text-weight-bold q-mt-sm">{{ $t('search.pageTitle') }}</div>
        <div class="text-body2 muted-text q-mt-sm">{{ $t('search.pageCopy') }}</div>
      </div>
    </div>

    <div class="content-card q-pa-lg q-mb-lg">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-lg">
          <q-input
            v-model="query"
            outlined
            class="input-surface"
            :label="$t('search.inputLabel')"
            :placeholder="$t('search.inputPlaceholder')"
            @keyup.enter="submitSearch"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-lg-2">
          <q-select v-model="sortBy" outlined dense emit-value map-options class="input-surface" :label="$t('search.sortLabel')" :options="sortOptions" />
        </div>
        <div class="col-6 col-lg-auto">
          <q-btn color="primary" no-caps :label="$t('search.searchButton')" :loading="searching" @click="submitSearch" />
        </div>
      </div>

      <div class="search-filter-row q-mt-md">
        <q-chip
          v-for="filter in quickFilters"
          :key="filter.value"
          clickable
          :outline="activeFilter !== filter.value"
          :color="activeFilter === filter.value ? 'primary' : 'secondary'"
          :text-color="activeFilter === filter.value ? 'white' : undefined"
          @click="toggleFilter(filter.value)"
        >
          {{ filter.label }}
        </q-chip>
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

    <div v-else-if="results.query && !filteredItems.length" class="content-card q-pa-xl utility-empty text-center">
      <div class="text-h6 text-weight-bold">{{ $t('search.noResultsTitle') }}</div>
      <div class="text-body2 muted-text q-mt-sm">{{ $t('search.noResultsCopy') }}</div>
    </div>

    <div v-else-if="results.query" class="search-results-layout">
      <div class="content-card q-pa-lg">
        <div class="portfolio-section-head">
          <div class="section-label">{{ activeTabLabel }}</div>
          <h2 class="portfolio-section-title">{{ filteredItems.length }} {{ $t('search.results') }}</h2>
        </div>

        <div class="search-summary-grid q-mt-md">
          <div v-for="metric in summaryMetrics" :key="metric.label" class="search-summary-card">
            <div class="search-summary-card__value">{{ metric.value }}</div>
            <div class="search-summary-card__label">{{ metric.label }}</div>
          </div>
        </div>

        <transition-group name="feed-stack" tag="div" class="utility-list q-mt-md">
          <div v-for="item in visibleItems" :key="`${activeTab}-${item.id || item.slug}`" class="utility-card search-result-card">
            <div class="search-result-card__head">
              <div>
                <div class="mini-card-title" v-html="highlightText(resultTitle(item))" />
                <div v-if="resultSubtitle(item)" class="mini-card-copy q-mt-xs" v-html="highlightText(resultSubtitle(item))" />
              </div>
              <q-btn flat no-caps color="secondary" :label="$t('search.open')" :to="resultLink(item)" />
            </div>
            <div v-if="resultSummary(item)" class="mini-card-copy" v-html="highlightText(resultSummary(item))" />
            <div class="utility-card__meta">
              <span v-for="meta in resultMeta(item)" :key="meta" class="card-meta" v-html="highlightText(meta)" />
            </div>
          </div>
        </transition-group>

        <div v-if="filteredItems.length > visibleItems.length" class="text-center q-mt-lg">
          <q-btn outline color="primary" no-caps :label="$t('search.loadMore')" @click="loadMore" />
        </div>
      </div>

      <div class="content-card q-pa-lg search-side-card">
        <div class="section-label">{{ $t('search.guideLabel') }}</div>
        <div class="text-h6 text-weight-bold q-mt-md">{{ $t('search.guideTitle') }}</div>
        <div class="text-body2 muted-text q-mt-sm">{{ $t('search.guideCopy') }}</div>
        <div class="utility-list q-mt-md">
          <div class="utility-card">
            <div class="mini-card-title">{{ $t('search.tryKeywords') }}</div>
            <div class="utility-card__meta">
              <span class="card-meta">Laravel</span>
              <span class="card-meta">Remote</span>
              <span class="card-meta">Meetup</span>
              <span class="card-meta">Portfolio</span>
            </div>
          </div>
          <div class="utility-card">
            <div class="mini-card-title">{{ $t('search.currentMode') }}</div>
            <div class="mini-card-copy">{{ activeFilterLabel }}</div>
          </div>
          <div class="utility-card">
            <div class="mini-card-title">{{ $t('search.currentQuery') }}</div>
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
import { useI18n } from 'vue-i18n'
import { useCommunityStore } from 'src/stores/community-store'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const community = useCommunityStore()

const query = ref(route.query.q || '')
const searching = ref(false)
const activeTab = ref('all')
const sortBy = ref(route.query.sort || 'relevance')
const activeFilter = ref(route.query.filter || 'all')
const visibleCount = ref(8)

const searchTabs = computed(() => [
  { label: t('search.all'), value: 'all' },
  { label: t('search.posts'), value: 'posts' },
  { label: t('search.projects'), value: 'projects' },
  { label: t('search.developers'), value: 'developers' },
  { label: t('search.events'), value: 'events' },
  { label: t('search.jobs'), value: 'jobs' },
])

const sortOptions = computed(() => [
  { label: t('search.relevance'), value: 'relevance' },
  { label: t('search.latest'), value: 'latest' },
  { label: t('search.popular'), value: 'popular' },
])

const quickFilters = computed(() => [
  { label: t('search.allResults'), value: 'all' },
  { label: t('search.remoteJobs'), value: 'remote' },
  { label: t('search.onlineEvents'), value: 'online' },
  { label: t('search.openToWork'), value: 'available' },
  { label: t('search.popularWork'), value: 'popular' },
])

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

const activeItems = computed(() => (
  activeTab.value === 'all'
    ? allResults.value
    : results.value[activeTab.value].items.map((item) => ({ ...item, __type: activeTab.value }))
))

const filteredItems = computed(() => activeItems.value.filter((item) => matchesFilter(item)))
const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value))
const hasResults = computed(() => allResults.value.length > 0)
const activeTabLabel = computed(() => searchTabs.value.find((tab) => tab.value === activeTab.value)?.label || t('search.results'))
const activeFilterLabel = computed(() => quickFilters.value.find((filter) => filter.value === activeFilter.value)?.label || t('search.allResults'))
const summaryMetrics = computed(() => [
  { label: t('search.visibleNow'), value: filteredItems.value.length },
  { label: t('search.posts'), value: results.value.posts.total || 0 },
  { label: t('search.projects'), value: results.value.projects.total || 0 },
  { label: t('search.events'), value: results.value.events.total || 0 },
  { label: t('search.jobs'), value: results.value.jobs.total || 0 },
])

watch(
  () => [route.query.q, route.query.sort, route.query.filter],
  async ([value, sort, filter]) => {
    if (!value) {
      return
    }

    query.value = value
    sortBy.value = sort || 'relevance'
    activeFilter.value = filter || 'all'
    visibleCount.value = 8
    searching.value = true

    try {
      await community.search(value, { sort: sortBy.value })
    } finally {
      searching.value = false
    }
  },
  { immediate: true },
)

watch([activeTab, sortBy, activeFilter], () => {
  visibleCount.value = 8
})

function tabCount(tab) {
  if (tab === 'all') return allResults.value.length
  return results.value[tab]?.total || 0
}

function loadMore() {
  visibleCount.value += 8
}

function toggleFilter(value) {
  activeFilter.value = activeFilter.value === value ? 'all' : value
}

function matchesFilter(item) {
  if (activeFilter.value === 'all') return true
  if (activeFilter.value === 'remote') return item.__type === 'jobs' && String(item.work_mode || '').toLowerCase().includes('remote')
  if (activeFilter.value === 'online') return item.__type === 'events' && String(item.format || '').toLowerCase().includes('online')
  if (activeFilter.value === 'available') return item.__type === 'developers' && Boolean(item.availability)
  if (activeFilter.value === 'popular') {
    if (item.__type === 'posts') return (item.likes_count || 0) > 0 || (item.comments_count || 0) > 0
    if (item.__type === 'projects') return (item.stars_count || 0) > 0
    if (item.__type === 'developers') return (item.followers_count || 0) > 0
    if (item.__type === 'jobs') return (item.applications_count || 0) > 0
    return true
  }

  return true
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
  if (item.__type === 'developers') return `@${item.username} · ${item.followers_count || 0} ${t('search.followers')}`
  if (item.__type === 'jobs') return item.company_name
  if (item.__type === 'projects') return item.tagline
  return item.topic || item.format || ''
}

function resultSummary(item) {
  return item.excerpt || item.summary || item.portfolio_summary || item.bio || ''
}

function resultMeta(item) {
  if (item.__type === 'posts') return [item.user?.name, item.topic].filter(Boolean)
  if (item.__type === 'projects') return [item.user?.name, `${item.stars_count || 0} ${t('saved.stars')}`].filter(Boolean)
  if (item.__type === 'developers') return [item.location || t('search.cambodia'), item.availability].filter(Boolean)
  if (item.__type === 'events') return [item.city, item.format].filter(Boolean)
  if (item.__type === 'jobs') return [item.job_type, item.work_mode].filter(Boolean)
  return []
}

function resultLink(item) {
  if (item.__type === 'developers') return prefixedPath(`/u/${item.username}`)
  if (item.__type === 'jobs') return prefixedPath(`/jobs/${item.slug}`)
  if (item.__type === 'events') return prefixedPath(`/events/${item.id}`)
  if (item.__type === 'projects') return prefixedPath(`/projects/${item.slug}`)
  return prefixedPath(`/feed/${item.id}`)
}

async function submitSearch() {
  await router.push({
    path: route.meta.mobileShell ? '/m/search' : '/search',
    query: { q: query.value, sort: sortBy.value, filter: activeFilter.value },
  })
}

function prefixedPath(path) {
  return route.meta.mobileShell ? `/m${path}` : path
}
</script>
