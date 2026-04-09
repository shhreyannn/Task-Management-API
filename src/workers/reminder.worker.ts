import { Worker } from 'bullmq';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';

export const reminderWorker = new Worker(
  'reminderQueue',
  async (job) => {
    const { taskId, title, userId } = job.data;
    // Log the notification to the console/logger
    logger.info(`[REMINDER] Task "${title}" (ID: ${taskId}) for User ${userId} is due in 1 hour!`);

    // Optionally we could also send to a webhook here
  },
  { connection: redisClient },
);

reminderWorker.on('completed', (job) => {
  logger.info(`Reminder job ${job.id} completed for task ${job.data.taskId}`);
});

reminderWorker.on('failed', (job, err) => {
  logger.error(`Reminder job ${job?.id} failed:`, err);
});
