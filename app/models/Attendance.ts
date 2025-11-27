import mongoose from "mongoose";

const daySchema = new mongoose.Schema(
  {
    Monday: { type: String, enum: ["P", "A"], default: "A" },
    Tuesday: { type: String, enum: ["P", "A"], default: "A" },
    Wednesday: { type: String, enum: ["P", "A"], default: "A" },
    Thursday: { type: String, enum: ["P", "A"], default: "A" },
    Friday: { type: String, enum: ["P", "A"], default: "A" },
  },
  { _id: false }
);

const recordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    days: { type: daySchema, default: {} },
    totalPresent: { type: Number, default: 0 },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
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
    classLevel: { type: String, required: true },
    term: {
      type: String,
      enum: ["First Term", "Second Term", "Third Term"],
      required: true,
    },
    weekNumber: { type: Number, required: true },
    records: [recordSchema],
  },
  { timestamps: true }
);

// Auto-calculate totalPresent before saving
attendanceSchema.pre("save", function (next) {
  this.records.forEach((rec) => {
    const days = Object.values(rec.days || {});
    rec.totalPresent = days.filter((d) => d === "P").length;
  });
  next();
});

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
