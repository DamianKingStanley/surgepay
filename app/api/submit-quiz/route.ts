/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../libs/mongodb";
import Quiz from "../../models/Quiz";
import StudentQuizResult from "../../models/StudentQuizResult";
import Student from "../../models/Student";
import { ActivityLogger } from "../../libs/activityLogger";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { studentId, quizId, answers } = body;

    // console.log("📥 Received submission request:", {
    //   studentId,
    //   quizId,
    //   answersCount: answers?.length,
    // });

    // Validate required fields
    if (!studentId || !quizId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, quizId, or answers" },
        { status: 400 }
      );
    }

    // Validate answers array
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Answers must be a non-empty array" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const student = await Student.findById(studentId);
    const quiz = await Quiz.findById(quizId);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (student.classLevel !== quiz.classLevel) {
      return NextResponse.json(
        { error: "Unauthorized class level" },
        { status: 403 }
      );
    }

    let totalScore = 0;
    const answerDetails = [];

    // console.log("🔍 Processing answers...");

    for (const ans of answers) {
      // Validate each answer object
      if (!ans.questionId || !ans.selectedAnswer) {
        // console.log("Skipping invalid answer:", ans);
        continue;
      }

      // Find the question by ID
      const q = quiz.questions.find(
        (question: any) => question._id.toString() === ans.questionId
      );

      if (!q) {
        // console.log(`❌ Question not found for ID: ${ans.questionId}`);
        continue;
      }

      let isCorrect = false;
      let score = 0;

      // console.log(`📝 Processing question: ${q.text.substring(0, 50)}...`);
      // console.log(`🎯 Correct answers:`, q.correct);
      // console.log(`📨 Student answer:`, ans.selectedAnswer);

      if (q.type === "multiple_choice" || q.type === "true_false") {
        if (Array.isArray(q.correct)) {
          isCorrect = q.correct.includes(ans.selectedAnswer);
        } else {
          isCorrect = q.correct === ans.selectedAnswer;
        }
      } else if (q.type === "short_answer") {
        const correctAnswers = Array.isArray(q.correct)
          ? q.correct
          : [q.correct];
        const studentAnswer = ans.selectedAnswer.toLowerCase().trim();

        isCorrect = correctAnswers.some((correct: string) =>
          studentAnswer.includes(correct.toLowerCase().trim())
        );
      }

      if (isCorrect) {
        score = q.marks || 1;
        // console.log(`✅ Correct! Score: ${score}`);
      } else {
        // console.log(`❌ Incorrect. Score: 0`);
      }

      totalScore += score;

      answerDetails.push({
        questionId: q._id,
        questionText: q.text,
        selectedAnswer: ans.selectedAnswer,
        isCorrect,
        score,
        correctAnswer: q.correct,
      });
    }

    const totalQuestions = quiz.questions.length;
    const percentage =
      totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    // console.log(
    //   `📊 Final Score: ${totalScore}/${totalQuestions} (${percentage}%)`
    // );

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
      submittedAt: new Date(),
    });

    // console.log("✅ Quiz result saved to database");
    await ActivityLogger.quizTaken(
      result._id,
      result.topic,
      result.studentName,
      result.totalScore
    );

    return NextResponse.json(
      {
        message: "Quiz submitted successfully",
        result: {
          id: result._id,
          totalScore: result.totalScore,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          answers: result.answers,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    // console.error("❌ Submit quiz error:", err);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
