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
          <div v-if="showMobileAppTopbar" class="glass-panel topbar-panel topbar-panel--app-mobile q-px-md q-py-sm">
            <div class="topbar-mobile-bar">
              <q-btn
                v-if="showMobileAppMenu"
                flat
                round
                dense
                class="app-icon-btn"
                icon="menu"
                @click="sidebarOpen = true"
              />
              <q-btn
                v-else
                flat
                round
                dense
                class="app-icon-btn"
                icon="arrow_back"
                @click="router.push(mobileBackTarget)"
              />

              <div class="topbar-mobile-brand">
                <img src="/img/logo.png" alt="khmerdevcommunity" class="topbar-mobile-brand__logo" />
              </div>

              <q-btn
                v-if="session.isAuthenticated"
                flat
                round
                dense
                class="app-icon-btn"
                icon="person"
              >
                <q-menu class="glass-panel panel-card" anchor="bottom right" self="top right">
                  <q-list style="min-width: 220px">
                    <q-item clickable to="/m/profile" v-close-popup>
                      <q-item-section avatar><q-icon name="person" /></q-item-section>
                      <q-item-section>Profile</q-item-section>
                    </q-item>
                    <q-item clickable to="/m/portfolio" v-close-popup>
                      <q-item-section avatar><q-icon name="account_box" /></q-item-section>
                      <q-item-section>Portfolio</q-item-section>
                    </q-item>
                    <q-item clickable to="/m/settings" v-close-popup>
                      <q-item-section avatar><q-icon name="settings" /></q-item-section>
                      <q-item-section>Settings</q-item-section>
                    </q-item>
                    <q-separator class="theme-separator" />
                    <q-item clickable v-close-popup @click="handleLogout">
                      <q-item-section avatar><q-icon name="logout" /></q-item-section>
                      <q-item-section>Logout</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-btn
                v-else
                flat
                round
                dense
                class="theme-toggle"
                :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
                @click="toggleTheme"
              />
            </div>

            <div class="topbar-mobile-title">
              {{ route.name === 'mobile-home' ? 'Home' : route.meta.title || route.name }}
            </div>

            <div class="topbar-mobile-search">
              <q-input
                dense
                outlined
                class="input-surface nav-search nav-search--mobile"
                v-model="searchText"
                placeholder="Search posts, builders, projects, jobs"
                @keyup.enter="submitSearch"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="mobile-device__body">
            <q-page-container class="mobile-page-container" :class="{ 'mobile-page-container--no-bottom-nav': !showMobileAppBottomNav }">
              <router-view />
            </q-page-container>
          </div>
        </div>

        <div v-if="showMobileAppBottomNav" class="mobile-nav q-pa-sm">
          <q-btn
            unelevated
            round
            size="16px"
            color="primary"
            icon="edit"
            class="mobile-fab"
            @click="router.push('/m/post')"
          />
          <div class="row items-center justify-around text-caption mobile-nav__row">
            <div v-for="item in mobileAppPrimaryLinks" :key="item.to" class="mobile-nav-item-wrap">
              <q-btn
                flat
                no-caps
                stack
                class="mobile-nav-btn"
                :label="item.label"
                :icon="item.icon"
                :to="item.to"
                :color="isActive(item.to) ? 'primary' : 'grey-5'"
              />
              <q-badge v-if="item.badge" color="primary" rounded floating>{{ item.badge }}</q-badge>
            </div>
            <div class="mobile-nav-spacer" aria-hidden="true"></div>
            <div v-for="item in mobileAppSecondaryLinks" :key="item.to" class="mobile-nav-item-wrap">
              <q-btn
                flat
                no-caps
                stack
                class="mobile-nav-btn"
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
        <div
          class="desktop-shell"
          :class="{
            'desktop-shell--chat-focused': route.meta.chatFocused,
            'desktop-shell--drawer-mode': showSidebarDrawer,
          }"
        >
            <aside v-if="!route.meta.chatFocused && !showSidebarDrawer" class="glass-panel shell-panel">
            <div class="shell-sidebar-scroll">
              <SidebarContent
                :links="desktopLinks"
                :is-dark="$q.dark.isActive"
                @toggle-theme="toggleTheme"
              />
            </div>
          </aside>

          <div class="shell-content" :class="{ 'shell-content--mobile-bottom-nav': showCompactWebHeader }">
            <div class="glass-panel topbar-panel q-px-md q-py-sm">
              <template v-if="showCompactWebHeader">
                <div class="topbar-mobile-bar kdc-shell-mobile-bar">
                  <q-btn flat round dense class="app-icon-btn" icon="menu" @click="sidebarOpen = true" />
                  <div class="topbar-mobile-brand">
                    <img src="/img/logo.png" alt="khmerdevcommunity" class="topbar-mobile-brand__logo" />
                  </div>
                  <q-btn
                    v-if="session.isAuthenticated"
                    flat
                    round
                    dense
                    class="app-icon-btn"
                    icon="person"
                  >
                    <q-menu class="glass-panel panel-card" anchor="bottom right" self="top right">
                      <q-list style="min-width: 220px">
                        <q-item clickable to="/portfolio" v-close-popup>
                          <q-item-section avatar><q-icon name="account_box" /></q-item-section>
                          <q-item-section>My portfolio</q-item-section>
                        </q-item>
                        <q-item clickable to="/settings" v-close-popup>
                          <q-item-section avatar><q-icon name="settings" /></q-item-section>
                          <q-item-section>Settings</q-item-section>
                        </q-item>
                        <q-separator class="theme-separator" />
                        <q-item clickable v-close-popup @click="handleLogout">
                          <q-item-section avatar><q-icon name="logout" /></q-item-section>
                          <q-item-section>Logout</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                  <q-btn
                    v-else
                    flat
                    round
                    dense
                    class="theme-toggle"
                    :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
                    @click="toggleTheme"
                  />
                </div>
                <div class="topbar-mobile-title kdc-shell-mobile-title">{{ route.meta.title || 'Build with the community' }}</div>
                <div class="topbar-mobile-search kdc-shell-mobile-search">
                  <q-input
                    dense
                    outlined
                    class="input-surface nav-search nav-search--mobile"
                    v-model="searchText"
                    placeholder="Search posts, builders, projects, jobs"
                    @keyup.enter="submitSearch"
                  >
                    <template #prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
              </template>

              <template v-else>
                <div class="topbar-main">
                  <div class="topbar-heading">
                    <div v-if="showSidebarDrawer" class="row items-center q-gutter-sm q-mb-sm">
                      <q-btn flat round dense class="app-icon-btn" icon="menu" @click="sidebarOpen = true" />
                      <div class="section-label">Navigate</div>
                    </div>
                    <div class="topbar-brand">
                      <img src="/img/logo.png" alt="khmerdevcommunity" class="topbar-brand__logo" />
                      <div class="section-label">Khmer Dev Community</div>
                    </div>
                    <div class="text-h5 text-weight-bold q-mt-xs">{{ route.meta.title || 'Build with the community' }}</div>
                  </div>

                  <div class="row items-center q-gutter-sm topbar-actions">
                    <template v-if="session.isAuthenticated">
                      <div class="topbar-utility">Write | Build | Connect</div>
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
              </template>
            </div>

            <router-view />

            <div v-if="showCompactWebHeader" class="glass-panel web-mobile-bottom-nav kdc-shell-bottom-nav">
              <q-btn
                v-for="item in mobileWebLinks"
                :key="item.to"
                flat
                no-caps
                stack
                class="web-mobile-bottom-nav__btn"
                :label="item.label"
                :icon="item.icon"
                :to="item.to"
                :color="isActive(item.to) ? 'primary' : 'grey-5'"
              >
                <q-badge v-if="item.badge" color="primary" rounded floating>{{ item.badge }}</q-badge>
              </q-btn>
            </div>
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
import { initializePushNotifications, unregisterPushNotifications } from 'src/services/push-notifications'

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
  ...(session.isAdmin ? [{ to: '/admin/donations', label: 'Admin', icon: 'shield' }] : []),
  ...(session.isAdmin ? [{ to: '/admin/reports', label: 'Reports', icon: 'flag' }] : []),
])

const mobileAppPrimaryLinks = computed(() => [
  { to: '/m', label: 'Home', icon: 'home' },
  { to: '/m/feed', label: 'Feed', icon: 'rss_feed' },
])

const mobileAppSecondaryLinks = computed(() => [
  { to: '/m/messages', label: 'Inbox', icon: 'mail', badge: chat.unreadCount || null },
  { to: '/m/profile', label: 'Profile', icon: 'person' },
])

const mobileWebLinks = computed(() =>
  session.isAuthenticated
    ? [
        { to: '/', label: 'Home', icon: 'home' },
        { to: '/feed', label: 'Feed', icon: 'dynamic_feed' },
        { to: '/search', label: 'Search', icon: 'search' },
        { to: '/messages', label: 'Inbox', icon: 'mail', badge: chat.unreadCount || null },
        { to: '/portfolio', label: 'Profile', icon: 'person' },
      ]
    : [
        { to: '/', label: 'Home', icon: 'home' },
        { to: '/feed', label: 'Feed', icon: 'dynamic_feed' },
        { to: '/search', label: 'Search', icon: 'search' },
        { to: '/login', label: 'Login', icon: 'login' },
        { to: '/register', label: 'Join', icon: 'person_add' },
      ],
)

const showCompactWebHeader = computed(() => $q.screen.lt.md)

const showMobileAppMenu = computed(() => [
  'mobile-home',
  'mobile-feed',
  'mobile-search',
  'mobile-messages',
  'mobile-profile',
].includes(route.name))

const showMobileAppBottomNav = computed(() => true)

const showMobileAppTopbar = computed(() => ![
  'mobile-messages',
  'mobile-message-thread',
].includes(route.name))

const showSidebarDrawer = computed(() => !route.meta.chatFocused && $q.screen.lt.lg)

function isActive(target) {
  return route.path === target || route.path.startsWith(`${target}/`)
}

const mobileBackTarget = computed(() => {
  if (
    route.name === 'mobile-feed' ||
    route.name === 'mobile-search' ||
    route.name === 'mobile-profile' ||
    route.name === 'mobile-notifications'
  ) {
    return '/m'
  }

  if (route.name === 'mobile-feed-detail') {
    return '/m/feed'
  }

  if (route.name === 'mobile-portfolio' || route.name === 'mobile-settings' || route.name === 'mobile-saved') {
    return '/m/profile'
  }

  if (route.name === 'mobile-projects') {
    return '/m'
  }

  if (route.name === 'mobile-developers') {
    return '/m'
  }

  if (route.name === 'mobile-job-detail') {
    return '/m/jobs'
  }

  if (route.name === 'mobile-event-detail') {
    return '/m/events'
  }

  if (route.name === 'mobile-public-portfolio') {
    return '/m/developers'
  }

  if (route.name === 'mobile-message-thread') {
    return '/m/messages'
  }

  return '/m'
})

function toggleTheme() {
  const next = !$q.dark.isActive
  $q.dark.set(next)
  localStorage.setItem('kdc_theme_dark', next ? '1' : '0')
}

async function submitSearch() {
  await router.push({
    path: route.meta.mobileShell ? '/m/search' : '/search',
    query: { q: searchText.value },
  })
}

async function handleLogout() {
  await unregisterPushNotifications()
  await session.logout()
  chat.reset()
  await router.push('/')
}

async function setupPushNotifications() {
  if (!session.isAuthenticated) {
    return
  }

  try {
    await initializePushNotifications({
      onForegroundNotification(payload) {
        const title = payload?.notification?.title || payload?.title || 'New notification'
        const message = payload?.notification?.body || payload?.body || payload?.data?.body || 'You have new activity.'

        $q.notify({
          type: 'info',
          message: `${title}: ${message}`,
          timeout: 3200,
        })
      },
      onOpenRoute(target) {
        if (!target) {
          return
        }

        try {
          const normalized = target.startsWith('http')
            ? new URL(target).hash.replace(/^#/, '') || new URL(target).pathname
            : target.replace(/^#/, '')

          router.push(normalized.startsWith('/') ? normalized : `/${normalized}`)
        } catch {
          router.push(target)
        }
      },
    })
  } catch {
    // keep push setup non-blocking
  }
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
    setupPushNotifications()
  }
})

watch(
  () => session.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      chat.fetchUnreadCount().catch(() => {})
      chat.connectRealtime()
      setupPushNotifications()
      return
    }

    unregisterPushNotifications().catch(() => {})
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
