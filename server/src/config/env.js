import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  JWT_EXPIRES_IN: z.string().default("12h"),
  GROQ_API_KEY: z.string().optional(),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  JWT_COOKIE_NAME: z.string().default("ps_token")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast in startup so misconfigurations do not leak to runtime behavior.
  throw new Error(`Invalid environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
}

export const env = parsed.data;
