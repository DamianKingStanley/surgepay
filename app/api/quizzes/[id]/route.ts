// app/api/quizzes/[id]/route.ts
// app/api/quizzes/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/quizzes/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import Quiz from "../../../models/Quiz";
// import User from "../../../models/User";
import { parseDocumentToQuestions } from "../../../libs/deepseek";
import { ActivityLogger } from "../../../libs/activityLogger";

type UpdateBody = Partial<{
  title: string;
  subject: string;
  classLevel: string;
  durationMinutes: number;
  password: string | null;
  status: "draft" | "published";
  quiz_status: "ongoing" | "ceased";
  questions: any[];
  uploadFileUrl?: string;
  resetTimes?: { startTime?: string; endTime?: string; scheduledAt?: string };
}>;

export async function PUT(request: NextRequest, context: any) {
  const params = await context.params;

  const quizId = params.id;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userRole, id: userId, schoolId, assignedClasses } = session.user;

    if (!["school_admin", "teacher"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle potentially undefined schoolId for teachers
    if (userRole === "teacher" && !schoolId) {
      return NextResponse.json(
        { error: "Missing school information" },
        { status: 400 }
      );
    }

    const body: UpdateBody = await request.json();
    await connectToDatabase();

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fix for schoolId check - handle undefined schoolId
    const actualSchoolId = userRole === "school_admin" ? userId : schoolId;
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: "Missing school information" },
        { status: 400 }
      );
    }

    // Check if user has permission to edit this quiz
    const canEditQuiz =
      // School admin can edit any quiz from their school
      (userRole === "school_admin" &&
        (quiz.createdBy.toString() === actualSchoolId.toString() ||
          (quiz.schoolId &&
            quiz.schoolId.toString() === actualSchoolId.toString()))) ||
      // Teacher can edit their own quizzes OR school admin quizzes for their assigned classes
      (userRole === "teacher" &&
        (quiz.createdBy.toString() === userId.toString() ||
          (quiz.createdByRole === "school_admin" &&
            quiz.createdBy.toString() === schoolId!.toString() && // schoolId is guaranteed to exist here
            assignedClasses?.includes(quiz.classLevel))));

    if (!canEditQuiz) {
      return NextResponse.json(
        { error: "You don't have permission to edit this quiz" },
        { status: 403 }
      );
    }

    if (body.uploadFileUrl) {
      const parsed = await parseDocumentToQuestions(body.uploadFileUrl);
      quiz.questions = parsed;
      quiz.status = body.status ?? "published";
    }

    Object.assign(quiz, {
      title: body.title ?? quiz.title,
      subject: body.subject ?? quiz.subject,
      classLevel: body.classLevel ?? quiz.classLevel,
      durationMinutes: body.durationMinutes ?? quiz.durationMinutes,
      password: body.password ?? quiz.password,
      questions: body.questions ?? quiz.questions,
      status: body.status ?? quiz.status,
      quiz_status: body.quiz_status ?? quiz.quiz_status,
    });

    if (body.resetTimes) {
      if (body.resetTimes.startTime)
        quiz.startTime = new Date(body.resetTimes.startTime);
      if (body.resetTimes.endTime)
        quiz.endTime = new Date(body.resetTimes.endTime);
      if (body.resetTimes.scheduledAt)
        quiz.scheduledAt = new Date(body.resetTimes.scheduledAt);
    }

    await quiz.save();
    // ✅ Log the update activity
    await ActivityLogger.quizUpdated(
      quiz._id,
      quiz.topic,
      quiz.subject,
      quiz.classLevel
    );

    return NextResponse.json({ message: "Quiz updated successfully", quiz });
  } catch (err) {
    console.error("Update quiz error:", err);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const params = await context.params;

  const quizId = params.id;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userRole, id: userId, schoolId, assignedClasses } = session.user;

    // ✅ Restrict who can delete quizzes
    if (!["school_admin", "teacher"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle potentially undefined schoolId for teachers
    if (userRole === "teacher" && !schoolId) {
      return NextResponse.json(
        { error: "Missing school information" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check if user has permission to delete this quiz
    const canDeleteQuiz =
      // School admin can delete any quiz from their school
      (userRole === "school_admin" &&
        (quiz.createdBy.toString() === userId.toString() ||
          (quiz.schoolId && quiz.schoolId.toString() === userId.toString()))) ||
      // Teacher can delete their own quizzes OR school admin quizzes for their assigned classes
      (userRole === "teacher" &&
        (quiz.createdBy.toString() === userId.toString() ||
          (quiz.createdByRole === "school_admin" &&
            quiz.createdBy.toString() === schoolId!.toString() && // schoolId is guaranteed to exist here
            assignedClasses?.includes(quiz.classLevel))));

    if (!canDeleteQuiz) {
      return NextResponse.json(
        { error: "You don't have permission to delete this quiz" },
        { status: 403 }
      );
    }

    await quiz.deleteOne();
    // ✅ Log the delete activity
    await ActivityLogger.quizDeleted(
      quiz._id,
      quiz.topic,
      quiz.subject,
      quiz.classLevel
    );

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    console.error("❌ Delete quiz error:", err);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
// export async function DELETE(
//   req: Request,
//   context: Promise<{ params: { id: string } }>
// ) {
//   const { params } = await context; // ✅ destructure safely
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { userRole, id, schoolId } = session.user;
//     if (!["school_admin", "teacher"].includes(userRole)) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     await connectToDatabase();

//     const quiz = await Quiz.findById(params.id);
//     if (!quiz)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     const actualSchoolId = userRole === "school_admin" ? id : schoolId;
//     if (!actualSchoolId)
//       return NextResponse.json(
//         { error: "Missing school information" },
//         { status: 400 }
//       );

//     if (quiz.schoolId.toString() !== actualSchoolId.toString()) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     if (userRole === "teacher" && quiz.createdBy.toString() !== id.toString()) {
//       return NextResponse.json(
//         { error: "You can only delete your own quizzes" },
//         { status: 403 }
//       );
//     }

//     await quiz.deleteOne();
//     return NextResponse.json({ message: "Quiz deleted successfully" });
//   } catch (err) {
//     console.error("Delete quiz error:", err);
//     return NextResponse.json(
//       { error: "Failed to delete quiz" },
//       { status: 500 }
//     );
//   }
// }
// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     await connectToDatabase();
//     const quiz = await Quiz.findById(params.id).lean();
//     if (!quiz)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     // Ensure quiz belongs to user's school
//     if (quiz.schoolId.toString() !== session.user.schoolId) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     return NextResponse.json(quiz);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: "Failed to fetch quiz" },
//       { status: 500 }
//     );
//   }
// }
// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { userRole, id, schoolId } = session.user;

//     // Determine actual schoolId (admin's id is schoolId)
//     // const actualSchoolId = userRole === "school_admin" ? id : schoolId;

//     if (!["school_admin", "teacher"].includes(userRole)) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const body: UpdateBody = await req.json();
//     await connectToDatabase();

//     const quiz = await Quiz.findById(params.id);
//     if (!quiz)
//       return NextResponse.json({ error: "Not found" }, { status: 404 });

//     // ✅ Determine actual schoolId (admin's ID is the schoolId)
//     const actualSchoolId = userRole === "school_admin" ? id : schoolId;

//     // ✅ Guard against undefined
//     if (!actualSchoolId) {
//       return NextResponse.json(
//         { error: "Missing school information" },
//         { status: 400 }
//       );
//     }

//     // ✅ Authorization: must belong to the same school
//     if (quiz.schoolId.toString() !== actualSchoolId.toString()) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     // ✅ Teachers can only modify their own quizzes
//     if (userRole === "teacher" && quiz.createdBy.toString() !== id.toString()) {
//       return NextResponse.json(
//         { error: "You can only edit your own quizzes" },
//         { status: 403 }
//       );
//     }

//     // ✅ If file uploaded → re-parse questions
//     if (body.uploadFileUrl) {
//       const parsed = await parseDocumentToQuestions(body.uploadFileUrl);
//       quiz.questions = parsed;
//       quiz.status = body.status ?? "published";
//     }

//     // ✅ Update fields
//     if (body.title !== undefined) quiz.title = body.title;
//     if (body.subject !== undefined) quiz.subject = body.subject;
//     if (body.classLevel !== undefined) quiz.classLevel = body.classLevel;
//     if (body.durationMinutes !== undefined)
//       quiz.durationMinutes = body.durationMinutes;
//     if (body.password !== undefined) quiz.password = body.password;
//     if (body.questions !== undefined) quiz.questions = body.questions;
//     if (body.status !== undefined) quiz.status = body.status;

//     // ✅ Reset times if provided
//     if (body.resetTimes) {
//       if (body.resetTimes.startTime)
//         quiz.startTime = new Date(body.resetTimes.startTime);
//       if (body.resetTimes.endTime)
//         quiz.endTime = new Date(body.resetTimes.endTime);
//       if (body.resetTimes.scheduledAt)
//         quiz.scheduledAt = new Date(body.resetTimes.scheduledAt);
//     }

//     await quiz.save();
//     return NextResponse.json({ message: "Quiz updated", quiz });
//   } catch (err) {
//     console.error("Update quiz error:", err);
//     return NextResponse.json(
//       { error: "Failed to update quiz" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   req: NextRequest,
//   context: { params: { id: string } } // ✅ Not a Promise anymore
// ) {
//   const { id: quizId } = context.params;

//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { userRole, id: userId, schoolId } = session.user;

//     if (!["school_admin", "teacher"].includes(userRole)) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const body: UpdateBody = await req.json();
//     await connectToDatabase();

//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) {
//       return NextResponse.json({ error: "Not found" }, { status: 404 });
//     }

//     const actualSchoolId = userRole === "school_admin" ? userId : schoolId;
//     if (!actualSchoolId) {
//       return NextResponse.json(
//         { error: "Missing school information" },
//         { status: 400 }
//       );
//     }

//     if (quiz.schoolId.toString() !== actualSchoolId.toString()) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     if (
//       userRole === "teacher" &&
//       quiz.createdBy.toString() !== userId.toString()
//     ) {
//       return NextResponse.json(
//         { error: "You can only edit your own quizzes" },
//         { status: 403 }
//       );
//     }

//     if (body.uploadFileUrl) {
//       const parsed = await parseDocumentToQuestions(body.uploadFileUrl);
//       quiz.questions = parsed;
//       quiz.status = body.status ?? "published";
//     }

//     if (body.title !== undefined) quiz.title = body.title;
//     if (body.subject !== undefined) quiz.subject = body.subject;
//     if (body.classLevel !== undefined) quiz.classLevel = body.classLevel;
//     if (body.durationMinutes !== undefined)
//       quiz.durationMinutes = body.durationMinutes;
//     if (body.password !== undefined) quiz.password = body.password;
//     if (body.questions !== undefined) quiz.questions = body.questions;
//     if (body.status !== undefined) quiz.status = body.status;
//     if (body.quiz_status !== undefined) quiz.quiz_status = body.quiz_status;

//     if (body.resetTimes) {
//       if (body.resetTimes.startTime)
//         quiz.startTime = new Date(body.resetTimes.startTime);
//       if (body.resetTimes.endTime)
//         quiz.endTime = new Date(body.resetTimes.endTime);
//       if (body.resetTimes.scheduledAt)
//         quiz.scheduledAt = new Date(body.resetTimes.scheduledAt);
//     }

//     await quiz.save();

//     return NextResponse.json({
//       message: "Quiz updated successfully",
//       quiz,
//     });
//   } catch (err) {
//     console.error("Update quiz error:", err);
//     return NextResponse.json(
//       { error: "Failed to update quiz" },
//       { status: 500 }
//     );
//   }
// }
