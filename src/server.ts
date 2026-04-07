import dotenv from 'dotenv';
import app from './app';
import { connectPostgres } from './config/db.postgres';
import { connectMongo } from './config/db.mongo';
import { TaskService } from './services/task.service';
import { env } from './config/env';

const startServer = async () => {
  try {
    await connectPostgres();
    await connectMongo();
    await TaskService.initializeConsumers();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
