// libs/limitChecker.ts
import { connectToDatabase } from "./mongodb";
import User from "../models/User";
import Teacher from "../models/Teacher";
import Student from "../models/Student";
import Quiz from "../models/Quiz";
import LessonNote from "../models/LessonNote";
import ExamQuestion from "../models/ExamQuestion";
import Attendance from "../models/Attendance";
import Job from "../models/Job";
import TimeTable from "../models/Timetable";

interface LimitCheckResult {
  allowed: boolean;
  error?: string;
  currentCount?: number;
  limit?: number;
}

export async function checkSubscriptionStatus(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school) {
      return { allowed: false, error: "School not found" };
    }

    const subscription = school.subscription;

    // Check if subscription exists and is active
    if (!subscription || subscription.status !== "active") {
      return {
        allowed: false,
        error:
          "Your subscription is inactive or expired. Please renew your plan.",
      };
    }

    // Check if subscription is expired by date
    if (
      subscription.expiryDate &&
      new Date(subscription.expiryDate) < new Date()
    ) {
      // Auto-expire the subscription
      school.subscription.status = "expired";
      await school.save();
      return {
        allowed: false,
        error: "Your subscription has expired. Please renew to continue.",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Subscription check error:", error);
    return { allowed: false, error: "Error checking subscription status" };
  }
}

export async function checkTeacherLimit(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school || !school.subscription) {
      return { allowed: false, error: "School or subscription not found" };
    }

    const teacherLimit = school.subscription.limits?.teachers || 2;
    const currentTeachers = await Teacher.countDocuments({ schoolId });

    if (currentTeachers >= teacherLimit) {
      return {
        allowed: false,
        error: `Teacher limit reached. Your plan allows ${teacherLimit} teachers.`,
        currentCount: currentTeachers,
        limit: teacherLimit,
      };
    }

    return {
      allowed: true,
      currentCount: currentTeachers,
      limit: teacherLimit,
    };
  } catch (error) {
    console.error("Teacher limit check error:", error);
    return { allowed: false, error: "Error checking teacher limit" };
  }
}

export async function checkStudentLimit(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school || !school.subscription) {
      return { allowed: false, error: "School or subscription not found" };
    }

    const studentLimit = school.subscription.limits?.students || 5;
    const currentStudents = await Student.countDocuments({ schoolId });

    if (currentStudents >= studentLimit) {
      return {
        allowed: false,
        error: `Student limit reached. Your plan allows ${studentLimit} students.`,
        currentCount: currentStudents,
        limit: studentLimit,
      };
    }

    return {
      allowed: true,
      currentCount: currentStudents,
      limit: studentLimit,
    };
  } catch (error) {
    console.error("Student limit check error:", error);
    return { allowed: false, error: "Error checking student limit" };
  }
}

export async function checkQuizLimit(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school || !school.subscription) {
      return { allowed: false, error: "School or subscription not found" };
    }

    const quizLimit = school.subscription.limits?.quizzes || 2;
    const currentQuizzes = await Quiz.countDocuments({ schoolId });

    if (currentQuizzes >= quizLimit) {
      return {
        allowed: false,
        error: `Quiz limit reached. Your plan allows ${quizLimit} quizzes.`,
        currentCount: currentQuizzes,
        limit: quizLimit,
      };
    }

    return {
      allowed: true,
      currentCount: currentQuizzes,
      limit: quizLimit,
    };
  } catch (error) {
    console.error("Quiz limit check error:", error);
    return { allowed: false, error: "Error checking quiz limit" };
  }
}

export async function checkLessonNoteLimit(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school || !school.subscription) {
      return { allowed: false, error: "School or subscription not found" };
    }

    const lessonNoteLimit = school.subscription.limits?.lessonnotes || 2;
    const currentLessonNotes = await LessonNote.countDocuments({ schoolId });

    if (currentLessonNotes >= lessonNoteLimit) {
      return {
        allowed: false,
        error: `Lesson note limit reached. Your plan allows ${lessonNoteLimit} lesson notes.`,
        currentCount: currentLessonNotes,
        limit: lessonNoteLimit,
      };
    }

    return {
      allowed: true,
      currentCount: currentLessonNotes,
      limit: lessonNoteLimit,
    };
  } catch (error) {
    console.error("Lesson note limit check error:", error);
    return { allowed: false, error: "Error checking lesson note limit" };
  }
}

export async function checkExamQuestionLimit(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school || !school.subscription) {
      return { allowed: false, error: "School or subscription not found" };
    }

    const examLimit = school.subscription.limits?.exams || 2;
    const currentExams = await ExamQuestion.countDocuments({ schoolId });

    if (currentExams >= examLimit) {
      return {
        allowed: false,
        error: `Exam question limit reached. Your plan allows ${examLimit} exam questions.`,
        currentCount: currentExams,
        limit: examLimit,
      };
    }

    return {
      allowed: true,
      currentCount: currentExams,
      limit: examLimit,
    };
  } catch (error) {
    console.error("Exam question limit check error:", error);
    return { allowed: false, error: "Error checking exam question limit" };
  }
}

export async function checkAttendanceLimit(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school || !school.subscription) {
      return { allowed: false, error: "School or subscription not found" };
    }

    const attendanceLimit = school.subscription.limits?.attendance || 2;
    const currentAttendance = await Attendance.countDocuments({ schoolId });

    if (currentAttendance >= attendanceLimit) {
      return {
        allowed: false,
        error: `Attendance record limit reached. Your plan allows ${attendanceLimit} attendance records.`,
        currentCount: currentAttendance,
        limit: attendanceLimit,
      };
    }

    return {
      allowed: true,
      currentCount: currentAttendance,
      limit: attendanceLimit,
    };
  } catch (error) {
    console.error("Attendance limit check error:", error);
    return { allowed: false, error: "Error checking attendance limit" };
  }
}

export async function checkJobLimit(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school || !school.subscription) {
      return { allowed: false, error: "School or subscription not found" };
    }

    const jobLimit = school.subscription.limits?.jobs || 3;
    const currentJobs = await Job.countDocuments({ schoolId });

    if (currentJobs >= jobLimit) {
      return {
        allowed: false,
        error: `Job posting limit reached. Your plan allows ${jobLimit} job postings.`,
        currentCount: currentJobs,
        limit: jobLimit,
      };
    }

    return {
      allowed: true,
      currentCount: currentJobs,
      limit: jobLimit,
    };
  } catch (error) {
    console.error("Job limit check error:", error);
    return { allowed: false, error: "Error checking job limit" };
  }
}

export async function checkTimeTableLimit(
  schoolId: string
): Promise<LimitCheckResult> {
  try {
    await connectToDatabase();

    const school = await User.findById(schoolId);
    if (!school || !school.subscription) {
      return { allowed: false, error: "School or subscription not found" };
    }

    const timetableLimit = school.subscription.limits?.jobs || 3;
    const currentJobs = await TimeTable.countDocuments({ schoolId });

    if (currentJobs >= timetableLimit) {
      return {
        allowed: false,
        error: `Job posting limit reached. Your plan allows ${timetableLimit} job postings.`,
        currentCount: currentJobs,
        limit: timetableLimit,
      };
    }

    return {
      allowed: true,
      currentCount: currentJobs,
      limit: timetableLimit,
    };
  } catch (error) {
    console.error("Job limit check error:", error);
    return { allowed: false, error: "Error checking job limit" };
  }
}

// Comprehensive check for any resource
export async function checkResourceLimit(
  schoolId: string,
  resourceType:
    | "teachers"
    | "students"
    | "quizzes"
    | "lessonnotes"
    | "exams"
    | "attendance"
    | "jobs"
): Promise<LimitCheckResult> {
  const checkers = {
    teachers: checkTeacherLimit,
    students: checkStudentLimit,
    quizzes: checkQuizLimit,
    lessonnotes: checkLessonNoteLimit,
    exams: checkExamQuestionLimit,
    attendance: checkAttendanceLimit,
    jobs: checkJobLimit,
  };

  const checker = checkers[resourceType];
  if (!checker) {
    return { allowed: false, error: `Unknown resource type: ${resourceType}` };
  }

  return await checker(schoolId);
}
