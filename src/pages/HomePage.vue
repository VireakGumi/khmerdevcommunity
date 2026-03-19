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

    <section class="content-card q-pa-lg home-dashboard-shell">
      <div class="portfolio-section-head home-board__head">
        <div>
          <div class="section-label">How to Use It</div>
          <h2 class="portfolio-section-title">A simpler product map for new members</h2>
        </div>
        <q-btn flat no-caps color="primary" label="Browse developers" to="/developers" />
      </div>

      <div class="home-item-list q-mt-md home-item-list--compact">
        <article class="home-item">
          <div class="mini-card-title">1. Join the conversation</div>
          <div class="mini-card-copy q-mt-sm">Use the feed to share updates, comment on work, and follow what Khmer builders are discussing now.</div>
        </article>
        <article class="home-item">
          <div class="mini-card-title">2. Launch a project</div>
          <div class="mini-card-copy q-mt-sm">Publish your repo, stack, and collaboration needs so other developers can discover and join it.</div>
        </article>
        <article class="home-item">
          <div class="mini-card-title">3. Turn profile into portfolio</div>
          <div class="mini-card-copy q-mt-sm">Keep your social activity inside the app while exposing a public portfolio page when you are ready.</div>
        </article>
      </div>
    </section>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCommunityStore } from 'src/stores/community-store'
import { formatDate } from 'src/utils/formatters'

const community = useCommunityStore()
const home = computed(() => community.home)
const loading = ref(false)

const featuredProjects = computed(() => (home.value?.featuredProjects || []).slice(0, 4))
const featuredJobs = computed(() => (home.value?.featuredJobs || []).slice(0, 4))
const featuredEvents = computed(() => (home.value?.featuredEvents || []).slice(0, 4))
const featuredDevelopers = computed(() => (home.value?.developers || []).slice(0, 4))

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

onMounted(async () => {
  if (!community.home) {
    loading.value = true
    try {
      await community.fetchHome()
    } finally {
      loading.value = false
    }
  }
})
</script>
