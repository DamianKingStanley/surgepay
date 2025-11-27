import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import User from "../../../models/User";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether email exists or not
      return NextResponse.json(
        { message: "If an account exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Construct reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // Send email via Resend
    await resend.emails.send({
      from: "Classika <no-reply@mail.cexbitward.com>",
      to: email,
      subject: "Reset your Classika password",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px;">
            <div style="background-color: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #334039; margin: 0; font-size: 28px; font-weight: 300;">Classika</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Education Management Platform</p>
              </div>
              
              <h2 style="color: #334039; margin-bottom: 20px;">Reset Your Password</h2>
              
              <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
                Hello ${user.name || "there"},
              </p>
              
              <p style="color: #333; line-height: 1.6; margin-bottom: 25px;">
                We received a request to reset your Classika account password. Click the button below to set a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                  style="display: inline-block; padding: 14px 32px; background-color: #334039; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
                This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </p>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  If you're having trouble clicking the button, copy and paste this URL into your browser:
                </p>
                <p style="color: #334039; font-size: 12px; word-break: break-all; margin: 5px 0 0 0;">
                  ${resetUrl}
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

    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
