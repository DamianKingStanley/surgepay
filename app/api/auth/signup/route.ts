import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, email, password, userRole, secretKey } = await request.json();

    const isAdmin = userRole === "myadmin";

    if (isAdmin && secretKey !== process.env.ADMIN_SECRET_CODE) {
      return NextResponse.json(
        { message: "Invalid admin secret code" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password: hashed,
      userRole: isAdmin ? "admin" : "school_admin",
      verificationToken,
      verificationTokenExpires,
    });

    await newUser.save();

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/onboarding?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: "Classika <noboarding@mail.cexbitward.com>", // Replace with your domain
        to: email,
        subject: "Welcome to Classika - Complete Your Registration!",
        html: generateVerificationEmail(name, verificationUrl),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message:
          "User created successfully. Please check your email to complete registration.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateVerificationEmail(
  name: string,
  verificationUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
    }
    .header { 
      background: linear(135deg, #334039, #8BD8BD);
      padding: 30px; 
      text-align: center; 
      border-radius: 10px 10px 0 0;
    }
    .content { 
      padding: 30px; 
      background: #f9f9f9; 
      border-radius: 0 0 10px 10px;
    }
    .button { 
      display: inline-block; 
      padding: 15px 30px; 
      background: #334039; 
      color: white; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 20px 0; 
      font-weight: bold;
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      color: #666; 
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: white; margin: 0;">🎓 Classika</h1>
    <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Revolutionizing Education Management</p>
  </div>
  
  <div class="content">
    <h2>Welcome to Classika, ${name}! </h2>
    
    <p>We're thrilled to have you join our educational platform. Your account has been successfully created, and you're just one step away from accessing all the powerful features Classika has to offer.</p>
    
    <p><strong>What you can do with Classika:</strong></p>
    <ul>
      <li>✅ Manage your school profile and settings</li>
      <li>✅ Add teachers and staff members</li>
      <li>✅ Enroll students with auto-generated IDs</li>
      <li>✅ Create and manage examinations</li>
      <li>✅ Track academic progress and performance</li>
    </ul>
    
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">
        Complete Your Registration
      </a>
    </p>
    
    <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px; font-size: 12px;">
      ${verificationUrl}
    </p>
    
    <p>Welcome aboard! We can't wait to see how you transform education with Classika.</p>
    
    <p>Best regards,<br>The Classika Team</p>
  </div>
  
  <div class="footer">
    <p>© 2025 Classika. All rights reserved.</p>
    <p>If you didn't create this account, please ignore this email.</p>
  </div>
</body>
</html>
  `;
}
