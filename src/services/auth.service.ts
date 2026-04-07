import User from '../models/User';
import { ApiError } from '../utils/ApiError';
import { rabbitMQService } from './rabbitmq.service';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export class AuthService {
  static async register(userData: any) {
    const user = await User.create(userData);
    return { id: user.id, email: user.email };
  }

  static async login(credentials: any) {
    const user = await User.findOne({ where: { email: credentials.email } });
    if (!user) throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');

    const isMatch = await (user as any).comparePassword(credentials.password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');

    return this.generateTokens(user.id);
  }

  static async generateTokens(userId: string) {
    // 15-minute access token
    const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
    // 7-day refresh token
    const refreshToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });

    // Store in Redis (optional stateful refresh mapping)
    // await redisClient.set(`refresh:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return { accessToken, refreshToken };
  }

  static async refreshToken(oldRefreshToken: string) {
    try {
      const decoded: any = jwt.verify(oldRefreshToken, env.JWT_SECRET);
      // Generate new rotating pair
      return this.generateTokens(decoded.userId);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  static async getProfile(userId: string) {
    const user = await User.findByPk(userId, { attributes: ['id', 'email', 'created_at'] });
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    return user;
  }

  /**
   * Advanced Feature: Cascade deletion using RabbitMQ PubSub
   */
  static async deleteUser(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

    await user.destroy();

    // Publish event for MongoDB to cleanup orphaned tasks natively
    await rabbitMQService.publishUserDeleted(userId);
    return { success: true };
  }
}
