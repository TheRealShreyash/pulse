import { z } from "zod";

const envSchema = z.object({
  IRIS_AUTH_URL: z.url(),
  CLIENT_ID: z.string().min(1),
  CLIENT_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  FRONTEND_URL: z.url(),
  PORT: z.number().default(8080),
  DATABASE_URL: z.string(),
});

const env = envSchema.parse(process.env);

export const {
  IRIS_AUTH_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  NODE_ENV,
  FRONTEND_URL,
  PORT,
  DATABASE_URL,
} = env;
