/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextResponse } from "next/server";
// import Attendance from "../../../models/Attendance";
// import { connectToDatabase } from "../../../libs/mongodb";

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await connectToDatabase();
//     const { id } = params;
//     const { studentId, day, status } = await req.json(); // status: "P" or "A"

//     const attendance = await Attendance.findById(id);
//     if (!attendance)
//       return NextResponse.json(
//         { message: "Attendance not found" },
//         { status: 404 }
//       );

//     const record = attendance.records.find(
//       (r: { studentId: { toString: () => any } }) =>
//         r.studentId.toString() === studentId
//     );
//     if (!record)
//       return NextResponse.json(
//         { message: "Student not found in this week" },
//         { status: 404 }
//       );

//     record.days[day] = status;
//     record.totalPresent = Object.values(record.days).filter(
//       (d) => d === "P"
//     ).length;

//     await attendance.save();
//     return NextResponse.json(attendance, { status: 200 });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// app/api/attendance/[id]/route.ts
// app/api/attendance/[id]/route.ts
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../libs/authOptions";
// import { connectToDatabase } from "../../../libs/mongodb";
// import Attendance from "../../../models/Attendance";

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectToDatabase();

//     const { id } = params;
//     const { studentId, day, status } = await req.json();

//     const attendance = await Attendance.findById(id);
//     if (!attendance) {
//       return NextResponse.json(
//         { message: "Attendance not found" },
//         { status: 404 }
//       );
//     }

//     const record = attendance.records.find(
//       (r: any) => r.studentId.toString() === studentId
//     );
//     if (!record) {
//       return NextResponse.json(
//         { message: "Student not found in this week" },
//         { status: 404 }
//       );
//     }

//     // ✅ Update attendance days
//     record.days[day] = status;

//     // ✅ Recalculate totalPresent
//     // record.totalPresent = Object.values(record.days).filter(
//     //   (d: any) => d === "P"
//     // ).length;

//     record.totalPresent = Object.values(record.days).filter(
//       (d) => d === "P"
//     ).length;

//     // ✅ FIXED: Properly count "P" values from the days object
//     // record.totalPresent = Object.values(record.days).filter(
//     //   (dayStatus: any) => dayStatus === "P"
//     // ).length;

//     // ✅ Force mongoose to detect nested changes
//     attendance.markModified("records");

//     await attendance.save();

//     return NextResponse.json(attendance, { status: 200 });
//   } catch (err: any) {
//     console.error("Attendance update error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// app/api/attendance/[id]/route.ts
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../libs/authOptions";
// import { connectToDatabase } from "../../../libs/mongodb";
// import Attendance from "../../../models/Attendance";

// interface RouteParams {
//   params: {
//     id: string;
//   };
// }

// export async function PUT(req: Request, { params }: RouteParams) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectToDatabase();

//     const { id } = params;
//     const { studentId, day, status } = await req.json();

//     const attendance = await Attendance.findById(id);
//     if (!attendance) {
//       return NextResponse.json(
//         { message: "Attendance not found" },
//         { status: 404 }
//       );
//     }

//     const record = attendance.records.find(
//       (r: any) => r.studentId.toString() === studentId
//     );
//     if (!record) {
//       return NextResponse.json(
//         { message: "Student not found in this week" },
//         { status: 404 }
//       );
//     }

//     // ✅ Update attendance days
//     record.days[day] = status;

//     // ✅ Recalculate totalPresent
//     record.totalPresent = Object.values(record.days).filter(
//       (d: any) => d === "P"
//     ).length;

//     // ✅ Force mongoose to detect nested changes
//     attendance.markModified("records");

//     await attendance.save();

//     return NextResponse.json(attendance, { status: 200 });
//   } catch (err: any) {
//     console.error("Attendance update error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // Optional: Add other HTTP methods if needed
// export async function GET(req: Request, { params }: RouteParams) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectToDatabase();

//     const { id } = params;
//     const attendance = await Attendance.findById(id);

//     if (!attendance) {
//       return NextResponse.json(
//         { message: "Attendance not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(attendance, { status: 200 });
//   } catch (err: any) {
//     console.error("Attendance fetch error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// app/api/attendance/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import Attendance from "../../../models/Attendance";
import { ActivityLogger } from "../../../libs/activityLogger";

export async function PUT(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const params = await context.params;
    const { id } = params;
    const { studentId, day, status } = await request.json();

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return NextResponse.json(
        { message: "Attendance not found" },
        { status: 404 }
      );
    }

    const record = attendance.records.find(
      (r: any) => r.studentId.toString() === studentId
    );
    if (!record) {
      return NextResponse.json(
        { message: "Student not found in this week" },
        { status: 404 }
      );
    }

    // ✅ Update attendance days
    record.days[day] = status;

    // ✅ Recalculate totalPresent
    record.totalPresent = Object.values(record.days).filter(
      (d: any) => d === "P"
    ).length;

    // ✅ Force mongoose to detect nested changes
    attendance.markModified("records");

    await attendance.save();

    // ✅ Log the update activity
    await ActivityLogger.attendanceMarked(
      attendance.classLevel,
      attendance.term,
      attendance.weekNumber,
      record.totalPresent
    );

    return NextResponse.json(attendance, { status: 200 });
  } catch (err: any) {
    // console.error("Attendance update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
