/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/jobs/[id]/applications/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../libs/authOptions";
import { connectToDatabase } from "../../../../libs/mongodb";
import Job from "../../../../models/Job";
import JobApplication from "../../../../models/JobApplication";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();

    const { id } = context.params;
    const job = await Job.findById(id);
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

    const apps = await JobApplication.find({ jobId: job._id })
      .populate({
        path: "jobId",
        select: "title", // only include title
      })
      .sort({ appliedAt: -1 })
      .lean();
    return NextResponse.json({ success: true, applications: apps });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
