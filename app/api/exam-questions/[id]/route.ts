/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/exam-questions/[id]/route.ts
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../libs/authOptions";
// import { connectToDatabase } from "../../../libs/mongodb";
// import ExamQuestion from "../../../models/ExamQuestion";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectToDatabase();

//     const { id } = params;
//     const exam = await ExamQuestion.findById(id).populate("sourceLessonNotes");

//     if (!exam) {
//       return NextResponse.json({ error: "Exam not found" }, { status: 404 });
//     }

//     return NextResponse.json(exam);
//   } catch (error: any) {
//     console.error("Error fetching exam:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch exam" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import ExamQuestion from "../../../models/ExamQuestion";
import { getRedisClient } from "../../../utils/redisClient";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redis = getRedisClient();
    const params = await context.params;

    const { id } = params;
    const cacheKey = `exam:${id}`;

    // ✅ 1. Try Redis cache first
    const cachedExam = await redis.get(cacheKey);
    if (cachedExam) {
      // console.log("⚡ Serving exam from Redis cache");
      return NextResponse.json(JSON.parse(cachedExam), {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
        },
      });
    }

    // console.log("🧠 Fetching exam from MongoDB...");
    await connectToDatabase();

    // ✅ 2. Fetch from DB if not in Redis
    const exam = await ExamQuestion.findById(id).populate("sourceLessonNotes");

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const data = JSON.parse(JSON.stringify(exam));

    // ✅ 3. Store in Redis with 5-minute TTL
    await redis.set(cacheKey, JSON.stringify(data), "EX", 300);

    // ✅ 4. Add Next.js cache headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    // console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}
