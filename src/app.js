const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic health-check base route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Task Management API. Everything is running securely.',
  });
});

app.use(errorHandler);

module.exports = app;
