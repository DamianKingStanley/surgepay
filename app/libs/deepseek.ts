/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export async function parseDocumentToQuestions(fileUrl: string) {
  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that extracts quiz questions from documents. Respond ONLY with valid JSON — no explanations, no markdown, no text outside JSON.",
          },
          {
            role: "user",
            content: `Extract all quiz questions, options, and correct answers from this file: ${fileUrl}.
Return strictly as a JSON array in this exact format:
[
  {
    "text": "string", 
    "type": "multiple_choice", 
    "options": ["A", "B", "C", "D"],
    "correct": "string",
    "marks": 1
  }
]`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices?.[0]?.message?.content?.trim() || "[]";

    // Ensure clean JSON output
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("❌ JSON parse failed. Raw output:", text);
      parsed = [];
    }

    // 🧠 Normalize DeepSeek's response if structure differs
    const normalized = parsed.map((q: any) => ({
      text: q.text || q.question || "",
      type: q.type || "multiple_choice",
      options: q.options || q.choices || [],
      correct: q.correct || q.answer || "",
      marks: q.marks || 1,
    }));

    return normalized;
  } catch (error) {
    console.error("DeepSeek parse error:", error);
    return [];
  }
}
