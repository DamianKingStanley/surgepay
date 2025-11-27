/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import StudentQuizResult from "../../../models/StudentQuizResult";
import Quiz from "../../../models/Quiz";

export async function DELETE(
  req: NextRequest,
  context: any // 👈 use any to avoid the new type conflict
) {
  const { id } = context.params; // ✅ Directly access it

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // const { id } = params;
    const result = await StudentQuizResult.findById(id);

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Permissions check
    const { userRole, id: userId } = session.user;

    if (userRole === "school_admin") {
      if (result.schoolId.toString() !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (userRole === "teacher") {
      const quiz = await Quiz.findById(result.quizId);
      if (!quiz || quiz.createdBy.toString() !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    await StudentQuizResult.findByIdAndDelete(id);
    return NextResponse.json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting quiz result:", error);
    return NextResponse.json(
      { error: "Failed to delete result" },
      { status: 500 }
    );
  }
}
