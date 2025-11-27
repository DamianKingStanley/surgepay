import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // the school admin that owns this teacher
      required: true,
    },
    schoolUniqueId: String,
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
    },
    userRole: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
      default: "teacher",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    assignedClasses: [String],
    subjects: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Teacher ||
  mongoose.model("Teacher", teacherSchema);
