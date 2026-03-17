<template>
  <div class="portfolio-tab-stack">
    <section class="content-card portfolio-section q-pa-lg">
      <div class="portfolio-section-head">
        <div class="section-label">Posts & Contributions</div>
        <h2 class="portfolio-section-title">Public writing and discussion from this developer</h2>
      </div>

      <div v-if="(profile.posts || []).length" class="portfolio-post-list">
        <article v-for="post in profile.posts" :key="post.id" class="portfolio-post-card">
          <div class="portfolio-post-card__head">
            <div>
              <div class="row q-gutter-sm">
                <q-chip square dense class="theme-chip theme-chip-primary">{{ post.topic }}</q-chip>
                <q-chip v-if="post.pinned" square dense class="theme-chip theme-chip-success">Pinned</q-chip>
              </div>
              <div class="mini-card-title q-mt-sm">{{ post.title }}</div>
              <div class="card-meta q-mt-xs">{{ formatRelative(post.published_at) }} · {{ post.reading_time }} min read</div>
            </div>
            <q-btn flat round dense color="secondary" icon="share" @click="$emit('share-post', post)" />
          </div>

          <div class="mini-card-copy q-mt-sm">{{ post.excerpt }}</div>

          <div class="portfolio-card-actions q-mt-md">
            <q-btn
              flat
              no-caps
              :color="post.is_liked ? 'primary' : 'grey-5'"
              :icon="post.is_liked ? 'favorite' : 'favorite_border'"
              :label="`${post.likes_count} likes`"
              :disable="!isAuthenticated"
              @click="$emit('toggle-like', post.id)"
            />
            <q-btn
              flat
              no-caps
              :color="post.is_saved ? 'secondary' : 'grey-5'"
              :icon="post.is_saved ? 'bookmark' : 'bookmark_border'"
              :label="post.is_saved ? 'Saved' : 'Save'"
              :disable="!isAuthenticated"
              @click="$emit('toggle-post-bookmark', post.id)"
            />
            <span class="card-meta">{{ post.comments_count }} comments</span>
          </div>

          <div class="portfolio-comment-list q-mt-md">
            <div v-for="comment in post.comments || []" :key="comment.id" class="portfolio-comment-card">
              <div class="card-meta">{{ comment.user?.name }}</div>
              <div class="text-body2 q-mt-xs">{{ comment.body }}</div>
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mt-md">
            <div class="col">
              <q-input
                :model-value="commentDrafts[post.id]"
                outlined
                dense
                class="input-surface"
                label="Add a comment"
                :disable="!isAuthenticated"
                @update:model-value="$emit('update-comment-draft', { postId: post.id, value: $event })"
              />
            </div>
            <div class="col-auto">
              <q-btn
                color="primary"
                no-caps
                label="Comment"
                :disable="!isAuthenticated || !commentDrafts[post.id]"
                @click="$emit('submit-comment', post.id)"
              />
            </div>
          </div>
        </article>
      </div>
      <div v-else class="portfolio-empty-state q-mt-md">
        <div class="mini-card-title">No posts yet</div>
        <div class="mini-card-copy q-mt-xs">This developer has not published public posts yet.</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { formatRelative } from 'src/utils/formatters'

defineProps({
  profile: { type: Object, required: true },
  commentDrafts: { type: Object, required: true },
  isAuthenticated: { type: Boolean, default: false },
})

defineEmits(['toggle-like', 'toggle-post-bookmark', 'submit-comment', 'share-post', 'update-comment-draft'])
</script>
