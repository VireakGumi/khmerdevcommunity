<template>
  <div class="sidebar-layout">
    <section class="sidebar-promo">
      <div class="sidebar-promo__copy">
        <div class="section-label">Community</div>
        <div class="sidebar-promo__title">Build with the community</div>
        <div class="sidebar-promo__body">
          Share work, find jobs, and keep your profile active.
        </div>
      </div>

      <q-btn
        class="sidebar-promo__cta full-width"
        color="primary"
        no-caps
        icon="phone_iphone"
        label="Open mobile app"
        to="/m"
        @click="$emit('navigate')"
      />
    </section>

    <section class="sidebar-nav-group">
      <div class="sidebar-section-head">
        <div class="section-label">Explore</div>
        <div class="sidebar-section-note">Core spaces</div>
      </div>

      <q-list class="sidebar-nav-list" padding>
        <q-item
          v-for="item in links"
          :key="item.to"
          clickable
          :to="item.to"
          class="sidebar-nav-item"
          :class="{ 'sidebar-nav-item--active': route.path === item.to }"
          @click="$emit('navigate')"
        >
          <q-item-section avatar class="sidebar-nav-item__avatar">
            <div class="sidebar-nav-icon">
              <q-icon :name="item.icon" />
            </div>
          </q-item-section>

          <q-item-section>
            <div class="sidebar-nav-item__copy">
              <div class="sidebar-nav-item__label">{{ item.label }}</div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </section>

    <!-- <section class="sidebar-meta-card">
      <div class="section-label">Theme</div>
      <div class="sidebar-meta-card__title">{{ isDark ? 'Dark mode' : 'Light mode' }}</div>
      <div class="sidebar-meta-card__body">
        Switch whenever the environment changes.
      </div>

      <q-btn
        class="sidebar-meta-card__action full-width"
        flat
        no-caps
        :icon="isDark ? 'light_mode' : 'dark_mode'"
        :label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="$emit('toggle-theme')"
      />

      <div class="sidebar-meta-card__foot">The sidebar stays with you while pages scroll.</div>
    </section> -->
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineProps({
  links: {
    type: Array,
    default: () => [],
  },
  isDark: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['navigate', 'toggle-theme'])

const route = useRoute()
</script>
