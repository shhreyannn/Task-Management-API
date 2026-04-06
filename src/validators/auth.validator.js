const { body, validationResult } = require('express-validator');
const { formatResponse } = require('../utils/response.util');

const validateRegister = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', errors.array()));
    }
    next();
  }
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatResponse(false, 'Validation failed', errors.array()));
    }
    next();
  }
];

module.exports = { validateRegister, validateLogin };
