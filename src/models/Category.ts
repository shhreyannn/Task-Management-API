import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  userId: string;
  isPredefined: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: String },
    isPredefined: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<ICategory>('Category', categorySchema);
