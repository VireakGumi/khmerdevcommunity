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

    <div v-if="event" class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div class="content-card q-pa-lg">
          <q-img v-if="event.thumbnail_url" :src="event.thumbnail_url" ratio="2.1" class="rounded-borders q-mb-lg" />
          <div class="section-label">Event</div>
          <div class="text-h4 text-weight-bold q-mt-sm">{{ event.title }}</div>
          <div class="text-body2 muted-text q-mt-sm">{{ event.summary }}</div>

          <div class="q-gutter-sm q-mt-md">
            <q-chip square class="theme-chip theme-chip-primary">{{ event.format }}</q-chip>
            <q-chip square class="theme-chip theme-chip-secondary">{{ event.status }}</q-chip>
          </div>

          <div class="text-body1 q-mt-lg">{{ event.details }}</div>
        </div>
      </div>

      <div class="col-12 col-xl-4">
        <div class="content-card q-pa-lg">
          <div class="section-label">Event Details</div>
          <div class="utility-list q-mt-md">
            <div class="utility-card">
              <div class="mini-card-title">When</div>
              <div class="mini-card-copy">{{ formatDate(event.starts_at, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</div>
            </div>
            <div class="utility-card">
              <div class="mini-card-title">Where</div>
              <div class="mini-card-copy">{{ event.city }} • {{ event.venue }}</div>
            </div>
            <div class="utility-card">
              <div class="mini-card-title">Organizer</div>
              <div class="mini-card-copy">{{ event.organizer_name || event.host?.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { formatDate } from 'src/utils/formatters'

const route = useRoute()
const event = ref(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get(`/events/${route.params.id}`)
    event.value = data
  } finally {
    loading.value = false
  }
})
</script>
