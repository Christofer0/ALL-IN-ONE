import type { RouteRecordRaw } from "vue-router";
import { ROUTE_NAMES, ROUTE_PATHS } from "../constants";

const utilityRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.ERROR_404,
    name: ROUTE_NAMES.ERROR_404,
    component: () => import("@/views/utilities/Error.vue"),
  },
];

export default utilityRoutes;
