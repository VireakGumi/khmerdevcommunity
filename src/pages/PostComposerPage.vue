<template>
  <q-page padding>
    <div class="page-intro q-mb-lg">
      <div>
        <div class="section-label khmer-copy">Create Post</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Publish to the Khmer developer feed</div>
        <div class="text-body2 muted-text q-mt-sm">Share a launch, lesson, technical note, or request for help without leaving the web app.</div>
      </div>
      <div class="page-actions">
        <q-btn flat no-caps color="secondary" icon="rss_feed" label="Back to feed" to="/feed" />
      </div>
    </div>

    <div class="hero-grid">
      <section class="content-card q-pa-lg motif-frame">
        <div class="section-label khmer-copy">Composer</div>
        <div class="text-subtitle1 text-weight-bold q-mt-sm">Write a post that is easy to scan</div>

        <div class="q-mt-md q-gutter-md">
          <q-input v-model="form.title" outlined class="input-surface" label="Title" />
          <q-input v-model="form.topic" outlined class="input-surface" label="Topic" />
          <q-input v-model="form.excerpt" outlined class="input-surface" label="Excerpt" />
          <q-select v-model="form.type" outlined emit-value map-options class="input-surface" label="Post type" :options="postTypes" />
          <q-input
            v-model="form.body"
            outlined
            autogrow
            type="textarea"
            class="input-surface"
            label="Share what you shipped, learned, or need help with"
          />
          <q-file v-model="form.images" outlined multiple clearable class="input-surface" label="Images" accept=".jpg,.jpeg,.png,.webp" />
          <div v-if="previewUrls.length" class="row q-col-gutter-sm">
            <div v-for="src in previewUrls" :key="src" class="col-6 col-md-4">
              <q-img :src="src" ratio="1" class="rounded-borders" />
            </div>
          </div>
        </div>

        <div class="hero-actions q-mt-md">
          <q-btn color="primary" no-caps label="Publish update" :loading="submitting" @click="publish" />
          <q-btn flat no-caps color="secondary" label="Clear draft" @click="resetForm" />
        </div>
      </section>

      <aside class="welcome-panel">
        <div class="content-card q-pa-md">
          <div class="section-label khmer-copy">Topics</div>
          <div class="text-subtitle2 text-weight-bold q-mt-sm">Pick a clear topic</div>
          <div class="q-gutter-sm q-mt-sm">
            <q-chip v-for="topic in topics" :key="topic" square class="theme-chip theme-chip-primary" @click="form.topic = topic">
              {{ topic }}
            </q-chip>
          </div>
        </div>

        <div class="content-card q-pa-md">
          <div class="section-label khmer-copy">Publishing Notes</div>
          <div class="feature-stack q-mt-sm">
            <div class="mini-card">
              <div class="mini-card-title">Lead with one clear point</div>
              <div class="mini-card-copy q-mt-xs">A strong title and excerpt help the feed stay readable even when activity is dense.</div>
            </div>
            <div class="mini-card">
              <div class="mini-card-title">Write for collaborators</div>
              <div class="mini-card-copy q-mt-xs">Say what changed, what is blocked, and what kind of feedback or help you need.</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCommunityStore } from 'src/stores/community-store'

const $q = useQuasar()
const router = useRouter()
const community = useCommunityStore()

const submitting = ref(false)
const form = reactive({
  title: '',
  topic: '',
  excerpt: '',
  body: '',
  type: 'text',
  images: [],
})

const topics = ['Laravel', 'Vue', 'Flutter', 'AI', 'DevOps', 'Khmer OSS']
const postTypes = [
  { label: 'Text update', value: 'text' },
  { label: 'Image update', value: 'image' },
  { label: 'Link share', value: 'link_share' },
  { label: 'Code snippet', value: 'code_snippet' },
]
const previewUrls = computed(() => (form.images || []).map((file) => URL.createObjectURL(file)))

function resetForm() {
  form.title = ''
  form.topic = ''
  form.excerpt = ''
  form.body = ''
  form.type = 'text'
  form.images = []
}

async function publish() {
  submitting.value = true

  try {
    await community.createPost(form)
    $q.notify({ type: 'positive', message: 'Post published' })
    await router.push('/feed')
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to publish post' })
  } finally {
    submitting.value = false
  }
}
</script>
