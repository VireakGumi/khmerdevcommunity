<template>
  <section class="content-card portfolio-profile-shell q-pa-xl q-mb-lg">
    <div class="portfolio-cover-stage" :style="{ '--portfolio-primary': heroPrimary, '--portfolio-secondary': heroSecondary }">
      <div class="portfolio-cover-stage__glow" />
      <div class="portfolio-cover-stage__mesh" />
    </div>
    <div class="portfolio-profile-shell__hero kdc-hero-split">
      <div class="portfolio-profile-shell__identity kdc-hero-split__main">
        <div class="portfolio-avatar-frame">
          <q-avatar size="144px" class="portfolio-profile-avatar" :style="{ background: heroPrimary }" text-color="white">
            <img v-if="profile.avatar_url" :src="profile.avatar_url" :alt="profile.name" />
            <span v-else>{{ profile.name.charAt(0) }}</span>
          </q-avatar>
          <span class="portfolio-avatar-status" />
        </div>

        <div class="portfolio-profile-copy">
          <div class="portfolio-pro-kicker">Khmer Developer Community</div>
          <h1 class="portfolio-pro-name q-mt-sm">{{ profile.name }}</h1>
          <div class="portfolio-pro-meta">
            @{{ profile.username }}
            <span class="portfolio-dot">|</span>
            {{ profile.location || 'Cambodia' }}
            <span v-if="profile.company" class="portfolio-dot">|</span>
            <span v-if="profile.company">{{ profile.company }}</span>
          </div>
          <div v-if="profile.availability" class="portfolio-pro-status">{{ profile.availability }}</div>

          <div v-if="profile.portfolio_cover" class="portfolio-pro-cover q-mt-lg">{{ profile.portfolio_cover }}</div>
          <div class="portfolio-pro-headline q-mt-lg">{{ profile.portfolio_headline || profile.headline || 'Developer profile' }}</div>
          <p class="portfolio-pro-summary q-mt-md">{{ profile.portfolio_summary || profile.bio || 'This developer has not added a detailed summary yet.' }}</p>

          <div class="portfolio-inline-facts q-mt-md">
            <div v-for="fact in profileFacts" :key="fact.label" class="portfolio-inline-fact">
              <span class="portfolio-stat-label">{{ fact.label }}</span>
              <strong>{{ fact.value }}</strong>
            </div>
          </div>

          <div class="portfolio-link-chip-row q-mt-lg">
            <a v-for="item in socialActions" :key="item.label" class="portfolio-link-chip" :href="item.value" target="_blank" rel="noreferrer">
              <q-icon :name="item.icon" size="16px" />
              <span>{{ item.label }}</span>
              <q-icon name="north_east" size="14px" />
            </a>
          </div>
        </div>
      </div>

      <aside class="portfolio-profile-shell__aside kdc-hero-split__aside">
        <div class="portfolio-side-panel">
          <div class="section-label">At A Glance</div>
          <div class="mini-card-copy q-mt-sm">Visible community footprint and public developer signals.</div>
          <div class="portfolio-side-metrics q-mt-md">
            <div v-for="item in heroStats" :key="item.label" class="portfolio-side-metric">
              <span class="portfolio-stat-label">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>

        <div class="portfolio-side-panel">
          <div class="section-label">Highlights</div>
          <div class="portfolio-badge-grid q-mt-md">
            <div v-for="badge in achievementBadges" :key="badge.title" class="portfolio-badge-card">
              <q-icon :name="badge.icon" size="18px" color="primary" />
              <div class="mini-card-title q-mt-sm">{{ badge.title }}</div>
              <div class="mini-card-copy q-mt-xs">{{ badge.copy }}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
defineProps({
  profile: { type: Object, required: true },
  heroPrimary: { type: String, required: true },
  heroSecondary: { type: String, required: true },
  profileFacts: { type: Array, required: true },
  socialActions: { type: Array, required: true },
  heroStats: { type: Array, required: true },
  achievementBadges: { type: Array, required: true },
})
</script>
