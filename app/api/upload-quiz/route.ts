// app/api/upload-quiz/route.ts
import { NextResponse } from "next/server";
import { uploadToCloudinary } from "../../libs/cloudinary";
import { parseDocumentToQuestions } from "../../libs/deepseek";
import { extractTextFromFile } from "../../libs/extractText";

export const runtime = "nodejs"; // Important for file uploads in Next.js 14+

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = file.name;
    const fileType = filename.toLowerCase();

    // ✅ Upload to Cloudinary
    const cloudinaryRes = (await uploadToCloudinary(buffer, filename)) as {
      secure_url: string;
    };

    // ✅ Extract text content from file
    const extractedText = await extractTextFromFile(buffer, fileType);

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Failed to extract text from file" },
        { status: 400 }
      );
    }

    // ✅ Send extracted text to DeepSeek for parsing
    const questions = await parseDocumentToQuestions(extractedText);

    return NextResponse.json({
      message: "File uploaded and parsed successfully",
      fileUrl: cloudinaryRes.secure_url,
      questions,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload or parse failed" },
      { status: 500 }
    );
  }
}
