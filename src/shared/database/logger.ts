import { createBaseLogger, LogLevel } from "@powersync/web";

const logger = createBaseLogger();

// Configure the logger to use the default console output
logger.useDefaults();

// Set the minimum log level to DEBUG to see all log messages
// Available levels: DEBUG, INFO, WARN, ERROR, TRACE, OFF
logger.setLevel(LogLevel.DEBUG);
