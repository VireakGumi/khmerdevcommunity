<template>
  <q-page class="q-pa-md q-pb-xl mobile-post-page">
    <div class="content-card q-pa-md mobile-post-card">
      <div class="section-label">Composer</div>
      <div class="text-h6 text-weight-bold q-mt-sm">Publish a fast update from mobile</div>
      <div class="text-body2 muted-text q-mt-sm">Share a launch, ask for feedback, or post a quick community signal without the desktop flow.</div>

      <div class="q-mt-md q-gutter-md">
        <q-input v-model="form.title" outlined class="input-surface" label="Title" />
        <q-input v-model="form.topic" outlined class="input-surface" label="Topic" />
        <q-input v-model="form.excerpt" outlined autogrow class="input-surface" label="Short summary" />
        <q-input
          v-model="form.body"
          autogrow
          outlined
          class="input-surface"
          label="Share what you shipped, learned, or need help with"
          type="textarea"
        />
      </div>
    </div>

    <div class="content-card q-pa-md q-mt-md">
      <div class="text-subtitle2 text-weight-bold">Attach images</div>
      <div class="text-body2 muted-text q-mt-xs">Add screenshots or proof of work. The feed will crop them cleanly.</div>
      <q-file
        v-model="images"
        outlined
        multiple
        use-chips
        accept=".jpg,.jpeg,.png,.webp"
        class="input-surface q-mt-md"
        label="Choose images"
      />

      <div v-if="imagePreviews.length" class="mobile-post-previews q-mt-md">
        <div v-for="preview in imagePreviews" :key="preview" class="mobile-post-previews__item">
          <q-img :src="preview" fit="cover" class="rounded-borders mobile-post-previews__image" />
        </div>
      </div>
    </div>

    <div class="stack-card q-pa-md q-mt-md">
      <div class="text-subtitle2 text-weight-bold">Quick topics</div>
      <div class="text-body2 muted-text q-mt-xs">Use a clear topic so the post is easier to scan in the feed.</div>
      <div class="q-gutter-sm q-mt-sm">
        <q-chip v-for="topic in topics" :key="topic" square class="theme-chip theme-chip-primary" @click="form.topic = topic">
          {{ topic }}
        </q-chip>
      </div>
    </div>

    <div class="mobile-post-submit">
      <q-btn
        class="full-width"
        color="primary"
        no-caps
        label="Publish update"
        :loading="submitting"
        :disable="!canPublish"
        @click="publish"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCommunityStore } from 'src/stores/community-store'

const $q = useQuasar()
const router = useRouter()
const community = useCommunityStore()

const submitting = ref(false)
const images = ref([])
const imagePreviews = ref([])
const form = reactive({
  title: '',
  topic: '',
  excerpt: '',
  body: '',
})
const topics = ['Laravel', 'Vue', 'Flutter', 'AI', 'DevOps', 'Jobs', 'Khmer OSS']

const canPublish = computed(() => Boolean(form.title.trim() && form.body.trim()) && !submitting.value)

function revokePreviews() {
  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url))
  imagePreviews.value = []
}

watch(images, (files = []) => {
  revokePreviews()
  imagePreviews.value = files.map((file) => URL.createObjectURL(file))
})

onBeforeUnmount(() => {
  revokePreviews()
})

async function publish() {
  if (!canPublish.value) {
    return
  }

  submitting.value = true

  try {
    await community.createPost({
      ...form,
      images: images.value,
    })
    $q.notify({ type: 'positive', message: 'Post published' })
    await router.push('/m/feed')
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to publish post' })
  } finally {
    submitting.value = false
  }
}
</script>
