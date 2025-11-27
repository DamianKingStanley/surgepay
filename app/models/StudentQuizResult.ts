// models/StudentQuizResult.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
  questionId: string;
  questionText: string;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  score: number;
}

export interface IStudentQuizResult extends Document {
  schoolId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  regNumber: string;
  classLevel: string;
  name: string;
  totalScore: number;
  totalQuestions: number;
  percentage: number;
  answers: IAnswer[];
  submittedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: String,
    questionText: String,
    selectedAnswer: Schema.Types.Mixed,
    isCorrect: Boolean,
    score: Number,
  },
  { _id: false }
);

const StudentQuizResultSchema = new Schema<IStudentQuizResult>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    regNumber: { type: String, required: true },
    name: { type: String, required: true },
    classLevel: { type: String, required: true },
    totalScore: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    answers: [AnswerSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.StudentQuizResult ||
  mongoose.model<IStudentQuizResult>(
    "StudentQuizResult",
    StudentQuizResultSchema
  );
