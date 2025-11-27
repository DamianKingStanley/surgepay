/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/school-partnership/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const {
      schoolName,
      contactName,
      email,
      phone,
      studentCount,
      currentSystem,
      interests,
      message,
    } = await req.json();

    if (!schoolName || !contactName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "School name, contact name, and email are required",
        },
        { status: 400 }
      );
    }

    // Send email to Classika
    await resend.emails.send({
      from: "Classika School Partnerships <no-reply@mail.cexbitward.com>",
      to: ["schools@classikaedu.com", "hello@classikaedu.com"],
      subject: `New School Partnership: ${schoolName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 4px;">
          <div style="background-color: #fff; padding: 4px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #334039; margin: 0; font-size: 24px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">School Partnership Inquiry</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 16px;">New School Partnership Request</h2>
            
            <div style="background-color: #f0f8ff; padding: 6px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">School Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #333; width: 120px;"><strong>School:</strong></td><td style="padding: 6px 0; color: #333;">${schoolName}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Contact:</strong></td><td style="padding: 6px 0; color: #333;">${contactName}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #333;">${email}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #333;">${phone || "Not provided"}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Students:</strong></td><td style="padding: 6px 0; color: #333;">${studentCount || "Not specified"}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Current System:</strong></td><td style="padding: 6px 0; color: #333;">${currentSystem || "Not specified"}</td></tr>
              </table>
            </div>

            ${
              interests.length > 0
                ? `
            <div style="background-color: #fff3cd; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Areas of Interest:</h3>
              <ul style="color: #333; margin: 0; padding-left: 20px;">
                ${interests.map((interest: any) => `<li>${interest}</li>`).join("")}
              </ul>
            </div>
            `
                : ""
            }

            ${
              message
                ? `
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Additional Message:</h3>
              <div style="background: white; padding: 12px; border-radius: 4px; border-left: 4px solid #8BD8BD;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>
            `
                : ""
            }

            <div style="border-top: 1px solid #eee; padding-top: 16px; margin-top: 20px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Please contact this school within 4 hours.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    // Confirmation email to school
    await resend.emails.send({
      from: "Classika School Partnerships <no-reply@mail.cexbitward.com>",
      to: [email],
      subject: "School Partnership Inquiry Received - Classika",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 4px;">
          <div style="background-color: #fff; padding: 4px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #334039; margin: 0; font-size: 24px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">School Partnership</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 16px;">Inquiry Received</h2>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              Dear <strong>${contactName}</strong>,
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              Thank you for your interest in Classika for <strong>${schoolName}</strong>! We have received your inquiry and our education specialist will contact you within 4 hours.
            </p>

            <div style="background-color: #e8f5e8; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Next Steps:</h3>
              <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Personalized consultation call</li>
                <li>Platform demonstration</li>
                <li>Customized pricing proposal</li>
                <li>Implementation planning</li>
              </ul>
            </div>

            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              We look forward to helping ${schoolName} transform its educational experience!
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

    return NextResponse.json({
      success: true,
      message:
        "School partnership inquiry submitted successfully! We'll contact you within 4 hours.",
    });
  } catch (error) {
    console.error("School partnership form error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit inquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}
