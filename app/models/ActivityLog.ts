/* eslint-disable @typescript-eslint/no-explicit-any */
// models/ActivityLog.ts
import mongoose, { Schema, Document } from "mongoose";

export type ActivityType =
  | "student_created"
  | "student_updated"
  | "student_deleted"
  | "teacher_created"
  | "teacher_updated"
  | "teacher_deleted"
  | "quiz_created"
  | "quiz_updated"
  | "quiz_deleted"
  | "quiz_taken"
  | "timetable_created"
  | "timetable_updated"
  | "timetable_deleted"
  | "lesson_note_created"
  | "lesson_note_updated"
  | "lesson_note_deleted"
  | "exam_generated"
  | "exam_updated"
  | "exam_deleted"
  | "attendance_marked"
  | "attendance_updated"
  | "job_created"
  | "job_updated"
  | "job_deleted"
  | "job_application_submitted"
  | "job_application_updated"
  | "job_application_deleted";

export interface IActivityLog extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Who performed the action
  userRole: "school_admin" | "teacher" | "student";
  userName: string;
  activityType: ActivityType;
  targetType: string; // e.g., "Student", "Teacher", "Quiz", etc.
  targetId?: mongoose.Types.ObjectId;
  targetName?: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userRole: {
      type: String,
      enum: ["school_admin", "teacher", "student"],
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    activityType: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    targetName: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for efficient querying
ActivityLogSchema.index({ schoolId: 1, createdAt: -1 });
ActivityLogSchema.index({ activityType: 1 });
ActivityLogSchema.index({ userId: 1 });

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
