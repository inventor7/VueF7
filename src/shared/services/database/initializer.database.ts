import { powerSync } from "./index";
import databaseLogger from "./logger.database";

const databaseInitializer = async () => {
  await powerSync.init();
  databaseLogger();
};

export default databaseInitializer;
