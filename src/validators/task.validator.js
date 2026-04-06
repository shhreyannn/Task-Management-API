const { body, validationResult } = require('express-validator');
const { formatResponse } = require('../utils/response.util');

const validateTaskCreate = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').optional().isString().trim(),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format').toDate(),
  body('status').optional().isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', errors.array()));
    }
    next();
  }
];

const validateTaskUpdate = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('description').optional().isString().trim(),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format').toDate(),
  body('status').optional().isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', errors.array()));
    }
    next();
  }
];

module.exports = { validateTaskCreate, validateTaskUpdate };
