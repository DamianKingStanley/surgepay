/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../libs/mongodb";
import Quiz from "../../models/Quiz";
import User from "../../models/User";

// export const revalidate = 300;
// export const dynamic = "force-static";

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
  schoolId?: string; // Make this optional since some quizzes don't have it
  schoolUniqueId?: string;
}

async function getSchoolInfoForQuiz(quiz: IQuiz): Promise<ISchoolInfo | null> {
  // Case 1: Quiz has direct schoolId
  if (quiz.schoolId) {
    const school = await User.findById(quiz.schoolId)
      .select("name logo address motto schoolUniqueId")
      .lean();
    return school as ISchoolInfo | null;
  }

  // Case 2: School admin quiz (createdBy is the school admin's user ID)
  if (quiz.createdByRole === "school_admin" && quiz.createdBy) {
    const school = await User.findById(quiz.createdBy)
      .select("name logo address motto schoolUniqueId")
      .lean();
    return school as ISchoolInfo | null;
  }

  // Case 3: Teacher quiz - get school from teacher's schoolId
  if (quiz.createdBy) {
    const teacher = await User.findById(quiz.createdBy)
      .select("schoolId")
      .lean();

    if (teacher && (teacher as any).schoolId) {
      const school = await User.findById((teacher as any).schoolId)
        .select("name logo address motto schoolUniqueId")
        .lean();
      return school as ISchoolInfo | null;
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("quizId");

    if (!id) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const quiz = (await Quiz.findById(id).lean()) as IQuiz | null;

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // ✅ Get school info using the helper function
    const school = await getSchoolInfoForQuiz(quiz);

    // ✅ Combine both quiz and school data
    const combinedData = {
      ...quiz,
      schoolInfo: school || null,
    };

    return NextResponse.json(combinedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// export async function GET(req: Request) {
//   try {
//     await connectToDatabase();

//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("quizId");

//     if (!id) {
//       return NextResponse.json(
//         { error: "Quiz ID is required" },
//         { status: 400 }
//       );
//     }

//     const quiz = (await Quiz.findById(id).lean()) as IQuiz | null;

//     if (!quiz) {
//       return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
//     }

//     const redis = await getRedisClient();
//     const cacheKey = `quiz:${id}`;

//     // ✅ First check Redis
//     const cachedQuiz = await redis.get(cacheKey);
//     if (cachedQuiz) {
//       // console.log("✅ Returning quiz from Redis cache");
//       return NextResponse.json(JSON.parse(cachedQuiz), { status: 200 });
//     }

//     // ✅ Use Next.js unstable_cache to wrap DB fetch
//     const fetchQuiz = unstable_cache(
//       async (id: string) => {
//         const quiz = (await Quiz.findById(id).lean()) as IQuiz | null;
//         if (!quiz) return null;
//         const school = await getSchoolInfoForQuiz(quiz);
//         return { ...quiz, schoolInfo: school || null };
//       },
//       [`quiz-${id}`],
//       { revalidate: FIVE_MINUTES }
//     );

//     const quizData = await fetchQuiz(id);

//     if (!quizData) {
//       return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
//     }

//     // ✅ Cache in Redis for 5 minutes too
//     await redis.set(cacheKey, JSON.stringify(quizData), "EX", FIVE_MINUTES);

//     return NextResponse.json(quizData, { status: 200 });
//   } catch (error) {
//     // console.error("Error fetching quiz:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch quiz" },
//       { status: 500 }
//     );
//   }
// }
