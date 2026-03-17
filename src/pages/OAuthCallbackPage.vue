<template>
  <q-page padding class="flex flex-center">
    <div class="content-card auth-card q-pa-xl text-center">
      <div class="section-label">OAuth</div>
      <div class="text-h4 text-weight-bold q-mt-sm">Connecting your account</div>
      <div class="text-body2 muted-text q-mt-sm">
        Finishing sign in and preparing your developer workspace.
      </div>

      <q-spinner color="primary" size="42px" class="q-mt-xl" />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSessionStore } from 'src/stores/session-store'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

onMounted(async () => {
  try {
    const redirect = await session.completeSocialLogin(route.query)
    $q.notify({ type: 'positive', message: 'Signed in successfully' })
    await router.replace(redirect)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || 'Social login failed' })
    await router.replace({ name: 'login' })
  }
})
</script>
