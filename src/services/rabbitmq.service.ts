import amqp, { Connection, Channel } from 'amqplib';
import { env } from '../config/env';
import logger from '../utils/logger';

class RabbitMQService {
  private connection: any = null;
  private channel: any = null;

  async connect() {
    try {
      this.connection = await amqp.connect(env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      if (this.channel) {
        await this.channel.assertExchange('user_events', 'topic', { durable: true });
        logger.info('RabbitMQ connected successfully');
      }
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async publishUserDeleted(userId: string) {
    if (!this.channel) {
      /*
       * FALLBACK BEHAVIOR:
       * If RabbitMQ is down, we fail gracefully rather than crashing the HTTP request cycle.
       * Ideally, in a massive enterprise, we would append failed events to a local Dead-Letter DB table to retry later.
       */
      logger.warn(
        `RabbitMQ offline: user.deleted event dropped for ${userId}. Potential for orphaned tasks.`,
      );
      return;
    }
    const message = Buffer.from(JSON.stringify({ userId }));
    this.channel.publish('user_events', 'user.deleted', message, { persistent: true });
    logger.info(`Published user.deleted event for userId: ${userId}`);
  }

  async consumeUserDeleted(callback: (userId: string) => Promise<void>) {
    if (!this.channel) return;
    const q = await this.channel.assertQueue('task_cleanup_queue', { durable: true });
    await this.channel.bindQueue(q.queue, 'user_events', 'user.deleted');

    this.channel.consume(q.queue, async (msg: any) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content.userId);
          this.channel?.ack(msg);
        } catch (error) {
          logger.error('Error processing user.deleted event:', error);
          this.channel?.nack(msg, false, false); // don't requeue if logic fails unrecoverably
        }
      }
    });
  }
}

export const rabbitMQService = new RabbitMQService();
