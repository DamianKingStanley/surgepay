/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/timetables/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { connectToDatabase } from "../../libs/mongodb";
import Timetable from "../../models/Timetable";
import Teacher from "../../models/Teacher";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userRole, id, schoolId } = session.user as {
      userRole?: string;
      id?: string;
      schoolId?: string;
    };

    // ✅ Determine actual schoolId (school_admin uses its own id)
    const actualSchoolId = userRole === "school_admin" ? id : schoolId;
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: "Missing school information" },
        { status: 400 }
      );
    }

    // ✅ Read query parameters
    const url = new URL(req.url);
    const classLevel = url.searchParams.get("classLevel");
    const term = url.searchParams.get("term");

    // ✅ Build filter
    const filter: any = { schoolId: actualSchoolId };

    if (userRole === "teacher") {
      // Teachers only see timetables for their assigned classes
      const teacherClasses = await getTeacherClasses(id!, actualSchoolId);
      if (teacherClasses.length === 0) {
        return NextResponse.json([]); // no assigned classes
      }
      filter.classLevel = { $in: teacherClasses };
    } else if (classLevel && classLevel !== "all") {
      filter.classLevel = classLevel;
    }

    if (term && term !== "all") {
      filter.term = term;
    }

    const timetables = await Timetable.find(filter)
      .sort({ classLevel: 1, term: 1 })
      .populate("teacherId", "name email");

    return NextResponse.json(timetables);
  } catch (error: any) {
    console.error("Error fetching timetables:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetables" },
      { status: 500 }
    );
  }
}

// ✅ Helper function to get teacher's assigned classes

// export async function GET(req: Request) {
//   try {
//     await connectToDatabase();

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { userRole, id, schoolId } = session.user as {
//       userRole?: string;
//       id?: string;
//       schoolId?: string;
//     };

//     // ✅ Determine actual school ID
//     const actualSchoolId = userRole === "school_admin" ? id : schoolId;
//     if (!actualSchoolId) {
//       return NextResponse.json(
//         { error: "Missing school information" },
//         { status: 400 }
//       );
//     }

//     // ✅ Extract query params
//     const url = new URL(req.url);
//     const classLevel = url.searchParams.get("classLevel");
//     const term = url.searchParams.get("term");

//     // ✅ Build MongoDB filter
//     const filter: any = { schoolId: actualSchoolId };

//     if (userRole === "teacher") {
//       const teacherClasses = await getTeacherClasses(id!, actualSchoolId);
//       if (teacherClasses.length === 0) {
//         return NextResponse.json([]); // no assigned classes
//       }
//       filter.classLevel = { $in: teacherClasses };
//     } else if (classLevel && classLevel !== "all") {
//       filter.classLevel = classLevel;
//     }

//     if (term && term !== "all") {
//       filter.term = term;
//     }

//     // ✅ Build cache key
//     const cacheKey = `timetables:${actualSchoolId}:${userRole}:${classLevel || "all"}:${term || "all"}`;

//     // ✅ Initialize Redis
//     const redis = await getRedisClient();

//     // 🔍 Try Redis cache first
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return NextResponse.json(JSON.parse(cached));
//     }

//     // ⚙️ Use unstable_cache for Next.js edge-level revalidation
//     const fetchTimetables = unstable_cache(
//       async () => {
//         const timetables = await Timetable.find(filter)
//           .sort({ classLevel: 1, term: 1 })
//           .populate("teacherId", "name email")
//           .lean();
//         return timetables;
//       },
//       [cacheKey],
//       { revalidate: FIVE_MINUTES }
//     );

//     const timetables = await fetchTimetables();

//     // 💾 Store in Redis for fast access
//     await redis.set(cacheKey, JSON.stringify(timetables), "EX", FIVE_MINUTES);

//     return NextResponse.json(timetables);
//   } catch (error: any) {
//     // console.error("❌ Error fetching timetables:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch timetables" },
//       { status: 500 }
//     );
//   }
// }

async function getTeacherClasses(
  teacherId: string,
  schoolId: string
): Promise<string[]> {
  try {
    const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
    return teacher?.assignedClasses || [];
  } catch (error) {
    return [];
  }
}

// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../libs/authOptions";
// import { connectToDatabase } from "../../libs/mongodb";
// import Timetable from "../../models/Timetable";
// import Teacher from "../../models/Teacher";

// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectToDatabase();

//     const { searchParams } = new URL(req.url);
//     const classLevel = searchParams.get("classLevel");
//     const term = searchParams.get("term");

//     const schoolId = session.user.schoolId ?? ""; // ✅ ensure always string
//     const userRole = session.user.userRole ?? "";
//     const teacherId = session.user.id ?? "";

//     const filter: any = { schoolId };

//     // ✅ Teachers only see their assigned classes
//     if (userRole === "teacher") {
//       const teacherClasses = await getTeacherClasses(teacherId, schoolId);
//       if (teacherClasses.length === 0) {
//         return NextResponse.json([]); // Return empty if no classes assigned
//       }
//       filter.classLevel = { $in: teacherClasses };
//     } else if (classLevel && classLevel !== "all") {
//       filter.classLevel = classLevel;
//     }

//     if (term && term !== "all") {
//       filter.term = term;
//     }

//     const timetables = await Timetable.find(filter)
//       .sort({ classLevel: 1, term: 1 })
//       .populate("teacherId", "name email");

//     return NextResponse.json(timetables);
//   } catch (error: any) {
//     console.error("Error fetching timetables:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch timetables" },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * ✅ Safely fetch teacher assigned classes
//  */
// async function getTeacherClasses(
//   teacherId: string,
//   schoolId: string
// ): Promise<string[]> {
//   try {
//     if (!teacherId || !schoolId) return [];
//     const teacher = await Teacher.findOne({
//       _id: teacherId,
//       schoolId: schoolId,
//     });
//     return teacher?.assignedClasses || [];
//   } catch (error) {
//     console.error("Error fetching teacher classes:", error);
//     return [];
//   }
// }
