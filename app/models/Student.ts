import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schoolUniqueId: String,
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
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
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔹 Generate Reg Number Automatically
studentSchema.statics.generateRegNumber = async function (
  schoolId,
  schoolName
) {
  const latest = await this.findOne(
    { schoolId },
    {},
    { sort: { createdAt: -1 } }
  );
  let next = 1;
  if (latest?.regNumber) {
    const match = latest.regNumber.match(/\d{6}$/);
    if (match) next = parseInt(match[0]) + 1;
  }
  const year = new Date().getFullYear().toString().slice(-2);
  const code = schoolName.toUpperCase().replace(/\s+/g, "");
  return `${code}/${year}/${next.toString().padStart(6, "0")}`;
};

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
