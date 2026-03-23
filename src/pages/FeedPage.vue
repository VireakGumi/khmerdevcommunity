<template>
  <q-page padding>
    <div class="page-intro q-mb-lg kdc-page-head">
      <div>
        <div class="section-label khmer-copy">Community Feed</div>
        <div class="text-h4 text-weight-bold q-mt-sm">Progress updates, launches, and useful discussion</div>
        <div class="text-body2 muted-text q-mt-sm">A tighter social feed for Khmer builders. Read what is shipping, respond quickly, and keep useful work visible.</div>
      </div>
      <div class="page-actions kdc-page-head__actions">
        <q-btn color="primary" no-caps icon="add_comment" label="New post" :disable="!session.isAuthenticated" @click="composerOpen = true" />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div class="content-card q-pa-lg q-mb-md feed-composer-card">
          <div class="feed-composer-head">
            <q-avatar size="54px" class="feed-composer-avatar" color="primary" text-color="white">
              <img v-if="session.user?.avatar_url" :src="session.user.avatar_url" :alt="session.user?.name || 'Profile photo'" />
              <span v-else>{{ session.user?.name?.charAt(0) || 'K' }}</span>
            </q-avatar>
            <div class="feed-composer-copy">
              <div class="section-label khmer-copy">Feed Composer</div>
              <div class="text-h6 text-weight-bold q-mt-xs">Share a launch, lesson, or collaboration request</div>
              <div class="text-body2 muted-text q-mt-xs">Write a quick progress note, point people to a repo, or ask for feedback from the community.</div>
            </div>
          </div>

          <div v-if="!session.isAuthenticated" class="text-body2 muted-text q-mt-sm">
            Sign in to publish, like, and comment.
          </div>

          <div class="feed-composer-toolbar q-mt-md kdc-page-head">
            <q-tabs v-model="activeTab" dense inline-label no-caps class="feed-tabs">
              <q-tab name="for-you" icon="auto_awesome" label="For you" />
              <q-tab name="following" icon="groups" label="Following" :disable="!session.isAuthenticated" />
              <q-tab name="trending" icon="trending_up" label="Trending" />
            </q-tabs>
            <q-btn
              color="primary"
              no-caps
              icon="edit_square"
              label="Create post"
              :loading="publishing"
              :disable="!session.isAuthenticated"
              @click="composerOpen = true"
            />
          </div>
        </div>

        <div v-if="isInitialFeedLoading" class="feed-skeleton-stack">
          <div v-for="index in 3" :key="`feed-skeleton-${index}`" class="content-card q-pa-lg q-mb-md feed-post-card">
            <div class="row items-center q-col-gutter-md">
              <div class="col-auto">
                <q-skeleton type="QAvatar" size="48px" />
              </div>
              <div class="col">
                <q-skeleton type="text" width="34%" />
                <q-skeleton type="text" width="52%" class="q-mt-xs" />
              </div>
            </div>
            <q-skeleton type="text" width="44%" class="q-mt-lg" />
            <q-skeleton type="text" class="q-mt-sm" />
            <q-skeleton type="text" width="88%" class="q-mt-xs" />
            <q-skeleton square height="220px" class="rounded-borders q-mt-md" />
            <div class="row q-col-gutter-sm q-mt-md">
              <div v-for="item in 3" :key="`skeleton-chip-${item}`" class="col-auto">
                <q-skeleton type="QChip" width="84px" />
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!feed.length" class="content-card q-pa-xl text-center feed-empty-state">
          <div class="section-label">Feed</div>
          <div class="text-h6 text-weight-bold q-mt-md">No posts yet</div>
          <div class="text-body2 muted-text q-mt-sm">Switch tabs or come back once the community starts publishing updates.</div>
        </div>

        <template v-else>
          <transition-group name="feed-stack" tag="div" class="feed-stack">
            <div v-for="post in feed" :key="post.id" class="content-card q-pa-lg q-mb-md feed-post-card">
              <div class="feed-post-head">
                <div class="feed-post-author">
                  <q-avatar size="48px" class="feed-post-avatar" color="primary" text-color="white">
                    <img v-if="post.user?.avatar_url" :src="post.user.avatar_url" :alt="post.user?.name || 'Author avatar'" />
                    <span v-else>{{ post.user?.name?.charAt(0) || '?' }}</span>
                  </q-avatar>
                  <div class="feed-post-copy">
                    <div class="feed-post-meta-line">
                      <strong>{{ post.user.name }}</strong>
                      <span class="card-meta">@{{ post.user.username || post.user.name?.toLowerCase().replace(/\s+/g, '') }}</span>
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
                      <q-chip square class="theme-chip theme-chip-primary">{{ post.topic }}</q-chip>
                      <q-chip v-if="post.pinned" square class="theme-chip theme-chip-success">Pinned</q-chip>
                    </div>
                  </div>
                </div>
                <q-btn flat round dense icon="more_horiz" color="grey-5" />
              </div>

              <div class="feed-post-body q-mt-md">
                <div class="card-title">
                  <router-link :to="`/feed/${post.id}`" class="post-detail-link">{{ post.title }}</router-link>
                </div>
                <div class="text-body1 muted-text q-mt-sm">{{ post.excerpt }}</div>
                <div v-if="post.media?.length" class="row q-col-gutter-sm q-mt-md feed-media-grid">
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
              </div>

              <div class="feed-post-stats q-mt-md">
                <div class="card-meta feed-post-stat">{{ post.likes_count }} likes</div>
                <div class="card-meta feed-post-stat">{{ post.comments_count }} comments</div>
                <div class="card-meta feed-post-stat">{{ post.reading_time }} min read</div>
              </div>

              <div class="feed-post-actions q-mt-md">
                <q-btn
                  class="feed-post-action-btn"
                  flat
                  no-caps
                  :color="post.is_liked ? 'primary' : 'grey-5'"
                  :icon="post.is_liked ? 'favorite' : 'favorite_border'"
                  :label="$q.screen.lt.sm ? '' : (post.is_liked ? 'Liked' : 'Like')"
                  :loading="Boolean(likeLoading[post.id])"
                  :disable="!session.isAuthenticated"
                  @click="toggleLike(post.id)"
                />
                <q-btn
                  class="feed-post-action-btn"
                  flat
                  no-caps
                  :color="post.is_saved ? 'secondary' : 'grey-5'"
                  :icon="post.is_saved ? 'bookmark' : 'bookmark_border'"
                  :label="$q.screen.lt.sm ? '' : (post.is_saved ? 'Saved' : 'Save')"
                  :loading="Boolean(bookmarkLoading[post.id])"
                  :disable="!session.isAuthenticated"
                  @click="toggleBookmark(post.id)"
                />
                <q-btn class="feed-post-action-btn" flat no-caps color="grey-5" icon="chat_bubble_outline" :label="$q.screen.lt.sm ? '' : 'Comment'" :to="`/feed/${post.id}`" />
                <q-btn class="feed-post-action-btn" flat no-caps color="grey-5" icon="north_east" :label="$q.screen.lt.sm ? '' : 'Open'" :to="`/feed/${post.id}`" />
              </div>

              <q-separator spaced class="theme-separator" />

              <div class="compact-list feed-comment-list">
                <div
                  v-for="comment in post.comments || []"
                  :key="comment.id"
                  class="stack-card q-pa-sm feed-comment-card"
                >
                  <div class="feed-comment-head">
                    <router-link
                      :to="commentProfileTarget(comment.user?.username)"
                      class="feed-comment-author"
                    >
                      <q-avatar size="34px" class="feed-comment-author__avatar" color="primary" text-color="white">
                        <img v-if="comment.user?.avatar_url" :src="comment.user.avatar_url" :alt="comment.user?.name || 'Comment avatar'" />
                        <span v-else>{{ comment.user?.name?.charAt(0) || '?' }}</span>
                      </q-avatar>
                      <div class="feed-comment-head__copy">
                        <div class="feed-comment-author__name">{{ comment.user?.name }}</div>
                        <div class="card-meta">{{ comment.user?.headline || `@${comment.user?.username || 'builder'}` }}</div>
                        <div class="card-meta">{{ formatRelative(comment.created_at) }}</div>
                      </div>
                    </router-link>
                    <div class="feed-comment-actions">
                      <q-btn
                        flat
                        dense
                        no-caps
                        color="primary"
                        class="feed-comment-reply-btn"
                        icon="reply"
                        label="Reply"
                        :disable="!session.isAuthenticated"
                        @click="startReply(post.id, comment)"
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
                              <q-item-section>Edit</q-item-section>
                            </q-item>
                            <q-item clickable class="text-negative" @click="removeComment(post.id, comment)">
                              <q-item-section>Delete</q-item-section>
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
                      label="Edit comment"
                    />
                    <div class="feed-comment-editor__actions">
                      <q-btn flat no-caps color="grey-6" label="Cancel" @click="cancelCommentEdit" />
                      <q-btn color="primary" no-caps label="Save" :loading="Boolean(commentEditing[comment.id])" @click="saveCommentEdit(comment)" />
                    </div>
                  </div>
                  <div v-else class="text-body2 q-mt-xs">{{ comment.body }}</div>
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
                          <span class="card-meta">@{{ reply.user?.username || 'builder' }}</span>
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
                                <q-item-section>Edit</q-item-section>
                              </q-item>
                              <q-item clickable class="text-negative" @click="removeComment(post.id, reply)">
                                <q-item-section>Delete</q-item-section>
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
                          label="Edit reply"
                        />
                        <div class="feed-comment-editor__actions">
                          <q-btn flat no-caps color="grey-6" label="Cancel" @click="cancelCommentEdit" />
                          <q-btn color="primary" no-caps label="Save" :loading="Boolean(commentEditing[reply.id])" @click="saveCommentEdit(reply)" />
                        </div>
                      </div>
                      <div v-else class="muted-text q-mt-xs">{{ reply.body }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="feed-comment-compose row q-col-gutter-sm q-mt-md">
                <div class="col-auto">
                  <q-avatar size="40px" color="primary" text-color="white">
                    <img v-if="session.user?.avatar_url" :src="session.user.avatar_url" :alt="session.user?.name || 'Profile photo'" />
                    <span v-else>{{ session.user?.name?.charAt(0) || 'K' }}</span>
                  </q-avatar>
                </div>
                <div class="col">
                  <div v-if="replyTargets[post.id]" class="post-detail-reply-draft q-mb-sm">
                    <div>
                      <div class="section-label">Replying to {{ replyTargets[post.id]?.user?.name }}</div>
                      <div class="card-meta">{{ replyTargets[post.id]?.body }}</div>
                    </div>
                    <q-btn flat round dense icon="close" color="grey-5" @click="clearReply(post.id)" />
                  </div>
                  <q-input
                    v-model="commentDrafts[post.id]"
                    outlined
                    dense
                    class="input-surface"
                    :label="replyTargets[post.id] ? 'Write a reply' : 'Add a comment'"
                    :disable="!session.isAuthenticated"
                  />
                </div>
                <div class="col-auto">
                <q-btn
                  color="primary"
                  no-caps
                  :label="replyTargets[post.id] ? 'Reply' : 'Comment'"
                  :loading="Boolean(commentLoading[post.id])"
                  :disable="!session.isAuthenticated || !commentDrafts[post.id] || Boolean(commentLoading[post.id])"
                  @click="submitComment(post.id)"
                />
                </div>
              </div>
            </div>
          </transition-group>

          <div class="feed-pagination">
            <div ref="sentinelRef" class="feed-scroll-sentinel" aria-hidden="true" />

            <div v-if="isLoadingMore" class="feed-skeleton-stack q-mt-md">
              <div v-for="index in 2" :key="`feed-loading-${index}`" class="content-card q-pa-lg feed-post-card">
                <div class="row items-center q-col-gutter-md">
                  <div class="col-auto">
                    <q-skeleton type="QAvatar" size="44px" />
                  </div>
                  <div class="col">
                    <q-skeleton type="text" width="30%" />
                    <q-skeleton type="text" width="48%" class="q-mt-xs" />
                  </div>
                </div>
                <q-skeleton type="text" width="36%" class="q-mt-lg" />
                <q-skeleton type="text" class="q-mt-sm" />
                <q-skeleton square height="180px" class="rounded-borders q-mt-md" />
              </div>
            </div>

            <div v-else-if="shouldShowManualButton" class="text-center q-mt-md">
              <q-btn
                outline
                color="primary"
                no-caps
                label="Load more posts"
                :loading="community.feedLoading"
                @click="handleLoadMore"
              />
            </div>

            <div v-else-if="!hasMorePosts" class="feed-pagination__end card-meta text-center q-mt-md">
              No more posts
            </div>
          </div>
        </template>
      </div>

      <div class="col-12 col-xl-4">
        <div class="content-card q-pa-md">
          <div class="section-label khmer-copy">Social Signals</div>
          <div class="text-h6 text-weight-bold q-mt-md">Make the feed active, not static</div>
          <div class="text-body2 muted-text q-mt-sm">
            Posts now support creation, likes, and comments. Every reaction strengthens the feedback loop across the community.
          </div>
          <div class="feature-list q-mt-lg">
            <div class="feature-row">
              <q-icon name="edit_note" color="primary" />
              <div class="text-body2">Open with short, useful progress updates instead of long blank posts.</div>
            </div>
            <div class="feature-row">
              <q-icon name="favorite" color="positive" />
              <div class="text-body2">Likes and comments already work, so the feed should invite frequent interaction.</div>
            </div>
          </div>
        </div>

        <div class="content-card q-pa-md q-mt-md">
          <div class="section-label">Flow</div>
          <div class="text-h6 text-weight-bold q-mt-md">What is moving right now</div>
          <div class="summary-grid q-mt-md">
            <div class="inline-stat">
              <div class="card-meta">Posts</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ feed.length }}</div>
            </div>
            <div class="inline-stat">
              <div class="card-meta">Pinned</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ pinnedCount }}</div>
            </div>
            <div class="inline-stat">
              <div class="card-meta">Topics</div>
              <div class="text-h6 text-weight-bold q-mt-xs">{{ topicCount }}</div>
            </div>
          </div>

          <div class="section-label q-mt-lg">Popular Topics</div>
          <div class="q-gutter-sm q-mt-sm">
            <q-chip v-for="topic in topicPreview" :key="topic" square class="theme-chip theme-chip-secondary">{{ topic }}</q-chip>
          </div>
        </div>

        <div class="content-card q-pa-md q-mt-md">
          <div class="section-label">Builders</div>
          <div class="text-h6 text-weight-bold q-mt-md">Suggested to follow</div>
          <div class="compact-list q-mt-md">
            <div v-for="developer in suggestedDevelopers" :key="developer.id" class="feed-suggest-row">
              <div class="feed-suggest-copy">
                <div class="mini-card-title">{{ developer.name }}</div>
                <div class="card-meta">@{{ developer.username }}</div>
                <div class="feed-suggest-badges q-mt-xs">
                  <span class="home-stack-pill">{{ developer.skills?.[0] || 'Builder' }}</span>
                  <span class="card-meta">Rep {{ developer.followers_count || 0 }}</span>
                </div>
              </div>
              <q-btn
                v-if="session.isAuthenticated && session.user?.id !== developer.id"
                flat
                dense
                no-caps
                :color="developer.is_following ? 'secondary' : 'grey-5'"
                :label="developer.is_following ? 'Following' : 'Follow'"
                @click="toggleFollow(developer.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="composerOpen">
      <q-card class="theme-dialog">
        <q-card-section>
          <div class="section-label khmer-copy">Create Post</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Publish to the community feed</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="postForm.title" outlined class="input-surface" label="Title" />
          <q-input v-model="postForm.topic" outlined class="input-surface" label="Topic" />
          <q-input v-model="postForm.excerpt" outlined class="input-surface" label="Excerpt" />
          <q-select v-model="postForm.type" outlined emit-value map-options class="input-surface" label="Post type" :options="postTypes" />
          <q-input v-model="postForm.body" outlined class="input-surface" type="textarea" autogrow label="Body" />
          <q-file v-model="postForm.images" outlined multiple clearable class="input-surface" label="Images" accept=".jpg,.jpeg,.png,.webp" />
          <div v-if="imagePreviewUrls.length" class="row q-col-gutter-sm">
            <div v-for="src in imagePreviewUrls" :key="src" class="col-6 col-md-3">
              <q-img :src="src" ratio="1" class="rounded-borders" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps color="secondary" label="Cancel" v-close-popup />
          <q-btn color="primary" no-caps label="Publish" :loading="publishing" @click="publishPost" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useInfinitePager } from 'src/composables/useInfinitePager'
import { useCommunityStore } from 'src/stores/community-store'
import { useSessionStore } from 'src/stores/session-store'
import { formatRelative } from 'src/utils/formatters'

const $q = useQuasar()
const community = useCommunityStore()
const session = useSessionStore()

const composerOpen = ref(false)
const publishing = ref(false)
const activeTab = ref('for-you')
const commentDrafts = reactive({})
const replyTargets = reactive({})
const commentEditing = reactive({})
const likeLoading = reactive({})
const bookmarkLoading = reactive({})
const commentLoading = reactive({})
const mediaViewerOpen = ref(false)
const mediaViewerImages = ref([])
const mediaViewerIndex = ref(0)
const mediaViewerTitle = ref('')
const editingCommentId = ref(null)
const editingDraft = ref('')
const postForm = reactive({
  title: '',
  topic: '',
  excerpt: '',
  body: '',
  type: 'text',
  images: [],
})

const postTypes = [
  { label: 'Text update', value: 'text' },
  { label: 'Image update', value: 'image' },
  { label: 'Project share', value: 'project_share' },
  { label: 'Event share', value: 'event_share' },
  { label: 'Job share', value: 'job_share' },
  { label: 'Link share', value: 'link_share' },
  { label: 'Code snippet', value: 'code_snippet' },
]

const postTypeConfig = {
  image: { label: 'Image', tone: 'theme-chip-primary' },
  project_share: { label: 'Project', tone: 'theme-chip-secondary' },
  event_share: { label: 'Event', tone: 'theme-chip-warning' },
  job_share: { label: 'Job', tone: 'theme-chip-success' },
  code_snippet: { label: 'Code', tone: 'theme-chip-secondary' },
}

const feedState = computed(() => community.feedList)
const feed = computed(() => feedState.value.items)
const hasMorePosts = computed(() => feedState.value.hasMore)
const isInitialFeedLoading = computed(() => feedState.value.loading && !feed.value.length)
const isLoadingMore = computed(() => feedState.value.loading && feed.value.length > 0)
const pinnedCount = computed(() => feed.value.filter((post) => post.pinned).length)
const topicPreview = computed(() => [...new Set(feed.value.map((post) => post.topic).filter(Boolean))].slice(0, 6))
const topicCount = computed(() => topicPreview.value.length)
const suggestedDevelopers = computed(() => community.developers.slice(0, 4))
const imagePreviewUrls = computed(() => (postForm.images || []).map((file) => URL.createObjectURL(file)))

async function handleLoadMore() {
  if (community.feedLoading || !community.feedPagination.hasMore) {
    return
  }

  await community.fetchNextFeedPage()
}

function postTypeBadge(post) {
  return postTypeConfig[post.type] || null
}

function openMediaViewer(images = [], index = 0, title = '') {
  mediaViewerImages.value = images
  mediaViewerIndex.value = index
  mediaViewerTitle.value = title
  mediaViewerOpen.value = true
}

function commentProfileTarget(username) {
  return username ? `/u/${username}` : '/developers'
}

const { sentinelRef, shouldShowManualButton, resetAutoLoads } = useInfinitePager({
  canAutoLoad: computed(() => feed.value.length > 0),
  hasMore: hasMorePosts,
  isLoading: computed(() => feedState.value.loading),
  loadMore: handleLoadMore,
  maxAutoPages: 4,
})

onMounted(() => {
  community.fetchDevelopers()
})

watch(
  activeTab,
  async (tab) => {
    resetAutoLoads()
    await community.fetchFeed({ tab, page: 1, append: false })
  },
  { immediate: true },
)

async function publishPost() {
  publishing.value = true

  try {
    await community.createPost(postForm)
    Object.assign(postForm, { title: '', topic: '', excerpt: '', body: '', type: 'text', images: [] })
    composerOpen.value = false
    $q.notify({ type: 'positive', message: 'Post published' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to publish post' })
  } finally {
    publishing.value = false
  }
}

async function toggleLike(postId) {
  if (likeLoading[postId]) {
    return
  }

  likeLoading[postId] = true

  try {
    await community.likePost(postId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to like post' })
  } finally {
    likeLoading[postId] = false
  }
}

async function submitComment(postId) {
  if (commentLoading[postId]) {
    return
  }

  commentLoading[postId] = true

  try {
    const replyTarget = replyTargets[postId] || null
    await community.commentOnPost(postId, commentDrafts[postId], replyTarget?.id || null)
    commentDrafts[postId] = ''
    delete replyTargets[postId]
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to add comment' })
  } finally {
    commentLoading[postId] = false
  }
}

async function toggleBookmark(postId) {
  if (bookmarkLoading[postId]) {
    return
  }

  bookmarkLoading[postId] = true

  try {
    await community.togglePostBookmark(postId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save post' })
  } finally {
    bookmarkLoading[postId] = false
  }
}

async function toggleFollow(userId) {
  try {
    await community.toggleFollow(userId)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to update follow' })
  }
}

function startReply(postId, comment) {
  replyTargets[postId] = comment
}

function clearReply(postId) {
  delete replyTargets[postId]
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

async function saveCommentEdit(comment) {
  if (!editingDraft.value?.trim() || commentEditing[comment.id]) {
    return
  }

  commentEditing[comment.id] = true

  try {
    await community.updatePostComment(comment.id, editingDraft.value.trim())
    cancelCommentEdit()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to update comment' })
  } finally {
    commentEditing[comment.id] = false
  }
}

async function removeComment(postId, comment) {
  $q.dialog({
    title: 'Delete comment?',
    message: 'This will remove the comment and any replies under it.',
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete', noCaps: true },
    cancelLabel: 'Cancel',
  }).onOk(async () => {
    try {
      await community.deletePostComment(comment.id)

      if (replyTargets[postId]?.id === comment.id) {
        clearReply(postId)
      }

      if (editingCommentId.value === comment.id) {
        cancelCommentEdit()
      }

      if (replyTargets[postId]?.parent_id === comment.id) {
        clearReply(postId)
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to delete comment' })
    }
  })
}
</script>
