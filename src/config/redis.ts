import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';

export const redisClient = new Redis(env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3, // Prevent hanging requests if Redis fatally drops
});

redisClient.on('error', (err) => {
  /*
   * FALLBACK BEHAVIOR:
   * rate-limit-redis drops back to native flow or bypass mode naturally if Redis connections crash,
   * preserving system uptime without strictly halting the entire Express pipeline permanently.
   */
  logger.error('Redis connection error (Falling back gracefully):', err);
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis Cache cluster');
});
