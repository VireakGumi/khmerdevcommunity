<template>
  <q-page class="q-pa-md q-pb-xl mobile-home-page">
    <div class="content-card q-pa-md mobile-home-hero">
      <div class="section-label">{{ $t('mobileHome.pageLabel') }}</div>
      <div class="text-h6 text-weight-bold q-mt-sm">{{ $t('mobileHome.pageTitle') }}</div>
      <div class="text-body2 muted-text q-mt-sm">
        {{ $t('mobileHome.pageCopy') }}
      </div>

      <div class="mobile-home-actions q-mt-md">
        <q-btn color="primary" no-caps icon="edit_square" :label="$t('feed.createPost')" to="/m/post" />
        <q-btn flat color="secondary" no-caps icon="desktop_windows" :label="$t('mobileHome.openWebApp')" to="/feed" />
      </div>

      <div class="summary-grid q-mt-md">
        <div class="inline-stat">
          <div class="card-meta">{{ $t('home.posts') }}</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ home?.stats?.posts || 0 }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">{{ $t('nav.builders') }}</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ home?.stats?.developers || 0 }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">{{ $t('messagesPage.unread') }}</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ chat.unreadCount || 0 }}</div>
        </div>
      </div>
    </div>

    <div class="content-card q-pa-md q-mt-md">
      <div class="section-label">{{ $t('mobileHome.quickActions') }}</div>
      <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('mobileHome.quickActionsTitle') }}</div>

      <div class="mobile-home-grid q-mt-md">
        <q-btn
          v-for="item in quickActions"
          :key="item.to"
          flat
          no-caps
          class="mobile-home-action"
          :to="item.to"
        >
          <div class="nav-icon-wrap">
            <q-icon :name="item.icon" />
          </div>
          <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ item.label }}</div>
          <div class="text-caption muted-text q-mt-xs">{{ item.hint }}</div>
        </q-btn>
      </div>
    </div>

    <div class="content-card q-pa-md q-mt-md">
      <div class="section-label">{{ $t('mobileHome.morePages') }}</div>
      <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('mobileHome.morePagesTitle') }}</div>

      <div class="mobile-home-grid q-mt-md">
        <q-btn
          v-for="item in morePages"
          :key="item.to"
          flat
          no-caps
          class="mobile-home-action"
          :to="item.to"
        >
          <div class="nav-icon-wrap">
            <q-icon :name="item.icon" />
          </div>
          <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ item.label }}</div>
          <div class="text-caption muted-text q-mt-xs">{{ item.hint }}</div>
        </q-btn>
      </div>
    </div>

    <div v-if="loading" class="q-mt-md">
      <div v-for="index in 3" :key="`mobile-home-skeleton-${index}`" class="content-card q-pa-md q-mb-sm page-skeleton-panel">
        <q-skeleton type="text" width="28%" />
        <q-skeleton type="text" width="76%" class="q-mt-sm" />
        <q-skeleton type="text" class="q-mt-sm" />
      </div>
    </div>

    <template v-else>
      <div class="content-card q-pa-md q-mt-md">
        <div class="row items-center justify-between">
          <div>
            <div class="section-label">{{ $t('mobileHome.featuredPost') }}</div>
            <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('mobileHome.featuredPostTitle') }}</div>
          </div>
          <q-btn flat no-caps color="primary" :label="$t('home.openFeed')" to="/m/feed" />
        </div>

        <div v-if="home?.featuredPost" class="stack-card q-pa-sm q-mt-md">
          <div class="row items-center justify-between">
            <div class="text-caption muted-text">@{{ home.featuredPost.user?.username }}</div>
            <div class="text-caption muted-text">{{ formatRelative(home.featuredPost.published_at) }}</div>
          </div>
          <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ home.featuredPost.title }}</div>
          <div class="text-body2 muted-text q-mt-sm">{{ home.featuredPost.excerpt }}</div>
        </div>
      </div>

      <div class="content-card q-pa-md q-mt-md">
        <div class="row items-center justify-between">
          <div>
            <div class="section-label">{{ $t('nav.jobs') }}</div>
            <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('mobileHome.jobsTitle') }}</div>
          </div>
          <q-btn flat no-caps color="primary" :label="$t('home.seeAll')" to="/m/jobs" />
        </div>

        <div class="q-mt-md">
          <article v-for="job in featuredJobs" :key="job.id" class="stack-card q-pa-sm q-mb-sm">
            <div class="row items-center justify-between no-wrap">
              <div class="min-w-0">
                <div class="text-subtitle2 text-weight-bold ellipsis">{{ job.title }}</div>
                <div class="text-caption muted-text q-mt-xs">{{ job.company_name }} · {{ job.work_mode }}</div>
              </div>
              <q-btn flat dense round icon="north_east" color="primary" :to="`/m/jobs/${job.slug}`" />
            </div>
          </article>
        </div>
      </div>

      <div class="content-card q-pa-md q-mt-md">
        <div class="row items-center justify-between">
          <div>
            <div class="section-label">{{ $t('nav.events') }}</div>
            <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('mobileHome.eventsTitle') }}</div>
          </div>
          <q-btn flat no-caps color="primary" :label="$t('home.seeAll')" to="/m/events" />
        </div>

        <div class="q-mt-md">
          <article v-for="event in featuredEvents" :key="event.id" class="stack-card q-pa-sm q-mb-sm">
            <div class="row items-center justify-between no-wrap">
              <div class="min-w-0">
                <div class="text-subtitle2 text-weight-bold ellipsis">{{ event.title }}</div>
                <div class="text-caption muted-text q-mt-xs">
                  {{ formatDate(event.starts_at, { month: 'short', day: 'numeric' }) }} · {{ event.city || event.format }}
                </div>
              </div>
              <q-btn flat dense round icon="north_east" color="primary" :to="`/m/events/${event.id}`" />
            </div>
          </article>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCommunityStore } from 'src/stores/community-store'
import { useChatStore } from 'src/stores/chat-store'
import { formatDate, formatRelative } from 'src/utils/formatters'

const community = useCommunityStore()
const chat = useChatStore()
const { t } = useI18n()
const loading = ref(true)

const home = computed(() => community.home)
const featuredJobs = computed(() => (home.value?.featuredJobs || []).slice(0, 3))
const featuredEvents = computed(() => (home.value?.featuredEvents || []).slice(0, 3))

const quickActions = [
  { to: '/m/feed', label: t('nav.feed'), hint: t('mobileHome.quickFeedHint'), icon: 'rss_feed' },
  { to: '/m/search', label: t('nav.search'), hint: t('mobileHome.quickSearchHint'), icon: 'search' },
  { to: '/m/jobs', label: t('nav.jobs'), hint: t('mobileHome.quickJobsHint'), icon: 'work' },
  { to: '/m/events', label: t('nav.events'), hint: t('mobileHome.quickEventsHint'), icon: 'event' },
  { to: '/m/messages', label: t('nav.inbox'), hint: t('mobileHome.quickInboxHint'), icon: 'mail' },
  { to: '/m/saved', label: t('nav.saved'), hint: t('mobileHome.quickSavedHint'), icon: 'bookmark' },
]

const morePages = [
  { to: '/m/projects', label: t('nav.projects'), hint: t('mobileHome.moreProjectsHint'), icon: 'terminal' },
  { to: '/m/developers', label: t('nav.builders'), hint: t('mobileHome.moreBuildersHint'), icon: 'groups' },
  { to: '/m/notifications', label: t('nav.notifications'), hint: t('mobileHome.moreAlertsHint'), icon: 'notifications' },
  { to: '/m/portfolio', label: t('nav.portfolio'), hint: t('mobileHome.morePortfolioHint'), icon: 'account_box' },
  { to: '/m/settings', label: t('nav.settings'), hint: t('mobileHome.moreSettingsHint'), icon: 'settings' },
]

onMounted(async () => {
  loading.value = true

  try {
    await Promise.all([
      community.fetchHome(),
      chat.fetchUnreadCount().catch(() => {}),
    ])
  } finally {
    loading.value = false
  }
})
</script>
