import Task from '../models/Task.js';
import ArchivedTask from '../models/ArchivedTask';
import { ApiError } from '../utils/ApiError';
import { rabbitMQService } from './rabbitmq.service';
import logger from '../utils/logger';

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

  static async createTask(userId: string, taskData: any) {
    return await Task.create({ ...taskData, userId });
  }

  static async getAllTasks(userId: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const status = query.status;
    const sortBy = query.sortBy as string;
    const order = query.order;

    const dbQuery: any = { userId, isDeleted: false };
    if (status) dbQuery.status = status;

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

  static async archiveTask(task: any) {
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
