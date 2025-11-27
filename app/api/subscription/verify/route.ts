/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import User from "../../../models/User"; // still used for school admin
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FLW_SECRET_KEY = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY as string;

// Helper function to calculate expiry date based on plan type
function calculateExpiryDate(
  planType: string,
  startDate: Date = new Date()
): Date {
  const expiryDate = new Date(startDate);

  switch (planType) {
    case "term":
      // School terms are typically 3-4 months, but let's be precise
      // Assuming 13 weeks (approximately 3 months) for a standard term
      expiryDate.setDate(expiryDate.getDate() + 13 * 7); // 13 weeks
      break;

    case "annual":
      // Exactly 1 year from start date
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      break;

    default:
      // Default to 3 months for term plans
      expiryDate.setMonth(expiryDate.getMonth() + 3);
  }

  return expiryDate;
}

// Helper function to set plan limits based on plan name
function getPlanLimits(planName: string) {
  const limits = {
    Free: {
      teachers: 2,
      students: 5,
      quizzes: 2,
      attendance: 2,
      lessonnotes: 2,
      timetable: 2,
      exams: 2,
      jobs: 3,
    },
    Basic: {
      teachers: 5,
      students: 50,
      quizzes: 10,
      attendance: 20,
      lessonnotes: 20,
      exams: 10,
      timetable: 10,
      jobs: 10,
    },
    Standard: {
      teachers: 20,
      students: 200,
      quizzes: 50,
      attendance: 100,
      lessonnotes: 100,
      exams: 50,
      timetable: 25,
      jobs: 25,
    },
    Premium: {
      teachers: 50,
      students: 500,
      quizzes: 100,
      attendance: 120,
      lessonnotes: 200,
      exams: 100,
      timetable: 50,
      jobs: 50,
    },
    Flex: {
      teachers: 9999, // Unlimited
      students: 9999, // Unlimited
      quizzes: 9999, // Unlimited
      attendance: 9999, // Unlimited
      lessonnotes: 9999, // Unlimited
      exams: 9999, // Unlimited
      timetable: 9999, // Unlimited
      jobs: 9999, // Unlimited
    },
  };

  return limits[planName as keyof typeof limits] || limits.Free;
}

async function sendSubscriptionEmail(school: any, subscription: any) {
  try {
    await resend.emails.send({
      from: "Classika <no-reply@mail.cexbitward.com>",
      to: school.email,
      subject: `Classika Subscription Activated - ${subscription.planName} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #334039; margin: 0; font-size: 24px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Education Management Platform</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 16px;">Subscription Activated!</h2>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              Dear <strong>${school.name}</strong>,
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              Your Classika subscription has been successfully activated. You now have access to all the features of your ${subscription.planName} plan.
            </p>

            <div style="background-color: #f0f8ff; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Subscription Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #333; width: 120px;"><strong>Plan:</strong></td>
                  <td style="padding: 6px 0; color: #333;">${subscription.planName} (${subscription.planType})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #333;"><strong>Status:</strong></td>
                  <td style="padding: 6px 0; color: #333;">Active</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #333;"><strong>Start Date:</strong></td>
                  <td style="padding: 6px 0; color: #333;">${new Date(subscription.startDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #333;"><strong>Expiry Date:</strong></td>
                  <td style="padding: 6px 0; color: #333;">${new Date(subscription.expiryDate).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e8f5e8; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Plan Limits:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #333;">Teachers:</td>
                  <td style="padding: 4px 0; color: #333;">${subscription.limits.teachers}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #333;">Students:</td>
                  <td style="padding: 4px 0; color: #333;">${subscription.limits.students}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #333;">Quizzes:</td>
                  <td style="padding: 4px 0; color: #333;">${subscription.limits.quizzes}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #333;">Lesson Notes:</td>
                  <td style="padding: 4px 0; color: #333;">${subscription.limits.lessonnotes}</td>
                </tr>
              </table>
            </div>

            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              You can now access all features of your plan from your dashboard. If you have any questions, please contact our support team.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 16px; margin-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Classika. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {}
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

    const { transactionId, actualSchoolId: requestedSchoolId } =
      await req.json();

    const schoolIdToUse = requestedSchoolId ?? actualSchoolId;

    if (!transactionId || !schoolIdToUse) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Verify payment with Flutterwave
    const verifyResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
      }
    );

    const verifyData = await verifyResponse.json();
    if (verifyData.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }
    const school = await User.findById(schoolIdToUse);
    // ✅ Activate the subscription
    // const school = await User.findById(actualSchoolId);
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // const planType = school.subscription?.planType;
    // const expiryDate = new Date();

    // if (planType === "term") {
    //   expiryDate.setMonth(expiryDate.getMonth() + 3);
    // } else if (planType === "annual") {
    //   expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    // }

    const planType = school.subscription?.planType || "term";
    const planName = school.subscription?.planName || "Basic";
    const startDate = new Date();
    const expiryDate = calculateExpiryDate(planType, startDate);
    const planLimits = getPlanLimits(planName);

    // school.subscription.status = "active";
    // school.subscription.startDate = new Date();
    // school.subscription.expiryDate = expiryDate;

    // Update subscription with proper dates and limits
    school.subscription = {
      ...school.subscription,
      planName,
      planType,
      amount: verifyData.data.amount || school.subscription?.amount || 0,
      status: "active",
      startDate: startDate,
      expiryDate: expiryDate,
      txRef: verifyData.data.tx_ref || school.subscription?.txRef,
      limits: planLimits,
    };
    await school.save();

    // return NextResponse.json({
    //   success: true,
    //   message: "Subscription activated successfully",
    //   subscription: school.subscription,
    // });

    // Send subscription confirmation email
    await sendSubscriptionEmail(school, school.subscription);

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
      subscription: {
        planName: school.subscription.planName,
        planType: school.subscription.planType,
        status: school.subscription.status,
        startDate: school.subscription.startDate,
        expiryDate: school.subscription.expiryDate,
        limits: school.subscription.limits,
      },
    });
  } catch (err: any) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
