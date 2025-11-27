// models/JobApplication.ts
import mongoose, { Schema, Document } from "mongoose";

export type ApplicationStatus =
  | "pending"
  | "rejected"
  | "accepted"
  | "interview";

export interface IJobApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  applicantName: string;
  email: string;
  phone?: string;
  education?: string;
  cvUrl?: string;
  pulicId?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    education: String,
    cvUrl: String,
    pulicId: String,
    coverLetter: String,
    status: {
      type: String,
      enum: ["pending", "rejected", "accepted", "interview"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
