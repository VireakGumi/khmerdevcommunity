const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/HomePage.vue'), meta: { title: 'Home' } },
      { path: 'feed', name: 'feed', component: () => import('pages/FeedPage.vue'), meta: { title: 'Community Feed' } },
      { path: 'jobs', name: 'jobs', component: () => import('pages/JobsPage.vue'), meta: { title: 'Jobs' } },
      { path: 'jobs/:slug', name: 'job-detail', component: () => import('pages/JobDetailPage.vue'), meta: { title: 'Job Detail' } },
      {
        path: 'post',
        name: 'post',
        component: () => import('pages/PostComposerPage.vue'),
        meta: { title: 'Create Post', requiresAuth: true },
      },
      { path: 'projects', name: 'projects', component: () => import('pages/ProjectsPage.vue'), meta: { title: 'Projects' } },
      { path: 'events', name: 'events', component: () => import('pages/EventsPage.vue'), meta: { title: 'Events' } },
      { path: 'events/:id', name: 'event-detail', component: () => import('pages/EventDetailPage.vue'), meta: { title: 'Event Detail' } },
      { path: 'developers', name: 'developers', component: () => import('pages/DevelopersPage.vue'), meta: { title: 'Developer Profiles' } },
      { path: 'search', name: 'search', component: () => import('pages/SearchPage.vue'), meta: { title: 'Search' } },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('pages/NotificationsPage.vue'),
        meta: { title: 'Notifications', requiresAuth: true },
      },
      {
        path: 'messages',
        name: 'messages',
        component: () => import('pages/MessagesPage.vue'),
        meta: { title: 'Messages', requiresAuth: true, chatFocused: true },
      },
      {
        path: 'saved',
        name: 'saved',
        component: () => import('pages/SavedPage.vue'),
        meta: { title: 'Saved', requiresAuth: true },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: { title: 'Settings', requiresAuth: true },
      },
      {
        path: 'portfolio',
        name: 'portfolio',
        component: () => import('pages/MyPortfolioPage.vue'),
        meta: { title: 'My Portfolio', requiresAuth: true },
      },
      {
        path: 'u/:username',
        name: 'public-portfolio',
        component: () => import('pages/PublicPortfolioPage.vue'),
        meta: { title: 'Developer Portfolio', standaloneShell: true },
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { hideChrome: true, guestOnly: true, title: 'Login' },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
        meta: { hideChrome: true, guestOnly: true, title: 'Register' },
      },
      {
        path: 'auth/callback',
        name: 'auth-callback',
        component: () => import('pages/OAuthCallbackPage.vue'),
        meta: { hideChrome: true, guestOnly: true, title: 'Connecting account' },
      },
      {
        path: 'm',
        name: 'mobile-home',
        component: () => import('pages/mobile/MobileHomePage.vue'),
        meta: { mobileShell: true, requiresAuth: true, title: 'Mobile' },
      },
      {
        path: 'm/feed',
        name: 'mobile-feed',
        component: () => import('pages/mobile/MobileFeedPage.vue'),
        meta: { mobileShell: true, requiresAuth: true, title: 'Feed' },
      },
      {
        path: 'm/post',
        name: 'mobile-post',
        component: () => import('pages/mobile/MobilePostPage.vue'),
        meta: { mobileShell: true, requiresAuth: true, title: 'Post' },
      },
      {
        path: 'm/notifications',
        name: 'mobile-notifications',
        component: () => import('pages/mobile/MobileNotificationsPage.vue'),
        meta: { mobileShell: true, requiresAuth: true, title: 'Notifications' },
      },
      {
        path: 'm/profile',
        name: 'mobile-profile',
        component: () => import('pages/mobile/MobileProfilePage.vue'),
        meta: { mobileShell: true, requiresAuth: true, title: 'Profile' },
      },
      {
        path: 'm/messages',
        name: 'mobile-messages',
        component: () => import('pages/mobile/MobileMessagesPage.vue'),
        meta: { mobileShell: true, requiresAuth: true, title: 'Messages' },
      },
      {
        path: 'm/messages/:conversationId',
        name: 'mobile-message-thread',
        component: () => import('pages/mobile/MobileMessagesPage.vue'),
        meta: { mobileShell: true, requiresAuth: true, title: 'Messages' },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
