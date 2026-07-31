import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { env } from './lib/env';
import { errorHandler } from './middleware/error-handler.middleware';
import { globalLimiter } from './middleware/rateLimiter.middleware';
import { authRouter } from './routes/auth.routes';
import { jobsRouter } from './routes/jobs.routes';
import { proposalsRouter } from './routes/proposals.routes';
import { paymentsRouter } from './routes/payments.routes';
import { reviewsRouter } from './routes/reviews.routes';
import { deliveryRouter } from './routes/delivery.routes';
import { walletRouter } from './routes/wallet.routes';
import { savedJobsRouter } from './routes/savedJobs.routes';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  const allowedOrigins = [
    env.FRONTEND_URL,
    // Remove trailing slash if present
    env.FRONTEND_URL.replace(/\/$/, ''),
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow configured frontend URL
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow all Vercel preview deployments for this project
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxAge: 86400,
  }));
  app.use(hpp());

  // Rate limiting
  app.use(globalLimiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // BigInt serialization middleware
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      const stringify = (obj: unknown): unknown => {
        if (typeof obj === 'bigint') {
          return obj.toString();
        }
        if (Array.isArray(obj)) {
          return obj.map(stringify);
        }
        if (obj !== null && typeof obj === 'object') {
          const result: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(obj)) {
            result[key] = stringify(value);
          }
          return result;
        }
        return obj;
      };
      return originalJson.call(this, stringify(data));
    };
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/auth', authRouter);
  app.use('/jobs', jobsRouter);
  app.use('/', proposalsRouter);
  app.use('/', paymentsRouter);
  app.use('/', reviewsRouter);
  app.use('/', deliveryRouter);
  app.use('/', walletRouter);
  app.use('/', savedJobsRouter);
  // More routes will be added in subsequent tickets

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
