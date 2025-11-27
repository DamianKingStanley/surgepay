/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/exam-questions/notes/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import LessonNote from "../../../models/LessonNote";
import { getRedisClient } from "../../../utils/redisClient";

// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectToDatabase();

//     const { userRole, id, schoolId } = session.user as {
//       userRole?: string;
//       id?: string;
//       schoolId?: string;
//     };

//     const actualSchoolId = userRole === "school_admin" ? id : schoolId;

//     const url = new URL(req.url);
//     const subject = url.searchParams.get("subject");
//     const classLevel = url.searchParams.get("classLevel");
//     const term = url.searchParams.get("term");

//     const filter: any = { schoolId: actualSchoolId };
//     if (userRole === "teacher") filter.teacherId = id;
//     if (subject) filter.subject = subject;
//     if (classLevel) filter.classLevel = classLevel;
//     if (term) filter.term = term;

//     const lessonNotes = await LessonNote.find(filter)
//       .select(
//         "_id topic subTopic subject classLevel term week lessonSummary createdAt"
//       )
//       .sort({ term: 1, week: 1, createdAt: -1 });

//     // Group by term and week for easier selection
//     const groupedNotes = lessonNotes.reduce((acc: any, note) => {
//       const termKey = `Term ${note.term}`;
//       if (!acc[termKey]) {
//         acc[termKey] = {};
//       }
//       if (!acc[termKey][`Week ${note.week}`]) {
//         acc[termKey][`Week ${note.week}`] = [];
//       }
//       acc[termKey][`Week ${note.week}`].push({
//         id: note._id,
//         topic: note.topic,
//         subTopic: note.subTopic,
//         subject: note.subject,
//         classLevel: note.classLevel,
//       });
//       return acc;
//     }, {});

//     return NextResponse.json({
//       lessonNotes,
//       groupedNotes,
//     });
//   } catch (error: any) {
//     console.error("Error fetching lesson notes for selection:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch lesson notes" },
//       { status: 500 }
//     );
//   }
// }

// export const revalidate = 300; // ✅ 5 minutes

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redis = getRedisClient();

    const { userRole, id, schoolId } = session.user as {
      userRole?: string;
      id?: string;
      schoolId?: string;
    };

    const actualSchoolId = userRole === "school_admin" ? id : schoolId;

    const url = new URL(req.url);
    const subject = url.searchParams.get("subject");
    const classLevel = url.searchParams.get("classLevel");
    const term = url.searchParams.get("term");

    // ✅ Build a unique cache key for each query combination
    const cacheKeyParts = [
      "lessonNotes",
      actualSchoolId,
      userRole === "teacher" ? id : "",
      subject || "all",
      classLevel || "all",
      term || "all",
    ];
    const cacheKey = cacheKeyParts.join(":");

    // ✅ 1. Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      // console.log("⚡ Serving lesson notes from Redis cache");
      return NextResponse.json(JSON.parse(cached), {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
        },
      });
    }

    // console.log("🧠 Fetching lesson notes from MongoDB...");
    await connectToDatabase();

    const filter: any = { schoolId: actualSchoolId };
    if (userRole === "teacher") filter.teacherId = id;
    if (subject) filter.subject = subject;
    if (classLevel) filter.classLevel = classLevel;
    if (term) filter.term = term;

    const lessonNotes = await LessonNote.find(filter)
      .select(
        "_id topic subTopic subject classLevel term week lessonSummary createdAt"
      )
      .sort({ term: 1, week: 1, createdAt: -1 });

    // ✅ Group notes by term and week
    const groupedNotes = lessonNotes.reduce((acc: any, note) => {
      const termKey = `Term ${note.term}`;
      if (!acc[termKey]) acc[termKey] = {};
      if (!acc[termKey][`Week ${note.week}`])
        acc[termKey][`Week ${note.week}`] = [];
      acc[termKey][`Week ${note.week}`].push({
        id: note._id,
        topic: note.topic,
        subTopic: note.subTopic,
        subject: note.subject,
        classLevel: note.classLevel,
      });
      return acc;
    }, {});

    const data = { lessonNotes, groupedNotes };

    // ✅ 2. Store in Redis (5 minutes)

    await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
    // ✅ 3. Add Next.js cache headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    // console.error("Error fetching lesson notes for selection:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson notes" },
      { status: 500 }
    );
  }
}
