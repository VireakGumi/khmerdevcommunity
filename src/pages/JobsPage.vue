<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label">Jobs</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Developer roles, contracts, and internships</div>
        <div class="text-body2 muted-text q-mt-sm">A focused jobs board for Khmer builders looking for full-time, freelance, and early-career opportunities.</div>
      </div>
      <div class="page-actions">
        <q-btn color="primary" no-caps icon="work" label="Post job" :disable="!session.isAuthenticated" @click="jobDialog = true" />
      </div>
    </div>

    <div v-if="session.isAuthenticated" class="content-card q-pa-sm q-mb-lg">
      <q-tabs v-model="activeView" dense no-caps inline-label class="feed-tabs">
        <q-tab name="market" icon="work" label="Job board" />
        <q-tab name="applied" icon="task_alt" label="Applied jobs" />
        <q-tab name="posted" icon="badge" label="My listings" />
      </q-tabs>
    </div>

    <div v-if="activeView === 'market'" class="content-card q-pa-lg q-mb-lg">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md">
          <q-input v-model="filters.q" outlined class="input-surface" label="Search jobs" placeholder="Laravel, Vue, remote, internship..." @keyup.enter="loadJobs">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-md-2">
          <q-select v-model="filters.job_type" outlined dense emit-value map-options class="input-surface" label="Type" :options="jobTypes" />
        </div>
        <div class="col-6 col-md-2">
          <q-select v-model="filters.work_mode" outlined dense emit-value map-options class="input-surface" label="Mode" :options="workModes" />
        </div>
        <div class="col-6 col-md-2">
          <q-select v-model="filters.experience_level" outlined dense emit-value map-options class="input-surface" label="Level" :options="levels" />
        </div>
        <div class="col-6 col-md-auto">
          <q-btn color="primary" no-caps label="Apply filters" :loading="community.jobsLoading && !jobs.length" @click="loadJobs" />
        </div>
      </div>
    </div>

    <div v-if="activeView === 'market'" class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div v-if="jobs.length" class="jobs-range card-meta q-mb-md">
          Showing {{ displayRangeStart }}–{{ displayRangeEnd }} of {{ totalJobs }} jobs
        </div>

        <div v-if="community.jobsLoading && !jobs.length" class="jobs-skeleton-stack">
          <div v-for="index in 3" :key="`job-skeleton-${index}`" class="content-card q-pa-lg q-mb-md">
            <div class="row items-start justify-between q-col-gutter-md">
              <div class="col">
                <div class="row items-center q-gutter-sm">
                  <q-skeleton type="QAvatar" size="52px" />
                  <div class="jobs-skeleton-copy">
                    <q-skeleton type="text" width="52%" />
                    <q-skeleton type="text" width="72%" class="q-mt-xs" />
                  </div>
                </div>
                <q-skeleton type="text" class="q-mt-md" />
                <q-skeleton type="text" width="88%" class="q-mt-xs" />
                <div class="row q-col-gutter-sm q-mt-md">
                  <div v-for="item in 3" :key="`job-skeleton-chip-${item}`" class="col-auto">
                    <q-skeleton type="QChip" width="88px" />
                  </div>
                </div>
              </div>
              <div class="col-auto jobs-skeleton-actions">
                <q-skeleton type="rect" width="112px" height="40px" />
                <q-skeleton type="rect" width="112px" height="40px" class="q-mt-sm" />
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!jobs.length" class="content-card q-pa-lg utility-empty">
          No roles match the current filters yet.
        </div>

        <template v-else>
          <transition-group name="feed-stack" tag="div" class="jobs-list">
            <div v-for="job in jobs" :key="job.id" class="content-card q-pa-lg q-mb-md jobs-list__item">
              <div class="row items-start justify-between q-col-gutter-md">
                <div class="col">
                  <div class="row items-center q-gutter-sm">
                    <q-avatar size="52px" color="primary" text-color="white">
                      <img v-if="job.company_logo_url" :src="job.company_logo_url" :alt="job.company_name" />
                      <span v-else>{{ job.company_name?.charAt(0) || 'J' }}</span>
                    </q-avatar>
                    <div>
                      <div class="card-title">{{ job.title }}</div>
                      <div class="card-meta q-mt-xs">{{ job.company_name }} • {{ formatJobType(job.job_type) }} • {{ formatMode(job.work_mode) }}</div>
                    </div>
                  </div>

                  <div class="text-body2 muted-text q-mt-md">{{ job.summary }}</div>

                  <div class="home-item__meta q-mt-md">
                    <span>{{ job.location || 'Remote-friendly' }}</span>
                    <span>{{ formatLevel(job.experience_level) }}</span>
                    <span v-if="job.salary_min || job.salary_max">{{ formatSalary(job) }}</span>
                    <span v-if="job.expires_at">Closes {{ formatDate(job.expires_at, { month: 'short', day: 'numeric' }) }}</span>
                  </div>

                  <div class="jobs-badge-row q-mt-sm">
                    <q-chip v-if="job.is_saved" square dense class="theme-chip theme-chip-secondary">Saved</q-chip>
                    <q-chip v-if="job.is_applied" square dense class="theme-chip theme-chip-success">Applied</q-chip>
                    <q-chip v-for="stack in job.tech_stack || []" :key="stack" square dense class="theme-chip theme-chip-secondary">{{ stack }}</q-chip>
                  </div>
                </div>

                <div class="col-auto">
                  <div class="column q-gutter-sm">
                    <q-btn color="primary" no-caps label="View role" :to="`/jobs/${job.slug}`" />
                    <q-btn
                      flat
                      no-caps
                      :color="job.is_saved ? 'secondary' : 'grey-5'"
                      :label="job.is_saved ? 'Saved' : 'Save'"
                      :loading="Boolean(bookmarkLoading[job.id])"
                      @click="toggleBookmark(job.id)"
                    />
                    <q-btn
                      flat
                      no-caps
                      color="secondary"
                      :label="job.is_applied ? 'Applied' : 'Apply'"
                      :loading="Boolean(applyLoading[job.id])"
                      :disable="job.is_applied || !session.isAuthenticated || Boolean(applyLoading[job.id])"
                      @click="applyToJob(job)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </transition-group>

          <div class="jobs-pagination text-center q-mt-md">
            <q-btn
              v-if="hasMoreJobs"
              outline
              color="primary"
              no-caps
              label="Load more jobs"
              :loading="community.jobsLoading"
              @click="loadMoreJobs"
            />
            <div v-else class="card-meta">No more jobs</div>
          </div>
        </template>
      </div>

      <div class="col-12 col-xl-4">
        <div class="content-card q-pa-lg">
          <div class="section-label">Market</div>
          <div class="text-h6 text-weight-bold q-mt-md">Opportunity snapshot</div>
          <div class="summary-grid q-mt-md">
            <div class="inline-stat">
              <div class="card-meta">Open roles</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ totalJobs }}</div>
            </div>
            <div class="inline-stat">
              <div class="card-meta">Remote</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ remoteCount }}</div>
            </div>
            <div class="inline-stat">
              <div class="card-meta">Internships</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ internshipCount }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeView === 'applied'" class="content-card q-pa-lg">
      <div class="portfolio-section-head">
        <div class="section-label">Applied Jobs</div>
        <h2 class="portfolio-section-title">{{ appliedJobs.length }} applications</h2>
      </div>
      <div class="utility-list q-mt-md">
        <div v-for="application in appliedJobs" :key="application.id" class="utility-card">
          <div class="row items-center justify-between">
            <div>
              <div class="mini-card-title">{{ application.job?.title }}</div>
              <div class="mini-card-copy">{{ application.job?.company_name }}</div>
              <div class="utility-card__meta">
                <span class="card-meta">Status: {{ application.status }}</span>
                <span class="card-meta">Applied {{ formatDate(application.created_at, { month: 'short', day: 'numeric' }) }}</span>
              </div>
            </div>
            <q-btn flat no-caps color="secondary" label="View" :to="application.job ? `/jobs/${application.job.slug}` : '/jobs'" />
          </div>
        </div>
        <div v-if="!appliedJobs.length" class="utility-empty">You have not applied to any jobs yet.</div>
      </div>
    </div>

    <div v-else class="content-card q-pa-lg">
      <div class="portfolio-section-head">
        <div class="section-label">My Listings</div>
        <h2 class="portfolio-section-title">{{ myJobs.length }} roles posted</h2>
      </div>
      <div class="utility-list q-mt-md">
        <div v-for="job in myJobs" :key="job.id" class="utility-card">
          <div class="row items-center justify-between">
            <div>
              <div class="mini-card-title">{{ job.title }}</div>
              <div class="mini-card-copy">{{ job.company_name }}</div>
              <div class="utility-card__meta">
                <span class="card-meta">{{ job.status }}</span>
                <span class="card-meta">{{ job.applications_count || 0 }} applicants</span>
              </div>
            </div>
            <q-btn flat no-caps color="secondary" label="Review applicants" :to="`/jobs/${job.slug}`" />
          </div>
        </div>
        <div v-if="!myJobs.length" class="utility-empty">You have not posted any jobs yet.</div>
      </div>
    </div>

    <q-dialog v-model="jobDialog">
      <q-card class="theme-dialog" style="width: 720px; max-width: 92vw">
        <q-card-section>
          <div class="section-label">Job Listing</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Post a hiring opportunity</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="jobForm.company_name" outlined class="input-surface" label="Company"/>
          <q-input v-model="jobForm.title" outlined class="input-surface" label="Role title" />
          <q-input v-model="jobForm.summary" outlined class="input-surface" label="Summary" />
          <q-input v-model="jobForm.description" outlined type="textarea" autogrow class="input-surface" label="Description" />
          <div class="row q-col-gutter-md q-mt-xs q-ml-xs">
            <div class="col-12 col-md-4"><q-select v-model="jobForm.job_type" outlined emit-value map-options class="input-surface" label="Type" :options="jobTypes" /></div>
            <div class="col-12 col-md-4"><q-select v-model="jobForm.work_mode" outlined emit-value map-options class="input-surface" label="Mode" :options="workModes" /></div>
            <div class="col-12 col-md-4"><q-select v-model="jobForm.experience_level" outlined emit-value map-options class="input-surface" label="Level" :options="levels" /></div>
          </div>
          <q-input v-model="jobForm.location" outlined class="input-surface" label="Location" />
          <q-input v-model="jobForm.tech_stack_text" outlined class="input-surface" label="Tech stack" hint="Comma separated" />
          <div class="row q-col-gutter-md q-mt-xs q-ml-xs">
            <div class="col-12 col-md-4"><q-input v-model.number="jobForm.salary_min" outlined type="number" class="input-surface" label="Salary min" /></div>
            <div class="col-12 col-md-4"><q-input v-model.number="jobForm.salary_max" outlined type="number" class="input-surface" label="Salary max" /></div>
            <div class="col-12 col-md-4"><q-input v-model="jobForm.salary_currency" outlined class="input-surface" label="Currency" /></div>
          </div>
          <q-input v-model="jobForm.apply_url" outlined class="input-surface" label="Apply URL" />
          <q-input v-model="jobForm.contact_email" outlined class="input-surface" label="Contact email" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps color="secondary" label="Cancel" v-close-popup />
          <q-btn color="primary" no-caps label="Publish job" :loading="publishing" @click="publishJob" />
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

const filters = reactive({
  q: '',
  job_type: null,
  work_mode: null,
  experience_level: null,
})

const jobDialog = ref(false)
const publishing = ref(false)
const activeView = ref('market')
const bookmarkLoading = reactive({})
const applyLoading = reactive({})
const jobForm = reactive({
  company_name: '',
  title: '',
  summary: '',
  description: '',
  job_type: 'full_time',
  work_mode: 'remote',
  experience_level: 'mid',
  location: '',
  salary_min: null,
  salary_max: null,
  salary_currency: 'USD',
  apply_url: '',
  contact_email: '',
  tech_stack_text: '',
})

const jobTypes = [
  { label: 'Full-time', value: 'full_time' },
  { label: 'Part-time', value: 'part_time' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Internship', value: 'internship' },
]

const workModes = [
  { label: 'Remote', value: 'remote' },
  { label: 'Onsite', value: 'onsite' },
  { label: 'Hybrid', value: 'hybrid' },
]

const levels = [
  { label: 'Intern', value: 'intern' },
  { label: 'Junior', value: 'junior' },
  { label: 'Mid', value: 'mid' },
  { label: 'Senior', value: 'senior' },
  { label: 'Lead', value: 'lead' },
]

const jobsState = computed(() => community.jobsList)
const jobs = computed(() => jobsState.value.items)
const myJobs = computed(() => community.myJobs)
const appliedJobs = computed(() => community.appliedJobs)
const totalJobs = computed(() => jobsState.value.total || jobs.value.length)
const hasMoreJobs = computed(() => jobsState.value.hasMore)
const displayRangeStart = computed(() => (jobs.value.length ? 1 : 0))
const displayRangeEnd = computed(() => jobs.value.length)
const remoteCount = computed(() => jobs.value.filter((job) => job.work_mode === 'remote').length)
const internshipCount = computed(() => jobs.value.filter((job) => job.job_type === 'internship').length)

onMounted(() => {
  loadJobs()

  if (session.isAuthenticated) {
    community.fetchMyJobs()
    community.fetchAppliedJobs()
  }
})

async function loadJobs() {
  if (jobsState.value.loading) {
    return
  }

  await community.fetchJobs({ ...filters, page: 1, append: false })
}

async function loadMoreJobs() {
  if (jobsState.value.loading || !jobsState.value.hasMore) {
    return
  }

  await community.fetchNextJobsPage()
}

function formatJobType(value) {
  return value?.replace('_', ' ')
}

function formatMode(value) {
  return value?.charAt(0).toUpperCase() + value?.slice(1)
}

function formatLevel(value) {
  return value?.charAt(0).toUpperCase() + value?.slice(1)
}

function formatSalary(job) {
  const currency = job.salary_currency || 'USD'

  if (!job.salary_min && !job.salary_max) return 'Salary not listed'
  if (job.salary_min && job.salary_max) return `${currency} ${job.salary_min}-${job.salary_max}`

  return `${currency} ${job.salary_min || job.salary_max}+`
}

async function toggleBookmark(jobId) {
  if (bookmarkLoading[jobId]) {
    return
  }

  bookmarkLoading[jobId] = true

  try {
    await community.toggleJobBookmark(jobId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save job' })
  } finally {
    bookmarkLoading[jobId] = false
  }
}

async function applyToJob(job) {
  if (applyLoading[job.id]) {
    return
  }

  applyLoading[job.id] = true

  try {
    await community.applyToJob(job.id)
    $q.notify({ type: 'positive', message: 'Application submitted' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to apply' })
  } finally {
    applyLoading[job.id] = false
  }
}

async function publishJob() {
  publishing.value = true

  try {
    await community.createJob({
      ...jobForm,
      publish: true,
      tech_stack: jobForm.tech_stack_text.split(',').map((item) => item.trim()).filter(Boolean),
    })
    jobDialog.value = false
    Object.assign(jobForm, {
      company_name: '',
      title: '',
      summary: '',
      description: '',
      job_type: 'full_time',
      work_mode: 'remote',
      experience_level: 'mid',
      location: '',
      salary_min: null,
      salary_max: null,
      salary_currency: 'USD',
      apply_url: '',
      contact_email: '',
      tech_stack_text: '',
    })
    $q.notify({ type: 'positive', message: 'Job published' })
    loadJobs()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to publish job' })
  } finally {
    publishing.value = false
  }
}
</script>
