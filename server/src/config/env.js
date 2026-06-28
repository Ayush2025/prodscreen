import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  GROQ_API_KEY: z.string().optional(),
  CLIENT_URL: z.string().default("http://localhost:5173"),

  // Backward-compatibility values from prior iteration.
  JWT_EXPIRES_IN: z.string().default("12h"),
  KPI_PLUS_BASE_URL: z.string().url().optional(),
  KPI_PLUS_API_KEY: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast in startup so misconfigurations do not leak to runtime behavior.
  throw new Error(`Invalid environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
}

export const env = parsed.data;
