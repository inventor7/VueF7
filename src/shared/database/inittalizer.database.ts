import databaseLogger from "./logger.database";

const databaseInitializer = async () => {
  await database.init();
  await database.connect(databaseConnector);
  await databaseConnector.init();
  databaseLogger();
};

export default databaseInitializer;
