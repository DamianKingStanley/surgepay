/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/timetables/generate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import Timetable from "../../../models/Timetable";
import User from "../../../models/User"; // still used for school admin
import { checkTimeTableLimit } from "../../../libs/limitChecker";
import { ActivityLogger } from "../../../libs/activityLogger";

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

    // ✅ STEP 4: (Optional) Check if attendance creation exceeds plan limit
    // Example: You could limit attendance per term if desired
    const timetableCount = await Timetable.countDocuments({
      schoolId: actualSchoolId,
    });
    if (timetableCount >= 2 && subscription.planName === "Basic") {
      return NextResponse.json(
        { error: "Basic plan limit reached for timetable creation." },
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
    const timetableLimitCheck = await checkTimeTableLimit(schoolIdToCheck);
    if (!timetableLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: timetableLimitCheck.error,
          currentCount: timetableLimitCheck.currentCount,
          limit: timetableLimitCheck.limit,
        },
        { status: 403 }
      );
    }

    const {
      schoolId: bodySchoolId,
      teacherId,
      classLevel,
      term,
      config,
      subjects,
    } = await req.json();

    // Check if timetable already exists for this class and term
    const existingTimetable = await Timetable.findOne({
      schoolId: bodySchoolId,
      classLevel,
      term,
    });

    if (existingTimetable) {
      return NextResponse.json(
        { error: "Timetable for this class and term already exists" },
        { status: 400 }
      );
    }

    // Create AI prompt for timetable generation
    const aiPrompt = createTimetablePrompt(config, subjects, classLevel);

    // Call DeepSeek API to generate timetable
    const aiResponse = await generateTimetableWithAI(aiPrompt);

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: "Failed to generate timetable with AI" },
        { status: 500 }
      );
    }

    // Parse AI response and create timetable
    const timetableData = parseAIResponse(aiResponse.data, config, subjects);

    const timetable = await Timetable.create({
      schoolId: bodySchoolId,
      teacherId,
      classLevel,
      term,
      config,
      subjects,
      days: timetableData.days,
      aiPrompt,
      aiResponse: JSON.stringify(aiResponse.data), // Store as string to avoid schema issues
      isGenerated: true,
      status: "draft",
    });

    await ActivityLogger.timetableCreated(timetable._id, classLevel, term);

    return NextResponse.json(timetable, { status: 201 });
  } catch (error: any) {
    console.error("Error generating timetable:", error);
    return NextResponse.json(
      { error: "Failed to generate timetable" },
      { status: 500 }
    );
  }
}

function createTimetablePrompt(
  config: any,
  subjects: any[],
  classLevel: string
): string {
  return `Create a detailed school timetable for ${classLevel} with the following constraints:

SCHOOL SCHEDULE:
- School starts at: ${config.schoolStartTime}
- School ends at: ${config.schoolEndTime}
- Period duration: ${config.periodDuration} minutes
- Break time: ${config.breakTime} for ${config.breakDuration} minutes
- Lunch time: ${config.lunchTime} for ${config.lunchDuration} minutes
- Extracurricular days: ${config.extracurricularDays.join(", ") || "None"}

SUBJECT REQUIREMENTS:
${subjects.map((subj) => `- ${subj.name}: ${subj.periodsPerWeek} periods per week${subj.preferredTimes ? ` (preferred: ${subj.preferredTimes.join(", ")})` : ""}`).join("\n")}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON format, no additional text
2. Structure should have "days" array with "Monday" to "Friday"
3. Each day should have "periods" array with period details
4. Each period should have: periodNumber, startTime, endTime, subject
5. Include break and lunch as separate periods
6. For extracurricular days, mark as extracurricular and reduce academic periods
7. Ensure all subject requirements are met across the week

Respond with this exact JSON structure:
{
  "days": [
    {
      "day": "Monday",
      "isExtracurricular": false,
      "periods": [
        {
          "periodNumber": 1,
          "startTime": "08:00",
          "endTime": "08:40",
          "subject": "Mathematics"
        }
      ]
    }
  ]
}`;
}

async function generateTimetableWithAI(
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
              content:
                "You are an expert school timetable generator. You MUST respond with ONLY valid JSON format, no additional text or explanations. The JSON must follow the exact structure specified in the user's prompt.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent JSON
          max_tokens: 4000,
          response_format: { type: "json_object" }, // Force JSON response
        }),
      }
    );

    if (!response.ok) {
      console.error("DeepSeek API error:", await response.text());
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
      console.error("❌ JSON parse failed. Raw output:", cleanedContent);
      throw new Error(`Failed to parse AI response: ${parseError}`);
    }

    return { success: true, data: parsedData };
  } catch (error) {
    console.error("AI generation error:", error);
    return { success: false, data: null };
  }
}

function parseAIResponse(aiData: any, config: any, subjects: any[]) {
  console.log("Parsing AI response:", aiData);

  // If AI returned the expected structure directly
  if (aiData.days && Array.isArray(aiData.days)) {
    return {
      days: aiData.days.map((day: any) => ({
        day: day.day,
        isExtracurricular:
          day.isExtracurricular || config.extracurricularDays.includes(day.day),
        periods: day.periods || [],
      })),
    };
  }

  // If AI returned the complex structure from your example
  if (aiData.timetable && aiData.timetable.weekly_schedule) {
    return parseComplexAITimetable(aiData.timetable, config);
  }

  // Fallback: generate basic timetable
  return generateFallbackTimetable(config, subjects);
}

function parseComplexAITimetable(timetableData: any, config: any) {
  const days: any[] = [];
  const weeklySchedule = timetableData.weekly_schedule;

  Object.keys(weeklySchedule).forEach((dayName) => {
    const daySchedule = weeklySchedule[dayName];
    const isExtracurricular = config.extracurricularDays.includes(dayName);

    const periods = daySchedule.map((period: any, index: number) => {
      // Parse time range if provided
      let startTime = period.startTime;
      let endTime = period.endTime;

      if (period.time && period.time.includes("-")) {
        const [start, end] = period.time.split("-");
        startTime = start.trim();
        endTime = end.trim();
      }

      return {
        periodNumber:
          period.period === "Break" ||
          period.period === "Lunch" ||
          period.period === "Extracurricular"
            ? period.period
            : period.periodNumber || index + 1,
        startTime:
          startTime ||
          calculateTime(config.schoolStartTime, config.periodDuration, index),
        endTime:
          endTime ||
          calculateTime(
            config.schoolStartTime,
            config.periodDuration,
            index + 1
          ),
        subject: period.subject,
      };
    });

    days.push({
      day: dayName,
      isExtracurricular,
      periods,
    });
  });

  return { days };
}

function calculateTime(
  startTime: string,
  periodDuration: number,
  periodIndex: number
): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + periodIndex * periodDuration;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
}

function generateFallbackTimetable(config: any, subjects: any[]) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return {
    days: days.map((day) => {
      const isExtracurricular = config.extracurricularDays.includes(day);

      if (isExtracurricular) {
        return {
          day,
          isExtracurricular: true,
          periods: [
            {
              periodNumber: "Extracurricular",
              startTime: config.schoolStartTime,
              endTime: config.schoolEndTime,
              subject: "Extracurricular Activities",
            },
          ],
        };
      }

      // Generate periods for academic days
      const periods = [];
      let currentTime = config.schoolStartTime;
      let periodNumber = 1;

      // Calculate total available minutes
      const [startHour, startMinute] = config.schoolStartTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = config.schoolEndTime.split(":").map(Number);
      const totalMinutes =
        endHour * 60 + endMinute - (startHour * 60 + startMinute);
      const totalPeriods = Math.floor(totalMinutes / config.periodDuration);

      // Distribute subjects randomly for fallback
      const availableSubjects = [...subjects];
      for (let i = 0; i < totalPeriods && availableSubjects.length > 0; i++) {
        const subjectIndex = i % availableSubjects.length;
        const subject = availableSubjects[subjectIndex];

        const startTime = calculateTime(
          config.schoolStartTime,
          config.periodDuration,
          i
        );
        const endTime = calculateTime(
          config.schoolStartTime,
          config.periodDuration,
          i + 1
        );

        periods.push({
          periodNumber: periodNumber++,
          startTime,
          endTime,
          subject: subject.name,
        });
      }

      return {
        day,
        isExtracurricular: false,
        periods,
      };
    }),
  };
}
