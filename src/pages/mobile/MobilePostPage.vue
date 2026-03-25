<template>
  <q-page class="q-pa-md q-pb-xl mobile-post-page">
    <div class="content-card q-pa-md mobile-post-card">
      <div class="section-label">{{ $t('mobilePost.pageLabel') }}</div>
      <div class="text-h6 text-weight-bold q-mt-sm">{{ $t('mobilePost.pageTitle') }}</div>
      <div class="text-body2 muted-text q-mt-sm">{{ $t('mobilePost.pageCopy') }}</div>

      <div class="q-mt-md q-gutter-md">
        <q-input v-model="form.title" outlined class="input-surface" :label="$t('feed.title')" />
        <q-input v-model="form.topic" outlined class="input-surface" :label="$t('feed.topic')" />
        <q-input v-model="form.excerpt" outlined autogrow class="input-surface" :label="$t('mobilePost.shortSummary')" />
        <q-input
          v-model="form.body"
          autogrow
          outlined
          class="input-surface"
          :label="$t('mobilePost.bodyLabel')"
          type="textarea"
        />
      </div>
    </div>

    <div class="content-card q-pa-md q-mt-md">
      <div class="text-subtitle2 text-weight-bold">{{ $t('mobilePost.attachImages') }}</div>
      <div class="text-body2 muted-text q-mt-xs">{{ $t('mobilePost.attachImagesCopy') }}</div>
      <q-file
        v-model="images"
        outlined
        multiple
        use-chips
        accept=".jpg,.jpeg,.png,.webp"
        class="input-surface q-mt-md"
        :label="$t('mobilePost.chooseImages')"
      />

      <div v-if="imagePreviews.length" class="mobile-post-previews q-mt-md">
        <div v-for="preview in imagePreviews" :key="preview" class="mobile-post-previews__item">
          <q-img :src="preview" fit="cover" class="rounded-borders mobile-post-previews__image" />
        </div>
      </div>
    </div>

    <div class="stack-card q-pa-md q-mt-md">
      <div class="text-subtitle2 text-weight-bold">{{ $t('mobilePost.quickTopics') }}</div>
      <div class="text-body2 muted-text q-mt-xs">{{ $t('mobilePost.quickTopicsCopy') }}</div>
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
        :label="$t('mobilePost.publishUpdate')"
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
import { useI18n } from 'vue-i18n'
import { useCommunityStore } from 'src/stores/community-store'

const $q = useQuasar()
const router = useRouter()
const community = useCommunityStore()
const { t } = useI18n()

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
    $q.notify({ type: 'positive', message: t('feed.postPublished') })
    await router.push('/m/feed')
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('feed.publishFailed') })
  } finally {
    submitting.value = false
  }
}
</script>
