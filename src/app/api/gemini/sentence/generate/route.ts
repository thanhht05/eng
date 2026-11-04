import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { topic, level, customApiKey } = await req.json().catch(() => ({}));

    const prompt = `
Bạn là một giáo viên tiếng Anh chuyên nghiệp cho người học trình độ A2 - B1 (CEFR).
Nhiệm vụ: Tạo ra một câu hoặc đoạn ngắn tiếng Việt (1-2 câu, độ dài khoảng 15-30 từ) tự nhiên, thường gặp trong đời sống hàng ngày, để học viên dịch sang tiếng Anh.

Yêu cầu:
- Trình độ: ${level || "A2-B1"}
- Chủ đề: ${topic || "Đời sống hàng ngày (Daily Life)"}
- Câu tiếng Việt phải tự nhiên, không dịch máy, có cấu trúc ngữ pháp vừa sức cho A2-B1.
- Đưa ra 2-4 gợi ý từ vựng/cụm từ tiếng Anh (hints) để giúp học viên nếu bị bí từ.

Trả về kết quả ĐÚNG ĐỊNH DẠNG JSON sau (không kèm markdown):
{
  "vietnamese": "Đoạn tiếng Việt 1-2 câu",
  "topic": "${topic || "Daily Life"}",
  "level": "${level || "A2-B1"}",
  "hints": ["cụm từ 1", "cụm từ 2", "cụm từ 3"]
}
`;

    const text = await generateContentWithFallback(prompt, customApiKey);
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Sentence Generate API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Không thể tạo câu luyện tập" },
      { status: 500 }
    );
  }
}
