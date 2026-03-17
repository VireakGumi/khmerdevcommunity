<template>
  <q-page padding>
    <div class="content-card q-pa-md q-mb-lg row">
      <div class="portfolio-editor-stickybar__copy col-6">
        <strong>{{ activeEditorLabel }}</strong>
        <span class="card-meta">Keep editing in smaller steps and save whenever the section is ready.</span>
      </div>
      <div class="page-actions justify-end col-6">
        <q-btn flat no-caps color="secondary" icon="content_copy" label="Copy URL" @click="copyPublicUrl" />
        <q-btn color="primary" no-caps icon="save" label="Save changes" :loading="saving" @click="saveProfile" />
      </div>
    </div>

    <section class="content-card q-pa-lg portfolio-editor-hero q-mb-lg">
      <div class="portfolio-hero-main">
        <div class="portfolio-hero-header">
          <div class="portfolio-hero-photo">
            <input ref="avatarInput" class="sr-only-input" type="file" accept=".jpg,.jpeg,.png,.webp" @change="handleAvatarSelect" />
            <q-avatar size="132px" class="portfolio-hero-avatar" :style="{ background: form.profile_palette.primary || '#5865f2' }" text-color="white">
              <img v-if="avatarDisplayUrl" :src="avatarDisplayUrl" :alt="form.name || 'Profile photo'" />
              <span v-else>{{ form.name?.charAt(0) || 'K' }}</span>
            </q-avatar>
            <div class="portfolio-hero-photo__caption q-mt-sm">Profile image</div>
          </div>
          <div class="portfolio-hero-details">
            <div class="text-h5 text-weight-bold">{{ form.name || 'Your name' }}</div>
            <div class="text-body2 muted-text q-mt-xs">@{{ form.username || 'username' }} | {{ form.location || 'Location' }}</div>
            <div class="text-body2 q-mt-xs" style="color: var(--kdc-warning)">{{ form.availability || 'Availability status' }}</div>
            <div class="card-meta q-mt-sm">This image appears in the app navbar, live preview, developer directory, and your public portfolio.</div>

            <div class="portfolio-hero-upload q-mt-md">
              <div class="portfolio-hero-photo__actions">
                <q-btn flat no-caps color="secondary" icon="image" label="Choose image" @click="avatarInput?.click()" />
                <q-btn flat no-caps color="secondary" icon="crop" label="Crop image" :disable="!avatarFile" @click="openCropper(avatarFile)" />
                <q-btn color="primary" no-caps icon="upload" label="Update image" :loading="uploadingAvatar" :disable="!avatarFile" @click="uploadAvatar" />
                <q-btn flat no-caps color="secondary" label="Use image URL" @click="showAvatarUrlField = !showAvatarUrlField" />
                <q-btn v-if="avatarFile" flat no-caps color="grey-5" label="Clear" @click="clearSelectedAvatar" />
              </div>
              <div class="portfolio-file-state">
                <span class="portfolio-file-state__label">Selected file</span>
                <strong>{{ avatarFileName || 'No new image selected' }}</strong>
              </div>
              <div class="card-meta q-mt-sm">
                Cropping is optional. Choose an image first, then crop it only if you want to adjust the framing.
              </div>
            </div>

            <q-input v-if="showAvatarUrlField" v-model="form.avatar_url" outlined class="input-surface q-mt-md portfolio-hero-url" label="Profile image URL" />
            <div class="portfolio-hero-meta-row q-mt-md">
              <div class="portfolio-hero-note">
                <span class="portfolio-hero-note__label">Public page</span>
                <strong>/u/{{ form.username || 'username' }}</strong>
              </div>
              <div class="portfolio-hero-note">
                <span class="portfolio-hero-note__label">Profile completion</span>
                <strong>{{ portfolioCompletion }}%</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="portfolio-kpis q-mt-lg">
          <div class="inline-stat">
            <div class="card-meta">Portfolio plan</div>
            <div class="text-subtitle2 text-weight-bold q-mt-xs">{{ isPremium ? 'Premium' : 'Free' }}</div>
          </div>
          <div class="inline-stat">
            <div class="card-meta">Featured work</div>
            <div class="text-subtitle2 text-weight-bold q-mt-xs">{{ completedWorkCount }}</div>
          </div>
          <div class="inline-stat">
            <div class="card-meta">Skills</div>
            <div class="text-subtitle2 text-weight-bold q-mt-xs">{{ skillsCount }}</div>
          </div>
          <div class="inline-stat">
            <div class="card-meta">Status</div>
            <div class="text-subtitle2 text-weight-bold q-mt-xs">{{ portfolioCompletion >= 80 ? 'Ready to share' : 'Still in progress' }}</div>
          </div>
        </div>
      </div>

      <div class="portfolio-plan-panel">
        <div class="section-label khmer-copy">Portfolio Plan</div>
        <div class="text-subtitle1 text-weight-bold q-mt-sm">
          {{ isPremium ? 'Premium is active on this account' : 'Free plan with locked premium sections' }}
        </div>
        <div class="text-body2 muted-text q-mt-sm">
          {{ isPremium ? 'Case studies, testimonials, cover statement, and booking CTA are all available.' : 'Premium sections stay visibly locked until payment unlocks them.' }}
        </div>
        <div class="portfolio-plan-progress q-mt-md">
          <div class="portfolio-plan-progress__bar">
            <span :style="{ width: `${portfolioCompletion}%` }" />
          </div>
          <div class="card-meta">{{ portfolioCompletion }}% profile completion</div>
        </div>
        <q-chip square class="theme-chip q-mt-md" :class="isPremium ? 'theme-chip-warning' : 'theme-chip-secondary'">
          {{ isPremium ? 'Premium active' : 'Paid unlock required' }}
        </q-chip>
      </div>
    </section>

    <q-tabs v-model="activeEditorTab" dense no-caps inline-label class="feed-tabs q-mt-md portfolio-editor-tabs q-mb-lg">
          <q-tab name="profile" icon="person" label="Profile" />
          <q-tab name="projects" icon="workspaces" label="Projects" />
          <q-tab name="experience" icon="badge" label="Experience" />
          <q-tab name="social" icon="link" label="Social" />
          <q-tab name="settings" icon="tune" label="Settings" />
    </q-tabs>

    <div class="content-card q-pa-md q-mb-lg portfolio-editor-progress">
      <div class="portfolio-editor-progress__head">
        <div>
          <div class="section-label">Editor Progress</div>
          <div class="card-meta q-mt-xs">Move section by section instead of scrolling the full form at once.</div>
        </div>
        <q-chip square class="theme-chip theme-chip-primary">{{ portfolioCompletion }}% complete</q-chip>
      </div>
      <div class="portfolio-editor-progress__grid q-mt-md">
        <div v-for="item in sectionProgress" :key="item.key" class="utility-card portfolio-progress-card">
          <div class="mini-card-title">{{ item.label }}</div>
          <div class="card-meta">{{ item.complete ? 'Ready' : 'Needs work' }}</div>
        </div>
      </div>
    </div>

    <div class="portfolio-editor-grid">
      <section class="editor-column">
        <div v-show="activeEditorTab === 'profile'" id="identity" class="content-card q-pa-lg editor-section-card">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Identity</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">Basic profile details</div>
            </div>
          </div>

          <div class="form-grid q-mt-md">
            <q-input v-model="form.name" outlined class="input-surface" label="Name" />
            <q-input v-model="form.username" outlined class="input-surface" label="Username" />
            <q-input v-model="form.location" outlined class="input-surface" label="Location" />
            <q-input v-model="form.company" outlined class="input-surface" label="Company" />
          </div>
        </div>

        <div v-show="activeEditorTab === 'profile'" id="positioning" class="content-card q-pa-lg editor-section-card">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Positioning</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">How you present your work</div>
            </div>
          </div>

          <div class="q-mt-md q-gutter-md">
            <q-input v-model="form.headline" outlined class="input-surface" label="Short headline" />
            <q-input v-model="form.portfolio_headline" outlined class="input-surface" label="Portfolio headline" />
            <q-input v-model="form.portfolio_summary" outlined type="textarea" class="input-surface" label="Portfolio summary" />
            <q-input v-model="form.availability" outlined class="input-surface" label="Availability" />
            <q-input v-model="skillsText" outlined class="input-surface" label="Skills (comma separated)" />
          </div>
        </div>

        <div v-show="activeEditorTab === 'social'" id="links" class="content-card q-pa-lg editor-section-card">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Links & Palette</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">Profile links and visual accents</div>
            </div>
          </div>

          <div class="form-grid q-mt-md">
            <q-input v-model="form.social_links.github" outlined class="input-surface" label="GitHub URL" />
            <q-input v-model="form.social_links.linkedin" outlined class="input-surface" label="LinkedIn URL" />
            <q-input v-model="form.social_links.portfolio" outlined class="input-surface" label="Portfolio URL" />
            <q-input v-model="form.social_links.x" outlined class="input-surface" label="X URL" />
          </div>

          <div class="palette-grid q-mt-md">
            <div class="tone-swatch">
              <span class="tone-chip" :style="{ background: form.profile_palette.primary }" />
              <q-input v-model="form.profile_palette.primary" outlined class="input-surface" label="Primary" />
            </div>
            <div class="tone-swatch">
              <span class="tone-chip" :style="{ background: form.profile_palette.secondary }" />
              <q-input v-model="form.profile_palette.secondary" outlined class="input-surface" label="Secondary" />
            </div>
            <div class="tone-swatch">
              <span class="tone-chip" :style="{ background: form.profile_palette.surface }" />
              <q-input v-model="form.profile_palette.surface" outlined class="input-surface" label="Surface" />
            </div>
          </div>
        </div>

        <div v-show="activeEditorTab === 'projects'" id="work" class="content-card q-pa-lg editor-section-card">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Featured Work</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">Show what best represents you</div>
            </div>
            <q-btn flat no-caps color="primary" icon="add" label="Add item" @click="addWork" />
          </div>

          <div class="work-list-grid q-mt-md">
            <div v-for="(work, index) in form.featured_work" :key="index" class="stack-card q-pa-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Work #{{ index + 1 }}</div>
                <q-btn flat round dense color="negative" icon="delete" @click="removeWork(index)" />
              </div>
              <div class="q-gutter-sm">
                <q-input v-model="work.title" outlined class="input-surface" label="Title" />
                <q-input v-model="work.stack" outlined class="input-surface" label="Stack" />
                <q-input v-model="work.link" outlined class="input-surface" label="Link" />
                <q-input v-model="work.description" outlined type="textarea" class="input-surface" label="Description" />
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeEditorTab === 'experience'" id="experience" class="content-card q-pa-lg editor-section-card">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Work Experience</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">Show the roles that shaped your craft</div>
            </div>
            <q-btn flat no-caps color="primary" icon="add" label="Add role" @click="addExperience" />
          </div>

          <div class="work-list-grid q-mt-md">
            <div v-for="(item, index) in form.work_experience" :key="index" class="stack-card q-pa-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Role #{{ index + 1 }}</div>
                <q-btn flat round dense color="negative" icon="delete" @click="removeExperience(index)" />
              </div>
              <div class="form-grid">
                <q-input v-model="item.role" outlined class="input-surface" label="Role" />
                <q-input v-model="item.company" outlined class="input-surface" label="Company" />
                <q-input v-model="item.period" outlined class="input-surface" label="Period" />
                <q-input v-model="item.location" outlined class="input-surface" label="Location" />
                <q-input v-model="item.type" outlined class="input-surface" label="Type" />
              </div>
              <q-input v-model="item.summary" outlined type="textarea" class="input-surface q-mt-sm" label="Summary" />
            </div>
          </div>
        </div>

        <div v-show="activeEditorTab === 'experience'" id="education" class="content-card q-pa-lg editor-section-card">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Education</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">Academic background and learning path</div>
            </div>
            <q-btn flat no-caps color="primary" icon="add" label="Add education" @click="addEducation" />
          </div>

          <div class="work-list-grid q-mt-md">
            <div v-for="(item, index) in form.education_history" :key="index" class="stack-card q-pa-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Education #{{ index + 1 }}</div>
                <q-btn flat round dense color="negative" icon="delete" @click="removeEducation(index)" />
              </div>
              <div class="form-grid">
                <q-input v-model="item.school" outlined class="input-surface" label="School" />
                <q-input v-model="item.degree" outlined class="input-surface" label="Degree" />
                <q-input v-model="item.field" outlined class="input-surface" label="Field" />
                <q-input v-model="item.period" outlined class="input-surface" label="Period" />
              </div>
              <q-input v-model="item.summary" outlined type="textarea" class="input-surface q-mt-sm" label="Summary" />
            </div>
          </div>
        </div>

        <div v-show="activeEditorTab === 'experience'" id="credentials" class="content-card q-pa-lg editor-section-card">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Certifications & Achievements</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">Public proof that builds trust</div>
            </div>
          </div>

          <div class="editor-subsection q-mt-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-weight-bold">Certifications</div>
              <q-btn flat no-caps color="primary" icon="add" label="Add certification" @click="addCertification" />
            </div>
            <div class="work-list-grid">
              <div v-for="(item, index) in form.certifications" :key="`cert-${index}`" class="stack-card q-pa-md">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-subtitle2 text-weight-bold">Certification #{{ index + 1 }}</div>
                  <q-btn flat round dense color="negative" icon="delete" @click="removeCertification(index)" />
                </div>
                <div class="form-grid">
                  <q-input v-model="item.name" outlined class="input-surface" label="Name" />
                  <q-input v-model="item.issuer" outlined class="input-surface" label="Issuer" />
                  <q-input v-model="item.issued_at" outlined class="input-surface" label="Issued at" />
                  <q-input v-model="item.credential_url" outlined class="input-surface" label="Credential URL" />
                </div>
              </div>
            </div>
          </div>

          <div class="editor-subsection q-mt-lg">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-weight-bold">Achievements</div>
              <q-btn flat no-caps color="primary" icon="add" label="Add achievement" @click="addAchievement" />
            </div>
            <div class="work-list-grid">
              <div v-for="(item, index) in form.achievements" :key="`achievement-${index}`" class="stack-card q-pa-md">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-subtitle2 text-weight-bold">Achievement #{{ index + 1 }}</div>
                  <q-btn flat round dense color="negative" icon="delete" @click="removeAchievement(index)" />
                </div>
                <div class="form-grid">
                  <q-input v-model="item.title" outlined class="input-surface" label="Title" />
                  <q-input v-model="item.issuer" outlined class="input-surface" label="Issuer" />
                  <q-input v-model="item.year" outlined class="input-surface" label="Year" />
                </div>
                <q-input v-model="item.summary" outlined type="textarea" class="input-surface q-mt-sm" label="Summary" />
              </div>
            </div>
          </div>
        </div>

        <div v-show="activeEditorTab === 'settings'" id="premium" class="content-card q-pa-lg editor-section-card premium-section" :class="{ 'is-locked': !isPremium }">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Premium Case Studies</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">Add deeper proof-of-work</div>
            </div>
            <q-chip square class="theme-chip theme-chip-warning">Premium</q-chip>
          </div>

          <div v-if="isPremium" class="work-list-grid q-mt-md">
            <div v-for="(study, index) in form.portfolio_case_studies" :key="index" class="stack-card q-pa-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Case Study #{{ index + 1 }}</div>
                <q-btn flat round dense color="negative" icon="delete" @click="removeCaseStudy(index)" />
              </div>
              <div class="q-gutter-sm">
                <q-input v-model="study.title" outlined class="input-surface" label="Title" />
                <q-input v-model="study.impact" outlined class="input-surface" label="Impact" />
                <q-input v-model="study.link" outlined class="input-surface" label="Link" />
                <q-input v-model="study.summary" outlined type="textarea" class="input-surface" label="Summary" />
              </div>
            </div>
            <q-btn flat no-caps color="primary" icon="add" label="Add case study" @click="addCaseStudy" />
          </div>
          <div v-else class="locked-overlay q-mt-md">
            <div class="mini-card-title">Locked on the free plan</div>
            <div class="mini-card-copy q-mt-xs">Case studies only appear after premium unlock so paid portfolios feel materially stronger.</div>
          </div>
        </div>

        <div v-show="activeEditorTab === 'settings'" class="content-card q-pa-lg editor-section-card premium-section" :class="{ 'is-locked': !isPremium }">
          <div class="editor-section-head">
            <div>
              <div class="section-label khmer-copy">Premium Trust Signals</div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm">Booking and testimonials</div>
            </div>
            <q-chip square class="theme-chip theme-chip-warning">Premium</q-chip>
          </div>

          <div v-if="isPremium" class="q-mt-md q-gutter-md">
            <q-input v-model="form.portfolio_cover" outlined class="input-surface" label="Cover statement" />
            <q-input v-model="form.portfolio_booking_url" outlined class="input-surface" label="Booking URL" />
            <div class="work-list-grid">
              <div v-for="(testimonial, index) in form.portfolio_testimonials" :key="index" class="stack-card q-pa-md">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-subtitle2 text-weight-bold">Testimonial #{{ index + 1 }}</div>
                  <q-btn flat round dense color="negative" icon="delete" @click="removeTestimonial(index)" />
                </div>
                <div class="q-gutter-sm">
                  <q-input v-model="testimonial.name" outlined class="input-surface" label="Name" />
                  <q-input v-model="testimonial.role" outlined class="input-surface" label="Role" />
                  <q-input v-model="testimonial.quote" outlined type="textarea" class="input-surface" label="Quote" />
                </div>
              </div>
            </div>
            <q-btn flat no-caps color="primary" icon="add" label="Add testimonial" @click="addTestimonial" />
          </div>
          <div v-else class="locked-overlay q-mt-md">
            <div class="mini-card-title">Premium trust layer locked</div>
            <div class="mini-card-copy q-mt-xs">Testimonials and direct booking stay hidden on free accounts.</div>
          </div>
        </div>
      </section>

      <aside class="preview-column">
        <div class="content-card q-pa-lg preview-board">
          <div class="preview-board__head">
            <div>
              <div class="section-label khmer-copy">Live Preview</div>
              <div class="card-meta q-mt-xs">How your public portfolio reads right now.</div>
            </div>
            <q-btn flat dense no-caps color="secondary" icon="open_in_new" label="Open" :to="`/u/${form.username || user?.username || 'username'}`" />
          </div>
          <div class="preview-cover q-mt-md" :style="{ background: previewGradient }" />

          <div class="row items-center q-col-gutter-md q-mt-md">
            <div class="col-auto">
              <q-avatar size="84px" :style="{ background: form.profile_palette.primary || '#5865f2' }" text-color="white">
                <img v-if="avatarDisplayUrl" :src="avatarDisplayUrl" :alt="form.name || 'Profile photo'" />
                <span v-else>{{ form.name?.charAt(0) || 'K' }}</span>
              </q-avatar>
            </div>
            <div class="col">
              <div class="text-subtitle1 text-weight-bold">{{ form.name || 'Your name' }}</div>
              <div class="card-meta q-mt-xs">@{{ form.username || 'username' }}</div>
              <div class="card-meta q-mt-xs">{{ form.location || 'Location' }}</div>
            </div>
          </div>

          <div v-if="form.portfolio_cover && isPremium" class="portfolio-coverline q-mt-md">{{ form.portfolio_cover }}</div>
          <div class="text-subtitle1 text-weight-bold q-mt-md">{{ form.portfolio_headline || form.headline || 'Add your portfolio headline' }}</div>
          <div class="mini-card-copy q-mt-sm">{{ form.portfolio_summary || 'Add a short summary so the portfolio immediately explains who you are and what you build.' }}</div>

          <div class="preview-chip-row q-mt-md">
            <q-chip v-for="skill in previewSkills" :key="skill" square class="theme-chip theme-chip-success">{{ skill }}</q-chip>
            <q-chip v-if="!previewSkills.length" square class="theme-chip">No skills yet</q-chip>
          </div>

          <div class="preview-meta-list q-mt-md">
            <div class="feature-row">
              <span>Availability</span>
              <strong>{{ form.availability || 'Set your status' }}</strong>
            </div>
            <div class="feature-row">
              <span>Plan</span>
              <strong>{{ isPremium ? 'Premium portfolio' : 'Free portfolio' }}</strong>
            </div>
            <div class="feature-row">
              <span>Work items</span>
              <strong>{{ form.featured_work.filter((item) => item.title?.trim()).length }}</strong>
            </div>
          </div>

          <div class="preview-tip q-mt-md">
            Changes here do not go public until you save.
          </div>
        </div>
      </aside>
    </div>

    <q-dialog v-model="cropDialog" persistent>
      <q-card class="theme-dialog portfolio-crop-dialog">
        <q-card-section>
          <div class="section-label khmer-copy">Crop Profile Image</div>
          <div class="text-h6 text-weight-bold q-mt-sm">Position your photo inside the square frame</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div
            ref="cropArea"
            class="portfolio-crop-area"
            @pointerdown="startCropDrag"
            @pointermove="onCropDrag"
            @pointerup="endCropDrag"
            @pointerleave="endCropDrag"
            @pointercancel="endCropDrag"
            @wheel.prevent="onCropWheel"
          >
            <img
              v-if="cropSourceUrl"
              class="portfolio-crop-image"
              :src="cropSourceUrl"
              :style="cropImageStyle"
              alt="Crop preview"
              draggable="false"
            />
            <div class="portfolio-crop-frame" />
          </div>
          <div class="portfolio-crop-toolbar">
            <q-btn flat no-caps color="secondary" icon="fit_screen" label="Fit image" @click="setCropFit" />
            <q-btn flat no-caps color="secondary" icon="crop_free" label="Fill frame" @click="setCropFill" />
            <q-btn flat no-caps color="secondary" icon="restart_alt" label="Reset" @click="resetCropPosition" />
          </div>
          <q-slider v-model="cropScale" :min="1" :max="3" :step="0.01" color="primary" label label-always />
          <div class="card-meta">The preview keeps the image's original proportions. Drag to reposition, use the wheel or slider to zoom, and use Fill frame if you want a tighter crop.</div>
          <div v-if="cropNeedsFill" class="preview-tip">
            Parts of the frame are still uncovered. Increase zoom or use <strong>Fill frame</strong> before applying the crop.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps color="secondary" label="Cancel" @click="cancelCrop" />
          <q-btn color="primary" no-caps label="Apply crop" @click="applyCrop" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useSessionStore } from 'src/stores/session-store'

const $q = useQuasar()
const session = useSessionStore()
const user = computed(() => session.user)
const avatarInput = ref(null)
const cropArea = ref(null)
const saving = ref(false)
const uploadingAvatar = ref(false)
const activeEditorTab = ref('profile')
const avatarFile = ref(null)
const cropDialog = ref(false)
const cropSourceUrl = ref('')
const localAvatarPreviewUrl = ref('')
const showAvatarUrlField = ref(false)
const maxAvatarBytes = 8 * 1024 * 1024
const cropScale = ref(1)
const cropOffsetX = ref(0)
const cropOffsetY = ref(0)
const cropImage = ref(null)
const cropDrag = reactive({
  active: false,
  startX: 0,
  startY: 0,
  startOffsetX: 0,
  startOffsetY: 0,
})
const skillsText = ref('')
const skillsCount = computed(() => skillsText.value.split(',').map((skill) => skill.trim()).filter(Boolean).length)
const completedWorkCount = computed(() => form.featured_work.filter((item) => item.title?.trim()).length)
const previewSkills = computed(() => skillsText.value.split(',').map((skill) => skill.trim()).filter(Boolean).slice(0, 6))
const avatarFileName = computed(() => (avatarFile.value ? avatarFile.value.name : ''))
const avatarDisplayUrl = computed(() => localAvatarPreviewUrl.value || form.avatar_url)
const previewGradient = computed(
  () => `linear-gradient(135deg, ${form.profile_palette.primary || '#5865f2'}, ${form.profile_palette.secondary || '#3b82f6'})`,
)
const cropBaseDimensions = computed(() => {
  const containerSize = cropArea.value?.clientWidth || 320
  const image = cropImage.value

  if (!image?.width || !image?.height) {
    return {
      width: containerSize,
      height: containerSize,
      scale: 1,
    }
  }

  const baseScale = Math.min(containerSize / image.width, containerSize / image.height)

  return {
    width: image.width * baseScale,
    height: image.height * baseScale,
    scale: baseScale,
  }
})
const cropCoverScale = computed(() => {
  const containerSize = cropArea.value?.clientWidth || 320
  const { width, height } = cropBaseDimensions.value

  if (!width || !height) {
    return 1
  }

  return Math.max(containerSize / width, containerSize / height, 1)
})
const cropRenderedDimensions = computed(() => ({
  width: cropBaseDimensions.value.width * cropScale.value,
  height: cropBaseDimensions.value.height * cropScale.value,
}))
const cropNeedsFill = computed(() => {
  const containerSize = cropArea.value?.clientWidth || 320

  return cropRenderedDimensions.value.width < containerSize || cropRenderedDimensions.value.height < containerSize
})
const cropImageStyle = computed(() => ({
  width: `${cropBaseDimensions.value.width}px`,
  height: `${cropBaseDimensions.value.height}px`,
  transform: `translate(calc(-50% + ${cropOffsetX.value}px), calc(-50% + ${cropOffsetY.value}px)) scale(${cropScale.value})`,
}))
const portfolioCompletion = computed(() => {
  const checks = [
    form.name,
    form.username,
    form.location,
    form.headline,
    form.portfolio_headline,
    form.portfolio_summary,
    form.availability,
    form.avatar_url,
    skillsCount.value > 0,
    completedWorkCount.value > 0,
    form.social_links.github || form.social_links.linkedin || form.social_links.portfolio || form.social_links.x,
  ]
  const complete = checks.filter(Boolean).length

  return Math.round((complete / checks.length) * 100)
})

const sectionProgress = computed(() => [
  { key: 'profile', label: 'Profile', complete: Boolean(form.name && form.username && form.headline) },
  { key: 'projects', label: 'Projects', complete: completedWorkCount.value > 0 },
  { key: 'experience', label: 'Experience', complete: Boolean(form.work_experience.some((item) => item.role?.trim()) || form.education_history.some((item) => item.school?.trim())) },
  { key: 'social', label: 'Social', complete: Boolean(form.social_links.github || form.social_links.linkedin || form.social_links.portfolio || form.social_links.x) },
  { key: 'settings', label: 'Settings', complete: Boolean(form.portfolio_plan) },
])

const activeEditorLabel = computed(() => sectionProgress.value.find((item) => item.key === activeEditorTab.value)?.label || 'Profile')

const form = reactive({
  name: '',
  username: '',
  headline: '',
  portfolio_headline: '',
  portfolio_summary: '',
  portfolio_plan: 'free',
  portfolio_cover: '',
  portfolio_booking_url: '',
  avatar_url: '',
  location: '',
  company: '',
  availability: '',
  social_links: {
    github: '',
    linkedin: '',
    portfolio: '',
    x: '',
  },
  featured_work: [],
  work_experience: [],
  education_history: [],
  certifications: [],
  achievements: [],
  portfolio_case_studies: [],
  portfolio_testimonials: [],
  profile_palette: {
    primary: '#5865f2',
    secondary: '#3b82f6',
    surface: '#161b22',
  },
})

const isPremium = computed(() => form.portfolio_plan === 'premium')

watch(
  user,
  (currentUser) => {
    if (!currentUser) return

    form.name = currentUser.name || ''
    form.username = currentUser.username || ''
    form.headline = currentUser.headline || ''
    form.portfolio_headline = currentUser.portfolio_headline || ''
    form.portfolio_summary = currentUser.portfolio_summary || ''
    form.portfolio_plan = currentUser.portfolio_plan || 'free'
    form.portfolio_cover = currentUser.portfolio_cover || ''
    form.portfolio_booking_url = currentUser.portfolio_booking_url || ''
    form.avatar_url = currentUser.avatar_url || ''
    form.location = currentUser.location || ''
    form.company = currentUser.company || ''
    form.availability = currentUser.availability || ''
    form.social_links = {
      github: currentUser.social_links?.github || '',
      linkedin: currentUser.social_links?.linkedin || '',
      portfolio: currentUser.social_links?.portfolio || '',
      x: currentUser.social_links?.x || '',
    }
    form.featured_work = (currentUser.featured_work || []).length
      ? currentUser.featured_work.map((work) => ({ ...work }))
      : [{ title: '', description: '', stack: '', link: '' }]
    form.work_experience = (currentUser.work_experience || []).length
      ? currentUser.work_experience.map((item) => ({ ...item }))
      : [{ role: '', company: '', period: '', location: '', type: '', summary: '' }]
    form.education_history = (currentUser.education_history || []).length
      ? currentUser.education_history.map((item) => ({ ...item }))
      : [{ school: '', degree: '', field: '', period: '', summary: '' }]
    form.certifications = (currentUser.certifications || []).map((item) => ({ ...item }))
    form.achievements = (currentUser.achievements || []).map((item) => ({ ...item }))
    form.portfolio_case_studies = (currentUser.portfolio_case_studies || []).map((study) => ({ ...study }))
    form.portfolio_testimonials = (currentUser.portfolio_testimonials || []).map((testimonial) => ({ ...testimonial }))
    form.profile_palette = {
      primary: currentUser.profile_palette?.primary || '#5865f2',
      secondary: currentUser.profile_palette?.secondary || '#3b82f6',
      surface: currentUser.profile_palette?.surface || '#161b22',
    }
    skillsText.value = (currentUser.skills || []).join(', ')
  },
  { immediate: true },
)

watch(cropScale, () => {
  clampCropOffsets()
})

function addWork() {
  form.featured_work.push({ title: '', description: '', stack: '', link: '' })
}

function removeWork(index) {
  form.featured_work.splice(index, 1)
  if (form.featured_work.length === 0) {
    addWork()
  }
}

function addCaseStudy() {
  form.portfolio_case_studies.push({ title: '', summary: '', impact: '', link: '' })
}

function removeCaseStudy(index) {
  form.portfolio_case_studies.splice(index, 1)
}

function addExperience() {
  form.work_experience.push({ role: '', company: '', period: '', location: '', type: '', summary: '' })
}

function removeExperience(index) {
  form.work_experience.splice(index, 1)
  if (form.work_experience.length === 0) {
    addExperience()
  }
}

function addEducation() {
  form.education_history.push({ school: '', degree: '', field: '', period: '', summary: '' })
}

function removeEducation(index) {
  form.education_history.splice(index, 1)
  if (form.education_history.length === 0) {
    addEducation()
  }
}

function addCertification() {
  form.certifications.push({ name: '', issuer: '', issued_at: '', credential_url: '' })
}

function removeCertification(index) {
  form.certifications.splice(index, 1)
}

function addAchievement() {
  form.achievements.push({ title: '', issuer: '', year: '', summary: '' })
}

function removeAchievement(index) {
  form.achievements.splice(index, 1)
}

function addTestimonial() {
  form.portfolio_testimonials.push({ name: '', role: '', quote: '' })
}

function removeTestimonial(index) {
  form.portfolio_testimonials.splice(index, 1)
}

function handleAvatarSelect(event) {
  const [file] = event.target.files || []

  if (file && file.size > maxAvatarBytes) {
    avatarFile.value = null

    if (avatarInput.value) {
      avatarInput.value.value = ''
    }

    $q.notify({ type: 'negative', message: 'Profile image must be 8 MB or smaller' })
    return
  }

  if (!file) {
    avatarFile.value = null
    return
  }

  avatarFile.value = file
  setLocalAvatarPreview(URL.createObjectURL(file))
}

function clearSelectedAvatar() {
  avatarFile.value = null
  resetLocalAvatarPreview()
  resetCropper()

  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

async function saveProfile() {
  saving.value = true

  try {
    await session.updateProfile({
      ...form,
      skills: skillsText.value.split(',').map((skill) => skill.trim()).filter(Boolean),
      featured_work: form.featured_work.filter((work) => work.title?.trim()),
      work_experience: form.work_experience.filter((item) => item.role?.trim() && item.company?.trim()),
      education_history: form.education_history.filter((item) => item.school?.trim()),
      certifications: form.certifications.filter((item) => item.name?.trim()),
      achievements: form.achievements.filter((item) => item.title?.trim()),
      portfolio_case_studies: form.portfolio_case_studies.filter((study) => study.title?.trim()),
      portfolio_testimonials: form.portfolio_testimonials.filter((testimonial) => testimonial.name?.trim()),
    })
    $q.notify({ type: 'positive', message: 'Portfolio updated' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to save profile' })
  } finally {
    saving.value = false
  }
}

async function copyPublicUrl() {
  const url = `${window.location.origin}/#/u/${form.username || user.value?.username || 'username'}`

  try {
    await navigator.clipboard.writeText(url)
    $q.notify({ type: 'positive', message: 'Public URL copied' })
  } catch {
    $q.notify({ type: 'negative', message: 'Could not copy public URL' })
  }
}

async function uploadAvatar() {
  if (!avatarFile.value) {
    return
  }

  uploadingAvatar.value = true

  try {
    const file = Array.isArray(avatarFile.value) ? avatarFile.value[0] : avatarFile.value
    const data = await session.updateAvatar(file)
    form.avatar_url = data.avatar_url || ''
    clearSelectedAvatar()
    $q.notify({ type: 'positive', message: 'Profile image updated' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to upload image' })
  } finally {
    uploadingAvatar.value = false
  }
}

function openCropper(file) {
  resetCropper()
  cropImage.value = null
  cropSourceUrl.value = URL.createObjectURL(file)
  const image = new Image()

  image.onload = () => {
    cropImage.value = image
    cropScale.value = 1
    cropOffsetX.value = 0
    cropOffsetY.value = 0
    cropDialog.value = true
  }

  image.src = cropSourceUrl.value
}

function cancelCrop() {
  resetCropper()
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

function startCropDrag(event) {
  if (!cropSourceUrl.value) {
    return
  }

  cropDrag.active = true
  cropDrag.startX = event.clientX
  cropDrag.startY = event.clientY
  cropDrag.startOffsetX = cropOffsetX.value
  cropDrag.startOffsetY = cropOffsetY.value
  cropArea.value?.setPointerCapture?.(event.pointerId)
}

function onCropDrag(event) {
  if (!cropDrag.active) {
    return
  }

  cropOffsetX.value = cropDrag.startOffsetX + (event.clientX - cropDrag.startX)
  cropOffsetY.value = cropDrag.startOffsetY + (event.clientY - cropDrag.startY)
  clampCropOffsets()
}

function endCropDrag(event) {
  cropDrag.active = false
  cropArea.value?.releasePointerCapture?.(event.pointerId)
}

function onCropWheel(event) {
  if (!cropImage.value) {
    return
  }

  const delta = event.deltaY < 0 ? 0.08 : -0.08
  cropScale.value = Math.min(3, Math.max(1, Number((cropScale.value + delta).toFixed(2))))
  clampCropOffsets()
}

function setCropFit() {
  cropScale.value = 1
  clampCropOffsets()
}

function setCropFill() {
  cropScale.value = Number(cropCoverScale.value.toFixed(2))
  clampCropOffsets()
}

function resetCropPosition() {
  cropOffsetX.value = 0
  cropOffsetY.value = 0
  clampCropOffsets()
}

function clampCropOffsets() {
  if (!cropArea.value) {
    return
  }

  const containerSize = cropArea.value.clientWidth
  const maxOffsetX = Math.max(0, (cropRenderedDimensions.value.width - containerSize) / 2)
  const maxOffsetY = Math.max(0, (cropRenderedDimensions.value.height - containerSize) / 2)

  cropOffsetX.value = Math.min(maxOffsetX, Math.max(-maxOffsetX, cropOffsetX.value))
  cropOffsetY.value = Math.min(maxOffsetY, Math.max(-maxOffsetY, cropOffsetY.value))
}

async function applyCrop() {
  if (!cropImage.value) {
    return
  }

  const cropSize = 512
  const canvas = document.createElement('canvas')
  canvas.width = cropSize
  canvas.height = cropSize
  const context = canvas.getContext('2d')

  if (!context || !cropArea.value) {
    return
  }

  const containerSize = cropArea.value.clientWidth
  const image = cropImage.value
  const baseScale = cropBaseDimensions.value.scale
  const actualScale = baseScale * cropScale.value
  const drawWidth = image.width * actualScale
  const drawHeight = image.height * actualScale
  const drawX = (containerSize - drawWidth) / 2 + cropOffsetX.value
  const drawY = (containerSize - drawHeight) / 2 + cropOffsetY.value
  const ratio = cropSize / containerSize

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    image,
    drawX * ratio,
    drawY * ratio,
    drawWidth * ratio,
    drawHeight * ratio,
  )

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))

  if (!blob) {
    $q.notify({ type: 'negative', message: 'Failed to crop image' })
    return
  }

  avatarFile.value = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' })
  setLocalAvatarPreview(URL.createObjectURL(blob))
  resetCropper()
  cropDialog.value = false
}

function setLocalAvatarPreview(url) {
  if (localAvatarPreviewUrl.value) {
    URL.revokeObjectURL(localAvatarPreviewUrl.value)
  }

  localAvatarPreviewUrl.value = url
}

function resetLocalAvatarPreview() {
  if (localAvatarPreviewUrl.value) {
    URL.revokeObjectURL(localAvatarPreviewUrl.value)
  }

  localAvatarPreviewUrl.value = ''
}

function resetCropper() {
  cropDialog.value = false
  cropScale.value = 1
  cropOffsetX.value = 0
  cropOffsetY.value = 0
  cropDrag.active = false
  cropImage.value = null

  if (cropSourceUrl.value) {
    URL.revokeObjectURL(cropSourceUrl.value)
  }

  cropSourceUrl.value = ''
}

onBeforeUnmount(() => {
  resetCropper()
  resetLocalAvatarPreview()
})
</script>
