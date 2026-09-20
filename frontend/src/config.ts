import { z } from "zod";

const envSchema = z.object({
  VITE_BACKEND_URL: z.url(),
  VITE_NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const env = envSchema.parse(import.meta.env);

export const BACKEND_URL = env.VITE_BACKEND_URL;
export const NODE_ENV = env.VITE_NODE_ENV;
