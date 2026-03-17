import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { clearEcho, getEcho } from 'boot/echo'
import { useSessionStore } from 'src/stores/session-store'

function sortMessagesAsc(messages) {
  return [...messages].sort((left, right) => new Date(left.sent_at) - new Date(right.sent_at))
}

function conversationActivityAt(conversation) {
  return conversation?.last_message_at || conversation?.updated_at || null
}

function sortConversationsByActivity(conversations) {
  return [...conversations].sort((left, right) => {
    const leftTime = conversationActivityAt(left)
    const rightTime = conversationActivityAt(right)

    if (!leftTime && !rightTime) {
      return (right?.id || 0) - (left?.id || 0)
    }

    if (!leftTime) {
      return 1
    }

    if (!rightTime) {
      return -1
    }

    return new Date(rightTime) - new Date(leftTime)
  })
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    conversationMessages: {},
    conversationMeta: {},
    activeConversationId: null,
    unreadCount: 0,
    loadingList: false,
    loadingConversation: false,
    sending: false,
    search: '',
    inboxChannelBound: false,
    activeChannelName: null,
    pollTimerId: null,
  }),

  getters: {
    activeConversation(state) {
      return state.conversations.find((item) => item.id === state.activeConversationId) || null
    },

    activeMessages(state) {
      return state.activeConversationId ? state.conversationMessages[state.activeConversationId] || [] : []
    },
  },

  actions: {
    async fetchUnreadCount() {
      const { data } = await api.get('/conversations/unread-count')
      this.unreadCount = data.unread_count || 0
      return data
    },

    async fetchConversations(search = this.search, options = {}) {
      if (!options.silent) {
        this.loadingList = true
      }

      try {
        const { data } = await api.get('/conversations', {
          params: search ? { q: search } : {},
        })

        this.search = search
        const existingById = new Map(this.conversations.map((conversation) => [conversation.id, conversation]))

        this.conversations = sortConversationsByActivity(
          data.map((conversation) => ({
            ...(existingById.get(conversation.id) || {}),
            ...conversation,
          })),
        )
        return data
      } finally {
        if (!options.silent) {
          this.loadingList = false
        }
      }
    },

    async startConversation(recipientId) {
      const { data } = await api.post('/conversations', { recipient_id: recipientId })
      this.upsertConversation(data)
      return data
    },

    async openConversation(conversationId, options = {}) {
      if (!options.silent) {
        this.loadingConversation = true
      }

      try {
        const { data } = await api.get(`/conversations/${conversationId}`)
        this.activeConversationId = conversationId
        this.upsertConversation(data.conversation)
        this.conversationMessages[conversationId] = sortMessagesAsc(data.messages || [])
        this.conversationMeta[conversationId] = data.meta || {}
        this.bindActiveConversationChannel()

        if (options.markRead !== false) {
          await this.markConversationRead(conversationId)
        }

        return data
      } finally {
        if (!options.silent) {
          this.loadingConversation = false
        }
      }
    },

    async sendMessage(body) {
      if (!this.activeConversationId || !body?.trim()) {
        return null
      }

      const session = useSessionStore()
      const conversationId = this.activeConversationId
      const tempId = `temp-${Date.now()}`
      const optimisticMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender: {
          id: session.user.id,
          name: session.user.name,
          username: session.user.username,
          avatar_url: session.user.avatar_url,
          headline: session.user.headline,
        },
        body: body.trim(),
        sent_at: new Date().toISOString(),
        is_mine: true,
        is_read: false,
        pending: true,
      }

      this.sending = true
      this.conversationMessages[conversationId] = [...(this.conversationMessages[conversationId] || []), optimisticMessage]

      try {
        const { data } = await api.post(`/conversations/${conversationId}/messages`, { body })
        this.replaceMessage(conversationId, tempId, data.message)
        this.upsertConversation(data.conversation)
        this.unreadCount = data.unread_total ?? this.unreadCount
        return data
      } catch (error) {
        this.removeMessage(conversationId, tempId)
        throw error
      } finally {
        this.sending = false
      }
    },

    async markConversationRead(conversationId = this.activeConversationId) {
      if (!conversationId) {
        return null
      }

      const conversation = this.conversations.find((item) => item.id === conversationId)

      if (!conversation?.unread_count) {
        return null
      }

      const { data } = await api.post(`/conversations/${conversationId}/read`)
      this.setConversationUnread(conversationId, data.unread_count || 0)
      this.unreadCount = data.unread_total ?? this.unreadCount
      return data
    },

    connectRealtime() {
      const session = useSessionStore()

      if (!session.token || !session.user || this.inboxChannelBound) {
        return
      }

      const echo = getEcho(session.token)

      if (!echo) {
        return
      }

      echo.private(`users.${session.user.id}.inbox`)
        .listen('.chat.message.sent', (payload) => this.handleRealtimeMessage(payload))
        .listen('.chat.conversation.read', (payload) => this.handleConversationRead(payload))

      this.inboxChannelBound = true
      this.bindActiveConversationChannel()
    },

    disconnectRealtime() {
      const session = useSessionStore()
      const echo = getEcho(session.token)

      if (echo && session.user) {
        echo.leaveChannel(`private-users.${session.user.id}.inbox`)
      }

      if (echo && this.activeChannelName) {
        echo.leaveChannel(this.activeChannelName)
      }

      this.activeChannelName = null
      this.inboxChannelBound = false
      clearEcho()
    },

    startPolling() {
      if (this.pollTimerId) {
        return
      }

      this.pollTimerId = window.setInterval(async () => {
        try {
          await this.fetchConversations(this.search, { silent: true })
          await this.fetchUnreadCount()

          if (this.activeConversationId) {
            await this.openConversation(this.activeConversationId, { silent: true, markRead: true })
          }
        } catch {
          // Silent polling fallback for local realtime failures.
        }
      }, 4000)
    },

    stopPolling() {
      if (!this.pollTimerId) {
        return
      }

      window.clearInterval(this.pollTimerId)
      this.pollTimerId = null
    },

    bindActiveConversationChannel() {
      const session = useSessionStore()
      const echo = getEcho(session.token)

      if (!echo) {
        return
      }

      if (this.activeChannelName) {
        echo.leaveChannel(this.activeChannelName)
        this.activeChannelName = null
      }

      if (!this.activeConversationId) {
        return
      }

      const channel = `private-conversations.${this.activeConversationId}`
      echo.private(`conversations.${this.activeConversationId}`)
        .listen('.chat.message.sent', (payload) => this.handleRealtimeMessage(payload))
        .listen('.chat.conversation.read', (payload) => this.handleConversationRead(payload))

      this.activeChannelName = channel
    },

    handleRealtimeMessage(payload) {
      const session = useSessionStore()
      const incoming = {
        ...payload.message,
        is_mine: payload.message.sender_id === session.user?.id,
        is_read: payload.message.sender_id !== session.user?.id,
      }

      const hasConversation = this.conversations.some((item) => item.id === payload.conversation_id)
      const existingMessages = this.conversationMessages[payload.conversation_id] || []
      const exists = existingMessages.some((item) => item.id === incoming.id)
      const isNewMessage = !exists

      if (isNewMessage) {
        this.conversationMessages[payload.conversation_id] = sortMessagesAsc([...existingMessages, incoming])
      }

      const current = this.conversations.find((item) => item.id === payload.conversation_id)
      const unreadCount = current?.unread_count || 0
      const nextUnread = isNewMessage && incoming.sender.id !== session.user?.id && this.activeConversationId !== payload.conversation_id
        ? unreadCount + 1
        : this.activeConversationId === payload.conversation_id
          ? 0
          : unreadCount

      this.upsertConversation({
        id: payload.conversation_id,
        type: 'direct',
        partner: current?.partner || payload.participants.find((item) => item.id !== session.user?.id) || null,
        participants: payload.participants,
        last_message: {
          ...incoming,
          is_read: incoming.sender.id === session.user?.id ? current?.last_message?.is_read ?? false : true,
        },
        last_message_at: payload.last_message_at,
        unread_count: nextUnread,
      })

      if (!hasConversation) {
        this.fetchConversations(this.search)
      }

      if (isNewMessage && incoming.sender.id !== session.user?.id && this.activeConversationId !== payload.conversation_id) {
        this.unreadCount += 1
      }

      if (isNewMessage && this.activeConversationId === payload.conversation_id && incoming.sender.id !== session.user?.id) {
        this.markConversationRead(payload.conversation_id)
      }
    },

    handleConversationRead(payload) {
      const session = useSessionStore()

      if (payload.read_by_user_id === session.user?.id) {
        this.setConversationUnread(payload.conversation_id, 0)
        return
      }

      const messages = this.conversationMessages[payload.conversation_id] || []
      this.conversationMessages[payload.conversation_id] = messages.map((message) => (
        message.is_mine && typeof payload.last_read_message_id === 'number' && message.id <= payload.last_read_message_id
          ? { ...message, is_read: true }
          : message
      ))

      const conversation = this.conversations.find((item) => item.id === payload.conversation_id)

      if (conversation?.last_message?.is_mine && typeof payload.last_read_message_id === 'number' && conversation.last_message.id <= payload.last_read_message_id) {
        conversation.last_message = {
          ...conversation.last_message,
          is_read: true,
        }
      }
    },

    upsertConversation(conversation) {
      const existingIndex = this.conversations.findIndex((item) => item.id === conversation.id)
      const previous = existingIndex >= 0 ? this.conversations[existingIndex] : null
      const nextConversation = {
        ...previous,
        ...conversation,
      }

      if (existingIndex >= 0) {
        this.conversations.splice(existingIndex, 1)
      }

      this.conversations = sortConversationsByActivity([...this.conversations, nextConversation])
    },

    setConversationUnread(conversationId, unreadCount) {
      const conversation = this.conversations.find((item) => item.id === conversationId)

      if (conversation) {
        conversation.unread_count = unreadCount
      }
    },

    replaceMessage(conversationId, tempId, message) {
      this.conversationMessages[conversationId] = (this.conversationMessages[conversationId] || []).map((item) => (
        item.id === tempId ? message : item
      ))
    },

    removeMessage(conversationId, tempId) {
      this.conversationMessages[conversationId] = (this.conversationMessages[conversationId] || []).filter((item) => item.id !== tempId)
    },

    reset() {
      this.conversations = []
      this.conversationMessages = {}
      this.conversationMeta = {}
      this.activeConversationId = null
      this.unreadCount = 0
      this.search = ''
      this.stopPolling()
      this.disconnectRealtime()
    },
  },
})
