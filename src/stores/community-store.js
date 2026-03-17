import { defineStore } from 'pinia'
import { api } from 'boot/axios'

function extractCollection(data) {
  return Array.isArray(data) ? data : (data?.data || [])
}

function createPaginatedListState(params = {}) {
  return {
    items: [],
    loading: false,
    hasMore: false,
    currentPage: 1,
    lastPage: 1,
    perPage: 12,
    total: 0,
    params,
    error: null,
    requestId: 0,
    pendingKey: null,
    pendingPromise: null,
  }
}

function createPaginatedListSnapshot(list) {
  return {
    items: list.items,
    loading: list.loading,
    hasMore: list.hasMore,
    currentPage: list.currentPage,
    lastPage: list.lastPage,
    perPage: list.perPage,
    total: list.total,
    params: list.params,
  }
}

function buildListRequestKey(endpoint, params) {
  return `${endpoint}:${JSON.stringify(params)}`
}

function buildFormData(payload = {}) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(`${key}[]`, item)
      })
      return
    }

    formData.append(key, value)
  })

  return formData
}

export const useCommunityStore = defineStore('community', {
  state: () => ({
    home: null,
    feedList: createPaginatedListState({ tab: 'for-you' }),
    projects: [],
    events: [],
    jobsList: createPaginatedListState({}),
    myJobs: [],
    appliedJobs: [],
    developers: [],
    publicProfile: null,
    notifications: [],
    messages: [],
    searchQuery: '',
    searchLists: {
      posts: createPaginatedListState({}),
      developers: createPaginatedListState({}),
      projects: createPaginatedListState({}),
      events: createPaginatedListState({}),
      jobs: createPaginatedListState({}),
    },
    searchResults: {
      query: '',
      posts: [],
      developers: [],
      projects: [],
      events: [],
      jobs: [],
    },
    saved: {
      posts: [],
      projects: [],
      events: [],
      jobs: [],
    },
  }),

  getters: {
    feed: (state) => state.feedList.items,
    feedLoading: (state) => state.feedList.loading,
    feedPagination: (state) => ({
      page: state.feedList.currentPage,
      lastPage: state.feedList.lastPage,
      perPage: state.feedList.perPage,
      total: state.feedList.total,
      hasMore: state.feedList.hasMore,
      tab: state.feedList.params.tab || 'for-you',
    }),
    jobs: (state) => state.jobsList.items,
    jobsLoading: (state) => state.jobsList.loading,
    jobsPagination: (state) => ({
      page: state.jobsList.currentPage,
      lastPage: state.jobsList.lastPage,
      perPage: state.jobsList.perPage,
      total: state.jobsList.total,
      hasMore: state.jobsList.hasMore,
      filters: state.jobsList.params || {},
    }),
  },

  actions: {
    resetList(stateKey, params = {}) {
      const current = this[stateKey]
      const next = createPaginatedListState(params)

      Object.assign(current, next)
      return createPaginatedListSnapshot(current)
    },

    async fetchPaginatedList(stateKey, endpoint, options = {}) {
      const list = this[stateKey]
      const {
        page = 1,
        append = false,
        params = {},
        transform = extractCollection,
      } = options

      const mergedParams = {
        ...(append ? list.params : {}),
        ...params,
        page,
      }
      const requestKey = buildListRequestKey(endpoint, mergedParams)

      if (list.loading && list.pendingKey === requestKey && list.pendingPromise) {
        return list.pendingPromise
      }

      const requestId = list.requestId + 1
      list.requestId = requestId
      list.loading = true
      list.error = null
      list.pendingKey = requestKey

      const pendingPromise = api
        .get(endpoint, { params: mergedParams })
        .then(({ data }) => {
          if (requestId !== list.requestId) {
            return createPaginatedListSnapshot(list)
          }

          const items = transform(data)

          list.items = append ? [...list.items, ...items] : items
          list.currentPage = data.current_page || page
          list.lastPage = data.last_page || list.currentPage
          list.perPage = data.per_page || items.length || list.perPage
          list.total = data.total || list.items.length
          list.hasMore = Boolean(data.next_page_url)
          list.params = { ...params }

          return createPaginatedListSnapshot(list)
        })
        .catch((error) => {
          if (requestId === list.requestId) {
            list.error = error
          }

          throw error
        })
        .finally(() => {
          if (requestId === list.requestId) {
            list.loading = false
            list.pendingKey = null
            list.pendingPromise = null
          }
        })

      list.pendingPromise = pendingPromise
      return pendingPromise
    },

    async fetchNextPage(stateKey, endpoint, options = {}) {
      const list = this[stateKey]

      if (!list.hasMore || list.loading) {
        return createPaginatedListSnapshot(list)
      }

      return this.fetchPaginatedList(stateKey, endpoint, {
        ...options,
        page: list.currentPage + 1,
        append: true,
        params: list.params,
      })
    },

    async fetchHome() {
      const { data } = await api.get('/home')
      this.home = data
      return data
    },

    async fetchFeed(options = 'for-you') {
      const normalized = typeof options === 'string' ? { tab: options } : options
      const {
        tab = this.feedPagination.tab || 'for-you',
        page = 1,
        append = false,
      } = normalized

      return this.fetchPaginatedList('feedList', '/feed', {
        page,
        append,
        params: { tab },
      })
    },

    async fetchNextFeedPage() {
      return this.fetchNextPage('feedList', '/feed', {
        params: { tab: this.feedPagination.tab },
      })
    },

    async createPost(payload) {
      const requestPayload = payload.images?.length ? buildFormData(payload) : payload
      const config = payload.images?.length ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
      const { data } = await api.post('/feed', requestPayload, config)
      this.feedList.items.unshift(data)
      this.feedList.total += 1
      return data
    },

    async updatePost(postId, payload) {
      const requestPayload = payload.images?.length ? buildFormData({ ...payload, _method: 'PUT' }) : payload
      const config = payload.images?.length ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
      const { data } = await api.post(`/feed/${postId}`, requestPayload, config)
      const index = this.feedList.items.findIndex((item) => item.id === postId)

      if (index >= 0) {
        this.feedList.items.splice(index, 1, data)
      }

      return data
    },

    async likePost(postId) {
      const { data } = await api.post(`/feed/${postId}/like`)
      const post = this.feedList.items.find((item) => item.id === postId)
      const publicPost = this.publicProfile?.posts?.find((item) => item.id === postId)

      if (post) {
        post.is_liked = data.liked
        post.likes_count = data.likes_count
      }

      if (publicPost) {
        publicPost.is_liked = data.liked
        publicPost.likes_count = data.likes_count
      }

      return data
    },

    async commentOnPost(postId, body, parentId = null) {
      const { data } = await api.post(`/feed/${postId}/comments`, { body, parent_id: parentId })
      const post = this.feedList.items.find((item) => item.id === postId)
      const publicPost = this.publicProfile?.posts?.find((item) => item.id === postId)

      if (post) {
        post.comments = [data, ...(post.comments || [])]
        post.comments_count += 1
      }

      if (publicPost) {
        publicPost.comments = [data, ...(publicPost.comments || [])]
        publicPost.comments_count += 1
      }

      return data
    },

    async fetchProjects() {
      const { data } = await api.get('/projects')
      this.projects = extractCollection(data)
      return this.projects
    },

    async createProject(payload) {
      const { data } = await api.post('/projects', payload)
      this.projects.unshift(data)
      return data
    },

    async fetchEvents(params = {}) {
      const { data } = await api.get('/events', { params })
      this.events = extractCollection(data)
      return this.events
    },

    async createEvent(payload) {
      const requestPayload = payload.thumbnail ? buildFormData(payload) : payload
      const config = payload.thumbnail ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
      const { data } = await api.post('/events', requestPayload, config)
      this.events.unshift(data)
      return data
    },

    async respondToEvent(eventId, status) {
      const { data } = await api.post(`/events/${eventId}/respond`, { status })
      const event = this.events.find((item) => item.id === eventId)

      if (event) {
        event.response_status = data.status
        event.interested_count = data.interested_count
        event.attendee_count = data.attendee_count
      }

      return data
    },

    async toggleEventBookmark(eventId) {
      const { data } = await api.post(`/events/${eventId}/bookmark`)
      const event = this.events.find((item) => item.id === eventId)

      if (event) {
        event.is_saved = data.saved
      }

      return data
    },

    async fetchJobs(options = {}) {
      const {
        page = 1,
        append = false,
        ...params
      } = options

      return this.fetchPaginatedList('jobsList', '/jobs', {
        page,
        append,
        params,
      })
    },

    async fetchNextJobsPage() {
      return this.fetchNextPage('jobsList', '/jobs', {
        params: this.jobsPagination.filters,
      })
    },

    async fetchJob(slug) {
      const { data } = await api.get(`/jobs/${slug}`)
      return data
    },

    async fetchMyJobs() {
      const { data } = await api.get('/me/jobs')
      this.myJobs = data
      return data
    },

    async fetchAppliedJobs() {
      const { data } = await api.get('/me/job-applications')
      this.appliedJobs = data
      return data
    },

    async fetchJobApplicants(jobId) {
      const { data } = await api.get(`/jobs/${jobId}/applicants`)
      return data
    },

    async createJob(payload) {
      const { data } = await api.post('/jobs', payload)
      this.jobsList.items.unshift(data)
      this.jobsList.total += 1
      return data
    },

    async applyToJob(jobId, payload = {}) {
      const { data } = await api.post(`/jobs/${jobId}/apply`, payload)
      const job = this.jobsList.items.find((item) => item.id === jobId)

      if (job) {
        job.is_applied = true
        job.applications_count = (job.applications_count || 0) + 1
      }

      return data
    },

    async toggleJobBookmark(jobId) {
      const { data } = await api.post(`/jobs/${jobId}/bookmark`)
      const job = this.jobsList.items.find((item) => item.id === jobId)

      if (job) {
        job.is_saved = data.saved
      }

      return data
    },

    async fetchDevelopers() {
      const { data } = await api.get('/developers')
      this.developers = data
      return data
    },

    async toggleFollow(userId) {
      const developer = this.developers.find((item) => item.id === userId)
      const isFollowing = Boolean(developer?.is_following)
      const method = isFollowing ? 'delete' : 'post'
      const { data } = await api[method](`/users/${userId}/follow`)

      if (developer) {
        developer.is_following = data.following
        developer.followers_count = data.followers_count
      }

      if (this.publicProfile?.id === userId) {
        this.publicProfile.is_following = data.following
        this.publicProfile.followers_count = data.followers_count
      }

      return data
    },

    async fetchPublicProfile(username) {
      const { data } = await api.get(`/developers/${username}`)
      this.publicProfile = data
      return data
    },

    async fetchNotifications() {
      const { data } = await api.get('/notifications')
      this.notifications = data
      return data
    },

    async fetchMessages() {
      const { data } = await api.get('/messages')
      this.messages = data
      return data
    },

    async search(query) {
      const { data } = await api.get('/search', { params: { q: query } })
      this.searchQuery = data.query || query
      this.searchLists.posts.items = data.posts || []
      this.searchLists.posts.loading = false
      this.searchLists.posts.hasMore = false
      this.searchLists.posts.currentPage = 1
      this.searchLists.posts.total = (data.posts || []).length
      this.searchLists.posts.params = { q: query }
      this.searchLists.developers.items = data.developers || []
      this.searchLists.developers.loading = false
      this.searchLists.developers.hasMore = false
      this.searchLists.developers.currentPage = 1
      this.searchLists.developers.total = (data.developers || []).length
      this.searchLists.developers.params = { q: query }
      this.searchLists.projects.items = data.projects || []
      this.searchLists.projects.loading = false
      this.searchLists.projects.hasMore = false
      this.searchLists.projects.currentPage = 1
      this.searchLists.projects.total = (data.projects || []).length
      this.searchLists.projects.params = { q: query }
      this.searchLists.events.items = data.events || []
      this.searchLists.events.loading = false
      this.searchLists.events.hasMore = false
      this.searchLists.events.currentPage = 1
      this.searchLists.events.total = (data.events || []).length
      this.searchLists.events.params = { q: query }
      this.searchLists.jobs.items = data.jobs || []
      this.searchLists.jobs.loading = false
      this.searchLists.jobs.hasMore = false
      this.searchLists.jobs.currentPage = 1
      this.searchLists.jobs.total = (data.jobs || []).length
      this.searchLists.jobs.params = { q: query }
      this.searchResults = data
      return data
    },

    async fetchSaved() {
      const { data } = await api.get('/me/bookmarks')
      this.saved = {
        posts: data.posts || [],
        projects: data.projects || [],
        events: data.events || [],
        jobs: data.jobs || [],
      }
      return this.saved
    },

    async togglePostBookmark(postId) {
      const { data } = await api.post(`/feed/${postId}/bookmark`)
      const post = this.feed.find((item) => item.id === postId)
      const publicPost = this.publicProfile?.posts?.find((item) => item.id === postId)

      if (post) {
        post.is_saved = data.saved
      }

      if (publicPost) {
        publicPost.is_saved = data.saved
      }

      return data
    },

    async toggleProjectBookmark(projectId) {
      const { data } = await api.post(`/projects/${projectId}/bookmark`)
      const project = this.projects.find((item) => item.id === projectId)
      const publicProject = this.publicProfile?.projects?.find((item) => item.id === projectId)

      if (project) {
        project.is_saved = data.saved
      }

      if (publicProject) {
        publicProject.is_saved = data.saved
      }

      return data
    },

    async sendMessage(payload) {
      const { data } = await api.post('/messages', payload)
      this.messages.unshift(data)
      return data
    },
  },
})
