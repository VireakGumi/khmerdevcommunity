<template>
  <q-page padding>
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

onMounted(async () => {
  const { data } = await api.get(`/events/${route.params.id}`)
  event.value = data
})
</script>
