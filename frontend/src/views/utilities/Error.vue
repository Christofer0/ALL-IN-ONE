<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const searchQuery = ref("");

const handleSearch = () => {
  const q = searchQuery.value.trim();
  if (q) {
    window.location.href = `index.html?q=${encodeURIComponent(q)}`;
  }
};

const goBack = () => {
  router.back();
};

// Intersection Observer for reveal animations
let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    observer.observe(el);
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<template>
  <div
    class="error-page bg-slate-900 font-sans text-white overflow-x-hidden min-h-screen flex flex-col relative"
  >
    <!-- Grain Overlay -->
    <div class="grain-overlay"></div>

    <!-- NAVBAR -->
    <nav
      class="relative z-10 border-b border-sky-700/40 bg-slate-900/70 backdrop-blur-md"
    >
      <div
        class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"
      >
        <router-link
          to="/"
          class="font-mono text-cyan-400 font-medium tracking-widest text-sm"
        >
          &lt;PORTFOLIO /&gt;
        </router-link>
        <ul class="hidden md:flex gap-8 text-sm font-medium text-white/60">
          <li>
            <router-link to="/" class="hover:text-cyan-400 transition-colors"
              >Home</router-link
            >
          </li>
          <li>
            <router-link
              to="/about"
              class="hover:text-cyan-400 transition-colors"
              >About</router-link
            >
          </li>
          <li>
            <router-link
              to="/projects"
              class="hover:text-cyan-400 transition-colors"
              >Projects</router-link
            >
          </li>
          <li>
            <router-link
              to="/blog"
              class="hover:text-cyan-400 transition-colors"
              >Blog</router-link
            >
          </li>
          <li>
            <router-link
              to="/contact"
              class="hover:text-cyan-400 transition-colors"
              >Contact</router-link
            >
          </li>
        </ul>
        <router-link
          to="/contact"
          class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-full transition-all"
        >
          Hire Me
        </router-link>
      </div>
    </nav>

    <!-- MAIN -->
    <main
      class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 text-center"
    >
      <!-- SVG Illustration -->
      <div class="animate-float mb-10 relative">
        <!-- Orbit rings -->
        <div
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            class="w-52 h-52 rounded-full border border-cyan-400/10 relative"
          >
            <div
              class="orbit-dot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                class="w-3 h-3 rounded-full bg-cyan-400/60 shadow-lg shadow-cyan-400/40"
              ></div>
            </div>
          </div>
        </div>
        <div
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div class="w-72 h-72 rounded-full border border-sky-600/30 relative">
            <div
              class="orbit-dot2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div class="w-2 h-2 rounded-full bg-sky-500/80"></div>
            </div>
          </div>
        </div>
        <!-- Core SVG -->
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="relative z-10"
        >
          <!-- Outer glow circle -->
          <circle
            cx="110"
            cy="110"
            r="90"
            stroke="rgba(34,211,238,0.15)"
            stroke-width="1.5"
          />
          <circle
            cx="110"
            cy="110"
            r="72"
            stroke="rgba(34,211,238,0.08)"
            stroke-width="1"
            stroke-dasharray="4 6"
          />
          <!-- Planet body -->
          <circle cx="110" cy="110" r="55" fill="url(#planetGrad)" />
          <!-- Planet ring -->
          <ellipse
            cx="110"
            cy="110"
            rx="80"
            ry="18"
            stroke="rgba(34,211,238,0.35)"
            stroke-width="1.5"
            fill="none"
            transform="rotate(-15 110 110)"
          />
          <!-- Crater details -->
          <circle cx="92" cy="98" r="8" fill="rgba(15,23,42,0.3)" />
          <circle cx="128" cy="120" r="5" fill="rgba(15,23,42,0.25)" />
          <circle cx="105" cy="128" r="3" fill="rgba(15,23,42,0.2)" />
          <!-- Star sparkles -->
          <g fill="rgba(255,255,255,0.6)">
            <circle cx="30" cy="35" r="1.5" />
            <circle cx="185" cy="42" r="1" />
            <circle cx="200" cy="90" r="1.5" />
            <circle cx="18" cy="145" r="1" />
            <circle cx="195" cy="170" r="1.5" />
            <circle cx="55" cy="185" r="1" />
          </g>
          <defs>
            <radialGradient id="planetGrad" cx="38%" cy="38%">
              <stop offset="0%" stop-color="#0891b2" />
              <stop offset="100%" stop-color="#0f172a" />
            </radialGradient>
          </defs>
        </svg>
        <!-- 404 text on planet -->
        <div class="absolute inset-0 flex items-center justify-center z-20">
          <span
            class="font-mono text-cyan-400 font-bold text-2xl tracking-widest opacity-80"
            >404</span
          >
        </div>
      </div>

      <!-- Glitch Headline -->
      <div class="mb-4 animate-fade-up" style="animation-delay: 0.1s">
        <p class="font-mono text-cyan-400 text-xs tracking-widest mb-3">
          // ERROR_404
        </p>
        <h1
          class="font-serif text-5xl md:text-7xl font-black mb-0 leading-tight"
        >
          <span class="glitch-wrap" data-text="Lost in">Lost in</span>
          <br />
          <span class="text-cyan-400 italic">Space</span>
        </h1>
      </div>

      <p
        class="text-white/50 text-lg max-w-md leading-relaxed mb-8 animate-fade-up"
        style="animation-delay: 0.2s"
      >
        Oops! We can't find that page. It may have been moved, deleted, or
        perhaps never existed in this galaxy.
      </p>

      <!-- Search Bar -->
      <div
        class="w-full max-w-md mb-8 animate-fade-up"
        style="animation-delay: 0.25s"
      >
        <div class="relative">
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for something..."
            class="w-full bg-sky-800/30 border border-sky-700/60 focus:border-cyan-400/70 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-1 focus:ring-cyan-400/30 backdrop-blur-sm"
            @keydown.enter="handleSearch"
          />
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            @click="handleSearch"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Back to Home CTA -->
      <div
        class="flex flex-col sm:flex-row gap-3 mb-12 animate-fade-up"
        style="animation-delay: 0.3s"
      >
        <router-link
          to="/"
          class="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-8 py-3.5 rounded-full transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 text-base"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to Home
        </router-link>
        <button
          class="flex items-center gap-2 border border-white/20 hover:border-cyan-400 text-white/60 hover:text-cyan-400 font-medium px-8 py-3.5 rounded-full transition-all"
          @click="goBack"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>

      <!-- Popular Links -->
      <div class="reveal animate-fade-up" style="animation-delay: 0.35s">
        <p class="text-white/30 text-xs font-mono tracking-widest mb-4">
          // POPULAR PAGES
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <router-link
            to="/about"
            class="flex items-center gap-2 bg-sky-800/40 hover:bg-sky-800/70 border border-sky-700/60 hover:border-cyan-400/40 text-white/60 hover:text-cyan-400 text-sm px-4 py-2 rounded-full transition-all"
          >
            <span>👤</span> About Me
          </router-link>
          <router-link
            to="/projects"
            class="flex items-center gap-2 bg-sky-800/40 hover:bg-sky-800/70 border border-sky-700/60 hover:border-cyan-400/40 text-white/60 hover:text-cyan-400 text-sm px-4 py-2 rounded-full transition-all"
          >
            <span>🚀</span> Projects
          </router-link>
          <router-link
            to="/blog"
            class="flex items-center gap-2 bg-sky-800/40 hover:bg-sky-800/70 border border-sky-700/60 hover:border-cyan-400/40 text-white/60 hover:text-cyan-400 text-sm px-4 py-2 rounded-full transition-all"
          >
            <span>✍️</span> Blog
          </router-link>
          <router-link
            to="/contact"
            class="flex items-center gap-2 bg-sky-800/40 hover:bg-sky-800/70 border border-sky-700/60 hover:border-cyan-400/40 text-white/60 hover:text-cyan-400 text-sm px-4 py-2 rounded-full transition-all"
          >
            <span>💬</span> Contact
          </router-link>
        </div>
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="relative z-10 border-t border-sky-700/40 py-8">
      <div
        class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3"
      >
        <p class="font-mono text-cyan-400 text-sm">&lt;PORTFOLIO /&gt;</p>
        <p class="text-white/20 text-xs">
          © 2026 Alex Kurniawan. Page not found — but you are!
        </p>
        <p class="font-mono text-xs text-white/20">ERR_404_NOT_FOUND</p>
      </div>
    </footer>
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

/* Floating Animation */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(2deg);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Orbit animations */
@keyframes orbit {
  0% {
    transform: rotate(0deg) translateX(75px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(75px) rotate(-360deg);
  }
}
.orbit-dot {
  animation: orbit 8s linear infinite;
}

@keyframes orbit2 {
  0% {
    transform: rotate(0deg) translateX(105px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(105px) rotate(-360deg);
  }
}
.orbit-dot2 {
  animation: orbit2 12s linear infinite reverse;
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

/* Glitch Effect */
.glitch-wrap {
  position: relative;
  display: inline-block;
}

.glitch-wrap::before,
.glitch-wrap::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-wrap::before {
  animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
  color: #ff6b6b;
  z-index: -1;
}

.glitch-wrap::after {
  animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both
    infinite;
  color: #4ecdc4;
  z-index: -2;
}

@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

/* Reveal Animation */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
