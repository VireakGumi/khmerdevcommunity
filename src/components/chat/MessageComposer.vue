<template>
  <div class="chat-composer">
    <div class="chat-composer__field">
      <div v-if="replyMessage" class="chat-composer__reply">
        <div class="chat-composer__reply-copy">
          <span class="mini-label">Replying to</span>
          <strong>{{ replyMessage.sender?.name || 'Message' }}</strong>
          <div>{{ replyExcerpt }}</div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" @click="$emit('cancel-reply')" />
      </div>
      <q-input
        v-model="draft"
        outlined
        autogrow
        type="textarea"
        class="input-surface chat-composer__input"
        placeholder="Write a message..."
        :disable="isSubmitting || loading"
        @keydown.enter.exact.prevent="submit"
      />
      <div class="chat-composer__footer">
        <div class="chat-composer__hint">Enter to send. Shift + Enter for a new line.</div>
        <div class="chat-composer__tools">
          <q-btn flat round dense icon="code" color="grey-5" @click="insertCodeBlock">
            <q-tooltip>Insert code block</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="sentiment_satisfied" color="grey-5" @click="appendEmoji('🙂')">
            <q-tooltip>Add emoji</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <q-btn round color="primary" icon="send" :loading="loading" :disable="!draft.trim() || isSubmitting || loading" @click="submit" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  replyMessage: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['send', 'cancel-reply'])
const draft = ref('')
const isSubmitting = ref(false)
const replyExcerpt = computed(() => (props.replyMessage?.body || '').trim().replace(/\s+/g, ' ').slice(0, 84))

watch(
  () => props.loading,
  (loading, previous) => {
    if (previous && !loading) {
      draft.value = ''
      isSubmitting.value = false
    }

    if (loading) {
      isSubmitting.value = true
    }
  },
)

function submit() {
  if (props.loading || isSubmitting.value) {
    return
  }

  const body = draft.value.trim()

  if (!body) {
    return
  }

  isSubmitting.value = true
  const payload = props.replyMessage
    ? `> ${props.replyMessage.sender?.name || 'Message'}: ${replyExcerpt.value}\n${body}`
    : body

  emit('send', payload)

  window.setTimeout(() => {
    if (!props.loading) {
      isSubmitting.value = false
    }
  }, 0)
}

function insertCodeBlock() {
  const snippet = '```\n\n```'
  draft.value = draft.value ? `${draft.value}\n${snippet}` : snippet
}

function appendEmoji(emoji) {
  draft.value = `${draft.value}${emoji}`
}
</script>
