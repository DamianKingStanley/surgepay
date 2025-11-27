/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/student-quiz/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../libs/mongodb";
import Quiz from "../../models/Quiz";
import Student from "../../models/Student";
import StudentQuizResult from "../../models/StudentQuizResult";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const { name, regNumber, classLevel, password } = await request.json();

    await connectToDatabase();

    const student = await Student.findOne({
      name,
      regNumber,
      classLevel,
      password,
    });
    if (!student)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    // Return student basic info for session frontend
    return NextResponse.json(
      {
        message: "Login successful",
        student: {
          id: student._id,
          name: student.name,
          regNumber: student.regNumber,
          classLevel: student.classLevel,
          schoolId: student.schoolId,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Student login error:", err);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
// ✅ SUBMIT QUIZ
export async function PUT(request: Request) {
  try {
    const { studentId, quizId, answers } = await request.json();

    await connectToDatabase();

    const student = await Student.findById(studentId);
    const quiz = await Quiz.findById(quizId);

    if (!student || !quiz)
      return NextResponse.json(
        { error: "Invalid student or quiz" },
        { status: 404 }
      );

    if (student.classLevel !== quiz.classLevel)
      return NextResponse.json(
        { error: "Unauthorized class level" },
        { status: 403 }
      );

    let totalScore = 0;
    const answerDetails = [];

    for (const ans of answers) {
      const q = quiz.questions.find(
        (qq: { text: any; _id: { toString: () => any } }) =>
          qq.text === ans.questionText || qq._id.toString() === ans.questionId
      );
      if (!q) continue;

      let isCorrect = false;
      let score = 0;

      if (q.type === "multiple_choice" || q.type === "true_false") {
        isCorrect = Array.isArray(q.correct)
          ? q.correct.includes(ans.selectedAnswer)
          : q.correct === ans.selectedAnswer;
      } else if (q.type === "short_answer") {
        const correct = Array.isArray(q.correct)
          ? q.correct.join(" ").toLowerCase()
          : q.correct?.toString().toLowerCase() || "";
        const studentAns = ans.selectedAnswer.toLowerCase();
        const keywords = correct.split(" ");
        isCorrect = keywords.some((kw: any) => studentAns.includes(kw));
      }

      if (isCorrect) score = q.marks || 1;
      totalScore += score;

      answerDetails.push({
        questionId: q._id,
        questionText: q.text,
        selectedAnswer: ans.selectedAnswer,
        isCorrect,
        score,
      });
    }

    const totalQuestions = quiz.questions.length;
    const percentage = (totalScore / (totalQuestions || 1)) * 100;

    const result = await StudentQuizResult.create({
      schoolId: student.schoolId,
      studentId: student._id,
      quizId: quiz._id,
      regNumber: student.regNumber,
      name: student.name,
      classLevel: student.classLevel,
      totalScore,
      totalQuestions,
      percentage,
      answers: answerDetails,
    });

    return NextResponse.json(
      { message: "Quiz submitted", result },
      { status: 200 }
    );
  } catch (err) {
    console.error("Submit quiz error:", err);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

// ✅ FETCH STUDENT RESULTS
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regNumber = searchParams.get("regNumber");

    await connectToDatabase();

    const student = await Student.findOne({ regNumber });
    if (!student)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const results = await StudentQuizResult.find({ studentId: student._id })
      .populate("quizId", "title subject")
      .sort({ createdAt: -1 });

    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    console.error("Fetch results error:", err);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

// ✅ FETCH AVAILABLE QUIZZES
// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const regNumber = searchParams.get("regNumber");
//     const classLevel = searchParams.get("classLevel");

//     await connectToDatabase();

//     const student = await Student.findOne({ regNumber, classLevel });
//     if (!student)
//       return NextResponse.json({ error: "Student not found" }, { status: 404 });

//     const quizzes = await Quiz.find({
//       schoolId: student.schoolId,
//       classLevel: student.classLevel,
//       quiz_status: "ongoing",
//     }).sort({ createdAt: -1 });

//     return NextResponse.json({ quizzes }, { status: 200 });
//   } catch (err) {
//     console.error("Fetch quizzes error:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch quizzes" },
//       { status: 500 }
//     );
//   }
// }
