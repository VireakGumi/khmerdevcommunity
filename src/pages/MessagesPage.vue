<template>
  <q-page padding class="chat-page">
    <div class="chat-page-shell">
      <div class="chat-workspace">
        <aside v-if="!isCompactScreen || !chat.activeConversation" class="chat-sidebar">
          <div class="chat-sidebar__toolbar kdc-page-head">
            <div>
              <div class="section-label">{{ $t('messagesPage.inbox') }}</div>
              <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ $t('messagesPage.chats') }}</div>
            </div>
            <div class="chat-sidebar__actions kdc-page-head__actions kdc-action-cluster">
              <q-chip square class="theme-chip theme-chip-secondary">{{ $t('messagesPage.unread') }} {{ chat.unreadCount }}</q-chip>
              <q-btn no-caps color="primary" unelevated icon="edit_square" :label="$t('messagesPage.newChat')" class="chat-sidebar__new-chat">
                <q-menu class="glass-panel panel-card" anchor="bottom right" self="top right">
                  <q-list style="min-width: 260px">
                    <q-item-label header>{{ $t('messagesPage.startConversation') }}</q-item-label>
                    <q-item
                      v-for="developer in developerSuggestions"
                      :key="developer.id"
                      clickable
                      v-close-popup
                      @click="startConversation(developer.id)"
                    >
                      <q-item-section avatar>
                        <q-avatar size="34px" color="primary" text-color="white">
                          <img v-if="developer.avatar_url" :src="developer.avatar_url" :alt="developer.name" />
                          <span v-else>{{ developer.name?.charAt(0) }}</span>
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ developer.name }}</q-item-label>
                        <q-item-label caption>@{{ developer.username }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>

          <conversation-list
            :conversations="chat.conversations"
            :active-conversation-id="chat.activeConversationId"
            :loading="chat.loadingList"
            :search="chat.search"
            @select="openConversation"
            @update:search="handleSearch"
          />
        </aside>

        <div v-if="!isCompactScreen || chat.activeConversation" class="chat-thread-column">
          <conversation-pane
            v-if="chat.activeConversation"
            :conversation="chat.activeConversation"
            :messages="chat.activeMessages"
            :loading="chat.loadingConversation"
            :sending="chat.sending"
            :details-open="detailsOpen"
            :mobile="isCompactScreen"
            :focus-search-key="conversationSearchKey"
            @send="sendMessage"
            @retry="retryMessage"
            @back="closeConversation"
            @toggle-details="detailsOpen = !detailsOpen"
          />

          <empty-conversation-state
            v-else
            class="chat-empty-panel"
            :developers="developerSuggestions"
            @start="startConversation"
          />
        </div>

      </div>

      <q-dialog
        v-model="detailsOpen"
        :maximized="$q.screen.lt.md"
        :position="$q.screen.lt.md ? 'bottom' : 'right'"
        class="chat-details-dialog"
      >
        <div class="glass-panel panel-card chat-details-sheet">
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
    </div>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ChatProfilePanel from 'src/components/chat/ChatProfilePanel.vue'
import ConversationList from 'src/components/chat/ConversationList.vue'
import ConversationPane from 'src/components/chat/ConversationPane.vue'
import EmptyConversationState from 'src/components/chat/EmptyConversationState.vue'
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

const isCompactScreen = computed(() => $q.screen.lt.md)
const developerSuggestions = computed(() => community.developers.slice(0, 6))
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
    // Keep the UI usable even if live refresh fails in the background.
  }
}

async function handleSearch(search) {
  try {
    await chat.fetchConversations(search)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.loadConversationsFailed') })
  }
}

async function openConversation(conversationId) {
  try {
    await chat.openConversation(conversationId)
    detailsOpen.value = false
    await router.replace({ query: { conversation: conversationId } })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.openConversationFailed') })
  }
}

async function closeConversation() {
  detailsOpen.value = false
  chat.activeConversationId = null
  chat.bindActiveConversationChannel()
  await router.replace({ query: {} })
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

async function hydrateFromRoute() {
  const recipientId = Number(route.query.recipient)
  const conversationId = Number(route.query.conversation)

  if (recipientId) {
    const conversation = await chat.startConversation(recipientId)
    await openConversation(conversation.id)
    return
  }

  if (conversationId) {
    await openConversation(conversationId)
    return
  }

  if (isCompactScreen.value) {
    chat.activeConversationId = null
    chat.bindActiveConversationChannel()
    return
  }

  if (chat.conversations[0]) {
    await openConversation(chat.conversations[0].id)
  }
}

watch(
  () => route.query,
  async (query, previous) => {
    if (query.conversation === previous?.conversation && query.recipient === previous?.recipient) {
      return
    }

    try {
      await hydrateFromRoute()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.routeSyncFailed') })
    }
  },
)

watch(
  () => isCompactScreen.value,
  async (compact, previous) => {
    if (compact === previous) {
      return
    }

    try {
      await hydrateFromRoute()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || t('messagesPage.layoutUpdateFailed') })
    }
  },
)

onMounted(async () => {
  try {
    await Promise.all([
      chat.fetchConversations(),
      chat.fetchUnreadCount(),
      community.fetchDevelopers(),
    ])
    chat.connectRealtime()
    await hydrateFromRoute()
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
