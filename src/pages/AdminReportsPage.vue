<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label">Admin</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Reports moderation dashboard</div>
        <div class="text-body2 muted-text q-mt-sm">Review reported posts, jobs, events, projects, and users from one queue.</div>
      </div>
      <div class="page-actions row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            v-model="statusFilter"
            outlined
            dense
            class="input-surface"
            style="min-width: 170px"
            :options="statusOptions"
            emit-value
            map-options
          />
        </div>
        <div class="col-auto">
          <q-select
            v-model="typeFilter"
            outlined
            dense
            class="input-surface"
            style="min-width: 170px"
            :options="typeOptions"
            emit-value
            map-options
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="home-stat-card">
          <span class="portfolio-stat-label">Total Reports</span>
          <strong>{{ summary.total_reports }}</strong>
          <span class="card-meta">all moderation records</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="home-stat-card">
          <span class="portfolio-stat-label">Open</span>
          <strong>{{ summary.open_reports }}</strong>
          <span class="card-meta">needs review</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="home-stat-card">
          <span class="portfolio-stat-label">Resolved</span>
          <strong>{{ summary.resolved_reports }}</strong>
          <span class="card-meta">handled by admin</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="home-stat-card">
          <span class="portfolio-stat-label">Ignored</span>
          <strong>{{ summary.ignored_reports }}</strong>
          <span class="card-meta">dismissed safely</span>
        </div>
      </div>
    </div>

    <div class="content-card q-pa-lg">
      <div class="portfolio-section-head">
        <div>
          <div class="section-label">Queue</div>
          <h2 class="portfolio-section-title">Reported content</h2>
        </div>
        <q-btn flat no-caps color="primary" icon="refresh" label="Refresh" :loading="loading" @click="fetchReports" />
      </div>

      <div v-if="loading" class="q-mt-md">
        <q-skeleton v-for="index in 4" :key="index" type="rect" height="124px" class="q-mb-md" />
      </div>

      <div v-else-if="items.length" class="q-mt-md admin-donation-list">
        <article v-for="item in items" :key="item.id" class="admin-donation-card">
          <div class="admin-donation-card__head">
            <div>
              <div class="mini-card-title">{{ item.reportable_title }}</div>
              <div class="card-meta q-mt-xs">
                {{ item.reportable_label }} reported by {{ item.reporter?.name || 'Unknown reporter' }}
              </div>
            </div>
            <q-chip square dense class="theme-chip" :class="reportStatusClass(item.status)">{{ item.status }}</q-chip>
          </div>

          <div class="admin-donation-card__meta q-mt-md">
            <span>{{ item.reason }}</span>
            <span>{{ formatDate(item.created_at) }}</span>
            <span>#{{ item.id }}</span>
          </div>

          <div v-if="item.details" class="mini-card-copy q-mt-sm">{{ item.details }}</div>

          <div class="admin-donation-card__actions q-mt-md">
            <q-btn flat color="secondary" no-caps label="Open content" :disable="!item.reportable_path" :to="item.reportable_path" />
            <q-btn flat color="warning" no-caps label="Keep open" :loading="updatingId === item.id" @click="updateStatus(item, 'open')" />
            <q-btn flat color="positive" no-caps label="Resolve" :loading="updatingId === item.id" @click="updateStatus(item, 'resolved')" />
            <q-btn flat color="grey-7" no-caps label="Ignore" :loading="updatingId === item.id" @click="updateStatus(item, 'ignored')" />
          </div>
        </article>
      </div>

      <div v-else class="empty-state q-mt-md">
        <div class="mini-card-title">No reports found</div>
        <div class="card-meta q-mt-sm">The moderation queue is clear for the current filter.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const loading = ref(false)
const updatingId = ref(null)
const statusFilter = ref('all')
const typeFilter = ref('all')
const summary = ref({
  total_reports: 0,
  open_reports: 0,
  resolved_reports: 0,
  ignored_reports: 0,
})
const items = ref([])

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Ignored', value: 'ignored' },
]

const typeOptions = [
  { label: 'All types', value: 'all' },
  { label: 'Posts', value: 'post' },
  { label: 'Jobs', value: 'job' },
  { label: 'Events', value: 'event' },
  { label: 'Projects', value: 'project' },
  { label: 'Users', value: 'user' },
]

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function reportStatusClass(status) {
  return `theme-chip-${status === 'resolved' ? 'success' : status === 'ignored' ? 'secondary' : 'warning'}`
}

async function fetchReports() {
  loading.value = true

  try {
    const { data } = await api.get('/admin/reports', {
      params: {
        status: statusFilter.value,
        type: typeFilter.value,
      },
    })

    summary.value = data.summary || summary.value
    items.value = data.items || []
  } finally {
    loading.value = false
  }
}

async function updateStatus(item, status) {
  updatingId.value = item.id

  try {
    await api.patch(`/admin/reports/${item.id}`, { status })
    await fetchReports()
    $q.notify({ type: 'positive', message: `Report marked ${status}` })
  } finally {
    updatingId.value = null
  }
}

watch([statusFilter, typeFilter], fetchReports)
onMounted(fetchReports)
</script>
