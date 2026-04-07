import express from 'express';
import * as taskController from '../controllers/task.controller';
import { validateTaskCreate, validateTaskUpdate } from '../validators/task.validator';
import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validateTaskCreate, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', validateTaskUpdate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
