/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const {
      schoolName,
      motto,
      address,
      logo,
      verificationToken,
      teachers = [],
      students = [],
    } = await req.json();

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Missing verification token" },
        { status: 400 }
      );
    }

    // Find user by verification token
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Invalid or expired token. Please request a new verification email.",
        },
        { status: 400 }
      );
    }

    // Generate school unique ID
    const schoolUniqueId = `SCH-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update school details
    user.schoolUniqueId = schoolUniqueId;
    user.name = schoolName;
    user.motto = motto;
    user.address = address;
    user.logo = logo || "";
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    const createdTeachers: any[] = [];
    const createdStudents: any[] = [];

    // Create teachers if provided
    if (teachers.length > 0) {
      const teacherPromises = teachers.map(async (teacherEmail: string) => {
        const temporaryPassword = generateTemporaryPassword();
        const teacherUser = new User({
          name: teacherEmail.split("@")[0], // Default name from email
          email: teacherEmail,
          userRole: "teacher",
          schoolId: user._id,
          schoolUniqueId: schoolUniqueId,
          password: await bcrypt.hash(temporaryPassword, 10),
          isVerified: false,
          createdBy: user._id,
        });

        const savedTeacher = await teacherUser.save();
        createdTeachers.push({
          ...savedTeacher.toObject(),
          temporaryPassword,
        });
        return savedTeacher;
      });
      await Promise.all(teacherPromises);
    }

    // Create students if provided
    if (students.length > 0) {
      // Get the latest student number for this school
      const latestStudent = await User.findOne(
        { schoolId: user._id, userRole: "student" },
        {},
        { sort: { createdAt: -1 } }
      );

      let lastNumber = 0;
      if (latestStudent && latestStudent.regNumber) {
        const matches = latestStudent.regNumber.match(/\d{6}$/);
        if (matches) {
          lastNumber = parseInt(matches[0]);
        }
      }

      const currentYear = new Date().getFullYear().toString().slice(-2);
      const schoolCode = schoolName
        .toUpperCase()
        .replace(/\s+/g, "")
        .substring(0, 10);

      const studentPromises = students.map(
        async (studentName: string, index: number) => {
          const studentNumber = (lastNumber + index + 1)
            .toString()
            .padStart(6, "0");
          const regNumber = `${schoolCode}/${currentYear}/${studentNumber}`;

          const studentUser = new User({
            name: studentName,
            userRole: "student",
            schoolId: user._id,
            schoolUniqueId: schoolUniqueId,
            regNumber: regNumber,
            classLevel: "Not Assigned",
            createdBy: user._id,
          });

          const savedStudent = await studentUser.save();
          createdStudents.push(savedStudent);
          return savedStudent;
        }
      );
      await Promise.all(studentPromises);
    }

    // Send welcome emails
    await sendWelcomeEmails(user, createdTeachers, createdStudents);

    return NextResponse.json(
      {
        message:
          "Onboarding completed successfully! Your school profile is now active. Welcome emails have been sent to all users.",
        schoolId: user.schoolUniqueId,
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error("Onboarding error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateTemporaryPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendWelcomeEmails(
  schoolAdmin: any,
  teachers: any[],
  students: any[]
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const loginUrl = `${baseUrl}/auth/signin`;
  const dashboardUrl = `${baseUrl}/dashboard`;

  try {
    // Send welcome email to school admin
    await resend.emails.send({
      from: "Classika <no-reply@mail.cexbitward.com>",
      to: schoolAdmin.email,
      subject: `Welcome to Classika - ${schoolAdmin.name} is Now Active!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px;">
          <div style="background-color: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #334039; margin: 0; font-size: 28px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Education Management Platform</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 20px;">Welcome to Classika!</h2>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong>${schoolAdmin.name}</strong>,
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! Your school <strong>${schoolAdmin.name}</strong> has been successfully onboarded and is now active on Classika.
            </p>

            <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #334039; margin: 0 0 15px 0;">Your School Details:</h3>
              <p style="margin: 5px 0; color: #333;">
                <strong>School ID:</strong> ${schoolAdmin.schoolUniqueId}
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>School Name:</strong> ${schoolAdmin.name}
              </p>
              ${schoolAdmin.motto ? `<p style="margin: 5px 0; color: #333;"><strong>Motto:</strong> ${schoolAdmin.motto}</p>` : ""}
            </div>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #334039; margin: 0 0 15px 0;">Onboarding Summary:</h3>
              <p style="margin: 5px 0; color: #333;">
                <strong>Teachers Added:</strong> ${teachers.length}
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>Students Added:</strong> ${students.length}
              </p>
            </div>

            <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
              You can now access your school dashboard and start managing your educational activities:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                style="display: inline-block; padding: 14px 32px; background-color: #334039; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Dashboard
              </a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Need help getting started?</strong> Check out our documentation or contact our support team.
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Classika. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent to school admin:", schoolAdmin.email);

    // Send welcome emails to teachers
    for (const teacher of teachers) {
      try {
        await resend.emails.send({
          from: "Classika <no-reply@mail.cexbitward.com>",
          to: teacher.email,
          subject: `Welcome to ${schoolAdmin.name} on Classika!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px;">
              <div style="background-color: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #334039; margin: 0; font-size: 28px; font-weight: 300;">Classika</h1>
                  <p style="color: #666; margin: 5px 0 0 0;">Education Management Platform</p>
                </div>
                
                <h2 style="color: #334039; margin-bottom: 20px;">Welcome to ${schoolAdmin.name}!</h2>
                
                <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                  Dear <strong>${teacher.name}</strong>,
                </p>
                
                <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                  You have been added as a teacher at <strong>${schoolAdmin.name}</strong> on the Classika platform.
                </p>

                <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="color: #334039; margin: 0 0 15px 0;">Your Login Details:</h3>
                  <p style="margin: 5px 0; color: #333;">
                    <strong>Email:</strong> ${teacher.email}
                  </p>
                  <p style="margin: 5px 0; color: #333;">
                    <strong>Temporary Password:</strong> ${teacher.temporaryPassword}
                  </p>
                  <p style="margin: 5px 0; color: #333;">
                    <strong>School ID:</strong> ${schoolAdmin.schoolUniqueId}
                  </p>
                </div>

                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404;">
                    <strong>Important:</strong> Please change your temporary password after your first login.
                  </p>
                </div>

                <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
                  You can now access your teacher dashboard and start creating lessons, quizzes, and managing your classes:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${loginUrl}" 
                    style="display: inline-block; padding: 14px 32px; background-color: #334039; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Sign In to Classika
                  </a>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    If you have any questions, please contact your school administrator at ${schoolAdmin.email}.
                  </p>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Classika. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          `,
        });
        // console.log("Welcome email sent to teacher:", teacher.email);
      } catch (teacherEmailError) {
        console.error(
          "Failed to send email to teacher:",
          teacher.email,
          teacherEmailError
        );
      }
    }

    // Send welcome emails to students (if they have emails)
    for (const student of students) {
      if (student.email) {
        try {
          await resend.emails.send({
            from: "Classika <no-reply@mail.cexbitward.com>",
            to: student.email,
            subject: `Welcome to ${schoolAdmin.name} - Your Student Account`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px;">
                <div style="background-color: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #334039; margin: 0; font-size: 28px; font-weight: 300;">Classika</h1>
                    <p style="color: #666; margin: 5px 0 0 0;">Education Management Platform</p>
                  </div>
                  
                  <h2 style="color: #334039; margin-bottom: 20px;">Welcome to ${schoolAdmin.name}!</h2>
                  
                  <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                    Dear <strong>${student.name}</strong>,
                  </p>
                  
                  <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                    Welcome to <strong>${schoolAdmin.name}</strong>! Your student account has been created on the Classika platform.
                  </p>

                  <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #334039; margin: 0 0 15px 0;">Your Student Details:</h3>
                    <p style="margin: 5px 0; color: #333;">
                      <strong>Name:</strong> ${student.name}
                    </p>
                    <p style="margin: 5px 0; color: #333;">
                      <strong>Registration Number:</strong> ${student.regNumber}
                    </p>
                    <p style="margin: 5px 0; color: #333;">
                      <strong>School:</strong> ${schoolAdmin.name}
                    </p>
                    <p style="margin: 5px 0; color: #333;">
                      <strong>Class Level:</strong> ${student.classLevel}
                    </p>
                  </div>

                  <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
                    You can now access your student portal to view lessons, take quizzes, and track your academic progress.
                  </p>

                  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                    <p style="color: #666; font-size: 14px; margin: 0;">
                      Your login credentials will be provided by your school administrator. If you have any questions, please contact your teacher or school administrator.
                    </p>
                  </div>
                  
                  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Classika. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            `,
          });
          // console.log("Welcome email sent to student:", student.email);
        } catch (studentEmailError) {
          console.error(
            "Failed to send email to student:",
            student.email,
            studentEmailError
          );
        }
      }
    }
  } catch (error) {
    console.error("Error sending welcome emails:", error);
    // Don't throw error here - we don't want email failures to break onboarding
  }
}
