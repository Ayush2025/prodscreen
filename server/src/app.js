import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import columnDefinitionRoutes from "./routes/columnDefinitionRoutes.js";
import factoryRoutes from "./routes/factoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import defectRoutes from "./routes/defectRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("combined"));
app.use(pinoHttp({ logger }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1200
  })
);

app.get("/api/health", (_req, res) => {
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  const readyState = mongoose.connection.readyState;
  res.status(200).json({
    status: readyState === 1 ? "ok" : "degraded",
    mongoose: {
      readyState,
      state: stateMap[readyState] || "unknown",
      host: mongoose.connection.host || null,
      dbName: mongoose.connection.name || null
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/column-definitions", columnDefinitionRoutes);
app.use("/api/factories", factoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api", entryRoutes);
app.use("/api", defectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", integrationRoutes);

app.use(notFound);
app.use(errorHandler);
