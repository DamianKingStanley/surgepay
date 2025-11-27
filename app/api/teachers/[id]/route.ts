/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import Teacher from "../../../models/Teacher";
import Student from "../../../models/Student";
import Quiz from "../../../models/Quiz";
import Timetable from "../../../models/Timetable";
import LessonNote from "../../../models/LessonNote";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET(request: Request, contextPromise: any) {
  const { params } = await contextPromise; // ✅ Await context

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const teacherId = params.id;

    // Verify teacher belongs to the school
    const teacher = await Teacher.findOne({
      _id: teacherId,
      schoolId: session.user.id,
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get number of students in teacher's assigned classes
    const studentsCount = await Student.countDocuments({
      schoolId: session.user.id,
      classLevel: { $in: teacher.assignedClasses },
    });

    // Get quizzes created by this teacher
    const quizzes = await Quiz.find({
      createdBy: teacherId,
      schoolId: session.user.id,
    }).sort({ createdAt: -1 });

    const quizzesCount = quizzes.length;

    // Get active quizzes (quizzes that are not expired)
    // ✅ Get active quizzes (those with status "ongoing")
    const activeQuizzes = quizzes.filter(
      (quiz) => quiz.quiz_status === "ongoing"
    ).length;

    // Calculate average score from quiz results
    let averageScore = 0;
    if (quizzesCount > 0) {
      const totalScores = quizzes.reduce((sum, quiz) => {
        return sum + (quiz.averageScore || 0);
      }, 0);
      averageScore = Math.round(totalScores / quizzesCount);
    }

    // Get timetables created by this teacher
    const timetables = await Timetable.find({
      teacherId: teacherId,
      schoolId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get lesson notes created by this teacher
    const lessonNotes = await LessonNote.find({
      teacherId: teacherId,
      schoolId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get students in teacher's classes (recent ones)
    const recentStudents = await Student.find({
      schoolId: session.user.id,
      classLevel: { $in: teacher.assignedClasses },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get last activity (latest creation date from all activities)
    const lastActivity = teacher.updatedAt;

    // Get recent activities from all sources
    const recentActivities = [];

    // Add quiz creation activities
    const recentQuizzes = quizzes.slice(0, 3);
    recentQuizzes.forEach((quiz) => {
      recentActivities.push({
        type: "quiz_created",
        description: `Created quiz: "${quiz.title}"`,
        timestamp: quiz.createdAt,
        icon: "FileText",
      });
    });

    // Add timetable creation activities
    const recentTimetables = timetables.slice(0, 2);
    recentTimetables.forEach((timetable) => {
      recentActivities.push({
        type: "timetable_created",
        description: `Created timetable for ${timetable.classLevel}`,
        timestamp: timetable.createdAt,
        icon: "Calendar",
      });
    });

    // Add lesson note creation activities
    const recentLessonNotes = lessonNotes.slice(0, 2);
    recentLessonNotes.forEach((note) => {
      recentActivities.push({
        type: "lesson_note_created",
        description: `Created lesson note: "${note.topic}"`,
        timestamp: note.createdAt,
        icon: "BookOpen",
      });
    });

    // Add student enrollment activities (students in teacher's classes)
    const newStudents = recentStudents.slice(0, 2);
    newStudents.forEach((student) => {
      recentActivities.push({
        type: "student_enrolled",
        description: `New student: ${student.name} in ${student.classLevel}`,
        timestamp: student.createdAt,
        icon: "User",
      });
    });

    // Add login activity
    recentActivities.push({
      type: "login",
      description: "Logged into system",
      timestamp: teacher.updatedAt,
      icon: "LogIn",
    });

    // Sort activities by timestamp (newest first) and take only 5 most recent
    recentActivities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const finalRecentActivities = recentActivities.slice(0, 5);

    return NextResponse.json({
      studentsCount,
      quizzesCount,
      activeQuizzes,
      averageScore,
      timetablesCount: timetables.length,
      lessonNotesCount: lessonNotes.length,
      lastActivity: formatTimeAgo(lastActivity),
      recentActivities: finalRecentActivities,
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher statistics" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  return date.toLocaleDateString();
}
