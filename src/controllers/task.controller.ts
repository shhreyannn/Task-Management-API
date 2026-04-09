import { Request, Response } from 'express';
import { formatResponse } from '../utils/response.util';
import { TaskService } from '../services/task.service';

export const createTask = async (req: Request, res: Response) => {
  const task = await TaskService.createTask(req.user.userId as string, req.body);
  res.status(201).json(formatResponse(true, 'Task created successfully', task));
};

export const getAllTasks = async (req: Request, res: Response) => {
  const { metadata, data } = await TaskService.getAllTasks(req.user.userId as string, req.query);
  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    metadata,
    data,
  });
};

export const getTaskById = async (req: Request, res: Response) => {
  const task = await TaskService.getTaskById(req.user.userId as string, req.params.id as string);
  res.status(200).json(formatResponse(true, 'Task retrieved successfully', task));
};

export const updateTask = async (req: Request, res: Response) => {
  const task = await TaskService.updateTask(
    req.user.userId as string,
    req.params.id as string,
    req.body,
  );
  res.status(200).json(formatResponse(true, 'Task updated successfully', task));
};

export const deleteTask = async (req: Request, res: Response) => {
  const task = await TaskService.getTaskById(req.user.userId as string, req.params.id as string);
  // Replaced soft-delete with Archive pattern logic natively
  await TaskService.archiveTask(task);
  res.status(200).json(formatResponse(true, 'Task archived and deleted successfully'));
};
