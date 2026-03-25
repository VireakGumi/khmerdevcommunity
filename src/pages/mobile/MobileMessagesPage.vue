<template>
  <q-page class="mobile-messages-page q-pa-sm" :class="{ 'mobile-messages-page--thread': !!activeConversation }">
    <template v-if="activeConversation">
      <conversation-pane
        mobile
        :conversation="activeConversation"
        :messages="chat.activeMessages"
        :loading="chat.loadingConversation"
        :sending="chat.sending"
        :focus-search-key="conversationSearchKey"
        @send="sendMessage"
        @retry="retryMessage"
        @back="goBack"
        @toggle-details="detailsOpen = !detailsOpen"
      />
    </template>
    <template v-else>
      <div class="mobile-inbox-shell mobile-inbox-shell--app">
        <section class="mobile-inbox-panel">
          <div class="mobile-inbox-panel__head">
            <div>
              <div class="mobile-inbox-panel__eyebrow">{{ $t('messagesPage.inbox') }}</div>
              <div class="mobile-inbox-panel__title">{{ $t('nav.inbox') }}</div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="edit"
              class="mobile-inbox-panel__compose"
              @click="developerSuggestions[0] && startConversation(developerSuggestions[0].id)"
            />
          </div>

          <q-input
            :model-value="chat.search"
            dense
            outlined
            class="input-surface mobile-inbox-panel__search"
            :placeholder="$t('common.searchPlaceholder')"
            @update:model-value="handleSearch"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <div class="mobile-inbox-panel__list">
            <div class="mobile-inbox-panel__stats">
              <span>{{ chat.conversations.length }} {{ $t('messagesPage.chats') }}</span>
              <span>{{ chat.unreadCount }} {{ $t('messagesPage.unread') }}</span>
            </div>

            <div v-if="chat.loadingList" class="empty-state-card mobile-inbox-panel__empty">
              <q-spinner color="white" size="24px" />
              <div class="text-body2 q-mt-sm">{{ $t('messagesPage.loadingConversations') }}</div>
            </div>

            <template v-else-if="chat.conversations.length">
              <conversation-list-item
                v-for="conversation in chat.conversations"
                :key="conversation.id"
                :conversation="conversation"
                :active="conversation.id === chat.activeConversationId"
                @select="openConversation"
              />
            </template>

            <div v-else class="empty-state-card mobile-inbox-panel__empty">
              <q-icon name="forum" size="26px" color="white" />
              <div class="text-subtitle2 text-weight-bold q-mt-sm">{{ $t('messagesPage.noConversations') }}</div>
              <div class="text-body2 q-mt-xs">{{ $t('mobileMessages.startThreadCopy') }}</div>
            </div>
          </div>
        </section>

        <section v-if="developerSuggestions.length" class="mobile-inbox-quickstart">
          <div class="mobile-inbox-quickstart__label">{{ $t('mobileMessages.quickStart') }}</div>
          <div class="mobile-inbox-quickstart__row">
            <q-btn
              v-for="developer in developerSuggestions"
              :key="developer.id"
              flat
              no-caps
              round
              class="mobile-inbox-quickstart__avatar"
              @click="startConversation(developer.id)"
            >
              <q-avatar size="40px" color="primary" text-color="white">
                <img v-if="developer.avatar_url" :src="developer.avatar_url" :alt="developer.name" />
                <span v-else>{{ developer.name?.charAt(0) }}</span>
              </q-avatar>
            </q-btn>
          </div>
        </section>
      </div>
    </template>

    <q-dialog v-model="detailsOpen" position="bottom" maximized>
      <div class="glass-panel panel-card chat-details-sheet chat-details-sheet--mobile">
        <chat-profile-panel
          :partner="activePartner"
          :developer-suggestions="developerSuggestions"
          :muted="mutedConversation"
          @start="startConversation"
          @audio-call="handleConversationAction('Audio call')"
          @video-call="handleConversationAction('Video call')"
          @search="focusConversationSearch"
          @mute="toggleMuteConversation"
          @report="handleConversationAction('Report flow')"
        />
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ChatProfilePanel from 'src/components/chat/ChatProfilePanel.vue'
import ConversationListItem from 'src/components/chat/ConversationListItem.vue'
import ConversationPane from 'src/components/chat/ConversationPane.vue'
import { useChatStore } from 'src/stores/chat-store'
import { useCommunityStore } from 'src/stores/community-store'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const chat = useChatStore()
const community = useCommunityStore()
let refreshTimerId = null
const detailsOpen = ref(false)
const mutedConversation = ref(false)
const conversationSearchKey = ref(0)

const activeConversation = computed(() => chat.activeConversation)
const developerSuggestions = computed(() => community.developers.slice(0, 5))
const activePartner = computed(() => {
  const partner = chat.activeConversation?.partner
  if (!partner) {
    return null
  }

  return community.developers.find((item) => item.id === partner.id || item.username === partner.username) || partner
})

async function refreshInboxSilently() {
  try {
    await chat.fetchConversations(chat.search, { silent: true })
    await chat.fetchUnreadCount()

    if (chat.activeConversationId) {
      await chat.openConversation(chat.activeConversationId, { silent: true, markRead: true })
    }
  } catch {
    // Ignore background refresh errors on mobile fallback.
  }
}

async function handleSearch(search) {
  try {
    await chat.fetchConversations(search)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.loadInboxFailed') })
  }
}

async function openConversation(conversationId) {
  try {
    await chat.openConversation(conversationId)
    detailsOpen.value = false
    await router.push(`/m/messages/${conversationId}`)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.openConversationFailed') })
  }
}

async function startConversation(recipientId) {
  try {
    const conversation = await chat.startConversation(recipientId)
    await openConversation(conversation.id)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.startConversationFailed') })
  }
}

async function sendMessage(body) {
  try {
    await chat.sendMessage(body)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.sendMessageFailed') })
  }
}

async function retryMessage(message) {
  try {
    await chat.retryMessage(message)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.retryMessageFailed') })
  }
}

function handleConversationAction(label) {
  $q.notify({ type: 'info', message: t('messagesPage.actionReady', { label }) })
}

function focusConversationSearch() {
  detailsOpen.value = false
  conversationSearchKey.value += 1
}

function toggleMuteConversation() {
  mutedConversation.value = !mutedConversation.value
  $q.notify({
    type: 'info',
    message: mutedConversation.value ? t('messagesPage.muted') : t('messagesPage.unmuted'),
  })
}

function goBack() {
  detailsOpen.value = false
  router.push('/m/messages')
}

watch(
  () => route.params.conversationId,
  async (value) => {
    const conversationId = Number(value)

    if (!conversationId) {
      chat.activeConversationId = null
      chat.bindActiveConversationChannel()
      return
    }

    try {
      await chat.openConversation(conversationId)
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.openConversationFailed') })
    }
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    await Promise.all([
      chat.fetchConversations(),
      chat.fetchUnreadCount(),
      community.fetchDevelopers(),
    ])
    chat.connectRealtime()
    refreshTimerId = window.setInterval(refreshInboxSilently, 2500)
    window.addEventListener('focus', refreshInboxSilently)
    document.addEventListener('visibilitychange', refreshInboxSilently)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.loadInboxFailed') })
  }
})

onBeforeUnmount(() => {
  if (refreshTimerId) {
    window.clearInterval(refreshTimerId)
    refreshTimerId = null
  }

  window.removeEventListener('focus', refreshInboxSilently)
  document.removeEventListener('visibilitychange', refreshInboxSilently)
})
</script>
