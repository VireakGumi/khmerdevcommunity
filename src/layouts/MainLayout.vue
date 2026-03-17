<template>
  <q-layout view="hHh lpR fFf" class="app-shell">
    <q-drawer
      v-if="showSidebarDrawer"
      v-model="sidebarOpen"
      side="left"
      overlay
      behavior="mobile"
      bordered
      class="glass-panel shell-drawer"
    >
      <div class="shell-drawer__inner">
        <div class="shell-sidebar-scroll">
          <SidebarContent
            :links="desktopLinks"
            :is-dark="$q.dark.isActive"
            @navigate="sidebarOpen = false"
            @toggle-theme="toggleTheme"
          />
        </div>
      </div>
    </q-drawer>

    <template v-if="route.meta.mobileShell">
      <div class="mobile-frame">
        <div class="glass-panel mobile-device">
          <div class="row items-center justify-between q-px-lg q-py-md" style="border-bottom: 1px solid var(--kdc-border)">
            <div>
              <div class="section-label">Mobile</div>
              <div class="text-h6 text-weight-bold">{{ route.meta.title || route.name }}</div>
            </div>
            <q-btn flat round dense color="grey-5" icon="north_east" @click="router.push('/feed')" />
          </div>

          <q-page-container>
            <router-view />
          </q-page-container>

          <div class="absolute-bottom q-pa-sm mobile-nav">
            <div class="row items-center justify-around text-caption">
              <div v-for="item in mobileLinks" :key="item.to" class="mobile-nav-item-wrap">
                <q-btn
                  flat
                  no-caps
                  stack
                  :label="item.label"
                  :icon="item.icon"
                  :to="item.to"
                  :color="isActive(item.to) ? 'primary' : 'grey-5'"
                />
                <q-badge v-if="item.badge" color="primary" rounded floating>{{ item.badge }}</q-badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="route.meta.hideChrome">
      <q-page-container>
        <div class="desktop-shell" style="grid-template-columns: minmax(0, 1fr)">
          <div class="glass-panel panel-card q-pa-xl">
            <div class="row items-center justify-between q-mb-xl">
              <div>
                <div class="section-label">Khmer Dev Community</div>
                <div class="text-h4 text-weight-bold q-mt-sm">Auth Gateway</div>
              </div>
              <q-btn flat no-caps color="primary" icon="arrow_back" label="Back home" to="/" />
            </div>
            <router-view />
          </div>
        </div>
      </q-page-container>
    </template>

    <template v-else-if="route.meta.standaloneShell">
      <q-page-container>
        <div class="standalone-shell">
          <router-view />
        </div>
      </q-page-container>
    </template>

    <template v-else>
      <q-page-container>
        <div class="desktop-shell" :class="{ 'desktop-shell--chat-focused': route.meta.chatFocused }">
          <aside v-if="!route.meta.chatFocused" class="glass-panel shell-panel gt-md">
            <div class="shell-sidebar-scroll">
              <SidebarContent
                :links="desktopLinks"
                :is-dark="$q.dark.isActive"
                @toggle-theme="toggleTheme"
              />
            </div>
          </aside>

          <div class="shell-content">
            <div class="glass-panel topbar-panel row items-center justify-between q-pa-md">
              <div class="topbar-heading">
                <div v-if="showSidebarDrawer" class="row items-center q-gutter-sm q-mb-sm">
                  <q-btn flat round dense class="app-icon-btn" icon="menu" @click="sidebarOpen = true" />
                  <div class="section-label">Navigate</div>
                </div>
                <div class="section-label">Khmer Dev Community</div>
                <div class="text-h5 text-weight-bold q-mt-xs">{{ route.meta.title || 'Build with the community' }}</div>
              </div>
              <div class="row items-center q-gutter-sm topbar-actions">
                <template v-if="session.isAuthenticated">
                  <div class="topbar-utility gt-sm">Write | Build | Connect</div>
                  <q-input
                    dense
                    outlined
                    class="input-surface nav-search"
                    v-model="searchText"
                    placeholder="Search posts, builders, projects, jobs"
                    @keyup.enter="submitSearch"
                  >
                    <template #prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                  <q-btn flat round class="app-icon-btn" icon="add" @click="router.push('/post')" />
                  <q-btn flat round class="app-icon-btn" icon="notifications" @click="router.push('/notifications')" />
                  <q-btn flat round class="app-icon-btn" icon="mail" @click="router.push('/messages')">
                    <q-badge v-if="chat.unreadCount" color="primary" rounded floating>{{ chat.unreadCount }}</q-badge>
                  </q-btn>
                  <q-btn flat round class="theme-toggle" :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleTheme" />
                  <q-btn flat no-caps class="profile-trigger">
                    <q-avatar size="34px" color="primary" text-color="white">
                      <img v-if="session.user?.avatar_url" :src="session.user.avatar_url" :alt="session.user?.name || 'Profile photo'" />
                      <span v-else>{{ session.user?.name?.charAt(0) }}</span>
                    </q-avatar>
                    <div class="profile-meta">
                      <strong>{{ session.user?.name }}</strong>
                      <span>@{{ session.user?.username }}</span>
                    </div>
                    <q-icon name="expand_more" />
                    <q-menu class="glass-panel panel-card" anchor="bottom right" self="top right">
                      <q-list style="min-width: 220px">
                        <q-item clickable to="/portfolio" v-close-popup>
                          <q-item-section avatar><q-icon name="account_box" /></q-item-section>
                          <q-item-section>My portfolio</q-item-section>
                        </q-item>
                        <q-item clickable to="/developers" v-close-popup>
                          <q-item-section avatar><q-icon name="groups" /></q-item-section>
                          <q-item-section>Developer profiles</q-item-section>
                        </q-item>
                        <q-item clickable to="/notifications" v-close-popup>
                          <q-item-section avatar><q-icon name="notifications" /></q-item-section>
                          <q-item-section>Notifications</q-item-section>
                        </q-item>
                        <q-item clickable to="/saved" v-close-popup>
                          <q-item-section avatar><q-icon name="bookmark" /></q-item-section>
                          <q-item-section>Saved</q-item-section>
                        </q-item>
                        <q-item clickable to="/messages" v-close-popup>
                          <q-item-section avatar><q-icon name="mail" /></q-item-section>
                          <q-item-section>Messages</q-item-section>
                        </q-item>
                        <q-item clickable to="/settings" v-close-popup>
                          <q-item-section avatar><q-icon name="settings" /></q-item-section>
                          <q-item-section>Settings</q-item-section>
                        </q-item>
                        <q-item clickable to="/m" v-close-popup>
                          <q-item-section avatar><q-icon name="phone_iphone" /></q-item-section>
                          <q-item-section>Mobile app</q-item-section>
                        </q-item>
                        <q-separator class="theme-separator" />
                        <q-item clickable v-close-popup @click="handleLogout">
                          <q-item-section avatar><q-icon name="logout" /></q-item-section>
                          <q-item-section>Logout</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </template>
                <template v-else>
                  <q-btn flat round class="theme-toggle" :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleTheme" />
                  <q-btn flat no-caps class="ghost-btn" color="secondary" icon="phone_iphone" label="Mobile" to="/m" />
                  <q-btn flat no-caps class="ghost-btn" color="secondary" label="Login" to="/login" />
                  <q-btn color="primary" no-caps label="Register" to="/register" />
                </template>
              </div>
            </div>

            <router-view />
          </div>
        </div>
      </q-page-container>
    </template>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import SidebarContent from 'src/components/app-shell/SidebarContent.vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from 'src/stores/chat-store'
import { useSessionStore } from 'src/stores/session-store'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const chat = useChatStore()
const searchText = ref(route.query.q || '')
const sidebarOpen = ref(false)

const desktopLinks = computed(() => [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/feed', label: 'Feed', icon: 'dynamic_feed' },
  { to: '/jobs', label: 'Jobs', icon: 'work' },
  { to: '/projects', label: 'Projects', icon: 'terminal' },
  { to: '/events', label: 'Events', icon: 'event' },
  { to: '/developers', label: 'Builders', icon: 'groups' },
  { to: '/search', label: 'Search', icon: 'search' },
  ...(session.isAuthenticated ? [{ to: '/saved', label: 'Saved', icon: 'bookmark' }] : []),
  ...(session.isAuthenticated ? [{ to: '/portfolio', label: 'Portfolio', icon: 'account_box' }] : []),
])

const mobileLinks = computed(() => [
  { to: '/m/feed', label: 'Feed', icon: 'rss_feed' },
  { to: '/m/post', label: 'Post', icon: 'edit_square' },
  { to: '/m/notifications', label: 'Alerts', icon: 'notifications' },
  { to: '/m/profile', label: 'Profile', icon: 'person' },
  { to: '/m/messages', label: 'Inbox', icon: 'mail', badge: chat.unreadCount || null },
])

const showSidebarDrawer = computed(() => !route.meta.chatFocused && $q.screen.lt.lg)

function isActive(target) {
  return route.path === target
}

function toggleTheme() {
  const next = !$q.dark.isActive
  $q.dark.set(next)
  localStorage.setItem('kdc_theme_dark', next ? '1' : '0')
}

async function submitSearch() {
  await router.push({ path: '/search', query: { q: searchText.value } })
}

async function handleLogout() {
  await session.logout()
  chat.reset()
  await router.push('/')
}

onMounted(() => {
  const stored = localStorage.getItem('kdc_theme_dark')

  if (stored === null) {
    $q.dark.set(false)
    localStorage.setItem('kdc_theme_dark', '0')
    return
  }

  $q.dark.set(stored === '1')

  if (session.isAuthenticated) {
    chat.fetchUnreadCount().catch(() => {})
    chat.connectRealtime()
  }
})

watch(
  () => session.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      chat.fetchUnreadCount().catch(() => {})
      chat.connectRealtime()
      return
    }

    chat.reset()
  },
)

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  },
)
</script>
