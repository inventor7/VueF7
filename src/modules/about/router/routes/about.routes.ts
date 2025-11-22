import type { Router } from "framework7/types";

const aboutRoutes: Router.RouteParameters[] = [
  {
    name: "about",
    path: "/about",

    routes: [],

    async({ resolve }) {
      import("@/modules/about/views/About.vue").then((vc) => {
        resolve({ component: vc.default });
      });
    },
  },
];

export default aboutRoutes;
