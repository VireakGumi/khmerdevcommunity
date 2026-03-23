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
          <q-btn color="primary" no-caps label="Apply filters" :loading="community.jobsLoading && !displayJobs.length" @click="loadJobs" />
        </div>
      </div>
    </div>

    <div v-if="activeView === 'market'" class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div v-if="displayJobs.length" class="jobs-range card-meta q-mb-md">
          Showing {{ displayRangeStart }}-{{ displayRangeEnd }} of {{ totalJobs }} jobs
          <span v-if="usingRelatedJobs"> · related to your skills</span>
        </div>

        <div v-if="community.jobsLoading && !displayJobs.length" class="jobs-skeleton-stack">
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

        <div v-else-if="!displayJobs.length" class="content-card q-pa-lg utility-empty">
          No roles match the current filters yet.
        </div>

        <template v-else>
          <transition-group name="feed-stack" tag="div" class="jobs-list">
            <div v-for="job in displayJobs" :key="job.id" class="content-card q-pa-lg q-mb-md jobs-list__item">
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
                    <q-chip v-if="job.recommendationReason" square dense class="theme-chip theme-chip-primary">{{ job.recommendationReason }}</q-chip>
                    <q-chip v-if="job.is_saved" square dense class="theme-chip theme-chip-secondary">Saved</q-chip>
                    <q-chip v-if="job.is_applied" square dense class="theme-chip theme-chip-success">Applied</q-chip>
                    <q-chip v-for="stack in job.tech_stack || []" :key="`${job.id}-${stack}`" square dense class="theme-chip theme-chip-secondary">{{ stack }}</q-chip>
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
                      :label="job.is_owner ? 'Your job post' : job.is_applied ? 'Applied' : 'Apply'"
                      :loading="Boolean(applyLoading[job.id])"
                      :disable="job.is_owner || job.is_applied || !session.isAuthenticated || Boolean(applyLoading[job.id])"
                      @click="openApplyDialog(job)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </transition-group>

          <div class="jobs-pagination text-center q-mt-md">
            <q-btn
              v-if="hasMoreJobs && !usingRelatedJobs"
              outline
              color="primary"
              no-caps
              label="Load more jobs"
              :loading="community.jobsLoading"
              @click="loadMoreJobs"
            />
            <div v-else class="card-meta">{{ usingRelatedJobs ? 'Showing best related matches' : 'No more jobs' }}</div>
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
      <div class="summary-grid q-mt-md">
        <div class="inline-stat">
          <div class="card-meta">Active roles</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ postedActiveCount }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Total applicants</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ postedApplicantsCount }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Most demand</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ topJobApplicantsCount }}</div>
        </div>
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
                <span class="card-meta">{{ formatMode(job.work_mode) }}</span>
              </div>
            </div>
            <div class="row q-gutter-sm items-center">
              <q-btn flat no-caps color="secondary" label="View role" :to="`/jobs/${job.slug}`" />
              <q-btn color="primary" no-caps label="Review applicants" @click="openApplicantsDashboard(job)" />
            </div>
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
          <q-input v-model="jobForm.company_name" outlined class="input-surface" label="Company" />
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

    <q-dialog v-model="applyDialog">
      <q-card class="theme-dialog" style="width: 560px; max-width: 92vw">
        <q-card-section>
          <div class="section-label">Confirm Application</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Apply to {{ selectedJob?.title }}</div>
          <div class="mini-card-copy q-mt-sm">
            This step is here to make sure you really want to apply before sending your application.
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="utility-card">
            <div class="mini-card-title">{{ selectedJob?.company_name }}</div>
            <div class="mini-card-copy">
              {{ selectedJob?.location || 'Remote-friendly' }} • {{ formatMode(selectedJob?.work_mode) }} • {{ formatLevel(selectedJob?.experience_level) }}
            </div>
          </div>
          <q-checkbox v-model="applyChecks.reviewed" label="I reviewed the role details." />
          <q-checkbox v-model="applyChecks.ready" label="I want to submit this application now." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps color="secondary" label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            no-caps
            label="Submit application"
            :loading="applySubmitting"
            :disable="!canSubmitApply"
            @click="confirmApply"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="applicantsDialog" maximized>
      <q-card class="theme-dialog employer-dashboard">
        <q-card-section class="row items-start justify-between q-col-gutter-md">
          <div class="col">
            <div class="section-label">Employer Dashboard</div>
            <div class="text-h6 text-weight-bold q-mt-sm">{{ selectedPostedJob?.title || 'Applicants' }}</div>
            <div class="mini-card-copy q-mt-xs">{{ selectedPostedJob?.company_name }} · {{ selectedApplicants.length }} applicants</div>
          </div>
          <div class="col-auto">
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="content-card q-pa-md">
                <div class="section-label">Pipeline</div>
                <div class="q-mt-md employer-pipeline">
                  <div v-for="item in applicantStatusSummary" :key="item.status" class="employer-pipeline__item">
                    <div>
                      <div class="mini-card-title">{{ item.label }}</div>
                      <div class="card-meta">{{ item.count }} applicants</div>
                    </div>
                    <q-chip square dense class="theme-chip theme-chip-secondary">{{ item.count }}</q-chip>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-8">
              <div class="content-card q-pa-md">
                <div class="section-label">Applicants</div>
                <div v-if="selectedApplicants.length" class="q-mt-md employer-applicant-list">
                  <article v-for="application in selectedApplicants" :key="application.id" class="utility-card employer-applicant-card">
                    <div class="row q-col-gutter-md items-start">
                      <div class="col">
                        <div class="row items-center q-gutter-sm">
                          <q-avatar size="46px" color="primary" text-color="white">
                            <img v-if="application.user?.avatar_url" :src="application.user.avatar_url" :alt="application.user?.name || 'Applicant avatar'" />
                            <span v-else>{{ application.user?.name?.charAt(0) || 'A' }}</span>
                          </q-avatar>
                          <div>
                            <div class="mini-card-title">{{ application.user?.name }}</div>
                            <div class="card-meta">@{{ application.user?.username || 'builder' }}</div>
                          </div>
                        </div>
                        <div class="mini-card-copy q-mt-sm">{{ application.user?.headline || 'Community applicant' }}</div>
                        <div class="utility-card__meta q-mt-sm">
                          <span class="card-meta">Status: {{ formatApplicationStatus(application.status) }}</span>
                          <span class="card-meta">Applied {{ formatDate(application.created_at, { month: 'short', day: 'numeric' }) }}</span>
                          <span v-if="application.user?.location" class="card-meta">{{ application.user.location }}</span>
                        </div>
                        <div v-if="application.note" class="stack-card q-pa-sm q-mt-sm employer-applicant-note">
                          <div class="section-label">Applicant note</div>
                          <div class="text-body2 q-mt-xs">{{ application.note }}</div>
                        </div>
                        <div v-if="application.user?.skills?.length" class="jobs-badge-row q-mt-sm">
                          <q-chip
                            v-for="skill in application.user.skills.slice(0, 5)"
                            :key="`${application.id}-${skill}`"
                            square
                            dense
                            class="theme-chip theme-chip-secondary"
                          >
                            {{ skill }}
                          </q-chip>
                        </div>
                      </div>

                      <div class="col-12 col-md-auto">
                        <div class="column q-gutter-sm employer-applicant-actions">
                          <q-btn
                            v-if="application.user?.username"
                            flat
                            no-caps
                            color="secondary"
                            label="Portfolio"
                            :to="`/u/${application.user.username}`"
                          />
                          <q-btn
                            v-if="application.resume_url"
                            flat
                            no-caps
                            color="secondary"
                            label="Resume"
                            type="a"
                            :href="application.resume_url"
                            target="_blank"
                          />
                          <q-select
                            outlined
                            dense
                            emit-value
                            map-options
                            class="input-surface employer-applicant-status"
                            :model-value="application.status"
                            :options="applicationStatuses"
                            @update:model-value="updateApplicantStatus(application, $event)"
                          />
                          <q-btn
                            color="primary"
                            no-caps
                            label="Message"
                            :disable="!application.user?.id"
                            :to="application.user?.id ? `/messages?recipient=${application.user.id}` : undefined"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
                <div v-else class="utility-empty q-mt-md">No applicants yet for this role.</div>
              </div>
            </div>
          </div>
        </q-card-section>
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
const applyDialog = ref(false)
const applySubmitting = ref(false)
const applicantsDialog = ref(false)
const selectedJob = ref(null)
const selectedPostedJob = ref(null)
const selectedApplicants = ref([])
const bookmarkLoading = reactive({})
const applyLoading = reactive({})
const applicantStatusLoading = reactive({})
const applyChecks = reactive({
  reviewed: false,
  ready: false,
})
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

const applicationStatuses = [
  { label: 'Submitted', value: 'submitted' },
  { label: 'Reviewing', value: 'reviewing' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Hired', value: 'hired' },
]

const jobsState = computed(() => community.jobsList)
const jobs = computed(() => jobsState.value.items)
const myJobs = computed(() => community.myJobs)
const appliedJobs = computed(() => community.appliedJobs)
const hasSkillProfile = computed(() => Boolean(session.isAuthenticated && (session.user?.skills || []).length))
const hasMoreJobs = computed(() => jobsState.value.hasMore)
const remoteCount = computed(() => jobs.value.filter((job) => job.work_mode === 'remote').length)
const internshipCount = computed(() => jobs.value.filter((job) => job.job_type === 'internship').length)
const postedActiveCount = computed(() => myJobs.value.filter((job) => job.status === 'active').length)
const postedApplicantsCount = computed(() => myJobs.value.reduce((sum, job) => sum + (job.applications_count || 0), 0))
const topJobApplicantsCount = computed(() => myJobs.value.reduce((max, job) => Math.max(max, job.applications_count || 0), 0))
const applicantStatusSummary = computed(() => applicationStatuses.map((item) => ({
  status: item.value,
  label: item.label,
  count: selectedApplicants.value.filter((application) => application.status === item.value).length,
})))
const recommendedJobs = computed(() => {
  const skills = (session.user?.skills || []).map((skill) => String(skill).toLowerCase())
  const location = session.user?.location?.toLowerCase() || ''
  const availability = session.user?.availability?.toLowerCase() || ''
  const yearsExperience = (session.user?.work_experience || []).length
  const preferredLevels = yearsExperience >= 5
    ? ['senior', 'lead']
    : yearsExperience >= 2
      ? ['mid', 'junior']
      : ['intern', 'junior']

  if (!skills.length) {
    return []
  }

  return [...jobs.value]
    .map((job) => {
      const stack = (job.tech_stack || []).map((item) => String(item).toLowerCase())
      const title = `${job.title || ''} ${job.summary || ''}`.toLowerCase()
      const jobLocation = `${job.location || ''} ${job.work_mode || ''}`.toLowerCase()
      const skillMatches = skills.filter((skill) => stack.includes(skill) || title.includes(skill))
      let score = skillMatches.length * 4

      if (preferredLevels.includes(job.experience_level)) {
        score += 3
      }

      if (job.work_mode === 'remote') {
        score += 2
      }

      if (location && jobLocation.includes(location)) {
        score += 2
      }

      if (availability.includes('open') || availability.includes('available')) {
        score += 1
      }

      return {
        ...job,
        recommendationScore: score,
        recommendationReason: skillMatches.length
          ? `Matches ${skillMatches.slice(0, 2).join(', ')}`
          : preferredLevels.includes(job.experience_level)
            ? `Fits ${job.experience_level} level`
            : job.work_mode === 'remote'
              ? 'Remote-friendly match'
              : 'Potential fit',
      }
    })
    .filter((job) => job.recommendationScore > 0)
    .sort((left, right) => right.recommendationScore - left.recommendationScore)
})
const usingRelatedJobs = computed(() => hasSkillProfile.value && recommendedJobs.value.length > 0)
const displayJobs = computed(() => (usingRelatedJobs.value ? recommendedJobs.value : jobs.value))
const totalJobs = computed(() => displayJobs.value.length)
const displayRangeStart = computed(() => (displayJobs.value.length ? 1 : 0))
const displayRangeEnd = computed(() => displayJobs.value.length)
const canSubmitApply = computed(() => applyChecks.reviewed && applyChecks.ready && selectedJob.value)

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

function formatApplicationStatus(value) {
  return value?.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
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

function openApplyDialog(job) {
  selectedJob.value = job
  applyChecks.reviewed = false
  applyChecks.ready = false
  applyDialog.value = true
}

async function confirmApply() {
  if (!selectedJob.value || applyLoading[selectedJob.value.id]) {
    return
  }

  applyLoading[selectedJob.value.id] = true
  applySubmitting.value = true

  try {
    await community.applyToJob(selectedJob.value.id)
    selectedJob.value.is_applied = true
    applyDialog.value = false
    $q.notify({ type: 'positive', message: 'Application submitted' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to apply' })
  } finally {
    applyLoading[selectedJob.value.id] = false
    applySubmitting.value = false
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

async function openApplicantsDashboard(job) {
  selectedPostedJob.value = job
  applicantsDialog.value = true
  selectedApplicants.value = []

  try {
    const data = await community.fetchJobApplicants(job.id)
    selectedApplicants.value = data.applicants || []
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to load applicants' })
  }
}

async function updateApplicantStatus(application, status) {
  if (!selectedPostedJob.value || !status || applicantStatusLoading[application.id]) {
    return
  }

  applicantStatusLoading[application.id] = true

  try {
    const updated = await community.updateJobApplication(selectedPostedJob.value.id, application.id, { status })
    selectedApplicants.value = selectedApplicants.value.map((item) => (item.id === application.id ? updated : item))
    $q.notify({ type: 'positive', message: `Applicant marked ${formatApplicationStatus(status)}` })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to update applicant' })
  } finally {
    applicantStatusLoading[application.id] = false
  }
}
</script>
