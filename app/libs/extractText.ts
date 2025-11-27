/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pdf from "pdf-parse";

import mammoth from "mammoth";
import Papa from "papaparse";

export async function extractTextFromFile(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  try {
    if (fileType.endsWith(".pdf")) {
      const data = await (pdf as any)(buffer);

      return data.text;
    }

    if (fileType.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    if (fileType.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      const parsed = Papa.parse<string[]>(text, { header: false });

      console.log(parsed.data);

      // Ensure parsed.data is an array of arrays
      return parsed.data
        .map((row) => (Array.isArray(row) ? row.join(" ") : ""))
        .join("\n");
    }

    return "";
  } catch (error) {
    console.error("❌ Error extracting text:", error);
    return "";
  }
}
