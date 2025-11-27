/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../libs/mongodb";
import Quiz from "../../models/Quiz";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // ✅ Only fetch quiz if it's published and ongoing
    const quiz = await Quiz.findOne({
      _id: quizId,
      status: "published",
      quiz_status: "ongoing",
    });

    if (!quiz) {
      return NextResponse.json(
        {
          error: "Quiz not available.",
        },
        { status: 404 }
      );
    }

    // ✅ Return only student-safe quiz data
    return NextResponse.json(
      {
        success: true,
        quiz: {
          id: quiz._id,
          title: quiz.title,
          subject: quiz.subject,
          classLevel: quiz.classLevel,
          durationMinutes: quiz.durationMinutes,
          quiz_status: quiz.quiz_status,
          status: quiz.status,
          questions: quiz.questions.map(
            (q: {
              _id: any;
              text: any;
              type: any;
              options: any;
              marks: any;
            }) => ({
              _id: q._id,
              text: q.text,
              type: q.type,
              options: q.options,
              marks: q.marks,
            })
          ),
          createdAt: quiz.createdAt,
          quizUrl: quiz.quizUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Fetch quiz error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// const FIVE_MINUTES = 300;
interface QuizQuestion {
  _id: string;
  text: string;
  type: string;
  options: string[];
  marks: number;
}

interface SafeQuiz {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  durationMinutes: number;
  quiz_status: string;
  status: string;
  questions: QuizQuestion[];
  createdAt: Date;
  quizUrl?: string;
}

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const quizId = searchParams.get("quizId");

//     if (!quizId) {
//       return NextResponse.json(
//         { error: "Quiz ID is required" },
//         { status: 400 }
//       );
//     }

//     const redis = getRedisClient();
//     const cacheKey = `quiz:${quizId}`;

//     // ✅ 1. Try Redis cache
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return NextResponse.json(JSON.parse(cached));
//     }

//     // ✅ 2. Use Next.js unstable_cache (5 minutes)
//     const fetchQuiz = unstable_cache(
//       async (): Promise<{ success: boolean; quiz: SafeQuiz } | null> => {
//         await connectToDatabase();

//         const quizDoc = await Quiz.findOne({
//           _id: quizId,
//           status: "published",
//           quiz_status: "ongoing",
//         }).lean();

//         if (!quizDoc) return null;

//         // Type narrowing for Mongoose lean result
//         const quiz = quizDoc as any;

//         const safeQuiz: SafeQuiz = {
//           id: quiz._id.toString(),
//           title: quiz.title,
//           subject: quiz.subject,
//           classLevel: quiz.classLevel,
//           durationMinutes: quiz.durationMinutes,
//           quiz_status: quiz.quiz_status,
//           status: quiz.status,
//           questions: (quiz.questions || []).map((q: any) => ({
//             _id: q._id?.toString(),
//             text: q.text,
//             type: q.type,
//             options: q.options,
//             marks: q.marks,
//           })),
//           createdAt: quiz.createdAt,
//           quizUrl: quiz.quizUrl,
//         };

//         return { success: true, quiz: safeQuiz };
//       },
//       [cacheKey],
//       { revalidate: FIVE_MINUTES }
//     );

//     // ✅ 3. Fetch quiz (from cache or DB)
//     const data = await fetchQuiz();

//     if (!data) {
//       return NextResponse.json(
//         { error: "Quiz not available" },
//         { status: 404 }
//       );
//     }

//     // ✅ 4. Save to Redis (expires in 5 mins)
//     await redis.set(cacheKey, JSON.stringify(data), "EX", FIVE_MINUTES);

//     return NextResponse.json(data);
//   } catch (error) {
//     // console.error("❌ Fetch quiz error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch quiz" },
//       { status: 500 }
//     );
//   }
// }
