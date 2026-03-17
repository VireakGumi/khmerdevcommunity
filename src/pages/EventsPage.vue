<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label">Events</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Sessions, meetups, and launches that keep the community moving</div>
        <div class="text-body2 muted-text q-mt-sm">Browse upcoming gatherings with clearer filters, faster RSVP actions, and a calmer card rhythm.</div>
      </div>
      <div class="page-actions">
        <q-btn color="primary" no-caps icon="event_available" label="Create event" :disable="!session.isAuthenticated" @click="eventDialog = true" />
      </div>
    </div>

    <div class="content-card q-pa-lg q-mb-lg events-stage-card">
      <div class="row q-col-gutter-md items-start">
        <div class="col-12 col-lg-8">
          <q-tabs v-model="activeFilter" dense no-caps inline-label class="feed-tabs events-filter-tabs">
            <q-tab v-for="tab in filterTabs" :key="tab.value" :name="tab.value" :label="tab.label" />
          </q-tabs>
          <div class="text-body2 muted-text q-mt-md">Showing {{ visibleEvents.length }} of {{ filteredEvents.length }} events</div>
        </div>
        <div class="col-12 col-lg-4">
          <q-input
            v-model="searchTerm"
            outlined
            dense
            class="input-surface"
            label="Search events"
            placeholder="Meetup, launch, workshop..."
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
      </div>

      <div class="summary-grid q-mt-lg">
        <div class="inline-stat">
          <div class="card-meta">Upcoming</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ upcomingCount }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Online</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ onlineCount }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Cities</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ cityCount }}</div>
        </div>
      </div>
    </div>

    <div v-if="loading && !events.length" class="events-skeleton-stack">
      <div v-for="index in 3" :key="`event-skeleton-${index}`" class="content-card q-pa-lg event-card">
        <div class="row q-col-gutter-lg">
          <div class="col-auto"><q-skeleton type="rect" width="112px" height="112px" class="rounded-borders" /></div>
          <div class="col-auto"><q-skeleton type="rect" width="92px" height="112px" class="rounded-borders" /></div>
          <div class="col">
            <q-skeleton type="text" width="34%" />
            <q-skeleton type="text" width="72%" class="q-mt-sm" />
            <q-skeleton type="text" class="q-mt-sm" />
            <q-skeleton type="text" width="88%" class="q-mt-xs" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!filteredEvents.length" class="content-card q-pa-xl utility-empty events-empty-state">
      <div class="text-h6 text-weight-bold">No events match this view</div>
      <div class="text-body2 muted-text q-mt-sm">Try a different filter or clear your search to browse the full calendar.</div>
    </div>

    <template v-else>
      <div class="column q-gutter-md">
        <transition-group name="feed-stack" tag="div" class="events-list">
          <div v-for="event in visibleEvents" :key="event.id" class="content-card q-pa-lg event-card">
            <div class="event-card__top">
              <div v-if="event.thumbnail_url" class="event-card__thumb">
                <q-img :src="event.thumbnail_url" ratio="1" loading="lazy" class="rounded-borders" />
              </div>
              <div v-else class="event-card__thumb event-card__thumb--placeholder">
                <q-icon name="event" size="32px" color="primary" />
              </div>

              <div class="event-card__date">
                <span class="event-card__month">{{ formatDate(event.starts_at, { month: 'short' }) }}</span>
                <strong>{{ formatDate(event.starts_at, { day: 'numeric' }) }}</strong>
                <span>{{ formatDate(event.starts_at, { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>

              <div class="event-card__content">
                <div class="row q-gutter-sm">
                  <q-chip square class="theme-chip theme-chip-secondary">{{ event.format }}</q-chip>
                  <q-chip v-if="event.is_featured" square class="theme-chip theme-chip-primary">Featured</q-chip>
                  <q-chip square class="theme-chip">{{ prettyStatus(event.status) }}</q-chip>
                  <q-chip v-if="countdownLabel(event)" square class="theme-chip theme-chip-warning">{{ countdownLabel(event) }}</q-chip>
                </div>

                <div class="card-title q-mt-sm">{{ event.title }}</div>
                <div class="text-body2 muted-text q-mt-sm">{{ event.summary || event.details }}</div>

                <div class="events-meta-grid q-mt-md">
                  <div class="event-card__meta-item">
                    <q-icon name="location_on" size="16px" />
                    <span>{{ event.city || 'Cambodia' }} � {{ event.venue || 'Venue TBA' }}</span>
                  </div>
                  <div class="event-card__meta-item">
                    <q-icon name="person" size="16px" />
                    <span>Hosted by {{ event.host?.name || 'Community team' }}</span>
                  </div>
                  <div class="event-card__meta-item">
                    <q-icon name="groups" size="16px" />
                    <span>{{ event.attendee_count || 0 }}/{{ event.capacity || '8' }} attending</span>
                  </div>
                  <div class="event-card__meta-item">
                    <q-icon name="favorite" size="16px" />
                    <span>{{ event.interested_count || 0 }} interested</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-divider q-mt-lg q-mb-md" />

            <div class="event-card__actions">
              <div class="card-meta">{{ event.registration_url ? 'Registration link available' : 'Join directly from the platform' }}</div>
              <div class="event-card__cta">
                <q-btn
                  color="primary"
                  no-caps
                  icon="event_available"
                  :label="event.response_status === 'attending' ? 'Attending' : 'RSVP'"
                  :loading="Boolean(rsvpLoading[event.id]) && rsvpStatus[event.id] === 'attending'"
                  @click="respond(event.id, 'attending')"
                />
                <q-btn
                  flat
                  no-caps
                  color="grey-5"
                  icon="favorite_border"
                  :label="event.response_status === 'interested' ? 'Interested' : 'Interested'"
                  :loading="Boolean(rsvpLoading[event.id]) && rsvpStatus[event.id] === 'interested'"
                  @click="respond(event.id, 'interested')"
                />
                <q-btn
                  flat
                  no-caps
                  :color="event.is_saved ? 'secondary' : 'grey-5'"
                  icon="bookmark_add"
                  :label="event.is_saved ? 'Saved' : 'Track'"
                  :loading="Boolean(bookmarkLoading[event.id])"
                  @click="toggleBookmark(event.id)"
                />
                <q-btn flat no-caps color="grey-5" icon="calendar_month" label="Add to calendar" @click="addToCalendar(event)" />
                <q-btn flat no-caps color="secondary" icon="open_in_new" label="View event" :to="`/events/${event.id}`" />
              </div>
            </div>
          </div>
        </transition-group>
      </div>

      <div class="text-center q-mt-lg events-pagination">
        <q-btn
          v-if="hasMoreEvents"
          outline
          color="primary"
          no-caps
          label="Load more events"
          :loading="loadingMore"
          @click="loadMore"
        />
        <div v-else class="card-meta">No more events in this view</div>
      </div>
    </template>

    <q-dialog v-model="eventDialog">
      <q-card class="theme-dialog" style="width: 720px; max-width: 92vw">
        <q-card-section>
          <div class="section-label">Event</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Publish a meetup, session, or launch</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="eventForm.title" outlined class="input-surface" label="Title" />
          <q-input v-model="eventForm.summary" outlined class="input-surface" label="Summary" />
          <q-input v-model="eventForm.details" outlined type="textarea" autogrow class="input-surface" label="Details" />
          <div class="row q-col-gutter-md q-mt-xs q-ml-xs">
            <div class="col-12 col-md-4"><q-select v-model="eventForm.format" outlined emit-value map-options class="input-surface" label="Format" :options="formats" /></div>
            <div class="col-12 col-md-4"><q-input v-model="eventForm.city" outlined class="input-surface" label="City" /></div>
            <div class="col-12 col-md-4"><q-input v-model="eventForm.venue" outlined class="input-surface" label="Venue" /></div>
          </div>
          <div class="row q-col-gutter-md q-mt-xs q-ml-xs">
            <div class="col-12 col-md-6"><q-input v-model="eventForm.starts_at" outlined type="datetime-local" class="input-surface" label="Starts at" /></div>
            <div class="col-12 col-md-6"><q-input v-model="eventForm.ends_at" outlined type="datetime-local" class="input-surface" label="Ends at" /></div>
          </div>
          <q-input v-model="eventForm.registration_url" outlined class="input-surface" label="Registration URL" />
          <q-file v-model="eventForm.thumbnail" outlined class="input-surface" label="Thumbnail" accept=".jpg,.jpeg,.png,.webp" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps color="secondary" label="Cancel" v-close-popup />
          <q-btn color="primary" no-caps label="Publish event" :loading="publishing" @click="publishEvent" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'
import { formatDate } from 'src/utils/formatters'

const $q = useQuasar()
const community = useCommunityStore()
const session = useSessionStore()

const events = computed(() => community.events)
const cityCount = computed(() => new Set(events.value.map((event) => event.city).filter(Boolean)).size)
const upcomingCount = computed(() => events.value.filter((event) => isUpcoming(event)).length)
const onlineCount = computed(() => events.value.filter((event) => (event.format || '').toLowerCase() === 'online').length)

const eventDialog = ref(false)
const publishing = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const activeFilter = ref('all')
const visibleCount = ref(4)
const searchTerm = ref('')
const bookmarkLoading = reactive({})
const rsvpLoading = reactive({})
const rsvpStatus = reactive({})

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Online', value: 'online' },
  { label: 'Onsite', value: 'onsite' },
  { label: 'Past', value: 'past' },
]

const eventForm = reactive({
  title: '',
  summary: '',
  details: '',
  format: 'Online',
  city: '',
  venue: '',
  starts_at: '',
  ends_at: '',
  registration_url: '',
  thumbnail: null,
})

const formats = ['Online', 'Onsite', 'Hybrid'].map((value) => ({ label: value, value }))

const filteredEvents = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return events.value.filter((event) => {
    const format = (event.format || '').toLowerCase()
    const title = `${event.title} ${event.summary || ''} ${event.city || ''}`.toLowerCase()

    const filterMatch = (() => {
      if (activeFilter.value === 'online') return format === 'online'
      if (activeFilter.value === 'onsite') return format === 'onsite'
      if (activeFilter.value === 'upcoming') return isUpcoming(event)
      if (activeFilter.value === 'past') return isPast(event)
      return true
    })()

    return filterMatch && (!term || title.includes(term))
  })
})

const visibleEvents = computed(() => filteredEvents.value.slice(0, visibleCount.value))
const hasMoreEvents = computed(() => visibleEvents.value.length < filteredEvents.value.length)

onMounted(async () => {
  if (!community.events.length) {
    loading.value = true
    try {
      await community.fetchEvents()
    } finally {
      loading.value = false
    }
  }
})

function isUpcoming(event) {
  return new Date(event.starts_at).getTime() > Date.now()
}

function isPast(event) {
  const endsAt = event.ends_at ? new Date(event.ends_at).getTime() : new Date(event.starts_at).getTime()
  return endsAt < Date.now()
}

function prettyStatus(value) {
  return (value || 'scheduled').replace('_', ' ')
}

function countdownLabel(event) {
  if (!event?.starts_at) return ''

  const startsAt = new Date(event.starts_at)
  const diff = startsAt.getTime() - Date.now()

  if (Number.isNaN(startsAt.getTime()) || diff <= 0) {
    return event.status === 'ongoing' ? 'Live now' : ''
  }

  const totalHours = Math.floor(diff / 3600000)
  const totalDays = Math.floor(totalHours / 24)

  if (totalDays > 0) return `Starts in ${totalDays}d`
  if (totalHours > 0) return `Starts in ${totalHours}h`

  const totalMinutes = Math.max(1, Math.floor(diff / 60000))
  return `Starts in ${totalMinutes}m`
}

function loadMore() {
  if (loadingMore.value || !hasMoreEvents.value) return
  loadingMore.value = true
  window.setTimeout(() => {
    visibleCount.value += 4
    loadingMore.value = false
  }, 180)
}

async function respond(eventId, status) {
  if (rsvpLoading[eventId]) return
  rsvpLoading[eventId] = true
  rsvpStatus[eventId] = status

  try {
    await community.respondToEvent(eventId, status)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to update RSVP' })
  } finally {
    rsvpLoading[eventId] = false
  }
}

async function toggleBookmark(eventId) {
  if (bookmarkLoading[eventId]) return
  bookmarkLoading[eventId] = true

  try {
    await community.toggleEventBookmark(eventId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save event' })
  } finally {
    bookmarkLoading[eventId] = false
  }
}

function addToCalendar(event) {
  const startsAt = event.starts_at ? new Date(event.starts_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : ''
  const endsAt = event.ends_at ? new Date(event.ends_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : startsAt
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startsAt}/${endsAt}&details=${encodeURIComponent(event.summary || event.details || '')}&location=${encodeURIComponent(`${event.city || ''} ${event.venue || ''}`.trim())}`
  window.open(url, '_blank', 'noopener')
}

async function publishEvent() {
  publishing.value = true

  try {
    await community.createEvent({ ...eventForm, publish: true })
    eventDialog.value = false
    Object.assign(eventForm, {
      title: '',
      summary: '',
      details: '',
      format: 'Online',
      city: '',
      venue: '',
      starts_at: '',
      ends_at: '',
      registration_url: '',
      thumbnail: null,
    })
    $q.notify({ type: 'positive', message: 'Event published' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to publish event' })
  } finally {
    publishing.value = false
  }
}
</script>

