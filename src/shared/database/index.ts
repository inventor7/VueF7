import { PowerSyncDatabase } from "@powersync/capacitor";
import { WASQLiteOpenFactory, WASQLiteVFS } from "@powersync/web";
import { AppSchema } from "./schemas/AppSchema";
import { wrapPowerSyncWithKysely } from "@powersync/kysely-driver";
import type { Database } from "./types";

export const powerSync = new PowerSyncDatabase({
  schema: AppSchema,
  database: new WASQLiteOpenFactory({
    dbFilename: "exampleVFS.db",
    vfs: WASQLiteVFS.OPFSCoopSyncVFS,
    flags: {
      enableMultiTabs: typeof SharedWorker !== "undefined",
    },
  }),
  flags: {
    enableMultiTabs: typeof SharedWorker !== "undefined",
  },
});

export const db = wrapPowerSyncWithKysely<Database>(powerSync);

export default powerSync;
