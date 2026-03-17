<template>
  <button type="button" class="conversation-item" :class="{ 'conversation-item--active': active }" @click="$emit('select', conversation.id)">
    <q-avatar size="46px" class="conversation-item__avatar" color="primary" text-color="white">
      <img v-if="conversation.partner?.avatar_url" :src="conversation.partner.avatar_url" :alt="conversation.partner?.name || 'Partner avatar'" />
      <span v-else>{{ conversation.partner?.name?.charAt(0) || '?' }}</span>
    </q-avatar>
    <div class="conversation-item__body">
      <div class="conversation-item__row">
        <div>
          <div class="conversation-item__title">{{ conversation.partner?.name || 'Unknown developer' }}</div>
          <div class="conversation-item__subtitle">@{{ conversation.partner?.username || 'unknown' }}</div>
        </div>
        <div class="conversation-item__meta">
          <span>{{ relativeTime }}</span>
          <q-badge v-if="conversation.unread_count" color="primary" rounded>{{ conversation.unread_count }}</q-badge>
        </div>
      </div>
      <div class="conversation-item__preview" :class="{ 'conversation-item__preview--unread': conversation.unread_count }">
        <span v-if="conversation.last_message?.is_mine" class="conversation-item__you">You:</span>
        {{ previewText }}
      </div>
      <div class="conversation-item__footer">
        <span class="conversation-item__tag">{{ conversation.unread_count ? 'Unread' : conversation.last_message ? 'Recent' : 'New' }}</span>
        <!-- <span class="conversation-item__status">{{ conversation.partner?.headline || 'Direct conversation' }}</span> -->
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { formatRelative } from 'src/utils/formatters'

const props = defineProps({
  conversation: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])

const relativeTime = computed(() => formatRelative(props.conversation.last_message_at || props.conversation.updated_at))
const previewText = computed(() => {
  const body = props.conversation.last_message?.body

  if (!body) {
    return 'No messages yet'
  }

  return body.replace(/^>\s*[^:]+:\s*.+\n/, '').replace(/\s+/g, ' ').trim()
})
</script>
