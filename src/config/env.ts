import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().optional(),
  BASE_DOMAIN: z.string().optional(),
  WEBHOOK_DEFAULT_ENDPOINT: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  AUTH_SESSION_SECRET: z.string().min(16).default('replace-this-dev-session-secret'),
  AUTH_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(12)
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const message = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return result.data;
}
