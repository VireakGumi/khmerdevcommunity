<template>
  <q-page class="q-pa-md q-pb-xl mobile-home-page">
    <div class="content-card q-pa-md mobile-home-hero">
      <div class="section-label">Mobile App</div>
      <div class="text-h6 text-weight-bold q-mt-sm">A faster way to browse, reply, and ship updates</div>
      <div class="text-body2 muted-text q-mt-sm">
        Use the phone shell for quick feed checks, inbox replies, saved items, jobs, and event tracking without the full desktop chrome.
      </div>

      <div class="mobile-home-actions q-mt-md">
        <q-btn color="primary" no-caps icon="edit_square" label="Create post" to="/m/post" />
        <q-btn flat color="secondary" no-caps icon="desktop_windows" label="Open web app" to="/feed" />
      </div>

      <div class="summary-grid q-mt-md">
        <div class="inline-stat">
          <div class="card-meta">Posts</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ home?.stats?.posts || 0 }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Builders</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ home?.stats?.developers || 0 }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Unread</div>
          <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ chat.unreadCount || 0 }}</div>
        </div>
      </div>
    </div>

    <div class="content-card q-pa-md q-mt-md">
      <div class="section-label">Quick Actions</div>
      <div class="text-subtitle2 text-weight-bold q-mt-sm">Everything important is one tap away</div>

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
      <div class="section-label">More Pages</div>
      <div class="text-subtitle2 text-weight-bold q-mt-sm">Open the rest of the platform from the app shell</div>

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
            <div class="section-label">Featured Post</div>
            <div class="text-subtitle2 text-weight-bold q-mt-sm">What the community is talking about now</div>
          </div>
          <q-btn flat no-caps color="primary" label="Open feed" to="/m/feed" />
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
            <div class="section-label">Jobs</div>
            <div class="text-subtitle2 text-weight-bold q-mt-sm">Roles worth checking today</div>
          </div>
          <q-btn flat no-caps color="primary" label="View all" to="/m/jobs" />
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
            <div class="section-label">Events</div>
            <div class="text-subtitle2 text-weight-bold q-mt-sm">Stay on top of community sessions</div>
          </div>
          <q-btn flat no-caps color="primary" label="View all" to="/m/events" />
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
import { useCommunityStore } from 'src/stores/community-store'
import { useChatStore } from 'src/stores/chat-store'
import { formatDate, formatRelative } from 'src/utils/formatters'

const community = useCommunityStore()
const chat = useChatStore()
const loading = ref(true)

const home = computed(() => community.home)
const featuredJobs = computed(() => (home.value?.featuredJobs || []).slice(0, 3))
const featuredEvents = computed(() => (home.value?.featuredEvents || []).slice(0, 3))

const quickActions = [
  { to: '/m/feed', label: 'Feed', hint: 'Check updates quickly', icon: 'rss_feed' },
  { to: '/m/search', label: 'Search', hint: 'Find people and work', icon: 'search' },
  { to: '/m/jobs', label: 'Jobs', hint: 'Track openings', icon: 'work' },
  { to: '/m/events', label: 'Events', hint: 'Browse meetups', icon: 'event' },
  { to: '/m/messages', label: 'Inbox', hint: 'Reply faster', icon: 'mail' },
  { to: '/m/saved', label: 'Saved', hint: 'Open your library', icon: 'bookmark' },
]

const morePages = [
  { to: '/m/projects', label: 'Projects', hint: 'Review launches', icon: 'terminal' },
  { to: '/m/developers', label: 'Builders', hint: 'Browse profiles', icon: 'groups' },
  { to: '/m/notifications', label: 'Alerts', hint: 'Catch updates', icon: 'notifications' },
  { to: '/m/portfolio', label: 'Portfolio', hint: 'Edit your page', icon: 'account_box' },
  { to: '/m/settings', label: 'Settings', hint: 'Tune your account', icon: 'settings' },
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
