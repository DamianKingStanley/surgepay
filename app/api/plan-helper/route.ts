/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/plan-helper/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "../../libs/authOptions";
import { connectToDatabase } from "../../libs/mongodb";
import User from "../../models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { answers, recommendedPlan } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    // Get user info
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save answers to user profile
    user.planHelperAnswers = answers;
    await user.save();

    // Send email to school (user)
    try {
      await resend.emails.send({
        from: "Classika <no-reply@mail.cexbitward.com>",
        to: user.email,
        subject: "Your Personalized Plan Recommendation - Classika",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #334039;">Thank You for Your Interest in Classika!</h2>
            <p>We've received your plan helper responses and here's your personalized recommendation:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334039; margin-bottom: 15px;">Recommended Plan: ${recommendedPlan}</h3>
              <p>Based on your responses, this plan best fits your school's needs.</p>
            </div>

            <div style="margin: 20px 0;">
              <h4 style="color: #334039;">Your Responses:</h4>
              <ul>
                ${answers
                  .map(
                    (answer: any) => `
                  <li><strong>${answer.question}:</strong> ${answer.answer}</li>
                `
                  )
                  .join("")}
              </ul>
            </div>

            <p>Our team will review your requirements and get back to you within 24 hours to discuss the best solution for your school.</p>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #2d5016;">
                <strong>Next Steps:</strong> We'll contact you shortly to discuss your customized plan and answer any questions you may have.
              </p>
            </div>

            <p>Best regards,<br>The Classika Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.warn("Failed to send user email:", emailError);
    }

    // Send notification to admin/sales team
    try {
      await resend.emails.send({
        from: "Classika Plan Helper <no-reply@mail.cexbitward.com>",
        to: "sales@classikaedu.com", // Replace with your sales email
        subject: `New Plan Helper Submission - ${user.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #334039;">New Plan Helper Submission</h2>
            
            <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="color: #334039; margin: 0;">School Information</h3>
              <p><strong>School:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Recommended Plan:</strong> ${recommendedPlan}</p>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4 style="color: #334039; margin-bottom: 10px;">Plan Helper Responses:</h4>
              <ul>
                ${answers
                  .map(
                    (answer: any) => `
                  <li><strong>${answer.question}:</strong> ${answer.answer}</li>
                `
                  )
                  .join("")}
              </ul>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Action Required:</strong> Please contact ${user.name} within 24 hours to discuss their customized plan requirements.
              </p>
            </div>
          </div>
        `,
      });
    } catch (adminEmailError) {
      console.warn("Failed to send admin email:", adminEmailError);
    }

    return NextResponse.json({
      success: true,
      message: "Plan helper submitted successfully. We'll contact you shortly!",
      recommendedPlan,
    });
  } catch (error: any) {
    console.error("Plan helper error:", error);
    return NextResponse.json(
      { error: "Failed to submit plan helper" },
      { status: 500 }
    );
  }
}
