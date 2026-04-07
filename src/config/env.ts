import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load initial environment variables from .env if running locally
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default(5000),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be securely generated and injected'),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default(5432),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  MONGO_URI: z.string(),
  RABBITMQ_URL: z.string().default('amqp://localhost'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ Invalid environment variables:', envParsed.error.format());
  process.exit(1);
}

export const env = envParsed.data;
