const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
