import type { Router } from "framework7/types";

const homeRoutes: Router.RouteParameters[] = [
  {
    name: "authenticated",
    path: "/",
    routes: [],

    // beforeEnter: (context) => useAuthGuard(context),

    async({ resolve }) {
      import("@/modules/home/views/Home.vue").then((vc) => {
        resolve({ component: vc.default });
      });
    },
  },
];

export default homeRoutes;
