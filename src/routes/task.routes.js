const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { validateTaskCreate, validateTaskUpdate } = require('../validators/task.validator');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all task routes
router.use(authMiddleware);

router.post('/', validateTaskCreate, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', validateTaskUpdate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
