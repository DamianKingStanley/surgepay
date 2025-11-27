/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/jobs/[id]/apply/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "../../../../libs/mongodb";
import Job from "../../../../models/Job";
import JobApplication from "../../../../models/JobApplication";
import { Resend } from "resend";
import User from "../../../../models/User";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(request: NextRequest, context: any) {
  try {
    const jobId = context.params.id;
    const body = (await request.json()) as {
      applicantName: string;
      email: string;
      phone?: string;
      education?: string;
      cvUrl?: string;
      coverLetter?: string;
    };

    if (!body.applicantName || !body.email) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 }
      );
    }

    // ✅ ADD THIS VALIDATION - CV is mandatory
    if (!body.cvUrl) {
      return NextResponse.json(
        { error: "CV is required to submit your application" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const job = await Job.findById(jobId);
    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // prevent applications after closing date
    if (job.closingDate && new Date(job.closingDate) < new Date()) {
      return NextResponse.json({ error: "Job is closed" }, { status: 400 });
    }

    const application = await JobApplication.create({
      jobId: job._id,
      schoolId: job.schoolId,
      applicantName: body.applicantName,
      email: body.email,
      phone: body.phone,
      education: body.education,
      cvUrl: body.cvUrl,
      coverLetter: body.coverLetter,
      status: "pending",
    });

    // Send notification email to school (creator)
    try {
      // ✅ Fetch the school user who created the job
      const school = await User.findById(job.schoolId);
      const schoolEmail = school?.email;
      await resend.emails.send({
        from: "Classika <no-reply@mail.cexbitward.com>",
        to: schoolEmail,
        subject: `New application for "${job.title}"`,
        html: `<p>A new application has been submitted by ${body.applicantName} for job <b>${job.title}</b>.</p>
               <p>Email: ${body.email}</p>
               <p>Phone: ${body.phone}</p>
               <p><a href="${process.env.NEXTAUTH_URL}/dashboard/jobs/${job._id}/applications">View application</a></p>`,
      });
    } catch (e) {
      console.warn("Failed to send school notification email", e);
    }

    // Send acknowledgement to applicant
    try {
      await resend.emails.send({
        from: "Classika <no-reply@mail.cexbitward.com>",
        to: body.email,
        subject: `Application received for ${job.title}`,
        html: `<p>Hi ${body.applicantName},</p>
               <p>Thanks for applying for <strong>${job.title}</strong> at ${job.location || "our school"}.</p>
               <p>We have received your application and will be in touch.</p>`,
      });
    } catch (e) {
      console.warn("Failed to send applicant email", e);
    }

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (err: any) {
    console.error("Apply error:", err);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
