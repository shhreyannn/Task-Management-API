import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { formatResponse } from '../utils/response.util';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
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
