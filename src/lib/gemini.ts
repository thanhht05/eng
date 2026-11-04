import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

export async function generateContentWithFallback(
  prompt: string,
  customApiKey?: string
): Promise<string> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Chưa có Gemini API Key! Hãy nhập API Key trong phần Cài đặt hoặc cấu hình GEMINI_API_KEY trong file .env.local"
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} failed, trying fallback:`, err?.message || err);
      lastError = err;
      // Continue to next fallback model
    }
  }

  throw new Error(
    lastError?.message || "Không thể tạo nội dung từ AI với tất cả các models khả dụng."
  );
}
