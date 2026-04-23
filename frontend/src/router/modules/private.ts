import type { RouteRecordRaw } from "vue-router";
import { ROUTE_NAMES, ROUTE_PATHS } from "../constants";

const privateRoutes: RouteRecordRaw[] = [
  {
    path: "/private",
    component: () => import("@/layouts/private/PrivateLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: ROUTE_NAMES.DASHBOARD_PRIVATE,
        component: () => import("@/views/private/Dashboard.vue"),
      },
      {
        path: "projects",
        name: ROUTE_NAMES.PROJECT_CMS,
        component: () => import("@/views/private/ProjectCms.vue"),
      },
      {
        path: "blogs",
        name: ROUTE_NAMES.BLOG_CMS,
        component: () => import("@/views/private/BlogCms.vue"),
      },
      {
        path: "notes",
        name: ROUTE_NAMES.NOTES,
        component: () => import("@/views/private/Notes.vue"),
      },
      {
        path: "cashflow",
        name: ROUTE_NAMES.CASHFLOW,
        component: () => import("@/views/private/Cashflow.vue"),
      },
      {
        path: "habits",
        name: ROUTE_NAMES.HABITS,
        component: () => import("@/views/private/Habits.vue"),
      },
      {
        path: "emails",
        name: ROUTE_NAMES.EMAIL_SCHEDULER,
        component: () => import("@/views/private/EmailScheduler.vue"),
      },
      {
        path: "goals",
        name: ROUTE_NAMES.GOALS,
        component: () => import("@/views/private/Goals.vue"),
      },
      {
        path: "ai-chat",
        name: ROUTE_NAMES.AI_CHAT,
        component: () => import("@/views/private/AiChat.vue"),
      },
      {
        path: "settings",
        name: ROUTE_NAMES.SETTINGS,
        component: () => import("@/views/private/Settings.vue"),
      },
    ],
  },
];

export default privateRoutes;
