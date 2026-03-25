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
      <div class="text-h6 text-weight-bold">{{ $t('postDetail.notFoundTitle') }}</div>
      <div class="text-body2 muted-text q-mt-sm">{{ $t('postDetail.notFoundCopy') }}</div>
      <q-btn class="q-mt-md" color="primary" no-caps :label="$t('postDetail.backToFeed')" :to="backTarget" />
    </div>

    <template v-else>
      <div class="page-intro q-mb-lg post-detail-intro">
        <div>
          <div class="section-label">{{ $t('postDetail.pageLabel') }}</div>
          <div class="text-h4 text-weight-bold q-mt-sm">{{ post.title }}</div>
          <div class="text-body2 muted-text q-mt-sm">{{ $t('postDetail.pageCopy') }}</div>
        </div>
        <div class="page-actions post-detail-page-actions">
          <q-btn flat no-caps color="secondary" icon="arrow_back" :label="$t('postDetail.backToFeed')" :to="backTarget" />
          <q-btn flat no-caps color="grey-6" icon="content_copy" :label="$t('postDetail.copyLink')" @click="copyLink" />
          <q-btn flat no-caps color="primary" icon="share" :label="$t('postDetail.share')" @click="sharePost" />
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
                    <q-chip v-if="post.pinned" square class="theme-chip theme-chip-success">{{ $t('feed.pinned') }}</q-chip>
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
                <span class="card-meta">{{ $t('postDetail.posted') }}</span>
                <strong>{{ formatPublished(post.published_at) }}</strong>
              </div>
              <div class="post-detail-summary__item">
                <span class="card-meta">{{ $t('postDetail.author') }}</span>
                <strong>@{{ post.user?.username || $t('postDetail.builderFallback') }}</strong>
              </div>
              <div class="post-detail-summary__item">
                <span class="card-meta">{{ $t('postDetail.topic') }}</span>
                <strong>{{ post.topic || $t('postDetail.general') }}</strong>
              </div>
            </div>

            <div class="feed-post-stats q-mt-lg">
              <div class="card-meta">{{ post.likes_count }} {{ $t('feed.likes') }}</div>
              <div class="card-meta">{{ post.comments_count }} {{ $t('feed.comments') }}</div>
              <div class="card-meta">{{ post.reading_time }} {{ $t('feed.minRead') }}</div>
            </div>

            <div class="feed-post-actions q-mt-md">
              <q-btn
                flat
                no-caps
                :color="post.is_liked ? 'primary' : 'grey-5'"
                :icon="post.is_liked ? 'favorite' : 'favorite_border'"
                :label="post.is_liked ? $t('feed.liked') : $t('feed.like')"
                :loading="liking"
                :disable="!session.isAuthenticated || liking"
                @click="toggleLike"
              />
              <q-btn
                flat
                no-caps
                :color="post.is_saved ? 'secondary' : 'grey-5'"
                :icon="post.is_saved ? 'bookmark' : 'bookmark_border'"
                :label="post.is_saved ? $t('feed.saved') : $t('feed.save')"
                :loading="bookmarking"
                :disable="!session.isAuthenticated || bookmarking"
                @click="toggleBookmark"
              />
            </div>

            <q-separator spaced class="theme-separator" />

            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="section-label">{{ $t('postDetail.discussion') }}</div>
                <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ t('postDetail.visibleComments', { count: post.comments?.length || 0 }) }}</div>
              </div>
              <q-chip square class="theme-chip theme-chip-secondary">{{ t('postDetail.totalComments', { count: post.comments_count || 0 }) }}</q-chip>
            </div>

            <div v-if="post.comments?.length" class="compact-list feed-comment-list post-detail-comment-list">
              <div
                v-for="comment in post.comments"
                :key="comment.id"
                class="stack-card q-pa-md feed-comment-card post-detail-comment"
              >
                <div class="feed-comment-head">
                  <router-link
                    :to="commentProfileTarget(comment.user?.username)"
                    class="feed-comment-author"
                  >
                    <q-avatar size="38px" class="feed-comment-author__avatar" color="primary" text-color="white">
                      <img v-if="comment.user?.avatar_url" :src="comment.user.avatar_url" :alt="comment.user?.name || 'Comment avatar'" />
                      <span v-else>{{ comment.user?.name?.charAt(0) || '?' }}</span>
                    </q-avatar>
                    <div class="feed-comment-head__copy">
                      <div class="feed-comment-author__name">{{ comment.user?.name }}</div>
                      <div class="card-meta">@{{ comment.user?.username || $t('postDetail.builderFallback') }}</div>
                      <div class="card-meta">{{ formatRelative(comment.created_at) }}</div>
                    </div>
                  </router-link>
                  <div class="feed-comment-actions">
                    <q-btn
                      flat
                      dense
                      no-caps
                      color="primary"
                      class="post-detail-comment__reply-btn"
                      icon="reply"
                      :label="$t('feed.reply')"
                      :disable="!session.isAuthenticated"
                      @click="startReply(comment)"
                    />
                    <q-btn
                      v-if="isCommentOwner(comment)"
                      flat
                      round
                      dense
                      color="grey-6"
                      icon="more_horiz"
                    >
                      <q-menu auto-close class="theme-dialog">
                        <q-list dense style="min-width: 140px">
                          <q-item clickable @click="startCommentEdit(comment)">
                            <q-item-section>{{ $t('feed.edit') }}</q-item-section>
                          </q-item>
                          <q-item clickable class="text-negative" @click="removeComment(comment)">
                            <q-item-section>{{ $t('feed.delete') }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </div>
                <div v-if="editingCommentId === comment.id" class="feed-comment-editor q-mt-sm">
                  <q-input
                    v-model="editingDraft"
                    outlined
                    dense
                    autogrow
                    class="input-surface"
                    :label="$t('feed.editComment')"
                  />
                  <div class="feed-comment-editor__actions">
                    <q-btn flat no-caps color="grey-6" :label="$t('feed.cancel')" @click="cancelCommentEdit" />
                    <q-btn color="primary" no-caps :label="$t('feed.saveAction')" :loading="Boolean(commentEditing[comment.id])" @click="saveCommentEdit(comment)" />
                  </div>
                </div>
                <div v-else class="text-body2 q-mt-sm">{{ comment.body }}</div>
                <div v-if="comment.replies?.length" class="q-mt-sm post-detail-replies">
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="post-detail-reply"
                  >
                    <div class="post-detail-reply__head">
                      <router-link
                        :to="commentProfileTarget(reply.user?.username)"
                        class="feed-comment-author feed-comment-author--inline"
                        >
                          <q-avatar size="28px" class="feed-comment-author__avatar" color="primary" text-color="white">
                          <img v-if="reply.user?.avatar_url" :src="reply.user.avatar_url" :alt="reply.user?.name || 'Reply avatar'" />
                          <span v-else>{{ reply.user?.name?.charAt(0) || '?' }}</span>
                        </q-avatar>
                        <span class="feed-comment-author__name">{{ reply.user?.name }}</span>
                        <span class="card-meta">@{{ reply.user?.username || $t('postDetail.builderFallback') }}</span>
                        <span class="card-meta">{{ formatRelative(reply.created_at) }}</span>
                      </router-link>
                      <q-btn
                        v-if="isCommentOwner(reply)"
                        flat
                        round
                        dense
                        color="grey-6"
                        icon="more_horiz"
                      >
                        <q-menu auto-close class="theme-dialog">
                          <q-list dense style="min-width: 140px">
                            <q-item clickable @click="startCommentEdit(reply)">
                              <q-item-section>{{ $t('feed.edit') }}</q-item-section>
                            </q-item>
                            <q-item clickable class="text-negative" @click="removeComment(reply)">
                              <q-item-section>{{ $t('feed.delete') }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                    <div v-if="editingCommentId === reply.id" class="feed-comment-editor q-mt-sm">
                      <q-input
                        v-model="editingDraft"
                        outlined
                        dense
                        autogrow
                        class="input-surface"
                        :label="$t('feed.editReply')"
                      />
                      <div class="feed-comment-editor__actions">
                        <q-btn flat no-caps color="grey-6" :label="$t('feed.cancel')" @click="cancelCommentEdit" />
                        <q-btn color="primary" no-caps :label="$t('feed.saveAction')" :loading="Boolean(commentEditing[reply.id])" @click="saveCommentEdit(reply)" />
                      </div>
                    </div>
                    <div v-else class="muted-text q-mt-xs">{{ reply.body }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="stack-card q-pa-md">
              <div class="text-subtitle2 text-weight-bold">{{ $t('postDetail.noCommentsTitle') }}</div>
              <div class="text-body2 muted-text q-mt-xs">{{ $t('postDetail.noCommentsCopy') }}</div>
            </div>

            <div class="feed-comment-compose row q-col-gutter-sm q-mt-md post-detail-comment-compose">
              <div class="col-auto">
                <q-avatar size="40px" color="primary" text-color="white">
                  <img v-if="session.user?.avatar_url" :src="session.user.avatar_url" :alt="session.user?.name || 'Profile photo'" />
                  <span v-else>{{ session.user?.name?.charAt(0) || 'K' }}</span>
                </q-avatar>
              </div>
              <div class="col">
                <div v-if="replyTarget" class="post-detail-reply-draft q-mb-sm">
                  <div>
                    <div class="section-label">{{ t('feed.replyingTo', { name: replyTarget.user?.name }) }}</div>
                    <div class="card-meta">{{ replyTarget.body }}</div>
                  </div>
                  <q-btn flat round dense icon="close" color="grey-5" @click="clearReply" />
                </div>
                <q-input
                  v-model="commentDraft"
                  outlined
                  dense
                  autogrow
                  class="input-surface"
                  :label="replyTarget ? $t('feed.writeReply') : $t('feed.addComment')"
                  :disable="!session.isAuthenticated"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  no-caps
                  :label="replyTarget ? $t('feed.reply') : $t('feed.comment')"
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
            <div class="section-label">{{ $t('postDetail.author') }}</div>
            <div class="text-h6 text-weight-bold q-mt-md">{{ post.user?.name }}</div>
            <div class="text-body2 muted-text q-mt-sm">@{{ post.user?.username }}</div>
            <div class="text-body2 muted-text q-mt-sm">{{ post.user?.headline || $t('postDetail.authorFallback') }}</div>
            <q-btn class="q-mt-md" flat no-caps color="primary" icon="north_east" :label="$t('postDetail.openProfile')" :to="profileTarget" />
          </div>

          <div class="content-card q-pa-md q-mt-md post-detail-side-card">
            <div class="section-label">{{ $t('postDetail.postSignals') }}</div>
            <div class="summary-grid q-mt-md">
              <div class="inline-stat">
                <div class="card-meta">{{ $t('postDetail.type') }}</div>
                <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ postTypeBadge(post)?.label || $t('postDetail.update') }}</div>
              </div>
              <div class="inline-stat">
                <div class="card-meta">{{ $t('postDetail.media') }}</div>
                <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ post.media?.length || 0 }}</div>
              </div>
              <div class="inline-stat">
                <div class="card-meta">{{ $t('postDetail.topic') }}</div>
                <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ post.topic || $t('postDetail.general') }}</div>
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
            <div class="section-label">{{ $t('feed.media') }}</div>
            <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ mediaViewerTitle || $t('feed.postPreview') }}</div>
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
import { useI18n } from 'vue-i18n'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'
import { formatDate, formatRelative } from 'src/utils/formatters'

const $q = useQuasar()
const route = useRoute()
const { t } = useI18n()
const community = useCommunityStore()
const session = useSessionStore()

const loading = ref(false)
const post = ref(null)
const commentDraft = ref('')
const replyTarget = ref(null)
const editingCommentId = ref(null)
const editingDraft = ref('')
const commentEditing = ref({})
const liking = ref(false)
const bookmarking = ref(false)
const commenting = ref(false)
const mediaViewerOpen = ref(false)
const mediaViewerImages = ref([])
const mediaViewerIndex = ref(0)
const mediaViewerTitle = ref('')

const postTypeConfig = {
  image: { labelKey: 'postDetail.types.image', tone: 'theme-chip-primary' },
  project_share: { labelKey: 'postDetail.types.project', tone: 'theme-chip-secondary' },
  event_share: { labelKey: 'postDetail.types.event', tone: 'theme-chip-warning' },
  job_share: { labelKey: 'postDetail.types.job', tone: 'theme-chip-success' },
  code_snippet: { labelKey: 'postDetail.types.code', tone: 'theme-chip-secondary' },
}

const isMobileShell = computed(() => route.meta.mobileShell)
const backTarget = computed(() => (isMobileShell.value ? '/m/feed' : '/feed'))
const profileTarget = computed(() => {
  const username = post.value?.user?.username
  return username ? (isMobileShell.value ? `/m/u/${username}` : `/u/${username}`) : backTarget.value
})

function postTypeBadge(value) {
  const config = postTypeConfig[value?.type]
  return config ? { ...config, label: t(config.labelKey) } : null
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
    $q.notify({ type: 'positive', message: t('postDetail.postLinkCopied') })
  } catch {
    $q.notify({ type: 'negative', message: t('postDetail.copyLinkFailed') })
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
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('postDetail.loadFailed') })
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
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('feed.likeFailed') })
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
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('feed.saveFailed') })
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
    const comment = await community.commentOnPost(post.value.id, commentDraft.value, replyTarget.value?.id || null)

    if (replyTarget.value) {
      post.value = {
        ...post.value,
        comments: (post.value.comments || []).map((item) => (
          item.id === replyTarget.value.id
            ? {
                ...item,
                replies: [comment, ...(item.replies || [])],
              }
            : item
        )),
        comments_count: (post.value.comments_count || 0) + 1,
      }
    } else {
      post.value = {
        ...post.value,
        comments: [comment, ...(post.value.comments || [])],
        comments_count: (post.value.comments_count || 0) + 1,
      }
    }

    commentDraft.value = ''
    replyTarget.value = null
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('feed.commentFailed') })
  } finally {
    commenting.value = false
  }
}

function startReply(comment) {
  replyTarget.value = comment
}

function clearReply() {
  replyTarget.value = null
}

function commentProfileTarget(username) {
  return username ? (isMobileShell.value ? `/m/u/${username}` : `/u/${username}`) : backTarget.value
}

function isCommentOwner(comment) {
  return Boolean(session.user?.id && comment?.user_id === session.user.id)
}

function startCommentEdit(comment) {
  editingCommentId.value = comment.id
  editingDraft.value = comment.body || ''
}

function cancelCommentEdit() {
  editingCommentId.value = null
  editingDraft.value = ''
}

function updateCommentTree(comments = [], updatedComment) {
  return (comments || []).map((comment) => {
    if (comment.id === updatedComment.id) {
      return {
        ...comment,
        ...updatedComment,
      }
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: updateCommentTree(comment.replies, updatedComment),
      }
    }

    return comment
  })
}

function removeCommentFromTree(comments = [], commentId) {
  let removedCount = 0

  const nextComments = (comments || [])
    .filter((comment) => {
      if (comment.id === commentId) {
        removedCount += 1 + (comment.replies?.length || 0)
        return false
      }

      return true
    })
    .map((comment) => {
      if (!comment.replies?.length) {
        return comment
      }

      const result = removeCommentFromTree(comment.replies, commentId)
      removedCount += result.removedCount

      return {
        ...comment,
        replies: result.comments,
      }
    })

  return {
    comments: nextComments,
    removedCount,
  }
}

async function saveCommentEdit(comment) {
  if (!editingDraft.value?.trim() || commentEditing.value[comment.id]) {
    return
  }

  commentEditing.value[comment.id] = true

  try {
    const updated = await community.updatePostComment(comment.id, editingDraft.value.trim())
    post.value = {
      ...post.value,
      comments: updateCommentTree(post.value.comments || [], updated),
    }
    cancelCommentEdit()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('feed.updateCommentFailed') })
  } finally {
    commentEditing.value[comment.id] = false
  }
}

function removeComment(comment) {
  $q.dialog({
    title: t('feed.deleteCommentTitle'),
    message: t('feed.deleteCommentMessage'),
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: t('feed.delete'), noCaps: true },
    cancelLabel: t('feed.cancel'),
  }).onOk(async () => {
    try {
      await community.deletePostComment(comment.id)
      const result = removeCommentFromTree(post.value.comments || [], comment.id)
      post.value = {
        ...post.value,
        comments: result.comments,
        comments_count: Math.max(0, (post.value.comments_count || 0) - result.removedCount),
      }

      if (replyTarget.value?.id === comment.id) {
        clearReply()
      }

      if (editingCommentId.value === comment.id) {
        cancelCommentEdit()
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || t('feed.deleteCommentFailed') })
    }
  })
}

watch(() => route.params.id, loadPost)
onMounted(loadPost)
</script>
