<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

// --- State ---
const formState = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
  is_not_robot: false,
});

const isSubmitting = ref(false);
const isSuccess = ref(false);
const copied = ref(false);

// --- Logic ---
const handleSubmit = async () => {
  if (!formState.is_not_robot) {
    alert("Please confirm you are not a robot");
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await fetch("http://localhost:9992/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send message");
    }

    isSuccess.value = true;
  } catch (error: any) {
    alert(error.message || "An error occurred. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  formState.name = "";
  formState.email = "";
  formState.subject = "";
  formState.message = "";
  formState.is_not_robot = false;
  isSuccess.value = false;
};

const copyEmail = () => {
  navigator.clipboard.writeText("brilliancw30@gmail.com").then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};

// --- Animations ---
onMounted(() => {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    revealObserver.observe(el);
  });
});
</script>

<template>
  <div class="public">
    <div class="max-w-6xl mx-auto px-6 pt-28 pb-20">
      <!-- Header -->
      <div class="reveal text-center mb-16">
        <p class="font-mono text-accent text-xs tracking-widest mb-2">
          // GET IN TOUCH
        </p>
        <h1 class="font-display text-5xl md:text-6xl font-black mb-4">
          Let's <span class="text-accent italic">Connect</span>
        </h1>
        <p
          class="max-w-lg mx-auto leading-relaxed"
          style="color: var(--text-muted)"
        >
          Whether you have a project in mind, a question, or just want to say hi
          — my inbox is always open.
        </p>
      </div>

      <div class="grid lg:grid-cols-5 gap-10">
        <!-- Left Panel: Contact Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Availability Badge -->
          <div class="reveal">
            <div
              class="border rounded-2xl p-5"
              style="
                background-color: var(--bg-card);
                border-color: var(--border);
              "
            >
              <div class="flex items-center gap-3 mb-3">
                <div class="relative flex-shrink-0">
                  <div class="w-3 h-3 rounded-full bg-green-400"></div>
                  <div
                    class="ping absolute inset-0 w-3 h-3 rounded-full bg-green-400 opacity-70"
                  ></div>
                </div>
                <span class="text-sm font-semibold text-green-400"
                  >Available</span
                >
              </div>
              <p
                class="text-sm leading-relaxed"
                style="color: var(--text-muted)"
              >
                Currently open for
                <span class="font-medium" style="color: var(--text)"
                  >full-time roles</span
                >
                and
                <span class="font-medium" style="color: var(--text)"
                  >freelance projects</span
                >. Response time: usually within 24 hours.
              </p>
            </div>
          </div>

          <!-- Direct Contact -->
          <div class="reveal" style="animation-delay: 0.1s">
            <div
              class="border rounded-2xl p-5"
              style="
                background-color: var(--bg-card);
                border-color: var(--border);
              "
            >
              <h3 class="font-mono text-accent text-xs tracking-widest mb-4">
                // DIRECT CONTACT
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3 group">
                  <div
                    class="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      class="text-accent"
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
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs mb-0.5" style="color: var(--text-muted)">
                      Email
                    </p>
                    <button
                      class="text-sm hover:text-accent transition-colors font-mono truncate block"
                      @click="copyEmail"
                    >
                      brilliancw30@gmail.com
                    </button>
                  </div>
                  <button
                    @click="copyEmail"
                    title="Copy email"
                    class="opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent"
                    style="color: var(--text-muted)"
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path
                        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                      />
                    </svg>
                  </button>
                </div>
                <!-- Copy Feedback -->
                <transition
                  enter-active-class="transition-all duration-300"
                  leave-active-class="transition-all duration-300"
                  enter-from-class="opacity-0 -translate-y-2"
                  leave-to-class="opacity-0 -translate-y-2"
                >
                  <div
                    v-if="copied"
                    class="text-xs text-accent font-mono pl-12"
                  >
                    ✓ Copied to clipboard!
                  </div>
                </transition>

                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      class="text-accent"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs mb-0.5" style="color: var(--text-muted)">
                      Location
                    </p>
                    <p class="text-sm">Jakarta, Indonesia 🇮🇩</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Social Media -->
          <div class="reveal" style="animation-delay: 0.2s">
            <div
              class="border rounded-2xl p-5"
              style="
                background-color: var(--bg-card);
                border-color: var(--border);
              "
            >
              <h3 class="font-mono text-accent text-xs tracking-widest mb-4">
                // SOCIAL MEDIA
              </h3>
              <div class="space-y-2">
                <!-- GitHub -->
                <a
                  href="#"
                  class="social-link flex items-center gap-3 py-2 hover:text-accent group"
                  style="color: var(--text-muted)"
                >
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center group-hover:text-accent group-hover:bg-accent/10 transition-all"
                    style="
                      background-color: var(--bg);
                      color: var(--text-muted);
                    "
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs" style="color: var(--text-muted)">
                      GitHub
                    </p>
                    <p class="text-sm font-medium">@brilliancw30@gmail.com</p>
                  </div>
                  <svg
                    class="ml-auto group-hover:text-accent transition-colors"
                    style="color: var(--border)"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <!-- LinkedIn -->
                <a
                  href="#"
                  class="social-link flex items-center gap-3 py-2 hover:text-accent group"
                  style="color: var(--text-muted)"
                >
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center group-hover:text-accent group-hover:bg-accent/10 transition-all"
                    style="
                      background-color: var(--bg);
                      color: var(--text-muted);
                    "
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs" style="color: var(--text-muted)">
                      LinkedIn
                    </p>
                    <p class="text-sm font-medium">Brillian Christofer</p>
                  </div>
                  <svg
                    class="ml-auto group-hover:text-accent transition-colors"
                    style="color: var(--border)"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <!-- X (Twitter) -->
                <a
                  href="#"
                  class="social-link flex items-center gap-3 py-2 hover:text-accent group"
                  style="color: var(--text-muted)"
                >
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center group-hover:text-accent group-hover:bg-accent/10 transition-all"
                    style="
                      background-color: var(--bg);
                      color: var(--text-muted);
                    "
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs" style="color: var(--text-muted)">
                      X (Twitter)
                    </p>
                    <p class="text-sm font-medium">@brilliancw30@gmail.com</p>
                  </div>
                  <svg
                    class="ml-auto group-hover:text-accent transition-colors"
                    style="color: var(--border)"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Contact Form -->
        <div class="lg:col-span-3 reveal" style="animation-delay: 0.15s">
          <div
            class="border rounded-2xl p-8"
            style="
              background-color: var(--bg-card);
              border-color: var(--border);
            "
          >
            <transition
              enter-active-class="transition-all duration-300"
              leave-active-class="transition-all duration-300"
              enter-from-class="opacity-0 translate-y-4"
              leave-to-class="opacity-0 -translate-y-4"
              mode="out-in"
            >
              <div v-if="!isSuccess" key="form">
                <h2 class="font-display text-2xl font-bold mb-2">
                  Send a Message
                </h2>
                <p class="text-sm mb-8" style="color: var(--text-muted)">
                  Fill out the form below and I'll get back to you as soon as
                  possible.
                </p>

                <form @submit.prevent="handleSubmit">
                  <div class="space-y-5">
                    <!-- Name -->
                    <div>
                      <label
                        for="name"
                        class="block text-xs font-mono mb-2 tracking-wider"
                        style="color: var(--text-muted)"
                      >
                        NAMA LENGKAP <span class="text-accent">*</span>
                      </label>
                      <input
                        type="text"
                        v-model="formState.name"
                        required
                        placeholder="John Doe"
                        class="form-input"
                        autocomplete="name"
                      />
                    </div>

                    <!-- Email -->
                    <div>
                      <label
                        for="email"
                        class="block text-xs font-mono mb-2 tracking-wider"
                        style="color: var(--text-muted)"
                      >
                        ALAMAT EMAIL <span class="text-accent">*</span>
                      </label>
                      <input
                        type="email"
                        v-model="formState.email"
                        required
                        placeholder="john@example.com"
                        class="form-input"
                        autocomplete="email"
                      />
                    </div>

                    <!-- Subject -->
                    <div>
                      <label
                        for="subject"
                        class="block text-xs font-mono mb-2 tracking-wider"
                        style="color: var(--text-muted)"
                      >
                        TOPIK / SUBJEK
                      </label>
                      <input
                        type="text"
                        v-model="formState.subject"
                        placeholder="Project inquiry, collaboration, etc."
                        class="form-input"
                      />
                    </div>

                    <!-- Message -->
                    <div>
                      <label
                        for="message"
                        class="block text-xs font-mono mb-2 tracking-wider"
                        style="color: var(--text-muted)"
                      >
                        PESAN / TOPIK DISKUSI <span class="text-accent">*</span>
                      </label>
                      <textarea
                        v-model="formState.message"
                        required
                        rows="5"
                        placeholder="Ceritakan lebih lanjut tentang proyek atau pertanyaanmu..."
                        class="form-input resize-none"
                      ></textarea>
                    </div>

                    <div
                      class="border rounded-xl p-4"
                      style="
                        background-color: var(--bg);
                        border-color: var(--border);
                      "
                    >
                      <div class="flex items-center gap-3 mb-2">
                        <div
                          class="w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all"
                          :style="{ 
                            borderColor: formState.is_not_robot ? 'var(--accent)' : 'var(--border)',
                            backgroundColor: formState.is_not_robot ? 'var(--accent)' : 'transparent'
                          }"
                          @click="formState.is_not_robot = !formState.is_not_robot"
                        >
                          <svg 
                            v-if="formState.is_not_robot"
                            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span 
                          class="text-sm cursor-pointer select-none" 
                          :style="{ color: formState.is_not_robot ? 'var(--text)' : 'var(--text-muted)' }"
                          @click="formState.is_not_robot = !formState.is_not_robot"
                        >
                          I'm not a robot
                        </span>
                        <div class="ml-auto text-right">
                          <div
                            class="text-xs font-mono"
                            style="color: var(--text-muted)"
                          >
                            reCAPTCHA
                          </div>
                          <div
                            class="text-[10px]"
                            style="color: var(--text-muted)"
                          >
                            Privacy · Terms
                          </div>
                        </div>
                      </div>
                      <p
                        class="text-[10px] leading-relaxed"
                        style="color: var(--text-muted)"
                      >
                        This site is protected by reCAPTCHA and the Google
                        Privacy Policy and Terms of Service apply.
                      </p>
                    </div>

                    <!-- Submit Button -->
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="w-full bg-accent hover:bg-accent/80 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/20 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        v-if="!isSubmitting"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                      <svg
                        v-else
                        class="animate-spin"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {{ isSubmitting ? "Mengirim..." : "Kirim Pesan" }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Success State -->
              <div v-else key="success" class="text-center py-10">
                <div
                  class="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-4"
                >
                  <svg
                    class="text-accent"
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
                <h3 class="font-display text-2xl font-bold mb-2">
                  Pesan Terkirim! 🎉
                </h3>
                <p class="text-sm" style="color: var(--text-muted)">
                  Terima kasih! Saya akan membalas emailmu dalam 24 jam.
                </p>
                <button
                  @click="resetForm"
                  class="mt-6 text-accent text-sm font-mono hover:underline"
                >
                  Kirim pesan lain →
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
