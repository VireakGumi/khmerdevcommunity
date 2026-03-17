<template>
  <div class="portfolio-tab-stack">
    <section v-if="(profile.work_experience || []).length" class="content-card portfolio-section q-pa-lg">
      <div class="portfolio-section-head">
        <div class="section-label">Experience</div>
        <h2 class="portfolio-section-title">Work history and operating context</h2>
      </div>

      <div class="portfolio-history-list">
        <article v-for="item in profile.work_experience" :key="`${item.company}-${item.role}`" class="portfolio-history-card">
          <div class="portfolio-history-card__head">
            <div>
              <div class="mini-card-title">{{ item.role }}</div>
              <div class="card-meta q-mt-xs">{{ item.company }}</div>
            </div>
            <div class="portfolio-history-card__meta">
              <span>{{ item.period || 'Period not listed' }}</span>
              <span v-if="item.location">{{ item.location }}</span>
              <span v-if="item.type">{{ item.type }}</span>
            </div>
          </div>
          <div v-if="item.summary" class="mini-card-copy q-mt-sm">{{ item.summary }}</div>
        </article>
      </div>
    </section>

    <section v-if="educationAndCredentials.length" class="content-card portfolio-section q-pa-lg" :class="{ 'q-mt-md': (profile.work_experience || []).length }">
      <div class="portfolio-section-head">
        <div class="section-label">Education & Credentials</div>
        <h2 class="portfolio-section-title">Formal study and verified learning</h2>
      </div>

      <div class="portfolio-proof-grid">
        <div v-if="(profile.education_history || []).length" class="portfolio-proof-column">
          <div class="section-label">Education</div>
          <div class="portfolio-history-list q-mt-md">
            <article v-for="item in profile.education_history" :key="`${item.school}-${item.degree}`" class="portfolio-history-card">
              <div class="portfolio-history-card__head">
                <div>
                  <div class="mini-card-title">{{ item.school }}</div>
                  <div class="card-meta q-mt-xs">{{ item.degree || 'Program' }}<span v-if="item.field"> · {{ item.field }}</span></div>
                </div>
                <div class="portfolio-history-card__meta">
                  <span>{{ item.period || 'Period not listed' }}</span>
                </div>
              </div>
              <div v-if="item.summary" class="mini-card-copy q-mt-sm">{{ item.summary }}</div>
            </article>
          </div>
        </div>

        <div v-if="(profile.certifications || []).length" class="portfolio-proof-column">
          <div class="section-label">Certifications</div>
          <div class="portfolio-history-list q-mt-md">
            <article v-for="item in profile.certifications" :key="`${item.name}-${item.issuer}`" class="portfolio-history-card">
              <div class="portfolio-history-card__head">
                <div>
                  <div class="mini-card-title">{{ item.name }}</div>
                  <div class="card-meta q-mt-xs">{{ item.issuer || 'Issuer not listed' }}</div>
                </div>
                <div class="portfolio-history-card__meta">
                  <span>{{ item.issued_at || 'Date not listed' }}</span>
                </div>
              </div>
              <q-btn v-if="item.credential_url" flat no-caps color="primary" icon="verified" label="View credential" :href="item.credential_url" target="_blank" class="q-mt-sm" />
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="content-card portfolio-section q-pa-lg q-mt-md">
      <div class="portfolio-section-head">
        <div class="section-label">Premium Proof</div>
        <h2 class="portfolio-section-title">Business context and collaboration trust</h2>
      </div>

      <div v-if="isPremium" class="portfolio-proof-grid">
        <div class="portfolio-proof-column">
          <div class="section-label">Case Studies</div>
          <div class="portfolio-work-list q-mt-md">
            <article v-for="study in profile.portfolio_case_studies || []" :key="study.title" class="portfolio-work-card">
              <div class="mini-card-title">{{ study.title }}</div>
              <div class="mini-card-copy q-mt-sm">{{ study.summary }}</div>
              <div class="portfolio-impact-line q-mt-sm">{{ study.impact }}</div>
              <q-btn v-if="study.link" class="q-mt-md" flat no-caps color="primary" icon="north_east" label="Open case" :href="study.link" target="_blank" />
            </article>
          </div>
        </div>

        <div class="portfolio-proof-column">
          <div class="section-label">Testimonials</div>
          <div class="portfolio-testimonial-list q-mt-md">
            <article v-for="testimonial in profile.portfolio_testimonials || []" :key="testimonial.name" class="portfolio-testimonial-card">
              <p class="mini-card-copy">"{{ testimonial.quote }}"</p>
              <div class="mini-card-title q-mt-md">{{ testimonial.name }}</div>
              <div class="card-meta q-mt-xs">{{ testimonial.role }}</div>
            </article>
          </div>
        </div>
      </div>
      <div v-else class="portfolio-locked-note q-mt-md">
        <div class="mini-card-title">Premium portfolio module</div>
        <div class="mini-card-copy q-mt-xs">Case studies and testimonials appear here when premium proof-of-work is enabled.</div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  profile: { type: Object, required: true },
  educationAndCredentials: { type: Array, required: true },
  isPremium: { type: Boolean, default: false },
})
</script>
