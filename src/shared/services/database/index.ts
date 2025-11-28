import {
  CapacitorSQLiteOpenFactory,
  PowerSyncDatabase,
} from "@powersync/capacitor";
import { WASQLiteOpenFactory, WASQLiteVFS } from "@powersync/web";
import { wrapPowerSyncWithKysely } from "@powersync/kysely-driver";
import { Capacitor } from "@capacitor/core";

export const powerSync = new PowerSyncDatabase({
  schema: AppSchema,
  database: Capacitor.isNativePlatform()
    ? new CapacitorSQLiteOpenFactory({
        dbFilename: "exampleVFS.db",
        debugMode: true,
        sqliteOptions: {},
      })
    : new WASQLiteOpenFactory({
        dbFilename: "exampleVFS.db",
        vfs: WASQLiteVFS.OPFSCoopSyncVFS,
        flags: {
          enableMultiTabs: typeof SharedWorker !== "undefined",
        },
        debugMode: true,
      }),
  flags: {
    enableMultiTabs: typeof SharedWorker !== "undefined",
  },
});

export const db = wrapPowerSyncWithKysely<Database>(powerSync);

export default powerSync;
