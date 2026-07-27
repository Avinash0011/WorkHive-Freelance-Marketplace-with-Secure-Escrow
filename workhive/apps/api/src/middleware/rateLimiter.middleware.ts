import rateLimit from 'express-rate-limit';

// Global rate limiter - 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter - 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Jobs rate limiter - 20 requests per 15 minutes
export const jobsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many job requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Proposals rate limiter - 30 requests per 15 minutes
export const proposalsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many proposal requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payments rate limiter - 5 requests per 15 minutes
export const paymentsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many payment requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
