/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/exam-questions/generate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import LessonNote from "../../../models/LessonNote";
import ExamQuestion from "../../../models/ExamQuestion";
import User from "../../../models/User";
// export const revalidate = 300;
// export const dynamic = "force-static";
import { checkExamQuestionLimit } from "../../../libs/limitChecker";
import { ActivityLogger } from "../../../libs/activityLogger";

interface GenerateExamRequest {
  title: string;
  description?: string;
  subject: string;
  classLevel: string;
  totalQuestions: number;
  questionTypes: {
    multiple_choice: number;
    short_answer: number;
    fill_blank: number;
    true_false: number;
  };
  selectedLessonNoteIds: string[];
  isShuffled: boolean;
  duration?: number;
  instructions?: string;
}

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

    const generateCount = await ExamQuestion.countDocuments({
      schoolId,
    });
    if (generateCount >= 2 && subscription.planName === "Basic") {
      return NextResponse.json(
        { error: "Basic plan limit reached for exam question generation." },
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
    const examLimitCheck = await checkExamQuestionLimit(schoolIdToCheck);
    if (!examLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: examLimitCheck.error,
          currentCount: examLimitCheck.currentCount,
          limit: examLimitCheck.limit,
        },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      subject,
      classLevel,
      totalQuestions,
      questionTypes,
      selectedLessonNoteIds,
      isShuffled,
      duration,
      instructions,
    }: GenerateExamRequest = await req.json();

    // Validate input
    if (
      !title ||
      !subject ||
      !classLevel ||
      !totalQuestions ||
      !selectedLessonNoteIds.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const totalRequestedQuestions = Object.values(questionTypes).reduce(
      (a, b) => a + b,
      0
    );
    if (totalRequestedQuestions !== totalQuestions) {
      return NextResponse.json(
        { error: "Question type counts must sum to total questions" },
        { status: 400 }
      );
    }

    // Fetch selected lesson notes
    const lessonNotes = await LessonNote.find({
      _id: { $in: selectedLessonNoteIds },
      schoolId: actualSchoolId,
    });

    if (lessonNotes.length === 0) {
      return NextResponse.json(
        { error: "No lesson notes found for the selected IDs" },
        { status: 404 }
      );
    }

    // Combine all lesson note content for AI processing
    const combinedContent = combineLessonNoteContent(lessonNotes);

    // Generate exam questions using AI
    const generatedQuestions = await generateExamQuestionsWithAI({
      combinedContent,
      totalQuestions,
      questionTypes,
      subject,
      classLevel,
      lessonNoteTitles: lessonNotes.map((note) => note.topic),
    });

    if (!generatedQuestions.success) {
      return NextResponse.json(
        { error: "Failed to generate exam questions" },
        { status: 500 }
      );
    }

    // Create exam question document
    const examQuestion = await ExamQuestion.create({
      schoolId: actualSchoolId,
      teacherId: id,
      title,
      description,
      questions: generatedQuestions.questions,
      sourceLessonNotes: selectedLessonNoteIds,
      subject,
      classLevel,
      totalQuestions,
      duration,
      instructions,
      isShuffled,
    });

    // ✅ Log the update activity
    await ActivityLogger.examGenerated(
      examQuestion._id,
      examQuestion.title,
      examQuestion.subject,
      examQuestion.totalQuestions
    );

    return NextResponse.json(examQuestion, { status: 201 });
  } catch (error: any) {
    // console.error("Error generating exam questions:", error);
    return NextResponse.json(
      { error: "Failed to generate exam questions" },
      { status: 500 }
    );
  }
}

function combineLessonNoteContent(lessonNotes: any[]): string {
  return lessonNotes
    .map(
      (note) => `
TOPIC: ${note.topic}
SUB-TOPIC: ${note.subTopic}
CLASS LEVEL: ${note.classLevel}
SUBJECT: ${note.subject}
TERM: ${note.term}
WEEK: ${note.week}

LESSON AIMS & OBJECTIVES:
${note.lessonAimsObjectives}

TOPIC INTRODUCTION:
${note.topicIntroduction}

TEACHER & STUDENT ACTIVITIES:
${note.teacherStudentActivities}

TEACHING METHODS:
${note.teachingMethods}

LESSON EVALUATION & CONCLUSION:
${note.lessonEvaluationConclusion}

EXERCISES:
${note.exercise}

EXERCISE ANSWERS:
${note.exerciseAnswers}

LESSON SUMMARY:
${note.lessonSummary}
  `
    )
    .join("\n---\n");
}

interface AIQuestionGenerationRequest {
  combinedContent: string;
  totalQuestions: number;
  questionTypes: {
    multiple_choice: number;
    short_answer: number;
    fill_blank: number;
    true_false: number;
  };
  subject: string;
  classLevel: string;
  lessonNoteTitles: string[];
}

async function generateExamQuestionsWithAI({
  combinedContent,
  totalQuestions,
  questionTypes,
  subject,
  classLevel,
  lessonNoteTitles,
}: AIQuestionGenerationRequest): Promise<{
  success: boolean;
  questions: any[];
}> {
  try {
    const prompt = createExamGenerationPrompt({
      combinedContent,
      totalQuestions,
      questionTypes,
      subject,
      classLevel,
      lessonNoteTitles,
    });

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
              content: `You are an expert educational assessment specialist. Your task is to create high-quality exam questions based on provided lesson content.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON format
2. Generate questions that accurately assess understanding of the lesson content
3. Create age-appropriate questions for the specified class level
4. Ensure questions are clear, unambiguous, and educationally sound
5. Include a mix of difficulty levels (easy, medium, hard)
6. For multiple choice questions, provide 4 plausible options with one correct answer
7. For fill-in-the-blank questions, ensure the blank represents a key concept
8. For short answer questions, require brief but substantive responses
9. For true or flase questions, provide 2 plausible options with one correct answer
10. Provide explanations for answers where helpful
11. Use the exact JSON structure specified in the prompt`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
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

    // Clean the response
    const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      // console.error("JSON parse failed. Raw output:", cleanedContent);
      throw new Error(`Failed to parse AI response: ${parseError}`);
    }

    // Transform AI response to our database schema
    const questions = transformAIQuestionsToSchema(parsedData.questions);

    return { success: true, questions };
  } catch (error) {
    // console.error("AI exam question generation error:", error);
    return { success: false, questions: [] };
  }
}

function createExamGenerationPrompt(data: AIQuestionGenerationRequest): string {
  return `Generate ${data.totalQuestions} exam questions based on the following lesson content for ${data.subject}, ${data.classLevel} level.

LESSON CONTENT SOURCES: ${data.lessonNoteTitles.join(", ")}

QUESTION TYPE DISTRIBUTION:
- Multiple Choice: ${data.questionTypes.multiple_choice}
- Short Answer: ${data.questionTypes.short_answer}
- Fill in the Blank: ${data.questionTypes.fill_blank}
- True or False: ${data.questionTypes.true_false}


LESSON CONTENT:
${data.combinedContent}

INSTRUCTIONS:
1. Generate exactly ${data.totalQuestions} questions distributed as specified
2. Create questions that cover key concepts from the lesson content
3. Ensure questions are appropriate for ${data.classLevel} students
4. Include a mix of difficulty levels
5. For multiple choice questions:
   - Provide exactly 4 options (A, B, C, D)
   - Mark the correct answer clearly
   - Make distractors plausible but incorrect
6. For fill-in-the-blank questions:
   - Use underscores to indicate blanks (e.g., "The capital of France is ______.")
   - Ensure the blank tests important knowledge
7. For short answer questions:
   - Require brief but meaningful answers
   - Focus on comprehension and application
8. For true or flase questions:
   - Provide exactly true and false options
   - Mark the correct answer clearly
   - Make distractors plausible but incorrect


RETURN FORMAT (JSON):
{
  "questions": [
    {
      "question": "Full question text",
      "type": "multiple_choice|short_answer|fill_blank|true_false",
      "options": ["Option A", "Option B", "Option C", "Option D"], // only for multiple_choice
      "correctAnswer": "Correct answer or option letter",
      "explanation": "Brief explanation of the answer",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Respond with ONLY the JSON object:`;
}

function transformAIQuestionsToSchema(aiQuestions: any[]): any[] {
  return aiQuestions.map((q, index) => ({
    question: q.question,
    type: q.type,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || "",
    lessonNoteIds: [], // Will be populated based on content matching
    difficulty: q.difficulty || "medium",
  }));
}

// GET endpoint to fetch generated exam questions
export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const subject = url.searchParams.get("subject");
    const classLevel = url.searchParams.get("classLevel");

    const filter: any = { schoolId: actualSchoolId };
    if (userRole === "teacher") filter.teacherId = id;
    if (subject) filter.subject = subject;
    if (classLevel) filter.classLevel = classLevel;

    const examQuestions = await ExamQuestion.find(filter)
      .populate("sourceLessonNotes")
      .sort({ createdAt: -1 });

    return NextResponse.json(examQuestions);
  } catch (error: any) {
    // console.error("Error fetching exam questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam questions" },
      { status: 500 }
    );
  }
}
