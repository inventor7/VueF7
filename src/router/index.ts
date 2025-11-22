import aboutRoutes from "@/modules/about/router/routes";
import homeRoutes from "@/modules/home/router/routes";

const routes = [...homeRoutes, ...aboutRoutes, ...globalRoutes];
export default routes;
