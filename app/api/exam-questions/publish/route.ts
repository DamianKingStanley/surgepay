/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/exam-questions/publish/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import ExamQuestion from "../../../models/ExamQuestion";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const {
      examId,
      title,
      description,
      questions,
      duration,
      instructions,
      isShuffled,
      status,
    } = await req.json();

    // Update the exam with the edited data
    const updatedExam = await ExamQuestion.findByIdAndUpdate(
      examId,
      {
        title,
        description,
        questions,
        duration,
        instructions,
        isShuffled,
        status,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(updatedExam);
  } catch (error: any) {
    console.error("Error publishing exam:", error);
    return NextResponse.json(
      { error: "Failed to publish exam" },
      { status: 500 }
    );
  }
}
