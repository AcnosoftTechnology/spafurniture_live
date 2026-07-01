import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  UPLOAD_DIR: z.string().default("./public/uploads"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  RATE_LIMIT_MAX: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.warn("Environment validation warnings:", parsed.error.flatten().fieldErrors);
    return {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/spafurniture",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "development-secret-min-32-chars-long!!",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      UPLOAD_DIR: process.env.UPLOAD_DIR ?? "./public/uploads",
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
      RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? 10),
      RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
    };
  }
  return parsed.data;
}

export const env = parseEnv();
