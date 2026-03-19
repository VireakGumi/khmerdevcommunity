<template>
  <q-page padding>
    <div v-if="loading" class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div class="content-card q-pa-lg page-skeleton-panel">
          <div class="row items-start justify-between q-col-gutter-md">
            <div class="col">
              <div class="row items-center q-gutter-md">
                <q-skeleton type="QAvatar" size="64px" />
                <div class="col">
                  <q-skeleton type="text" width="28%" />
                  <q-skeleton type="text" width="52%" class="q-mt-sm" />
                  <q-skeleton type="text" width="38%" class="q-mt-sm" />
                </div>
              </div>
              <div class="row q-col-gutter-sm q-mt-md">
                <div v-for="item in 3" :key="`job-detail-chip-${item}`" class="col-auto">
                  <q-skeleton type="QChip" width="84px" />
                </div>
              </div>
            </div>
            <div class="col-auto column q-gutter-sm">
              <q-skeleton type="rect" width="112px" height="40px" />
              <q-skeleton type="rect" width="112px" height="40px" />
            </div>
          </div>
          <q-skeleton type="text" class="q-mt-lg" />
          <q-skeleton type="text" class="q-mt-sm" />
          <q-skeleton type="text" width="84%" class="q-mt-xs" />
        </div>
      </div>
      <div class="col-12 col-xl-4">
        <div class="content-card q-pa-lg page-skeleton-panel">
          <q-skeleton type="text" width="26%" />
          <div class="utility-list q-mt-md">
            <div v-for="item in 3" :key="`job-detail-side-${item}`" class="utility-card">
              <q-skeleton type="text" width="34%" />
              <q-skeleton type="text" width="64%" class="q-mt-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="job" class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div class="content-card q-pa-lg">
          <div class="row items-start justify-between q-col-gutter-md">
            <div class="col">
              <div class="row items-center q-gutter-md">
                <q-avatar size="64px" color="primary" text-color="white">
                  <img v-if="job.company_logo_url" :src="job.company_logo_url" :alt="job.company_name" />
                  <span v-else>{{ job.company_name?.charAt(0) || 'J' }}</span>
                </q-avatar>
                <div>
                  <div class="section-label">Job Listing</div>
                  <div class="text-h4 text-weight-bold q-mt-xs">{{ job.title }}</div>
                  <div class="text-body2 muted-text q-mt-sm">{{ job.company_name }} • {{ job.location || 'Remote-friendly' }}</div>
                </div>
              </div>

              <div class="q-gutter-sm q-mt-md">
                <q-chip square class="theme-chip theme-chip-primary">{{ job.job_type }}</q-chip>
                <q-chip square class="theme-chip theme-chip-secondary">{{ job.work_mode }}</q-chip>
                <q-chip square class="theme-chip">{{ job.experience_level }}</q-chip>
              </div>
            </div>

            <div class="col-auto column q-gutter-sm">
              <q-btn color="primary" no-caps label="Apply" :disable="job.is_applied || !session.isAuthenticated" @click="apply" />
              <q-btn flat no-caps :label="job.is_saved ? 'Saved' : 'Save job'" @click="saveJob" />
            </div>
          </div>

          <div class="text-body1 q-mt-lg">{{ job.description }}</div>

          <div v-if="job.tech_stack?.length" class="q-gutter-sm q-mt-lg">
            <q-chip v-for="stack in job.tech_stack" :key="stack" square class="theme-chip theme-chip-secondary">{{ stack }}</q-chip>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-4">
        <div class="content-card q-pa-lg">
          <div class="section-label">Details</div>
          <div class="utility-list q-mt-md">
            <div class="utility-card">
              <div class="mini-card-title">Salary</div>
              <div class="mini-card-copy">{{ salaryText }}</div>
            </div>
            <div class="utility-card">
              <div class="mini-card-title">Apply before</div>
              <div class="mini-card-copy">{{ expiryText }}</div>
            </div>
            <div class="utility-card">
              <div class="mini-card-title">Applications</div>
              <div class="mini-card-copy">{{ job.applications_count || 0 }} submitted</div>
            </div>
          </div>
        </div>

        <div v-if="job.is_owner" class="content-card q-pa-lg q-mt-lg">
          <div class="section-label">Applicants</div>
          <div class="text-subtitle1 text-weight-bold q-mt-sm">{{ applicants.length }} people applied</div>
          <div class="utility-list q-mt-md">
            <div v-for="application in applicants" :key="application.id" class="utility-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="mini-card-title">{{ application.user?.name }}</div>
                  <div class="mini-card-copy">@{{ application.user?.username }}<span v-if="application.user?.headline"> • {{ application.user.headline }}</span></div>
                  <div class="utility-card__meta">
                    <span class="card-meta">Applied {{ formatDate(application.created_at, { month: 'short', day: 'numeric' }) }}</span>
                    <span class="card-meta">{{ application.status }}</span>
                  </div>
                </div>
                <q-btn flat no-caps color="secondary" label="Portfolio" :to="application.user ? `/u/${application.user.username}` : '/developers'" />
              </div>
            </div>
            <div v-if="!applicants.length" class="utility-empty">No applicants yet.</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'
import { formatDate } from 'src/utils/formatters'

const route = useRoute()
const $q = useQuasar()
const community = useCommunityStore()
const session = useSessionStore()
const loading = ref(false)
const job = ref(null)
const applicants = ref([])

const salaryText = computed(() => {
  if (!job.value) return ''
  if (!job.value.salary_min && !job.value.salary_max) return 'Salary not listed'
  return `${job.value.salary_currency || 'USD'} ${job.value.salary_min || ''}${job.value.salary_max ? ` - ${job.value.salary_max}` : '+'}`
})

const expiryText = computed(() => (job.value?.expires_at ? formatDate(job.value.expires_at, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open until filled'))

onMounted(async () => {
  loading.value = true
  try {
    job.value = await community.fetchJob(route.params.slug)
    if (job.value?.is_owner && session.isAuthenticated) {
      const data = await community.fetchJobApplicants(job.value.id)
      applicants.value = data.applicants || []
    }
  } finally {
    loading.value = false
  }
})

async function apply() {
  try {
    await community.applyToJob(job.value.id)
    job.value.is_applied = true
    $q.notify({ type: 'positive', message: 'Application submitted' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to apply' })
  }
}

async function saveJob() {
  try {
    await community.toggleJobBookmark(job.value.id)
    job.value.is_saved = !job.value.is_saved
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save job' })
  }
}
</script>
