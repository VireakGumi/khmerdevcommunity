<template>
  <section class="content-card chat-list-card">
    <q-input
      :model-value="search"
      dense
      outlined
      class="input-surface"
      :placeholder="$t('messagesPage.searchDevelopers')"
      @update:model-value="$emit('update:search', $event)"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <div class="chat-list-scroll q-mt-md">
      <div v-if="loading" class="empty-state-card">
        <q-spinner color="primary" size="24px" />
        <div class="text-body2 muted-text q-mt-sm">{{ $t('messagesPage.loadingConversations') }}</div>
      </div>

      <conversation-list-item
        v-for="conversation in conversations"
        v-else
        :key="conversation.id"
        :conversation="conversation"
        :active="conversation.id === activeConversationId"
        @select="$emit('select', $event)"
      />

      <div v-if="!loading && !conversations.length" class="empty-state-card">
        <q-icon name="forum" size="26px" color="primary" />
        <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('messagesPage.noConversations') }}</div>
        <div class="text-body2 muted-text q-mt-xs">{{ $t('messagesPage.noConversationsCopy') }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import ConversationListItem from './ConversationListItem.vue'

defineProps({
  conversations: {
    type: Array,
    default: () => [],
  },
  activeConversationId: {
    type: Number,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  search: {
    type: String,
    default: '',
  },
})

defineEmits(['select', 'update:search'])
</script>
