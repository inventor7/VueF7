import powerSync from "@/shared/services/database/index";
import { createPowerSyncPlugin } from "@powersync/vue";

const powerSyncPlugin = createPowerSyncPlugin({
  database: powerSync,
});
export default powerSyncPlugin;
