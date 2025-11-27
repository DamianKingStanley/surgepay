import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import User from "../../../models/User";
import Teacher from "../../../models/Teacher";
import Student from "../../../models/Student";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let user;
    const stats = { teachers: 0, students: 0 };

    if (session.user.userRole === "teacher") {
      // For teachers, get their school's information
      const teacher = await Teacher.findById(session.user.id).populate(
        "schoolId"
      );
      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 }
        );
      }

      user = teacher.schoolId;

      // Get stats for the school
      stats.teachers = await Teacher.countDocuments({
        schoolId: teacher.schoolId._id,
      });
      stats.students = await Student.countDocuments({
        schoolId: teacher.schoolId._id,
      });
    } else {
      // For school_admin, get their own profile
      user = await User.findById(session.user.id).select("-__v -password");

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get stats for the school
      stats.teachers = await Teacher.countDocuments({
        schoolId: session.user.id,
      });
      stats.students = await Student.countDocuments({
        schoolId: session.user.id,
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = user.toObject ? user.toObject() : user;
    return NextResponse.json({ ...userData, stats });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only school_admin can update profile
    if (session.user.userRole !== "school_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, motto, address } = await request.json();

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          name: name?.trim(),
          motto: motto?.trim(),
          address: address?.trim(),
        },
      },
      { new: true }
    ).select("-__v -password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
