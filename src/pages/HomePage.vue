<template>
  <q-page padding>
    <template v-if="loading">
      <section class="content-card q-pa-lg q-mb-lg page-skeleton-panel">
        <q-skeleton type="text" width="22%" />
        <q-skeleton type="text" width="58%" class="q-mt-md" />
        <q-skeleton type="text" class="q-mt-sm" />
        <q-skeleton type="text" width="82%" class="q-mt-xs" />
        <div class="row q-col-gutter-md q-mt-lg">
          <div v-for="index in 3" :key="`home-chip-${index}`" class="col-auto">
            <q-skeleton type="QChip" width="124px" />
          </div>
        </div>
        <div class="row q-col-gutter-md q-mt-lg">
          <div v-for="index in 4" :key="`home-stat-${index}`" class="col-12 col-sm-6 col-xl-3">
            <div class="home-stat-card">
              <q-skeleton type="text" width="42%" />
              <q-skeleton type="text" width="26%" class="q-mt-sm" />
              <q-skeleton type="text" width="68%" class="q-mt-sm" />
            </div>
          </div>
        </div>
      </section>

      <section class="content-card q-pa-lg q-mb-lg page-skeleton-panel">
        <div class="row q-col-gutter-lg">
          <div v-for="index in 3" :key="`home-board-${index}`" class="col-12 col-lg-4">
            <div class="home-board home-board--dashboard">
              <q-skeleton type="text" width="36%" />
              <q-skeleton type="text" width="74%" class="q-mt-sm" />
              <div class="q-mt-md">
                <div v-for="item in 3" :key="`home-board-item-${index}-${item}`" class="home-item q-mb-md">
                  <q-skeleton type="text" width="48%" />
                  <q-skeleton type="text" class="q-mt-sm" />
                  <q-skeleton type="text" width="72%" class="q-mt-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="content-card home-hero q-pa-lg q-mb-lg">
        <div class="home-hero__main">
          <div class="portfolio-pro-kicker">Khmer Developer Community</div>
          <div class="home-badge-row q-mt-md">
            <q-chip square class="theme-chip theme-chip-primary">Khmer-first Network</q-chip>
            <q-chip square class="theme-chip theme-chip-secondary">Write + Build + Ship</q-chip>
            <q-chip square class="theme-chip">Community + Portfolio</q-chip>
          </div>

          <h1 class="home-title q-mt-lg">A focused developer home for publishing work, finding collaborators, and building a public portfolio.</h1>
          <p class="home-summary q-mt-md">
            Track what the community is shipping this week, see who is active, and move from social profile to public portfolio without losing the product flow.
          </p>

          <div class="hero-actions q-mt-lg">
            <q-btn color="primary" no-caps label="Open community feed" to="/feed" />
            <q-btn flat color="secondary" no-caps label="Build portfolio" to="/portfolio" />
            <q-btn flat color="secondary" no-caps icon="favorite" label="Support KhmerDevCommunity" @click="scrollToSupport" />
            <q-btn flat color="secondary" no-caps icon="phone_iphone" label="Open mobile" to="/m" />
          </div>

          <div class="home-value-strip q-mt-lg">
            <div class="home-value-pill">
              <q-icon name="forum" size="16px" />
              <span>Community threads that stay readable</span>
            </div>
            <div class="home-value-pill">
              <q-icon name="terminal" size="16px" />
              <span>Projects and stacks discoverable in one place</span>
            </div>
            <div class="home-value-pill">
              <q-icon name="account_box" size="16px" />
              <span>Public portfolio without leaving the product flow</span>
            </div>
          </div>

          <div class="home-stat-row q-mt-lg">
            <div v-for="(value, key) in home?.stats" :key="key" class="home-stat-card">
              <span class="portfolio-stat-label">{{ formatLabel(key) }}</span>
              <strong>{{ value }}</strong>
              <span class="card-meta">{{ statCopy[key] }}</span>
            </div>
          </div>
        </div>

        <aside class="home-hero__rail">
          <div class="home-rail-card">
            <div class="section-label">Today in the Circle</div>
            <div class="mini-card-title q-mt-sm">{{ home?.featuredPost?.title }}</div>
            <div class="mini-card-copy q-mt-sm">{{ home?.featuredPost?.excerpt }}</div>
            <div class="home-meta-stack q-mt-md">
              <div class="card-meta">{{ home?.featuredPost?.user?.name }}</div>
              <div class="card-meta">{{ home?.featuredPost?.likes_count }} likes | {{ home?.featuredPost?.comments_count || 0 }} comments</div>
            </div>
            <q-btn flat no-caps color="primary" label="View feed" class="q-mt-md" to="/feed" />
          </div>

          <div class="home-rail-card">
            <div class="section-label">Builders to Watch</div>
            <div class="home-people-list q-mt-sm">
              <div v-for="developer in featuredDevelopers" :key="developer.id" class="home-person-row">
                <div class="home-person-copy">
                  <div class="mini-card-title">{{ developer.name }}</div>
                  <div class="card-meta q-mt-xs">@{{ developer.username }} <span v-if="developer.location">| {{ developer.location }}</span></div>
                  <div class="home-person-metrics q-mt-xs">
                    <span>{{ developer.posts_count }} posts</span>
                    <span>{{ developer.projects_count }} projects</span>
                  </div>
                </div>
                <q-btn flat dense no-caps color="secondary" label="View" :to="`/u/${developer.username}`" />
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section class="content-card q-pa-lg q-mb-lg home-dashboard-shell">
        <div class="portfolio-section-head home-dashboard-head">
          <div>
            <div class="section-label">Dashboard</div>
            <h2 class="portfolio-section-title">Your main product surfaces at a glance</h2>
          </div>
          <div class="card-meta">Preview the most active projects, jobs, and events without turning the home page into a feed.</div>
        </div>

        <div class="home-dashboard-grid q-mt-lg">
          <section class="home-board home-board--dashboard">
            <div class="portfolio-section-head home-board__head">
              <div>
                <div class="section-label">Projects</div>
                <h3 class="portfolio-section-title">Builders launching in public</h3>
              </div>
              <q-btn flat no-caps color="primary" label="See all" to="/projects" />
            </div>

            <div class="home-item-list q-mt-md">
              <article v-for="project in featuredProjects" :key="project.id" class="home-item">
                <div class="home-item__head">
                  <div class="home-item__copy">
                    <div class="mini-card-title">{{ project.name }}</div>
                    <div class="card-meta q-mt-xs">{{ project.user?.name }}</div>
                  </div>
                  <q-chip square dense class="theme-chip theme-chip-warning">{{ project.status }}</q-chip>
                </div>
                <div class="mini-card-copy q-mt-sm">{{ project.tagline }}</div>
                <div class="home-item__meta q-mt-md">
                  <span>{{ project.stars_count }} stars</span>
                  <span>{{ project.contributors_count }} contributors</span>
                  <span v-if="project.looking_for_collaborators">Open to collab</span>
                </div>
                <div v-if="project.tech_stack?.length" class="home-stack-row q-mt-sm">
                  <span v-for="stack in project.tech_stack.slice(0, 3)" :key="stack" class="home-stack-pill">{{ stack }}</span>
                </div>
              </article>
            </div>
          </section>

          <section class="home-board home-board--dashboard">
            <div class="portfolio-section-head home-board__head">
              <div>
                <div class="section-label">Jobs</div>
                <h3 class="portfolio-section-title">Roles the community can move on now</h3>
              </div>
              <q-btn flat no-caps color="primary" label="Browse more" to="/jobs" />
            </div>

            <div class="home-item-list q-mt-md">
              <article v-for="job in featuredJobs" :key="job.id" class="home-item">
                <div class="home-item__head">
                  <div class="home-item__copy">
                    <div class="mini-card-title">{{ job.title }}</div>
                    <div class="card-meta q-mt-xs">{{ job.company_name }}</div>
                  </div>
                  <q-chip square dense class="theme-chip theme-chip-secondary">{{ job.work_mode }}</q-chip>
                </div>
                <div class="mini-card-copy q-mt-sm">{{ job.summary }}</div>
                <div class="home-item__meta q-mt-md">
                  <span>{{ job.job_type }}</span>
                  <span>{{ job.experience_level }}</span>
                  <span>{{ job.location || 'Remote-friendly' }}</span>
                </div>
              </article>
            </div>
          </section>

          <section class="home-board home-board--dashboard">
            <div class="portfolio-section-head home-board__head">
              <div>
                <div class="section-label">Events</div>
                <h3 class="portfolio-section-title">Community rhythm and meetups</h3>
              </div>
              <q-btn flat no-caps color="primary" label="See all" to="/events" />
            </div>

            <div class="home-item-list q-mt-md">
              <article v-for="event in featuredEvents" :key="event.id" class="home-item">
                <div class="mini-card-title">{{ event.title }}</div>
                <div class="mini-card-copy q-mt-sm">{{ event.summary }}</div>
                <div class="home-item__meta q-mt-md">
                  <span>{{ formatDate(event.starts_at, { month: 'short', day: 'numeric' }) }}</span>
                  <span>{{ formatDate(event.starts_at, { hour: '2-digit', minute: '2-digit' }) }}</span>
                  <span>{{ event.city }}</span>
                </div>
                <div class="card-meta q-mt-sm">{{ event.host?.name }} | {{ event.format }}</div>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section id="support-khmerdevcommunity" class="content-card q-pa-lg home-dashboard-shell home-support-shell">
        <div class="portfolio-section-head home-board__head">
          <div>
            <div class="section-label">Support KhmerDevCommunity</div>
            <h2 class="portfolio-section-title">Help fund the website and community product</h2>
          </div>
          <q-btn flat no-caps color="primary" label="Open community feed" to="/feed" />
        </div>

        <div class="home-support-banner q-mt-md">
          <div>
            <div class="mini-card-title">Support the platform behind the community</div>
            <div class="mini-card-copy q-mt-sm">
              {{ donationSupport.summary }}
            </div>
          </div>
          <div class="home-support-tiers">
            <span v-for="tier in donationSupport.tiers" :key="tier.label" class="home-support-tier">
              {{ tier.label }} | {{ tier.copy }}
            </span>
          </div>
        </div>

        <div class="home-donation-panel q-mt-lg">
          <div class="home-donation-panel__copy">
            <div class="section-label">KHQR Donation</div>
            <h3 class="portfolio-section-title q-mt-sm">{{ donationSupport.title }}</h3>
            <div class="mini-card-copy q-mt-sm">
              Scan the KHQR code or copy the payload into your banking app. This is the fastest way to support the platform right now.
            </div>
            <div class="home-support-tiers q-mt-md">
              <span class="home-support-tier">{{ donationSupport.currency }}</span>
              <span v-if="donationSupport.khqr_account_name" class="home-support-tier">{{ donationSupport.khqr_account_name }}</span>
            </div>
            <div class="hero-actions home-support-actions q-mt-lg">
              <q-btn color="primary" no-caps label="Copy KHQR" :disable="!donationSupport.khqr_payload" @click="copyKhqr" />
              <q-btn
                flat
                color="secondary"
                no-caps
                label="I already donated"
                :disable="!donationSupport.khqr_payload"
                @click="donationDialog = true"
              />
            </div>
            <div v-if="donationSupport.contact_email" class="card-meta q-mt-md">
              Contact: {{ donationSupport.contact_email }}
            </div>
          </div>

          <div class="home-donation-qr">
            <img v-if="khqrCodeSrc" :src="khqrCodeSrc" alt="KhmerDevCommunity KHQR donation code" class="home-donation-qr__image" />
            <div v-else class="home-donation-qr__fallback">
              <div class="mini-card-title">KHQR not configured yet</div>
              <div class="mini-card-copy q-mt-sm">Add `COMMUNITY_DONATION_KHQR` in the Laravel `.env` file to show the real code here.</div>
            </div>
          </div>
        </div>

        <div class="home-support-grid q-mt-lg">
          <article v-for="item in donationSupport.buckets" :key="item.title" class="home-support-card">
            <div class="home-support-card__head">
              <div>
                <div class="mini-card-title">{{ item.title }}</div>
                <div class="card-meta q-mt-xs">{{ item.caption }}</div>
              </div>
              <q-chip square dense class="theme-chip theme-chip-primary">{{ item.badge }}</q-chip>
            </div>

            <div class="mini-card-copy q-mt-md">{{ item.copy }}</div>

            <div class="home-person-metrics q-mt-md">
              <span v-for="metric in item.metrics" :key="metric">{{ metric }}</span>
            </div>

            <div class="home-support-card__tiers q-mt-md">
              <span v-for="detail in item.details" :key="detail" class="home-stack-pill">{{ detail }}</span>
            </div>
          </article>
        </div>
      </section>

      <q-dialog v-model="donationDialog" maximized-on-mobile>
        <q-card class="content-card donation-confirm-dialog">
          <q-card-section class="row items-start justify-between q-col-gutter-md">
            <div class="col">
              <div class="section-label">Donation Confirmation</div>
              <div class="text-h6 q-mt-sm">Submit your KHQR payment proof</div>
              <div class="mini-card-copy q-mt-sm">
                After you scan and pay, send the amount and screenshot here so the team can verify it.
              </div>
            </div>
            <div class="col-auto">
              <q-btn flat round dense icon="close" @click="donationDialog = false" />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="donation-confirm-grid">
              <q-input
                v-model="donationForm.amount"
                outlined
                class="input-surface"
                type="number"
                min="1"
                step="0.01"
                label="Amount"
              />
              <q-input
                v-model="donationForm.transfer_reference"
                outlined
                class="input-surface"
                label="Transfer reference"
              />
              <q-input
                v-model="donationForm.donor_name"
                outlined
                class="input-surface"
                label="Your name"
              />
              <q-input
                v-model="donationForm.donor_email"
                outlined
                class="input-surface"
                type="email"
                label="Your email"
              />
              <q-file
                v-model="donationForm.proof_image"
                outlined
                class="input-surface donation-confirm-grid__full"
                label="Payment screenshot"
                accept=".jpg,.jpeg,.png,.webp"
              />
              <q-input
                v-model="donationForm.note"
                outlined
                autogrow
                class="input-surface donation-confirm-grid__full"
                label="Note"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat no-caps label="Cancel" @click="donationDialog = false" />
            <q-btn color="primary" no-caps label="Submit confirmation" :loading="donationSubmitting" @click="submitDonationConfirmation" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'
import QRCode from 'qrcode'
import { api } from 'boot/axios'
import { useCommunityStore } from 'src/stores/community-store'
import { formatDate } from 'src/utils/formatters'

const $q = useQuasar()
const community = useCommunityStore()
const home = computed(() => community.home)
const loading = ref(false)
const khqrCodeSrc = ref('')
const donationDialog = ref(false)
const donationSubmitting = ref(false)
const donationForm = ref(createDonationForm())

const featuredProjects = computed(() => (home.value?.featuredProjects || []).slice(0, 4))
const featuredJobs = computed(() => (home.value?.featuredJobs || []).slice(0, 4))
const featuredEvents = computed(() => (home.value?.featuredEvents || []).slice(0, 4))
const featuredDevelopers = computed(() => (home.value?.developers || []).slice(0, 4))
const donationSupport = ref({
  title: 'Support KhmerDevCommunity',
  summary: 'Help fund hosting, product development, moderation, and community growth for KhmerDevCommunity.',
  currency: 'USD',
  khqr_payload: '',
  khqr_account_name: 'KhmerDevCommunity',
  contact_email: '',
  tiers: [],
  buckets: [],
})

const statCopy = {
  developers: 'active public builders',
  projects: 'projects listed',
  events: 'upcoming sessions',
  posts: 'community posts published',
  jobs: 'open roles listed',
}

function formatLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function createDonationForm() {
  return {
    amount: '',
    transfer_reference: '',
    donor_name: '',
    donor_email: '',
    note: '',
    proof_image: null,
  }
}

async function generateKhqrImage() {
  khqrCodeSrc.value = ''

  if (!donationSupport.value.khqr_payload) {
    return
  }

  khqrCodeSrc.value = await QRCode.toDataURL(donationSupport.value.khqr_payload, {
    width: 320,
    margin: 1,
    color: {
      dark: '#1f2a44',
      light: '#ffffff',
    },
  })
}

async function fetchDonationSupport() {
  const { data } = await api.get('/support/donation')
  donationSupport.value = data
  await generateKhqrImage()
}

async function copyKhqr() {
  if (!donationSupport.value.khqr_payload) {
    return
  }

  await copyToClipboard(donationSupport.value.khqr_payload)
  $q.notify({ type: 'positive', message: 'KHQR copied' })
}

async function submitDonationConfirmation() {
  if (!donationForm.value.amount || !donationForm.value.proof_image) {
    $q.notify({ type: 'warning', message: 'Amount and screenshot are required' })
    return
  }

  const formData = new FormData()
  formData.append('amount', donationForm.value.amount)
  formData.append('channel', 'khqr')
  formData.append('proof_image', donationForm.value.proof_image)

  if (donationForm.value.transfer_reference) formData.append('transfer_reference', donationForm.value.transfer_reference)
  if (donationForm.value.donor_name) formData.append('donor_name', donationForm.value.donor_name)
  if (donationForm.value.donor_email) formData.append('donor_email', donationForm.value.donor_email)
  if (donationForm.value.note) formData.append('note', donationForm.value.note)
  formData.append('metadata[source]', 'home_page')

  donationSubmitting.value = true

  try {
    await api.post('/support/donations/confirm', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    donationDialog.value = false
    donationForm.value = createDonationForm()
    $q.notify({ type: 'positive', message: 'Donation confirmation submitted' })
  } finally {
    donationSubmitting.value = false
  }
}

function scrollToSupport() {
  const target = document.getElementById('support-khmerdevcommunity')
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(async () => {
  loading.value = true

  try {
    await Promise.all([
      community.home ? Promise.resolve() : community.fetchHome(),
      fetchDonationSupport(),
    ])
  } finally {
    loading.value = false
  }
})
</script>
