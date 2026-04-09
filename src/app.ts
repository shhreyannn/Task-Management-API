require('express-async-errors');
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import classificationRoutes from './routes/classification.routes';
import errorHandler from './middleware/error.middleware';
import requestLogger from './middleware/requestLogger.middleware';
import { authLimiter } from './middleware/rateLimiter.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import { metricsRouter } from './utils/metrics';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(requestLogger);

// Setup Metrics endpoint (Prometheus)
app.use(metricsRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/classifications', classificationRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Welcome to the Task Management API.' });
});

app.use(errorHandler);

export default app;
