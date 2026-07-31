import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  PLATFORM_FEE_PERCENT: z.coerce.number().min(0).max(100).default(10),
  RESEND_API_KEY: z.string().optional().default(''),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

function loadEnv() {
  // In dev, dotenv is already loaded by tsx
  // For production, you'd use dotenv.config()
  try {
    // Try to load dotenv if available
    require('dotenv').config();
  } catch {
    // dotenv not available, env vars should be set externally
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:');
    console.error(parsed.error.format());
    // Don't crash on missing optional vars in dev
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In dev, use defaults where possible
    return envSchema.parse({
      ...process.env,
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production-32chars',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production-32chars',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://workhive:workhive_dev@localhost:5433/workhive',
    });
  }
  return parsed.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;

// Warn about missing Razorpay configuration in production
if (env.NODE_ENV === 'production') {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    console.warn('WARNING: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not set. Payment features will be disabled.');
  }
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    console.warn('WARNING: RAZORPAY_WEBHOOK_SECRET is not set. Webhook verification will be disabled.');
  }
}

export const isRazorpayConfigured = !!env.RAZORPAY_KEY_ID && !!env.RAZORPAY_KEY_SECRET;
