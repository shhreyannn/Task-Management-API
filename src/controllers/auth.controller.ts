import { Request, Response } from 'express';
import { formatResponse } from '../utils/response.util';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  const data = await AuthService.register(req.body);
  res.status(201).json(formatResponse(true, 'User registered successfully', data));
};

export const login = async (req: Request, res: Response) => {
  const data = await AuthService.login(req.body);
  res.status(200).json(formatResponse(true, 'Login successful', data));
};

export const refreshToken = async (req: Request, res: Response) => {
  const data = await AuthService.refreshToken(req.body.refreshToken);
  res.status(200).json(formatResponse(true, 'Token refreshed successfully', data));
};

export const getProfile = async (req: Request, res: Response) => {
  const data = await AuthService.getProfile(req.user.userId);
  res.status(200).json(formatResponse(true, 'Profile retrieved', data));
};

export const deleteProfile = async (req: Request, res: Response) => {
  await AuthService.deleteUser(req.user.userId);
  res.status(200).json(formatResponse(true, 'Profile deleted successfully'));
};
