<template>
  <q-page class="project-detail-page" padding>
    <div v-if="loading" class="content-card q-pa-lg page-skeleton-panel">
      <q-skeleton type="text" width="26%" />
      <q-skeleton type="text" width="48%" class="q-mt-sm" />
      <q-skeleton type="text" class="q-mt-lg" />
      <q-skeleton type="text" width="86%" class="q-mt-xs" />
      <q-skeleton square height="220px" class="rounded-borders q-mt-lg" />
    </div>

    <div v-else-if="!project" class="content-card q-pa-xl utility-empty text-center">
      <div class="text-h6 text-weight-bold">{{ $t('projectDetail.notFoundTitle') }}</div>
      <div class="text-body2 muted-text q-mt-sm">{{ $t('projectDetail.notFoundCopy') }}</div>
      <q-btn class="q-mt-md" color="primary" no-caps :label="$t('projectDetail.backToProjects')" :to="backTarget" />
    </div>

    <template v-else>
      <div class="page-intro q-mb-lg">
        <div>
          <div class="section-label">{{ $t('projectDetail.pageLabel') }}</div>
          <div class="text-h4 text-weight-bold q-mt-sm">{{ project.name }}</div>
          <div class="text-body2 muted-text q-mt-sm">{{ project.tagline }}</div>
        </div>
        <div class="page-actions">
          <q-btn flat no-caps color="secondary" icon="arrow_back" :label="$t('eventDetail.back')" :to="backTarget" />
          <q-btn
            v-if="session.isAuthenticated"
            flat
            no-caps
            :color="project.is_saved ? 'secondary' : 'grey-5'"
            :icon="project.is_saved ? 'bookmark' : 'bookmark_border'"
            :label="project.is_saved ? $t('feed.saved') : $t('projectDetail.saveProject')"
            @click="toggleBookmark"
          />
          <q-btn v-if="project.demo_url" flat no-caps color="primary" icon="north_east" :label="$t('projectDetail.liveDemo')" :href="project.demo_url" target="_blank" />
          <q-btn v-if="project.repo_url" flat no-caps color="secondary" icon="code" :label="$t('projectDetail.repository')" :href="project.repo_url" target="_blank" />
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-xl-8">
          <article class="content-card q-pa-lg project-detail-card">
            <div class="utility-card__head">
              <div>
                <div class="card-title">{{ project.name }}</div>
                <div class="text-body1 muted-text q-mt-sm">{{ project.summary }}</div>
              </div>
              <q-chip square class="theme-chip theme-chip-warning">{{ project.status }}</q-chip>
            </div>

            <div class="summary-grid q-mt-lg">
              <div class="inline-stat">
                <div class="card-meta">{{ $t('projectDetail.contributors') }}</div>
                <div class="text-h6 text-weight-bold q-mt-xs">{{ project.contributors_count || 0 }}</div>
              </div>
              <div class="inline-stat">
                <div class="card-meta">{{ $t('projectDetail.stars') }}</div>
                <div class="text-h6 text-weight-bold q-mt-xs">{{ project.stars_count || 0 }}</div>
              </div>
              <div class="inline-stat">
                <div class="card-meta">{{ $t('projectDetail.launched') }}</div>
                <div class="text-h6 text-weight-bold q-mt-xs">{{ formatDate(project.launched_at || project.created_at, { month: 'short', day: 'numeric' }) }}</div>
              </div>
            </div>

            <div v-if="project.tech_stack?.length" class="jobs-badge-row q-mt-lg">
              <q-chip v-for="stack in project.tech_stack" :key="stack" square class="theme-chip theme-chip-secondary">{{ stack }}</q-chip>
              <q-chip v-if="project.looking_for_collaborators" square class="theme-chip theme-chip-success">{{ $t('projectDetail.openToCollaborators') }}</q-chip>
            </div>

            <div class="stack-card q-pa-md q-mt-lg project-detail-proof">
              <div class="section-label">{{ $t('projectDetail.proofOfWork') }}</div>
              <div class="mini-card-copy q-mt-sm">
                Use the repo, demo, and builder profile together to understand what shipped, who built it, and whether the project is open for collaboration.
              </div>
              <div class="row q-col-gutter-sm q-mt-md">
                <div class="col-12 col-md-6">
                  <div class="stack-card q-pa-md full-height">
                    <div class="section-label">Repository</div>
                    <div class="mini-card-copy q-mt-sm">{{ project.repo_url || 'No repository linked yet.' }}</div>
                    <q-btn v-if="project.repo_url" class="q-mt-md" flat no-caps color="primary" icon="code" label="Open repo" :href="project.repo_url" target="_blank" />
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="stack-card q-pa-md full-height">
                    <div class="section-label">Demo</div>
                    <div class="mini-card-copy q-mt-sm">{{ project.demo_url || 'No live demo linked yet.' }}</div>
                    <q-btn v-if="project.demo_url" class="q-mt-md" flat no-caps color="primary" icon="open_in_new" label="Open demo" :href="project.demo_url" target="_blank" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="col-12 col-xl-4">
          <div class="content-card q-pa-md">
            <div class="section-label">{{ $t('projectDetail.builder') }}</div>
            <div class="text-h6 text-weight-bold q-mt-md">{{ project.user?.name }}</div>
            <div class="text-body2 muted-text q-mt-sm">@{{ project.user?.username }}</div>
            <div class="text-body2 muted-text q-mt-sm">{{ project.user?.headline || $t('projectDetail.builderFallback') }}</div>
            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-auto">
                <q-btn flat no-caps color="primary" icon="person" :label="$t('projectDetail.openProfile')" :to="profileTarget" />
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  no-caps
                  color="secondary"
                  icon="mail"
                  :label="$t('jobsPage.message')"
                  :disable="!session.isAuthenticated || !project.user?.id"
                  :to="project.user?.id ? messageTarget : undefined"
                />
              </div>
            </div>
          </div>

          <div v-if="project.is_owner" class="content-card q-pa-md q-mt-md">
            <div class="section-label">{{ $t('eventDetail.ownerControls') }}</div>
            <div class="mini-card-copy q-mt-sm">{{ $t('projectDetail.ownerControlsCopy') }}</div>
            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-auto">
                <q-btn color="primary" no-caps icon="edit" :label="$t('projectDetail.editProject')" @click="openEditDialog" />
              </div>
              <div class="col-auto">
                <q-btn flat no-caps color="negative" icon="delete" :label="$t('feed.delete')" @click="deleteProject" />
              </div>
            </div>
          </div>

          <div v-if="relatedProjects.length" class="content-card q-pa-md q-mt-md">
            <div class="section-label">{{ $t('projectDetail.relatedProjects') }}</div>
            <div class="compact-list q-mt-md">
              <article v-for="item in relatedProjects" :key="item.id" class="utility-card">
                <div class="mini-card-title">{{ item.name }}</div>
                <div class="mini-card-copy q-mt-xs">{{ item.tagline }}</div>
                <q-btn class="q-mt-sm" flat no-caps color="primary" :label="$t('search.open')" :to="projectTarget(item)" />
              </article>
            </div>
          </div>
        </div>
      </div>
    </template>

    <q-dialog v-model="editDialog">
      <q-card class="theme-dialog" style="width: 720px; max-width: 92vw">
        <q-card-section>
          <div class="section-label">Edit Project</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Update project details</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="editForm.name" outlined class="input-surface" label="Project name" />
          <q-input v-model="editForm.tagline" outlined class="input-surface" label="Tagline" />
          <q-input v-model="editForm.summary" outlined class="input-surface" type="textarea" autogrow label="Summary" />
          <q-input v-model="editForm.repo_url" outlined class="input-surface" label="Repo URL" />
          <q-input v-model="editForm.demo_url" outlined class="input-surface" label="Demo URL" />
          <q-input v-model="editStackText" outlined class="input-surface" label="Tech stack (comma separated)" />
          <q-input v-model="editForm.status" outlined class="input-surface" label="Status" />
          <div class="settings-toggle-row">
            <div class="settings-toggle-row__copy">
              <strong>Looking for collaborators</strong>
              <span>Keep the project visible for contributors and collaborators.</span>
            </div>
            <q-toggle v-model="editForm.looking_for_collaborators" />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps color="secondary" label="Cancel" v-close-popup />
          <q-btn color="primary" no-caps label="Save changes" :loading="saving" @click="saveProject" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'
import { formatDate } from 'src/utils/formatters'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const community = useCommunityStore()
const session = useSessionStore()

const loading = ref(false)
const saving = ref(false)
const editDialog = ref(false)
const project = ref(null)
const editStackText = ref('')
const editForm = reactive({
  name: '',
  tagline: '',
  summary: '',
  repo_url: '',
  demo_url: '',
  status: 'active',
  looking_for_collaborators: false,
})

const isMobileShell = computed(() => route.meta.mobileShell)
const backTarget = computed(() => (isMobileShell.value ? '/m/projects' : '/projects'))
const profileTarget = computed(() => {
  const username = project.value?.user?.username
  if (!username) return backTarget.value
  return isMobileShell.value ? `/m/u/${username}` : `/u/${username}`
})
const messageTarget = computed(() => {
  const id = project.value?.user?.id
  if (!id) return isMobileShell.value ? '/m/messages' : '/messages'
  return isMobileShell.value ? `/m/messages?recipient=${id}` : `/messages?recipient=${id}`
})
const relatedProjects = computed(() => (community.projects || []).filter((item) => item.id !== project.value?.id).slice(0, 3))

function projectTarget(item) {
  return isMobileShell.value ? `/m/projects/${item.slug}` : `/projects/${item.slug}`
}

async function loadProject() {
  loading.value = true

  try {
    project.value = await community.fetchProject(route.params.slug)
  } catch (error) {
    project.value = null
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('projectDetail.loadFailed') })
  } finally {
    loading.value = false
  }
}

async function toggleBookmark() {
  if (!project.value) return

  try {
    await community.toggleProjectBookmark(project.value.id)
    project.value = {
      ...project.value,
      is_saved: !project.value.is_saved,
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('projectDetail.saveFailed') })
  }
}

function openEditDialog() {
  if (!project.value) return

  Object.assign(editForm, {
    name: project.value.name || '',
    tagline: project.value.tagline || '',
    summary: project.value.summary || '',
    repo_url: project.value.repo_url || '',
    demo_url: project.value.demo_url || '',
    status: project.value.status || 'active',
    looking_for_collaborators: Boolean(project.value.looking_for_collaborators),
  })
  editStackText.value = (project.value.tech_stack || []).join(', ')
  editDialog.value = true
}

async function saveProject() {
  if (!project.value) return

  saving.value = true

  try {
    const updated = await community.updateProject(project.value.slug, {
      ...editForm,
      tech_stack: editStackText.value.split(',').map((item) => item.trim()).filter(Boolean),
    })
    project.value = updated
    editDialog.value = false
    $q.notify({ type: 'positive', message: t('projectDetail.updated') })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('projectDetail.updateFailed') })
  } finally {
    saving.value = false
  }
}

function deleteProject() {
  if (!project.value) return

  $q.dialog({
    title: 'Delete project?',
    message: 'This will remove the project from the directory.',
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete', noCaps: true },
    cancelLabel: 'Cancel',
  }).onOk(async () => {
    try {
      await community.deleteProject(project.value.slug, project.value.id)
      $q.notify({ type: 'positive', message: 'Project removed' })
      router.push(backTarget.value)
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to delete project' })
    }
  })
}

onMounted(async () => {
  if (!community.projects.length) {
    community.fetchProjects().catch(() => {})
  }

  await loadProject()
})

watch(() => route.params.slug, loadProject)
</script>
