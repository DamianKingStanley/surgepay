/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { connectToDatabase } from "../../libs/mongodb";
import LessonNote from "../../models/LessonNote";
import User from "../../models/User";
import { checkLessonNoteLimit } from "../../libs/limitChecker";
import { ActivityLogger } from "../../libs/activityLogger";

// export const revalidate = 300;
// export const dynamic = "force-static";

interface LessonNotePromptData {
  subject: string;
  classLevel: string;
  topic: string;
  period: string;
  subTopic: string;
  duration: string;
  previousKnowledge: string;
  term: string;
  week: string;
  objectives: string[];
  materials: string[];
}

// ✅ POST: Create a new lesson note with AI generation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

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

    const lessonnotesCount = await LessonNote.countDocuments({
      actualSchoolId,
    });
    if (lessonnotesCount >= 2 && subscription.planName === "Basic") {
      return NextResponse.json(
        { error: "Basic plan limit reached for lesson note creation." },
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
    const lessonLimitCheck = await checkLessonNoteLimit(schoolIdToCheck);
    if (!lessonLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: lessonLimitCheck.error,
          currentCount: lessonLimitCheck.currentCount,
          limit: lessonLimitCheck.limit,
        },
        { status: 403 }
      );
    }

    const {
      subject,
      classLevel,
      topic,
      subTopic,
      duration,
      period,
      previousKnowledge,
      term,
      week,
      objectives,
      materials,
      // Optional fields that AI can generate
      lessonAimsObjectives,
      topicIntroduction,
      teacherStudentActivities,
      teachingMethods,
      teachingAids,
      lessonEvaluationConclusion,
      exercise,
      exerciseAnswers,
      lessonSummary,
    } = await req.json();

    // Check if lesson note already exists for this subject, class, term, and week
    const existingNote = await LessonNote.findOne({
      schoolId: actualSchoolId,
      subject,
      classLevel,
      term,
      week,
    });

    if (existingNote) {
      return NextResponse.json(
        {
          error:
            "Lesson note for this subject, class, term, and week already exists",
        },
        { status: 400 }
      );
    }

    // Create AI prompt for lesson note generation
    const aiPrompt = createLessonNotePrompt({
      subject,
      classLevel,
      topic,
      subTopic,
      duration,
      period,
      previousKnowledge,
      term,
      week,
      objectives,
      materials,
    });

    // Call DeepSeek API to generate lesson note content
    const aiResponse = await generateLessonNoteWithAI(aiPrompt);

    let generatedContent = {
      lessonAimsObjectives: "",
      topicIntroduction: "",
      teacherStudentActivities: "",
      teachingMethods: "",
      teachingAids: "",
      lessonEvaluationConclusion: "",
      exercise: "",
      exerciseAnswers: "",
      lessonSummary: "",
    };

    if (aiResponse.success) {
      generatedContent = parseLessonNoteAIResponse(aiResponse.data);
    }

    // Use AI-generated content or provided content
    const lessonNote = await LessonNote.create({
      schoolId: actualSchoolId,
      teacherId: id,
      subject,
      classLevel,
      topic,
      subTopic,
      duration,
      period,
      previousKnowledge,
      term,
      week,
      lessonAimsObjectives:
        lessonAimsObjectives || generatedContent.lessonAimsObjectives,
      topicIntroduction:
        topicIntroduction || generatedContent.topicIntroduction,
      teacherStudentActivities:
        teacherStudentActivities || generatedContent.teacherStudentActivities,
      teachingMethods: teachingMethods || generatedContent.teachingMethods,
      teachingAids: teachingAids || generatedContent.teachingAids,
      lessonEvaluationConclusion:
        lessonEvaluationConclusion ||
        generatedContent.lessonEvaluationConclusion,
      exercise: exercise || generatedContent.exercise,
      exerciseAnswers: exerciseAnswers || generatedContent.exerciseAnswers,
      lessonSummary: lessonSummary || generatedContent.lessonSummary,
      aiPrompt: aiResponse.success ? aiPrompt : undefined,
      aiResponse: aiResponse.success
        ? JSON.stringify(aiResponse.data)
        : undefined,
      isAIGenerated: aiResponse.success,
      status: "draft",
    });

    // ✅ Log the update activity
    await ActivityLogger.lessonNoteCreated(
      lessonNote._id,
      lessonNote.topic,
      lessonNote.subject,
      lessonNote.classLevel
    );

    return NextResponse.json(lessonNote, { status: 201 });
  } catch (error: any) {
    // console.error("Error creating lesson note:", error);
    return NextResponse.json(
      { error: "Failed to create lesson note" },
      { status: 500 }
    );
  }
}

function createLessonNotePrompt(data: LessonNotePromptData): string {
  return `Create a comprehensive and professional lesson note for ${data.subject} class, ${data.classLevel} level.

LESSON DETAILS:
- Subject: ${data.subject}
- Class Level: ${data.classLevel}
- Term: ${data.term}
- Week: ${data.week}
- Topic: ${data.topic}
- Sub-topic: ${data.subTopic}
- Duration: ${data.duration}
- Period: ${data.period}
- Previous Knowledge: ${data.previousKnowledge}

LEARNING OBJECTIVES:
${data.objectives.map((obj, index) => `${index + 1}. ${obj}`).join("\n")}

TEACHING MATERIALS:
${data.materials.map((material, index) => `${index + 1}. ${material}`).join("\n")}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON format, no additional text
2. Structure the response with these exact keys that match the database schema:
   - "lessonAimsObjectives": Clear aims and objectives for the lesson
   - "topicIntroduction": Engaging introduction to the topic
   - "teacherStudentActivities": Detailed teacher and student activities
   - "teachingMethods": Teaching methodologies and approaches
   - "teachingAids": Specific teaching aids and resources needed
   - "lessonEvaluationConclusion": Evaluation methods and lesson conclusion
   - "exercise": Practice exercises for students
   - "exerciseAnswers": Answers to the exercises
   - "lessonSummary": Summary of key points covered

3. Make it age-appropriate for ${data.classLevel} students
4. Include practical examples and real-world applications
5. Ensure pedagogical soundness and alignment with learning objectives
6. Include differentiation strategies for varied learning abilities
7. Incorporate formative assessment opportunities
8. Build upon previous knowledge: ${data.previousKnowledge}

Respond with this exact JSON structure:
{
  "lessonAimsObjectives": "Detailed aims and objectives here...",
  "topicIntroduction": "Engaging introduction here...",
  "teacherStudentActivities": "Teacher and student activities here...",
  "teachingMethods": "Teaching methods here...",
  "teachingAids": "Teaching aids here...",
  "lessonEvaluationConclusion": "Evaluation and conclusion here...",
  "exercise": "Student exercises here...",
  "exerciseAnswers": "Exercise answers here...",
  "lessonSummary": "Lesson summary here..."
}`;
}

async function generateLessonNoteWithAI(
  prompt: string
): Promise<{ success: boolean; data: any }> {
  try {
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are an expert educational consultant and curriculum developer with extensive experience in creating pedagogical materials. You MUST:
              - Respond with ONLY valid JSON format
              - Create age-appropriate, engaging lesson content
              - Incorporate best teaching practices
              - Include differentiated learning strategies
              - Align all content with learning objectives
              - Make lessons practical and interactive
              - Ensure proper pedagogical structure
              - Use the exact field names provided in the prompt`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      // console.error("DeepSeek API error:", await response.text());
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content?.trim();

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Clean the response - remove any markdown code blocks
    const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      // console.error("❌ JSON parse failed. Raw output:", cleanedContent);
      throw new Error(`Failed to parse AI response: ${parseError}`);
    }

    return { success: true, data: parsedData };
  } catch (error) {
    // console.error("AI lesson note generation error:", error);
    return { success: false, data: null };
  }
}

function parseLessonNoteAIResponse(aiData: any): {
  lessonAimsObjectives: string;
  topicIntroduction: string;
  teacherStudentActivities: string;
  teachingMethods: string;
  teachingAids: string;
  lessonEvaluationConclusion: string;
  exercise: string;
  exerciseAnswers: string;
  lessonSummary: string;
} {
  //   console.log("Parsing AI lesson note response:", aiData);

  // If AI returned the expected structure directly
  if (
    aiData.lessonAimsObjectives &&
    aiData.topicIntroduction &&
    aiData.teacherStudentActivities
  ) {
    return {
      lessonAimsObjectives: aiData.lessonAimsObjectives,
      topicIntroduction: aiData.topicIntroduction,
      teacherStudentActivities: aiData.teacherStudentActivities,
      teachingMethods: aiData.teachingMethods || "",
      teachingAids: aiData.teachingAids || "",
      lessonEvaluationConclusion: aiData.lessonEvaluationConclusion || "",
      exercise: aiData.exercise || "",
      exerciseAnswers: aiData.exerciseAnswers || "",
      lessonSummary: aiData.lessonSummary || "",
    };
  }

  // Fallback: Handle different response structures or generate basic content
  const fallbackContent = generateFallbackLessonContent();

  return {
    lessonAimsObjectives:
      aiData.objectives ||
      aiData.lessonAimsObjectives ||
      fallbackContent.lessonAimsObjectives,
    topicIntroduction:
      aiData.introduction ||
      aiData.topicIntroduction ||
      fallbackContent.topicIntroduction,
    teacherStudentActivities:
      aiData.activities ||
      aiData.teacherStudentActivities ||
      fallbackContent.teacherStudentActivities,
    teachingMethods:
      aiData.methods ||
      aiData.teachingMethods ||
      fallbackContent.teachingMethods,
    teachingAids:
      aiData.aids || aiData.teachingAids || fallbackContent.teachingAids,
    lessonEvaluationConclusion:
      aiData.evaluation ||
      aiData.lessonEvaluationConclusion ||
      fallbackContent.lessonEvaluationConclusion,
    exercise: aiData.exercise || fallbackContent.exercise,
    exerciseAnswers:
      aiData.answers ||
      aiData.exerciseAnswers ||
      fallbackContent.exerciseAnswers,
    lessonSummary:
      aiData.summary || aiData.lessonSummary || fallbackContent.lessonSummary,
  };
}

function generateFallbackLessonContent(): {
  lessonAimsObjectives: string;
  topicIntroduction: string;
  teacherStudentActivities: string;
  teachingMethods: string;
  teachingAids: string;
  lessonEvaluationConclusion: string;
  exercise: string;
  exerciseAnswers: string;
  lessonSummary: string;
} {
  return {
    lessonAimsObjectives:
      "Define clear learning objectives that students should achieve by the end of this lesson.",
    topicIntroduction:
      "Create an engaging introduction that connects to students' previous knowledge and real-world applications.",
    teacherStudentActivities:
      "Plan interactive activities that involve both teacher demonstration and student participation.",
    teachingMethods:
      "Use a variety of teaching methods including demonstration, discussion, and hands-on activities.",
    teachingAids:
      "Prepare relevant teaching aids such as charts, models, or digital resources to enhance learning.",
    lessonEvaluationConclusion:
      "Develop evaluation methods to assess student understanding and provide a clear conclusion.",
    exercise:
      "Create practical exercises that reinforce the lesson content and allow students to apply their knowledge.",
    exerciseAnswers:
      "Provide comprehensive answers and explanations for the exercises.",
    lessonSummary:
      "Summarize the key points covered in the lesson and highlight main takeaways.",
  };
}

// ✅ PUT: Update a lesson note
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id: userId,
      userRole,
      schoolId,
    } = session.user as {
      id: string;
      userRole: string;
      schoolId?: string;
    };

    const actualSchoolId = userRole === "school_admin" ? userId : schoolId;
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: "Missing school information" },
        { status: 400 }
      );
    }

    const { noteId, updateData } = await req.json();

    const note = await LessonNote.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // ✅ Authorization check
    // School admins can only edit notes from their school
    if (userRole === "school_admin" && note.schoolId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Teachers can only edit their own notes
    if (userRole === "teacher" && note.teacherId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Update the note with new data
    const updatedNote = await LessonNote.findByIdAndUpdate(
      noteId,
      {
        $set: {
          // Basic information (can be updated)
          subject: updateData.subject,
          classLevel: updateData.classLevel,
          topic: updateData.topic,
          subTopic: updateData.subTopic,
          duration: updateData.duration,
          period: updateData.period,
          previousKnowledge: updateData.previousKnowledge,
          term: updateData.term,
          week: updateData.week,

          // Lesson content fields
          lessonAimsObjectives: updateData.lessonAimsObjectives,
          topicIntroduction: updateData.topicIntroduction,
          teacherStudentActivities: updateData.teacherStudentActivities,
          teachingMethods: updateData.teachingMethods,
          teachingAids: updateData.teachingAids,
          lessonEvaluationConclusion: updateData.lessonEvaluationConclusion,
          exercise: updateData.exercise,
          exerciseAnswers: updateData.exerciseAnswers,
          lessonSummary: updateData.lessonSummary,

          // Status and metadata
          status: updateData.status || "draft",
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );
    // ✅ Log the update activity
    await ActivityLogger.lessonNoteCreated(
      updatedNote._id,
      updatedNote.topic,
      updatedNote.subject,
      updatedNote.classLevel
    );
    return NextResponse.json(updatedNote);
  } catch (error) {
    // console.error("Update lesson note error:", error);
    return NextResponse.json(
      { error: "Failed to update lesson note" },
      { status: 500 }
    );
  }
}

// ✅ PATCH: Partial update for lesson note (alternative approach)
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, userRole } = session.user as {
      id: string;
      userRole: string;
    };

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");
    const updateData = await req.json();

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const note = await LessonNote.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // ✅ Authorization check
    if (userRole === "teacher" && note.teacherId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove any fields that shouldn't be updated
    const allowedUpdates = {
      subject: updateData.subject,
      classLevel: updateData.classLevel,
      topic: updateData.topic,
      subTopic: updateData.subTopic,
      duration: updateData.duration,
      period: updateData.period,
      previousKnowledge: updateData.previousKnowledge,
      term: updateData.term,
      week: updateData.week,
      lessonAimsObjectives: updateData.lessonAimsObjectives,
      topicIntroduction: updateData.topicIntroduction,
      teacherStudentActivities: updateData.teacherStudentActivities,
      teachingMethods: updateData.teachingMethods,
      teachingAids: updateData.teachingAids,
      lessonEvaluationConclusion: updateData.lessonEvaluationConclusion,
      exercise: updateData.exercise,
      exerciseAnswers: updateData.exerciseAnswers,
      lessonSummary: updateData.lessonSummary,
      status: updateData.status,
    };

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );

    const updatedNote = await LessonNote.findByIdAndUpdate(
      noteId,
      { $set: { ...filteredUpdates, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Patch lesson note error:", error);
    return NextResponse.json(
      { error: "Failed to update lesson note" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Delete a lesson note
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, userRole } = session.user as {
      id: string;
      userRole: string;
    };

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const note = await LessonNote.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // ✅ Authorization check
    if (userRole === "teacher" && note.teacherId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await LessonNote.findByIdAndDelete(noteId);
    // ✅ Log the update activity
    await ActivityLogger.lessonNoteCreated(
      note._id,
      note.topic,
      note.subject,
      note.classLevel
    );

    return NextResponse.json({ message: "Lesson note deleted successfully" });
  } catch (error) {
    // console.error("Delete lesson note error:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson note" },
      { status: 500 }
    );
  }
}

// ✅ GET: Fetch lesson notes
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userRole, id, schoolId } = session.user as {
      userRole?: string;
      id?: string;
      schoolId?: string;
    };

    const actualSchoolId = userRole === "school_admin" ? id : schoolId;
    if (!actualSchoolId) {
      return NextResponse.json(
        { error: "Missing school information" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const classFilter = url.searchParams.get("classLevel");
    const subjectFilter = url.searchParams.get("subject");

    const filter: any = { schoolId: actualSchoolId };
    if (userRole === "teacher") filter.teacherId = id;
    if (classFilter) filter.classLevel = classFilter;
    if (subjectFilter) filter.subject = subjectFilter;

    const notes = await LessonNote.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Fetch lesson notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson notes" },
      { status: 500 }
    );
  }
}

// const FIVE_MINUTES = 300; // 5 minutes cache time

// // ✅ GET: Fetch lesson notes (cached with Redis + Next.js)
// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { userRole, id, schoolId } = session.user as {
//       userRole?: string;
//       id?: string;
//       schoolId?: string;
//     };

//     const actualSchoolId = userRole === "school_admin" ? id : schoolId;
//     if (!actualSchoolId) {
//       return NextResponse.json(
//         { error: "Missing school information" },
//         { status: 400 }
//       );
//     }

//     const url = new URL(req.url);
//     const classFilter = url.searchParams.get("classLevel") || "all";
//     const subjectFilter = url.searchParams.get("subject") || "all";

//     // Create a unique cache key
//     const cacheKey = `lessonNotes:${actualSchoolId}:${userRole}:${classFilter}:${subjectFilter}`;

//     // Try Redis cache first
//     const redis = getRedisClient();
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return NextResponse.json(JSON.parse(cached));
//     }

//     // Wrap the DB fetch logic in Next.js unstable_cache
//     const fetchNotes = unstable_cache(
//       async () => {
//         await connectToDatabase();

//         const filter: any = { schoolId: actualSchoolId };
//         if (userRole === "teacher") filter.teacherId = id;
//         if (classFilter !== "all") filter.classLevel = classFilter;
//         if (subjectFilter !== "all") filter.subject = subjectFilter;

//         const notes = await LessonNote.find(filter)
//           .sort({ createdAt: -1 })
//           .lean();

//         return notes;
//       },
//       [cacheKey], // Key for Next.js internal cache
//       { revalidate: FIVE_MINUTES } // Revalidate after 5 minutes
//     );

//     // Get the data from Next.js cache or DB
//     const data = await fetchNotes();

//     // Store in Redis too (5 minutes)
//     await redis.set(cacheKey, JSON.stringify(data), "EX", FIVE_MINUTES);

//     return NextResponse.json(data);
//   } catch (error) {
//     // console.error("Fetch lesson notes error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch lesson notes" },
//       { status: 500 }
//     );
//   }
// }

// ✅ DELETE: Remove a lesson note
// export async function DELETE(req: Request) {
//   try {
//     await connectToDatabase();
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { id: userId, userRole } = session.user;
//     const url = new URL(req.url);
//     const noteId = url.searchParams.get("noteId");

//     if (!noteId)
//       return NextResponse.json({ error: "Missing note ID" }, { status: 400 });

//     const note = await LessonNote.findById(noteId);
//     if (!note)
//       return NextResponse.json({ error: "Note not found" }, { status: 404 });

//     if (userRole === "teacher" && note.teacherId !== userId) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     await LessonNote.findByIdAndDelete(noteId);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Delete lesson note error:", error);
//     return NextResponse.json(
//       { error: "Failed to delete lesson note" },
//       { status: 500 }
//     );
//   }
// }
