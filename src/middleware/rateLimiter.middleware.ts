import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { formatResponse } from '../utils/response.util';

const isProduction = process.env.NODE_ENV === 'production';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // In non-production, effectively disable rate limiting
  max: isProduction ? 10 : 100000,
  standardHeaders: true,
  legacyHeaders: false,
  // Only use Redis store in production (avoids unnecessary overhead in dev)
  store: isProduction
    ? new RedisStore({
        sendCommand: (...args: string[]) => (redisClient as any).call(...args),
      })
    : undefined,
  handler: (req, res) => {
    res
      .status(429)
      .json(
        formatResponse(
          false,
          'Too many requests from this IP, please try again after 15 minutes',
          null,
          'RATE_LIMIT_EXCEEDED',
        ),
      );
  },
});
