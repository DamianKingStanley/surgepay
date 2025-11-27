// models/ExamQuestion.ts
import mongoose, { model, models, Schema } from "mongoose";

export interface IExamQuestion {
  _id?: string;
  schoolId: mongoose.Schema.Types.ObjectId;
  teacherId: mongoose.Schema.Types.ObjectId;
  title: string;
  description?: string;
  questions: {
    question: string;
    type: "multiple_choice" | "short_answer" | "fill_blank";
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    lessonNoteIds: mongoose.Schema.Types.ObjectId[];
    difficulty: "easy" | "medium" | "hard";
  }[];
  sourceLessonNotes: mongoose.Schema.Types.ObjectId[];
  subject: string;
  classLevel: string;
  totalQuestions: number;
  duration?: number;
  instructions?: string;
  isShuffled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExamQuestionSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ["multiple_choice", "short_answer", "fill_blank", "true_false"],
          required: true,
        },
        options: [
          {
            type: String,
            trim: true,
          },
        ],
        correctAnswer: {
          type: String,
          required: true,
          trim: true,
        },
        explanation: {
          type: String,
          trim: true,
        },
        lessonNoteIds: [
          {
            type: Schema.Types.ObjectId,
            ref: "LessonNote",
          },
        ],
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
      },
    ],
    sourceLessonNotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "LessonNote",
        required: true,
      },
    ],
    subject: {
      type: String,
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    duration: {
      type: Number, // in minutes
      min: 5,
    },
    instructions: {
      type: String,
      trim: true,
    },
    isShuffled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ExamQuestion =
  models.ExamQuestion || model("ExamQuestion", ExamQuestionSchema);
export default ExamQuestion;
