import { Queue } from 'bullmq';
import { redisClient } from '../config/redis';

export const reminderQueue = new Queue('reminderQueue', {
  connection: redisClient,
});
