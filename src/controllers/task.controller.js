const Task = require('../models/Task');
const { formatResponse } = require('../utils/response.util');

const createTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const taskData = { ...req.body, userId };
    
    const task = await Task.create(taskData);
    
    res.status(201).json(formatResponse(true, 'Task created successfully', task));
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { userId } = req.user;
    
    // Using simple find which retrieves all user tasks 
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json(formatResponse(true, 'Tasks retrieved successfully', tasks));
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    const task = await Task.findOne({ _id: id, userId });
    
    if (!task) {
      return res.status(404).json(formatResponse(false, 'Task not found or unauthorized'));
    }
    
    res.status(200).json(formatResponse(true, 'Task retrieved successfully', task));
  } catch (error) {
    // If id is malformed, mongoose throws CastError
    if (error.name === 'CastError') {
       return res.status(400).json(formatResponse(false, 'Invalid task ID format'));
    }
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const updateData = req.body;
    
    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json(formatResponse(false, 'Task not found or unauthorized'));
    }
    
    res.status(200).json(formatResponse(true, 'Task updated successfully', task));
  } catch (error) {
     if (error.name === 'CastError') {
       return res.status(400).json(formatResponse(false, 'Invalid task ID format'));
    }
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    const task = await Task.findOneAndDelete({ _id: id, userId });
    
    if (!task) {
      return res.status(404).json(formatResponse(false, 'Task not found or unauthorized'));
    }
    
    res.status(200).json(formatResponse(true, 'Task deleted successfully'));
  } catch (error) {
     if (error.name === 'CastError') {
       return res.status(400).json(formatResponse(false, 'Invalid task ID format'));
    }
    next(error);
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
