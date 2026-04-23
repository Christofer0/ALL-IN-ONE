<script setup lang="ts">
import { onMounted } from "vue";

// --- Mock Data ---

const workHistory = [
  {
    role: "Backend Developer Intern",
    company: "Alfamart",
    type: "Internship",
    period: "2023 – 2024",
    status: "past",
    tasks: [
      "Developed and maintained internal backend services using Java and Python",
      "Worked with relational databases (MySQL, Oracle) for data processing and reporting",
      "Collaborated with team to improve system reliability and performance",
    ],
  },
  {
    role: "Full-Stack Developer",
    company: "FTI Service (Campus Project)",
    type: "Project",
    period: "2024",
    status: "past",
    tasks: [
      "Built digital signature web application to streamline campus administrative processes",
      "Implemented real-time features and secure authentication using JWT",
      "Designed admin dashboard for document tracking and approval workflows",
    ],
  },
  {
    role: "Backend Developer",
    company: "System Migration Project",
    type: "Project",
    period: "2024",
    status: "past",
    tasks: [
      "Migrated legacy system from PHP to Python-based backend architecture",
      "Re-designed database from Oracle to MongoDB for better scalability",
      "Improved system performance and simplified data access patterns",
    ],
  },
  {
    role: "Independent Developer",
    company: "Personal Projects",
    type: "Personal",
    period: "2023 – Present",
    status: "active",
    tasks: [
      "Developing 'ALL IN ONE' platform with modules like cashflow tracking, goal management, and AI assistant",
      "Built REST APIs using Java, Go, and Python with PostgreSQL and Supabase integration",
      "Implemented authentication, admin dashboard, and modular backend architecture",
    ],
  },
];

const educationGrid = [
  {
    institution: "Universitas Kristen Satya Wacana",
    degree: "S1 Sistem Informasi",
    period: "2022 – 2026",
    meta: "GPA 3.83/4.00",
    description:
      "Thesis: 'Optimizing Graph Traversal for Social Network Analysis'",
    icon: "🎓",
  },
  {
    institution: "AWS Certified Solutions Architect",
    degree: "Professional",
    period: "2022",
    meta: "Amazon Web Services",
    icon: "📜",
  },
  {
    institution: "Google UX Design Certificate",
    degree: "Professional",
    period: "2021",
    meta: "Google / Coursera",
    icon: "📜",
  },
  {
    institution: "SMAN 1 Pati",
    degree: "SMA · IPA",
    period: "2019 – 2022",
    icon: "🏫",
  },
];

const softSkills = [
  "🧠 Problem-Solving",
  "💬 Communication",
  "🤝 Team Player",
  "⏱️ Time Management",
  "🎯 Attention to Detail",
  "🔄 Adaptability",
  "🧩 Creative Thinking",
  "📐 Analytical Mindset",
];

const hobbiesList = [
  { name: "Gaming", icon: "🎮" },
  { name: "Photography", icon: "📸" },
  { name: "Reading", icon: "📚" },
  { name: "Running", icon: "🏃" },
  { name: "Traveling", icon: "✈️" },
  { name: "Music", icon: "🎵" },
];

const coreValues = [
  {
    name: "Outcome-Driven",
    description: "I measure success by real impact, not hours logged.",
    icon: "🎯",
  },
  {
    name: "Collaborative",
    description: "Best products are built together, not in silos.",
    icon: "🤝",
  },
  {
    name: "Continuous Learner",
    description: "Staying curious is my career superpower.",
    icon: "♻️",
  },
];

// --- Animation Logic ---

onMounted(() => {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
});
</script>

<template>
  <div class="public">
    <div
      class="max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col lg:flex-row gap-12"
    >
      <!-- ════════════ SIDEBAR (Sticky) ════════════ -->
      <aside class="lg:w-80 lg:sticky lg:top-28 lg:self-start flex-shrink-0">
        <!-- Profile Photo -->
        <div
          class="relative mb-6 animate-fade-up"
          style="animation-delay: 0.1s"
        >
          <div class="relative w-48 h-48 mx-auto lg:mx-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80"
              alt="Brillian Christofer"
              class="w-full h-full object-cover rounded-2xl border-2 border-accent/30"
            />
            <div
              class="absolute -bottom-2 -right-2 bg-accent text-primary text-xs font-bold px-2 py-1 rounded-lg shadow-lg"
            >
              Open to Work ✓
            </div>
          </div>
        </div>

        <!-- Name + Bio -->
        <div class="mb-6 animate-fade-up" style="animation-delay: 0.15s">
          <h1 class="font-display text-3xl font-black mb-1">
            Brillian Christofer
          </h1>
          <p class="text-accent font-mono text-sm mb-3">Full-Stack Developer</p>
          <p class="text-sm leading-relaxed" style="color: var(--text-muted)">
            1+ years crafting robust web apps and beautiful UIs. Passionate
            about turning complex problems into elegant solutions. Based in
            Jakarta, Indonesia 🇮🇩
          </p>
        </div>

        <!-- Action Buttons -->
        <div
          class="flex flex-col gap-3 mb-8 animate-fade-up"
          style="animation-delay: 0.2s"
        >
          <a
            href="#"
            class="flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-white font-bold px-5 py-3 rounded-full transition-all hover:scale-105 text-sm"
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
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
              />
            </svg>
            Download CV
          </a>
          <router-link
            to="/contact"
            class="flex items-center justify-center gap-2 border border-accent text-accent hover:bg-accent/10 font-semibold px-5 py-3 rounded-full transition-all text-sm"
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
                d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
            Hire Me / Connect
          </router-link>
        </div>

        <!-- Quick Info -->
        <div
          class="space-y-3 text-sm animate-fade-up"
          style="animation-delay: 0.25s"
        >
          <div class="flex items-center gap-3" style="color: var(--text-muted)">
            <svg
              class="text-accent flex-shrink-0"
              width="14"
              height="14"
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
            Jakarta, Indonesia
          </div>
          <div class="flex items-center gap-3" style="color: var(--text-muted)">
            <svg
              class="text-accent flex-shrink-0"
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
            brilliancw30@gmail.com
          </div>
          <div class="flex items-center gap-3" style="color: var(--text-muted)">
            <svg
              class="text-accent flex-shrink-0"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            1+ Years Experience
          </div>
        </div>

        <!-- Core Values -->
        <div
          class="mt-8 border rounded-2xl p-5 animate-fade-up"
          style="
            background-color: var(--bg-card);
            border-color: var(--border);
            animation-delay: 0.3s;
          "
        >
          <h3 class="text-xs font-mono text-accent tracking-widest mb-4">
            // CORE VALUES
          </h3>
          <div class="space-y-4">
            <div
              v-for="value in coreValues"
              :key="value.name"
              class="flex items-start gap-4"
            >
              <span class="text-xl shrink-0">{{ value.icon }}</span>
              <div>
                <p class="text-sm font-semibold leading-tight mb-1">
                  {{ value.name }}
                </p>
                <p
                  class="text-xs leading-relaxed"
                  style="color: var(--text-muted)"
                >
                  {{ value.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ════════════ MAIN CONTENT ════════════ -->
      <main class="flex-1 min-w-0">
        <!-- Intro -->
        <div class="reveal mb-14">
          <p class="font-mono text-accent text-xs tracking-widest mb-3">
            // BIO
          </p>
          <h2
            class="font-display text-4xl md:text-5xl font-black mb-6 leading-tight"
          >
            Turning ideas into<br /><span class="text-accent italic"
              >digital reality</span
            >
          </h2>
          <div
            class="space-y-4 leading-loose text-base max-w-2xl"
            style="color: var(--text-muted)"
          >
            <p>
              Hey there! I'm Christofer — a full-stack developer who genuinely
              loves what I do. I started my journey with a curiosity about how
              things work on the internet, and that curiosity turned into a
              5-year career building everything from high-traffic APIs to
              polished consumer apps.
            </p>
            <p>
              My philosophy is simple: great software starts with understanding
              people. Before writing a single line of code, I ask:
              <span class="font-medium" style="color: var(--text)"
                >who is this for, and what problem does it truly solve?</span
              >
            </p>
          </div>
        </div>

        <!-- ── Work Experience Timeline ── -->
        <div class="reveal mb-14">
          <p class="font-mono text-accent text-xs tracking-widest mb-6">
            // EXPERIENCE
          </p>
          <h2 class="font-display text-3xl font-bold mb-8">Work History</h2>

          <div class="relative pl-8">
            <!-- Vertical line -->
            <div
              class="timeline-line absolute left-3 top-2 bottom-2 rounded-full"
            ></div>

            <!-- Items -->
            <div
              v-for="(job, index) in workHistory"
              :key="index"
              class="timeline-item relative mb-10 last:mb-0"
            >
              <!-- Dot -->
              <div
                class="absolute left-[-29px] top-1.5 w-3.5 h-3.5 rounded-full border-2"
                :class="
                  job.status === 'active'
                    ? 'bg-accent timeline-dot'
                    : 'timeline-dot bg-background border-accent/60'
                "
                :style="
                  job.status === 'past'
                    ? { backgroundColor: 'var(--bg-card)' }
                    : { borderColor: 'var(--bg)' }
                "
              ></div>

              <!-- Card -->
              <div
                class="timeline-card border rounded-xl p-5"
                style="
                  background-color: var(--bg-card);
                  border-color: var(--border);
                "
              >
                <div
                  class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4"
                >
                  <div>
                    <h3 class="font-display text-lg font-bold">
                      {{ job.role }}
                    </h3>
                    <p class="text-accent text-sm font-medium">
                      {{ job.company }} · {{ job.type }}
                    </p>
                  </div>
                  <span
                    class="font-mono text-xs rounded-full px-3 py-1 self-start"
                    style="
                      color: var(--text-muted);
                      background-color: var(--bg);
                    "
                    >{{ job.period }}</span
                  >
                </div>
                <ul class="space-y-2 text-sm" style="color: var(--text-muted)">
                  <li
                    v-for="(task, i) in job.tasks"
                    :key="i"
                    class="flex items-start gap-2"
                  >
                    <span class="text-accent mt-1 shrink-0">▸</span>
                    {{ task }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Education ── -->
        <div class="reveal mb-14">
          <p class="font-mono text-accent text-xs tracking-widest mb-6">
            // EDUCATION
          </p>
          <h2 class="font-display text-3xl font-bold mb-6">
            Academic Background
          </h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <div
              v-for="edu in educationGrid"
              :key="edu.degree"
              class="border hover:border-accent/30 rounded-2xl p-5 transition-all group"
              style="
                background-color: var(--bg-card);
                border-color: var(--border);
              "
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors"
                >
                  <span class="text-xl">{{ edu.icon }}</span>
                </div>
                <div>
                  <h3 class="font-display font-bold mb-0.5 leading-tight">
                    {{ edu.institution }}
                  </h3>
                  <p class="text-accent text-xs font-mono mb-2">
                    {{ edu.degree }}
                  </p>
                  <p class="text-xs" style="color: var(--text-muted)">
                    {{ edu.period }}
                    <template v-if="edu.meta"> · {{ edu.meta }}</template>
                  </p>
                  <p
                    v-if="edu.description"
                    class="text-xs mt-2 italic"
                    style="color: var(--text-muted)"
                  >
                    {{ edu.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Soft Skills & Hobbies ── -->
        <div class="reveal">
          <p class="font-mono text-accent text-xs tracking-widest mb-6">
            // PERSONALITY
          </p>
          <h2 class="font-display text-3xl font-bold mb-6">
            Soft Skills &amp; Hobbies
          </h2>
          <div class="grid md:grid-cols-2 gap-12">
            <div>
              <h3
                class="text-xs font-mono mb-6 tracking-widest"
                style="color: var(--text-muted)"
              >
                SOFT SKILLS
              </h3>
              <div class="flex flex-wrap gap-2.5">
                <span
                  v-for="(skill, index) in softSkills"
                  :key="skill"
                  class="tag border text-xs px-4 py-2 rounded-full cursor-default transition-all"
                  :class="{
                    'bg-accent/10 border-accent/30 text-accent': index === 0,
                  }"
                  :style="
                    index !== 0
                      ? {
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-muted)',
                        }
                      : {}
                  "
                >
                  {{ skill }}
                </span>
              </div>
            </div>
            <!-- Hobbies -->
            <div>
              <h3
                class="text-xs font-mono mb-6 tracking-widest"
                style="color: var(--text-muted)"
              >
                HOBBIES
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="hobby in hobbiesList"
                  :key="hobby.name"
                  class="border rounded-xl p-4 text-center hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all group"
                  style="
                    background-color: var(--bg-card);
                    border-color: var(--border);
                  "
                >
                  <div class="text-2xl mb-2">{{ hobby.icon }}</div>
                  <p
                    class="text-xs font-medium"
                    style="color: var(--text-muted)"
                  >
                    {{ hobby.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
