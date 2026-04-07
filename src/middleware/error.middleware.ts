import { Request, Response, NextFunction } from 'express';
import { formatResponse } from '../utils/response.util';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(formatResponse(false, err.message, err.details, err.errorCode));
  }

  if (err.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json(formatResponse(false, 'Invalid JSON payload format', null, 'INVALID_JSON'));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res
      .status(400)
      .json(formatResponse(false, 'Email already exists', null, 'DUPLICATE_EMAIL'));
  }

  if (err.name === 'ValidationError') {
    return res
      .status(400)
      .json(formatResponse(false, 'Validation Error', err.message, 'VALIDATION_ERROR'));
  }

  if (err.name === 'CastError') {
    return res
      .status(400)
      .json(formatResponse(false, 'Invalid resource ID format', null, 'INVALID_ID_FORMAT'));
  }

  if (err.name === 'TokenExpiredError') {
    return res
      .status(401)
      .json(
        formatResponse(false, 'Token has expired. Please log in again.', null, 'TOKEN_EXPIRED'),
      );
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? 'Internal Server Error' : err.message;

  res.status(err.status || 500).json(formatResponse(false, message, null, 'INTERNAL_SERVER_ERROR'));
};

export default errorHandler;
