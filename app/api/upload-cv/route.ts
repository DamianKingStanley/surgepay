/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/upload-cv/route.ts
// import { NextResponse } from "next/server";
// import { v2 as cloudinary } from "cloudinary";

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(req: Request) {
//   try {
//     const { fileUrl } = await req.json();

//     if (!fileUrl) {
//       return NextResponse.json(
//         { error: "fileUrl is required" },
//         { status: 400 }
//       );
//     }

//     // Upload to Cloudinary
//     const uploadResult = await cloudinary.uploader.upload(fileUrl, {
//       folder: "job-applications/cvs",
//       resource_type: "auto",
//       allowed_formats: ["pdf", "doc", "docx"],
//       format: "pdf", // Convert to PDF if possible
//       access_mode: "authenticated", // 👈 this is important
//     });

//     return NextResponse.json({
//       success: true,
//       secure_url: uploadResult.secure_url,
//       public_id: uploadResult.public_id,
//     });
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: "Failed to upload CV: " + error.message },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// ✅ Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//
// 📤 UPLOAD ROUTE
//
export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: "fileUrl is required" },
        { status: 400 }
      );
    }

    // ✅ Upload to Cloudinary with secure, private access
    const uploadResult = await cloudinary.uploader.upload(fileUrl, {
      folder: "job-applications/cvs",
      resource_type: "auto",
      allowed_formats: ["pdf", "doc", "docx"],
      format: "pdf", // convert if possible
      access_mode: "public",
    });

    return NextResponse.json({
      success: true,
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error("Upload CV error:", error);
    return NextResponse.json(
      { error: "Failed to upload CV: " + error.message },
      { status: 500 }
    );
  }
}
