<template>
  <q-page class="q-pa-md q-pb-xl">
    <template v-if="activeConversation">
      <conversation-pane
        mobile
        :conversation="activeConversation"
        :messages="chat.activeMessages"
        :loading="chat.loadingConversation"
        :sending="chat.sending"
        :focus-search-key="conversationSearchKey"
        @send="sendMessage"
        @back="goBack"
        @toggle-details="detailsOpen = !detailsOpen"
      />
    </template>
    <template v-else>
      <conversation-list
        :conversations="chat.conversations"
        :active-conversation-id="chat.activeConversationId"
        :loading="chat.loadingList"
        :search="chat.search"
        @select="openConversation"
        @update:search="handleSearch"
      />
      <div class="q-mt-md">
        <empty-conversation-state :developers="developerSuggestions" @start="startConversation" />
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
import ChatProfilePanel from 'src/components/chat/ChatProfilePanel.vue'
import ConversationList from 'src/components/chat/ConversationList.vue'
import ConversationPane from 'src/components/chat/ConversationPane.vue'
import EmptyConversationState from 'src/components/chat/EmptyConversationState.vue'
import { useChatStore } from 'src/stores/chat-store'
import { useCommunityStore } from 'src/stores/community-store'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
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
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to load inbox' })
  }
}

async function openConversation(conversationId) {
  try {
    await chat.openConversation(conversationId)
    detailsOpen.value = false
    await router.push(`/m/messages/${conversationId}`)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to open conversation' })
  }
}

async function startConversation(recipientId) {
  try {
    const conversation = await chat.startConversation(recipientId)
    await openConversation(conversation.id)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to start conversation' })
  }
}

async function sendMessage(body) {
  try {
    await chat.sendMessage(body)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to send message' })
  }
}

function handleConversationAction(label) {
  $q.notify({ type: 'info', message: `${label} is ready for the next product step.` })
}

function focusConversationSearch() {
  detailsOpen.value = false
  conversationSearchKey.value += 1
}

function toggleMuteConversation() {
  mutedConversation.value = !mutedConversation.value
  $q.notify({
    type: 'info',
    message: mutedConversation.value ? 'Conversation muted' : 'Conversation unmuted',
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
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to load conversation' })
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
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to load inbox' })
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
