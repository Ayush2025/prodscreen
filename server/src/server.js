import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./config/logger.js";
import { startHardwareProcessor } from "./services/hardwareProcessor.js";

const start = async () => {
  app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT}`);
  });

  connectDB().catch((error) => {
    logger.error({ err: error }, "Initial MongoDB connection failed");
  });
  startHardwareProcessor();
};

start();
