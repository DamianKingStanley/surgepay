/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import Student from "../../../models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { ActivityLogger } from "../../../libs/activityLogger";

export async function PUT(
  req: NextRequest,
  context: any // 👈 use any to avoid the new type conflict
) {
  const { id: studentId } = context.params;

  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userRole, id, schoolId } = session.user;
  // const { id: studentId } = params;
  const body = await req.json();

  const student = await Student.findById(studentId);
  if (!student)
    return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const actualSchoolId = userRole === "school_admin" ? id : schoolId;
  // ✅ Guard against undefined
  if (!actualSchoolId) {
    return NextResponse.json(
      { error: "Missing school information" },
      { status: 400 }
    );
  }
  // 🛡 Authorization
  if (student.schoolId.toString() !== actualSchoolId.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (userRole === "teacher" && student.createdBy.toString() !== id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  Object.assign(student, body);
  await student.save();

  await ActivityLogger.studentUpdated(
    student.name,
    student.regNumber,
    student.classLevel
  );

  return NextResponse.json({ message: "Student updated", student });
}
export async function DELETE(
  req: NextRequest,
  context: any // 👈 use any to avoid the new type conflict
) {
  const { id: studentId } = context.params; // ✅ Directly access it

  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userRole, id, schoolId } = session.user;
  // const { id: studentId } = params;

  const student = await Student.findById(studentId);
  if (!student)
    return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const actualSchoolId = userRole === "school_admin" ? id : schoolId;
  // ✅ Guard against undefined
  if (!actualSchoolId) {
    return NextResponse.json(
      { error: "Missing school information" },
      { status: 400 }
    );
  }
  // 🛡 Authorization
  if (student.schoolId.toString() !== actualSchoolId.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (userRole === "teacher" && student.createdBy.toString() !== id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await student.deleteOne();
  await ActivityLogger.studentDeleted(student.name, student.classLevel);

  return NextResponse.json({ message: "Student deleted successfully" });
}
