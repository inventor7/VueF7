import { PowerSyncDatabase } from "@powersync/capacitor";
import { WASQLiteOpenFactory, WASQLiteVFS } from "@powersync/web";

const database = new PowerSyncDatabase({
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

export default database;
