<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import api from "@/utils/api";
import type { Blog } from "@/types";

// --- Data Types ---

const articles = ref<Blog[]>([]);
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
    const response = await api.get("/blogs");
    articles.value = response.data;

    // Wait for DOM to render cards before observing
    await nextTick();
    setupRevealObserver();
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
  } finally {
    isLoading.value = false;
  }
});

// --- State ---
const activeCategory = ref("all");
const searchQuery = ref("");

const categories = [
  { id: "all", label: "All" },
  { id: "general", label: "General" },
  { id: "tutorial", label: "Tutorial" },
  { id: "career", label: "Career" },
  { id: "engineering", label: "Engineering" },
  { id: "design", label: "Design" },
];

// --- Logic ---
const filteredArticles = computed(() => {
  return articles.value.filter((article) => {
    const matchCat =
      activeCategory.value === "all" ||
      article.category === activeCategory.value;
    const matchSearch =
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (article.excerpt || "")
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());
    return matchCat && matchSearch;
  });
});

const setCategory = (id: string) => {
  activeCategory.value = id;
};

// Animation observer is now triggered after data fetch
</script>

<template>
  <div class="public">
    <div class="max-w-7xl mx-auto px-6 pt-28 pb-20">
      <!-- Hero / Search Header -->
      <div class="reveal mb-10">
        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="font-mono text-accent text-xs tracking-widest mb-2">
              // THOUGHTS & LEARNINGS
            </p>
            <h1 class="font-display text-5xl md:text-6xl font-black">Blog</h1>
          </div>
          <!-- RSS Link -->
          <a
            href="#"
            title="Subscribe via RSS"
            class="flex items-center gap-2 border hover:border-accent/50 hover:text-accent rounded-xl px-4 py-2.5 text-xs font-mono transition-all"
            style="border-color: var(--border); color: var(--text-muted)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z"
              />
            </svg>
            RSS Feed
          </a>
        </div>
        <!-- Search -->
        <div class="relative max-w-md">
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
            placeholder="Search articles..."
            class="w-full border focus:border-accent/60 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-accent/30"
            style="
              background-color: var(--bg-card);
              border-color: var(--border);
              color: var(--text);
            "
          />
        </div>
      </div>

      <!-- Category Selector -->
      <div class="reveal mb-10 -mx-6 px-6 overflow-x-auto">
        <div class="flex gap-2 min-w-max">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="setCategory(cat.id)"
            class="cat-btn font-mono text-xs px-4 py-1.5 rounded-full border transition-all"
            :class="{ active: activeCategory === cat.id }"
            :style="
              activeCategory !== cat.id
                ? { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                : {}
            "
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Articles Grid -->
      <transition-group
        v-if="filteredArticles.length > 0"
        name="list"
        tag="div"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="article in filteredArticles"
          :key="article.id"
          class="article-card reveal"
          :class="{ 'md:col-span-2': article.isFeatured }"
        >
          <router-link :to="`/blog/${article.slug}`" class="block h-full">
            <div
              class="card-body border rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col"
              style="
                background-color: var(--bg-card);
                border-color: var(--border);
              "
            >
              <div
                v-if="article.coverImage || article.cover_image"
                class="relative overflow-hidden"
                :class="article.isFeatured ? 'h-64' : 'h-44'"
              >
                <img
                  :src="
                    article.coverImage ||
                    article.cover_image ||
                    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80'
                  "
                  :alt="article.title"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div
                  v-if="article.isFeatured"
                  class="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[color-mix(in_srgb,var(--bg-card)_30%,transparent)] to-transparent"
                ></div>
                <div
                  v-else
                  class="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent"
                ></div>

                <div class="absolute top-4 left-4 flex gap-2">
                  <span
                    v-if="article.isFeatured"
                    class="bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full"
                  >
                    ⭐ Featured
                  </span>
                  <span
                    class="backdrop-blur text-xs px-3 py-1 rounded-full border"
                    style="
                      background-color: color-mix(
                        in srgb,
                        var(--bg) 60%,
                        transparent
                      );
                      border-color: var(--border);
                      color: var(--text-muted);
                    "
                  >
                    {{ article.category }}
                  </span>
                </div>
              </div>

              <!-- Content for Featured Article -->
              <div v-if="article.isFeatured" class="p-6 flex-1 flex flex-col">
                <h2 class="font-display text-2xl font-bold mb-3 leading-snug">
                  {{ article.title }}
                </h2>
                <p
                  class="text-sm leading-relaxed mb-4 flex-1"
                  style="color: var(--text-muted)"
                >
                  {{ article.excerpt }}
                </p>
                <div
                  class="flex items-center gap-3 text-xs font-mono mt-auto"
                  style="color: var(--text-muted)"
                >
                  <span>{{
                    new Date(article.createdAt).toLocaleDateString()
                  }}</span>
                  <span>•</span>
                  <span>{{ article.readTime }}</span>
                </div>
              </div>

              <!-- Content for Regular Article -->
              <div v-else class="p-5 flex-1 flex flex-col">
                <!-- If no image, show category label here -->
                <span
                  v-if="!article.coverImage && !article.cover_image"
                  class="text-xs text-accent font-mono mb-3 block"
                >
                  {{ article.category }}
                </span>

                <h3 class="font-display text-lg font-bold mb-2 leading-snug">
                  {{ article.title }}
                </h3>
                <p
                  class="text-xs leading-relaxed mb-3 flex-1"
                  style="color: var(--text-muted)"
                >
                  {{ article.excerpt }}
                </p>
                <div
                  class="flex items-center gap-2 text-xs font-mono mt-auto"
                  style="color: var(--text-muted)"
                >
                  <span>{{
                    new Date(article.createdAt).toLocaleDateString()
                  }}</span>
                  <span>•</span>
                  <span>{{ article.readTime }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </transition-group>

      <!-- Empty State -->
      <div v-if="filteredArticles.length === 0" class="text-center py-24">
        <div class="text-5xl mb-4">📭</div>
        <h3 class="font-display text-xl font-bold mb-2">No articles found</h3>
        <p class="text-sm" style="color: var(--text-muted)">
          Try a different keyword or category.
        </p>
      </div>

      <!-- Pagination Placeholder -->
      <div class="reveal flex items-center justify-center gap-2 mt-14">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl border hover:border-accent/40 hover:text-accent transition-all text-sm"
          style="border-color: var(--border); color: var(--text-muted)"
        >
          ←
        </button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl bg-accent text-primary font-bold text-sm"
        >
          1
        </button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl border hover:border-accent/40 hover:text-accent transition-all text-sm"
          style="border-color: var(--border); color: var(--text-muted)"
        >
          2
        </button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl border hover:border-accent/40 hover:text-accent transition-all text-sm"
          style="border-color: var(--border); color: var(--text-muted)"
        >
          3
        </button>
        <span class="text-sm" style="color: var(--text-muted)">...</span>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl border hover:border-accent/40 hover:text-accent transition-all text-sm"
          style="border-color: var(--border); color: var(--text-muted)"
        >
          8
        </button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl border hover:border-accent/40 hover:text-accent transition-all text-sm"
          style="border-color: var(--border); color: var(--text-muted)"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-active {
  position: absolute;
}
</style>
