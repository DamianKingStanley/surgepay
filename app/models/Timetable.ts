// models/Timetable.ts
import mongoose from "mongoose";

const periodSchema = new mongoose.Schema(
  {
    periodNumber: { type: mongoose.Schema.Types.Mixed, required: true }, // Changed to Mixed to accept numbers and strings
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    teacherName: { type: String },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      required: true,
    },
    periods: [periodSchema],
    isExtracurricular: { type: Boolean, default: false },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
      enum: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    term: {
      type: String,
      enum: ["First Term", "Second Term", "Third Term"],
      required: true,
    },
    config: {
      schoolStartTime: { type: String, required: true },
      schoolEndTime: { type: String, required: true },
      periodDuration: { type: Number, required: true },
      breakTime: { type: String, required: true },
      breakDuration: { type: Number, required: true },
      lunchTime: { type: String },
      lunchDuration: { type: Number },
      extracurricularDays: [{ type: String }],
    },
    subjects: [
      {
        name: { type: String, required: true },
        periodsPerWeek: { type: Number, required: true },
        preferredTimes: [{ type: String }],
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
        teacherName: { type: String },
      },
    ],
    days: [daySchema],
    aiPrompt: { type: String },
    aiResponse: { type: String }, // Changed to String to store JSON as string
    isGenerated: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Timetable ||
  mongoose.model("Timetable", timetableSchema);
