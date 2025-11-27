/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { connectToDatabase } from "../../libs/mongodb";
import Job from "../../models/Job";
import JobApplication from "../../models/JobApplication";
import User from "../../models/User";
import { checkJobLimit } from "../../libs/limitChecker";
// export const revalidate = 300;
// export const dynamic = "force-static";

type CreateBody = {
  title: string;
  description: string;
  requirements?: string[];
  location?: string;
  employmentType?: string;
  salaryRange?: string;
  closingDate?: string;
  isActive?: boolean;
};

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const mine = url.searchParams.get("mine"); // if present, return school jobs for session user
    const schoolIdParam = url.searchParams.get("schoolId"); // optionally filter by schoolId (public)
    const q = url.searchParams.get("q") || undefined;

    // Base filter
    const filter: any = {};

    // Public listing: only active, not passed closingDate
    if (!mine) {
      filter.isActive = true;
    }

    if (schoolIdParam) filter.schoolId = schoolIdParam;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Fetch session if mine requested
    if (mine === "1") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const schoolId =
        session.user.userRole === "school_admin"
          ? session.user.id
          : session.user.schoolId;
      filter.schoolId = schoolId;
      // For school dashboard, show all jobs (active and inactive)
      delete filter.isActive;
    }

    // Get jobs with application counts
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

    // Get application counts for each job
    const jobsWithApplications = await Promise.all(
      jobs.map(async (job: any) => {
        const applicationCount = await JobApplication.countDocuments({
          jobId: job._id,
        });

        // For public listings, filter out expired jobs
        if (
          !mine &&
          job.closingDate &&
          new Date(job.closingDate) < new Date()
        ) {
          return null;
        }

        return {
          ...job,
          applicationsCount: applicationCount,
        };
      })
    );

    // Filter out null values (expired jobs for public)
    const validJobs = jobsWithApplications.filter((job) => job !== null);

    return NextResponse.json({ success: true, jobs: validJobs });
  } catch (err: any) {
    console.error("Fetch jobs error:", err);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// const FIVE_MINUTES = 300; // seconds

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const mine = url.searchParams.get("mine");
//     const schoolIdParam = url.searchParams.get("schoolId");
//     const q = url.searchParams.get("q") || undefined;

//     const session = mine === "1" ? await getServerSession(authOptions) : null;

//     // 🔑 Create a unique cache key for Redis and Next.js cache
//     const userKey =
//       mine === "1"
//         ? `mine:${session?.user?.id || "none"}`
//         : `public:${schoolIdParam || "all"}:${q || "none"}`;
//     const cacheKey = `jobs:${userKey}`;

//     // 🧠 Try Redis first
//     const redis = getRedisClient();
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return NextResponse.json(JSON.parse(cached));
//     }

//     // 🧩 Define the main fetch logic (wrapped in Next.js cache)
//     const fetchJobs = unstable_cache(
//       async () => {
//         await connectToDatabase();

//         const filter: any = {};

//         // Public: only active jobs
//         if (!mine) {
//           filter.isActive = true;
//         }

//         if (schoolIdParam) filter.schoolId = schoolIdParam;

//         if (q) {
//           filter.$or = [
//             { title: { $regex: q, $options: "i" } },
//             { description: { $regex: q, $options: "i" } },
//           ];
//         }

//         // If “mine” requested, show all jobs for the logged-in school admin/teacher
//         if (mine === "1") {
//           if (!session?.user?.id) {
//             throw new Error("Unauthorized");
//           }
//           const schoolId =
//             session.user.userRole === "school_admin"
//               ? session.user.id
//               : session.user.schoolId;

//           filter.schoolId = schoolId;
//           delete filter.isActive; // show all (active + inactive)
//         }

//         const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

//         // Get application counts
//         const jobsWithApplications = await Promise.all(
//           jobs.map(async (job: any) => {
//             const applicationCount = await JobApplication.countDocuments({
//               jobId: job._id,
//             });

//             // Public: remove expired jobs
//             if (
//               !mine &&
//               job.closingDate &&
//               new Date(job.closingDate) < new Date()
//             ) {
//               return null;
//             }

//             return {
//               ...job,
//               applicationsCount: applicationCount,
//             };
//           })
//         );

//         const validJobs = jobsWithApplications.filter((job) => job !== null);
//         return { success: true, jobs: validJobs };
//       },
//       [cacheKey], // cache key for Next.js
//       { revalidate: FIVE_MINUTES }
//     );

//     // ⚙️ Get data (cached automatically by Next.js)
//     const data = await fetchJobs();

//     // 💾 Save to Redis (5-minute TTL)
//     await redis.set(cacheKey, JSON.stringify(data), "EX", FIVE_MINUTES);

//     return NextResponse.json(data);
//   } catch (err: any) {
//     // console.error("Fetch jobs error:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch jobs" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only school (school_admin) can create job posts
    if (session.user.userRole !== "school_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { userRole, id, schoolId } = session.user as {
      userRole?: string;
      id?: string;
      schoolId?: string;
    };

    const actualSchoolId = userRole === "school_admin" ? id : schoolId;
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: "School ID not found" },
        { status: 400 }
      );
    }

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

    const jobCount = await Job.countDocuments({
      schoolId: actualSchoolId,
    });
    if (jobCount >= 2 && subscription.planName === "Basic") {
      return NextResponse.json(
        { error: "Basic plan limit reached for job creation." },
        { status: 403 }
      );
    }
    const jobLimitCheck = await checkJobLimit(actualSchoolId);
    if (!jobLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: jobLimitCheck.error,
          currentCount: jobLimitCheck.currentCount,
          limit: jobLimitCheck.limit,
        },
        { status: 403 }
      );
    }

    const body = (await req.json()) as CreateBody;
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const job = await Job.create({
      schoolId: session.user.id, // the school acts as user
      createdBy: session.user.id,
      title: body.title,
      description: body.description,
      requirements: body.requirements || [],
      location: body.location,
      employmentType: body.employmentType,
      salaryRange: body.salaryRange,
      closingDate: body.closingDate ? new Date(body.closingDate) : undefined,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (err: any) {
    // console.error("Create job error:", err);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
