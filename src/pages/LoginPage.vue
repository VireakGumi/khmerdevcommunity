<template>
  <q-page padding>
    <div class="auth-shell">
      <div class="auth-grid">
        <section class="auth-showcase">
          <div class="auth-showcase__badge">Khmer Dev Community</div>
          <div class="auth-showcase__copy">
            <div class="section-label">Developer Access</div>
            <h1 class="auth-showcase__title">Sign in to publish, connect, and ship with the community.</h1>
            <p class="auth-showcase__lede">
              Move from feed posts to jobs, events, messages, and a public portfolio with one developer-first account.
            </p>
          </div>

          <div class="auth-points">
            <div class="auth-point">
              <q-icon name="dynamic_feed" size="18px" />
              <span>
                <strong>Share work in the feed</strong>
                <small>Post launches, insights, and asks with a portfolio-ready identity.</small>
              </span>
            </div>
            <div class="auth-point">
              <q-icon name="person_search" size="18px" />
              <span>
                <strong>Build developer presence</strong>
                <small>Own a profile, follow builders, and stay visible in search and discovery.</small>
              </span>
            </div>
            <div class="auth-point">
              <q-icon name="forum" size="18px" />
              <span>
                <strong>Keep conversations moving</strong>
                <small>Jump from desktop to mobile with the same secure Passport-backed session.</small>
              </span>
            </div>
          </div>

          <div class="auth-showcase__meta">
            <div class="auth-meta-chip">Feed</div>
            <div class="auth-meta-chip">Jobs</div>
            <div class="auth-meta-chip">Events</div>
            <div class="auth-meta-chip">Portfolio</div>
          </div>
        </section>

        <section class="content-card auth-card q-pa-lg">
          <div class="auth-card__head">
            <div class="section-label">Sign In</div>
            <h2 class="auth-card__title">Welcome back</h2>
            <p class="auth-card__copy">
              Use GitHub for the fastest developer onboarding, or continue with your email account.
            </p>
          </div>

          <div class="auth-social-stack q-mt-lg">
            <div class="auth-social-label">Recommended for developers</div>
            <q-btn
              :loading="socialLoading === 'github'"
              class="auth-social-btn auth-social-btn--github"
              no-caps
              unelevated
              icon="code"
            label="Continue with GitHub"
            @click="signInWith('github')"
          />
            <q-btn
              :loading="socialLoading === 'google'"
              class="auth-social-btn auth-social-btn--google"
              no-caps
              icon="mail"
              label="Continue with Google"
              @click="signInWith('google')"
          />
        </div>

          <div class="auth-divider q-mt-lg q-mb-lg">
            <span>or continue with email</span>
          </div>

          <q-form class="auth-form q-gutter-md" @submit="submit">
            <q-input v-model="form.email" outlined class="input-surface" label="Email" type="email" />
            <q-input v-model="form.password" outlined class="input-surface" label="Password" type="password" />
            <div class="auth-form__action">
              <q-btn :loading="loading" class="full-width auth-email-btn" color="primary" no-caps label="Login" type="submit" />
            </div>
          </q-form>

          <div class="auth-footnote">
            <span>Demo access</span>
            <strong>chanvireak906@gmail.com / password</strong>
          </div>
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
  email: 'chanvireak906@gmail.com',
  password: 'password',
})

function signInWith(provider) {
  socialLoading.value = provider
  window.location.assign(session.getSocialAuthUrl(provider, route.query.redirect || '/feed'))
}

async function submit() {
  loading.value = true

  try {
    await session.login(form)
    $q.notify({ type: 'positive', message: 'Signed in successfully' })
    await router.push(route.query.redirect || '/feed')
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Login failed' })
  } finally {
    loading.value = false
  }
}
</script>
