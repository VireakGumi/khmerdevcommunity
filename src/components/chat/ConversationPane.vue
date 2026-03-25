<template>
  <section v-if="conversation" class="content-card chat-pane-card" :class="{ 'chat-pane-card--mobile': mobile }">
    <div class="chat-pane-head kdc-page-head">
      <div class="chat-pane-identity">
        <div v-if="mobile" class="chat-pane-back">
          <q-btn flat round dense icon="arrow_back" color="grey-5" @click="$emit('back')" />
        </div>
        <q-avatar size="48px" class="chat-pane-avatar" color="primary" text-color="white">
          <img v-if="conversation.partner?.avatar_url" :src="conversation.partner.avatar_url" :alt="conversation.partner?.name || t('messagesPage.unknownDeveloper')" />
          <span v-else>{{ conversation.partner?.name?.charAt(0) || '?' }}</span>
        </q-avatar>
        <div class="chat-pane-copy">
          <div class="chat-pane-topline">
            <div class="text-subtitle1 text-weight-bold">{{ conversation.partner?.name || 'Unknown developer' }}</div>
            <span v-if="!mobile" class="chat-pane-status">{{ paneStatus }}</span>
          </div>
          <div class="card-meta">@{{ conversation.partner?.username || 'unknown' }}</div>
          <!-- <div v-if="conversation.partner?.headline" class="chat-pane-headline">{{ conversation.partner.headline }}</div> -->
        </div>
      </div>
      <div class="chat-pane-actions kdc-action-cluster kdc-inline-scroll kdc-action-cluster--nowrap">
        <q-btn v-if="!mobile" flat round dense class="chat-pane-action-btn" icon="search" color="grey-5" @click="toggleSearch">
          <q-tooltip>{{ $t('messagesPage.searchConversation') }}</q-tooltip>
        </q-btn>
        <q-btn flat round dense class="chat-pane-action-btn" icon="phone" color="primary" />
        <q-btn flat round dense class="chat-pane-action-btn" :icon="detailsOpen ? 'dock_to_right' : 'info'" color="grey-5" @click="$emit('toggle-details')" />
        <q-btn
          v-if="mobile"
          flat
          round
          dense
          class="chat-pane-action-btn"
          icon="person"
          color="secondary"
          :to="conversation.partner ? `/m/u/${conversation.partner.username}` : '/m/developers'"
        >
          <q-tooltip>{{ $t('messagesPage.profile') }}</q-tooltip>
        </q-btn>
        <q-btn
          v-else
          flat
          no-caps
          color="secondary"
          class="chat-pane-profile-btn"
          icon="person"
          :to="conversation.partner ? `/u/${conversation.partner.username}` : '/developers'"
        >
          {{ $t('messagesPage.profile') }}
        </q-btn>
      </div>
    </div>

    <div v-if="!mobile" class="chat-pane-banner">
      <span class="chat-pane-banner__dot" />
      {{ $t('messagesPage.bannerCopy') }}
    </div>

    <div v-if="searchOpen" class="chat-pane-search">
      <q-input
        v-model="searchQuery"
        dense
        outlined
        autofocus
        clearable
        :placeholder="$t('messagesPage.searchMessages')"
        class="input-surface chat-pane-search__input"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <div class="chat-pane-search__meta">
        <span v-if="searchQuery">{{ $t('messagesPage.resultCount', filteredMessages.length) }}</span>
        <span v-else>{{ $t('messagesPage.typeToFilter') }}</span>
      </div>
    </div>

    <div ref="scrollArea" class="chat-message-scroll" @scroll="handleScroll">
      <div v-if="loading" class="empty-state-card">
        <q-spinner color="primary" size="24px" />
        <div class="text-body2 muted-text q-mt-sm">{{ $t('messagesPage.loadingConversation') }}</div>
      </div>
      <div v-else-if="!filteredMessages.length && searchQuery" class="chat-thread-empty">
        <q-icon name="search_off" color="primary" size="26px" />
        <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('messagesPage.noMatchingMessages') }}</div>
        <div class="text-body2 muted-text q-mt-xs">{{ $t('messagesPage.noMatchingMessagesCopy') }}</div>
      </div>
      <div v-else-if="!messages.length" class="chat-thread-empty">
        <q-icon name="mark_chat_read" color="primary" size="26px" />
        <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('messagesPage.startThread') }}</div>
        <div class="text-body2 muted-text q-mt-xs">{{ $t('messagesPage.startThreadCopy') }}</div>
      </div>
      <template v-else>
        <template v-for="item in timelineItems" :key="item.key">
          <div v-if="item.type === 'day'" class="chat-day-separator">
            <span>{{ item.label }}</span>
          </div>
          <div v-else class="message-group" :class="item.group.is_mine ? 'message-group--mine' : 'message-group--theirs'">
            <q-avatar v-if="!item.group.is_mine" size="32px" class="message-group__avatar" color="primary" text-color="white">
              <img v-if="item.group.sender?.avatar_url" :src="item.group.sender.avatar_url" :alt="item.group.sender?.name || 'Sender avatar'" />
              <span v-else>{{ item.group.sender?.name?.charAt(0) || '?' }}</span>
            </q-avatar>
            <div class="message-group__stack">
              <div v-if="!item.group.is_mine" class="message-group__label">
                <span>{{ item.group.sender?.name }}</span>
              </div>
              <message-bubble
                v-for="(groupMessage, index) in item.group.messages"
                :key="groupMessage.id"
                :message="groupMessage"
                :compact="item.group.messages.length > 1"
                :show-meta="index === item.group.messages.length - 1"
                @reply="replyToMessage"
                @copy="copyMessage"
                @retry="retryMessage"
              />
            </div>
          </div>
        </template>
      </template>
    </div>

    <message-composer
      :mobile="mobile"
      :loading="sending"
      :reply-message="replyMessage"
      @send="forwardMessage"
      @cancel-reply="replyMessage = null"
    />
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import MessageBubble from './MessageBubble.vue'
import MessageComposer from './MessageComposer.vue'

const props = defineProps({
  conversation: {
    type: Object,
    default: null,
  },
  messages: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  sending: {
    type: Boolean,
    default: false,
  },
  detailsOpen: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
  focusSearchKey: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['send', 'retry', 'back', 'toggle-details'])
const $q = useQuasar()
const { t } = useI18n()
const searchOpen = ref(false)
const searchQuery = ref('')
const replyMessage = ref(null)
const scrollArea = ref(null)
const shouldStickToBottom = ref(true)

function formatDayLabel(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return t('messagesPage.today')
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return t('messagesPage.yesterday')
  }

  return date.toLocaleDateString([], { month: 'long', day: 'numeric' })
}

const filteredMessages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return props.messages
  }

  return props.messages.filter((message) => message.body?.toLowerCase().includes(query))
})

const timelineItems = computed(() => {
  const items = []
  let lastDayKey = null
  let activeGroup = null

  for (const message of filteredMessages.value) {
    const dayKey = new Date(message.sent_at).toDateString()

    if (dayKey !== lastDayKey) {
      activeGroup = null
      items.push({
        type: 'day',
        key: `day-${dayKey}`,
        label: formatDayLabel(message.sent_at),
      })
      lastDayKey = dayKey
    }

    const lastMessage = activeGroup?.messages?.[activeGroup.messages.length - 1]
    const sameSender = activeGroup && lastMessage?.sender?.id === message.sender?.id && activeGroup.is_mine === message.is_mine
    const withinGroupWindow = sameSender && Math.abs(new Date(message.sent_at) - new Date(lastMessage.sent_at)) < 5 * 60 * 1000

    if (!withinGroupWindow) {
      activeGroup = {
        type: 'group',
        key: `group-${message.id}`,
        group: {
          sender: message.sender,
          is_mine: message.is_mine,
          messages: [message],
        },
      }

      items.push(activeGroup)
      continue
    }

    activeGroup.group.messages.push(message)
  }

  return items
})

const paneStatus = computed(() => {
  const lastMessage = props.conversation?.last_message

  if (!lastMessage?.is_mine) {
    return t('messagesPage.directThread')
  }

  if (lastMessage.pending) {
    return t('messagesPage.sending')
  }

  return lastMessage.is_read ? t('messagesPage.seen') : t('messagesPage.delivered')
})

function handleScroll() {
  const element = scrollArea.value

  if (!element) {
    return
  }

  const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight
  shouldStickToBottom.value = distanceFromBottom < 80
}

function scrollToBottom(force = false) {
  const element = scrollArea.value

  if (!element || (!force && !shouldStickToBottom.value)) {
    return
  }

  element.scrollTop = element.scrollHeight
}

function toggleSearch() {
  searchOpen.value = !searchOpen.value

  if (!searchOpen.value) {
    searchQuery.value = ''
  }
}

function replyToMessage(message) {
  replyMessage.value = message
}

async function copyMessage(body) {
  try {
    await copyToClipboard(body)
    $q.notify({ type: 'positive', message: t('messagesPage.messageCopied') })
  } catch {
    $q.notify({ type: 'negative', message: t('messagesPage.copyMessageFailed') })
  }
}

function forwardMessage(body) {
  emit('send', body)
  replyMessage.value = null
}

function retryMessage(message) {
  emit('retry', message)
}

watch(
  () => props.conversation?.id,
  async () => {
    replyMessage.value = null
    searchQuery.value = ''
    searchOpen.value = false
    shouldStickToBottom.value = true
    await nextTick()
    scrollToBottom(true)
  },
)

watch(
  () => props.messages.length,
  async (length, previous) => {
    if (length === previous) {
      return
    }

    await nextTick()
    scrollToBottom(previous === 0)
  },
)

watch(
  () => props.loading,
  async (loading, previous) => {
    if (previous && !loading) {
      await nextTick()
      scrollToBottom(true)
    }
  },
)

watch(
  () => props.focusSearchKey,
  () => {
    searchOpen.value = true
  },
)
</script>
