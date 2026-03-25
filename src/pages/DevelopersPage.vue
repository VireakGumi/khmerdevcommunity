<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label khmer-copy">{{ $t('developersPage.pageLabel') }}</div>
        <div class="text-h4 text-weight-bold q-mt-sm">{{ $t('developersPage.pageTitle') }}</div>
        <div class="text-body2 muted-text q-mt-sm">{{ $t('developersPage.pageCopy') }}</div>
      </div>
      <div class="page-actions">
        <q-btn v-if="session.isAuthenticated" color="primary" no-caps icon="person" :label="$t('developersPage.openMyPortfolio')" to="/portfolio" />
      </div>
    </div>

    <div class="content-card q-pa-lg q-mb-lg developer-stage-card">
      <div class="row q-col-gutter-md items-start">
        <div class="col-12 col-lg-8">
          <div class="summary-grid">
            <div class="inline-stat">
              <div class="card-meta">{{ $t('developersPage.portfolios') }}</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ filteredDevelopers.length }}</div>
            </div>
            <div class="inline-stat">
              <div class="card-meta">{{ $t('developersPage.available') }}</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ availableCount }}</div>
            </div>
            <div class="inline-stat">
              <div class="card-meta">{{ $t('developersPage.skillsTagged') }}</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ skillsCount }}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="developer-view-toggle">
            <q-btn-toggle
              v-model="viewMode"
              unelevated
              toggle-color="primary"
              color="secondary"
              no-caps
              :options="viewOptions"
            />
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-md-5">
          <q-input v-model="searchTerm" outlined class="input-surface" :label="$t('developersPage.searchBuilders')" :placeholder="$t('developersPage.searchPlaceholder')">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-6 col-md-3">
          <q-select v-model="selectedSkill" outlined dense emit-value map-options class="input-surface" :label="$t('developersPage.skill')" :options="skillOptions" />
        </div>
        <div class="col-6 col-md-2">
          <q-select v-model="selectedAvailability" outlined dense emit-value map-options class="input-surface" :label="$t('developersPage.availability')" :options="availabilityOptions" />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="locationFilter" outlined dense class="input-surface" :label="$t('jobsPage.location')" />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div v-if="loading && !developers.length" class="developer-skeleton-grid">
          <div v-for="index in 4" :key="`developer-skeleton-${index}`" class="content-card q-pa-lg developer-card developer-card--compact">
            <div class="row items-center q-col-gutter-md">
              <div class="col-auto"><q-skeleton type="QAvatar" size="64px" /></div>
              <div class="col">
                <q-skeleton type="text" width="42%" />
                <q-skeleton type="text" width="58%" class="q-mt-xs" />
              </div>
            </div>
            <q-skeleton type="text" width="76%" class="q-mt-md" />
            <q-skeleton type="text" class="q-mt-xs" />
          </div>
        </div>

        <div v-else-if="!filteredDevelopers.length" class="content-card q-pa-xl utility-empty text-center">
          <div class="text-h6 text-weight-bold">{{ $t('developersPage.emptyTitle') }}</div>
          <div class="text-body2 muted-text q-mt-sm">{{ $t('developersPage.emptyCopy') }}</div>
        </div>

        <div
          v-else
          :class="viewMode === 'grid' ? 'row q-col-gutter-lg developer-grid' : 'developer-list q-gutter-md'"
        >
          <template v-for="developer in visibleDevelopers" :key="developer.id">
            <div v-if="viewMode === 'grid'" class="col-12 col-lg-6">
              <q-card flat class="content-card q-pa-lg full-height portfolio-banner portfolio-card developer-card developer-card--compact">
                <div class="developer-card-shell">
                  <div class="developer-card__hero">
                    <q-avatar size="68px" :style="{ background: developer.profile_palette?.primary || '#5865f2' }" text-color="white">
                      <img v-if="developer.avatar_url" :src="developer.avatar_url" :alt="developer.name" />
                      <span v-else>{{ developer.name.charAt(0) }}</span>
                    </q-avatar>
                    <div class="developer-card__intro">
                      <div class="developer-card__title-row">
                        <div>
                          <div class="text-subtitle1 text-weight-bold">{{ developer.name }}</div>
                          <div class="card-meta">@{{ developer.username }} • {{ developer.location || $t('search.cambodia') }}</div>
                        </div>
                        <q-chip square class="theme-chip theme-chip-warning">{{ developer.availability || $t('developersPage.available') }}</q-chip>
                      </div>
                      <div class="mini-card-copy q-mt-sm">{{ developer.portfolio_headline || developer.headline || $t('developersPage.buildingInPublic') }}</div>
                    </div>
                  </div>

                  <div class="developer-badge-row q-mt-md">
                    <q-chip v-for="skill in (developer.skills || []).slice(0, 4)" :key="skill" square class="theme-chip theme-chip-success">{{ skill }}</q-chip>
                    <q-chip square class="theme-chip">{{ developer.projects_count }} {{ $t('developersPage.launches') }}</q-chip>
                  </div>

                  <div class="developer-card__stats q-mt-md">
                    <span class="card-meta">{{ developer.posts_count }} {{ $t('home.posts') }}</span>
                    <span class="card-meta">{{ developer.followers_count }} {{ $t('search.followers') }}</span>
                  </div>

                  <div class="developer-card__actions q-mt-md row items-center q-gutter-sm">
                    <q-btn
                      v-if="session.isAuthenticated && session.user?.id !== developer.id"
                      outline
                      no-caps
                      :color="developer.is_following ? 'secondary' : 'primary'"
                      :icon="developer.is_following ? 'person_remove' : 'person_add'"
                      :label="developer.is_following ? $t('feed.following') : $t('feed.follow')"
                      @click="toggleFollow(developer.id)"
                    />
                    <q-btn color="primary" no-caps icon="north_east" :label="$t('developersPage.portfolio')" :to="`/u/${developer.username}`" />
                  </div>
                </div>
              </q-card>
            </div>

            <div v-else class="content-card q-pa-md developer-list-item">
              <div class="developer-list-item__main">
                <div class="developer-list-item__identity">
                  <q-avatar size="56px" :style="{ background: developer.profile_palette?.primary || '#5865f2' }" text-color="white">
                    <img v-if="developer.avatar_url" :src="developer.avatar_url" :alt="developer.name" />
                    <span v-else>{{ developer.name.charAt(0) }}</span>
                  </q-avatar>
                  <div class="developer-list-item__copy">
                    <div class="text-subtitle2 text-weight-bold">{{ developer.name }}</div>
                    <div class="card-meta">@{{ developer.username }} • {{ developer.location || $t('search.cambodia') }}</div>
                    <div class="mini-card-copy q-mt-xs">{{ developer.portfolio_headline || developer.headline || $t('developersPage.buildingInPublic') }}</div>
                  </div>
                </div>
                <div class="developer-list-item__meta">
                  <q-chip square class="theme-chip theme-chip-warning">{{ developer.availability || $t('developersPage.available') }}</q-chip>
                  <div class="card-meta">{{ developer.followers_count }} {{ $t('search.followers') }}</div>
                </div>
              </div>
              <div class="developer-badge-row q-mt-sm">
                <q-chip v-for="skill in (developer.skills || []).slice(0, 4)" :key="skill" square class="theme-chip theme-chip-success">{{ skill }}</q-chip>
              </div>
              <div class="developer-card__actions q-mt-sm row items-center q-gutter-sm">
                <q-btn
                  v-if="session.isAuthenticated && session.user?.id !== developer.id"
                  outline
                  no-caps
                  :color="developer.is_following ? 'secondary' : 'primary'"
                  :icon="developer.is_following ? 'person_remove' : 'person_add'"
                  :label="developer.is_following ? $t('feed.following') : $t('feed.follow')"
                  @click="toggleFollow(developer.id)"
                />
                <q-btn color="primary" no-caps icon="north_east" :label="$t('developersPage.viewPortfolio')" :to="`/u/${developer.username}`" />
              </div>
            </div>
          </template>
        </div>

        <div v-if="filteredDevelopers.length" class="text-center q-mt-lg">
          <q-btn
            v-if="hasMoreDevelopers"
            outline
            color="primary"
            no-caps
            :label="$t('developersPage.loadMoreDevelopers')"
            :loading="loadingMore"
            @click="loadMore"
          />
          <div v-else class="card-meta">{{ $t('developersPage.noMoreDevelopers') }}</div>
        </div>
      </div>

      <div class="col-12 col-xl-4">
        <div class="content-card q-pa-lg developer-side-card q-mb-md">
          <div class="section-label">{{ $t('developersPage.trendingDevelopers') }}</div>
          <div class="text-h6 text-weight-bold q-mt-md">{{ $t('developersPage.trendingTitle') }}</div>
          <div class="compact-list q-mt-md">
            <div v-for="developer in trendingDevelopers" :key="developer.id" class="developer-rank-row">
              <div class="developer-rank-index">#{{ trendingDevelopers.indexOf(developer) + 1 }}</div>
              <div class="developer-rank-copy">
                <div class="mini-card-title">{{ developer.name }}</div>
                <div class="card-meta">@{{ developer.username }} • Rep {{ developer.followers_count || 0 }}</div>
              </div>
              <q-btn flat dense no-caps color="secondary" :label="$t('home.view')" :to="`/u/${developer.username}`" />
            </div>
          </div>
        </div>

        <div class="content-card q-pa-lg developer-side-card">
          <div class="section-label">{{ $t('developersPage.searchDiscovery') }}</div>
          <div class="text-h6 text-weight-bold q-mt-md">{{ $t('developersPage.discoveryTitle') }}</div>
          <div class="text-body2 muted-text q-mt-sm">{{ $t('developersPage.discoveryCopy') }}</div>
          <div class="developer-search-links q-mt-md">
            <q-btn color="primary" no-caps icon="search" :label="$t('developersPage.openSearch')" to="/search" />
            <q-btn flat no-caps color="secondary" icon="bookmark" :label="$t('nav.saved')" to="/saved" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'

const $q = useQuasar()
const { t } = useI18n()
const community = useCommunityStore()
const session = useSessionStore()

const loading = ref(false)
const loadingMore = ref(false)
const visibleCount = ref(6)
const viewMode = ref('list')
const searchTerm = ref('')
const selectedSkill = ref(null)
const selectedAvailability = ref(null)
const locationFilter = ref('')

const developers = computed(() => community.developers)
const viewOptions = computed(() => [
  { label: t('developersPage.grid'), value: 'grid', icon: 'grid_view' },
  { label: t('developersPage.list'), value: 'list', icon: 'view_agenda' },
])
const skillOptions = computed(() => [
  { label: t('developersPage.allSkills'), value: null },
  ...new Set(developers.value.flatMap((developer) => developer.skills || [])).values(),
].map((item) => (typeof item === 'string' ? { label: item, value: item } : item)))
const availabilityOptions = computed(() => [
  { label: t('developersPage.anyStatus'), value: null },
  { label: t('developersPage.available'), value: 'available' },
  { label: t('developersPage.mentoring'), value: 'mentoring' },
])

const filteredDevelopers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const location = locationFilter.value.trim().toLowerCase()

  return developers.value.filter((developer) => {
    const haystack = [
      developer.name,
      developer.username,
      developer.location,
      developer.company,
      developer.headline,
      developer.portfolio_headline,
      ...(developer.skills || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const skillMatch = !selectedSkill.value || (developer.skills || []).includes(selectedSkill.value)
    const availabilityMatch = !selectedAvailability.value || (developer.availability || '').toLowerCase().includes(selectedAvailability.value)
    const locationMatch = !location || (developer.location || '').toLowerCase().includes(location)

    return (!term || haystack.includes(term)) && skillMatch && availabilityMatch && locationMatch
  })
})

const visibleDevelopers = computed(() => filteredDevelopers.value.slice(0, visibleCount.value))
const hasMoreDevelopers = computed(() => visibleDevelopers.value.length < filteredDevelopers.value.length)
const availableCount = computed(() => filteredDevelopers.value.filter((developer) => developer.availability).length)
const skillsCount = computed(() => new Set(filteredDevelopers.value.flatMap((developer) => developer.skills || [])).size)
const trendingDevelopers = computed(() => [...developers.value].sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0)).slice(0, 4))

onMounted(async () => {
  if (!community.developers.length) {
    loading.value = true
    try {
      await community.fetchDevelopers()
    } finally {
      loading.value = false
    }
  }
})

function loadMore() {
  if (loadingMore.value || !hasMoreDevelopers.value) return
  loadingMore.value = true
  window.setTimeout(() => {
    visibleCount.value += viewMode.value === 'grid' ? 4 : 6
    loadingMore.value = false
  }, 180)
}

async function toggleFollow(userId) {
  try {
    await community.toggleFollow(userId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('feed.followFailed') })
  }
}
</script>
