/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    const filename = searchParams.get("filename") || "document";

    if (!publicId) {
      return NextResponse.json(
        { error: "publicId is required" },
        { status: 400 }
      );
    }

    // Generate a signed download URL that expires in 1 hour
    const downloadUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      flags: "attachment", // Forces download
      sign_url: true, // Create signed URL
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      attachment: `${filename}.pdf`, // Suggested filename for download
    });

    // Redirect to the signed download URL
    return NextResponse.redirect(downloadUrl);
  } catch (error: any) {
    console.error("Download CV error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
