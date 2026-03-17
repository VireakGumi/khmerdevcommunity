<template>
  <q-page class="q-pa-md q-pb-xl">
    <div class="content-card q-pa-sm" style="border-radius: 20px">
      <div class="section-label">Mobile Hub</div>
      <div class="text-h6 text-weight-bold q-mt-sm">Everything important, sized for the phone</div>
      <div class="text-body2 muted-text q-mt-sm">
        Jump straight into the feed, ship an update, check alerts, or manage your portfolio from the compact shell.
      </div>
      <div class="summary-grid q-mt-md">
        <div class="inline-stat">
          <div class="card-meta">Feed</div>
          <div class="text-subtitle2 text-weight-bold q-mt-xs">Read fast</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Post</div>
          <div class="text-subtitle2 text-weight-bold q-mt-xs">Ship fast</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Inbox</div>
          <div class="text-subtitle2 text-weight-bold q-mt-xs">Reply fast</div>
        </div>
      </div>
    </div>

    <div class="q-mt-md">
      <q-btn
        v-for="item in mobileLinks"
        :key="item.to"
        class="mobile-entry full-width q-mb-sm"
        flat
        no-caps
        align="left"
        :to="item.to"
      >
        <div class="row items-center no-wrap full-width">
          <div class="nav-icon-wrap">
            <q-icon :name="item.icon" />
          </div>
          <div class="q-ml-md">
            <div class="text-subtitle2 text-weight-bold">{{ item.label }}</div>
            <div class="text-caption muted-text">{{ item.hint }}</div>
          </div>
          <q-space />
          <q-icon name="north_east" color="primary" />
        </div>
      </q-btn>
    </div>

    <div class="stack-card q-pa-sm q-mt-sm" style="border-radius: 20px">
      <div class="section-label">Web Sync</div>
      <div class="text-subtitle2 text-weight-bold q-mt-sm">Desktop and mobile share the same account</div>
      <div class="text-body2 muted-text q-mt-xs">
        Edit your public portfolio on the web, then switch here for quick posting, notifications, and messaging.
      </div>
      <q-btn class="q-mt-md" color="secondary" flat no-caps icon="desktop_windows" label="Back to web app" to="/" />
    </div>
  </q-page>
</template>

<script setup>
const mobileLinks = [
  { to: '/m/feed', label: 'Feed', hint: 'Check the latest community posts', icon: 'rss_feed' },
  { to: '/m/post', label: 'Post', hint: 'Publish a quick update', icon: 'edit_square' },
  { to: '/m/notifications', label: 'Notifications', hint: 'See mentions and activity', icon: 'notifications' },
  { to: '/m/profile', label: 'Profile', hint: 'Review your mobile portfolio view', icon: 'person' },
  { to: '/m/messages', label: 'Messages', hint: 'Talk to other developers', icon: 'mail' },
]
</script>
