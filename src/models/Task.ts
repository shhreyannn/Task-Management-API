import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  status: 'pending' | 'completed';
  userId: string;
  isDeleted: boolean;
  category?: 'Work' | 'Personal' | 'Urgent';
  tags?: string[];
  reminderJobId?: string;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    userId: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    category: { type: String, enum: ['Work', 'Personal', 'Urgent'] },
    tags: { type: [String], default: [] },
    reminderJobId: { type: String },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ userId: 1, isDeleted: 1 });
taskSchema.index({ userId: 1, status: 1 });

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;
