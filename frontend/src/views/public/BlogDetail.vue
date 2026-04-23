<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import api from "@/utils/api";

const route = useRoute();

// --- Data State ---
const article = ref<any>(null);
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

const fetchArticle = async () => {
  const slug = route.params.slug as string;
  try {
    const response = await api.get(`/blogs/${slug}`);
    article.value = response.data;
    console.log("Article loaded:", article.value); // Debug log to check the data structure
    await nextTick();
    setupRevealObserver();
  } catch (error) {
    console.error("Failed to fetch article:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchArticle();
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
      v-else-if="!article"
      class="min-h-screen flex flex-col items-center justify-center text-center px-6"
    >
      <h1 class="text-4xl font-bold mb-4">Article Not Found</h1>
      <p class="text-muted-foreground mb-8">
        The blog post you're looking for doesn't exist or has been removed.
      </p>
      <router-link to="/blog" class="text-accent underline"
        >Back to Blog</router-link
      >
    </div>

    <div v-else class="max-w-4xl mx-auto px-6 pt-28 pb-20">
      <!-- Back Button -->
      <div class="mb-8">
        <router-link
          to="/blog"
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
          Back to Blog
        </router-link>
      </div>

      <!-- Article Header -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <span
            class="bg-accent text-primary text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider"
          >
            {{ article.category }}
          </span>
          <span class="text-xs opacity-50 font-mono">{{
            new Date(article.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          }}</span>
        </div>
        <h1
          class="font-display text-4xl md:text-6xl font-black mb-8 leading-tight"
        >
          {{ article.title }}
        </h1>
        <p
          class="text-xl leading-relaxed italic border-l-4 border-accent pl-6 py-2"
          style="color: var(--text-muted)"
        >
          {{ article.excerpt || article.description }}
        </p>
      </div>

      <!-- Feature Image -->
      <div class="mb-16">
        <div
          class="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl"
        >
          <img
            :src="
              article.coverImage ||
              article.cover_image ||
              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80'
            "
            :alt="article.title"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Article Content -->
      <article class="prose prose-emerald max-w-none">
        <div v-html="article.content"></div>
      </article>

      <!-- Footer Navigation -->
      <div
        class="reveal mt-20 pt-10 border-t"
        style="border-color: var(--border)"
      >
        <router-link
          to="/blog"
          class="text-accent hover:underline font-mono text-sm"
        >
          &larr; Explore more articles
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom prose stlying for better reading experience */
.prose :deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  font-size: 1.125rem;
}
.prose :deep(h2) {
  color: var(--accent);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}
</style>
