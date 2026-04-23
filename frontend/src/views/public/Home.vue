<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import api from "@/utils/api";
import type { Project } from "@/types";

// --- Data Types ---

const featuredProjects = ref<Project[]>([]);
const isLoading = ref(true);

const skills = [
  { name: "Node.js", icon: "🟢", category: "Runtime", color: "#68a063" },
  { name: "React", icon: "⚛️", category: "Frontend", color: "#61dafb" },
  { name: "Vue.js", icon: "💚", category: "Frontend", color: "#42b883" },
  { name: "TypeScript", icon: "🔷", category: "Language", color: "#3178c6" },
  { name: "Python", icon: "🐍", category: "Backend", color: "#3776ab" },
  { name: "Go", icon: "🐹", category: "Backend", color: "#00add8" },
  { name: "Java", icon: "☕", category: "Backend", color: "#ed8b00" },
  { name: "Cloud", icon: "☁️", category: "Infrastructure", color: "#3b82f6" },
  { name: "PostgreSQL", icon: "🐘", category: "Database", color: "#336791" },
  { name: "MongoDB", icon: "🌿", category: "Database", color: "#47a248" },
];

const stats = [
  { value: "1+", label: "Years Experience", delay: "0s" },
  { value: "10+", label: "Projects Shipped", delay: "0.1s" },
  { value: "3+", label: "Happy Clients", delay: "0.2s" },
  { value: "∞", label: "Cups of Coffee", delay: "0.3s" },
];

onMounted(async () => {
  // Fetch Projects
  try {
    const response = await api.get("/projects");
    // Sort so featured ones come first, or just take slice
    featuredProjects.value = response.data
      .sort(
        (a: Project, b: Project) =>
          (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0),
      )
      .slice(0, 4);

    // Wait for DOM to render dynamic projects before observing
    await nextTick();
    setupRevealObserver();
  } catch (error) {
    console.error("Failed to fetch featured projects:", error);
  } finally {
    isLoading.value = false;
  }
});

// Moved outside setup for reusability if needed, or kept inside
const setupRevealObserver = () => {
  // Reveal Observer
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), 80);
        }
      });
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
};

const truncate = (text: string, length: number) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length).split(" ").slice(0, -1).join(" ") + "...";
};
</script>

<template>
  <div>
    <!-- HERO SECTION -->
    <section class="relative min-h-screen flex items-center mesh grid-bg pt-20">
      <div
        class="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center w-full"
      >
        <!-- Left Content -->
        <div class="relative z-10">
          <div
            class="inline-flex items-center gap-2 border border-accent/30 rounded-full px-4 py-1.5 text-xs font-mono text-accent mb-8 animate-fade-in"
            style="background-color: var(--bg-card)"
          >
            <span
              class="w-2 h-2 rounded-full bg-accent animate-pulse-slow"
            ></span>
            Available for opportunities
          </div>
          <h1
            class="font-display text-5xl md:text-7xl font-black leading-[0.95] mb-6 animate-fade-up"
            style="animation-delay: 0.1s"
          >
            Hi, I'm<br />
            <span class="text-accent italic">Brillian</span><br />
            <span class="text-light/30">Christofer</span>
          </h1>
          <p
            class="text-lg leading-relaxed mb-8 max-w-md animate-fade-up"
            style="color: var(--text-muted); animation-delay: 0.2s"
          >
            Full-Stack Developer & UI/UX Enthusiast crafting digital experiences
            that live at the intersection of
            <span class="text-accent font-medium">design</span> and
            <span class="text-accent font-medium">function</span>.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 animate-fade-up" style="animation-delay: 0.3s">
            <router-link
              to="/projects"
              class="bg-accent hover:bg-accent/80 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/30"
            >
              View Projects
            </router-link>
            <router-link
              to="/about"
              class="border hover:border-accent hover:text-accent font-medium px-6 py-3 rounded-full transition-all"
              style="border-color: var(--border); color: var(--text-muted)"
            >
              About Me →
            </router-link>
          </div>
          <!-- Scroll indicator -->
          <div
            class="mt-16 flex items-center gap-3 text-xs animate-fade-in"
            style="color: var(--text-muted); animation-delay: 0.6s"
          >
            <div class="flex flex-col gap-0.5">
              <div class="w-0.5 h-4 bg-light/20 rounded-full mx-auto"></div>
              <div
                class="w-0.5 h-4 bg-accent/60 rounded-full mx-auto animate-float"
              ></div>
            </div>
            <span class="font-mono tracking-widest uppercase">Scroll Down</span>
          </div>
        </div>

        <!-- Right Content - Floating Code Card -->
        <div
          class="relative flex justify-center items-center animate-fade-in"
          style="animation-delay: 0.4s"
        >
          <div class="animate-float">
            <div
              class="backdrop-blur border border-accent/20 rounded-2xl p-6 font-mono text-sm w-full max-w-[320px] shadow-2xl"
              style="background-color: var(--bg-card)"
            >
              <div class="flex gap-1.5 mb-4">
                <span class="w-3 h-3 rounded-full bg-red-400/70"></span>
                <span class="w-3 h-3 rounded-full bg-yellow-400/70"></span>
                <span class="w-3 h-3 rounded-full bg-green-400/70"></span>
              </div>
              <div class="space-y-1.5 text-[10px] leading-relaxed">
                <p>
                  <span class="text-purple-400">const</span>
                  <span class="text-accent">developer</span> = {
                </p>
                <p class="pl-4">
                  <span class="text-gray-400">name:</span>
                  <span class="text-yellow-300">"Brillian Christofer"</span>,
                </p>
                <p class="pl-4">
                  <span class="text-gray-400">role:</span>
                  <span class="text-yellow-300">"Full-Stack Dev"</span>,
                </p>
                <p class="pl-4">
                  <span class="text-gray-400">passion:</span>
                  <span class="text-yellow-300">"Clean UI"</span>,
                </p>
                <p class="pl-4"><span class="text-gray-400">stack:</span> [</p>
                <p class="pl-8">
                  <span class="text-green-400">"React"</span>,
                  <span class="text-green-400">"Node"</span>,
                </p>
                <p class="pl-8">
                  <span class="text-green-400">"TypeScript"</span>,
                  <span class="text-green-400">"Go"</span>,
                </p>
                <p class="pl-4">],</p>
                <p>
                  <span class="text-purple-400">}</span>
                  <span class="cursor text-accent">|</span>
                </p>
              </div>
            </div>
          </div>
          <!-- Decorative rings -->
          <div
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              class="w-64 h-64 md:w-72 md:h-72 rounded-full border border-accent/10 animate-pulse-slow"
            ></div>
          </div>
          <div
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
            style="animation-delay: 1s"
          >
            <div
              class="w-80 h-80 md:w-96 md:h-96 rounded-full border border-accent/5"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- SELECTED WORKS SECTION -->
    <section class="py-24 relative">
      <div class="max-w-7xl mx-auto px-6">
        <div class="reveal flex items-end justify-between mb-14">
          <div>
            <p class="font-mono text-accent text-xs tracking-widest mb-2">
              // SELECTED WORKS
            </p>
            <h2 class="font-display text-4xl md:text-5xl font-bold">
              Featured Projects
            </h2>
          </div>
          <router-link
            to="/projects"
            class="hidden md:flex items-center gap-2 text-accent/70 hover:text-accent text-sm font-medium transition-colors"
          >
            All Projects <span>→</span>
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="project in featuredProjects"
            :key="project.id"
            class="reveal group relative rounded-2xl overflow-hidden card-glow transition-all duration-300 cursor-pointer"
            :class="{ 'lg:col-span-2': project.isFeatured }"
            style="background-color: var(--bg-card)"
          >
            <div
              class="relative overflow-hidden"
              :class="project.isFeatured ? 'h-64' : 'h-48'"
            >
              <img
                :src="
                  project.coverImage ||
                  project.cover_image ||
                  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80'
                "
                :alt="project.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent"
              ></div>
              <div class="absolute top-4 left-4 flex gap-2">
                <span
                  v-if="project.isFeatured"
                  class="bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full"
                  >Featured</span
                >
                <span
                  class="bg-primary/60 backdrop-blur text-light/70 text-xs px-3 py-1 rounded-full"
                  >{{ project.category }}</span
                >
              </div>
            </div>
            <div class="p-6">
              <h3
                class="font-display text-xl md:text-2xl font-bold mb-2 group-hover:text-accent transition-colors"
              >
                {{ project.title }}
              </h3>
              <p
                class="text-sm leading-relaxed mb-4"
                style="color: var(--text-muted)"
              >
                {{
                  project.isFeatured
                    ? project.description
                    : truncate(project.description, 100)
                }}
              </p>
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  v-for="tag in project.techStack"
                  :key="tag"
                  class="text-xs rounded-full px-3 py-1 border border-accent/20"
                  style="background-color: var(--bg); color: var(--accent)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            <router-link
              :to="'/projects/' + project.slug"
              class="absolute inset-0"
            ></router-link>
          </div>
        </div>

        <div class="reveal text-center mt-8 md:hidden">
          <router-link to="/projects" class="text-accent text-sm font-medium"
            >View All Projects →</router-link
          >
        </div>
      </div>
    </section>

    <!-- SKILLS SECTION -->
    <section
      class="py-24 relative overflow-hidden"
      style="
        background-color: color-mix(in srgb, var(--bg-card) 60%, var(--bg));
      "
    >
      <div class="max-w-7xl mx-auto px-6">
        <div class="reveal text-center mb-16">
          <p class="font-mono text-accent text-xs tracking-widest mb-2">
            // EXPERTISE
          </p>
          <h2 class="font-display text-4xl md:text-5xl font-bold">
            Skills & Tech Stack
          </h2>
        </div>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <div
            v-for="(skill, index) in skills"
            :key="skill.name"
            class="reveal group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
            :style="{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              animationDelay: `${index * 0.05}s`,
            }"
          >
            <!-- Decorative Background Glow -->
            <div
              class="absolute -right-4 -top-4 w-16 h-16 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
              :style="{ backgroundColor: skill.color }"
            ></div>

            <div class="relative z-10">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-3xl mb-4 bg-primary/5 group-hover:scale-110 transition-transform duration-300"
                :style="{
                  background: `linear-gradient(135deg, ${skill.color}15, transparent)`,
                }"
              >
                {{ skill.icon }}
              </div>
              <h3
                class="font-display font-bold text-lg mb-1 group-hover:text-accent transition-colors"
              >
                {{ skill.name }}
              </h3>
              <p
                class="text-[10px] font-mono uppercase tracking-widest opacity-50"
              >
                {{ skill.category }}
              </p>
            </div>

            <!-- Bottom Accent Line -->
            <div
              class="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
              :style="{ backgroundColor: skill.color }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS SECTION -->
    <section class="py-16 border-y" style="border-color: var(--border)">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="reveal"
            :style="{ animationDelay: stat.delay }"
          >
            <p class="font-display text-5xl font-black text-accent mb-1">
              {{ stat.value }}
            </p>
            <p class="text-sm" style="color: var(--text-muted)">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="py-28 relative overflow-hidden">
      <div
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl"
        ></div>
      </div>
      <div class="reveal max-w-3xl mx-auto px-6 text-center relative z-10">
        <p class="font-mono text-accent text-xs tracking-widest mb-4 uppercase">
          // Let's build something
        </p>
        <h2
          class="font-display text-5xl md:text-6xl font-black mb-6 leading-tight"
        >
          Have an idea?<br />
          <span class="text-accent italic">Let's talk.</span>
        </h2>
        <p
          class="leading-relaxed mb-10 text-lg"
          style="color: var(--text-muted)"
        >
          I'm currently available for freelance projects and full-time roles. If
          you have a project in mind or just want to chat, I'd love to hear from
          you.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/contact"
            class="bg-accent hover:bg-accent/80 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 hover:shadow-xl hover:shadow-accent/30 text-lg"
          >
            Get In Touch 👋
          </router-link>
          <router-link
            to="/about"
            class="border hover:border-accent hover:text-accent font-medium px-8 py-4 rounded-full transition-all"
            style="border-color: var(--border); color: var(--text-muted)"
          >
            Learn About Me
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
