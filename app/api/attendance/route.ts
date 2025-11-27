/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextResponse } from "next/server";
// import Attendance from "../../models/Attendance";
// import { connectToDatabase } from "../../libs/mongodb";
// import Student from "../../models/Student";

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();
//     const { schoolId, teacherId, classLevel, term, weekNumber } =
//       await req.json();

//     // Fetch students of that class level
//     const students = await Student.find({ schoolId, classLevel });
//     if (!students.length)
//       return NextResponse.json(
//         { message: "No students found for this class." },
//         { status: 404 }
//       );

//     // Prevent duplicate week attendance
//     const existing = await Attendance.findOne({
//       schoolId,
//       classLevel,
//       term,
//       weekNumber,
//     });
//     if (existing)
//       return NextResponse.json(
//         { message: "Attendance for this week already exists." },
//         { status: 400 }
//       );

//     // Prepare attendance records
//     const records = students.map((s) => ({
//       studentId: s._id,
//       days: {
//         Monday: "A",
//         Tuesday: "A",
//         Wednesday: "A",
//         Thursday: "A",
//         Friday: "A",
//       },
//       totalPresent: 0,
//     }));

//     const attendance = await Attendance.create({
//       schoolId,
//       teacherId,
//       classLevel,
//       term,
//       weekNumber,
//       records,
//     });

//     return NextResponse.json(attendance, { status: 201 });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// app/api/attendance/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { connectToDatabase } from "../../libs/mongodb";
import Attendance from "../../models/Attendance";
import Student from "../../models/Student";
import User from "../../models/User";
import { checkAttendanceLimit } from "../../libs/limitChecker";
import { ActivityLogger } from "../../libs/activityLogger";

export async function POST(req: Request) {
  try {
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
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: "School ID not found" },
        { status: 400 }
      );
    }
    await connectToDatabase();

    if (req.method === "POST") {
      // Handle attendance creation
      const { schoolId, teacherId, classLevel, term, weekNumber } =
        await req.json();

      // ✅ STEP 1: Identify the school
      const school = await User.findById(actualSchoolId);
      if (!school) {
        return NextResponse.json(
          { error: "School not found" },
          { status: 404 }
        );
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
      const attendanceCount = await Attendance.countDocuments({
        schoolId,
        term,
      });
      if (attendanceCount >= 2 && subscription.planName === "Basic") {
        return NextResponse.json(
          { error: "Basic plan limit reached for attendance creation." },
          { status: 403 }
        );
      }

      // ✅ STEP 2: Check job limit
      const attendanceLimitCheck = await checkAttendanceLimit(actualSchoolId);
      if (!attendanceLimitCheck.allowed) {
        return NextResponse.json(
          {
            error: attendanceLimitCheck.error,
            currentCount: attendanceLimitCheck.currentCount,
            limit: attendanceLimitCheck.limit,
          },
          { status: 403 }
        );
      }

      // Fetch students of that class level
      const students = await Student.find({ schoolId, classLevel });
      if (!students.length) {
        return NextResponse.json(
          { message: "No students found for this class." },
          { status: 404 }
        );
      }

      // Prevent duplicate week attendance
      const existing = await Attendance.findOne({
        schoolId,
        classLevel,
        term,
        weekNumber,
      });
      if (existing) {
        return NextResponse.json(
          { message: "Attendance for this week already exists." },
          { status: 400 }
        );
      }

      // Prepare attendance records
      const records = students.map((s: any) => ({
        studentId: s._id,
        days: {
          Monday: "A",
          Tuesday: "A",
          Wednesday: "A",
          Thursday: "A",
          Friday: "A",
        },
        totalPresent: 0,
      }));

      const attendance = await Attendance.create({
        schoolId,
        teacherId,
        classLevel,
        term,
        weekNumber,
        records,
      });

      await ActivityLogger.attendanceCreated(
        attendance.classLevel,
        attendance.term,
        attendance.weekNumber
      );

      return NextResponse.json(attendance, { status: 201 });
    } else {
      // Handle attendance query
      const { schoolId, classLevel, teacherId, term } = await req.json();

      const filter: any = { schoolId, term };
      if (classLevel) filter.classLevel = classLevel;
      if (teacherId) filter.teacherId = teacherId;

      const records = await Attendance.find(filter)
        .populate("records.studentId", "name regNumber classLevel")
        .sort({ weekNumber: 1 });

      return NextResponse.json(records, { status: 200 });
    }
  } catch (err: any) {
    // console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
