<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label khmer-copy">Project Launchpad</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Projects, repositories, and collaboration signals in one directory</div>
        <div class="text-body2 muted-text q-mt-sm">Expose serious work, show the stack, and make collaboration intent clear without turning the page into a dump of links.</div>
      </div>
      <div class="page-actions">
        <q-btn
          color="primary"
          no-caps
          icon="rocket_launch"
          label="Add project"
          :disable="!session.isAuthenticated"
          @click="dialogOpen = true"
        />
      </div>
    </div>

    <div class="content-card q-pa-lg q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <div class="section-label khmer-copy">Project Launchpad</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Submit projects and find collaborators</div>
          <div class="text-body2 muted-text q-mt-sm">Expose serious work, show the stack, and signal clearly when collaborators are needed.</div>
        </div>
      </div>
      <div class="summary-grid q-mt-lg">
        <div class="inline-stat">
          <div class="card-meta">Projects</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ projects.length }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Open To Collaborate</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ openCollabCount }}</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Stacks</div>
          <div class="text-h6 text-weight-bold q-mt-xs">{{ stackCount }}</div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div v-for="project in projects" :key="project.id" class="col-12 col-lg-6">
        <div class="content-card q-pa-lg full-height">
          <div class="utility-card__head">
            <div>
              <div class="card-title">{{ project.name }}</div>
              <div class="text-body1 muted-text q-mt-sm">{{ project.tagline }}</div>
            </div>
            <q-chip square class="theme-chip theme-chip-warning">{{ project.status }}</q-chip>
          </div>
          <div class="text-body2 muted-text q-mt-md">{{ project.summary }}</div>
          <div class="utility-card__meta q-mt-lg">
            <q-chip v-for="tech in project.tech_stack || []" :key="tech" square class="theme-chip theme-chip-secondary">
              {{ tech }}
            </q-chip>
            <q-chip v-if="project.looking_for_collaborators" square class="theme-chip theme-chip-success">
              Looking for collaborators
            </q-chip>
          </div>
          <div class="utility-card__meta q-mt-lg">
            <span class="card-meta">By {{ project.user.name }}</span>
            <span class="card-meta">{{ project.contributors_count }} contributors</span>
            <span class="card-meta">{{ project.stars_count }} stars</span>
          </div>
          <div class="card-divider q-mt-lg q-mb-md" />
          <div class="row items-center justify-between">
            <div class="card-meta">{{ project.repo_url ? 'Repository linked' : 'No repository yet' }}</div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                v-if="session.isAuthenticated"
                flat
                no-caps
                :color="project.is_saved ? 'secondary' : 'grey-5'"
                :icon="project.is_saved ? 'bookmark' : 'bookmark_border'"
                label="Save"
                @click="toggleBookmark(project.id)"
              />
              <q-btn v-if="project.repo_url" flat no-caps color="secondary" icon="north_east" label="Open repo" :href="project.repo_url" target="_blank" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="dialogOpen">
      <q-card class="theme-dialog">
        <q-card-section>
          <div class="section-label khmer-copy">Submit Project</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Add a project to the directory</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="projectForm.name" outlined class="input-surface" label="Project name" />
          <q-input v-model="projectForm.tagline" outlined class="input-surface" label="Tagline" />
          <q-input v-model="projectForm.summary" outlined class="input-surface" type="textarea" autogrow label="Summary" />
          <q-input v-model="projectForm.repo_url" outlined class="input-surface" label="Repo URL" />
          <q-input v-model="projectForm.demo_url" outlined class="input-surface" label="Demo URL" />
          <q-input v-model="stackText" outlined class="input-surface" label="Tech stack (comma separated)" />
          <div class="settings-toggle-row">
            <div class="settings-toggle-row__copy">
              <strong>Looking for collaborators</strong>
              <span>Show this project as open to contributors and collaborators.</span>
            </div>
            <q-toggle v-model="projectForm.looking_for_collaborators" />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps color="secondary" label="Cancel" v-close-popup />
          <q-btn color="primary" no-caps label="Publish project" :loading="submitting" @click="submitProject" />
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

const $q = useQuasar()
const community = useCommunityStore()
const session = useSessionStore()

const dialogOpen = ref(false)
const submitting = ref(false)
const stackText = ref('')
const projectForm = reactive({
  name: '',
  tagline: '',
  summary: '',
  repo_url: '',
  demo_url: '',
  looking_for_collaborators: true,
})

const projects = computed(() => community.projects)
const openCollabCount = computed(() => projects.value.filter((project) => project.looking_for_collaborators).length)
const stackCount = computed(() => new Set(projects.value.flatMap((project) => project.tech_stack || [])).size)

onMounted(() => {
  community.fetchProjects()
})

async function submitProject() {
  submitting.value = true

  try {
    await community.createProject({
      ...projectForm,
      tech_stack: stackText.value.split(',').map((item) => item.trim()).filter(Boolean),
    })
    Object.assign(projectForm, {
      name: '',
      tagline: '',
      summary: '',
      repo_url: '',
      demo_url: '',
      looking_for_collaborators: true,
    })
    stackText.value = ''
    dialogOpen.value = false
    $q.notify({ type: 'positive', message: 'Project added' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to add project' })
  } finally {
    submitting.value = false
  }
}

async function toggleBookmark(projectId) {
  try {
    await community.toggleProjectBookmark(projectId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save project' })
  }
}
</script>
