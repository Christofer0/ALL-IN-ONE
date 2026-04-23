import type { RouteRecordRaw } from 'vue-router';
import { ROUTE_NAMES, ROUTE_PATHS } from '../constants';

const authRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: () => import("@/views/utilities/Login.vue"),
  },
  {
    path: ROUTE_PATHS.LOGOUT,
    name: ROUTE_NAMES.LOGOUT,
    component: () => import("@/views/utilities/Logout.vue"),
  },
];

export default authRoutes;
