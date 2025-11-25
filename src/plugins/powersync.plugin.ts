import database from "@/shared/database/index";
import { createPowerSyncPlugin } from "@powersync/vue";

const powerSync = createPowerSyncPlugin({
  database: database,
});
export default powerSync;
