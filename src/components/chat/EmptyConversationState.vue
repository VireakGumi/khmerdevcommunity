<template>
  <div class="empty-conversation-state content-card">
    <q-icon name="mark_chat_unread" color="primary" size="30px" />
    <div class="text-h6 text-weight-bold q-mt-md">{{ $t('messagesPage.chooseConversation') }}</div>
    <div class="text-body2 muted-text q-mt-sm">
      {{ $t('messagesPage.chooseConversationCopy') }}
    </div>
    <div class="q-mt-md chat-suggestion-grid">
      <q-btn
        v-for="developer in developers"
        :key="developer.id"
        flat
        no-caps
        class="ghost-btn chat-suggestion-btn"
        @click="$emit('start', developer.id)"
      >
        <q-avatar size="28px" color="primary" text-color="white" class="q-mr-sm">
          <img v-if="developer.avatar_url" :src="developer.avatar_url" :alt="developer.name" />
          <span v-else>{{ developer.name?.charAt(0) }}</span>
        </q-avatar>
        {{ developer.name }}
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

useI18n()

defineProps({
  developers: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['start'])
</script>
