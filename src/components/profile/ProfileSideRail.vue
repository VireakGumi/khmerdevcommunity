<template>
  <section v-if="isMobile" class="portfolio-mobile-panels q-mt-md">
    <q-expansion-item
      v-for="panel in mobilePanels"
      :key="panel.key"
      class="content-card portfolio-mobile-panel"
      expand-separator
      dense
      dense-toggle
      switch-toggle-side
      :default-opened="panel.defaultOpened"
      :icon="panel.icon"
      :label="panel.label"
      :caption="panel.caption"
      header-class="portfolio-mobile-panel__header"
    >
      <div class="q-pa-md">
        <template v-if="panel.key === 'social'">
          <div class="portfolio-signal-list">
            <div class="feature-row">
              <span>Developer rank</span>
              <strong>#{{ currentRank }}</strong>
            </div>
            <div class="feature-row">
              <span>Engagement score</span>
              <strong>{{ engagementScore }}</strong>
            </div>
            <div class="feature-row">
              <span>Followers</span>
              <strong>{{ profile.followers_count || 0 }}</strong>
            </div>
            <div class="feature-row">
              <span>Following</span>
              <strong>{{ profile.following_count || 0 }}</strong>
            </div>
          </div>
        </template>

        <template v-else-if="panel.key === 'contact'">
          <div class="portfolio-contact-panel">
            <div class="mini-card-copy">{{ contactSummary }}</div>
            <div class="portfolio-contact-actions q-mt-md">
              <q-btn v-if="canMessage" color="primary" no-caps icon="mail" label="Send message" :to="`/messages?recipient=${profile.id}`" />
              <q-btn v-if="profile.portfolio_booking_url" flat no-caps color="secondary" icon="calendar_month" label="Book call" :href="profile.portfolio_booking_url" target="_blank" />
            </div>
          </div>
        </template>

        <template v-else-if="panel.key === 'links'">
          <div class="portfolio-link-list">
            <a v-for="item in linkItems" :key="item.label" class="portfolio-link-row" :href="item.value || undefined" target="_blank" rel="noreferrer">
              <div class="portfolio-link-row__copy">
                <q-icon :name="item.icon" size="16px" />
                <span>{{ item.label }}</span>
              </div>
              <span class="muted-text">{{ item.value ? 'Open' : 'Unavailable' }}</span>
            </a>
          </div>
        </template>

        <template v-else-if="panel.key === 'skills'">
          <div class="portfolio-skill-row">
            <span v-for="skill in profile.skills || []" :key="skill" class="portfolio-skill-pill">{{ skill }}</span>
            <span v-if="!(profile.skills || []).length" class="mini-card-copy">No skills listed yet.</span>
          </div>
        </template>

        <template v-else-if="panel.key === 'signals'">
          <div class="portfolio-signal-list">
            <div class="feature-row">
              <span>Public summary</span>
              <strong>{{ profile.portfolio_summary ? 'Complete' : 'Missing' }}</strong>
            </div>
            <div class="feature-row">
              <span>Featured work</span>
              <strong>{{ (profile.featured_work || []).length }}</strong>
            </div>
            <div class="feature-row">
              <span>Social links</span>
              <strong>{{ socialActions.length }}</strong>
            </div>
            <div class="feature-row">
              <span>Community plan</span>
              <strong>{{ isPremium ? 'Premium' : 'Core' }}</strong>
            </div>
          </div>
        </template>

        <template v-else-if="panel.key === 'trending'">
          <div class="portfolio-trending-list">
            <article v-for="developer in trendingContributors" :key="developer.id" class="portfolio-trending-item">
              <div class="portfolio-trending-item__copy">
                <div class="mini-card-title">{{ developer.name }}</div>
                <div class="card-meta">@{{ developer.username }} · {{ developer.followers_count || 0 }} followers</div>
              </div>
              <q-btn
                v-if="isAuthenticated && currentUserId !== developer.id"
                flat
                dense
                no-caps
                :color="developer.is_following ? 'secondary' : 'grey-5'"
                :label="developer.is_following ? 'Following' : 'Follow'"
                @click="$emit('toggle-follow', developer.id)"
              />
            </article>
          </div>
        </template>

        <template v-else-if="panel.key === 'notifications' && isOwnProfile">
          <div class="mini-card-copy">Likes, comments, follows, and messages all route into your notification flow.</div>
          <q-btn class="q-mt-md" color="primary" no-caps icon="notifications" label="Open notifications" to="/notifications" />
        </template>

        <template v-else-if="panel.key === 'writing'">
          <div class="portfolio-writing-list">
            <article v-for="post in profile.posts || []" :key="post.id" class="portfolio-writing-card">
              <div class="text-subtitle2 text-weight-bold">{{ post.title }}</div>
              <div class="mini-card-copy q-mt-xs">{{ post.excerpt }}</div>
            </article>
          </div>
        </template>
      </div>
    </q-expansion-item>
  </section>

  <aside v-else class="portfolio-pro-side">
    <section class="content-card portfolio-section q-pa-md">
      <div class="portfolio-section-head portfolio-section-head--compact">
        <div class="section-label">Social Pulse</div>
        <h2 class="portfolio-section-title">Why this profile matters</h2>
      </div>
      <div class="portfolio-signal-list">
        <div class="feature-row">
          <span>Developer rank</span>
          <strong>#{{ currentRank }}</strong>
        </div>
        <div class="feature-row">
          <span>Engagement score</span>
          <strong>{{ engagementScore }}</strong>
        </div>
        <div class="feature-row">
          <span>Followers</span>
          <strong>{{ profile.followers_count || 0 }}</strong>
        </div>
        <div class="feature-row">
          <span>Following</span>
          <strong>{{ profile.following_count || 0 }}</strong>
        </div>
      </div>
    </section>

    <section class="content-card portfolio-section q-pa-md">
      <div class="portfolio-section-head portfolio-section-head--compact">
        <div class="section-label">Contact</div>
        <h2 class="portfolio-section-title">Work together</h2>
      </div>
      <div class="portfolio-contact-panel">
        <div class="mini-card-copy">{{ contactSummary }}</div>
        <div class="portfolio-contact-actions q-mt-md">
          <q-btn v-if="canMessage" color="primary" no-caps icon="mail" label="Send message" :to="`/messages?recipient=${profile.id}`" />
          <q-btn v-if="profile.portfolio_booking_url" flat no-caps color="secondary" icon="calendar_month" label="Book call" :href="profile.portfolio_booking_url" target="_blank" />
        </div>
      </div>
    </section>

    <section class="content-card portfolio-section q-pa-md q-mt-md">
      <div class="portfolio-section-head portfolio-section-head--compact">
        <div class="section-label">Links</div>
        <h2 class="portfolio-section-title">Professional presence</h2>
      </div>
      <div class="portfolio-link-list">
        <a v-for="item in linkItems" :key="item.label" class="portfolio-link-row" :href="item.value || undefined" target="_blank" rel="noreferrer">
          <div class="portfolio-link-row__copy">
            <q-icon :name="item.icon" size="16px" />
            <span>{{ item.label }}</span>
          </div>
          <span class="muted-text">{{ item.value ? 'Open' : 'Unavailable' }}</span>
        </a>
      </div>
    </section>

    <section class="content-card portfolio-section q-pa-md q-mt-md">
      <div class="portfolio-section-head portfolio-section-head--compact">
        <div class="section-label">Skills</div>
        <h2 class="portfolio-section-title">Tech stack</h2>
      </div>
      <div class="portfolio-skill-row q-mt-md">
        <span v-for="skill in profile.skills || []" :key="skill" class="portfolio-skill-pill">{{ skill }}</span>
        <span v-if="!(profile.skills || []).length" class="mini-card-copy">No skills listed yet.</span>
      </div>
    </section>

    <section class="content-card portfolio-section q-pa-md q-mt-md">
      <div class="portfolio-section-head portfolio-section-head--compact">
        <div class="section-label">Signals</div>
        <h2 class="portfolio-section-title">Profile strength</h2>
      </div>
      <div class="portfolio-signal-list">
        <div class="feature-row">
          <span>Public summary</span>
          <strong>{{ profile.portfolio_summary ? 'Complete' : 'Missing' }}</strong>
        </div>
        <div class="feature-row">
          <span>Featured work</span>
          <strong>{{ (profile.featured_work || []).length }}</strong>
        </div>
        <div class="feature-row">
          <span>Social links</span>
          <strong>{{ socialActions.length }}</strong>
        </div>
        <div class="feature-row">
          <span>Community plan</span>
          <strong>{{ isPremium ? 'Premium' : 'Core' }}</strong>
        </div>
      </div>
    </section>

    <section class="content-card portfolio-section q-pa-md q-mt-md">
      <div class="portfolio-section-head portfolio-section-head--compact">
        <div class="section-label">Trending Contributors</div>
        <h2 class="portfolio-section-title">Builders to watch</h2>
      </div>
      <div class="portfolio-trending-list">
        <article v-for="developer in trendingContributors" :key="developer.id" class="portfolio-trending-item">
          <div class="portfolio-trending-item__copy">
            <div class="mini-card-title">{{ developer.name }}</div>
            <div class="card-meta">@{{ developer.username }} · {{ developer.followers_count || 0 }} followers</div>
          </div>
          <q-btn
            v-if="isAuthenticated && currentUserId !== developer.id"
            flat
            dense
            no-caps
            :color="developer.is_following ? 'secondary' : 'grey-5'"
            :label="developer.is_following ? 'Following' : 'Follow'"
            @click="$emit('toggle-follow', developer.id)"
          />
        </article>
      </div>
    </section>

    <section v-if="isOwnProfile" class="content-card portfolio-section q-pa-md q-mt-md">
      <div class="portfolio-section-head portfolio-section-head--compact">
        <div class="section-label">Notifications</div>
        <h2 class="portfolio-section-title">Keep the conversation moving</h2>
      </div>
      <div class="mini-card-copy">Likes, comments, follows, and messages all route into your notification flow.</div>
      <q-btn class="q-mt-md" color="primary" no-caps icon="notifications" label="Open notifications" to="/notifications" />
    </section>
  </aside>
</template>

<script setup>
defineProps({
  isMobile: { type: Boolean, default: false },
  mobilePanels: { type: Array, required: true },
  profile: { type: Object, required: true },
  currentRank: { type: [String, Number], required: true },
  engagementScore: { type: Number, required: true },
  contactSummary: { type: String, required: true },
  canMessage: { type: Boolean, default: false },
  linkItems: { type: Array, required: true },
  socialActions: { type: Array, required: true },
  isPremium: { type: Boolean, default: false },
  trendingContributors: { type: Array, required: true },
  currentUserId: { type: Number, default: null },
  isAuthenticated: { type: Boolean, default: false },
  isOwnProfile: { type: Boolean, default: false },
})

defineEmits(['toggle-follow'])
</script>
