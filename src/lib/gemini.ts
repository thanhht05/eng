import { GoogleGenerativeAI } from "@google/generative-ai";

// Ưu tiên các model siêu tốc (Flash-Lite) trước để phản hồi trong dưới 1 giây
const FAST_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-lite-latest",
];

export async function generateContentWithFallback(
  prompt: string,
  customApiKey?: string,
  options?: { temperature?: number; topP?: number }
): Promise<string> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Chưa có Gemini API Key! Hãy nhập API Key trong phần Cài đặt hoặc cấu hình GEMINI_API_KEY trong file .env.local"
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of FAST_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options?.temperature ?? 0.8,
          topP: options?.topP ?? 0.95,
          responseMimeType: "application/json",
        },
      });

      // Tạo timeout 6s cho mỗi model để fail-fast nếu Google bị nghẽn
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout 6s cho model ${modelName}`)), 6000)
      );

      const generatePromise = model.generateContent(prompt).then((res) => res.response.text());

      const text = await Promise.race([generatePromise, timeoutPromise]);
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Speed Optimization] Model ${modelName} bỏ qua, chuyển model kế tiếp:`, err?.message || err);
      lastError = err;
      // Chuyển ngay lập tức sang model dự phòng
    }
  }

  throw new Error(
    lastError?.message || "Không thể tạo nội dung từ AI. Vui lòng kiểm tra lại kết nối mạng hoặc API Key."
  );
}
