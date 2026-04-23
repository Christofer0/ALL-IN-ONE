import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ROUTE_NAMES } from "./constants";
import loginRoutes from "./modules/auth";
import utilityRoutes from "./modules/utility";
import privateRoutes from "./modules/private";
import publicRoutes from "./modules/public";

const routes = [
  ...publicRoutes,
  ...loginRoutes,
  ...utilityRoutes,
  ...privateRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // If session is not checked yet, check it on initial load
  if (!from.name) {
    await authStore.checkSession();
  }

  const isAuth = authStore.isAuthenticated;
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !isAuth) {
    next({ name: ROUTE_NAMES.LOGIN });
  } else if (to.name === ROUTE_NAMES.LOGIN && isAuth) {
    next({ name: ROUTE_NAMES.DASHBOARD_PRIVATE });
  } else {
    next();
  }
});

export default router;
