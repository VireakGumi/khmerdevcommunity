import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useSessionStore = defineStore('session', {
  state: () => ({
    token: null,
    user: null,
    hydrated: false,
    loadingUser: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
  },

  actions: {
    hydrate() {
      if (this.hydrated === true) {
        return
      }

      this.token = localStorage.getItem('kdc_token')
      const rawUser = localStorage.getItem('kdc_user')
      this.user = rawUser ? JSON.parse(rawUser) : null

      if (this.token) {
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      }

      this.hydrated = true
    },

    persistToken(token) {
      this.token = token
      localStorage.setItem('kdc_token', token)
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    },

    persistSession(token, user) {
      this.persistToken(token)
      this.user = user

      localStorage.setItem('kdc_user', JSON.stringify(user))
    },

    getSocialAuthUrl(provider, redirect = '/feed') {
      const authBaseUrl = process.env.AUTH_BASE_URL || process.env.API_BASE_URL?.replace(/\/api$/, '')
      const target = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/feed'
      const params = new URLSearchParams({ redirect: target })

      return `${authBaseUrl}/oauth/${provider}/redirect?${params.toString()}`
    },

    async completeSocialLogin(params) {
      const token = params.token

      if (!token) {
        throw new Error(params.error || 'Social login did not return a token.')
      }

      this.persistToken(token)
      localStorage.removeItem('kdc_user')
      await this.fetchMe()

      return params.redirect && params.redirect.startsWith('/') ? params.redirect : '/feed'
    },

    async login(payload) {
      const { data } = await api.post('/login', payload)
      this.persistSession(data.token, data.user)
      return data
    },

    async register(payload) {
      const { data } = await api.post('/register', payload)
      this.persistSession(data.token, data.user)
      return data
    },

    async fetchMe() {
      if (!this.token) {
        return null
      }

      this.loadingUser = true

      try {
        const { data } = await api.get('/me')
        this.user = data
        localStorage.setItem('kdc_user', JSON.stringify(data))
        return data
      } catch {
        this.clearSession()
        return null
      } finally {
        this.loadingUser = false
      }
    },

    async updateProfile(payload) {
      const { data } = await api.put('/me/profile', payload)
      this.user = data
      localStorage.setItem('kdc_user', JSON.stringify(data))
      return data
    },

    async updateAvatar(file) {
      const formData = new FormData()
      formData.append('avatar', file)

      const { data } = await api.post('/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      this.user = data
      localStorage.setItem('kdc_user', JSON.stringify(data))
      return data
    },

    async fetchSettings() {
      const { data } = await api.get('/me/settings')
      return data
    },

    async updateSettings(payload) {
      const { data } = await api.put('/me/settings', payload)
      this.user = data
      localStorage.setItem('kdc_user', JSON.stringify(data))
      return data
    },

    async logout() {
      try {
        if (this.token) {
          await api.post('/logout')
        }
      } finally {
        this.clearSession()
      }
    },

    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem('kdc_token')
      localStorage.removeItem('kdc_user')
      delete api.defaults.headers.common.Authorization
    },
  },
})
