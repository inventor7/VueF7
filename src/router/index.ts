import aboutRoutes from "@/modules/about/router/routes/about.routes";
import homeRoutes from "@/modules/home/router/routes/home.routes";

const routes = [...homeRoutes, ...aboutRoutes, ...globalRoutes];
export default routes;
