<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label">Admin</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Donation review dashboard</div>
        <div class="text-body2 muted-text q-mt-sm">Review donation confirmations, track totals, and update verification status.</div>
      </div>
      <div class="page-actions">
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
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="home-stat-card">
          <span class="portfolio-stat-label">Submissions</span>
          <strong>{{ summary.total_submissions }}</strong>
          <span class="card-meta">all donation records</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="home-stat-card">
          <span class="portfolio-stat-label">Pending</span>
          <strong>{{ summary.pending_reviews }}</strong>
          <span class="card-meta">needs review</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="home-stat-card">
          <span class="portfolio-stat-label">Approved</span>
          <strong>{{ summary.approved }}</strong>
          <span class="card-meta">verified support</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="home-stat-card">
          <span class="portfolio-stat-label">Approved Amount</span>
          <strong>\${{ formatAmount(summary.approved_amount) }}</strong>
          <span class="card-meta">confirmed total</span>
        </div>
      </div>
    </div>

    <div class="content-card q-pa-lg">
      <div class="portfolio-section-head">
        <div>
          <div class="section-label">Queue</div>
          <h2 class="portfolio-section-title">Donation submissions</h2>
        </div>
        <q-btn flat no-caps color="primary" icon="refresh" label="Refresh" :loading="loading" @click="fetchDashboard" />
      </div>

      <div v-if="loading" class="q-mt-md">
        <q-skeleton v-for="index in 4" :key="index" type="rect" height="112px" class="q-mb-md" />
      </div>

      <div v-else-if="items.length" class="q-mt-md admin-donation-list">
        <article v-for="item in items" :key="item.id" class="admin-donation-card">
          <div class="admin-donation-card__head">
            <div>
              <div class="mini-card-title">
                {{ item.donor_name || item.user?.name || 'Anonymous supporter' }}
              </div>
              <div class="card-meta q-mt-xs">
                {{ item.donor_email || item.user?.email || 'No email provided' }}
              </div>
            </div>
            <q-chip square dense class="theme-chip" :class="statusClass(item.status)">{{ item.status }}</q-chip>
          </div>

          <div class="admin-donation-card__meta q-mt-md">
            <span>\${{ formatAmount(item.amount) }} {{ item.currency }}</span>
            <span>{{ item.channel }}</span>
            <span>{{ formatDate(item.created_at) }}</span>
          </div>

          <div v-if="item.transfer_reference" class="card-meta q-mt-sm">Reference: {{ item.transfer_reference }}</div>
          <div v-if="item.note" class="mini-card-copy q-mt-sm">{{ item.note }}</div>

          <div class="admin-donation-card__actions q-mt-md">
            <q-btn
              flat
              color="secondary"
              no-caps
              label="View proof"
              :disable="!item.proof_image_url"
              @click="openProof(item.proof_image_url)"
            />
            <q-btn flat color="warning" no-caps label="Pending" :loading="updatingId === item.id" @click="updateStatus(item, 'pending')" />
            <q-btn flat color="positive" no-caps label="Approve" :loading="updatingId === item.id" @click="updateStatus(item, 'approved')" />
            <q-btn flat color="negative" no-caps label="Reject" :loading="updatingId === item.id" @click="updateStatus(item, 'rejected')" />
          </div>
        </article>
      </div>

      <div v-else class="empty-state q-mt-md">
        <div class="mini-card-title">No donation submissions yet</div>
        <div class="card-meta q-mt-sm">When supporters submit KHQR confirmations, they will appear here.</div>
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
const summary = ref({
  total_submissions: 0,
  pending_reviews: 0,
  approved: 0,
  rejected: 0,
  approved_amount: 0,
})
const items = ref([])

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Submitted', value: 'confirmation_submitted' },
]

function formatAmount(value) {
  return Number(value || 0).toFixed(2)
}

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function statusClass(status) {
  return `theme-chip-${status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'}`
}

function openProof(url) {
  if (url) {
    window.open(url, '_blank', 'noopener')
  }
}

async function fetchDashboard() {
  loading.value = true

  try {
    const { data } = await api.get('/admin/donations', {
      params: {
        status: statusFilter.value,
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
    await api.patch(`/admin/donations/${item.id}`, { status })
    await fetchDashboard()
    $q.notify({ type: 'positive', message: `Donation marked ${status}` })
  } finally {
    updatingId.value = null
  }
}

watch(statusFilter, fetchDashboard)
onMounted(fetchDashboard)
</script>
