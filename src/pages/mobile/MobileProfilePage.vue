<template>
  <q-page class="q-pa-md q-pb-xl">
    <div class="content-card portfolio-banner q-pa-md" style="border-radius: 20px">
      <div class="page-intro">
        <div>
          <div class="section-label khmer-copy">Portfolio</div>
          <div class="text-subtitle1 text-weight-bold q-mt-sm">Your mobile identity view</div>
        </div>
        <div class="page-actions">
          <q-btn flat no-caps color="secondary" icon="public" label="Public" :to="`/u/${user?.username}`" />
          <q-btn flat no-caps color="primary" icon="edit" label="Web edit" to="/portfolio" />
        </div>
      </div>

      <div class="q-mt-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="76px" :style="avatarStyle" text-color="white">
              {{ user?.name?.charAt(0) }}
            </q-avatar>
          </div>
          <div class="col">
            <div class="text-h5 text-weight-bold">{{ user?.name }}</div>
            <div class="text-caption muted-text">@{{ user?.username }} · {{ user?.location }}</div>
            <div class="text-caption q-mt-xs" style="color: var(--kdc-warning)">{{ user?.availability }}</div>
          </div>
        </div>

        <div class="text-subtitle1 text-weight-bold q-mt-lg">{{ user?.portfolio_headline || user?.headline }}</div>
        <div class="text-body2 muted-text q-mt-sm">{{ user?.portfolio_summary || user?.bio }}</div>

        <div class="summary-grid q-mt-md">
          <div class="inline-stat">
            <div class="card-meta">Skills</div>
            <div class="text-h6 text-weight-bold q-mt-xs">{{ user?.skills?.length || 0 }}</div>
          </div>
          <div class="inline-stat">
            <div class="card-meta">Work</div>
            <div class="text-h6 text-weight-bold q-mt-xs">{{ user?.featured_work?.length || 0 }}</div>
          </div>
          <div class="inline-stat">
            <div class="card-meta">Links</div>
            <div class="text-h6 text-weight-bold q-mt-xs">{{ activeLinks }}</div>
          </div>
        </div>

        <div class="q-gutter-sm q-mt-md">
          <q-chip v-for="skill in user?.skills || []" :key="skill" square class="theme-chip theme-chip-success">
            {{ skill }}
          </q-chip>
        </div>
      </div>
    </div>

    <div v-if="user?.featured_work?.length" class="mobile-section q-mt-md">
      <div class="section-label khmer-copy">Featured Work</div>
      <div v-for="work in user.featured_work" :key="work.title" class="stack-card q-pa-sm" style="border-radius: 18px">
        <div class="text-subtitle2 text-weight-bold">{{ work.title }}</div>
        <div class="text-body2 muted-text q-mt-xs">{{ work.description }}</div>
        <div class="text-caption muted-text q-mt-xs">{{ work.stack }}</div>
      </div>
    </div>

    <div class="mobile-section q-mt-md">
      <div class="section-label khmer-copy">Links</div>
      <div class="stack-card q-pa-sm" style="border-radius: 18px">
        <div class="q-mt-sm text-body2 muted-text">
          <div v-for="item in linkItems" :key="item.label" class="q-mb-sm">
            <span class="muted-text">{{ item.label }}:</span>
            <span class="q-ml-sm">{{ item.value || 'Not set' }}</span>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSessionStore } from 'src/stores/session-store'

const session = useSessionStore()
const user = computed(() => session.user)

const linkItems = computed(() => [
  { label: 'GitHub', value: user.value?.social_links?.github },
  { label: 'LinkedIn', value: user.value?.social_links?.linkedin },
  { label: 'Portfolio', value: user.value?.social_links?.portfolio },
  { label: 'X', value: user.value?.social_links?.x },
])

const activeLinks = computed(() => linkItems.value.filter((item) => item.value).length)

const avatarStyle = computed(() => ({
  background: user.value?.profile_palette?.primary || '#5865f2',
}))

onMounted(() => {
  if (!session.user && session.token) {
    session.fetchMe()
  }
})
</script>
