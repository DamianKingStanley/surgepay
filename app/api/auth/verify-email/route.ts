import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import User from "../../../models/User";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // OPTIONAL: Send confirmation email
    try {
      await resend.emails.send({
        from: "Classika <no-reply@mail.cexbitward.com>",
        to: user.email,
        subject: "Your Classika account is verified",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 10px;">
              <h2 style="color: #333;">Welcome to Classika!</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>Your email has been successfully verified. You can now access all Classika features and start exploring the platform.</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" 
                style="display: inline-block; margin-top: 15px; padding: 12px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
                Go to Login
              </a>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 13px; color: #999;">© ${new Date().getFullYear()} Classika. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.warn("Verification confirmation email failed:", emailError);
    }

    return NextResponse.json(
      { message: "Email verified successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
