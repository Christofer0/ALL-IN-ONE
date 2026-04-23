import type { RouteRecordRaw } from "vue-router";

const publicRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/public/PublicLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/public/Home.vue"),
        meta: { title: "Home — Portfolio" },
      },
      {
        path: "about",
        name: "about",
        component: () => import("@/views/public/About.vue"),
        meta: { title: "About — Portfolio" },
      },
      {
        path: "projects",
        name: "projects",
        component: () => import("@/views/public/Projects.vue"),
        meta: { title: "Projects — Portfolio" },
      },
      {
        path: "projects/:slug",
        name: "project-detail",
        component: () => import("@/views/public/ProjectDetail.vue"),
        meta: { title: "Project Detail — Portfolio" },
      },
      {
        path: "blog",
        name: "blog",
        component: () => import("@/views/public/Blog.vue"),
        meta: { title: "Blog — Portfolio" },
      },
      {
        path: "blog/:slug",
        name: "blog-detail",
        component: () => import("@/views/public/BlogDetail.vue"),
        meta: { title: "Blog Detail — Portfolio" },
      },
      {
        path: "contact",
        name: "contact",
        component: () => import("@/views/public/Contact.vue"),
        meta: { title: "Contact — Portfolio" },
      },
    ],
  },
];

export default publicRoutes;
