<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";

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

// Profile State
const avatarPreview = ref(
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80",
);
const profile = reactive({
  fullName: "Alex Kurniawan",
  username: "alexkurniawan",
  email: "admin@portfolio.dev",
  bio: "Full-Stack Developer & UI/UX enthusiast based in Jakarta, Indonesia. 5+ years crafting beautiful, scalable web apps.",
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

// Security State
const security = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const showPasswords = reactive({
  current: false,
  new: false,
});
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

// API Keys State
const apiKeys = reactive({
  openai: "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  anthropic: "",
  github: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
});
const apiKeyVisible = reactive({
  openai: false,
  anthropic: false,
  github: false,
});

const toggleApiKey = (key: keyof typeof apiKeyVisible) => {
  apiKeyVisible[key] = !apiKeyVisible[key];
};

const copyToClipboard = (val: string) => {
  navigator.clipboard.writeText(val).then(() => {
    showToast("Copied to clipboard!");
  });
};

// Preferences State
const activeTheme = ref("dark");
const notifications = reactive({
  messages: true,
  deployments: true,
  analytics: false,
  marketing: false,
});

const setTheme = (theme: string) => {
  activeTheme.value = theme;
  showToast(`Theme set to "${theme}" mode!`);
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
    const response = await fetch(`${workerUrl}/api/worker/contact/messages`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    messages.value = await response.json();
  } catch (err) {
    console.error(err);
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
  <div
    class="settings-page bg-slate-900 font-sans text-white min-h-screen flex flex-col overflow-x-hidden relative"
  >
    <!-- Background Effects -->
    <div class="mesh absolute inset-0 pointer-events-none"></div>
    <div class="grid-bg absolute inset-0 pointer-events-none"></div>
    <div class="grain-overlay"></div>

    <!-- ══════════════ MAIN CONTENT ══════════════ -->
    <main class="flex-1 min-w-0 overflow-y-auto relative z-10">
      <!-- Top Bar -->
      <div
        class="sticky top-0 z-20 bg-slate-900/90 backdrop-blur border-b border-sky-700/30 px-6 py-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div>
            <h1 class="font-serif text-xl font-bold">Settings</h1>
            <p class="text-white/30 text-xs font-mono">dashboard/settings</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-xl border border-sky-700/50 hover:border-cyan-400/40 text-white/40 hover:text-cyan-400 transition-all"
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
              />
            </svg>
          </button>
          <img
            :src="avatarPreview"
            alt="Avatar"
            class="w-8 h-8 rounded-lg object-cover border border-sky-700/60"
          />
        </div>
      </div>

      <div class="px-6 py-8 max-w-3xl mx-auto space-y-0">
        <!-- ── Tabs ── -->
        <div
          class="flex gap-1 bg-sky-800/20 border border-sky-700/30 rounded-xl p-1 mb-8 overflow-x-auto"
        >
          <button
            v-for="tab in [
              'profile',
              'messages',
              'security',
              'api',
              'prefs',
              'danger',
            ]"
            :key="tab"
            @click="switchTab(tab)"
            :class="[
              activeTab === tab
                ? 'bg-sky-700/60 text-cyan-400 font-semibold'
                : tab === 'danger'
                  ? 'text-red-400/60 hover:text-red-400'
                  : 'text-white/40 hover:text-white/70',
            ]"
            class="tab-btn flex-1 min-w-max text-[11px] font-mono py-2.5 px-3 rounded-lg transition-all capitalize"
          >
            {{
              tab === "api"
                ? "API Keys"
                : tab === "prefs"
                  ? "Preferences"
                  : tab === "messages"
                    ? "Messages"
                    : tab
            }}
          </button>
        </div>

        <!-- ══ TAB: PROFILE ══ -->
        <div
          v-show="activeTab === 'profile'"
          class="tab-section animate-fade-up"
        >
          <div class="settings-card">
            <h2 class="font-serif text-lg font-bold mb-1">Update Profile</h2>
            <p class="text-white/40 text-xs mb-5">
              Your public-facing information on the portfolio.
            </p>

            <div class="flex items-start gap-5 mb-6">
              <div class="relative flex-shrink-0">
                <img
                  :src="avatarPreview"
                  alt="Avatar"
                  class="w-20 h-20 rounded-2xl object-cover border-2 border-sky-700/60"
                />
              </div>
              <div class="flex-1">
                <label
                  class="avatar-drop rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer gap-2 text-center"
                  for="avatarInput"
                >
                  <svg
                    class="text-cyan-400/50"
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
                  <p class="text-xs text-white/40">
                    Click to upload or drag &amp; drop
                  </p>
                  <p class="text-xs text-white/20 font-mono">
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
                <label class="block text-xs font-mono text-white/40 tracking-wider mb-2">FULL NAME</label>
                <input
                  type="text"
                  v-model="profile.fullName"
                  class="form-input"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label class="block text-xs font-mono text-white/40 tracking-wider mb-2">USERNAME</label>
                <input
                  type="text"
                  v-model="profile.username"
                  class="form-input"
                  placeholder="username"
                />
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-xs font-mono text-white/40 tracking-wider mb-2">EMAIL</label>
              <input
                type="email"
                v-model="profile.email"
                class="form-input"
                placeholder="you@example.com"
              />
            </div>
            <div class="mb-5">
              <label class="block text-xs font-mono text-white/40 tracking-wider mb-2">BIO SINGKAT</label>
              <textarea
                rows="3"
                v-model="profile.bio"
                class="form-input resize-none"
                placeholder="Tell visitors a bit about yourself..."
              ></textarea>
            </div>
            <div class="flex justify-end">
              <button
                @click="showToast('Profile updated successfully!')"
                class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>

        <!-- ══ TAB: MESSAGES ══ -->
        <div
          v-show="activeTab === 'messages'"
          class="tab-section animate-fade-up"
        >
          <div class="settings-card">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="font-serif text-lg font-bold mb-1">Messages</h2>
                <p class="text-white/40 text-xs">
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
            <div
              v-if="isLoadingMessages"
              class="py-12 text-center text-white/30"
            >
              <div
                class="animate-spin w-6 h-6 border-2 border-cyan-400/50 border-t-cyan-400 rounded-full mx-auto mb-3"
              ></div>
              <p class="text-sm font-mono tracking-widest">
                LOADING MESSAGES...
              </p>
            </div>

            <div
              v-else-if="messages.length === 0"
              class="py-12 text-center text-white/20"
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
                class="message-item group p-4 rounded-xl border border-sky-700/30 bg-slate-900/50 hover:bg-sky-400/5 hover:border-cyan-400/30 transition-all cursor-pointer"
              >
                <div class="flex justify-between items-start mb-1">
                  <h4
                    class="text-sm font-bold text-white/80 group-hover:text-cyan-400"
                  >
                    {{ msg.name }}
                  </h4>
                  <span class="text-[10px] font-mono text-white/30">{{
                    formatDate(msg.createdAt)
                  }}</span>
                </div>
                <p
                  class="text-[11px] text-cyan-400/60 font-mono mb-2 uppercase tracking-wide"
                >
                  {{ msg.subject || "No Subject" }}
                </p>
                <p class="text-xs text-white/40 line-clamp-1 italic">
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
            class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            @click="closeMessage"
          ></div>
          <div
            class="relative bg-slate-900 border border-sky-400/30 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-fade-up"
          >
            <div
              class="p-6 border-b border-sky-700/30 flex justify-between items-center bg-sky-400/5"
            >
              <div>
                <h3 class="text-lg font-serif font-bold text-cyan-400">
                  {{ selectedMessage.subject || "Contact Inquiry" }}
                </h3>
                <p
                  class="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1"
                >
                  From: {{ selectedMessage.name }} &lt;{{
                    selectedMessage.email
                  }}&gt;
                </p>
              </div>
              <button
                @click="closeMessage"
                class="text-white/40 hover:text-white transition-colors"
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
                class="flex items-center gap-4 mb-8 text-[11px] font-mono text-white/30 border-b border-sky-700/20 pb-4"
              >
                <span>DATE: {{ formatDate(selectedMessage.createdAt) }}</span>
                <span
                  class="ml-auto px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >VERIFIED HUMAN</span
                >
              </div>
              <div
                class="text-white/70 leading-relaxed whitespace-pre-wrap font-body text-sm"
              >
                {{ selectedMessage.message }}
              </div>
            </div>
            <div
              class="p-4 bg-slate-900/50 border-t border-sky-700/30 flex justify-end"
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
          <div class="settings-card">
            <h2 class="font-serif text-lg font-bold mb-1">Change Password</h2>
            <p class="text-white/40 text-xs mb-5">
              Use a strong, unique password to keep your account secure.
            </p>
            <div class="space-y-4 mb-5">
              <div>
                <label class="block text-xs font-mono text-white/40 tracking-wider mb-2">CURRENT PASSWORD</label>
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
                <label class="block text-xs font-mono text-white/40 tracking-wider mb-2">NEW PASSWORD</label>
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
                @click="showToast('Password changed successfully!')"
                class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        <!-- ══ TAB: API KEYS ══ -->
        <div v-show="activeTab === 'api'" class="tab-section animate-fade-up">
          <div class="settings-card">
            <h2 class="font-serif text-lg font-bold mb-1">API Keys</h2>
            <p class="text-white/40 text-xs mb-5">
              These keys are stored encrypted. Never share them publicly.
            </p>

            <div class="space-y-5">
              <div v-for="(val, key) in apiKeys" :key="key">
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-mono text-white/40 tracking-wider uppercase">{{ key }} API KEY</label>
                  <span
                    v-if="val"
                    class="text-[10px] bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5"
                    >Connected</span
                  >
                  <span
                    v-else
                    class="text-[10px] bg-sky-800/30 text-white/40 border border-sky-700/50 rounded-full px-2 py-0.5"
                    >Not set</span
                  >
                </div>
                <div class="relative">
                  <input
                    :type="apiKeyVisible[key] ? 'text' : 'password'"
                    v-model="apiKeys[key]"
                    class="form-input font-mono tracking-wider pr-24"
                    :placeholder="`sk-${key.substring(0, 3)}-xxx...`"
                  />
                  <div
                    class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1"
                  >
                    <button
                      @click="toggleApiKey(key)"
                      class="text-[10px] bg-sky-800/40 hover:bg-sky-800/80 text-white/50 hover:text-cyan-400 px-2 py-1 rounded-lg transition-all font-mono"
                    >
                      {{ apiKeyVisible[key] ? "Hide" : "Show" }}
                    </button>
                    <button
                      v-if="val"
                      @click="copyToClipboard(val)"
                      class="text-[10px] bg-sky-800/40 hover:bg-sky-800/80 text-white/50 hover:text-cyan-400 px-2 py-1 rounded-lg transition-all font-mono"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end mt-6">
              <button
                @click="showToast('API keys saved securely!')"
                class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
              >
                Save Keys
              </button>
            </div>
          </div>
        </div>

        <!-- ══ TAB: PREFERENCES ══ -->
        <div v-show="activeTab === 'prefs'" class="tab-section animate-fade-up">
          <div class="settings-card">
            <h2 class="font-serif text-lg font-bold mb-4">Appearance</h2>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <button
                v-for="theme in ['dark', 'light', 'system']"
                :key="theme"
                @click="setTheme(theme)"
                :class="{
                  'border-cyan-400 ring-2 ring-cyan-400/10':
                    activeTheme === theme,
                }"
                class="border-2 border-sky-700/40 rounded-xl p-3 text-center transition-all hover:border-cyan-400/40"
              >
                <div
                  v-if="theme === 'dark'"
                  class="w-full h-10 bg-slate-900 rounded-lg mb-2 flex items-center justify-center"
                >
                  <div class="w-5 h-5 rounded-full bg-cyan-400/60"></div>
                </div>
                <div
                  v-else-if="theme === 'light'"
                  class="w-full h-10 bg-gray-200 rounded-lg mb-2 flex items-center justify-center"
                >
                  <div class="w-5 h-5 rounded-full bg-sky-600/60"></div>
                </div>
                <div
                  v-else
                  class="w-full h-10 rounded-lg mb-2 flex overflow-hidden"
                >
                  <div class="flex-1 bg-slate-900"></div>
                  <div class="flex-1 bg-gray-200"></div>
                </div>
                <p
                  :class="
                    activeTheme === theme
                      ? 'text-cyan-400 font-semibold'
                      : 'text-white/40'
                  "
                  class="text-xs capitalize"
                >
                  {{ theme }}
                </p>
              </button>
            </div>
          </div>

          <div class="settings-card">
            <h2 class="font-serif text-lg font-bold mb-4">
              Email Notifications
            </h2>
            <div class="space-y-4">
              <div
                v-for="(val, key) in notifications"
                :key="key"
                class="flex items-center justify-between py-2 first:pt-0 last:pb-0 border-b last:border-0 border-sky-700/20"
              >
                <div>
                  <p class="text-sm font-medium capitalize">
                    {{ key.replace(/([A-Z])/g, " $1") }}
                  </p>
                  <p class="text-xs text-white/40">
                    Receive alerts related to {{ key }}.
                  </p>
                </div>
                <label class="toggle-wrap">
                  <input
                    type="checkbox"
                    v-model="notifications[key]"
                    @change="showToast('Preference saved!')"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ TAB: DANGER ZONE ══ -->
        <div
          v-show="activeTab === 'danger'"
          class="tab-section animate-fade-up"
        >
          <div
            class="danger-card border border-red-500/30 bg-red-900/10 rounded-2xl p-6"
          >
            <div class="flex items-start gap-4 mb-6">
              <div
                class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0"
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
                <h2 class="font-serif text-lg font-bold text-red-300">
                  Danger Zone
                </h2>
                <p class="text-red-400/60 text-sm">
                  Action here cannot be undone.
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div
                class="p-4 bg-red-900/20 border border-red-500/30 rounded-xl space-y-4"
              >
                <p class="text-sm font-bold text-red-300">
                  Delete Account & Data
                </p>
                <div class="space-y-2">
                  <label class="block text-xs font-mono text-red-400/60 tracking-wider">TYPE "DELETE" TO CONFIRM</label>
                  <input
                    type="text"
                    v-model="deleteConfirmText"
                    placeholder='Type "DELETE" here...'
                    class="form-input border-red-500/30 focus:border-red-500/60 text-red-300 placeholder:text-red-900"
                  />
                </div>
                <button
                  @click="confirmDelete"
                  class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast notification -->
    <div
      v-if="toast.show"
      id="toast"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-sky-800/90 backdrop-blur border border-cyan-400/30 rounded-xl px-4 py-3 shadow-xl max-w-xs animate-fade-up show"
    >
      <svg
        class="text-cyan-400"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        viewBox="0 0 24 24"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <p class="text-sm font-medium">{{ toast.message }}</p>
    </div>

    <!-- Delete confirm modal -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <div
        class="bg-slate-900 border border-red-500/40 rounded-2xl p-6 max-w-sm w-full animate-fade-up"
      >
        <h3 class="font-serif text-xl font-bold text-red-300 mb-2">
          Final Confirmation
        </h3>
        <p class="text-white/50 text-sm mb-5">
          Are you sure? All your data will be permanently erased.
        </p>
        <div class="flex gap-3">
          <button
            @click="isDeleteModalOpen = false"
            class="flex-1 border border-sky-700/60 text-white/60 font-medium py-2.5 rounded-xl text-sm transition-all hover:border-cyan-400/50 hover:text-cyan-400"
          >
            Cancel
          </button>
          <button
            @click="
              showToast('Account Deleted (Simulation)');
              isDeleteModalOpen = false;
            "
            class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Font imports */
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

.font-display {
  font-family: "Playfair Display", serif !important;
}
.font-body {
  font-family: "DM Sans", sans-serif !important;
}
.font-mono {
  font-family: "JetBrains Mono", monospace !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 211, 238, 0.4);
}

/* Grain Overlay */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Grid Background */
.grid-bg {
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Mesh Gradient */
.mesh {
  background:
    radial-gradient(
      ellipse at 30% 40%,
      rgba(34, 211, 238, 0.08) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse at 80% 70%,
      rgba(8, 145, 178, 0.12) 0%,
      transparent 55%
    );
}

.settings-card {
  background: rgba(8, 145, 178, 0.12);
  border: 1px solid rgba(8, 145, 178, 0.4);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.form-input {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(8, 145, 178, 0.5);
  color: #ffffff;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  font-size: 0.875rem;
}

.form-input:focus {
  border-color: rgba(34, 211, 238, 0.6);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.08);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* Toggle switch */
.toggle-wrap {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.toggle-wrap input {
  opacity: 0;
  width: 0;
  height: 0;
}
.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #0891b2;
  border-radius: 24px;
  transition: 0.3s;
}
.toggle-slider::before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: #ffffff;
  border-radius: 50%;
  transition: 0.3s;
}
input:checked + .toggle-slider {
  background: #22d3ee;
}
input:checked + .toggle-slider::before {
  transform: translateX(20px);
  background: #0f172a;
}

.nav-item {
  transition: all 0.15s ease;
  cursor: pointer;
}
.nav-item.active {
  background: rgba(34, 211, 238, 0.12);
  color: #22d3ee;
  border-left: 2px solid #22d3ee;
}

.avatar-drop {
  border: 2px dashed rgba(34, 211, 238, 0.3);
  transition: all 0.2s;
}
.avatar-drop:hover {
  border-color: rgba(34, 211, 238, 0.6);
  background: rgba(34, 211, 238, 0.05);
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
.pulse-slow {
  animation: pulse 2.5s infinite;
}
</style>
