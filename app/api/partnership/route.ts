// app/api/partnership/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, company, phone, partnershipType, message } =
      await req.json();

    if (!name || !email || !company || !partnershipType) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, company, and partnership type are required",
        },
        { status: 400 }
      );
    }

    // Send email to Classika
    await resend.emails.send({
      from: "Classika Partnerships <no-reply@mail.cexbitward.com>",
      to: ["partnerships@classikaedu.com", "hello@classikaedu.com"],
      subject: `New Partnership Application: ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 4px;">
          <div style="background-color: #fff; padding: 4px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #334039; margin: 0; font-size: 24px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Partnership Application</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 16px;">New Partnership Request</h2>
            
            <div style="background-color: #f0f8ff; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Company Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #333; width: 120px;"><strong>Name:</strong></td><td style="padding: 6px 0; color: #333;">${name}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #333;">${email}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Company:</strong></td><td style="padding: 6px 0; color: #333;">${company}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #333;">${phone || "Not provided"}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Partnership Type:</strong></td><td style="padding: 6px 0; color: #333;">${partnershipType}</td></tr>
              </table>
            </div>

            ${
              message
                ? `
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Message:</h3>
              <div style="background: white; padding: 12px; border-radius: 4px; border-left: 4px solid #8BD8BD;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>
            `
                : ""
            }

            <div style="border-top: 1px solid #eee; padding-top: 16px; margin-top: 20px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Please respond to this partnership inquiry within 24 hours.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    // Confirmation email to applicant
    await resend.emails.send({
      from: "Classika Partnerships <no-reply@mail.cexbitward.com>",
      to: [email],
      subject: "Partnership Application Received - Classika",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 4px;">
          <div style="background-color: #fff; padding: 4px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #334039; margin: 0; font-size: 24px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Partnership Application</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 16px;">Application Received</h2>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              Dear <strong>${name}</strong>,
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              Thank you for your interest in partnering with Classika! We have received your partnership application and our team will review it within 24 hours.
            </p>

            <div style="background-color: #e8f5e8; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Application Summary:</h3>
              <p style="margin: 8px 0; color: #333;"><strong>Company:</strong> ${company}</p>
              <p style="margin: 8px 0; color: #333;"><strong>Partnership Type:</strong> ${partnershipType}</p>
            </div>

            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              We will contact you at ${email} to discuss potential collaboration opportunities.
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
        "Partnership application submitted successfully! We'll contact you within 24 hours.",
    });
  } catch (error) {
    console.error("Partnership form error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application. Please try again.",
      },
      { status: 500 }
    );
  }
}
