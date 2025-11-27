/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { connectToDatabase } from "../../libs/mongodb";
import User from "../../models/User"; // still used for school admin
import Teacher from "../../models/Teacher"; // new teacher model
import { Resend } from "resend";
import { checkTeacherLimit } from "../../libs/limitChecker";
import { ActivityLogger } from "../../libs/activityLogger";

// export const revalidate = 300;
// export const dynamic = "force-static";

const resend = new Resend(process.env.RESEND_API_KEY);

// 🧩 CREATE TEACHER
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.userRole !== "school_admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

    // ✅ STEP 4: (Optional) Check if attendance creation exceeds plan limit
    // Example: You could limit attendance per term if desired
    const teachersCount = await Teacher.countDocuments({
      schoolId: actualSchoolId,
    });
    if (teachersCount >= 2 && subscription.planName === "Basic") {
      return NextResponse.json(
        { error: "Basic plan limit reached for teachers creation." },
        { status: 403 }
      );
    }

    const teacherLimitCheck = await checkTeacherLimit(actualSchoolId);
    if (!teacherLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: teacherLimitCheck.error,
          currentCount: teacherLimitCheck.currentCount,
          limit: teacherLimitCheck.limit,
        },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { name, email } = await req.json();

    if (!name || !email)
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );

    // ✅ Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher)
      return NextResponse.json(
        { error: "A teacher with this email already exists" },
        { status: 400 }
      );

    // ✅ Find school admin
    const schoolAdmin = await User.findById(session.user.id);
    if (!schoolAdmin)
      return NextResponse.json({ error: "School not found" }, { status: 404 });

    // ✅ Create new teacher
    const teacher = await Teacher.create({
      name,
      email,
      userRole: "teacher", // ✅ always teacher
      schoolId: schoolAdmin._id,
      schoolUniqueId: schoolAdmin.schoolUniqueId,
      createdBy: session.user.id,
      isVerified: false,
    });

    // ✅ Send Welcome Email
    const signinLink = `${process.env.NEXTAUTH_URL}/auth/teacher-signin`;
    const emailHtml = `
      <div style="font-family:Arial, sans-serif;line-height:1.6">
        <h2>Welcome to ${schoolAdmin.name}!</h2>
        <p>Dear ${name},</p>
        <p>You’ve been added as a <strong>Teacher</strong> under <b>${schoolAdmin.name}</b>.</p>
        <p>Your <strong>School ID</strong> is: <b>${schoolAdmin.schoolUniqueId}</b></p>
        <p>You can log in using your email and School ID here:</p>
        <a href="${signinLink}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;">Go to Sign In</a>
        <p>If you didn’t expect this, please contact your school admin.</p>
        <br/>
        <p>– The ${schoolAdmin.name} Team</p>
      </div>
    `;

    await resend.emails.send({
      from: "Classika <no-reply@mail.cexbitward.com>",
      to: email,
      subject: `Welcome to ${schoolAdmin.name}!`,
      html: emailHtml,
    });

    await ActivityLogger.teacherCreated(
      teacher.name,
      teacher.regNumber,
      teacher.subjects
    );

    return NextResponse.json(
      { message: "Teacher created successfully", teacher },
      { status: 201 }
    );
  } catch (error) {
    // console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}

// 🧩 FETCH ALL TEACHERS UNDER A SCHOOL
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.userRole !== "school_admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const teachers = await Teacher.find({
      schoolId: session.user.id,
    }).select("-__v");

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

// 🧩 UPDATE TEACHER
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.userRole !== "school_admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const { teacherId, name, email, subjects, assignedClasses } =
      await req.json();

    if (!teacherId)
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );

    const teacher = await Teacher.findOneAndUpdate(
      { _id: teacherId, schoolId: session.user.id },
      { name, email, subjects, assignedClasses },
      { new: true }
    ).select("-__v");

    if (!teacher)
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    await ActivityLogger.teacherUpdated(teacherId, teacher.name, teacher.email);

    return NextResponse.json({
      message: "Teacher updated successfully",
      teacher,
    });
  } catch (error) {
    // console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

// 🧩 DELETE TEACHER
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.userRole !== "school_admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const { teacherId } = await req.json();

    if (!teacherId)
      return NextResponse.json(
        { error: "Teacher ID required" },
        { status: 400 }
      );

    const deleted = await Teacher.findOneAndDelete({
      _id: teacherId,
      schoolId: session.user.id,
    });

    if (!deleted)
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    await ActivityLogger.teacherDeleted(deleted.name);

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    // console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   try {
//     // ✅ Session validation
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     if (session.user.userRole !== "school_admin") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     await connectToDatabase();

//     const schoolId = session.user.id;
//     const cacheKey = `teachers:${schoolId}`;

//     // ✅ Initialize Redis
//     const redis = await getRedisClient();

//     // 🔍 Check cache first
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       // console.log("🟢 Returning teachers from Redis cache");
//       return NextResponse.json(JSON.parse(cached));
//     }

//     // ⚙️ Wrap DB call in unstable_cache
//     const fetchTeachers = unstable_cache(
//       async () => {
//         const teachers = await Teacher.find({ schoolId })
//           .select("-__v")
//           .sort({ createdAt: -1 })
//           .lean();
//         return teachers;
//       },
//       [cacheKey],
//       { revalidate: FIVE_MINUTES }
//     );

//     const teachers = await fetchTeachers();

//     // 💾 Save in Redis for faster subsequent access
//     await redis.set(cacheKey, JSON.stringify(teachers), "EX", FIVE_MINUTES);

//     return NextResponse.json(teachers);
//   } catch (error) {
//     // console.error("❌ Error fetching teachers:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch teachers" },
//       { status: 500 }
//     );
//   }
// }
