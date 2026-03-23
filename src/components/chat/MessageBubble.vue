<template>
  <div class="message-stack" :class="{ 'message-stack--compact': compact }">
    <div class="message-bubble-wrap" :class="{ 'message-bubble-wrap--mine': message.is_mine }">
      <div class="message-bubble-actions">
        <q-btn v-if="message.failed" flat round dense size="sm" icon="refresh" color="negative" @click="$emit('retry', message)">
          <q-tooltip>Retry</q-tooltip>
        </q-btn>
        <q-btn flat round dense size="sm" icon="reply" color="grey-5" @click="$emit('reply', message)">
          <q-tooltip>Reply</q-tooltip>
        </q-btn>
        <q-btn flat round dense size="sm" icon="content_copy" color="grey-5" @click="$emit('copy', displayBody)">
          <q-tooltip>Copy</q-tooltip>
        </q-btn>
      </div>
      <div class="message-bubble" :class="message.is_mine ? 'message-bubble--mine' : 'message-bubble--theirs'">
        <div v-if="replyPreview" class="message-bubble__reply">
          <span class="message-bubble__reply-label">Replying to {{ replyPreview.sender }}</span>
          <div class="message-bubble__reply-copy">{{ replyPreview.excerpt }}</div>
        </div>
      <pre v-if="codeBlock" class="message-bubble__code"><code>{{ codeBlock.content }}</code></pre>
        <div v-else class="message-bubble__body">{{ displayBody }}</div>
      </div>
    </div>
    <div v-if="showMeta" class="message-bubble__meta" :class="{ 'message-bubble__meta--mine': message.is_mine }">
      <span>{{ sentAt }}</span>
      <span v-if="message.is_mine">{{ deliveryLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  showMeta: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['reply', 'copy', 'retry'])

const sentAt = computed(() => new Date(props.message.sent_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
const deliveryLabel = computed(() => {
  if (props.message.pending) {
    return 'Sending...'
  }

  if (props.message.failed) {
    return 'Failed'
  }

  return props.message.is_read ? 'Seen' : 'Delivered'
})
const replyPreview = computed(() => {
  const body = props.message.body || ''
  const match = body.match(/^>\s*([^:]+):\s*(.+)\n([\s\S]*)$/)

  if (!match) {
    return null
  }

  return {
    sender: match[1].trim(),
    excerpt: match[2].trim(),
    remainder: match[3].trim(),
  }
})

const displayBody = computed(() => replyPreview.value?.remainder || props.message.body || '')
const codeBlock = computed(() => {
  const body = displayBody.value.trim()
  const match = body.match(/^```([\w-]*)\n?([\s\S]*?)```$/)

  if (!match) {
    return null
  }

  return {
    language: match[1] || 'code',
    content: match[2].trim(),
  }
})
</script>
