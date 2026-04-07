import request from 'supertest';
import app from '../src/app'; // Assumes app is exported
import { sequelize } from '../src/config/db.postgres';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

describe('Auth Endpoints Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_db');
    }
  });

  afterAll(async () => {
    await sequelize.close();
    await mongoose.disconnect();
  });

  const testUser = {
    email: faker.internet.email(),
    password: 'Password123!',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('should not allow duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('DUPLICATE_EMAIL');
  });

  it('should login the user and return a token', async () => {
    const res = await request(app).post('/api/auth/login').send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword123!' });

    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('INVALID_CREDENTIALS');
  });
});
