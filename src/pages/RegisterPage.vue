<template>
  <q-page padding>
    <div class="auth-shell">
      <div class="auth-grid">
        <section class="auth-showcase">
          <div class="auth-showcase__brand">
            <img src="/img/logo-with-name.png" alt="khmerdevcommunity" class="auth-showcase__brand-image" />
          </div>
          <div class="auth-showcase__copy">
            <div class="section-label">Onboarding</div>
            <h1 class="auth-showcase__title">Create a developer identity that grows with your work.</h1>
            <p class="auth-showcase__lede">
              Start with one account, then publish updates, share projects, join events, and shape a portfolio that reads like your real output.
            </p>
          </div>

          <div class="auth-points">
            <div class="auth-point">
              <q-icon name="badge" size="18px" />
              <span>
                <strong>Reserve your public handle</strong>
                <small>Get your username, profile, and portfolio URL in one clean setup.</small>
              </span>
            </div>
            <div class="auth-point">
              <q-icon name="rocket_launch" size="18px" />
              <span>
                <strong>Ship visible work</strong>
                <small>Share product updates, projects, and events with a consistent developer identity.</small>
              </span>
            </div>
            <div class="auth-point">
              <q-icon name="groups" size="18px" />
              <span>
                <strong>Join the builder graph</strong>
                <small>Get discovered by other developers, collaborators, and event organizers immediately.</small>
              </span>
            </div>
          </div>

          <div class="auth-showcase__meta">
            <div class="auth-meta-chip">Identity</div>
            <div class="auth-meta-chip">Projects</div>
            <div class="auth-meta-chip">Messages</div>
            <div class="auth-meta-chip">Presence</div>
          </div>
        </section>

        <section class="content-card auth-card q-pa-lg">
          <div class="auth-card__head">
            <div class="section-label">Register</div>
            <h2 class="auth-card__title">Open your account</h2>
            <p class="auth-card__copy">
              Start with GitHub for the quickest setup, or create your account with email and personalize it later.
            </p>
          </div>

          <div class="auth-social-stack q-mt-lg">
            <div class="auth-social-label">Best for developer onboarding</div>
            <q-btn
              :loading="socialLoading === 'github'"
              class="auth-social-btn auth-social-btn--github"
              no-caps
              unelevated
              icon="code"
            label="Start with GitHub"
            @click="signInWith('github')"
          />
            <q-btn
              :loading="socialLoading === 'google'"
              class="auth-social-btn auth-social-btn--google"
              no-caps
              icon="mail"
              label="Start with Google"
              @click="signInWith('google')"
          />
        </div>

          <div class="auth-divider q-mt-lg q-mb-lg">
            <span>or continue with email</span>
          </div>

          <q-form class="auth-form q-gutter-md" @submit="submit">
            <q-input v-model="form.name" outlined class="input-surface" label="Full name" />
            <q-input v-model="form.username" outlined class="input-surface" label="Username" />
            <q-input v-model="form.email" outlined class="input-surface" label="Email" type="email" />
            <q-input v-model="form.password" outlined class="input-surface" label="Password" type="password" />
            <q-input v-model="form.password_confirmation" outlined class="input-surface" label="Confirm password" type="password" />
            <div class="auth-form__action">
              <q-btn :loading="loading" class="full-width auth-email-btn" color="primary" no-caps label="Create account" type="submit" />
            </div>
          </q-form>
        </section>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSessionStore } from 'src/stores/session-store'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const loading = ref(false)
const socialLoading = ref('')
const form = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
})

function signInWith(provider) {
  socialLoading.value = provider
  window.location.assign(session.getSocialAuthUrl(provider, route.query.redirect || '/feed'))
}

async function submit() {
  loading.value = true

  try {
    await session.register(form)
    $q.notify({ type: 'positive', message: 'Account created' })
    await router.push('/feed')
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Registration failed' })
  } finally {
    loading.value = false
  }
}
</script>
