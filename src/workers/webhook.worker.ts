import { Worker } from 'bullmq';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';
import axios from 'axios';

export const webhookWorker = new Worker(
  'webhookQueue',
  async (job) => {
    const { taskId, title, userId, completedAt } = job.data;
    // The instructions say "optionally send to webhook.site" for reminders, but for this webhook it's a POST to some URL.
    // We'll use a dummy webhook.site URL.
    const webhookUrl = process.env.WEBHOOK_URL || 'https://webhook.site/placeholder';

    logger.info(`Sending task completion webhook for task ${taskId}...`);

    try {
      await axios.post(webhookUrl, {
        taskId,
        title,
        userId,
        completedAt,
      });
      logger.info(`Webhook successfully sent for task ${taskId}`);
    } catch (error: any) {
      logger.error(`Webhook delivery failed for task ${taskId}: ${error.message}`);
      throw error; // Let BullMQ retry
    }
  },
  {
    connection: redisClient,
  },
);

webhookWorker.on('completed', (job) => {
  logger.info(`Webhook job ${job.id} completed`);
});

webhookWorker.on('failed', (job, err) => {
  logger.error(`Webhook job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
});
