/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/jobs/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import Job from "../../../models/Job";

// export const revalidate = 300;
// export const dynamic = "force-static";

type UpdateBody = Partial<{
  title: string;
  description: string;
  requirements: string[];
  location: string;
  employmentType: string;
  salaryRange: string;
  closingDate: string | null;
  isActive: boolean;
}>;

export async function GET(request: NextRequest, context: any) {
  try {
    await connectToDatabase();

    const { id } = context.params;
    const job = await Job.findById(id).lean();
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ job });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();

    const { id } = context.params;
    const body = (await request.json()) as UpdateBody;

    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only school that created the job can edit (school_admin)
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

    if (body.title !== undefined) job.title = body.title;
    if (body.description !== undefined) job.description = body.description;
    if (body.requirements !== undefined) job.requirements = body.requirements;
    if (body.location !== undefined) job.location = body.location;
    if (body.employmentType !== undefined)
      job.employmentType = body.employmentType;
    if (body.salaryRange !== undefined) job.salaryRange = body.salaryRange;
    if (body.closingDate !== undefined)
      job.closingDate = body.closingDate
        ? new Date(body.closingDate)
        : undefined;
    if (body.isActive !== undefined) job.isActive = body.isActive;

    await job.save();
    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();

    const { id } = context.params;
    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

    await job.deleteOne();
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
