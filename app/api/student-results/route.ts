/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { connectToDatabase } from "../../libs/mongodb";
import StudentQuizResult from "../../models/StudentQuizResult";
import Quiz from "../../models/Quiz";
import Student from "../../models/Student";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const { userRole, id, schoolId, assignedClasses } = session.user;
    let actualSchoolId = schoolId;

    if (userRole === "school_admin") {
      // For admins, their own ID represents the school
      actualSchoolId = id;
    }

    let results;

    if (userRole === "school_admin") {
      // ✅ Admin: See all results from their school
      results = await StudentQuizResult.find({ schoolId: actualSchoolId })
        .populate({
          path: "studentId",
          model: Student,
          select: "fullname email regNumber classLevel gender",
        })
        .populate({
          path: "quizId",
          model: Quiz,
          select:
            "title subject classLevel durationMinutes createdBy createdByRole",
        })
        .sort({ submittedAt: -1 })
        .lean();
    } else if (userRole === "teacher") {
      // ✅ Teacher: See results from ALL quizzes for their assigned classes
      // Get ALL results from the school first
      const allSchoolResults = await StudentQuizResult.find({
        schoolId: actualSchoolId,
      })
        .populate({
          path: "studentId",
          model: Student,
          select: "fullname email regNumber classLevel gender",
        })
        .populate({
          path: "quizId",
          model: Quiz,
          select:
            "title subject classLevel durationMinutes createdBy createdByRole",
        })
        .sort({ submittedAt: -1 })
        .lean();

      // Filter results to only show those from the teacher's assigned classes
      results = allSchoolResults.filter((result) =>
        assignedClasses?.includes(result.classLevel)
      );
    } else {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Error fetching student quiz results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Result ID required" },
        { status: 400 }
      );
    }

    const result = await StudentQuizResult.findById(id);

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Check permissions
    const { userRole, id: userId, schoolId, assignedClasses } = session.user;

    if (userRole === "school_admin") {
      // Admin can only delete results from their school
      if (result.schoolId.toString() !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (userRole === "teacher") {
      // Teacher can delete results from any quiz for their assigned classes
      const isResultForTeacherClass = assignedClasses?.includes(
        result.classLevel
      );
      if (!isResultForTeacherClass) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    await StudentQuizResult.findByIdAndDelete(id);

    return NextResponse.json({ message: "Result deleted successfully" });
  } catch (error) {
    // console.error("❌ Error deleting quiz result:", error);
    return NextResponse.json(
      { error: "Failed to delete result" },
      { status: 500 }
    );
  }
}
// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { userRole, id, schoolId, assignedClasses } = session.user;
//     const actualSchoolId = userRole === "school_admin" ? id : schoolId;

//     const redis = await getRedisClient();
//     const cacheKey = `quizResults:${userRole}:${id}`;

//     // ✅ Check Redis first
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       // console.log("✅ Returning student quiz results from Redis cache");
//       return NextResponse.json(JSON.parse(cached));
//     }

//     // ✅ Wrap main DB logic in unstable_cache
//     const fetchResults = unstable_cache(
//       async () => {
//         await connectToDatabase();

//         let results: any[] = [];

//         if (userRole === "school_admin") {
//           // ✅ Admin: See all results from their school
//           results = await StudentQuizResult.find({ schoolId: actualSchoolId })
//             .populate({
//               path: "studentId",
//               model: Student,
//               select: "fullname email regNumber classLevel gender",
//             })
//             .populate({
//               path: "quizId",
//               model: Quiz,
//               select:
//                 "title subject classLevel durationMinutes createdBy createdByRole",
//             })
//             .sort({ submittedAt: -1 })
//             .lean();
//         } else if (userRole === "teacher") {
//           // ✅ Teacher: See results from all quizzes for their assigned classes
//           const allSchoolResults = await StudentQuizResult.find({
//             schoolId: actualSchoolId,
//           })
//             .populate({
//               path: "studentId",
//               model: Student,
//               select: "fullname email regNumber classLevel gender",
//             })
//             .populate({
//               path: "quizId",
//               model: Quiz,
//               select:
//                 "title subject classLevel durationMinutes createdBy createdByRole",
//             })
//             .sort({ submittedAt: -1 })
//             .lean();

//           results = allSchoolResults.filter((result) =>
//             assignedClasses?.includes(result.classLevel)
//           );
//         } else {
//           return { error: "Unauthorized role" };
//         }

//         return results;
//       },
//       [`results-cache-${userRole}-${id}`],
//       { revalidate: FIVE_MINUTES }
//     );

//     const results = await fetchResults();

//     // ✅ Cache in Redis for 5 minutes
//     await redis.set(cacheKey, JSON.stringify(results), "EX", FIVE_MINUTES);

//     return NextResponse.json(results);
//   } catch (error) {
//     // console.error("❌ Error fetching student quiz results:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch results" },
//       { status: 500 }
//     );
//   }
// }
