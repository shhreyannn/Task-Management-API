import { Queue } from 'bullmq';
import { redisClient } from '../config/redis';

export const webhookQueue = new Queue('webhookQueue', {
  connection: redisClient,
});
