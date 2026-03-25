<template>
  <q-page padding>
    <div class="page-intro q-mb-lg saved-workspace__hero">
      <div>
        <div class="section-label">{{ $t('saved.pageLabel') }}</div>
        <div class="text-h4 text-weight-bold q-mt-sm">{{ $t('saved.pageTitle') }}</div>
        <div class="text-body2 muted-text q-mt-sm">{{ $t('saved.pageCopy') }}</div>
      </div>
      <div class="saved-workspace__hero-actions">
        <q-btn flat no-caps color="secondary" icon="rss_feed" :label="$t('saved.browseFeed')" :to="prefixedPath('/feed')" />
        <q-btn flat no-caps color="secondary" icon="work_outline" :label="$t('saved.browseJobs')" :to="prefixedPath('/jobs')" />
      </div>
    </div>

    <div class="saved-overview q-mb-lg">
      <div class="content-card q-pa-lg saved-overview__summary">
        <div class="saved-overview__summary-copy">
          <div class="mini-card-title">{{ $t('saved.libraryOverview') }}</div>
          <div class="mini-card-copy">{{ $t('saved.libraryOverviewCopy') }}</div>
        </div>
        <div class="saved-overview__stats">
          <div v-for="metric in metrics" :key="metric.label" class="saved-metric">
            <div class="saved-metric__value">{{ metric.value }}</div>
            <div class="saved-metric__label">{{ metric.label }}</div>
          </div>
        </div>
      </div>

      <div class="content-card q-pa-lg saved-overview__focus">
        <div class="saved-section-head">
          <div>
            <div class="mini-card-title">{{ $t('saved.quickAccess') }}</div>
            <div class="mini-card-copy">{{ $t('saved.quickAccessCopy') }}</div>
          </div>
        </div>
        <div v-if="highlightItems.length" class="saved-spotlight">
          <q-btn
            v-for="item in highlightItems"
            :key="savedKey(item)"
            class="saved-spotlight__item"
            flat
            no-caps
            align="left"
            :to="savedLink(item)"
          >
            <div class="saved-spotlight__type">{{ savedTypeLabel(item) }}</div>
            <div class="saved-spotlight__title">{{ savedTitle(item) }}</div>
            <div class="saved-spotlight__meta">{{ savedHighlightMeta(item) }}</div>
          </q-btn>
        </div>
        <div v-else class="mini-card-copy">{{ $t('saved.emptyQuickAccess') }}</div>
      </div>
    </div>

    <div class="content-card q-pa-lg q-mb-lg">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-lg">
          <q-tabs v-model="activeTab" dense no-caps inline-label class="feed-tabs saved-workspace__tabs">
            <q-tab v-for="tab in tabs" :key="tab.value" :name="tab.value" :label="`${tab.label} (${tabCount(tab.value)})`" />
          </q-tabs>
        </div>
        <div class="col-12 col-lg-auto card-meta">
          {{ visibleItems.length }} {{ $t('saved.itemsInView') }}
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
      <div class="text-h6 text-weight-bold">{{ $t('saved.emptyTitle') }}</div>
      <div class="text-body2 muted-text q-mt-sm">{{ $t('saved.emptyCopy') }}</div>
      <div class="q-gutter-sm q-mt-md">
        <q-btn color="primary" no-caps :label="$t('saved.browseFeed')" :to="prefixedPath('/feed')" />
        <q-btn flat color="secondary" no-caps :label="$t('saved.browseJobs')" :to="prefixedPath('/jobs')" />
      </div>
    </div>

    <div v-else-if="activeTab === 'all'" class="saved-library">
      <section v-for="section in groupedSections" :key="section.value" class="saved-library__section">
        <div class="saved-section-head q-mb-md">
          <div>
            <div class="mini-card-title">{{ section.label }}</div>
            <div class="mini-card-copy">{{ section.description }}</div>
          </div>
          <q-chip square :class="['theme-chip', section.tone]">{{ section.items.length }}</q-chip>
        </div>

        <div v-if="section.items.length" class="saved-library__grid">
          <article v-for="item in section.items" :key="savedKey(item)" class="content-card q-pa-lg utility-card saved-card">
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
              <q-btn flat no-caps color="secondary" :label="$t('saved.open')" :to="savedLink(item)" />
              <q-btn
                flat
                no-caps
                color="negative"
                :loading="Boolean(removing[savedKey(item)])"
                :label="$t('saved.remove')"
                @click="removeSaved(item)"
              />
            </div>
          </article>
        </div>

        <div v-else class="content-card q-pa-lg mini-card-copy">
          {{ $t('saved.sectionEmpty', { section: section.label.toLowerCase() }) }}
        </div>
      </section>
    </div>

    <div v-else class="saved-library__grid">
      <article v-for="item in visibleItems" :key="savedKey(item)" class="content-card q-pa-lg utility-card saved-card">
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
          <q-btn flat no-caps color="secondary" :label="$t('saved.open')" :to="savedLink(item)" />
          <q-btn
            flat
            no-caps
            color="negative"
            :loading="Boolean(removing[savedKey(item)])"
            :label="$t('saved.remove')"
            @click="removeSaved(item)"
          />
        </div>
      </article>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCommunityStore } from 'src/stores/community-store'

const $q = useQuasar()
const route = useRoute()
const { t } = useI18n()
const community = useCommunityStore()

const loading = ref(false)
const activeTab = ref('all')
const removing = reactive({})

const tabs = computed(() => [
  { label: t('saved.all'), value: 'all' },
  { label: t('saved.posts'), value: 'posts' },
  { label: t('saved.projects'), value: 'projects' },
  { label: t('saved.events'), value: 'events' },
  { label: t('saved.jobs'), value: 'jobs' },
])

const saved = computed(() => community.saved)
const isMobileShell = computed(() => String(route.name || '').startsWith('mobile-'))

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

const groupedSections = computed(() => [
  {
    label: t('saved.savedPosts'),
    value: 'posts',
    description: t('saved.savedPostsCopy'),
    tone: 'theme-chip-primary',
    items: saved.value.posts.map((item) => ({ ...item, __type: 'posts' })),
  },
  {
    label: t('saved.savedProjects'),
    value: 'projects',
    description: t('saved.savedProjectsCopy'),
    tone: 'theme-chip-secondary',
    items: saved.value.projects.map((item) => ({ ...item, __type: 'projects' })),
  },
  {
    label: t('saved.savedEvents'),
    value: 'events',
    description: t('saved.savedEventsCopy'),
    tone: 'theme-chip-warning',
    items: saved.value.events.map((item) => ({ ...item, __type: 'events' })),
  },
  {
    label: t('saved.savedJobs'),
    value: 'jobs',
    description: t('saved.savedJobsCopy'),
    tone: 'theme-chip-success',
    items: saved.value.jobs.map((item) => ({ ...item, __type: 'jobs' })),
  },
])

const metrics = computed(() => [
  { label: t('saved.totalSaved'), value: allItems.value.length },
  { label: t('saved.posts'), value: saved.value.posts.length },
  { label: t('saved.projects'), value: saved.value.projects.length },
  { label: t('saved.events'), value: saved.value.events.length },
  { label: t('saved.jobs'), value: saved.value.jobs.length },
])

const highlightItems = computed(() => allItems.value.slice(0, 4))

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
  if (item.__type === 'posts') return t('saved.post')
  if (item.__type === 'projects') return t('saved.project')
  if (item.__type === 'events') return t('saved.event')
  return t('saved.job')
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
  if (item.__type === 'projects') return [`${item.stars_count || 0} ${t('saved.stars')}`]
  if (item.__type === 'events') return [item.city, item.format].filter(Boolean)
  if (item.__type === 'jobs') return [item.job_type, item.work_mode].filter(Boolean)
  return []
}

function savedLink(item) {
  if (item.__type === 'jobs') return prefixedPath(`/jobs/${item.slug}`)
  if (item.__type === 'events') return prefixedPath(`/events/${item.id}`)
  if (item.__type === 'projects') return prefixedPath(`/projects/${item.slug}`)
  return prefixedPath(`/feed/${item.id}`)
}

function savedHighlightMeta(item) {
  return [savedTypeLabel(item), savedSubtitle(item) || savedMeta(item)[0] || t('saved.savedForLater')].filter(Boolean).join(' · ')
}

function prefixedPath(path) {
  return isMobileShell.value ? `/m${path}` : path
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
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('saved.removeFailed') })
  } finally {
    removing[key] = false
  }
}
</script>
