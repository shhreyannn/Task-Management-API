const { formatResponse } = require('../utils/response.util');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(formatResponse(false, 'Invalid JSON payload format'));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json(formatResponse(false, 'Email already exists'));
  }
  
  if (err.name === 'ValidationError') {
     return res.status(400).json(formatResponse(false, 'Validation Error', err.message));
  }

  res.status(err.status || 500).json(formatResponse(false, err.message || 'Internal Server Error'));
};

module.exports = errorHandler;
