<template>
  <q-page class="q-pa-md q-pb-xl">
    <div class="content-card q-pa-sm" style="border-radius: 20px">
      <div class="section-label">Composer</div>
      <div class="text-subtitle2 text-weight-bold q-mt-sm q-mb-md">Publish a fast update from mobile</div>
      <q-input v-model="form.title" borderless class="input-surface" label="Title" />
      <q-separator spaced class="theme-separator" />
      <q-input v-model="form.topic" borderless class="input-surface" label="Topic" />
      <q-separator spaced class="theme-separator" />
      <q-input v-model="form.excerpt" borderless class="input-surface" label="Excerpt" />
      <q-separator spaced class="theme-separator" />
      <q-input v-model="form.body" autogrow borderless class="input-surface" label="Share what you shipped, learned, or need help with" type="textarea" />
    </div>

    <div class="stack-card q-pa-sm q-mt-sm" style="border-radius: 20px">
      <div class="text-subtitle2 text-weight-bold">Topics</div>
      <div class="text-body2 muted-text q-mt-xs">Use a clear topic so the post is easier to scan in the feed.</div>
      <div class="q-gutter-sm q-mt-sm">
        <q-chip v-for="topic in topics" :key="topic" square class="theme-chip theme-chip-primary" @click="form.topic = topic">
          {{ topic }}
        </q-chip>
      </div>
    </div>

    <q-btn class="full-width q-mt-md" color="primary" no-caps label="Publish update" :loading="submitting" @click="publish" />
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
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
})
const topics = ['Laravel', 'Vue', 'Flutter', 'AI', 'DevOps', 'Khmer OSS']

async function publish() {
  submitting.value = true

  try {
    await community.createPost(form)
    $q.notify({ type: 'positive', message: 'Post published' })
    await router.push('/m/feed')
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to publish post' })
  } finally {
    submitting.value = false
  }
}
</script>
