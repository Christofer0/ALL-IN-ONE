<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import api from "@/utils/api";

const route = useRoute();

// --- Data State ---
const project = ref<any>(null);
const isLoading = ref(true);
const imageLoaded = ref(false);

const adjacentProjects = ref({ prev: null as any, next: null as any });
const activeToc = ref("");

const setupRevealObserver = () => {
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
};

const handleScroll = () => {
  const sections = ["overview", "problem", "solution", "results"];
  let current = "";
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 150) {
      current = id;
    }
  }
  activeToc.value = current;
};

const injectHeadingIds = () => {
  const contentEl = document.querySelector(".prose div");
  if (!contentEl) return;
  const headings = contentEl.querySelectorAll("h3");
  const defaultIds = ["overview", "problem", "solution", "results"];
  headings.forEach((h, i) => {
    if (defaultIds[i]) {
      h.id = defaultIds[i];
    }
  });
};

const fetchProject = async () => {
  const slug = route.params.slug as string;
  try {
    const response = await api.get(`/projects/${slug}`);
    project.value = response.data;

    // Fetch all for navigation
    const allResponse = await api.get("/projects");
    const all = allResponse.data;
    const idx = all.findIndex((p: any) => p.slug === slug);
    adjacentProjects.value = {
      prev: idx > 0 ? all[idx - 1] : null,
      next: idx < all.length - 1 ? all[idx + 1] : null,
    };

    await nextTick();
    injectHeadingIds();
    setupRevealObserver();
  } catch (error) {
    console.error("Failed to fetch project:", error);
  } finally {
    isLoading.value = false;
  }
};

// --- Animations ---
onMounted(async () => {
  await fetchProject();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="public">
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div
        class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="!project"
      class="min-h-screen flex flex-col items-center justify-center text-center px-6"
    >
      <h1 class="text-4xl font-bold mb-4">Project Not Found</h1>
      <p class="text-muted-foreground mb-8">
        The project you're looking for doesn't exist or is no longer available.
      </p>
      <router-link to="/projects" class="text-accent underline"
        >Back to Projects</router-link
      >
    </div>

    <div v-else class="max-w-7xl mx-auto px-6 pt-28 pb-20">
      <!-- Back Button -->
      <div class="reveal mb-8">
        <router-link
          to="/projects"
          class="flex items-center gap-2 hover:text-accent text-sm font-mono transition-all group"
          style="color: var(--text-muted)"
        >
          <svg
            class="group-hover:-translate-x-1 transition-transform"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </router-link>
      </div>

      <!-- Hero Header -->
      <div class="mb-12">
        <div class="flex items-center gap-2 mb-4">
          <span
            class="bg-accent text-primary text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider"
          >
            {{ project.category }}
          </span>
          <span class="opacity-30 text-xs font-mono">{{
            new Date(project.createdAt).getFullYear()
          }}</span>
        </div>
        <h1
          class="font-display text-5xl md:text-7xl font-black mb-6 leading-[1.02] tracking-tight"
        >
          {{ project.title }}
        </h1>
        <p
          class="text-xl md:text-2xl leading-relaxed max-w-3xl mb-8"
          style="color: var(--text-muted)"
        >
          {{ project.description }}
        </p>

        <!-- Tech Stack Badges -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tech in project.techStack"
            :key="tech"
            class="border text-xs px-4 py-1.5 rounded-full font-mono transition-all hover:border-accent/40"
            style="
              background-color: var(--bg-card);
              border-color: var(--border);
              color: var(--text-muted);
            "
          >
            {{ tech }}
          </span>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="reveal flex gap-3 mb-12">
        <a
          v-if="project.demoUrl"
          :href="project.demoUrl"
          target="_blank"
          class="flex items-center gap-2 bg-accent hover:bg-accent/80 text-primary font-bold px-6 py-3 rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/30"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
            />
          </svg>
          Live Demo
        </a>
        <a
          v-if="project.githubUrl"
          :href="project.githubUrl"
          target="_blank"
          class="flex items-center gap-2 border hover:border-accent hover:text-accent font-medium px-6 py-3 rounded-full transition-all"
          style="border-color: var(--border); color: var(--text-muted)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
          GitHub Repo
        </a>
      </div>

      <!-- Cover Image -->
      <div class="mb-16">
        <div
          class="relative w-full h-80 md:h-[500px] rounded-3xl overflow-hidden shadow-xl bg-secondary/20"
        >
          <img
            :src="project.coverImage || project.cover_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=85'"
            :alt="project.title"
            class="w-full h-full object-cover rounded-3xl"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/40 to-transparent rounded-3xl pointer-events-none"
          ></div>
        </div>
      </div>

      <!-- Content Layout -->
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main Content -->
        <article class="flex-1 min-w-0">
          <!-- Quick Stats -->
          <div class="grid grid-cols-3 gap-4 mb-12">
            <div
              class="border rounded-2xl p-4 text-center"
              style="background-color: var(--bg-card); border-color: var(--border)"
            >
              <p class="font-display text-2xl md:text-3xl font-black text-accent mb-1">
                {{ project.duration || "3mo" }}
              </p>
              <p class="text-[10px] uppercase tracking-widest opacity-50">
                Duration
              </p>
            </div>
            <div
              class="border rounded-2xl p-4 text-center"
              style="background-color: var(--bg-card); border-color: var(--border)"
            >
              <p class="font-display text-2xl md:text-3xl font-black text-accent mb-1">
                {{ project.impact || "40%" }}
              </p>
              <p class="text-[10px] uppercase tracking-widest opacity-50">
                Impact
              </p>
            </div>
            <div
              class="border rounded-2xl p-4 text-center"
              style="background-color: var(--bg-card); border-color: var(--border)"
            >
              <p class="font-display text-2xl md:text-3xl font-black text-accent mb-1">
                {{ project.teamSize || project.team_size || "5+" }}
              </p>
              <p class="text-[10px] uppercase tracking-widest opacity-50">
                Team Size
              </p>
            </div>
          </div>

          <!-- Article Content -->
          <div class="prose max-w-none space-y-12">
            <!-- Structured Sections -->
            <div v-if="project.overview" id="overview">
              <h3 class="font-display text-2xl font-bold mb-4">Project Overview</h3>
              <div v-html="project.overview"></div>
            </div>

            <div v-if="project.problem" id="problem">
              <h3 class="font-display text-2xl font-bold mb-4">The Problem</h3>
              <div v-html="project.problem"></div>
            </div>

            <div v-if="project.solution" id="solution">
              <h3 class="font-display text-2xl font-bold mb-4">The Solution</h3>
              <div v-html="project.solution"></div>
            </div>

            <div v-if="project.results" id="results">
              <h3 class="font-display text-2xl font-bold mb-4">Results & Impact</h3>
              <div v-html="project.results"></div>
            </div>

            <!-- Legacy Fallback -->
            <div v-if="!project.overview" v-html="project.content"></div>
          </div>

          <!-- Screenshot Gallery (Mock for now) -->
          <div class="reveal mt-16 pt-10 border-t" style="border-color: var(--border)">
            <p class="font-mono text-accent text-xs tracking-widest mb-6 uppercase">
              // Project Gallery
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="group relative aspect-video rounded-2xl overflow-hidden border cursor-pointer border-border">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="Detail 1" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div class="group relative aspect-video rounded-2xl overflow-hidden border cursor-pointer border-border">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" alt="Detail 2" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
            </div>
          </div>
        </article>

        <!-- Sidebar -->
        <aside class="lg:w-80 flex-shrink-0">
          <div class="lg:sticky lg:top-28 space-y-6">
            <!-- TOC -->
            <div
              class="border rounded-2xl p-6"
              style="background-color: var(--bg-card); border-color: var(--border)"
            >
              <h4 class="font-mono text-accent text-[10px] tracking-[0.2em] mb-6 uppercase">
                // On this Page
              </h4>
              <nav class="flex flex-col gap-3">
                <a
                  v-for="item in ['Overview', 'Problem', 'Solution', 'Results']"
                  :key="item"
                  :href="`#${item.toLowerCase()}`"
                  class="text-sm transition-all hover:text-accent"
                  :class="activeToc === item.toLowerCase() ? 'text-accent pl-2 border-l border-accent' : 'text-muted-foreground'"
                >
                  {{ item }}
                </a>
              </nav>
            </div>

            <!-- Project Meta -->
            <div
              class="border rounded-2xl p-6"
              style="background-color: var(--bg-card); border-color: var(--border)"
            >
              <h4 class="font-mono text-accent text-[10px] tracking-[0.2em] mb-6 uppercase">
                // Project Info
              </h4>
              <div class="space-y-4 text-sm">
                <div>
                  <p class="text-[10px] uppercase tracking-wider mb-1 opacity-50">Role</p>
                  <p class="font-medium">Lead Developer</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider mb-1 opacity-50">Timeline</p>
                  <p class="font-medium">Jan 2024 – Present</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider mb-1 opacity-50">Availability</p>
                  <p class="flex items-center gap-2 font-medium">
                    <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow"></span>
                    Live in Production
                  </p>
                </div>
              </div>
            </div>

            <!-- Share -->
            <div
              class="border rounded-2xl p-6"
              style="background-color: var(--bg-card); border-color: var(--border)"
            >
              <h4 class="font-mono text-accent text-[10px] tracking-[0.2em] mb-6 uppercase">
                // Share Project
              </h4>
              <div class="flex gap-2">
                <button
                  v-for="social in ['Twitter', 'LinkedIn']"
                  :key="social"
                  class="flex-1 text-[10px] uppercase tracking-wider border hover:border-accent/40 rounded-xl py-2.5 transition-all bg-secondary/10"
                  style="border-color: var(--border)"
                >
                  {{ social }}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- Footer Navigation -->
      <div class="reveal mt-24 pt-10 border-t" style="border-color: var(--border)">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <router-link
            v-if="adjacentProjects.prev"
            :to="`/projects/${adjacentProjects.prev.slug}`"
            class="group flex items-center gap-4 border hover:border-accent/30 rounded-2xl p-6 transition-all"
            style="background-color: var(--bg-card); border-color: var(--border)"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-all bg-secondary/20 text-muted-foreground">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-mono mb-1 opacity-50">PREVIOUS</p>
              <p class="text-sm font-bold group-hover:text-accent transition-colors">
                {{ adjacentProjects.prev.title }}
              </p>
            </div>
          </router-link>
          <div v-else></div>

          <router-link
            v-if="adjacentProjects.next"
            :to="`/projects/${adjacentProjects.next.slug}`"
            class="group flex items-center justify-end gap-4 border hover:border-accent/30 rounded-2xl p-6 transition-all text-right"
            style="background-color: var(--bg-card); border-color: var(--border)"
          >
            <div>
              <p class="text-[10px] font-mono mb-1 opacity-50">NEXT</p>
              <p class="text-sm font-bold group-hover:text-accent transition-colors">
                {{ adjacentProjects.next.title }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-all bg-secondary/20 text-muted-foreground">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
