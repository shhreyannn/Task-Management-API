import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { formatResponse } from '../utils/response.util';

const isFutureDate = (value: any) => {
  if (value && new Date(value) < new Date()) {
    throw new Error('Due date must be in the future');
  }
  return true;
};

export const validateTaskCreate = [
  body('title').notEmpty().withMessage('Title is required').trim().escape(),
  body('description').optional().isString().trim().escape(),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom(isFutureDate)
    .toDate(),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, 'Validation failed', errors.array(), 'VALIDATION_ERROR'));
    }
    next();
  },
];

export const validateTaskUpdate = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim().escape(),
  body('description').optional().isString().trim().escape(),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom(isFutureDate)
    .toDate(),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, 'Validation failed', errors.array(), 'VALIDATION_ERROR'));
    }
    next();
  },
];
