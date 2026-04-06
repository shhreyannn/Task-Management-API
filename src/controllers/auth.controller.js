const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/response.util');

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Create will hash the password via model hook
    const user = await User.create({ email, password });
    
    res.status(201).json(formatResponse(true, 'User registered successfully', { id: user.id, email: user.email }));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json(formatResponse(false, 'Invalid credentials'));
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(formatResponse(false, 'Invalid credentials'));
    }
    
    const tokenPayload = { userId: user.id };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(200).json(formatResponse(true, 'Login successful', { token }));
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findByPk(userId, { attributes: ['id', 'email', 'created_at'] });
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }
    
    res.status(200).json(formatResponse(true, 'Profile retrieved', user));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
