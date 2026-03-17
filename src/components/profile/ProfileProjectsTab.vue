<template>
  <div class="portfolio-tab-stack">
    <section class="content-card portfolio-section q-pa-lg">
      <div class="portfolio-section-head">
        <div class="section-label">Selected Work</div>
        <h2 class="portfolio-section-title">Projects, case studies, and proof of execution</h2>
      </div>

      <div class="portfolio-showcase-list">
        <article v-for="work in profile.featured_work || []" :key="work.title" class="portfolio-showcase-card">
          <div class="portfolio-showcase-card__head">
            <div>
              <div class="mini-card-title">{{ work.title }}</div>
              <div class="card-meta q-mt-xs">{{ work.stack || 'Stack not specified' }}</div>
            </div>
            <q-btn v-if="work.link" flat no-caps color="primary" icon="north_east" label="Open" :href="work.link" target="_blank" />
          </div>
          <div class="mini-card-copy q-mt-sm">{{ work.description }}</div>
        </article>
      </div>
    </section>

    <section class="content-card portfolio-section q-pa-lg q-mt-md">
      <div class="portfolio-section-head">
        <div class="section-label">Project Library</div>
        <h2 class="portfolio-section-title">Public launches and maintained work</h2>
      </div>

      <div class="portfolio-project-grid">
        <article v-for="project in visibleProjects" :key="project.id" class="portfolio-project-card">
          <div class="portfolio-project-card__head">
            <div>
              <div class="mini-card-title">{{ project.name }}</div>
              <div class="card-meta q-mt-xs">{{ project.status }} · {{ project.stars_count }} stars</div>
            </div>
            <q-chip v-if="project.looking_for_collaborators" square dense class="theme-chip theme-chip-success">Open to collab</q-chip>
          </div>
          <div class="mini-card-copy q-mt-sm">{{ project.tagline || project.summary }}</div>
          <div class="portfolio-project-card__meta q-mt-md">
            <span>{{ formatDate(project.launched_at || project.created_at) }}</span>
            <span>{{ project.contributors_count }} contributors</span>
          </div>
          <div v-if="project.tech_stack?.length" class="portfolio-project-stack q-mt-sm">
            <span v-for="stack in project.tech_stack.slice(0, 4)" :key="stack" class="portfolio-skill-pill">{{ stack }}</span>
          </div>
          <div class="portfolio-card-actions q-mt-md">
            <q-btn
              flat
              no-caps
              :color="project.is_saved ? 'secondary' : 'grey-5'"
              :icon="project.is_saved ? 'bookmark' : 'bookmark_border'"
              :label="project.is_saved ? 'Saved' : 'Save project'"
              :disable="!isAuthenticated"
              @click="$emit('toggle-project-bookmark', project.id)"
            />
            <q-btn v-if="project.demo_url" flat no-caps color="primary" icon="north_east" label="Live demo" :href="project.demo_url" target="_blank" />
          </div>
        </article>
      </div>
    </section>

    <section v-if="openSourceProjects.length" class="content-card portfolio-section q-pa-lg q-mt-md">
      <div class="portfolio-section-head">
        <div class="section-label">Open Source</div>
        <h2 class="portfolio-section-title">Public repositories and contribution-ready projects</h2>
      </div>

      <div class="portfolio-project-grid">
        <article v-for="project in openSourceProjects" :key="`oss-${project.id}`" class="portfolio-project-card">
          <div class="portfolio-project-card__head">
            <div>
              <div class="mini-card-title">{{ project.name }}</div>
              <div class="card-meta q-mt-xs">Repository available · {{ project.contributors_count }} contributors</div>
            </div>
            <q-btn flat no-caps color="primary" icon="code" label="Repo" :href="project.repo_url" target="_blank" />
          </div>
          <div class="mini-card-copy q-mt-sm">{{ project.summary || project.tagline }}</div>
          <div v-if="project.tech_stack?.length" class="portfolio-project-stack q-mt-md">
            <span v-for="stack in project.tech_stack.slice(0, 4)" :key="`oss-${project.id}-${stack}`" class="portfolio-skill-pill">{{ stack }}</span>
          </div>
          <div class="portfolio-card-actions q-mt-md">
            <q-btn
              flat
              no-caps
              :color="project.is_saved ? 'secondary' : 'grey-5'"
              :icon="project.is_saved ? 'bookmark' : 'bookmark_border'"
              :label="project.is_saved ? 'Saved' : 'Save project'"
              :disable="!isAuthenticated"
              @click="$emit('toggle-project-bookmark', project.id)"
            />
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { formatDate } from 'src/utils/formatters'

defineProps({
  profile: { type: Object, required: true },
  visibleProjects: { type: Array, required: true },
  openSourceProjects: { type: Array, required: true },
  isAuthenticated: { type: Boolean, default: false },
})

defineEmits(['toggle-project-bookmark'])
</script>
