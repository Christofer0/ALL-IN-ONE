<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isMenuOpen = ref(false);
const router = useRouter();

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};


onMounted(() => {
});
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
    style="background-color: var(--bg-nav); border-color: var(--border)"
  >
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <router-link
        to="/"
        class="font-mono text-accent font-medium tracking-widest text-sm"
      >
        &lt;PORTFOLIO /&gt;
      </router-link>

      <!-- Desktop Menu -->
      <ul
        class="hidden md:flex gap-8 text-sm font-medium"
        style="color: var(--text-muted)"
      >
        <li v-for="link in navLinks" :key="link.path">
          <router-link
            :to="link.path"
            class="hover:text-accent transition-colors"
            exact-active-class="text-accent"
          >
            {{ link.name }}
          </router-link>
        </li>
      </ul>

      <div class="flex items-center gap-3">

        <router-link
          to="/contact"
          class="hidden md:block bg-accent hover:bg-accent/80 text-white font-semibold text-sm px-4 py-2 rounded-full transition-all hover:scale-105"
        >
          Hire Me
        </router-link>

        <!-- Mobile menu btn -->
        <button
          @click="toggleMenu"
          class="md:hidden hover:text-accent transition-colors"
          style="color: var(--text-muted)"
        >
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 12h16M4 18h16" v-if="!isMenuOpen" />
            <path d="M6 18L18 6M6 6l12 12" v-else />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="isMenuOpen"
      class="md:hidden backdrop-blur px-6 py-4 border-t"
      style="background-color: var(--bg-card); border-color: var(--border)"
    >
      <ul
        class="flex flex-col gap-4 text-sm font-medium"
        style="color: var(--text-muted)"
      >
        <li v-for="link in navLinks" :key="link.path">
          <router-link
            :to="link.path"
            @click="isMenuOpen = false"
            class="hover:text-accent transition-colors block"
            exact-active-class="text-accent"
          >
            {{ link.name }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>
