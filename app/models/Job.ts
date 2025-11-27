// models/Job.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  schoolId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // school (user) id
  title: string;
  description: string;
  requirements?: string[];
  location?: string;
  employmentType?: string; // e.g. "Full-time"
  salaryRange?: string;
  closingDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    location: { type: String },
    employmentType: { type: String },
    salaryRange: { type: String },
    closingDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
