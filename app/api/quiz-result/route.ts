/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../libs/mongodb";
import StudentQuizResult from "../../models/StudentQuizResult";
import Quiz from "../../models/Quiz";
import Student from "../../models/Student";
// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const studentId = searchParams.get("studentId");

    if (!quizId || !studentId) {
      return NextResponse.json(
        { error: "Quiz ID and Student ID are required" },
        { status: 400 }
      );
    }

    // Verify the student exists first
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const result = await StudentQuizResult.findOne({
      quizId,
      studentId,
    })
      .populate("studentId", "name regNumber classLevel")
      .populate("quizId", "title subject classLevel durationMinutes")
      .sort({ createdAt: -1 });

    if (!result) {
      return NextResponse.json(
        { error: "Quiz result not found" },
        { status: 404 }
      );
    }

    // Get the full quiz to include question details
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Enhance answers with question details
    const enhancedAnswers = result.answers.map((answer: any) => {
      const question = quiz.questions.find(
        (q: any) => q._id.toString() === answer.questionId.toString()
      );

      return {
        questionId: answer.questionId,
        questionText: answer.questionText,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        score: answer.score,
        correctAnswer: question?.correct,
        questionType: question?.type,
        options: question?.options,
        marks: question?.marks,
      };
    });

    // Return data in the format expected by frontend
    return NextResponse.json(
      {
        success: true,
        result: {
          id: result._id,
          // Match frontend expectation: result.quizId instead of result.quiz
          quizId: {
            _id: result.quizId._id,
            title: result.quizId.title,
            subject: result.quizId.subject,
            classLevel: result.quizId.classLevel,
            durationMinutes: result.quizId.durationMinutes,
          },
          studentId: {
            _id: result.studentId._id,
            name: result.studentId.name,
            regNumber: result.studentId.regNumber,
            classLevel: result.studentId.classLevel,
          },
          totalScore: result.totalScore,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          answers: enhancedAnswers,
          submittedAt: result.submittedAt,
          createdAt: result.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Fetch quiz result error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz result" },
      { status: 500 }
    );
  }
}

// Alternative: Get result by student ID (better approach)
export async function POST(req: Request) {
  try {
    const { studentId, quizId } = await req.json();

    if (!studentId || !quizId) {
      return NextResponse.json(
        { error: "Student ID and Quiz ID are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ✅ ACTUALLY USE THE IMPORTED STUDENT MODEL
    // Verify the student exists first
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const result = await StudentQuizResult.findOne({
      studentId,
      quizId,
    })
      .populate("studentId", "name regNumber classLevel")
      .populate("quizId", "title subject classLevel durationMinutes")
      .sort({ createdAt: -1 });

    if (!result) {
      return NextResponse.json(
        { error: "Quiz result not found" },
        { status: 404 }
      );
    }

    // Get the full quiz to include question details
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const enhancedAnswers = result.answers.map((answer: any) => {
      const question = quiz.questions.find(
        (q: any) => q._id.toString() === answer.questionId.toString()
      );

      return {
        questionId: answer.questionId,
        questionText: answer.questionText,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        score: answer.score,
        correctAnswer: question?.correct,
        questionType: question?.type,
        options: question?.options,
        marks: question?.marks,
      };
    });

    return NextResponse.json(
      {
        success: true,
        result: {
          id: result._id,
          // Match frontend expectation
          quizId: {
            _id: result.quizId._id,
            title: result.quizId.title,
            subject: result.quizId.subject,
            classLevel: result.quizId.classLevel,
            durationMinutes: result.quizId.durationMinutes,
          },
          studentId: {
            _id: result.studentId._id,
            name: result.studentId.name,
            regNumber: result.studentId.regNumber,
            classLevel: result.studentId.classLevel,
          },
          totalScore: result.totalScore,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          answers: enhancedAnswers,
          submittedAt: result.submittedAt,
          createdAt: result.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Fetch student quiz result error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz result" },
      { status: 500 }
    );
  }
}

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const quizId = searchParams.get("quizId");
//     const studentId = searchParams.get("studentId");

//     if (!quizId || !studentId) {
//       return NextResponse.json(
//         { error: "Quiz ID and Student ID are required" },
//         { status: 400 }
//       );
//     }

//     const redis = getRedisClient();
//     const cacheKey = `quizResult:${quizId}:${studentId}`;

//     // ✅ 1. Check Redis cache
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       // console.log("⚡ Serving quiz result from Redis");
//       return NextResponse.json(JSON.parse(cached), {
//         headers: {
//           "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
//         },
//       });
//     }

//     // ✅ 2. Next.js built-in cache (ISR-style)
//     const fetchResult = unstable_cache(
//       async () => {
//         await connectToDatabase();

//         // Verify the student exists
//         const studentExists = await Student.findById(studentId);
//         if (!studentExists) {
//           return { error: "Student not found", status: 404 };
//         }

//         const result = await StudentQuizResult.findOne({
//           quizId,
//           studentId,
//         })
//           .populate("studentId", "name regNumber classLevel")
//           .populate("quizId", "title subject classLevel durationMinutes")
//           .sort({ createdAt: -1 });

//         if (!result) {
//           return { error: "Quiz result not found", status: 404 };
//         }

//         // Get quiz to attach full question info
//         const quiz = await Quiz.findById(quizId);
//         if (!quiz) {
//           return { error: "Quiz not found", status: 404 };
//         }

//         // Merge answers with quiz question data
//         const enhancedAnswers = result.answers.map((answer: any) => {
//           const question = quiz.questions.find(
//             (q: any) => q._id.toString() === answer.questionId.toString()
//           );

//           return {
//             questionId: answer.questionId,
//             questionText: answer.questionText,
//             selectedAnswer: answer.selectedAnswer,
//             isCorrect: answer.isCorrect,
//             score: answer.score,
//             correctAnswer: question?.correct,
//             questionType: question?.type,
//             options: question?.options,
//             marks: question?.marks,
//           };
//         });

//         // Return student-safe structured data
//         const data = {
//           success: true,
//           result: {
//             id: result._id,
//             quizId: {
//               _id: result.quizId._id,
//               title: result.quizId.title,
//               subject: result.quizId.subject,
//               classLevel: result.quizId.classLevel,
//               durationMinutes: result.quizId.durationMinutes,
//             },
//             studentId: {
//               _id: result.studentId._id,
//               name: result.studentId.name,
//               regNumber: result.studentId.regNumber,
//               classLevel: result.studentId.classLevel,
//             },
//             totalScore: result.totalScore,
//             totalQuestions: result.totalQuestions,
//             percentage: result.percentage,
//             answers: enhancedAnswers,
//             submittedAt: result.submittedAt,
//             createdAt: result.createdAt,
//           },
//         };

//         return { data };
//       },
//       [cacheKey],
//       { revalidate: FIVE_MINUTES }
//     );

//     // ✅ 3. Fetch result (cached or fresh)
//     const resultData = await fetchResult();

//     if (resultData?.error) {
//       return NextResponse.json(
//         { error: resultData.error },
//         { status: resultData.status }
//       );
//     }

//     // ✅ 4. Save to Redis (expires in 5 min)
//     await redis.set(
//       cacheKey,
//       JSON.stringify(resultData.data),
//       "EX",
//       FIVE_MINUTES
//     );

//     return NextResponse.json(resultData.data, {
//       headers: {
//         "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
//       },
//     });
//   } catch (error) {
//     // console.error("❌ Fetch quiz result error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch quiz result" },
//       { status: 500 }
//     );
//   }
// }
