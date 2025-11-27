/* eslint-disable @typescript-eslint/no-explicit-any */
// libs/activityLogger.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import ActivityLog from "../models/ActivityLog";
import { connectToDatabase } from "./mongodb";
import { headers } from "next/headers";

interface LogActivityParams {
  activityType: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  description: string;
  metadata?: any;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const headersList = await headers();

    if (!session?.user?.id) {
      console.warn("No session found for activity logging");
      return;
    }

    const activityLog = new ActivityLog({
      schoolId: session.user.schoolId || session.user.id,
      userId: session.user.id,
      userRole: session.user.userRole,
      userName: session.user.name || "Unknown User",
      ...params,
      ipAddress:
        headersList.get("x-forwarded-for") ||
        headersList.get("x-real-ip") ||
        "unknown",
      userAgent: headersList.get("user-agent") || "unknown",
    });

    await activityLog.save();
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw error to avoid breaking main functionality
  }
}

// Specific activity loggers
export const ActivityLogger = {
  // Student activities done
  studentCreated: (
    studentId: string,
    name: string,
    classLevel: string,
    gender: string
  ) =>
    logActivity({
      activityType: "student_created",
      targetType: "Student",
      targetId: studentId,
      targetName: name,
      description: `Added new student ${name} to ${classLevel}`,
      metadata: { classLevel, gender },
    }),

  studentUpdated: (studentId: string, name: string, changes: any) =>
    logActivity({
      activityType: "student_updated",
      targetType: "Student",
      targetId: studentId,
      targetName: name,
      description: `Updated student ${name}`,
      metadata: { changes },
    }),

  studentDeleted: (name: string, classLevel: string) =>
    logActivity({
      activityType: "student_deleted",
      targetType: "Student",
      targetName: name,
      description: `Deleted student ${name} from ${classLevel}`,
      metadata: { classLevel },
    }),

  // Teacher activities
  teacherCreated: (teacherId: string, name: string, subjects: string[]) =>
    logActivity({
      activityType: "teacher_created",
      targetType: "Teacher",
      targetId: teacherId,
      targetName: name,
      description: `Added new teacher ${name}`,
      metadata: { subjects },
    }),

  teacherUpdated: (teacherId: string, name: string, changes: any) =>
    logActivity({
      activityType: "teacher_updated",
      targetType: "Teacher",
      targetId: teacherId,
      targetName: name,
      description: `Updated teacher ${name}`,
      metadata: { changes },
    }),

  teacherDeleted: (name: string) =>
    logActivity({
      activityType: "teacher_deleted",
      targetType: "Teacher",
      targetName: name,
      description: `Deleted teacher ${name}`,
    }),

  // Quiz activities done
  quizCreated: (
    quizId: string,
    quizTitle: string,
    subject: string,
    classLevel: string
  ) =>
    logActivity({
      activityType: "quiz_created",
      targetType: "Quiz",
      targetId: quizId,
      targetName: quizTitle,
      description: `Created quiz: ${quizTitle} for ${subject} (${classLevel})`,
      metadata: { subject, classLevel },
    }),

  quizUpdated: (
    quizId: string,
    quizTitle: string,
    changes: any,
    classLevel: string
  ) =>
    logActivity({
      activityType: "quiz_updated",
      targetType: "Quiz",
      targetId: quizId,
      targetName: quizTitle,
      description: `Updated quiz: ${quizTitle}`,
      metadata: { changes, classLevel },
    }),

  quizDeleted: (
    quizId: string,
    quizTitle: string,
    subject: string,
    classLevel: string
  ) =>
    logActivity({
      activityType: "quiz_deleted",
      targetId: quizId,
      targetType: "Quiz",
      targetName: quizTitle,
      description: `Deleted quiz: ${quizTitle} for ${subject}`,
      metadata: { subject, classLevel },
    }),

  quizTaken: (
    quizId: string,
    quizTitle: string,
    studentName: string,
    totalScore: number
  ) =>
    logActivity({
      activityType: "quiz_taken",
      targetType: "Quiz",
      targetId: quizId,
      targetName: quizTitle,
      description: `${studentName} took quiz "${quizTitle}" and scored ${totalScore}%`,
      metadata: { studentName, totalScore },
    }),

  studentLoggedin: (
    quizId: string,
    title: string,
    subject: string,
    classLevel: string,
    studentName: string,
    regNumber: string
  ) =>
    logActivity({
      activityType: "student_loggedin",
      targetType: "Quiz",
      targetId: quizId,
      targetName: title,
      description: `${studentName} logged in to take quiz "${title} for ${subject} (${classLevel})"`,
      metadata: { studentName, regNumber, classLevel },
    }),

  // Timetable activities done
  timetableCreated: (timetableId: string, classLevel: string, term: string) =>
    logActivity({
      activityType: "timetable_created",
      targetType: "Timetable",
      targetId: timetableId,
      targetName: `${classLevel} - ${term}`,
      description: `Created timetable for ${classLevel} (${term})`,
      metadata: { classLevel, term },
    }),

  timetableUpdated: (
    timetableId: string,
    classLevel: string,
    term: string,
    changes: any
  ) =>
    logActivity({
      activityType: "timetable_updated",
      targetType: "Timetable",
      targetId: timetableId,
      targetName: `${classLevel} - ${term}`,
      description: `Updated timetable for ${classLevel} (${term})`,
      metadata: { classLevel, term, changes },
    }),

  timetableDeleted: (timetableId: string, classLevel: string, term: string) =>
    logActivity({
      activityType: "timetable_deleted",
      targetType: "Timetable",
      targetId: timetableId,
      targetName: `${classLevel} - ${term}`,
      description: `Deleted timetable for ${classLevel} (${term})`,
      metadata: { classLevel, term },
    }),

  // Lesson Note activities done
  lessonNoteCreated: (
    noteId: string,
    topic: string,
    subject: string,
    classLevel: string
  ) =>
    logActivity({
      activityType: "lesson_note_created",
      targetType: "LessonNote",
      targetId: noteId,
      targetName: topic,
      description: `Created lesson note: ${topic} for ${subject} (${classLevel})`,
      metadata: { subject, classLevel },
    }),

  lessonNoteUpdated: (
    noteId: string,
    topic: string,
    subject: string,
    classLevel: string
  ) =>
    logActivity({
      activityType: "lesson_note_updated",
      targetType: "LessonNote",
      targetId: noteId,
      targetName: topic,
      description: `Updated lesson note: ${topic} for ${subject} (${classLevel})`,
      metadata: { subject, classLevel },
    }),

  lessonNoteDeleted: (topic: string, subject: string, classLevel: string) =>
    logActivity({
      activityType: "lesson_note_deleted",
      targetType: "LessonNote",
      targetName: topic,
      description: `Deleted lesson note: ${topic} for ${subject} (${classLevel})`,
      metadata: { subject, classLevel },
    }),

  // Exam activities done
  examGenerated: (
    examId: string,
    title: string,
    subject: string,
    totalQuestions: number
  ) =>
    logActivity({
      activityType: "exam_generated",
      targetType: "Exam",
      targetId: examId,
      targetName: title,
      description: `Generated exam: ${title} with ${totalQuestions} questions for ${subject}`,
      metadata: { subject, totalQuestions },
    }),

  examUpdated: (examId: string, title: string, changes: any) =>
    logActivity({
      activityType: "exam_updated",
      targetType: "Exam",
      targetId: examId,
      targetName: title,
      description: `Updated exam: ${title}`,
      metadata: { changes },
    }),

  examDeleted: (title: string, subject: string) =>
    logActivity({
      activityType: "exam_deleted",
      targetType: "Exam",
      targetName: title,
      description: `Deleted exam: ${title} for ${subject}`,
      metadata: { subject },
    }),

  // Attendance activities done
  attendanceCreated: (classLevel: string, term: string, weekNumber: number) =>
    logActivity({
      activityType: "attendance_created",
      targetType: "Attendance",
      targetName: `${classLevel} - Week ${weekNumber}`,
      description: `Attendance Created ${classLevel} (${term})`,
      metadata: { classLevel, term, weekNumber },
    }),
  attendanceMarked: (
    classLevel: string,
    term: string,
    weekNumber: number,
    presentCount: number
  ) =>
    logActivity({
      activityType: "attendance_marked",
      targetType: "Attendance",
      targetName: `${classLevel} - Week ${weekNumber}`,
      description: `Marked attendance for ${classLevel} (${term}) - ${presentCount} students present`,
      metadata: { classLevel, term, weekNumber, presentCount },
    }),

  attendanceUpdated: (
    classLevel: string,
    term: string,
    weekNumber: number,
    changes: any
  ) =>
    logActivity({
      activityType: "attendance_updated",
      targetType: "Attendance",
      targetName: `${classLevel} - Week ${weekNumber}`,
      description: `Updated attendance for ${classLevel} (${term}) week ${weekNumber}`,
      metadata: { classLevel, term, weekNumber, changes },
    }),

  // Job activities
  jobCreated: (jobId: string, title: string, employmentType: string) =>
    logActivity({
      activityType: "job_created",
      targetType: "Job",
      targetId: jobId,
      targetName: title,
      description: `Created job posting: ${title} (${employmentType})`,
      metadata: { employmentType },
    }),

  jobUpdated: (jobId: string, title: string, changes: any) =>
    logActivity({
      activityType: "job_updated",
      targetType: "Job",
      targetId: jobId,
      targetName: title,
      description: `Updated job posting: ${title}`,
      metadata: { changes },
    }),

  jobDeleted: (title: string) =>
    logActivity({
      activityType: "job_deleted",
      targetType: "Job",
      targetName: title,
      description: `Deleted job posting: ${title}`,
    }),

  // Job Application activities
  jobApplicationSubmitted: (
    applicationId: string,
    applicantName: string,
    jobTitle: string
  ) =>
    logActivity({
      activityType: "job_application_submitted",
      targetType: "JobApplication",
      targetId: applicationId,
      targetName: `${applicantName} - ${jobTitle}`,
      description: `New application from ${applicantName} for ${jobTitle}`,
      metadata: { applicantName, jobTitle },
    }),

  jobApplicationUpdated: (
    applicationId: string,
    applicantName: string,
    jobTitle: string,
    status: any
  ) =>
    logActivity({
      activityType: "job_application_updated",
      targetType: "JobApplication",
      targetId: applicationId,
      targetName: `${applicantName} - ${jobTitle}`,
      description: `Updated application status for ${applicantName} to ${status}`,
      metadata: { applicantName, jobTitle, status },
    }),

  jobApplicationDeleted: (applicantName: string, jobTitle: string) =>
    logActivity({
      activityType: "job_application_deleted",
      targetType: "JobApplication",
      targetName: `${applicantName} - ${jobTitle}`,
      description: `Deleted application from ${applicantName} for ${jobTitle}`,
      metadata: { applicantName, jobTitle },
    }),
};
