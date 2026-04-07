import mongoose, { Document, Schema } from 'mongoose';

export interface IArchivedTask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  status: string;
  userId: string;
  originalTaskId: string;
}

const archivedTaskSchema = new Schema<IArchivedTask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    status: { type: String },
    userId: { type: String, required: true },
    originalTaskId: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

archivedTaskSchema.index({ userId: 1 });

const ArchivedTask = mongoose.model<IArchivedTask>('ArchivedTask', archivedTaskSchema);

export default ArchivedTask;
