import mongoose, { model, models } from "mongoose";

const LessonNoteSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    term: {
      type: String,
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    subTopic: {
      type: String,
      required: true,
    },

    week: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    previousKnowledge: {
      type: String,
      required: true,
    },
    // ✅ Generated fields by DeepSeek
    lessonAimsObjectives: String,
    topicIntroduction: String,
    teacherStudentActivities: String,
    teachingMethods: String,
    teachingAids: String,
    lessonEvaluationConclusion: String,
    exercise: String,
    exerciseAnswers: String,
    lessonSummary: String,
  },
  { timestamps: true }
);

const LessonNote = models.LessonNote || model("LessonNote", LessonNoteSchema);
export default LessonNote;
