/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/analytics/teacher/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import Teacher from "../../../models/Teacher";
import Student from "../../../models/Student";
import Timetable from "../../../models/Timetable";
import LessonNote from "../../../models/LessonNote";
import Quiz from "../../../models/Quiz";
import ExamQuestion from "../../../models/ExamQuestion";
import Attendance from "../../../models/Attendance";
import StudentQuizResult from "../../../models/StudentQuizResult";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("classLevel") ?? undefined;

    // Get teacher info - check both User and Teacher models
    let teacher = await mongoose.model("User").findOne({
      email: session.user.email,
      userRole: "teacher",
    });

    if (!teacher) {
      // Try finding in Teacher model
      teacher = await Teacher.findOne({ email: session.user.email });
    }

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const analytics = await getTeacherAnalyticsData(teacher._id, classLevel);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Teacher analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher analytics" },
      { status: 500 }
    );
  }
}

async function getTeacherAnalyticsData(
  teacherId: mongoose.Types.ObjectId,
  classLevel?: string
) {
  // Get teacher's details including assigned classes
  let teacher = await mongoose.model("User").findById(teacherId);
  if (!teacher) {
    teacher = await Teacher.findById(teacherId);
  }

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  const assignedClasses = teacher.assignedClasses || [];
  const teacherSchoolId = teacher.schoolId;

  // If classLevel is provided, validate it's in assigned classes
  if (classLevel && !assignedClasses.includes(classLevel)) {
    throw new Error("Teacher not assigned to this class");
  }

  // Base filters for teacher's data
  const teacherFilter = { teacherId };
  const classFilter = classLevel ? { classLevel } : {};

  // For student-related queries, filter by assigned classes and school
  const studentBaseFilter = {
    schoolId: teacherSchoolId,
    classLevel: classLevel ? classLevel : { $in: assignedClasses },
  };

  const [
    studentCount,
    timetableCount,
    lessonNoteCount,
    quizCount,
    examQuestionCount,
    attendanceCount,
    studentResults,
    classDistribution,
    subjectDistribution,
    attendanceTrends,
  ] = await Promise.all([
    // Students count from assigned classes
    Student.countDocuments(studentBaseFilter),

    // Timetables count
    Timetable.countDocuments({
      ...teacherFilter,
      ...classFilter,
    }),

    // Lesson notes count
    LessonNote.countDocuments({
      ...teacherFilter,
      ...classFilter,
    }),

    // Quizzes count
    Quiz.countDocuments({
      ...teacherFilter,
      ...classFilter,
    }),

    // Exam questions count
    ExamQuestion.countDocuments({
      ...teacherFilter,
      ...classFilter,
    }),

    // Attendance records count
    Attendance.countDocuments({
      ...teacherFilter,
      ...classFilter,
    }),

    // Student quiz results for performance analysis
    StudentQuizResult.find({
      schoolId: teacherSchoolId,
      classLevel: classLevel ? classLevel : { $in: assignedClasses },
    })
      .populate("quizId", "title subject")
      .populate("studentId", "name"),

    // Class distribution
    Student.aggregate([
      {
        $match: studentBaseFilter,
      },
      {
        $group: {
          _id: "$classLevel",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // Subject distribution
    Promise.all([
      // Quiz subjects
      Quiz.aggregate([
        {
          $match: {
            ...teacherFilter,
            ...classFilter,
          },
        },
        {
          $group: {
            _id: "$subject",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Lesson note subjects
      LessonNote.aggregate([
        {
          $match: {
            ...teacherFilter,
            ...classFilter,
          },
        },
        {
          $group: {
            _id: "$subject",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]),

    // Attendance trends (last 30 days)
    Attendance.aggregate([
      {
        $match: {
          ...teacherFilter,
          ...classFilter,
          date: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]),
  ]);

  // Performance analysis
  const performanceData = analyzeTeacherPerformance(studentResults);

  // Process subject distribution
  const [quizSubjects, lessonNoteSubjects] = subjectDistribution;

  // Process attendance trends
  const processedTrends = processAttendanceTrends(attendanceTrends);

  return {
    overview: {
      students: studentCount,
      timetables: timetableCount,
      lessonNotes: lessonNoteCount,
      quizzes: quizCount,
      examQuestions: examQuestionCount,
      attendanceRecords: attendanceCount,
    },
    performance: performanceData,
    distributions: {
      classes: classDistribution.map((item: any) => ({
        classLevel: item._id,
        count: item.count,
      })),
      subjects: {
        quizzes: quizSubjects,
        lessonNotes: lessonNoteSubjects,
      },
    },
    trends: processedTrends,
    lastUpdated: new Date().toISOString(),
    filtersApplied: {
      classLevel: classLevel || "all",
      assignedClasses: assignedClasses,
    },
  };
}

function analyzeTeacherPerformance(results: any[]) {
  if (!results || results.length === 0) {
    return {
      averageScore: 0,
      bestClass: null,
      topPerformers: [],
      subjectPerformance: [],
      totalAttempts: 0,
    };
  }

  // Calculate average score
  const totalScore = results.reduce(
    (sum: number, result: any) => sum + (result.percentage || 0),
    0
  );
  const averageScore = totalScore / results.length;

  // Group by class for best class calculation
  const classPerformance = results.reduce((acc: any, result: any) => {
    const classLevel = result.classLevel;
    if (!acc[classLevel]) {
      acc[classLevel] = { total: 0, count: 0 };
    }
    acc[classLevel].total += result.percentage || 0;
    acc[classLevel].count += 1;
    return acc;
  }, {});

  let bestClass = null;
  let bestAverage = -1;

  for (const [classLevel, data] of Object.entries(classPerformance) as [
    string,
    any,
  ][]) {
    const average = data.total / data.count;
    if (average > bestAverage) {
      bestAverage = average;
      bestClass = classLevel;
    }
  }

  // Top performers (limit to 5)
  const topPerformers = results
    .filter((result) => result.percentage !== undefined)
    .sort((a: any, b: any) => (b.percentage || 0) - (a.percentage || 0))
    .slice(0, 5)
    .map((result: any) => ({
      name: result.studentId?.name || "Unknown Student",
      classLevel: result.classLevel,
      score: Math.round(result.percentage || 0),
      subject: result.quizId?.subject || "Unknown Subject",
    }));

  // Subject performance
  const subjectPerformance = Object.entries(
    results.reduce((acc: any, result: any) => {
      const subject = result.quizId?.subject || "Unknown";
      if (!acc[subject]) {
        acc[subject] = { total: 0, count: 0 };
      }
      acc[subject].total += result.percentage || 0;
      acc[subject].count += 1;
      return acc;
    }, {})
  ).map(([subject, data]: [string, any]) => ({
    subject,
    averageScore: Math.round((data.total / data.count) * 100) / 100,
  }));

  return {
    averageScore: Math.round(averageScore * 100) / 100,
    bestClass,
    topPerformers,
    subjectPerformance,
    totalAttempts: results.length,
  };
}

function processAttendanceTrends(attendanceData: any[]) {
  if (!attendanceData || attendanceData.length === 0) {
    return [];
  }

  // Group by date and calculate attendance rate
  const dateMap = attendanceData.reduce((acc: any, item: any) => {
    const date = item._id.date;
    const status = item._id.status;
    const count = item.count;

    if (!acc[date]) {
      acc[date] = { present: 0, total: 0 };
    }

    acc[date].total += count;
    if (status === "present") {
      acc[date].present += count;
    }

    return acc;
  }, {});

  // Convert to array and calculate rates
  const trends = Object.entries(dateMap)
    .map(([date, data]: [string, any]) => ({
      date,
      attendanceRate:
        data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 days

  return trends;
}
