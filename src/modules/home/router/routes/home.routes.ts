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
  {
    name: "powersync-demo",
    path: "/powersync-demo",
    async({ resolve }) {
      import("@/modules/home/views/PowerSyncDemo.vue").then((vc) => {
        resolve({ component: vc.default });
      });
    },
  },
];

export default homeRoutes;
