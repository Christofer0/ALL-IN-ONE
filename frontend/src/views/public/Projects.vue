<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import api from "@/utils/api";
import type { Project } from "@/types";

// --- Data Types ---

const projects = ref<Project[]>([]);
const isLoading = ref(true);

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

onMounted(async () => {
  try {
    const response = await api.get("/projects");
    projects.value = response.data;
    console.log("Projects loaded:", projects.value); // Debug log to check image field names
    // Wait for DOM to render icons/cards before observing
    await nextTick();
    setupRevealObserver();
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  } finally {
    isLoading.value = false;
  }
});

// --- State ---
const activeFilter = ref("all");
const searchQuery = ref("");

const categories = computed(() => {
  const cats = new Set(projects.value.map((p) => p.category));
  return [
    { id: "all", label: "All" },
    ...Array.from(cats).map((c) => ({ id: c, label: c })),
  ];
});

// --- Logic ---
const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const matchFilter =
      activeFilter.value === "all" || project.category === activeFilter.value;
    const matchSearch = project.title
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    return matchFilter && matchSearch;
  });
});

const resetFilters = () => {
  activeFilter.value = "all";
  searchQuery.value = "";
};

const setFilter = (id: string) => {
  activeFilter.value = id;
};

const truncate = (text: string, length: number) => {
  if (text.length <= length) return text;

  return text.substring(0, length).split(" ").slice(0, -1).join(" ") + "...";
};
</script>

<template>
  <div class="public">
    <div class="max-w-7xl mx-auto px-6 pt-28 pb-20">
      <!-- Page Header -->
      <div class="reveal mb-12">
        <p class="font-mono text-accent text-xs tracking-widest mb-2">
          // PORTFOLIO
        </p>
        <h1 class="font-display text-5xl md:text-6xl font-black mb-4">
          My Projects
        </h1>
        <p class="max-w-xl leading-relaxed" style="color: var(--text-muted)">
          A curated collection of things I've built — from enterprise platforms
          to personal experiments. Each one taught me something new.
        </p>
      </div>

      <!-- Filter & Search Bar -->
      <div class="reveal mb-10">
        <div class="flex flex-col sm:flex-row gap-4 mb-5">
          <!-- Search -->
          <div class="relative flex-1 max-w-sm">
            <svg
              class="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30"
              width="15"
              height="15"
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
              placeholder="Search projects..."
              class="w-full border focus:border-accent/60 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-accent/30"
              style="
                background-color: var(--bg-card);
                border-color: var(--border);
                color: var(--text);
              "
            />
          </div>
        </div>
        <!-- Category Pills -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="setFilter(cat.id)"
            class="filter-btn font-mono text-xs px-4 py-1.5 rounded-full border transition-all"
            :class="{ active: activeFilter === cat.id }"
            :style="
              activeFilter !== cat.id
                ? { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                : {}
            "
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Projects Grid -->
      <transition-group
        v-if="filteredProjects.length > 0"
        name="list"
        tag="div"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="(project, index) in filteredProjects"
          :key="project.id"
          class="project-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div
            class="card-inner rounded-2xl overflow-hidden border h-full transition-all duration-300"
            style="
              background-color: var(--bg-card);
              border-color: var(--border);
            "
          >
            <div class="relative h-48 overflow-hidden">
              <img
                :src="
                  project.coverImage ||
                  project.cover_image ||
                  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80'
                "
                :alt="project.title"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent"
              ></div>
              <!-- Featured Badge -->
              <span
                v-if="project.isFeatured"
                class="absolute top-3 right-3 bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded italic tracking-tighter"
              >
                FEATURED
              </span>
              <span
                class="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-3 py-0.5 rounded-full"
              >
                {{ project.category }}
              </span>
            </div>
            <div class="p-5">
              <h3 class="font-display text-xl font-bold mb-2">
                {{ project.title }}
              </h3>
              <p
                class="text-sm leading-relaxed mb-4"
                style="color: var(--text-muted)"
              >
                {{ truncate(project.description, 110) }}
              </p>
              <div class="flex gap-2 flex-wrap mb-4">
                <span
                  v-for="(tag, i) in project.techStack"
                  :key="tag"
                  class="text-xs border rounded-full px-2.5 py-0.5"
                  :class="{ 'border-accent/20 text-accent': i === 0 }"
                  :style="
                    i !== 0
                      ? {
                          backgroundColor: 'var(--bg)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-muted)',
                        }
                      : { backgroundColor: 'var(--bg)' }
                  "
                >
                  {{ tag }}
                </span>
              </div>
              <router-link
                :to="`/projects/${project.slug}`"
                class="flex items-center gap-1.5 text-accent text-xs font-mono hover:gap-3 transition-all"
              >
                View Case Study <span>&rarr;</span>
              </router-link>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Empty State -->
      <div v-else class="text-center py-24 animate-fade-up">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="font-display text-2xl font-bold mb-2">No projects found</h3>
        <p class="text-sm" style="color: var(--text-muted)">
          Try adjusting your search or filter to find what you're looking for.
        </p>
        <button
          @click="resetFilters"
          class="mt-6 text-accent text-sm font-mono hover:underline"
        >
          Clear filters &rarr;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
