import express from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../validators/auth.validator';
import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/profile', authMiddleware, authController.getProfile);
router.delete('/profile', authMiddleware, authController.deleteProfile);

export default router;
