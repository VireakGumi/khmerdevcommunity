<template>
  <q-page padding>
    <div v-if="loading" class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div class="content-card q-pa-lg page-skeleton-panel">
          <q-skeleton square height="260px" class="rounded-borders q-mb-lg" />
          <q-skeleton type="text" width="16%" />
          <q-skeleton type="text" width="56%" class="q-mt-sm" />
          <q-skeleton type="text" width="82%" class="q-mt-sm" />
          <div class="row q-col-gutter-sm q-mt-md">
            <div v-for="item in 2" :key="`event-detail-chip-${item}`" class="col-auto">
              <q-skeleton type="QChip" width="88px" />
            </div>
          </div>
          <q-skeleton type="text" class="q-mt-lg" />
          <q-skeleton type="text" class="q-mt-sm" />
          <q-skeleton type="text" width="84%" class="q-mt-xs" />
        </div>
      </div>
      <div class="col-12 col-xl-4">
        <div class="content-card q-pa-lg page-skeleton-panel">
          <q-skeleton type="text" width="34%" />
          <div class="utility-list q-mt-md">
            <div v-for="item in 3" :key="`event-detail-side-${item}`" class="utility-card">
              <q-skeleton type="text" width="34%" />
              <q-skeleton type="text" width="66%" class="q-mt-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!event" class="content-card q-pa-xl utility-empty text-center">
      <div class="text-h6 text-weight-bold">{{ $t('eventDetail.notFoundTitle') }}</div>
      <div class="text-body2 muted-text q-mt-sm">{{ $t('eventDetail.notFoundCopy') }}</div>
      <q-btn class="q-mt-md" color="primary" no-caps :label="$t('eventDetail.backToEvents')" :to="backTarget" />
    </div>

    <template v-else>
      <div class="page-intro q-mb-lg">
        <div>
          <div class="section-label">{{ $t('eventDetail.pageLabel') }}</div>
          <div class="text-h4 text-weight-bold q-mt-sm">{{ event.title }}</div>
          <div class="text-body2 muted-text q-mt-sm">{{ event.summary }}</div>
        </div>
        <div class="page-actions">
          <q-btn flat no-caps color="secondary" icon="arrow_back" :label="$t('eventDetail.back')" :to="backTarget" />
          <q-btn
            v-if="session.isAuthenticated && !event.is_owner"
            flat
            no-caps
            :color="event.is_saved ? 'secondary' : 'grey-5'"
            :icon="event.is_saved ? 'bookmark' : 'bookmark_border'"
            :label="event.is_saved ? $t('feed.saved') : $t('eventDetail.saveEvent')"
            @click="toggleBookmark"
          />
          <q-btn
            v-if="session.isAuthenticated && !event.is_owner"
            color="primary"
            no-caps
            :label="event.response_status === 'attending' ? $t('eventDetail.attending') : $t('eventDetail.attend')"
            @click="respond('attending')"
          />
          <q-btn
            v-if="session.isAuthenticated && !event.is_owner"
            flat
            no-caps
            color="secondary"
            :label="event.response_status === 'interested' ? $t('eventDetail.interested') : $t('eventDetail.interestedQuestion')"
            @click="respond('interested')"
          />
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-xl-8">
          <div class="content-card q-pa-lg">
            <q-img v-if="event.thumbnail_url" :src="event.thumbnail_url" ratio="2.1" class="rounded-borders q-mb-lg" />

            <div class="q-gutter-sm">
              <q-chip square class="theme-chip theme-chip-primary">{{ event.format }}</q-chip>
              <q-chip square class="theme-chip theme-chip-secondary">{{ event.status }}</q-chip>
              <q-chip v-if="event.workshop_type" square class="theme-chip theme-chip-warning">{{ event.workshop_type }}</q-chip>
            </div>

            <div class="text-body1 q-mt-lg">{{ event.details }}</div>

            <div class="summary-grid q-mt-lg">
              <div class="inline-stat">
                <div class="card-meta">{{ $t('eventDetail.interested') }}</div>
                <div class="text-h6 text-weight-bold q-mt-xs">{{ event.interested_count || 0 }}</div>
              </div>
              <div class="inline-stat">
                <div class="card-meta">{{ $t('eventDetail.attending') }}</div>
                <div class="text-h6 text-weight-bold q-mt-xs">{{ event.attendee_count || 0 }}</div>
              </div>
              <div class="inline-stat">
                <div class="card-meta">{{ $t('eventDetail.capacity') }}</div>
                <div class="text-h6 text-weight-bold q-mt-xs">{{ event.capacity || $t('eventDetail.open') }}</div>
              </div>
            </div>

            <div v-if="event.is_owner" class="stack-card q-pa-md q-mt-lg">
              <div class="section-label">{{ $t('eventDetail.hostDashboard') }}</div>
              <div class="mini-card-copy q-mt-sm">{{ $t('eventDetail.hostDashboardCopy') }}</div>
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-md-4">
                  <div class="employer-pipeline__item">
                    <div>
                      <div class="mini-card-title">Interested</div>
                      <div class="card-meta">Warm leads for the event</div>
                    </div>
                    <q-chip square dense class="theme-chip theme-chip-secondary">{{ interestedResponses.length }}</q-chip>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="employer-pipeline__item">
                    <div>
                      <div class="mini-card-title">Attending</div>
                      <div class="card-meta">Confirmed participants</div>
                    </div>
                    <q-chip square dense class="theme-chip theme-chip-primary">{{ attendingResponses.length }}</q-chip>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="employer-pipeline__item">
                    <div>
                      <div class="mini-card-title">Remaining spots</div>
                      <div class="card-meta">Capacity still available</div>
                    </div>
                    <q-chip square dense class="theme-chip theme-chip-success">{{ remainingCapacity }}</q-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
          <div class="content-card q-pa-lg">
            <div class="section-label">Event Details</div>
            <div class="utility-list q-mt-md">
              <div class="utility-card">
                <div class="mini-card-title">When</div>
                <div class="mini-card-copy">{{ formatDate(event.starts_at, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</div>
                <div class="card-meta q-mt-xs">Ends {{ formatDate(event.ends_at, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</div>
              </div>
              <div class="utility-card">
                <div class="mini-card-title">Where</div>
                <div class="mini-card-copy">{{ event.city || 'TBA' }} · {{ event.venue || 'Venue not listed yet' }}</div>
              </div>
              <div class="utility-card">
                <div class="mini-card-title">Organizer</div>
                <div class="mini-card-copy">{{ event.organizer_name || event.host?.name }}</div>
                <q-btn v-if="event.host?.username" class="q-mt-sm" flat no-caps color="primary" label="Open profile" :to="profileTarget" />
              </div>
            </div>
          </div>

          <div v-if="event.registration_url" class="content-card q-pa-lg q-mt-md">
            <div class="section-label">Registration</div>
            <div class="mini-card-copy q-mt-sm">Use the event registration link for structured sign-up outside the community app.</div>
            <q-btn class="q-mt-md" color="primary" no-caps icon="open_in_new" label="Open registration" :href="event.registration_url" target="_blank" />
          </div>

          <div v-if="event.is_owner" class="content-card q-pa-lg q-mt-md">
            <div class="section-label">Owner Controls</div>
            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-auto">
                <q-btn color="primary" no-caps icon="edit" label="Edit event" @click="openEditDialog" />
              </div>
              <div class="col-auto">
                <q-btn flat no-caps color="warning" icon="event_busy" label="Cancel event" @click="quickStatus('cancelled')" />
              </div>
              <div class="col-auto">
                <q-btn flat no-caps color="secondary" icon="task_alt" label="Mark ended" @click="quickStatus('ended')" />
              </div>
              <div class="col-auto">
                <q-btn flat no-caps color="negative" icon="delete" label="Delete" @click="deleteEvent" />
              </div>
            </div>
          </div>

          <div v-if="event.is_owner && event.responses?.length" class="content-card q-pa-lg q-mt-md">
            <div class="section-label">Host Queue</div>
            <div class="employer-applicant-list q-mt-md">
              <article v-for="response in event.responses" :key="response.id" class="utility-card employer-applicant-card">
                <div class="row items-center justify-between q-col-gutter-sm">
                  <div class="col">
                    <div class="mini-card-title">{{ response.user?.name }}</div>
                    <div class="card-meta q-mt-xs">@{{ response.user?.username || 'builder' }} · {{ response.status }}</div>
                    <div v-if="response.user?.headline" class="mini-card-copy q-mt-sm">{{ response.user.headline }}</div>
                  </div>
                  <div class="col-auto">
                    <q-chip square dense :class="['theme-chip', response.status === 'attending' ? 'theme-chip-success' : 'theme-chip-secondary']">
                      {{ response.status }}
                    </q-chip>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </template>

    <q-dialog v-model="editDialog">
      <q-card class="theme-dialog" style="width: 760px; max-width: 94vw">
        <q-card-section>
          <div class="section-label">Edit Event</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Update host details and public event info</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="editForm.title" outlined class="input-surface" label="Title" />
          <q-input v-model="editForm.summary" outlined class="input-surface" label="Summary" />
          <q-input v-model="editForm.details" outlined class="input-surface" type="textarea" autogrow label="Details" />
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select v-model="editForm.format" outlined emit-value map-options class="input-surface" label="Format" :options="formatOptions" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="editForm.status" outlined emit-value map-options class="input-surface" label="Status" :options="statusOptions" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model.number="editForm.capacity" outlined type="number" class="input-surface" label="Capacity" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="editForm.city" outlined class="input-surface" label="City" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="editForm.venue" outlined class="input-surface" label="Venue" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="editForm.organizer_name" outlined class="input-surface" label="Organizer name" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="editForm.registration_url" outlined class="input-surface" label="Registration URL" />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="editForm.starts_at" outlined class="input-surface" type="datetime-local" label="Starts at" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="editForm.ends_at" outlined class="input-surface" type="datetime-local" label="Ends at" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps color="secondary" label="Cancel" v-close-popup />
          <q-btn color="primary" no-caps label="Save event" :loading="saving" @click="saveEvent" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'
import { formatDate } from 'src/utils/formatters'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const community = useCommunityStore()
const session = useSessionStore()

const event = ref(null)
const loading = ref(false)
const saving = ref(false)
const editDialog = ref(false)
const editForm = reactive({
  title: '',
  summary: '',
  details: '',
  format: 'Online',
  status: 'upcoming',
  venue: '',
  city: '',
  starts_at: '',
  ends_at: '',
  capacity: 100,
  registration_url: '',
  organizer_name: '',
})

const formatOptions = [
  { label: 'Online', value: 'Online' },
  { label: 'Onsite', value: 'Onsite' },
  { label: 'Hybrid', value: 'Hybrid' },
]

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Ended', value: 'ended' },
  { label: 'Cancelled', value: 'cancelled' },
]

const isMobileShell = computed(() => route.meta.mobileShell)
const backTarget = computed(() => (isMobileShell.value ? '/m/events' : '/events'))
const profileTarget = computed(() => {
  const username = event.value?.host?.username
  if (!username) return backTarget.value
  return isMobileShell.value ? `/m/u/${username}` : `/u/${username}`
})
const interestedResponses = computed(() => (event.value?.responses || []).filter((item) => item.status === 'interested'))
const attendingResponses = computed(() => (event.value?.responses || []).filter((item) => item.status === 'attending'))
const remainingCapacity = computed(() => {
  const capacity = Number(event.value?.capacity || 0)
  if (!capacity) return t('eventDetail.open')
  return Math.max(0, capacity - attendingResponses.value.length)
})

function toLocalDateTimeValue(value) {
  if (!value) return ''
  const date = new Date(value)
  const pad = (item) => String(item).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function loadEvent() {
  loading.value = true
  try {
    event.value = await community.fetchEvent(route.params.id)
  } catch (error) {
    event.value = null
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('eventDetail.loadFailed') })
  } finally {
    loading.value = false
  }
}

async function respond(status) {
  if (!event.value) return

  try {
    const data = await community.respondToEvent(event.value.id, status)
    event.value = {
      ...event.value,
      response_status: data.status,
      interested_count: data.interested_count,
      attendee_count: data.attendee_count,
    }
    $q.notify({ type: 'positive', message: t('eventDetail.markedAs', { status }) })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('eventDetail.respondFailed') })
  }
}

async function toggleBookmark() {
  if (!event.value) return

  try {
    await community.toggleEventBookmark(event.value.id)
    event.value = {
      ...event.value,
      is_saved: !event.value.is_saved,
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('eventDetail.saveFailed') })
  }
}

function openEditDialog() {
  if (!event.value) return

  Object.assign(editForm, {
    title: event.value.title || '',
    summary: event.value.summary || '',
    details: event.value.details || '',
    format: event.value.format || 'Online',
    status: event.value.status || 'upcoming',
    venue: event.value.venue || '',
    city: event.value.city || '',
    starts_at: toLocalDateTimeValue(event.value.starts_at),
    ends_at: toLocalDateTimeValue(event.value.ends_at),
    capacity: event.value.capacity || 100,
    registration_url: event.value.registration_url || '',
    organizer_name: event.value.organizer_name || '',
  })
  editDialog.value = true
}

async function saveEvent() {
  if (!event.value) return

  saving.value = true
  try {
    const updated = await community.updateEvent(event.value.id, editForm)
    event.value = {
      ...event.value,
      ...updated,
      responses: event.value.responses || [],
    }
    editDialog.value = false
    $q.notify({ type: 'positive', message: t('eventDetail.updated') })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('eventDetail.updateFailed') })
  } finally {
    saving.value = false
  }
}

function quickStatus(status) {
  if (!event.value) return

  $q.dialog({
    title: `Mark event ${status}?`,
    message: 'This updates the public event status immediately.',
    cancel: true,
    persistent: true,
    ok: { color: status === 'cancelled' ? 'warning' : 'primary', label: 'Confirm', noCaps: true },
    cancelLabel: 'Cancel',
  }).onOk(async () => {
    try {
      const updated = await community.updateEvent(event.value.id, {
        title: event.value.title,
        summary: event.value.summary,
        details: event.value.details,
        format: event.value.format,
        status,
        venue: event.value.venue,
        city: event.value.city,
        starts_at: toLocalDateTimeValue(event.value.starts_at),
        ends_at: toLocalDateTimeValue(event.value.ends_at),
        capacity: event.value.capacity,
        registration_url: event.value.registration_url,
        organizer_name: event.value.organizer_name,
      })
      event.value = {
        ...event.value,
        ...updated,
      }
      $q.notify({ type: 'positive', message: `Event marked ${status}` })
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to update event status' })
    }
  })
}

function deleteEvent() {
  if (!event.value) return

  $q.dialog({
    title: 'Delete event?',
    message: 'This will remove the event from the directory.',
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete', noCaps: true },
    cancelLabel: 'Cancel',
  }).onOk(async () => {
    try {
      await community.deleteEvent(event.value.id)
      $q.notify({ type: 'positive', message: 'Event deleted' })
      router.push(backTarget.value)
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to delete event' })
    }
  })
}

onMounted(loadEvent)
watch(() => route.params.id, loadEvent)
</script>
