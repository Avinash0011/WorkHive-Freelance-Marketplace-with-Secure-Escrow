import Redis from 'ioredis';
import { logger } from './logger';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries, giving up');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.warn('Redis error (non-fatal):', err.message));
  }
  return redis;
}

// Optional connect — don't crash if Redis is unavailable
export async function connectRedis(): Promise<void> {
  try {
    const r = getRedis();
    await r.connect();
  } catch (error) {
    logger.warn('Redis not available — rate limiting and caching will be disabled');
  }
}
