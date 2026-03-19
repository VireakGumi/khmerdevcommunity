import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import { useSessionStore } from 'src/stores/session-store'
import routes from './routes'

const APP_NAME = 'khmerdevcommunity'

const routeDescriptions = {
  home: 'Discover projects, jobs, events, and active Khmer builders in one developer community dashboard.',
  feed: 'Follow launches, lessons, code snippets, and collaboration updates from the Khmer developer community.',
  jobs: 'Browse developer jobs, freelance work, internships, and openings shared by the community.',
  'job-detail': 'Review job details, company info, stack requirements, and application steps on khmerdevcommunity.',
  projects: 'Explore shipped products, side projects, and technical builds from Khmer developers.',
  events: 'Find upcoming meetups, workshops, launches, and community events for Khmer builders.',
  'event-detail': 'Review the event schedule, speakers, location, and RSVP details on khmerdevcommunity.',
  developers: 'Browse developer profiles, portfolios, skills, and availability across the Khmer builder network.',
  search: 'Search posts, projects, developers, events, and jobs across khmerdevcommunity.',
  notifications: 'Stay updated with replies, follows, reactions, and activity across your community account.',
  messages: 'Message builders directly, keep collaboration threads organized, and respond quickly.',
  saved: 'Manage your saved posts, projects, events, and jobs in one personal library.',
  settings: 'Manage account preferences, privacy, notifications, and workspace settings.',
  'my-portfolio': 'Edit your public portfolio, projects, experience, and professional links.',
  portfolio: 'View a public developer portfolio with projects, writing, achievements, and experience.',
  login: 'Sign in to khmerdevcommunity with GitHub, Google, or email.',
  register: 'Create your khmerdevcommunity account and join the Khmer builder network.',
}

function ensureMetaTag(name, attr = 'name') {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }

  return tag
}

function updateDocumentMeta(to) {
  const pageTitle = to.meta?.title ? `${to.meta.title} | ${APP_NAME}` : APP_NAME
  const description = routeDescriptions[to.name] || routeDescriptions.home

  document.title = pageTitle
  ensureMetaTag('description').setAttribute('content', description)
  ensureMetaTag('og:title', 'property').setAttribute('content', pageTitle)
  ensureMetaTag('og:description', 'property').setAttribute('content', description)
  ensureMetaTag('twitter:title', 'property').setAttribute('content', pageTitle)
  ensureMetaTag('twitter:description', 'property').setAttribute('content', description)
}

function isStandaloneAppMode() {
  if (process.env.SERVER) {
    return false
  }

  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true ||
    document.referrer.startsWith('android-app://')
  )
}

function resolveMobileRoute(to) {
  const routeMap = {
    home: 'mobile-home',
    feed: 'mobile-feed',
    jobs: 'mobile-jobs',
    'job-detail': 'mobile-job-detail',
    projects: 'mobile-projects',
    events: 'mobile-events',
    'event-detail': 'mobile-event-detail',
    developers: 'mobile-developers',
    search: 'mobile-search',
    notifications: 'mobile-notifications',
    messages: 'mobile-messages',
    saved: 'mobile-saved',
    settings: 'mobile-settings',
    'public-portfolio': 'mobile-public-portfolio',
  }

  const mobileName = routeMap[to.name]

  if (!mobileName) {
    return null
  }

  return {
    name: mobileName,
    params: to.params,
    query: to.query,
    hash: to.hash,
  }
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to) => {
    const session = useSessionStore()

    if (!session.hydrated) {
      session.hydrate()
    }

    if (session.token && !session.user && !session.loadingUser) {
      await session.fetchMe()
    }

    if (to.meta.requiresAuth && !session.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.meta.guestOnly && session.isAuthenticated) {
      return { name: 'feed' }
    }

    if (isStandaloneAppMode() && !to.meta.mobileShell && !to.meta.hideChrome && !to.meta.standaloneShell) {
      const mobileTarget = resolveMobileRoute(to)

      if (mobileTarget) {
        return mobileTarget
      }
    }

    return true
  })

  Router.afterEach((to) => {
    if (!process.env.SERVER) {
      updateDocumentMeta(to)
    }
  })

  return Router
})
