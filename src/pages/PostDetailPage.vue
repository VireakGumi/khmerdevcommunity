<template>
  <q-page class="post-detail-page" padding>
    <div v-if="loading" class="content-card q-pa-lg page-skeleton-panel">
      <div class="row items-center justify-between">
        <q-skeleton type="text" width="24%" />
        <q-skeleton type="text" width="18%" />
      </div>
      <q-skeleton type="text" width="62%" class="q-mt-lg" />
      <q-skeleton type="text" class="q-mt-sm" />
      <q-skeleton square height="280px" class="rounded-borders q-mt-md" />
      <q-skeleton type="text" class="q-mt-lg" />
      <q-skeleton type="text" width="88%" class="q-mt-sm" />
    </div>

    <div v-else-if="!post" class="content-card q-pa-xl utility-empty text-center">
      <div class="text-h6 text-weight-bold">Post not found</div>
      <div class="text-body2 muted-text q-mt-sm">This update may have been removed or is no longer available.</div>
      <q-btn class="q-mt-md" color="primary" no-caps label="Back to feed" :to="backTarget" />
    </div>

    <template v-else>
      <div class="page-intro q-mb-lg post-detail-intro">
        <div>
          <div class="section-label">Feed Detail</div>
          <div class="text-h4 text-weight-bold q-mt-sm">{{ post.title }}</div>
          <div class="text-body2 muted-text q-mt-sm">Read the full update, view media, and keep the discussion in one place.</div>
        </div>
        <div class="page-actions post-detail-page-actions">
          <q-btn flat no-caps color="secondary" icon="arrow_back" label="Back to feed" :to="backTarget" />
          <q-btn flat no-caps color="grey-6" icon="content_copy" label="Copy link" @click="copyLink" />
          <q-btn flat no-caps color="primary" icon="share" label="Share" @click="sharePost" />
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-xl-8">
          <article class="content-card q-pa-lg feed-post-card post-detail-card">
            <div class="feed-post-head">
              <div class="feed-post-author">
                <q-avatar size="52px" class="feed-post-avatar" color="primary" text-color="white">
                  <img v-if="post.user?.avatar_url" :src="post.user.avatar_url" :alt="post.user?.name || 'Author avatar'" />
                  <span v-else>{{ post.user?.name?.charAt(0) || '?' }}</span>
                </q-avatar>
                <div class="feed-post-copy">
                  <div class="feed-post-meta-line">
                    <strong>{{ post.user?.name }}</strong>
                    <span class="card-meta">@{{ post.user?.username || post.user?.name?.toLowerCase().replace(/\s+/g, '') }}</span>
                    <span class="card-meta">• {{ formatRelative(post.published_at) }}</span>
                  </div>
                  <div class="feed-post-kickers">
                    <q-chip
                      v-if="postTypeBadge(post)"
                      square
                      :class="['theme-chip', postTypeBadge(post).tone]"
                    >
                      {{ postTypeBadge(post).label }}
                    </q-chip>
                    <q-chip v-if="post.topic" square class="theme-chip theme-chip-primary">{{ post.topic }}</q-chip>
                    <q-chip v-if="post.pinned" square class="theme-chip theme-chip-success">Pinned</q-chip>
                  </div>
                </div>
              </div>
              <q-btn
                flat
                round
                dense
                icon="person"
                color="grey-6"
                :to="profileTarget"
              />
            </div>

            <div class="feed-post-body q-mt-md">
              <div class="text-body1 muted-text">{{ post.excerpt }}</div>
              <div v-if="post.media?.length" class="row q-col-gutter-sm q-mt-lg feed-media-grid">
                <div
                  v-for="(src, index) in post.media"
                  :key="src"
                  class="col-12"
                  :class="[
                    post.media.length > 1 ? 'col-md-6' : '',
                    post.media.length > 1 ? 'feed-media-grid__item--multi' : 'feed-media-grid__item--single',
                  ]"
                >
                  <q-img
                    :src="src"
                    loading="lazy"
                    fit="cover"
                    class="rounded-borders feed-media-thumb"
                    @click="openMediaViewer(post.media, index, post.title)"
                  >
                    <div class="feed-media-thumb__overlay">
                      <q-icon name="open_in_full" size="20px" />
                    </div>
                  </q-img>
                </div>
              </div>
              <div class="post-detail-richtext q-mt-lg">{{ post.body }}</div>
            </div>

            <div class="post-detail-summary q-mt-lg">
              <div class="post-detail-summary__item">
                <span class="card-meta">Posted</span>
                <strong>{{ formatPublished(post.published_at) }}</strong>
              </div>
              <div class="post-detail-summary__item">
                <span class="card-meta">Author</span>
                <strong>@{{ post.user?.username || 'builder' }}</strong>
              </div>
              <div class="post-detail-summary__item">
                <span class="card-meta">Topic</span>
                <strong>{{ post.topic || 'General' }}</strong>
              </div>
            </div>

            <div class="feed-post-stats q-mt-lg">
              <div class="card-meta">{{ post.likes_count }} likes</div>
              <div class="card-meta">{{ post.comments_count }} comments</div>
              <div class="card-meta">{{ post.reading_time }} min read</div>
            </div>

            <div class="feed-post-actions q-mt-md">
              <q-btn
                flat
                no-caps
                :color="post.is_liked ? 'primary' : 'grey-5'"
                :icon="post.is_liked ? 'favorite' : 'favorite_border'"
                :label="post.is_liked ? 'Liked' : 'Like'"
                :loading="liking"
                :disable="!session.isAuthenticated || liking"
                @click="toggleLike"
              />
              <q-btn
                flat
                no-caps
                :color="post.is_saved ? 'secondary' : 'grey-5'"
                :icon="post.is_saved ? 'bookmark' : 'bookmark_border'"
                :label="post.is_saved ? 'Saved' : 'Save'"
                :loading="bookmarking"
                :disable="!session.isAuthenticated || bookmarking"
                @click="toggleBookmark"
              />
            </div>

            <q-separator spaced class="theme-separator" />

            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="section-label">Discussion</div>
                <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ post.comments?.length || 0 }} visible comments</div>
              </div>
              <q-chip square class="theme-chip theme-chip-secondary">{{ post.comments_count || 0 }} total</q-chip>
            </div>

            <div v-if="post.comments?.length" class="compact-list feed-comment-list">
              <div
                v-for="comment in post.comments"
                :key="comment.id"
                class="stack-card q-pa-md feed-comment-card post-detail-comment"
              >
                <div class="feed-comment-head">
                  <div class="text-caption text-weight-bold">{{ comment.user?.name }}</div>
                  <div class="card-meta">@{{ comment.user?.username || 'builder' }}</div>
                </div>
                <div class="text-body2 q-mt-sm">{{ comment.body }}</div>
                <div v-if="comment.replies?.length" class="q-mt-sm post-detail-replies">
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="post-detail-reply"
                  >
                    <strong>{{ reply.user?.name }}</strong>
                    <span class="muted-text"> {{ reply.body }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="stack-card q-pa-md">
              <div class="text-subtitle2 text-weight-bold">No comments yet</div>
              <div class="text-body2 muted-text q-mt-xs">Start the discussion with feedback, context, or a useful follow-up.</div>
            </div>

            <div class="feed-comment-compose row q-col-gutter-sm q-mt-md">
              <div class="col-auto">
                <q-avatar size="40px" color="primary" text-color="white">
                  <img v-if="session.user?.avatar_url" :src="session.user.avatar_url" :alt="session.user?.name || 'Profile photo'" />
                  <span v-else>{{ session.user?.name?.charAt(0) || 'K' }}</span>
                </q-avatar>
              </div>
              <div class="col">
                <q-input
                  v-model="commentDraft"
                  outlined
                  dense
                  autogrow
                  class="input-surface"
                  label="Add a comment"
                  :disable="!session.isAuthenticated"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  no-caps
                  label="Comment"
                  :loading="commenting"
                  :disable="!session.isAuthenticated || !commentDraft || commenting"
                  @click="submitComment"
                />
              </div>
            </div>
          </article>
        </div>

        <div class="col-12 col-xl-4">
          <div class="content-card q-pa-md post-detail-side-card">
            <div class="section-label">Author</div>
            <div class="text-h6 text-weight-bold q-mt-md">{{ post.user?.name }}</div>
            <div class="text-body2 muted-text q-mt-sm">@{{ post.user?.username }}</div>
            <div class="text-body2 muted-text q-mt-sm">{{ post.user?.headline || 'Builder in the community' }}</div>
            <q-btn class="q-mt-md" flat no-caps color="primary" icon="north_east" label="Open profile" :to="profileTarget" />
          </div>

          <div class="content-card q-pa-md q-mt-md post-detail-side-card">
            <div class="section-label">Post Signals</div>
            <div class="summary-grid q-mt-md">
              <div class="inline-stat">
                <div class="card-meta">Type</div>
                <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ postTypeBadge(post)?.label || 'Update' }}</div>
              </div>
              <div class="inline-stat">
                <div class="card-meta">Media</div>
                <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ post.media?.length || 0 }}</div>
              </div>
              <div class="inline-stat">
                <div class="card-meta">Topic</div>
                <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ post.topic || 'General' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <q-dialog v-model="mediaViewerOpen" maximized transition-show="fade" transition-hide="fade">
      <q-card class="theme-dialog feed-media-dialog">
        <q-card-section class="feed-media-dialog__head">
          <div>
            <div class="section-label">Media</div>
            <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ mediaViewerTitle || 'Post preview' }}</div>
          </div>
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>
        <q-separator class="theme-separator" />
        <q-card-section class="feed-media-dialog__body">
          <q-carousel
            v-model="mediaViewerIndex"
            animated
            swipeable
            navigation
            arrows
            control-color="primary"
            class="feed-media-carousel"
          >
            <q-carousel-slide
              v-for="(src, index) in mediaViewerImages"
              :key="`${src}-${index}`"
              :name="index"
              class="feed-media-carousel__slide"
            >
              <q-img :src="src" fit="contain" class="feed-media-carousel__image" />
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'
import { formatDate, formatRelative } from 'src/utils/formatters'

const $q = useQuasar()
const route = useRoute()
const community = useCommunityStore()
const session = useSessionStore()

const loading = ref(false)
const post = ref(null)
const commentDraft = ref('')
const liking = ref(false)
const bookmarking = ref(false)
const commenting = ref(false)
const mediaViewerOpen = ref(false)
const mediaViewerImages = ref([])
const mediaViewerIndex = ref(0)
const mediaViewerTitle = ref('')

const postTypeConfig = {
  image: { label: 'Image', tone: 'theme-chip-primary' },
  project_share: { label: 'Project', tone: 'theme-chip-secondary' },
  event_share: { label: 'Event', tone: 'theme-chip-warning' },
  job_share: { label: 'Job', tone: 'theme-chip-success' },
  code_snippet: { label: 'Code', tone: 'theme-chip-secondary' },
}

const isMobileShell = computed(() => route.meta.mobileShell)
const backTarget = computed(() => (isMobileShell.value ? '/m/feed' : '/feed'))
const profileTarget = computed(() => {
  const username = post.value?.user?.username
  return username ? (isMobileShell.value ? `/m/u/${username}` : `/u/${username}`) : backTarget.value
})

function postTypeBadge(value) {
  return postTypeConfig[value?.type] || null
}

function openMediaViewer(images = [], index = 0, title = '') {
  mediaViewerImages.value = images
  mediaViewerIndex.value = index
  mediaViewerTitle.value = title
  mediaViewerOpen.value = true
}

function formatPublished(value) {
  return formatDate(value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    $q.notify({ type: 'positive', message: 'Post link copied' })
  } catch {
    $q.notify({ type: 'negative', message: 'Could not copy link' })
  }
}

async function sharePost() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: post.value?.title,
        text: post.value?.excerpt,
        url: window.location.href,
      })
      return
    } catch {
      return
    }
  }

  await copyLink()
}

async function loadPost() {
  loading.value = true

  try {
    post.value = await community.fetchPost(route.params.id)
  } catch (error) {
    post.value = null
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to load post' })
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  if (!post.value || liking.value) {
    return
  }

  liking.value = true

  try {
    const data = await community.likePost(post.value.id)
    post.value = {
      ...post.value,
      is_liked: data.liked,
      likes_count: data.likes_count,
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to like post' })
  } finally {
    liking.value = false
  }
}

async function toggleBookmark() {
  if (!post.value || bookmarking.value) {
    return
  }

  bookmarking.value = true

  try {
    const data = await community.togglePostBookmark(post.value.id)
    post.value = {
      ...post.value,
      is_saved: data.saved,
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save post' })
  } finally {
    bookmarking.value = false
  }
}

async function submitComment() {
  if (!post.value || commenting.value || !commentDraft.value) {
    return
  }

  commenting.value = true

  try {
    const comment = await community.commentOnPost(post.value.id, commentDraft.value)
    post.value = {
      ...post.value,
      comments: [comment, ...(post.value.comments || [])],
      comments_count: (post.value.comments_count || 0) + 1,
    }
    commentDraft.value = ''
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to add comment' })
  } finally {
    commenting.value = false
  }
}

watch(() => route.params.id, loadPost)
onMounted(loadPost)
</script>
