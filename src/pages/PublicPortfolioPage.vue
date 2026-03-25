<template>
  <q-page padding class="portfolio-page-screen">
    <div v-if="loading" class="portfolio-page kdc-page-shell">
      <section class="content-card q-pa-lg q-mb-lg page-skeleton-panel">
        <q-skeleton square height="240px" class="rounded-borders" />
        <div class="row q-col-gutter-lg q-mt-lg items-center">
          <div class="col-auto">
            <q-skeleton type="QAvatar" size="96px" />
          </div>
          <div class="col">
            <q-skeleton type="text" width="24%" />
            <q-skeleton type="text" width="52%" class="q-mt-sm" />
            <q-skeleton type="text" width="72%" class="q-mt-sm" />
          </div>
        </div>
      </section>

      <div class="portfolio-pro-grid portfolio-pro-grid--wide kdc-page-grid">
        <main class="portfolio-pro-main">
          <section v-for="section in 4" :key="`portfolio-skeleton-${section}`" class="content-card q-pa-lg q-mb-lg page-skeleton-panel">
            <q-skeleton type="text" width="18%" />
            <q-skeleton type="text" width="38%" class="q-mt-sm" />
            <div class="q-mt-md">
              <q-skeleton type="text" class="q-mt-sm" />
              <q-skeleton type="text" width="88%" class="q-mt-xs" />
              <q-skeleton type="text" width="72%" class="q-mt-xs" />
            </div>
          </section>
        </main>
        <aside class="portfolio-pro-side">
          <section v-for="card in 3" :key="`portfolio-side-skeleton-${card}`" class="content-card q-pa-lg q-mb-lg page-skeleton-panel">
            <q-skeleton type="text" width="42%" />
            <q-skeleton type="text" width="76%" class="q-mt-sm" />
            <q-skeleton type="text" width="64%" class="q-mt-xs" />
          </section>
        </aside>
      </div>
    </div>

    <div v-if="profile" class="portfolio-page kdc-page-shell">
      <ProfileHeaderBar
        :model-value="activeTab"
        :profile="profile"
        :tabs="profileTabs"
        :is-mobile="isMobile"
        :can-follow="canFollow"
        :can-message="canMessage"
        :is-own-profile="isOwnProfile"
        @select-tab="scrollToTab"
        @copy-link="copyProfileLink"
        @toggle-follow="toggleFollow()"
      />

      <ProfileHero
        :profile="profile"
        :hero-primary="heroPrimary"
        :hero-secondary="heroSecondary"
        :profile-facts="profileFacts"
        :social-actions="socialActions"
        :hero-stats="heroStats"
        :achievement-badges="achievementBadges"
      />

      <div class="portfolio-pro-grid portfolio-pro-grid--wide kdc-page-grid">
        <main class="portfolio-pro-main">
          <section
            id="portfolio-tab-overview"
            class="portfolio-tab-section"
            data-portfolio-section="overview"
          >
            <ProfileOverviewTab
              :profile="profile"
              :focus-items="focusItems"
              :headline-stats="headlineStats"
              :all-achievement-badges="allAchievementBadges"
              :activity-timeline="activityTimeline"
            />
          </section>

          <section
            id="portfolio-tab-projects"
            class="portfolio-tab-section"
            data-portfolio-section="projects"
          >
            <ProfileProjectsTab
              :profile="profile"
              :visible-projects="visibleProjects"
              :open-source-projects="openSourceProjects"
              :is-authenticated="session.isAuthenticated"
              @toggle-project-bookmark="toggleProjectBookmark"
            />
          </section>

          <section
            id="portfolio-tab-posts"
            class="portfolio-tab-section"
            data-portfolio-section="posts"
          >
            <ProfilePostsTab
              :profile="profile"
              :comment-drafts="commentDrafts"
              :is-authenticated="session.isAuthenticated"
              @toggle-like="toggleLike"
              @toggle-post-bookmark="togglePostBookmark"
              @submit-comment="submitComment"
              @share-post="sharePost"
              @update-comment-draft="updateCommentDraft"
            />
          </section>

          <section
            id="portfolio-tab-experience"
            class="portfolio-tab-section"
            data-portfolio-section="experience"
          >
            <ProfileExperienceTab
              :profile="profile"
              :education-and-credentials="educationAndCredentials"
              :is-premium="isPremium"
            />
          </section>
        </main>

        <ProfileSideRail
          :is-mobile="isMobile"
          :mobile-panels="mobilePanels"
          :profile="profile"
          :current-rank="currentRank"
          :engagement-score="engagementScore"
          :contact-summary="contactSummary"
          :can-message="canMessage"
          :link-items="linkItems"
          :social-actions="socialActions"
          :is-premium="isPremium"
          :recommended-jobs="recommendedJobs"
          :trending-contributors="trendingContributors"
          :current-user-id="session.user?.id || null"
          :is-authenticated="session.isAuthenticated"
          :is-own-profile="isOwnProfile"
          @toggle-follow="toggleFollow"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import ProfileExperienceTab from 'src/components/profile/ProfileExperienceTab.vue'
import ProfileHeaderBar from 'src/components/profile/ProfileHeaderBar.vue'
import ProfileHero from 'src/components/profile/ProfileHero.vue'
import ProfileOverviewTab from 'src/components/profile/ProfileOverviewTab.vue'
import ProfilePostsTab from 'src/components/profile/ProfilePostsTab.vue'
import ProfileProjectsTab from 'src/components/profile/ProfileProjectsTab.vue'
import ProfileSideRail from 'src/components/profile/ProfileSideRail.vue'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'
import { formatRelative } from 'src/utils/formatters'

const $q = useQuasar()
const route = useRoute()
const community = useCommunityStore()
const session = useSessionStore()
const loading = ref(false)

const activeTab = ref('overview')
const commentDrafts = reactive({})

const profile = computed(() => community.publicProfile)
const isMobile = computed(() => $q.screen.width <= 640)
const isOwnProfile = computed(() => session.user?.username === profile.value?.username)
const isPremium = computed(() => profile.value?.portfolio_plan === 'premium')
const canMessage = computed(() => session.isAuthenticated && !isOwnProfile.value && Boolean(profile.value?.id))
const canFollow = computed(() => session.isAuthenticated && !isOwnProfile.value && Boolean(profile.value?.id))

const profileTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'projects', label: 'Projects' },
  { value: 'posts', label: 'Posts' },
  { value: 'experience', label: 'Experience' },
]

function updateActiveTabFromScroll() {
  const entries = profileTabs
    .map((tab) => [tab.value, document.getElementById(`portfolio-tab-${tab.value}`)])
    .filter(([, element]) => Boolean(element))

  if (!entries.length) {
    return
  }

  const offset = isMobile.value ? 140 : 156
  let currentTab = activeTab.value

  for (const [tab, element] of entries) {
    const rect = element.getBoundingClientRect()

    if (rect.top - offset <= 0) {
      currentTab = tab
    }
  }

  activeTab.value = currentTab
}

async function scrollToTab(tab) {
  activeTab.value = tab
  await nextTick()

  const element = document.getElementById(`portfolio-tab-${tab}`)

  if (!element) {
    return
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const linkItems = computed(() => [
  { label: 'GitHub', value: profile.value?.social_links?.github, icon: 'code' },
  { label: 'LinkedIn', value: profile.value?.social_links?.linkedin, icon: 'business_center' },
  { label: 'Portfolio', value: profile.value?.social_links?.portfolio, icon: 'language' },
  { label: 'X', value: profile.value?.social_links?.x, icon: 'alternate_email' },
])

const socialActions = computed(() =>
  [
    { label: 'GitHub', value: profile.value?.social_links?.github, icon: 'code' },
    { label: 'LinkedIn', value: profile.value?.social_links?.linkedin, icon: 'business_center' },
    { label: 'Website', value: profile.value?.social_links?.portfolio, icon: 'language' },
    { label: 'X', value: profile.value?.social_links?.x, icon: 'alternate_email' },
  ].filter((item) => item.value),
)

const heroPrimary = computed(() => profile.value?.profile_palette?.primary || '#5865f2')
const heroSecondary = computed(() => profile.value?.profile_palette?.secondary || '#3b82f6')
const visibleProjects = computed(() => (profile.value?.projects || []).slice(0, 4))
const openSourceProjects = computed(() => (profile.value?.projects || []).filter((project) => project.repo_url).slice(0, 4))
const rankedDevelopers = computed(() => [...community.developers].sort((a, b) => contributorScore(b) - contributorScore(a)))
const recommendedJobs = computed(() => {
  const skills = (profile.value?.skills || []).map((skill) => skill.toLowerCase())
  const location = profile.value?.location?.toLowerCase() || ''
  const availability = profile.value?.availability?.toLowerCase() || ''
  const yearsExperience = (profile.value?.work_experience || []).length
  const preferredLevels = yearsExperience >= 5
    ? ['senior', 'lead']
    : yearsExperience >= 2
      ? ['mid', 'junior']
      : ['intern', 'junior']

  return [...community.jobs]
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
    .slice(0, 4)
})

const currentRank = computed(() => {
  if (!profile.value?.id) {
    return '-'
  }

  const index = rankedDevelopers.value.findIndex((item) => item.id === profile.value.id)
  return index >= 0 ? index + 1 : '-'
})

const trendingContributors = computed(() => rankedDevelopers.value.filter((item) => item.id !== profile.value?.id).slice(0, 4))

const engagementScore = computed(() =>
  contributorScore({
    followers_count: profile.value?.followers_count || 0,
    posts_count: profile.value?.posts_count || 0,
    projects_count: profile.value?.projects_count || 0,
    hosted_events_count: profile.value?.hosted_events_count || 0,
  }),
)

const profileFacts = computed(() =>
  [
    { label: 'Location', value: profile.value?.location || 'Cambodia' },
    { label: 'Company', value: profile.value?.company || 'Independent' },
    { label: 'Plan', value: isPremium.value ? 'Premium portfolio' : 'Core profile' },
  ].filter((item) => item.value),
)

const heroStats = computed(() => [
  { label: 'Followers', value: profile.value?.followers_count || 0 },
  { label: 'Following', value: profile.value?.following_count || 0 },
  { label: 'Posts', value: profile.value?.posts_count || 0 },
  { label: 'Projects', value: profile.value?.projects_count || 0 },
])

const headlineStats = computed(() => [
  { label: 'Writing', value: profile.value?.posts_count || 0 },
  { label: 'Projects', value: profile.value?.projects_count || 0 },
  { label: 'Events', value: profile.value?.hosted_events_count || 0 },
  { label: 'Followers', value: profile.value?.followers_count || 0 },
])

const focusItems = computed(() => [
  { label: 'Availability', value: profile.value?.availability || 'Open to conversation' },
  { label: 'Primary stack', value: (profile.value?.skills || []).slice(0, 3).join(', ') || 'Not listed yet' },
  { label: 'Featured work', value: `${(profile.value?.featured_work || []).length} items` },
])

const educationAndCredentials = computed(() => [
  ...(profile.value?.education_history || []),
  ...(profile.value?.certifications || []),
])

const achievementBadges = computed(() => {
  const badges = []

  if ((profile.value?.projects_count || 0) >= 2) {
    badges.push({ title: 'Builder', copy: 'Ships multiple public projects.', icon: 'rocket_launch' })
  }

  if ((profile.value?.posts_count || 0) >= 3) {
    badges.push({ title: 'Writer', copy: 'Contributes visible ideas to the community.', icon: 'edit_note' })
  }

  if (isPremium.value) {
    badges.push({ title: 'Premium Portfolio', copy: 'Includes deeper proof-of-work sections.', icon: 'workspace_premium' })
  }

  if ((profile.value?.followers_count || 0) >= 1) {
    badges.push({ title: 'Followed', copy: "Other builders track this developer's work.", icon: 'groups' })
  }

  return badges.slice(0, 4)
})

const allAchievementBadges = computed(() => {
  const explicit = (profile.value?.achievements || []).map((item) => ({
    title: item.title,
    issuer: item.issuer,
    year: item.year,
    summary: item.summary,
    icon: 'military_tech',
  }))

  return [...explicit, ...achievementBadges.value.map((item) => ({ ...item, issuer: 'Platform signal' }))].slice(0, 8)
})

const contactSummary = computed(() => {
  if (profile.value?.availability) {
    return `${profile.value.availability}. Use messaging for direct outreach${profile.value?.portfolio_booking_url ? ' or book a call for structured collaboration.' : '.'}`
  }

  return 'Use the profile links or direct messaging to start a conversation.'
})

const activityTimeline = computed(() => {
  const posts = (profile.value?.posts || []).map((post) => ({
    id: post.id,
    type: 'Post',
    title: post.title,
    copy: post.excerpt,
    when: formatRelative(post.published_at),
    icon: 'article',
    date: post.published_at,
  }))

  const projects = (profile.value?.projects || []).map((project) => ({
    id: project.id,
    type: 'Project',
    title: project.name,
    copy: project.tagline || project.summary,
    when: formatRelative(project.created_at || project.launched_at),
    icon: 'terminal',
    date: project.created_at || project.launched_at,
  }))

  return [...posts, ...projects]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)
})

const mobilePanels = computed(() =>
  [
    { key: 'social', label: 'Social Pulse', caption: 'Rank, engagement, and network', icon: 'insights', defaultOpened: true },
    { key: 'contact', label: 'Contact', caption: 'Message and booking actions', icon: 'mail', defaultOpened: true },
    { key: 'links', label: 'Links', caption: 'GitHub, LinkedIn, and website', icon: 'link', defaultOpened: false },
    { key: 'skills', label: 'Skills', caption: 'Primary tech stack', icon: 'terminal', defaultOpened: false },
    { key: 'jobs', label: 'Recommended jobs', caption: 'Roles matched to this portfolio', icon: 'work', defaultOpened: false },
    { key: 'signals', label: 'Profile Strength', caption: 'Completeness and visibility', icon: 'verified', defaultOpened: false },
    { key: 'trending', label: 'Trending Contributors', caption: 'Builders to watch', icon: 'trending_up', defaultOpened: false },
    ...(isOwnProfile.value ? [{ key: 'notifications', label: 'Notifications', caption: 'Manage your social flow', icon: 'notifications', defaultOpened: false }] : []),
    { key: 'writing', label: 'Recent Writing', caption: 'Latest public posts', icon: 'article', defaultOpened: false },
  ],
)

function contributorScore(item) {
  return (item.followers_count || 0) * 4 + (item.posts_count || 0) * 3 + (item.projects_count || 0) * 5 + (item.hosted_events_count || 0) * 2
}

function updateCommentDraft({ postId, value }) {
  commentDrafts[postId] = value
}

async function copyProfileLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    $q.notify({ type: 'positive', message: 'Portfolio link copied' })
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to copy portfolio link' })
  }
}

async function toggleFollow(userId = profile.value?.id) {
  if (!userId) {
    return
  }

  try {
    await community.toggleFollow(userId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to update follow' })
  }
}

async function toggleLike(postId) {
  try {
    await community.likePost(postId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to like post' })
  }
}

async function submitComment(postId) {
  try {
    await community.commentOnPost(postId, commentDrafts[postId])
    commentDrafts[postId] = ''
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to add comment' })
  }
}

async function togglePostBookmark(postId) {
  try {
    await community.togglePostBookmark(postId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save post' })
  }
}

async function toggleProjectBookmark(projectId) {
  try {
    await community.toggleProjectBookmark(projectId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save project' })
  }
}

function sharePost(post) {
  navigator.clipboard.writeText(`${window.location.href}#post-${post.id}`)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Post link copied' })
    })
    .catch(() => {
      $q.notify({ type: 'negative', message: 'Failed to copy post link' })
    })
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      community.fetchPublicProfile(route.params.username),
      community.fetchDevelopers(),
      community.fetchJobs({ page: 1, append: false }),
    ])
    await nextTick()
    updateActiveTabFromScroll()
    window.addEventListener('scroll', updateActiveTabFromScroll, { passive: true })
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateActiveTabFromScroll)
})
</script>
