/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/teachers/class-levels/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import Teacher from "../../../models/Teacher";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { teacherId, schoolId } = await req.json();

    if (!teacherId || !schoolId) {
      return NextResponse.json(
        { error: "Teacher ID and School ID are required" },
        { status: 400 }
      );
    }

    // Find the teacher and get their assigned class levels
    const teacher = await Teacher.findOne({
      _id: teacherId,
      schoolId: schoolId,
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Return the teacher's class levels, or empty array if none assigned
    const classLevels = teacher.assignedClasses || [];

    return NextResponse.json({ classLevels });
  } catch (error: any) {
    console.error("Error fetching teacher class levels:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher class levels" },
      { status: 500 }
    );
  }
}
