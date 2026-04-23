<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/utils/api";
import axios from "axios";
import { applyTheme } from "@/utils/theme";

const router = useRouter();

// Tabs State
const activeTab = ref("profile");

const switchTab = (tab: string) => {
  activeTab.value = tab;
  if (tab === "messages") {
    fetchMessages();
  }
};

// Toast Logic
const toast = reactive({
  show: false,
  message: "",
});
let toastTimer: ReturnType<typeof setTimeout>;

const showToast = (msg: string) => {
  clearTimeout(toastTimer);
  toast.message = msg;
  toast.show = true;
  toastTimer = setTimeout(() => {
    toast.show = false;
  }, 3000);
};

const isSavingProfile = ref(false);
const avatarPreview = ref(
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80",
);
const profile = reactive({
  fullName: "",
  username: "",
  email: "",
  shortBio: "",
  avatarUrl: "",
});

const fetchProfile = async () => {
  try {
    const { data } = await api.get("/profile");
    profile.fullName = data.fullName || "";
    profile.username = data.username || "";
    profile.email = data.email || "";
    profile.shortBio = data.shortBio || "";
    profile.avatarUrl = data.avatarUrl || "";
    if (data.avatarUrl) {
      avatarPreview.value = data.avatarUrl;
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    showToast("Error loading profile data");
  }
};

const saveProfile = async () => {
  isSavingProfile.value = true;
  try {
    const payload = {
      ...profile,
      // If avatarPreview is a base64 string, it means it's a new upload
      avatarUrl: avatarPreview.value.startsWith("data:image/")
        ? avatarPreview.value
        : profile.avatarUrl,
    };

    const { data } = await api.put("/profile", payload);
    profile.avatarUrl = data.avatarUrl;
    showToast("Profile updated successfully!");
  } catch (error) {
    console.error("Failed to update profile:", error);
    showToast("Error saving profile changes");
  } finally {
    isSavingProfile.value = false;
  }
};

onMounted(() => {
  fetchProfile();
  const saved = localStorage.getItem('publicAppearance');
  if (saved) {
    Object.assign(appearance, JSON.parse(saved));
    applyColorsToDOM();
  }
});

const handleAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (r) => {
      avatarPreview.value = r.target?.result as string;
    };
    reader.readAsDataURL(file);
    showToast("Avatar selected! Click Save Profile to apply.");
  }
};

const isChangingPassword = ref(false);
const security = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const showPasswords = reactive({
  current: false,
  new: false,
});

const handleChangePassword = async () => {
  if (security.newPassword.length < 8) {
    showToast("New password must be at least 8 characters");
    return;
  }

  isChangingPassword.value = true;
  try {
    await api.patch("/change-password", {
      currentPassword: security.currentPassword,
      newPassword: security.newPassword,
    });
    showToast("Password updated successfully!");
    // Reset form
    security.currentPassword = "";
    security.newPassword = "";
    security.confirmPassword = "";
    passwordStrength.value = 0;
  } catch (error: any) {
    console.error("Failed to change password:", error);
    showToast(error.response?.data?.error || "Error updating password");
  } finally {
    isChangingPassword.value = false;
  }
};
const passwordStrength = ref(0);
const strengthLabel = computed(() => {
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return labels[passwordStrength.value];
});

const checkStrength = (val: string) => {
  let score = 0;
  if (!val) {
    passwordStrength.value = 0;
    return;
  }
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  passwordStrength.value = score;
};


// Appearance State
const appearance = reactive({
  bg: '#eeeeee',
  bgCard: '#ffffff',
  border: '#d0d0d0',
  text: '#222831',
  textMuted: '#555e6a',
  accent: '#00adb5',
});

const applyAppearance = () => {
  localStorage.setItem('publicAppearance', JSON.stringify(appearance));
  applyTheme(appearance);
  showToast('Appearance saved!');
};

const applyColorsToDOM = () => {
  applyTheme(appearance);
};

// Danger Zone State
const deleteConfirmText = ref("");
const isDeleteModalOpen = ref(false);

const confirmDelete = () => {
  if (deleteConfirmText.value !== "DELETE") {
    showToast('Please type "DELETE" exactly to confirm.');
    return;
  }
  isDeleteModalOpen.value = true;
};

// Messages State
const messages = ref<any[]>([]);
const isLoadingMessages = ref(false);
const selectedMessage = ref<any>(null);

const fetchMessages = async () => {
  try {
    isLoadingMessages.value = true;
    const workerUrl =
      import.meta.env.VITE_API_BASE_WORKER || "http://localhost:9992";
    const response = await axios.get(
      `${workerUrl}/api/worker/contact/messages`,
    );
    messages.value = response.data;
  } catch (err) {
    showToast("Failed to load messages.");
  } finally {
    isLoadingMessages.value = false;
  }
};

const openMessage = (msg: any) => {
  selectedMessage.value = msg;
};

const closeMessage = () => {
  selectedMessage.value = null;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <main class="page-content">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--p-light)">
          Settings
        </h1>
        <p
          style="
            font-size: 0.8rem;
            color: var(--text-muted);
            font-family: JetBrains Monospace;
          "
        >
          Manage your account preferences and system configuration.
        </p>
      </div>

      <!-- ── Tabs ── -->
      <div
        style="
          display: flex;
          gap: 4px;
          background: var(--p-surface);
          border: 1px solid var(--p-card-border);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
          overflow-x: auto;
        "
      >
        <button
          v-for="tab in [
            'profile',
            'messages',
            'security',
            'appearance',
            'danger',
          ]"
          :key="tab"
          @click="switchTab(tab)"
          :style="{
            background:
              activeTab === tab ? 'rgba(74, 112, 169, 0.15)' : 'transparent',
            color:
              activeTab === tab
                ? 'var(--p-accent)'
                : tab === 'danger'
                  ? '#f87171'
                  : 'var(--text-muted)',
            border:
              activeTab === tab
                ? '1px solid rgba(74, 112, 169, 0.2)'
                : '1px solid transparent',
          }"
          class="flex-1 min-w-max text-[11px] font-mono py-2.5 px-4 rounded-lg transition-all capitalize font-medium"
        >
          {{
            tab === 'appearance'
              ? 'Appearance'
              : tab === "messages"
                ? "Messages"
                : tab
          }}
        </button>
      </div>

      <!-- ══ TAB: PROFILE ══ -->
      <div v-show="activeTab === 'profile'" class="tab-section animate-fade-up">
        <div class="card p-6">
          <h2
            style="
              font-size: 1rem;
              font-weight: 600;
              color: var(--p-light);
              margin-bottom: 4px;
            "
          >
            Update Profile
          </h2>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 24px">
            Your public-facing information on the portfolio.
          </p>

          <div class="flex items-start gap-5 mb-8">
            <div class="relative flex-shrink-0">
              <img
                :src="avatarPreview"
                alt="Avatar"
                class="w-20 h-20 rounded-xl object-cover border border-sky-700/60"
              />
            </div>
            <div class="flex-1">
              <label
                class="upload-zone flex flex-col items-center justify-center cursor-pointer gap-2 text-center"
                for="avatarInput"
              >
                <svg
                  style="color: var(--p-accent); opacity: 0.5"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  />
                </svg>
                <p style="font-size: 0.7rem; color: var(--text-muted)">
                  Click to upload or drag &amp; drop
                </p>
                <p
                  style="
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    font-family: JetBrains Mono, monospace;
                  "
                >
                  PNG, JPG up to 2MB
                </p>
              </label>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                class="hidden"
                @change="handleAvatarChange"
              />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="form-label">FULL NAME</label>
              <input
                type="text"
                v-model="profile.fullName"
                class="form-input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label class="form-label">USERNAME</label>
              <input
                type="text"
                v-model="profile.username"
                class="form-input"
                placeholder="username"
              />
            </div>
          </div>
          <div class="mb-4">
            <label class="form-label">EMAIL</label>
            <input
              type="email"
              v-model="profile.email"
              class="form-input"
              placeholder="you@example.com"
            />
          </div>
          <div class="mb-6">
            <label class="form-label">BIO SINGKAT</label>
            <textarea
              rows="3"
              v-model="profile.shortBio"
              class="form-input resize-none"
              placeholder="Tell visitors a bit about yourself..."
            ></textarea>
          </div>
          <div class="flex justify-end">
            <button
              @click="saveProfile"
              :disabled="isSavingProfile"
              class="btn-primary"
            >
              {{ isSavingProfile ? "Saving..." : "Save Profile" }}
            </button>
          </div>
        </div>
      </div>

      <!-- ══ TAB: MESSAGES ══ -->
      <div
        v-show="activeTab === 'messages'"
        class="tab-section animate-fade-up"
      >
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2
                style="
                  font-size: 1rem;
                  font-weight: 600;
                  color: var(--p-light);
                  margin-bottom: 4px;
                "
              >
                Messages
              </h2>
              <p style="font-size: 0.75rem; color: var(--text-muted)">
                Review and respond to contact requests from your website.
              </p>
            </div>
            <button
              @click="fetchMessages"
              class="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          <!-- Messages List -->
          <div v-if="isLoadingMessages" class="py-12 text-center" style="color: var(--text-muted); opacity: 0.4">
            <div
              class="animate-spin w-6 h-6 border-2 border-cyan-400/50 border-t-cyan-400 rounded-full mx-auto mb-3"
            ></div>
            <p class="text-xs font-mono tracking-widest uppercase">
              LOADING MESSAGES...
            </p>
          </div>

          <div
            v-else-if="messages.length === 0"
            class="py-12 text-center"
            style="color: var(--text-muted); opacity: 0.3"
          >
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              viewBox="0 0 24 24"
              class="mx-auto mb-3 opacity-20"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              />
            </svg>
            <p class="text-sm italic">No messages found.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="msg in messages"
              :key="msg.id"
              @click="openMessage(msg)"
              style="
                background: var(--p-surface);
                border: 1px solid var(--p-card-border);
              "
              class="p-4 rounded-xl hover:border-cyan-400/30 transition-all cursor-pointer group"
            >
              <div class="flex justify-between items-start mb-1">
                <h4
                  style="color: var(--p-light)"
                  class="text-sm font-bold group-hover:text-cyan-400 transition-colors"
                >
                  {{ msg.name }}
                </h4>
                <span class="text-[10px] font-mono" style="color: var(--text-muted)">{{
                  formatDate(msg.createdAt)
                }}</span>
              </div>
              <p
                class="text-[11px] text-cyan-400/60 font-mono mb-2 uppercase tracking-wide"
              >
                {{ msg.subject || "No Subject" }}
              </p>
              <p class="text-xs line-clamp-1 italic" style="color: var(--text-muted); opacity: 0.6">
                "{{ msg.message }}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ MESSAGE DETAIL MODAL ══ -->
      <div
        v-if="selectedMessage"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-6"
      >
        <div
          class="absolute inset-0 bg-black/80 backdrop-blur-md"
          @click="closeMessage"
        ></div>
        <div
          style="background: var(--p-surface); border: 1px solid var(--p-card-border);"
          class="relative rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-fade-up"
        >
          <div
            class="p-6 border-b border-sky-700/30 flex justify-between items-center"
            style="background: rgba(74, 112, 169, 0.05)"
          >
            <div>
              <h3 class="text-lg font-serif font-bold text-cyan-400">
                {{ selectedMessage.subject || "Contact Inquiry" }}
              </h3>
              <p
                class="text-[10px] font-mono uppercase tracking-widest mt-1"
                style="color: var(--text-muted)"
              >
                From: {{ selectedMessage.name }} &lt;{{
                  selectedMessage.email
                }}&gt;
              </p>
            </div>
            <button
              @click="closeMessage"
              class="transition-colors"
              style="color: var(--text-muted)"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
            <div
              class="flex items-center gap-4 mb-8 text-[11px] font-mono border-b border-sky-700/20 pb-4"
              style="color: var(--text-muted)"
            >
              <span>DATE: {{ formatDate(selectedMessage.createdAt) }}</span>
              <span
                class="ml-auto px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >VERIFIED HUMAN</span
              >
            </div>
            <div
              class="leading-relaxed whitespace-pre-wrap font-body text-sm"
              style="color: var(--p-light)"
            >
              {{ selectedMessage.message }}
            </div>
          </div>
          <div
            class="p-4 border-t border-sky-700/30 flex justify-end"
            style="background: rgba(0, 0, 0, 0.2)"
          >
            <a
              :href="`mailto:${selectedMessage.email}`"
              class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-5 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Reply via Email
            </a>
          </div>
        </div>
      </div>

      <!-- ══ TAB: SECURITY ══ -->
      <div
        v-show="activeTab === 'security'"
        class="tab-section animate-fade-up"
      >
        <div class="card p-6">
          <h2
            style="
              font-size: 1rem;
              font-weight: 600;
              color: var(--p-light);
              margin-bottom: 4px;
            "
          >
            Change Password
          </h2>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 24px">
            Use a strong, unique password to keep your account secure.
          </p>
          <div class="space-y-5 mb-6">
            <div>
              <label class="form-label">CURRENT PASSWORD</label>
              <div class="relative">
                <input
                  :type="showPasswords.current ? 'text' : 'password'"
                  v-model="security.currentPassword"
                  placeholder="••••••••••"
                  class="form-input pr-11"
                />
                <button
                  @click="showPasswords.current = !showPasswords.current"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400 transition-colors"
                >
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label class="form-label">NEW PASSWORD</label>
              <div class="relative">
                <input
                  :type="showPasswords.new ? 'text' : 'password'"
                  v-model="security.newPassword"
                  @input="checkStrength(security.newPassword)"
                  placeholder="Min. 8 characters"
                  class="form-input pr-11"
                />
                <button
                  @click="showPasswords.new = !showPasswords.new"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400 transition-colors"
                >
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <div class="mt-2 flex gap-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  :class="[
                    i <= passwordStrength
                      ? passwordStrength === 4
                        ? 'bg-emerald-400'
                        : passwordStrength === 3
                          ? 'bg-yellow-400'
                          : passwordStrength === 2
                            ? 'bg-orange-400'
                            : 'bg-red-500'
                      : 'bg-sky-700/40',
                  ]"
                  class="flex-1 h-1 rounded-full transition-colors duration-300"
                ></div>
              </div>
              <p
                v-if="strengthLabel"
                :class="{
                  'text-red-400': passwordStrength === 1,
                  'text-orange-400': passwordStrength === 2,
                  'text-yellow-400': passwordStrength === 3,
                  'text-emerald-400': passwordStrength === 4,
                }"
                class="text-[10px] mt-1 font-mono uppercase font-bold tracking-wider"
              >
                {{ strengthLabel }}
              </p>
            </div>
          </div>
          <div class="flex justify-end">
            <button
              @click="handleChangePassword"
              :disabled="isChangingPassword"
              class="btn-primary"
            >
              {{ isChangingPassword ? "Updating..." : "Update Password" }}
            </button>
          </div>
        </div>
      </div>


      <!-- ══ TAB: APPEARANCE ══ -->
      <div v-show="activeTab === 'appearance'" class="tab-section animate-fade-up">
        <div class="card p-6">
          <h2 style="font-size: 1rem; font-weight: 600; color: var(--p-light); margin-bottom: 4px;">
            Appearance
          </h2>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 24px;">
            Customize the color scheme of your public portfolio website.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Background Color -->
            <div>
              <label class="form-label">Background Color</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" v-model="appearance.bg" style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;" />
                <input type="text" v-model="appearance.bg" class="form-input" placeholder="#eeeeee" style="font-family: monospace;" />
              </div>
            </div>

            <!-- Card Background -->
            <div>
              <label class="form-label">Card Background</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" v-model="appearance.bgCard" style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;" />
                <input type="text" v-model="appearance.bgCard" class="form-input" placeholder="#ffffff" style="font-family: monospace;" />
              </div>
            </div>

            <!-- Accent / Primary Color -->
            <div>
              <label class="form-label">Accent Color</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" v-model="appearance.accent" style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;" />
                <input type="text" v-model="appearance.accent" class="form-input" placeholder="#00adb5" style="font-family: monospace;" />
              </div>
            </div>

            <!-- Border Color -->
            <div>
              <label class="form-label">Border Color</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" v-model="appearance.border" style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;" />
                <input type="text" v-model="appearance.border" class="form-input" placeholder="#d0d0d0" style="font-family: monospace;" />
              </div>
            </div>

            <!-- Text Color -->
            <div>
              <label class="form-label">Primary Text</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" v-model="appearance.text" style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;" />
                <input type="text" v-model="appearance.text" class="form-input" placeholder="#222831" style="font-family: monospace;" />
              </div>
            </div>

            <!-- Muted Text Color -->
            <div>
              <label class="form-label">Muted Text</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" v-model="appearance.textMuted" style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; background: none;" />
                <input type="text" v-model="appearance.textMuted" class="form-input" placeholder="#555e6a" style="font-family: monospace;" />
              </div>
            </div>
          </div>

          <!-- Preview Box -->
          <div style="margin-top: 28px; padding: 20px; border-radius: 12px; border: 1px solid; transition: all 0.3s;"
               :style="{ background: appearance.bg, borderColor: appearance.border }">
            <div style="font-size: 0.7rem; font-family: monospace; margin-bottom: 12px; opacity: 0.5;" :style="{ color: appearance.textMuted }">LIVE PREVIEW</div>
            <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 6px;" :style="{ color: appearance.text }">
              Hello, I'm a Developer 👋
            </div>
            <div style="font-size: 0.85rem; margin-bottom: 16px;" :style="{ color: appearance.textMuted }">
              This is how your public page will look with these colors.
            </div>
            <div style="display: inline-block; padding: 8px 18px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;" :style="{ background: appearance.accent, color: appearance.bg }">
              View Projects →
            </div>
          </div>

          <!-- Reset & Save Buttons -->
          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button class="btn-ghost" @click="Object.assign(appearance, { bg: '#eeeeee', bgCard: '#ffffff', border: '#d0d0d0', text: '#222831', textMuted: '#555e6a', accent: '#00adb5' }); applyColorsToDOM()">
              Reset to Default
            </button>
            <button class="btn-primary" @click="applyAppearance">
              Save Appearance
            </button>
          </div>
        </div>
      </div>

      <!-- ══ TAB: DANGER ZONE ══ -->
      <div v-show="activeTab === 'danger'" class="tab-section animate-fade-up">
        <div
          style="
            background: rgba(239, 68, 68, 0.05);
            border: 1px solid rgba(239, 68, 68, 0.2);
          "
          class="rounded-2xl p-6"
        >
          <div class="flex items-start gap-4 mb-8">
            <div
              class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0"
            >
              <svg
                class="text-red-400"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <div>
              <h2 style="color: #f87171" class="text-lg font-bold">
                Danger Zone
              </h2>
              <p class="text-red-400/40 text-xs mt-1">
                Actions here are permanent and cannot be undone.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div
              style="
                background: #000;
                border: 1px solid rgba(239, 68, 68, 0.15);
              "
              class="p-6 rounded-xl"
            >
              <p class="text-sm font-bold text-red-400/80 mb-4">
                Delete Account & Data
              </p>
              <div class="space-y-3 mb-6">
                <label style="color: #4b5563" class="form-label"
                  >TYPE "DELETE" TO CONFIRM</label
                >
                <input
                  type="text"
                  v-model="deleteConfirmText"
                  placeholder='Type "DELETE" here...'
                  class="form-input border-red-500/10 focus:border-red-500/30 text-red-300 placeholder:text-red-900/40"
                />
              </div>
              <button
                @click="confirmDelete"
                style="background: #ef4444; border: none; color: white"
                class="w-full font-bold py-3 rounded-xl text-sm transition-all hover:bg-red-500 active:scale-[0.98]"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <div
      v-if="toast.show"
      id="toast"
      style="
        background: var(--p-surface);
        border: 1px solid var(--p-card-border);
      "
      class="fixed bottom-8 right-8 z-50 flex items-center gap-3 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-2xl animate-fade-up"
    >
      <div class="w-2 h-2 rounded-full bg-emerald-400 pulse"></div>
      <p style="color: var(--p-light)" class="text-sm font-medium">
        {{ toast.message }}
      </p>
    </div>

    <!-- Delete confirm modal -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
    >
      <div
        style="
          background: var(--p-card-bg);
          border: 1px solid var(--p-card-border);
        "
        class="rounded-2xl p-8 max-w-sm w-full animate-fade-up shadow-2xl"
      >
        <h3 style="color: #f87171" class="text-xl font-bold mb-2">
          Final Confirmation
        </h3>
        <p class="text-white/40 text-sm mb-8 leading-relaxed">
          Are you sure? All your data will be permanently erased. This action
          cannot be reversed.
        </p>
        <div class="flex gap-3">
          <button @click="isDeleteModalOpen = false" class="flex-1 btn-ghost">
            Cancel
          </button>
          <button
            @click="
              showToast('Account Deleted (Simulation)');
              isDeleteModalOpen = false;
            "
            style="background: #ef4444; border: none; color: white"
            class="flex-1 font-bold py-2.5 rounded-xl text-sm transition-all hover:bg-red-500"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(74, 112, 169, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 112, 169, 0.4);
}

@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(16px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  animation: fadeUp 0.5s ease forwards;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}
.pulse {
  animation: pulse 2.5s infinite;
}
</style>
