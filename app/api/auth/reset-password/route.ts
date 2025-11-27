import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Find user with this token and check expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    // OPTIONAL: Send confirmation email
    try {
      await resend.emails.send({
        from: "Classika <no-reply@mail.cexbitward.com>",
        to: user.email,
        subject: "Your Classika password has been changed",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 10px;">
              <h2 style="color: #333;">Password Changed Successfully</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>Your Classika account password has been successfully updated. If you did not make this change, please contact support immediately.</p>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 13px; color: #999;">© ${new Date().getFullYear()} Classika. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.warn("Password reset confirmation email failed:", emailError);
    }

    return NextResponse.json({
      message: "Password reset successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
