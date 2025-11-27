/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../libs/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import Teacher from "../../models/Teacher";
import Student from "../../models/Student";
import Timetable from "../../models/Timetable";
import LessonNote from "../../models/LessonNote";
import Quiz from "../../models/Quiz";
import ExamQuestion from "../../models/ExamQuestion";
import Attendance from "../../models/Attendance";
import StudentQuizResult from "../../models/StudentQuizResult";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId") ?? undefined;
    const classLevel = searchParams.get("classLevel") ?? undefined;
    const timeRange = searchParams.get("timeRange") ?? "all";

    // Determine schoolId based on user role
    let schoolId: string;

    if (session.user.userRole === "school_admin") {
      schoolId = session.user.id;
      console.log("🏫 School admin detected, using user ID as schoolId:", schoolId);
    } else {
      schoolId = session.user.schoolId!;
      console.log("👨‍🏫 Teacher/student detected, using schoolId from profile:", schoolId);
    }

    if (!schoolId) {
      console.log("❌ No schoolId found for user");
      return NextResponse.json(
        { error: "School ID not found in user profile" },
        { status: 400 }
      );
    }

    console.log("✅ Final schoolId:", schoolId);
    console.log("✅ User role:", session.user.userRole);
    console.log("✅ TimeRange:", timeRange);

    const analytics = await getAnalyticsData(
      schoolId,
      teacherId,
      classLevel,
      timeRange
    );
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

async function getAnalyticsData(
  schoolId: string,
  teacherId?: string,
  classLevel?: string,
  timeRange?: string
) {
  const objectIdSchoolId = new mongoose.Types.ObjectId(schoolId);

  // Base query for teacher-specific data
  const teacherFilter = teacherId
    ? { teacherId: new mongoose.Types.ObjectId(teacherId) }
    : {};
  const classFilter = classLevel ? { classLevel } : {};

  // Get date filter based on timeRange
  const dateFilter = getDateFilterFromTimeRange(timeRange);

  console.log("📊 Analytics filters:", {
    schoolId,
    teacherId,
    classLevel,
    timeRange,
    dateFilter,
  });

  // Get all data in parallel
  const [
    teacherCount,
    studentCount,
    timetableCount,
    lessonNoteCount,
    quizCount,
    examQuestionCount,
    attendanceCount,
    studentResults,
    classDistribution,
    subjectDistribution,
    attendanceTrends
  ] = await Promise.all([
    // Teachers count
    Teacher.countDocuments({ schoolId: objectIdSchoolId }),

    // Students count
    Student.countDocuments({
      schoolId: objectIdSchoolId,
      ...(classLevel && { classLevel }),
    }),

    // Timetables count
    Timetable.countDocuments({
      schoolId: objectIdSchoolId,
      ...teacherFilter,
      ...classFilter,
      ...dateFilter.timetableFilter,
    }),

    // Lesson notes count
    LessonNote.countDocuments({
      schoolId: objectIdSchoolId,
      ...teacherFilter,
      ...classFilter,
      ...dateFilter.lessonNoteFilter,
    }),

    // Quizzes count
    Quiz.countDocuments({
      schoolId: objectIdSchoolId,
      ...teacherFilter,
      ...classFilter,
      ...dateFilter.quizFilter,
    }),

    // Exam questions count
    ExamQuestion.countDocuments({
      schoolId: objectIdSchoolId,
      ...teacherFilter,
      ...classFilter,
      ...dateFilter.examQuestionFilter,
    }),

    // Attendance records count
    Attendance.countDocuments({
      schoolId: objectIdSchoolId,
      ...teacherFilter,
      ...classFilter,
      ...dateFilter.attendanceFilter,
    }),

    // Student quiz results for performance analysis - FIXED: populate studentId for names
    StudentQuizResult.find({
      schoolId: objectIdSchoolId,
      ...(classLevel && { classLevel }),
      ...dateFilter.quizResultFilter,
    })
      .populate("quizId", "title subject")
      .populate("studentId", "name classLevel"),

    // Class distribution
    Student.aggregate([
      { 
        $match: { 
          schoolId: objectIdSchoolId,
          ...(classLevel && { classLevel }) 
        } 
      },
      { 
        $group: { 
          _id: "$classLevel", 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
    ]),

    // Subject distribution
    getSubjectDistribution(objectIdSchoolId, teacherFilter, classFilter, timeRange),

    // Attendance trends
    getAttendanceTrends(objectIdSchoolId, classFilter, timeRange),
  ]);

  // Performance analysis - FIXED: Now properly analyzes student results
  const performanceData = analyzeStudentPerformance(studentResults);

  return {
    overview: {
      teachers: teacherCount,
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
      subjects: subjectDistribution,
    },
    trends: attendanceTrends,
    lastUpdated: new Date().toISOString(),
    filtersApplied: {
      timeRange,
      classLevel: classLevel || "all",
      teacherId: teacherId || "all",
    },
  };
}

// Enhanced date filter function
function getDateFilterFromTimeRange(timeRange: string = "all") {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case "all":
    default:
      return {
        timetableFilter: {},
        lessonNoteFilter: {},
        quizFilter: {},
        examQuestionFilter: {},
        attendanceFilter: {},
        quizResultFilter: {},
      };
  }

  const dateFilter = { $gte: startDate };

  return {
    timetableFilter: { createdAt: dateFilter },
    lessonNoteFilter: { createdAt: dateFilter },
    quizFilter: { createdAt: dateFilter },
    examQuestionFilter: { createdAt: dateFilter },
    attendanceFilter: { date: dateFilter },
    quizResultFilter: { createdAt: dateFilter },
  };
}

// Subject distribution helper
async function getSubjectDistribution(
  schoolId: mongoose.Types.ObjectId,
  teacherFilter: any,
  classFilter: any,
  timeRange?: string
) {
  const dateFilter = getDateFilterFromTimeRange(timeRange);

  const [quizSubjects, lessonNoteSubjects] = await Promise.all([
    Quiz.aggregate([
      {
        $match: {
          schoolId,
          ...teacherFilter,
          ...classFilter,
          ...dateFilter.quizFilter,
        },
      },
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
    ]),
    LessonNote.aggregate([
      {
        $match: {
          schoolId,
          ...teacherFilter,
          ...classFilter,
          ...dateFilter.lessonNoteFilter,
        },
      },
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    quizzes: quizSubjects,
    lessonNotes: lessonNoteSubjects,
  };
}

// Attendance trends helper
async function getAttendanceTrends(
  schoolId: mongoose.Types.ObjectId,
  classFilter: any,
  timeRange?: string
) {
  const dateFilter = getDateFilterFromTimeRange(timeRange);

  const attendanceTrends = await Attendance.aggregate([
    {
      $match: {
        schoolId,
        ...classFilter,
        ...dateFilter.attendanceFilter,
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
  ]);

  return processAttendanceTrends(attendanceTrends);
}

// Process attendance trends into usable format
function processAttendanceTrends(attendanceData: any[]) {
  if (!attendanceData || attendanceData.length === 0) {
    return [];
  }

  const dateMap = attendanceData.reduce((acc: any, item: any) => {
    const date = item._id.date;
    const status = item._id.status;
    const count = item.count;

    if (!acc[date]) {
      acc[date] = { present: 0, total: 0 };
    }

    acc[date].total += count;
    if (status === 'present') {
      acc[date].present += count;
    }

    return acc;
  }, {});

  const trends = Object.entries(dateMap)
    .map(([date, data]: [string, any]) => ({
      date,
      attendanceRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  return trends;
}

// FIXED: Properly analyze student performance with populated data
function analyzeStudentPerformance(results: any[]) {
  if (!results || results.length === 0) {
    return {
      averageScore: 0,
      bestClass: null,
      worstClass: null,
      topPerformers: [],
      subjectPerformance: [],
      totalAttempts: 0
    };
  }

  // Calculate average score
  const totalScore = results.reduce(
    (sum: number, result: any) => sum + (result.percentage || 0),
    0
  );
  const averageScore = totalScore / results.length;

  // Group by class for best/worst class calculation
  const classPerformance = results.reduce((acc: any, result: any) => {
    const classLevel = result.studentId?.classLevel || result.classLevel || "Unknown";
    if (!acc[classLevel]) {
      acc[classLevel] = { total: 0, count: 0 };
    }
    acc[classLevel].total += result.percentage || 0;
    acc[classLevel].count += 1;
    return acc;
  }, {});

  let bestClass = null;
  let worstClass = null;
  let bestAverage = -1;
  let worstAverage = 101;

  for (const [classLevel, data] of Object.entries(classPerformance) as [string, any][]) {
    const average = data.total / data.count;
    if (average > bestAverage) {
      bestAverage = average;
      bestClass = classLevel;
    }
    if (average < worstAverage) {
      worstAverage = average;
      worstClass = classLevel;
    }
  }

  // Top performers (limit to 5)
  const topPerformers = results
    .filter(result => result.percentage !== undefined)
    .sort((a: any, b: any) => (b.percentage || 0) - (a.percentage || 0))
    .slice(0, 5)
    .map((result: any) => ({
      name: result.studentId?.name || "Unknown Student",
      classLevel: result.studentId?.classLevel || result.classLevel || "Unknown",
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
    worstClass,
    topPerformers,
    subjectPerformance,
    totalAttempts: results.length
  };
}