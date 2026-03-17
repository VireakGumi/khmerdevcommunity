<template>
  <header class="content-card portfolio-pro-nav q-pa-md q-mb-lg" :class="{ 'portfolio-pro-nav--mobile': isMobile }">
    <div class="portfolio-pro-nav__brand">
      <div class="section-label">Developer Portfolio</div>
      <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ profile.name }}</div>
      <div class="card-meta">Public profile and developer proof-of-work</div>
    </div>

    <nav class="portfolio-pro-nav__links" :class="{ 'portfolio-pro-nav__links--mobile': isMobile }">
      <button
        v-for="item in tabs"
        :key="item.value"
        class="portfolio-tab"
        :class="{ 'portfolio-tab--active': modelValue === item.value }"
        type="button"
        @click="$emit('select-tab', item.value)"
      >
        {{ item.label }}
      </button>
    </nav>

    <div class="portfolio-pro-nav__actions">
      <q-btn flat no-caps color="secondary" icon="content_copy" label="Copy link" class="portfolio-action-btn" @click="$emit('copy-link')" />
      <q-btn
        v-if="canFollow"
        flat
        no-caps
        :color="profile.is_following ? 'secondary' : 'grey-5'"
        :icon="profile.is_following ? 'person_remove' : 'person_add'"
        :label="profile.is_following ? 'Following' : 'Follow'"
        class="portfolio-action-btn"
        @click="$emit('toggle-follow')"
      />
      <q-btn v-if="canMessage" flat no-caps color="secondary" icon="mail" label="Message" class="portfolio-action-btn" :to="`/messages?recipient=${profile.id}`" />
      <q-btn v-if="profile.portfolio_booking_url" color="primary" no-caps icon="calendar_month" label="Book call" class="portfolio-action-btn" :href="profile.portfolio_booking_url" target="_blank" />
      <q-btn v-if="isOwnProfile" color="primary" no-caps icon="edit" label="Edit portfolio" class="portfolio-action-btn" to="/portfolio" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  profile: { type: Object, required: true },
  tabs: { type: Array, required: true },
  isMobile: { type: Boolean, default: false },
  canFollow: { type: Boolean, default: false },
  canMessage: { type: Boolean, default: false },
  isOwnProfile: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'select-tab', 'copy-link', 'toggle-follow'])
</script>
