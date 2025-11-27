// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, school, role, message } = await req.json();

    // Validate required fields
    if (!name || !email || !school || !role || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Send email to Classika team
    await resend.emails.send({
      from: "Classika Contact Form <no-reply@mail.cexbitward.com>",
      to: ["damianstanley76@gmail.com"], // Replace with actual Classika emails
      subject: `New Contact Message from ${name} - ${school}`,
      html: `
        <div style="font-family: Arial, sans-serif; margin: 0 auto; background-color: #f9f9f9; padding: 5px;">
          <div style="background-color: #fff; padding: 2px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #334039; margin: 0; font-size: 28px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Education Management Platform</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334039; margin: 0 0 15px 0;">Contact Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #333; width: 120px;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;"><strong>School:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${school}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;"><strong>Role:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${role}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334039; margin: 0 0 15px 0;">Message:</h3>
              <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #8BD8BD;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Action Required:</strong> Please respond to this inquiry within 4 hours.
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This message was sent from the Classika website contact form.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    // Confirmation email to user
    await resend.emails.send({
      from: "Classika <no-reply@mail.cexbitward.com>",
      to: [email],
      subject: "Thank You for Contacting Classika",
      html: `
        <div style="font-family: Arial, sans-serif; margin: 0 auto; background-color: #f9f9f9; padding: 5px;">
          <div style="background-color: #fff; padding: 2px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #334039; margin: 0; font-size: 28px; font-weight: 300;">Classika</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Education Management Platform</p>
            </div>
            
            <h2 style="color: #334039; margin-bottom: 20px;">Thank You for Contacting Us!</h2>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong>${name}</strong>,
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Thank you for reaching out to Classika! We have received your message and our team will get back to you within <strong>4 hours</strong> during business days.
            </p>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #334039; margin: 0 0 15px 0;">Your Inquiry Summary:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #333; width: 100px;"><strong>School:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${school}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333;"><strong>Role:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${role}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #334039; margin: 0 0 15px 0;">What Happens Next?</h3>
              <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Our education specialist will review your inquiry</li>
                <li>We'll contact you to understand your specific needs</li>
                <li>Schedule a personalized demo if requested</li>
                <li>Provide pricing and implementation timeline</li>
              </ul>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Need immediate assistance?</strong> Call us at <strong>+2349081090810</strong> during business hours.
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Classika. All rights reserved.<br>
                Transforming Education Through Technology
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message:
        "Message sent successfully! We'll get back to you within 4 hours.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to send message. Please try again or contact us directly.",
      },
      { status: 500 }
    );
  }
}
