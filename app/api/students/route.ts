/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../libs/mongodb";
import Student from "../../models/Student";
import User from "../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { ActivityLogger } from "../../libs/activityLogger";

// export const revalidate = 300;
// export const dynamic = "force-static";

type CreateBody = {
  name: string;
  email?: string;
  classLevel?: string;
  gender?: string;
};

export async function POST(req: Request) {
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

    const actualSchoolId = userRole === "school_admin" ? id : schoolId;

    // ✅ STEP 1: Identify the school
    const school = await User.findById(actualSchoolId);
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // ✅ STEP 2: Check the school’s subscription
    const subscription = school.subscription;
    if (!subscription || subscription.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Your subscription is inactive or expired. Please renew your plan.",
        },
        { status: 403 }
      );
    }

    // ✅ STEP 3: Check if subscription is expired by date
    if (
      subscription.expiryDate &&
      new Date(subscription.expiryDate) < new Date()
    ) {
      school.subscription.status = "expired";
      await school.save();
      return NextResponse.json(
        { error: "Your subscription has expired. Please renew to continue." },
        { status: 403 }
      );
    }

    // ✅ STEP 4: (Optional) Check if attendance creation exceeds plan limit
    // Example: You could limit attendance per term if desired
    const studentCount = await Student.countDocuments({
      schoolId: actualSchoolId,
    });
    if (studentCount >= 5 && subscription.planName === "Basic") {
      return NextResponse.json(
        { error: "Basic plan limit reached for students creation." },
        { status: 403 }
      );
    }

    // read body from the incoming request
    const body = (await req.json()) as CreateBody;
    const { name, classLevel, gender, email } = body;

    // const actualSchoolId = userRole === "school_admin" ? id : schoolId;
    // if (!actualSchoolId) {
    //   return NextResponse.json(
    //     { error: "Missing school information" },
    //     { status: 400 }
    //   );
    // }

    // const school = await User.findById(actualSchoolId);
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }
    const regNumber = (Student as any).generateRegNumber
      ? await (Student as any).generateRegNumber(actualSchoolId, school.name)
      : `${school.name?.toUpperCase().replace(/\s+/g, "")}/000001`;

    const student = await Student.create({
      name,
      regNumber,
      classLevel,
      gender,
      email,
      schoolId: actualSchoolId,
      schoolUniqueId: school.schoolUniqueId,
      createdBy: id,
      userRole: "student",
    });

    await ActivityLogger.studentCreated(
      student.name,
      student.regNumber,
      student.classLevel,
      student.gender
    );

    return NextResponse.json(
      { message: "Student created successfully", student },
      { status: 201 }
    );
  } catch (err) {
    // console.error("Create student error:", err);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}

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

    // Determine actual school id
    const actualSchoolId = userRole === "school_admin" ? id : schoolId;
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: "Missing school information" },
        { status: 400 }
      );
    }

    // read query params
    const url = new URL(req.url);
    const classFilter = url.searchParams.get("classLevel") || undefined;

    // build filter (use const)
    const filter: any = { schoolId: actualSchoolId };
    if (classFilter) filter.classLevel = classFilter;

    // teachers only see students they created
    if (userRole === "teacher") {
      filter.createdBy = id;
    }

    const students = await Student.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ students });
  } catch (err) {
    console.error("Fetch students error:", err);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
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

//     const actualSchoolId = userRole === "school_admin" ? id : schoolId;
//     if (!actualSchoolId) {
//       return NextResponse.json(
//         { error: "Missing school information" },
//         { status: 400 }
//       );
//     }

//     const url = new URL(req.url);
//     const classFilter = url.searchParams.get("classLevel") || undefined;

//     const filter: any = { schoolId: actualSchoolId };
//     if (classFilter) filter.classLevel = classFilter;
//     if (userRole === "teacher") filter.createdBy = id;

//     // Unique cache key per school + role + class filter
//     const cacheKey = `students:${actualSchoolId}:${userRole}:${classFilter || "all"}`;

//     // Get Redis client
//     const redis = await getRedisClient();

//     // Check cache first
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       // console.log("🟢 Returning students from Redis cache");
//       return NextResponse.json(JSON.parse(cached));
//     }

//     // Use Next.js unstable_cache to wrap DB call
//     const fetchStudents = unstable_cache(
//       async () => {
//         const students = await Student.find(filter)
//           .sort({ createdAt: -1 })
//           .lean();
//         return students;
//       },
//       [cacheKey],
//       { revalidate: FIVE_MINUTES }
//     );

//     const students = await fetchStudents();

//     // Store in Redis for quick future access
//     await redis.set(cacheKey, JSON.stringify({ students }), "EX", FIVE_MINUTES);

//     return NextResponse.json({ students });
//   } catch (err) {
//     // console.error("❌ Fetch students error:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch students" },
//       { status: 500 }
//     );
//   }
// }
