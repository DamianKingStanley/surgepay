/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/quizzes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { connectToDatabase } from "../../libs/mongodb";
import Quiz from "../../models/Quiz";
import User from "../../models/User";
import mongoose from "mongoose";
import { checkQuizLimit } from "../../libs/limitChecker";
import { ActivityLogger } from "../../libs/activityLogger";

// export const revalidate = 300;
// export const dynamic = "force-static";

// DONT DELTE
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const { userRole, id, schoolId, assignedClasses } = session.user;
    let quizzes = [];

    console.log("Session user:", { userRole, id, schoolId, assignedClasses });

    // 🏫 Admin sees everything created under their school
    if (userRole === "school_admin") {
      quizzes = await Quiz.find({
        $or: [{ createdBy: id }, { schoolId: id }],
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // 👩‍🏫 Teacher sees their own + admin's quizzes in assigned classes
    else if (userRole === "teacher") {
      // Convert to ObjectId for proper comparison
      const teacherId = new mongoose.Types.ObjectId(id);
      const adminId = new mongoose.Types.ObjectId(schoolId);

      console.log("Teacher query:", {
        teacherId: teacherId.toString(),
        adminId: adminId.toString(),
        assignedClasses,
      });

      // Get all quizzes that could be relevant
      const allQuizzes = await Quiz.find({
        $or: [
          { createdBy: teacherId }, // Teacher's own quizzes
          { createdBy: adminId }, // Quizzes created by school admin
          { schoolId: adminId }, // Quizzes with schoolId set to admin's ID
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      console.log(
        "All potential quizzes:",
        allQuizzes.map((q) => ({
          _id: q._id,
          title: q.title,
          createdBy: q.createdBy?.toString(),
          createdByRole: q.createdByRole,
          classLevel: q.classLevel,
          schoolId: q.schoolId?.toString(),
        }))
      );

      // Filter logic: Teacher sees their own quizzes + admin quizzes for their classes
      quizzes = allQuizzes.filter((quiz) => {
        const quizCreatedBy = quiz.createdBy?.toString();
        const isTeacherOwnQuiz = quizCreatedBy === id;
        const isAdminQuiz =
          quizCreatedBy === schoolId || quiz.createdByRole === "school_admin";

        if (isTeacherOwnQuiz) {
          return true; // Teacher always sees their own quizzes
        }

        if (isAdminQuiz) {
          // Only show admin quizzes for classes the teacher is assigned to
          return assignedClasses?.includes(quiz.classLevel);
        }

        return false;
      });

      console.log("Filtered quizzes for teacher:", quizzes.length);
      console.log(
        "Final quizzes:",
        quizzes.map((q) => ({ title: q.title, classLevel: q.classLevel }))
      );
    } else {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    return NextResponse.json(quizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

type CreateQuizBody = {
  title: string;
  subject?: string;
  classLevel?: string;
  durationMinutes?: number;
  password?: string;
  status?: "draft" | "published";
  quiz_status: "ongoing" | "ceased";
  questions?: any[]; // allow client-created questions
  uploadFileUrl?: string; // optional cloudinary/original-upload URL to parse
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["school_admin", "teacher"].includes(session.user.userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userRole, id, schoolId } = session.user as {
      userRole?: string;
      id?: string;
      schoolId?: string;
    };

    const actualSchoolId = userRole === "school_admin" ? id : schoolId;

    // ✅ STEP 1: Identify the school
    const school = await User.findById(actualSchoolId);
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // ✅ STEP 2: Check the school’s subscription
    const subscription = school.subscription;
    if (!subscription || subscription.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Your subscription is inactive or expired. Please renew your plan.",
        },
        { status: 403 }
      );
    }

    // ✅ STEP 3: Check if subscription is expired by date
    if (
      subscription.expiryDate &&
      new Date(subscription.expiryDate) < new Date()
    ) {
      school.subscription.status = "expired";
      await school.save();
      return NextResponse.json(
        { error: "Your subscription has expired. Please renew to continue." },
        { status: 403 }
      );
    }

    const quizCount = await Quiz.countDocuments({
      schoolId: actualSchoolId,
    });
    if (quizCount >= 2 && subscription.planName === "Basic") {
      return NextResponse.json(
        { error: "Basic plan limit reached for quiz creation." },
        { status: 403 }
      );
    }

    // ✅ STEP 2: Check job limit
    const schoolIdToCheck = schoolId || actualSchoolId;
    if (!schoolIdToCheck) {
      return NextResponse.json(
        { error: "School ID not found for limit check" },
        { status: 400 }
      );
    }
    const quizLimitCheck = await checkQuizLimit(schoolIdToCheck);
    if (!quizLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: quizLimitCheck.error,
          currentCount: quizLimitCheck.currentCount,
          limit: quizLimitCheck.limit,
        },
        { status: 403 }
      );
    }

    const body: CreateQuizBody = await request.json();
    await connectToDatabase();

    const questions = body.questions ?? [];

    // get schoolUniqueId
    const schoolUser = await User.findById(
      session.user.schoolId || session.user.id
    );
    const schoolUniqueId = schoolUser?.schoolUniqueId || session.user.schoolId;

    // Create quiz
    const quiz = await Quiz.create({
      schoolId: session.user.schoolId,
      schoolUniqueId,
      createdBy: session.user.id,
      createdByRole:
        session.user.userRole === "school_admin" ? "school_admin" : "teacher",
      title: body.title,
      subject: body.subject,
      classLevel: body.classLevel,
      durationMinutes: body.durationMinutes ?? 30,
      password: body.password,
      status: body.status ?? (questions.length ? "published" : "draft"),
      quiz_status: body.quiz_status ?? "ongoing",
      questions,
    });

    // ✅ Generate the quiz URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const quizUrl = `${baseUrl}/quiz/${schoolUniqueId}/${quiz.subject}/${quiz.classLevel}/${quiz._id}`;

    // ✅ Save the URL
    quiz.quizUrl = quizUrl;
    await quiz.save();
    // ✅ Log the update activity
    await ActivityLogger.quizCreated(
      quiz._id,
      quiz.topic,
      quiz.subject,
      quiz.classLevel
    );

    return NextResponse.json(
      { message: "Quiz created", quiz },
      { status: 201 }
    );
  } catch (err) {
    // console.error("Create quiz error:", err);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { userRole, id, schoolId, assignedClasses } = session.user;

//     const redis = await getRedisClient();
//     const cacheKey = `quizzes:${userRole}:${id}`;

//     // ✅ Try Redis first
//     const cachedData = await redis.get(cacheKey);
//     if (cachedData) {
//       // console.log("✅ Returning quizzes from Redis cache");
//       return NextResponse.json(JSON.parse(cachedData));
//     }

//     // ✅ Wrap your database logic in a Next.js unstable_cache
//     const fetchQuizzes = unstable_cache(
//       async () => {
//         await connectToDatabase();
//         let quizzes: any[] = [];

//         // console.log("Session user:", {
//         //   userRole,
//         //   id,
//         //   schoolId,
//         //   assignedClasses,
//         // });

//         if (userRole === "school_admin") {
//           quizzes = await Quiz.find({
//             $or: [{ createdBy: id }, { schoolId: id }],
//           })
//             .sort({ createdAt: -1 })
//             .lean();
//         } else if (userRole === "teacher") {
//           const teacherId = new mongoose.Types.ObjectId(id);
//           const adminId = new mongoose.Types.ObjectId(schoolId);

//           // console.log("Teacher query:", {
//           //   teacherId: teacherId.toString(),
//           //   adminId: adminId.toString(),
//           //   assignedClasses,
//           // });

//           const allQuizzes = await Quiz.find({
//             $or: [
//               { createdBy: teacherId },
//               { createdBy: adminId },
//               { schoolId: adminId },
//             ],
//           })
//             .sort({ createdAt: -1 })
//             .lean();

//           quizzes = allQuizzes.filter((quiz) => {
//             const quizCreatedBy = quiz.createdBy?.toString();
//             const isTeacherOwnQuiz = quizCreatedBy === id;
//             const isAdminQuiz =
//               quizCreatedBy === schoolId ||
//               quiz.createdByRole === "school_admin";

//             if (isTeacherOwnQuiz) return true;
//             if (isAdminQuiz) return assignedClasses?.includes(quiz.classLevel);
//             return false;
//           });
//         } else {
//           return { error: "Unauthorized role" };
//         }

//         return quizzes;
//       },
//       [`quiz-cache-${userRole}-${id}`],
//       { revalidate: FIVE_MINUTES }
//     );

//     const quizzes = await fetchQuizzes();

//     // ✅ Save to Redis cache (5 minutes)
//     await redis.set(cacheKey, JSON.stringify(quizzes), "EX", FIVE_MINUTES);

//     return NextResponse.json(quizzes);
//   } catch (err) {
//     // console.error("Error fetching quizzes:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch quizzes" },
//       { status: 500 }
//     );
//   }
// }
