import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import Teacher from "../../../models/Teacher";

// export const revalidate = 300;
// export const dynamic = "force-static";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // if (!session?.user?.id || session.user.userRole !== "teacher") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const teacher = await Teacher.findById(session.user.id).select(
      "-__v -password"
    );

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // if (!session?.user?.id || session.user.userRole !== "teacher") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, subjects, assignedClasses } = await request.json();

    await connectToDatabase();

    const teacher = await Teacher.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          name: name?.trim(),
          subjects: subjects || [],
          assignedClasses: assignedClasses || [],
        },
      },
      { new: true }
    ).select("-__v -password");

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
