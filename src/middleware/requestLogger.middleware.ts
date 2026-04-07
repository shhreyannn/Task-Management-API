import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `Method: ${req.method} | Route: ${req.originalUrl} | Status: ${res.statusCode} | Time: ${duration}ms`,
    );
  });

  next();
};

export default requestLogger;
