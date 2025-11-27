/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/timetables/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import Timetable from "../../../models/Timetable";
import { ActivityLogger } from "../../../libs/activityLogger";

// GET single timetable

export async function GET(request: Request, contextPromise: any) {
  const { params } = await contextPromise; // ✅ Await context

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const timetable = await Timetable.findById(params.id).populate(
      "teacherId",
      "name email"
    );

    if (!timetable) {
      return NextResponse.json(
        { error: "Timetable not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (
      session.user.userRole === "teacher" &&
      timetable.teacherId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(timetable);
  } catch (error: any) {
    console.error("Error fetching timetable:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}

// UPDATE timetable

export async function PUT(request: Request, contextPromise: any) {
  const { params } = await contextPromise; // ✅ Await context

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const updates = await request.json();
    const timetable = await Timetable.findById(params.id);

    if (!timetable) {
      return NextResponse.json(
        { error: "Timetable not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (
      session.user.userRole === "teacher" &&
      timetable.teacherId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    ).populate("teacherId", "name email");
    await ActivityLogger.timetableUpdated(
      timetable._id,
      updatedTimetable.classLevel,
      updatedTimetable.term,
      updates
    );

    return NextResponse.json(updatedTimetable);
  } catch (error: any) {
    console.error("Error updating timetable:", error);
    return NextResponse.json(
      { error: "Failed to update timetable" },
      { status: 500 }
    );
  }
}

// DELETE timetable

export async function DELETE(request: Request, contextPromise: any) {
  const { params } = await contextPromise; // ✅ Await context

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const timetable = await Timetable.findById(params.id);

    if (!timetable) {
      return NextResponse.json(
        { error: "Timetable not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (
      session.user.userRole === "teacher" &&
      timetable.teacherId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Timetable.findByIdAndDelete(params.id);
    await ActivityLogger.timetableDeleted(
      timetable._id,
      timetable.classLevel,
      timetable.term
    );

    return NextResponse.json({ message: "Timetable deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting timetable:", error);
    return NextResponse.json(
      { error: "Failed to delete timetable" },
      { status: 500 }
    );
  }
}
