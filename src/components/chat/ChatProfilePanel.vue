<template>
  <div class="chat-utility-scroll">
    <div v-if="partner" class="content-card chat-utility-card chat-profile-panel">
      <div class="chat-profile-panel__hero">
        <q-avatar size="72px" class="chat-utility-card__avatar chat-profile-panel__avatar" color="primary" text-color="white">
          <img v-if="partner.avatar_url" :src="partner.avatar_url" :alt="partner.name || 'Developer avatar'" />
          <span v-else>{{ partner.name?.charAt(0) || '?' }}</span>
        </q-avatar>
        <div class="chat-profile-panel__identity">
          <div class="chat-profile-panel__title-row">
            <div class="text-subtitle1 text-weight-bold">{{ partner.name || 'Unknown developer' }}</div>
            <span class="chat-profile-panel__presence" :class="presenceClass">{{ presenceLabel }}</span>
          </div>
          <div class="card-meta">
            @{{ partner.username || 'unknown' }}
            <span v-if="partner.location"> • {{ partner.location }}</span>
          </div>
          <div v-if="partner.headline" class="text-body2 q-mt-sm">{{ partner.headline }}</div>
          <div class="chat-profile-panel__activity">Last active {{ lastActiveLabel }}</div>
        </div>
      </div>

      <div class="chat-profile-panel__primary-actions">
        <q-btn no-caps color="primary" unelevated icon="person" :to="`/u/${partner.username}`" label="View profile" />
        <q-btn no-caps flat class="ghost-btn" icon="search" label="Search thread" @click="$emit('search')" />
      </div>

      <div class="chat-profile-panel__call-actions">
        <q-btn no-caps outline color="primary" icon="call" label="Audio call" @click="$emit('audio-call')" />
        <q-btn no-caps outline color="primary" icon="videocam" label="Video call" @click="$emit('video-call')" />
        <q-btn flat round dense icon="more_horiz" color="grey-5">
          <q-menu class="glass-panel panel-card" anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <q-item clickable v-close-popup @click="$emit('mute')">
                <q-item-section avatar><q-icon :name="muted ? 'notifications_off' : 'notifications'" /></q-item-section>
                <q-item-section>{{ muted ? 'Unmute conversation' : 'Mute conversation' }}</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('report')">
                <q-item-section avatar><q-icon name="flag" /></q-item-section>
                <q-item-section>Block or report user</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div class="chat-profile-panel__stats">
        <div class="chat-utility-card__metric">
          <span class="mini-label">Followers</span>
          <strong>{{ partner.followers_count || 0 }}</strong>
        </div>
        <div class="chat-utility-card__metric">
          <span class="mini-label">Skills</span>
          <strong>{{ partner.skills?.length || 0 }}</strong>
        </div>
        <div class="chat-utility-card__metric">
          <span class="mini-label">Shared communities</span>
          <strong>{{ sharedCommunities }}</strong>
        </div>
      </div>

      <div class="chat-profile-panel__tool-list">
        <div class="chat-profile-panel__tool">
          <q-icon name="push_pin" size="18px" color="primary" />
          <span>
            <strong>Pinned notes</strong>
            <small>{{ pinnedMessageLabel }}</small>
          </span>
        </div>
        <div class="chat-profile-panel__tool">
          <q-icon name="link" size="18px" color="secondary" />
          <span>
            <strong>Shared links & files</strong>
            <small>{{ sharedLinksLabel }}</small>
          </span>
        </div>
        <div class="chat-profile-panel__tool">
          <q-icon :name="muted ? 'notifications_off' : 'notifications_active'" size="18px" color="warning" />
          <span>
            <strong>Conversation alerts</strong>
            <small>{{ muted ? 'Muted for now' : 'Live notifications are on' }}</small>
          </span>
        </div>
      </div>

      <div class="chat-utility-card__section">
        <div class="mini-label">Quick note</div>
        <div class="text-body2 muted-text">
          {{ partner.portfolio_summary || partner.bio || 'Use this thread for feedback, project updates, and direct collaboration.' }}
        </div>
      </div>

      <div v-if="partner.skills?.length" class="chat-utility-card__section">
        <div class="mini-label">Tech stack</div>
        <div class="chat-utility-card__skills">
          <span v-for="skill in partner.skills.slice(0, 6)" :key="skill" class="chat-utility-card__skill">
            {{ skill }}
          </span>
        </div>
      </div>
    </div>

    <div class="content-card chat-utility-card">
      <div class="section-label">Quick Start</div>
      <div class="text-subtitle2 text-weight-bold q-mt-sm">Reach more builders</div>
      <div class="text-body2 muted-text q-mt-sm">Start a new thread with someone from the community directory or continue your most active conversations.</div>

      <div class="chat-utility-card__suggestions q-mt-md">
        <button
          v-for="developer in developerSuggestions"
          :key="developer.id"
          type="button"
          class="chat-suggestion-row"
          @click="$emit('start', developer.id)"
        >
          <q-avatar size="34px" color="primary" text-color="white">
            <img v-if="developer.avatar_url" :src="developer.avatar_url" :alt="developer.name" />
            <span v-else>{{ developer.name?.charAt(0) }}</span>
          </q-avatar>
          <span>
            <strong>{{ developer.name }}</strong>
            <small>@{{ developer.username }}</small>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  partner: {
    type: Object,
    default: null,
  },
  developerSuggestions: {
    type: Array,
    default: () => [],
  },
  muted: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['start', 'audio-call', 'video-call', 'search', 'mute', 'report'])

const presenceLabel = computed(() => (props.partner?.last_active_at ? 'Recently active' : 'Available'))
const presenceClass = computed(() => (props.partner?.last_active_at ? 'chat-profile-panel__presence--online' : 'chat-profile-panel__presence--idle'))
const lastActiveLabel = computed(() => {
  if (!props.partner?.last_active_at) {
    return 'just now'
  }

  return new Date(props.partner.last_active_at).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
})

const sharedCommunities = computed(() => {
  if (!props.partner) {
    return 0
  }

  return props.partner.company ? 2 : 1
})

const pinnedMessageLabel = computed(() => {
  if (!props.partner) {
    return 'Nothing pinned yet'
  }

  return props.partner.featured_work?.length ? `${props.partner.featured_work.length} project note${props.partner.featured_work.length === 1 ? '' : 's'}` : 'Nothing pinned yet'
})

const sharedLinksLabel = computed(() => {
  const count = [props.partner?.github_url, props.partner?.portfolio_url, props.partner?.linkedin_url, props.partner?.website_url].filter(Boolean).length
  return count ? `${count} link${count === 1 ? '' : 's'} available` : 'No shared links yet'
})
</script>
