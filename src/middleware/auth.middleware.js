const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/response.util');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(formatResponse(false, 'Unauthorized: No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains userId
    next();
  } catch (error) {
    return res.status(401).json(formatResponse(false, 'Unauthorized: Invalid token'));
  }
};

module.exports = authMiddleware;
