<template>
  <q-page class="q-pa-xl flex flex-center">
    <div class="content-card q-pa-xl" style="max-width: 760px; width: 100%">
      <div class="section-label">404</div>
      <div class="text-h2 text-weight-bold q-mt-sm">This route does not exist in the community app</div>
      <div class="text-body1 muted-text q-mt-md">
        The page may have moved, the URL may be wrong, or the feature has not been exposed yet.
      </div>

      <div class="summary-grid q-mt-xl">
        <div class="inline-stat">
          <div class="card-meta">Go Back</div>
          <div class="text-subtitle2 text-weight-bold q-mt-xs">Return to the previous page</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Home</div>
          <div class="text-subtitle2 text-weight-bold q-mt-xs">Start from the main dashboard</div>
        </div>
        <div class="inline-stat">
          <div class="card-meta">Mobile</div>
          <div class="text-subtitle2 text-weight-bold q-mt-xs">Open the compact `/m` shell</div>
        </div>
      </div>

      <div class="page-actions q-mt-xl">
        <q-btn color="primary" no-caps icon="home" label="Go Home" to="/" />
        <q-btn flat color="secondary" no-caps icon="phone_iphone" label="Open Mobile" to="/m" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
//
</script>
