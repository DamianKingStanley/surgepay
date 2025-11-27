/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import Quiz from "../../../models/Quiz";
import Student from "../../../models/Student";
import User from "../../../models/User";
import StudentQuizResult from "../../../models/StudentQuizResult";
import { ActivityLogger } from "../../../libs/activityLogger";

// Define proper TypeScript interfaces
interface ISchoolInfo {
  _id: string;
  name: string;
  logo?: string;
  address?: string;
  motto?: string;
  schoolUniqueId: string;
}

interface IQuiz {
  _id: string;
  title: string;
  subject?: string;
  classLevel?: string;
  durationMinutes: number;
  password?: string;
  status: "draft" | "published";
  quiz_status: "ongoing" | "ceased";
  questions: any[];
  quizUrl: string;
  createdAt: string;
  createdBy: string;
  createdByRole: "teacher" | "school_admin";
  createdByName?: string;
  schoolId?: string;
  schoolUniqueId?: string;
}

async function getSchoolInfoForQuiz(quiz: IQuiz): Promise<ISchoolInfo | null> {
  // Case 1: Quiz has direct schoolId
  if (quiz.schoolId) {
    const school = await User.findById(quiz.schoolId);
    return school;
  }

  // Case 2: School admin quiz (createdBy is the school admin's user ID)
  if (quiz.createdByRole === "school_admin" && quiz.createdBy) {
    const school = await User.findById(quiz.createdBy);
    return school;
  }

  // Case 3: Teacher quiz - get school from teacher's schoolId
  if (quiz.createdBy) {
    const teacher = await User.findById(quiz.createdBy)
      .select("schoolId")
      .lean();

    if (teacher && (teacher as any).schoolId) {
      const school = await User.findById((teacher as any).schoolId);
      return school;
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { name, regNumber, password, quizId } = await req.json();

    // ✅ Basic validation
    if (!name || !regNumber || !password || !quizId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // ✅ Find quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // ✅ Check if quiz is ongoing
    if (quiz.quiz_status !== "ongoing") {
      return NextResponse.json(
        { error: "This quiz is not currently active" },
        { status: 403 }
      );
    }

    // ✅ Check if quiz is published
    if (quiz.status !== "published") {
      return NextResponse.json(
        { error: "This quiz is not available" },
        { status: 403 }
      );
    }

    // ✅ Verify quiz password
    if (quiz.password !== password) {
      return NextResponse.json(
        { error: "Invalid quiz password" },
        { status: 401 }
      );
    }

    // ✅ Get school info for the quiz
    const schoolInfo = await getSchoolInfoForQuiz(quiz);
    if (!schoolInfo) {
      return NextResponse.json(
        { error: "School information not found for this quiz" },
        { status: 404 }
      );
    }

    // ✅ Find student in the same school
    const student = await Student.findOne({
      regNumber,
      schoolId: schoolInfo._id,
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found. Please check your registration number." },
        { status: 404 }
      );
    }

    // ✅ Verify student name
    if (student.name.toLowerCase() !== name.toLowerCase()) {
      return NextResponse.json(
        { error: "Name does not match registration record." },
        { status: 401 }
      );
    }

    // ✅ CRITICAL: Check if student's class level matches quiz class level
    if (student.classLevel !== quiz.classLevel) {
      return NextResponse.json(
        {
          error: `Access denied. This quiz is for ${quiz.classLevel} students only. You are registered in ${student.classLevel}.`,
        },
        { status: 403 }
      );
    }

    // ✅ Check if student has already taken this quiz
    const existingResult = await StudentQuizResult.findOne({
      studentId: student._id,
      quizId: quiz._id,
    });

    if (existingResult) {
      return NextResponse.json(
        {
          error:
            "You have already taken this quiz. Each student can only attempt a quiz once.",
        },
        { status: 403 }
      );
    }

    await ActivityLogger.studentLoggedin(
      student._id,
      student.name,
      student.regNumber,
      quiz._id,
      quiz.title,
      quiz.subject || ""
    );

    // ✅ Return successful login session
    return NextResponse.json(
      {
        message: "Login successful",
        student: {
          id: student._id,
          name: student.name,
          regNumber: student.regNumber,
          classLevel: student.classLevel,
          schoolUniqueId: student.schoolUniqueId,
          schoolId: student.schoolId,
        },
        quiz: {
          id: quiz._id,
          title: quiz.title,
          subject: quiz.subject,
          classLevel: quiz.classLevel,
          durationMinutes: quiz.durationMinutes,
          totalQuestions: quiz.questions.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Student quiz auth error:", error);
    return NextResponse.json(
      { error: "Failed to verify student credentials" },
      { status: 500 }
    );
  }
}
