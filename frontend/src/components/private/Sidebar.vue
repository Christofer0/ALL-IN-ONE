<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ROUTE_PATHS } from "@/router/constants";
import { useAuthStore } from "@/stores/auth";

defineProps<{
  isOpen: boolean;
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

type MenuItem = {
  name: string;
  icon: string;
  href: string;
  badge?: string;
};

type Section = {
  section: string;
  items: MenuItem[];
};

const menuItems: Section[] = [
  {
    section: "Main",
    items: [
      {
        name: "Dashboard",
        icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
        href: ROUTE_PATHS.DASHBOARD_PRIVATE,
      },
      {
        name: "Portfolio",
        icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        href: ROUTE_PATHS.PROJECTS,
        badge: "Public",
      },
    ],
  },
  {
    section: "Tools",
    items: [
      {
        name: "Projects CMS",
        icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        href: ROUTE_PATHS.PROJECT_CMS,
      },
      {
        name: "Blogs CMS",
        icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
        href: ROUTE_PATHS.BLOG_CMS,
      },
      {
        name: "Email Scheduler",
        icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 12,13 2,6",
        href: ROUTE_PATHS.EMAIL_SCHEDULER,
      },
      {
        name: "Notes",
        icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2 14 8 20 8 M16 13 8 13 M16 17 8 17",
        href: ROUTE_PATHS.NOTES,
      },
      {
        name: "Cashflow",
        icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
        href: ROUTE_PATHS.CASHFLOW,
      },
    ],
  },
  {
    section: "Growth",
    items: [
      {
        name: "Habit Tracker",
        icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01 9 11.01",
        href: ROUTE_PATHS.HABITS,
      },
      {
        name: "Goals / OKR",
        icon: "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0 M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
        href: ROUTE_PATHS.GOALS,
      },
      {
        name: "AI Assistant",
        icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
        href: ROUTE_PATHS.AI_CHAT,
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        name: "Settings",
        icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
        href: ROUTE_PATHS.SETTINGS,
      },
    ],
  },
];

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push(ROUTE_PATHS.LOGIN);
  } catch (error) {
    console.error("Logout failed:", error);
    authStore.isAuthenticated = false;
    authStore.user = null;
    router.push(ROUTE_PATHS.LOGIN);
  }
};
</script>

<template>
  <aside class="sidebar" :class="{ 'mobile-open': isOpen }">
    <!-- Header -->
    <div class="sidebar-logo">
      <div style="font-weight: 800; font-size: 1.1rem; letter-spacing: -0.02em">
        BCW<span style="color: var(--p-secondary)">.</span>
      </div>
      <div
        style="
          font-size: 0.65rem;
          color: #374151;
          font-family:
            JetBrains Mono,
            monospace;
          margin-top: 2px;
        "
      >
        Personal OS v1.0
      </div>
    </div>

    <!-- Navigation -->
    <nav style="flex: 1; overflow-y: auto; padding: 8px 0">
      <template v-for="section in menuItems" :key="section.section">
        <div class="nav-section">{{ section.section }}</div>
        <router-link
          v-for="item in section.items"
          :key="item.name"
          :to="item.href"
          class="nav-item"
          :class="{ active: route.path === item.href }"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path :d="item.icon" />
          </svg>
          <span class="nav-text">{{ item.name }}</span>
          <span v-if="item.badge" class="badge-blue ml-auto">{{
            item.badge
          }}</span>
        </router-link>
      </template>
    </nav>

    <!-- Footer / User Info -->
    <div style="padding: 16px; border-top: 1px solid var(--p-card-border)">
      <div style="display: flex; align-items: center; gap: 10px">
        <div
          style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(74, 112, 169, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.75rem;
            color: var(--p-accent);
            flex-shrink: 0;
            text-transform: uppercase;
          "
        >
          {{ authStore.user?.name?.substring(0, 2) || "AD" }}
        </div>
        <div>
          <div
            style="font-size: 0.78rem; font-weight: 600; color: var(--p-light)"
          >
            {{ authStore.user?.name || "Admin" }}
          </div>
          <div style="font-size: 0.65rem; color: #374151">Admin</div>
        </div>
        <div style="margin-left: auto; display: flex; align-items: center">
          <button
            class="action-btn action-btn-danger"
            title="Logout"
            @click="handleLogout"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #374151;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(74, 112, 169, 0.1);
  color: var(--p-secondary);
}

.action-btn-danger:hover {
  background: rgba(248, 113, 113, 0.1) !important;
  color: #f87171 !important;
}

.nav-text {
  flex: 1;
}

/* Ensure active state transition is smooth */
.nav-item {
  transition: all 0.2s ease;
}
</style>
