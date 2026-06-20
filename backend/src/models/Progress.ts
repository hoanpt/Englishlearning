import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  studentName: string;
  dob: string;
  previousClass: string;
  testDate: string;
  answers: Record<string, string | number>;
  score: number;
  maxScore: number;
  percentage: number;
  placementClass: string;
  diagnostics: string[];
  createdAt: Date;
}

const ProgressSchema: Schema = new Schema({
  studentName: { type: String, required: true },
  dob: { type: String, default: '' },
  previousClass: { type: String, default: '' },
  testDate: { type: String, required: true },
  answers: { type: Schema.Types.Mixed, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
  placementClass: { type: String, required: true },
  diagnostics: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProgress>('Progress', ProgressSchema);
