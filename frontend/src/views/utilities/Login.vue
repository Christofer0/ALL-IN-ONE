<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ROUTE_NAMES } from "@/router/constants";

const router = useRouter();
const authStore = useAuthStore();

// State Management
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref("");
const showForgotHit = ref(false);
const showMagicMsg = ref(false);
const failedAttempts = ref(0);
const isLocked = ref(false);
const lockRemainingSeconds = ref(30);
const MAX_ATTEMPTS = 3;

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({ name: ROUTE_NAMES.DASHBOARD_PRIVATE });
  }
});

// UI Logic
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const showForgotPassword = () => {
  showForgotHit.value = true;
  errorMessage.value = "";
};

const sendMagicLink = () => {
  if (!email.value) {
    errorMessage.value = "Please enter your email first.";
    return;
  }
  isLoading.value = true;
  setTimeout(() => {
    showMagicMsg.value = true;
    isLoading.value = false;
    setTimeout(() => {
      showMagicMsg.value = false;
    }, 4000);
  }, 1200);
};

const activateRateLimit = () => {
  isLocked.value = true;
  lockRemainingSeconds.value = 30;
  const interval = setInterval(() => {
    lockRemainingSeconds.value--;
    if (lockRemainingSeconds.value <= 0) {
      clearInterval(interval);
      isLocked.value = false;
      failedAttempts.value = 0;
      lockRemainingSeconds.value = 30;
    }
  }, 1000);
};

const handleLogin = async () => {
  if (isLocked.value) return;
  errorMessage.value = "";

  if (!email.value || !password.value) {
    showError("Please fill in all fields.");
    return;
  }

  isLoading.value = true;

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    
    isSuccess.value = true;
    setTimeout(() => {
      router.push({ name: ROUTE_NAMES.DASHBOARD_PRIVATE });
    }, 1500);
  } catch (err: any) {
    failedAttempts.value++;
    
    if (failedAttempts.value >= MAX_ATTEMPTS) {
      activateRateLimit();
      showError("Too many failed attempts. Account locked for 30 seconds.");
    } else {
      const msg = err.response?.data?.error || "Login failed. Please try again.";
      showError(`${msg} (${MAX_ATTEMPTS - failedAttempts.value} attempt(s) remaining)`);
    }
  } finally {
    isLoading.value = false;
  }
};

const showError = (msg: string) => {
  errorMessage.value = msg;
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-900 font-sans text-white flex overflow-hidden relative"
  >
    <!-- Grain Overlay -->
    <div class="grain-overlay"></div>

    <!-- LEFT PANEL -->
    <div
      class="hidden lg:flex lg:w-1/2 left-panel flex-col items-center justify-center relative overflow-hidden p-12"
    >
      <!-- Background rings -->
      <div
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-[480px] h-[480px] rounded-full border border-cyan-400/10"
        ></div>
      </div>
      <div
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-[680px] h-[680px] rounded-full border border-sky-600/20"
        ></div>
      </div>

      <!-- Brand -->
      <router-link
        to="/"
        class="absolute top-8 left-10 font-mono text-cyan-400 font-medium tracking-widest text-sm z-10"
      >
        &lt;PORTFOLIO /&gt;
      </router-link>

      <!-- Floating code card -->
      <div class="float relative z-10 mb-10">
        <div
          class="bg-slate-900/80 backdrop-blur border border-sky-700/60 rounded-2xl p-6 font-mono text-xs w-72 shadow-2xl"
        >
          <div class="flex gap-1.5 mb-4">
            <span class="w-3 h-3 rounded-full bg-red-400/60"></span>
            <span class="w-3 h-3 rounded-full bg-yellow-400/60"></span>
            <span class="w-3 h-3 rounded-full bg-green-400/60"></span>
          </div>
          <div class="space-y-1.5 leading-relaxed">
            <p><span class="text-sky-400">// Authenticating...</span></p>
            <p>
              <span class="text-purple-400">const</span>
              <span class="text-cyan-400">session</span> =
              <span class="text-white/50">await</span>
            </p>
            <p class="pl-4">
              <span class="text-yellow-300">auth</span>.<span
                class="text-cyan-400"
                >signIn</span
              >({
            </p>
            <p class="pl-8"><span class="text-white/50">email,</span></p>
            <p class="pl-8"><span class="text-white/50">password,</span></p>
            <p class="pl-8">
              <span class="text-white/50"
                >remember: <span class="text-green-400">true</span></span
              >
            </p>
            <p class="pl-4">});</p>
            <p class="text-green-400 mt-2">✓ Session created</p>
          </div>
        </div>
      </div>

      <!-- Text -->
      <div class="relative z-10 text-center">
        <h2 class="font-serif text-4xl font-black mb-3 leading-tight">
          Welcome<br /><span class="text-cyan-400 italic">Back</span>
        </h2>
        <p class="text-white/60 text-sm leading-relaxed max-w-xs">
          Sign in to access your dashboard, manage your portfolio, and track
          your projects.
        </p>
      </div>

      <!-- Bottom stats -->
      <div class="absolute bottom-10 left-10 right-10 flex justify-between">
        <div class="text-center">
          <p class="font-serif text-2xl font-black text-cyan-400">40+</p>
          <p class="text-white/40 text-xs">Projects</p>
        </div>
        <div class="text-center">
          <p class="font-serif text-2xl font-black text-cyan-400">5+</p>
          <p class="text-white/40 text-xs">Years Exp</p>
        </div>
        <div class="text-center">
          <p class="font-serif text-2xl font-black text-cyan-400">12+</p>
          <p class="text-white/40 text-xs">Clients</p>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL (Form) -->
    <div
      class="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative z-10 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    >
      <!-- Mobile brand -->
      <router-link
        to="/"
        class="lg:hidden font-mono text-cyan-400 font-medium tracking-widest text-sm mb-10"
      >
        &lt;PORTFOLIO /&gt;
      </router-link>

      <div class="w-full max-w-md">
        <!-- Success Redirect Panel -->
        <div
          v-if="isSuccess"
          class="bg-emerald-900/20 border border-emerald-500/40 rounded-xl px-5 py-8 text-center animate-fade-up"
        >
          <div
            class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="text-emerald-400"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p class="text-emerald-400 text-xl font-bold mb-2">
            Login Successful!
          </p>
          <p class="text-white/60 text-sm mb-6">
            Establishing secure connection to dashboard...
          </p>
          <div class="h-1.5 bg-sky-800/30 rounded-full overflow-hidden">
            <div
              class="h-full bg-emerald-400/60 rounded-full transition-all duration-[2000ms]"
              style="width: 100%"
            ></div>
          </div>
        </div>

        <!-- Login UI -->
        <div v-else>
          <!-- Header -->
          <div class="mb-8 animate-fade-up" style="animation-delay: 0.05s">
            <h1
              class="font-serif text-3xl font-black mb-1 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Sign In
            </h1>
            <p class="text-white/60 text-sm">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <!-- Rate Limit Banner -->
          <div
            v-if="isLocked"
            class="mb-5 bg-red-900/30 border border-red-500/50 rounded-xl px-4 py-3 text-sm animate-fade-up"
          >
            <div class="flex items-start gap-3">
              <svg
                class="text-red-400 flex-shrink-0 mt-0.5"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p class="text-red-300 font-semibold mb-0.5">
                  Too many failed attempts
                </p>
                <p class="text-red-400/70 text-xs">
                  Account temporarily locked. Please wait
                  <span class="font-mono font-bold text-red-300"
                    >{{ lockRemainingSeconds }}s</span
                  >
                  before trying again.
                </p>
              </div>
            </div>
            <div class="mt-3 h-1 bg-red-900/50 rounded-full overflow-hidden">
              <div
                class="h-full bg-red-400/60 rounded-full transition-all duration-1000"
                :style="{ width: (lockRemainingSeconds / 30) * 100 + '%' }"
              ></div>
            </div>
          </div>

          <!-- Error Alert -->
          <div
            v-if="errorMessage && !isLocked"
            class="mb-5 bg-red-900/20 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center gap-2 animate-fade-up"
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Login Form -->
          <form
            @submit.prevent="handleLogin"
            novalidate
            class="space-y-5 animate-fade-up"
            :class="{ shake: errorMessage && !isLocked }"
            style="animation-delay: 0.1s"
          >
            <!-- Email -->
            <div>
              <label
                for="email"
                class="block text-xs font-mono text-white/50 tracking-wider mb-2"
                >EMAIL ADDRESS</label
              >
              <div class="relative">
                <svg
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  v-model="email"
                  type="email"
                  id="email"
                  required
                  placeholder="you@example.com"
                  class="w-full bg-slate-800/60 border border-sky-700/60 text-white placeholder:text-white/30 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  :disabled="isLoading || isLocked"
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label
                  for="password"
                  class="block text-xs font-mono text-white/50 tracking-wider"
                  >PASSWORD</label
                >
                <button
                  type="button"
                  @click="showForgotPassword"
                  class="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  Lupa password?
                </button>
              </div>
              <div class="relative">
                <svg
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  required
                  placeholder="••••••••"
                  class="w-full bg-slate-800/60 border border-sky-700/60 text-white placeholder:text-white/30 rounded-xl py-3 pl-11 pr-11 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  :disabled="isLoading || isLocked"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyan-400 transition-colors cursor-pointer"
                  @click="togglePassword"
                >
                  <svg
                    v-if="!showPassword"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    v-else
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center gap-3">
              <input
                v-model="rememberMe"
                type="checkbox"
                id="remember"
                class="w-4 h-4 rounded border border-sky-600 cursor-pointer accent-cyan-400"
              />
              <label
                for="remember"
                class="text-sm text-white/70 cursor-pointer select-none hover:text-white transition-colors"
              >
                Remember me for 30 days
              </label>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-500/20 text-sm"
              :disabled="isLoading || isLocked"
            >
              <svg
                v-if="!isLoading"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
                />
              </svg>
              <svg
                v-else
                class="animate-spin"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                />
              </svg>
              <span>{{
                isLoading ? "Signing in..." : "Sign In to Dashboard"
              }}</span>
            </button>
          </form>

          <!-- Divider -->
          <div
            class="flex items-center gap-4 my-6 animate-fade-up"
            style="animation-delay: 0.2s"
          >
            <div class="flex-1 h-px bg-sky-700/50"></div>
            <span class="text-white/40 text-xs font-mono">OR</span>
            <div class="flex-1 h-px bg-sky-700/50"></div>
          </div>

          <!-- Magic Link -->
          <button
            type="button"
            @click="sendMagicLink"
            class="animate-fade-up w-full flex items-center justify-center gap-2 border border-sky-700/60 hover:border-cyan-400/50 text-white/50 hover:text-cyan-400 font-medium py-3 rounded-xl transition-all text-sm"
            style="animation-delay: 0.25s"
            :disabled="isLoading || isLocked"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              />
            </svg>
            <span>{{
              isLoading && showMagicMsg ? "Sending..." : "Send Magic Link"
            }}</span>
          </button>

          <!-- Magic link success -->
          <div
            v-if="showMagicMsg"
            class="mt-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl px-4 py-3 text-xs text-cyan-400 font-mono text-center animate-fade-up"
          >
            ✓ Magic link sent to your email! Check your inbox.
          </div>

          <!-- Forgot password modal hint -->
          <div
            v-if="showForgotHit"
            class="mt-3 bg-sky-800/30 border border-sky-700/60 rounded-xl px-4 py-3 text-xs text-white/50 text-center animate-fade-up"
          >
            🔑 Enter your email above and we'll send a reset link shortly.
            <button
              @click="showForgotHit = false"
              class="ml-2 text-cyan-400 hover:underline"
            >
              Close
            </button>
          </div>

          <p
            class="text-center text-white/40 text-xs mt-8 animate-fade-up"
            style="animation-delay: 0.3s"
          >
            Don't have an account?
            <router-link to="/contact" class="text-cyan-400 hover:underline"
              >Get in touch</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Grain Overlay */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Left Panel Background */
.left-panel {
  background: linear-gradient(135deg, #0f172a 0%, #0891b2 60%, #0f172a 100%);
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Floating Animation */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-12px) rotate(-1deg);
  }
}
.float {
  animation: float 6s ease-in-out infinite;
}

/* Fade Up Animation */
@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  opacity: 0;
  animation: fadeUp 0.6s ease forwards;
}

/* Shake Animation */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
.shake {
  animation: shake 0.4s ease;
}

/* Spin Animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
