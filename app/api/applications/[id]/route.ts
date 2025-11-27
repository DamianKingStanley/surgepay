/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/applications/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import JobApplication from "../../../models/JobApplication";
import Job from "../../../models/Job";
import { Resend } from "resend";
import { ActivityLogger } from "../../../libs/activityLogger";
import { getRedisClient } from "../../../utils/redisClient";

const resend = new Resend(process.env.RESEND_API_KEY || "");
// export const revalidate = 300;
// export const dynamic = "force-static";

// export async function PUT(req: Request, context: { params: { id: string } }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     await connectToDatabase();

//     const { id } = context.params; // application id
//     const body = await req.json(); // { status: 'accepted'|'rejected'|'interview', message?: string }

//     const application = await JobApplication.findById(id);
//     if (!application)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     const job = await Job.findById(application.jobId);
//     if (!job)
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });

//     const actualSchoolId =
//       session.user.userRole === "school_admin"
//         ? session.user.id
//         : session.user.schoolId;
//     if (
//       !actualSchoolId ||
//       job.schoolId.toString() !== actualSchoolId.toString()
//     ) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     if (
//       body.status &&
//       ["pending", "rejected", "accepted", "interview"].includes(body.status)
//     ) {
//       application.status = body.status;
//     }
//     // ✅ Log the activity
//     await ActivityLogger.jobApplicationUpdated(
//       application._id.toString(),
//       session.user.id,
//       "UPDATE_STATUS",
//       { status: application.status }
//     );

//     await application.save();

//     // notify applicant by email
//     try {
//       const html = `<p>Hi ${application.applicantName},</p>
//         <p>Your application for <strong>${job.title}</strong> has been updated: <strong>${application.status}</strong>.</p>
//         ${body.message ? `<p>${body.message}</p>` : ""}
//       `;
//       await resend.emails.send({
//         from: "Classika <no-reply@mail.cexbitward.com>",
//         to: application.email,
//         subject: `Update on your application for ${job.title}`,
//         html,
//       });
//     } catch (e) {
//       // console.warn("Failed sending status email", e);
//     }

//     return NextResponse.json({ success: true, application });
//   } catch (err: any) {
//     // console.error(err);
//     return NextResponse.json({ error: "Failed" }, { status: 500 });
//   }
// }

export async function PUT(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const params = await context.params;

    const { id } = params;
    const body = await request.json();

    const application = await JobApplication.findById(id);
    if (!application)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const job = await Job.findById(application.jobId);
    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const actualSchoolId =
      session.user.userRole === "school_admin"
        ? session.user.id
        : session.user.schoolId;

    if (
      !actualSchoolId ||
      job.schoolId.toString() !== actualSchoolId.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      body.status &&
      ["pending", "rejected", "accepted", "interview"].includes(body.status)
    ) {
      application.status = body.status;
    }

    await ActivityLogger.jobApplicationUpdated(
      application._id.toString(),
      session.user.id,
      "UPDATE_STATUS",
      { status: application.status }
    );

    await application.save();

    try {
      const html = `<p>Hi ${application.applicantName},</p>
        <p>Your application for <strong>${job.title}</strong> has been updated: <strong>${application.status}</strong>.</p>
        ${body.message ? `<p>${body.message}</p>` : ""}
      `;
      await resend.emails.send({
        from: "Classika <no-reply@mail.cexbitward.com>",
        to: application.email,
        subject: `Update on your application for ${job.title}`,
        html,
      });
    } catch (e) {
      // console.warn("Failed sending status email", e);
    }

    return NextResponse.json({ success: true, application });
  } catch (err) {
    // console.error("❌ PUT error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // await connectToDatabase();

    const { userRole, id: userId, schoolId } = session.user;
    const actualSchoolId = userRole === "school_admin" ? userId : schoolId;

    if (!actualSchoolId) {
      return NextResponse.json(
        { error: "Missing school information" },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    const cacheKey = `applications:${actualSchoolId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    await connectToDatabase();

    // Get all applications for the school
    const applications = await JobApplication.find({ schoolId: actualSchoolId })
      .populate({
        path: "jobId",
        select: "title schoolId",
        model: Job,
      })
      .sort({ appliedAt: -1 })
      .lean();
    const data = { success: true, applications };

    // ✅ 3. Store in Redis (persistent cache)
    await redis.set(cacheKey, JSON.stringify(data), "EX", 300); // 5 mins TTL

    // ✅ 4. Next.js cache headers for edge/CDN layer
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=120" },
    });
  } catch (error: any) {
    // console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = context.params; // application id
    const application = await JobApplication.findById(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the school owns this application
    const job = await Job.findById(application.jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const actualSchoolId =
      session.user.userRole === "school_admin"
        ? session.user.id
        : session.user.schoolId;

    if (
      !actualSchoolId ||
      job.schoolId.toString() !== actualSchoolId.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the application
    await JobApplication.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error: any) {
    // console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
