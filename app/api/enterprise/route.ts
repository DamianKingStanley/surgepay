// app/api/enterprise/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const {
      companyName,
      contactName,
      email,
      phone,
      employeeCount,
      industry,
      challenge,
      message,
    } = await req.json();

    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Company name, contact name, and email are required",
        },
        { status: 400 }
      );
    }

    // Send email to Classika
    await resend.emails.send({
      from: "Classika Enterprise <no-reply@mail.cexbitward.com>",
      to: ["enterprise@classikaedu.com", "hello@classikaedu.com"],
      subject: `New Enterprise Inquiry: ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; margin: 0 auto; background-color: #f9f9f9; padding: 5px;">
          <div style="background-color: #fff; padding: 5px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #334039; margin: 0; font-size: 24px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Enterprise Inquiry</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 16px;">New Enterprise Inquiry</h2>
            
            <div style="background-color: #f0f8ff; padding: 2px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Company Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #333; width: 120px;"><strong>Company:</strong></td><td style="padding: 6px 0; color: #333;">${companyName}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Contact:</strong></td><td style="padding: 6px 0; color: #333;">${contactName}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #333;">${email}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #333;">${phone || "Not provided"}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Employees:</strong></td><td style="padding: 6px 0; color: #333;">${employeeCount || "Not specified"}</td></tr>
                <tr><td style="padding: 6px 0; color: #333;"><strong>Industry:</strong></td><td style="padding: 6px 0; color: #333;">${industry || "Not specified"}</td></tr>
              </table>
            </div>

            ${
              challenge
                ? `
            <div style="background-color: #fff3cd; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Primary Challenge:</h3>
              <p style="color: #333; margin: 0;">${challenge}</p>
            </div>
            `
                : ""
            }

            ${
              message
                ? `
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Additional Information:</h3>
              <div style="background: white; padding: 12px; border-radius: 4px; border-left: 4px solid #8BD8BD;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>
            `
                : ""
            }

            <div style="border-top: 1px solid #eee; padding-top: 16px; margin-top: 20px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Enterprise inquiries require priority handling. Please respond within 2 hours.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    // Confirmation email to enterprise
    await resend.emails.send({
      from: "Classika Enterprise <no-reply@mail.cexbitward.com>",
      to: [email],
      subject: "Enterprise Inquiry Received - Classika",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 5px;">
          <div style="background-color: #fff; padding: 5px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #334039; margin: 0; font-size: 24px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Enterprise Solutions</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 16px;">Inquiry Received</h2>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              Dear <strong>${contactName}</strong>,
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              Thank you for your enterprise inquiry from <strong>${companyName}</strong>! Our enterprise solutions team will contact you within 2 hours to discuss your specific needs.
            </p>

            <div style="background-color: #e8f5e8; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <h3 style="color: #334039; margin: 0 0 12px 0;">Enterprise Solutions Include:</h3>
              <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Custom platform integration</li>
                <li>Dedicated account management</li>
                <li>Advanced analytics and reporting</li>
                <li>API access and custom development</li>
                <li>White-label solutions</li>
                <li>Enterprise-grade security</li>
              </ul>
            </div>

            <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
              We look forward to helping ${companyName} achieve its educational technology goals.
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
        "Enterprise inquiry submitted successfully! Our team will contact you within 2 hours.",
    });
  } catch (error) {
    console.error("Enterprise form error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit inquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}
