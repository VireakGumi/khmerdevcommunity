<template>
  <div class="portfolio-tab-stack">
    <section class="content-card portfolio-section q-pa-lg">
      <div class="portfolio-section-head">
        <div class="section-label">Overview</div>
        <h2 class="portfolio-section-title">Identity, focus, and community presence</h2>
      </div>

      <div class="portfolio-overview-grid q-mt-lg">
        <article class="portfolio-overview-card">
          <div class="section-label">About</div>
          <div class="mini-card-title q-mt-sm">Professional summary</div>
          <div class="mini-card-copy q-mt-sm">{{ profile.bio || profile.portfolio_summary || 'No biography added yet.' }}</div>
        </article>

        <article class="portfolio-overview-card">
          <div class="section-label">Focus</div>
          <div class="mini-card-title q-mt-sm">Current direction</div>
          <div class="portfolio-focus-list q-mt-sm">
            <div v-for="item in focusItems" :key="item.label" class="portfolio-focus-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </article>

        <article class="portfolio-overview-card">
          <div class="section-label">Community</div>
          <div class="mini-card-title q-mt-sm">Presence and contribution</div>
          <div class="portfolio-focus-list q-mt-sm">
            <div v-for="item in headlineStats" :key="item.label" class="portfolio-focus-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section v-if="allAchievementBadges.length" class="content-card portfolio-section q-pa-lg q-mt-md">
      <div class="portfolio-section-head">
        <div class="section-label">Achievements</div>
        <h2 class="portfolio-section-title">Recognition and credibility signals</h2>
      </div>

      <div class="portfolio-badge-grid q-mt-md">
        <article v-for="item in allAchievementBadges" :key="item.title" class="portfolio-badge-card portfolio-badge-card--wide">
          <q-icon :name="item.icon || 'workspace_premium'" size="18px" color="primary" />
          <div class="mini-card-title q-mt-sm">{{ item.title }}</div>
          <div class="card-meta q-mt-xs">{{ item.issuer || item.year || 'Community signal' }}</div>
          <div class="mini-card-copy q-mt-sm">{{ item.copy || item.summary }}</div>
        </article>
      </div>
    </section>

    <section class="content-card portfolio-section q-pa-lg q-mt-md">
      <div class="portfolio-section-head">
        <div class="section-label">Recent Activity</div>
        <h2 class="portfolio-section-title">Writing, launches, and contribution signals</h2>
      </div>

      <div class="portfolio-activity-list">
        <article v-for="item in activityTimeline" :key="`${item.type}-${item.id}`" class="portfolio-activity-item">
          <div class="portfolio-activity-item__marker">
            <q-icon :name="item.icon" size="16px" color="primary" />
          </div>
          <div class="portfolio-activity-item__body">
            <div class="portfolio-activity-item__meta">
              <span class="portfolio-stat-label">{{ item.type }}</span>
              <span class="card-meta">{{ item.when }}</span>
            </div>
            <div class="mini-card-title q-mt-xs">{{ item.title }}</div>
            <div class="mini-card-copy q-mt-xs">{{ item.copy }}</div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  profile: { type: Object, required: true },
  focusItems: { type: Array, required: true },
  headlineStats: { type: Array, required: true },
  allAchievementBadges: { type: Array, required: true },
  activityTimeline: { type: Array, required: true },
})
</script>
