/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Attendance from "../../../models/Attendance";
import { connectToDatabase } from "../../../libs/mongodb";
import Student from "../../../models/Student";
import { authOptions } from "../../../libs/authOptions";
import { getServerSession } from "next-auth";
import Teacher from "../../../models/Teacher"; // Import Teacher model

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { classLevel, term, teacherId } = await req.json();
    const { id: sessionId, userRole } = session.user;

    const filter: any = {};

    if (userRole === "school_admin") {
      filter.schoolId = sessionId; // school admin's ID is the school
      if (teacherId && teacherId !== "all") {
        filter.teacherId = teacherId; // optional teacher filter
      }
    } else if (userRole === "teacher") {
      filter.teacherId = sessionId; // teacher sees only their own records

      // 🔑 KEY FIX: Get teacher's assigned classes and restrict classLevel filter
      const teacher =
        await Teacher.findById(sessionId).select("assignedClasses");

      if (
        teacher &&
        teacher.assignedClasses &&
        teacher.assignedClasses.length > 0
      ) {
        // If teacher tries to filter by a class they're not assigned to, override it
        if (classLevel && classLevel !== "all") {
          if (!teacher.assignedClasses.includes(classLevel)) {
            // Teacher is trying to access a class they're not assigned to
            return NextResponse.json(
              { error: "Unauthorized access to this class level" },
              { status: 403 }
            );
          }
          filter.classLevel = classLevel;
        } else {
          // No specific class filter - show only their assigned classes
          filter.classLevel = { $in: teacher.assignedClasses };
        }
      } else {
        // Teacher has no assigned classes - return empty or error
        return NextResponse.json(
          { error: "No classes assigned to this teacher" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    // Optional filters (for school admin only now, teachers handled above)
    if (userRole === "school_admin") {
      if (classLevel && classLevel !== "all") filter.classLevel = classLevel;
    }

    if (term && term !== "all") filter.term = term;

    // Fetch attendances
    const attendances = await Attendance.find(filter)
      .sort({ weekNumber: 1 })
      .lean();

    // Populate student info for each record
    const populatedAttendances = await Promise.all(
      attendances.map(async (attendance: any) => {
        const populatedRecords = await Promise.all(
          attendance.records.map(async (record: any) => {
            const student = await Student.findById(record.studentId)
              .select("name regNumber classLevel")
              .lean();

            return {
              ...record,
              studentId: student || {
                name: "Unknown Student",
                regNumber: "N/A",
                classLevel: "Unknown",
              },
            };
          })
        );

        return {
          ...attendance,
          records: populatedRecords,
        };
      })
    );

    return NextResponse.json(populatedAttendances, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching attendance:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();
//     const { schoolId, classLevel, teacherId, term } = await req.json();

//     const filter: any = { schoolId };

//     // Add optional filters
//     if (classLevel && classLevel !== "all") filter.classLevel = classLevel;
//     if (teacherId) filter.teacherId = teacherId;
//     if (term && term !== "all") filter.term = term;

//     // First, get all attendances that match the filter
//     const attendances = await Attendance.find(filter)
//       .sort({ weekNumber: 1 })
//       .lean();

//     // Then populate student data for each record
//     const populatedAttendances = await Promise.all(
//       attendances.map(async (attendance: any) => {
//         const populatedRecords = await Promise.all(
//           attendance.records.map(async (record: any) => {
//             try {
//               const student = await Student.findById(record.studentId)
//                 .select("name regNumber classLevel")
//                 .lean();

//               return {
//                 ...record,
//                 studentId: student || {
//                   name: "Unknown Student",
//                   regNumber: "N/A",
//                   classLevel: "Unknown",
//                 },
//               };
//             } catch (error) {
//               console.error("Error populating student:", error);
//               return {
//                 ...record,
//                 studentId: {
//                   name: "Unknown Student",
//                   regNumber: "N/A",
//                   classLevel: "Unknown",
//                 },
//               };
//             }
//           })
//         );

//         return {
//           ...attendance,
//           records: populatedRecords,
//         };
//       })
//     );

//     console.log("Populated attendances:", populatedAttendances.length);

//     return NextResponse.json(populatedAttendances, { status: 200 });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
