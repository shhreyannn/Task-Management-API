import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  name: string;
  userId: string;
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<ITag>('Tag', tagSchema);
