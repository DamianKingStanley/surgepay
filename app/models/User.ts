import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // --- Common Fields ---
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.role === "school_admin" || this.role === "teacher";
      },
    },
    userRole: {
      type: String,
      enum: ["school_admin", "teacher", "student", "admin"],
      required: true,
    },

    // --- School Fields ---
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    schoolUniqueId: {
      type: String,
      unique: true,
      sparse: true,
    },
    address: String,
    logo: String,
    motto: String,

    // --- Teacher Fields ---
    teacherName: String,
    assignedClasses: [String],
    subjects: [String],

    // --- Student Fields ---
    regNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    classLevel: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // --- System Fields ---
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: String,
    resetTokenExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // --- Subscription / Plan Fields ---
    subscription: {
      planName: {
        type: String,
        enum: ["Free", "Basic", "Standard", "Premium", "Flex"],
        default: "Free",
      },
      planType: {
        type: String,
        enum: ["term", "annual"],
        default: "term",
      },
      amount: { type: Number, default: 0 },
      startDate: { type: Date },
      expiryDate: { type: Date },
      txRef: { type: String }, // Transaction reference
      status: {
        type: String,
        enum: ["active", "expired", "trial"],
        default: "trial",
      },
      limits: {
        teachers: { type: Number, default: 2 },
        students: { type: Number, default: 5 },
        quizzes: { type: Number, default: 2 },
        attendance: { type: Number, default: 2 },
        lessonnotes: { type: Number, default: 2 },
        timetable: { type: Number, default: 2 },
        exams: { type: Number, default: 2 },
        jobs: { type: Number, default: 3 },
      },
    },
    planHelperAnswers: [
      {
        question: String,
        answer: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
// Add to your User model
userSchema.statics.generateStudentRegNumber = async function (
  schoolId,
  schoolName
) {
  const latestStudent = await this.findOne(
    { schoolId, userRole: "student" },
    {},
    { sort: { createdAt: -1 } }
  );

  let nextNumber = 1;
  if (latestStudent && latestStudent.regNumber) {
    const matches = latestStudent.regNumber.match(/\d{6}$/);
    if (matches) {
      nextNumber = parseInt(matches[0]) + 1;
    }
  }

  const currentYear = new Date().getFullYear().toString().slice(-2);
  const schoolCode = schoolName.toUpperCase().replace(/\s+/g, "");

  return `${schoolCode}/${currentYear}/${nextNumber.toString().padStart(6, "0")}`;
};
