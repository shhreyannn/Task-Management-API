import Task from '../models/Task.js';
import ArchivedTask from '../models/ArchivedTask';
import { ApiError } from '../utils/ApiError';
import { rabbitMQService } from './rabbitmq.service';
import logger from '../utils/logger';
import { reminderQueue } from '../queues/reminder.queue';
import { webhookQueue } from '../queues/webhook.queue';

export class TaskService {
  /**
   * Initializes the cross-database consumer for cascading user deletes
   */
  static async initializeConsumers() {
    await rabbitMQService.consumeUserDeleted(async (userId: string) => {
      logger.info(
        `Received deletion request for userId: ${userId}. Orphaned tasks will be deleted.`,
      );
      await Task.deleteMany({ userId });
      logger.info(`All orphaned tasks for userId: ${userId} securely removed.`);
    });
  }

  private static async scheduleReminder(task: any) {
    if (task.reminderJobId) {
      await reminderQueue.remove(task.reminderJobId);
      task.reminderJobId = undefined;
    }

    if (task.status === 'completed') return;

    if (task.dueDate && new Date(task.dueDate).getTime() > Date.now()) {
      const delay = new Date(task.dueDate).getTime() - 60 * 60 * 1000 - Date.now();
      if (delay > 0) {
        const job = await reminderQueue.add(
          'task-reminder',
          { taskId: task._id.toString(), title: task.title, userId: task.userId },
          { delay },
        );
        task.reminderJobId = job.id;
      }
    }
  }

  private static async handleCompletionSync(task: any, oldStatus: string) {
    if (task.status === 'completed') {
      if (task.reminderJobId) {
        await reminderQueue.remove(task.reminderJobId);
        task.reminderJobId = undefined;
      }
      if (oldStatus !== 'completed') {
        const payload = {
          taskId: task._id.toString(),
          title: task.title,
          userId: task.userId,
          completedAt: new Date(),
        };
        await webhookQueue.add('task-completion', payload, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        });
      }
    }
  }

  static async createTask(userId: string, taskData: any) {
    const task: any = new Task({ ...taskData, userId });
    await this.scheduleReminder(task);
    await this.handleCompletionSync(task, 'pending');
    await task.save();
    return task;
  }

  static async getAllTasks(userId: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const status = query.status;
    const category = query.category;
    const tags = query.tags ? (query.tags as string).split(',') : null;
    const sortBy = query.sortBy as string;
    const order = query.order;

    const dbQuery: any = { userId, isDeleted: false };
    if (status) dbQuery.status = status;
    if (category) dbQuery.category = category;
    if (tags && tags.length > 0) dbQuery.tags = { $in: tags };

    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const tasks = await Task.find(dbQuery).sort(sortOptions).skip(skip).limit(limit);
    const total = await Task.countDocuments(dbQuery);

    return {
      metadata: { total, page, limit, results: tasks.length },
      data: tasks,
    };
  }

  static async getTaskById(userId: string, id: string) {
    const task = await Task.findOne({ _id: id, isDeleted: false });
    if (!task) throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
    if (task.userId !== userId) throw new ApiError(403, 'Forbidden access', 'FORBIDDEN_ACCESS');
    return task;
  }

  static async updateTask(userId: string, id: string, updateData: any) {
    const task: any = await this.getTaskById(userId, id);
    const oldStatus = task.status;
    const oldDueDate = task.dueDate?.toString();

    Object.assign(task, updateData);

    const dueDateChanged = task.dueDate?.toString() !== oldDueDate;
    const statusChanged = task.status !== oldStatus;

    if (dueDateChanged) {
      await this.scheduleReminder(task);
    }
    await this.handleCompletionSync(task, oldStatus);
    await task.save();
    return task;
  }

  static async archiveTask(task: any) {
    if (task.reminderJobId) {
      await reminderQueue.remove(task.reminderJobId);
    }
    await ArchivedTask.create({
      originalTaskId: task._id.toString(),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      userId: task.userId,
    });

    // Hard delete from hot collection because it is safely archived
    await Task.deleteOne({ _id: task._id });
  }
}
