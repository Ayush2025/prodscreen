import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./config/logger.js";

const start = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(`API listening on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to boot server");
    process.exit(1);
  }
};

start();
