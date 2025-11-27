import mongoose, { Document, Schema } from "mongoose";

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "fill_blank";

export interface IQuestion {
  text: string;
  type: QuestionType;
  options?: string[]; // for multiple_choice
  correct?: string | string[]; // correct answer(s)
  marks?: number;
}

export interface IQuiz extends Document {
  schoolId: mongoose.Types.ObjectId;
  schoolUniqueId?: string;
  createdBy: mongoose.Types.ObjectId; // teacher or admin id
  createdByRole: "teacher" | "school_admin";
  title: string;
  subject?: string;
  classLevel?: string;
  durationMinutes?: number;
  password?: string;
  status: "draft" | "published";
  quiz_status: "ongoing" | "ceased";
  questions: IQuestion[];
  quizUrl: string;
  scheduledAt?: Date;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    type: { type: String, required: true },
    options: { type: [String], default: [] },
    correct: { type: Schema.Types.Mixed },
    marks: { type: Number, default: 1 },
  },
  { _id: true }
);

const QuizSchema = new Schema<IQuiz>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "User" },
    schoolUniqueId: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdByRole: {
      type: String,
      enum: ["teacher", "school_admin"],
      required: true,
    },
    title: { type: String, required: true },
    subject: { type: String },
    classLevel: { type: String },
    durationMinutes: { type: Number, default: 30 },
    password: { type: String }, // students must provide to take quiz
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    quiz_status: {
      type: String,
      enum: ["ongoing", "ceased"],
      default: "ongoing",
    },
    questions: { type: [QuestionSchema], default: [] },
    quizUrl: { type: String, unique: true },
    scheduledAt: Date,
    startTime: Date,
    endTime: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Quiz ||
  mongoose.model<IQuiz>("Quiz", QuizSchema);
