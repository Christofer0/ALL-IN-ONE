<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits(["toggleSidebar"]);
const authStore = useAuthStore();

const userName = computed(() => authStore.user?.name || "User");
const greeting = ref("Good Morning");
const dateText = ref("");

const updateTimeInfo = () => {
  const now = new Date();
  const h = now.getHours();
  greeting.value =
    h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  dateText.value = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

onMounted(() => {
  updateTimeInfo();
});
</script>

<template>
  <header class="topbar">
    <div style="display: flex; align-items: center; gap: 12px">
      <!-- Burger for mobile -->
      <button
        @click="emit('toggleSidebar')"
        class="btn-ghost lg:hidden"
        style="padding: 6px 10px; border: none"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div>
        <div style="font-size: 0.82rem; font-weight: 600">
          {{ greeting }}, {{ userName }} 👋
        </div>
        <div
          style="
            font-size: 0.65rem;
            font-family:
              JetBrains Mono,
              monospace;
            color: var(--text-muted);
          "
        >
          {{ dateText }}
        </div>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 10px">
      <div
        style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--p-surface);
          border: 1px solid var(--p-card-border);
          border-radius: 8px;
        "
      >
        <div class="pulse"></div>
        <span
          style="
            font-size: 0.72rem;
            color: #4ade80;
            font-family:
              JetBrains Mono,
              monospace;
          "
        >
          All systems up
        </span>
      </div>
      <button class="btn-ghost" style="padding: 6px 10px">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </div>
  </header>
</template>
