import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { essayTopic, userEssay, customApiKey } = await req.json();

    if (!essayTopic || !userEssay) {
      return NextResponse.json(
        { error: "Thiếu thông tin đề bài hoặc bài viết essay" },
        { status: 400 }
      );
    }

    const prompt = `
Bạn là giám khảo tiếng Anh chuyên chấm bài luận ngắn cấp độ A2-B1.
Đề bài: "${essayTopic}"
Bài viết của học viên:
"""
${userEssay}
"""

Nhiệm vụ của bạn:
1. Đánh giá toàn diện bài viết theo 4 tiêu chí (thang điểm 10 cho mỗi tiêu chí):
   - Task Response (Đúng đề, đủ ý)
   - Coherence & Cohesion (Mạch lạc, liên kết câu)
   - Lexical Resource (Vốn từ vựng, độ chính xác)
   - Grammatical Range & Accuracy (Ngữ pháp, thì, cấu trúc câu)
2. Tính điểm tổng thể (Overall Score) trên thang 100.
3. Chỉ ra các đoạn cần sửa cụ thể (kèm giải thích tiếng Việt).
4. Viết lại bài hoàn chỉnh đã được trau chuốt (giữ nguyên ý tưởng của học viên nhưng diễn đạt tự nhiên chuẩn B1/B1+).
5. Tóm tắt điểm mạnh và điểm cần cải thiện.

Trả về ĐÚNG ĐỊNH DẠNG JSON sau:
{
  "overallScore": 82,
  "estimatedLevel": "B1",
  "summary": "Đoạn nhận xét tổng quan ngắn gọn khích lệ",
  "criteria": {
    "taskResponse": { "score": 8, "feedback": "Nhận xét" },
    "coherence": { "score": 8, "feedback": "Nhận xét" },
    "lexical": { "score": 8, "feedback": "Nhận xét" },
    "grammar": { "score": 9, "feedback": "Nhận xét" }
  },
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Điểm cần rèn thêm 1", "Điểm cần rèn thêm 2"],
  "corrections": [
    {
      "original": "cụm từ/câu gốc có lỗi",
      "replacement": "cách sửa chuẩn",
      "reason": "giải thích ngữ pháp hoặc cách dùng từ bằng tiếng Việt"
    }
  ],
  "improvedEssay": "Toàn bộ bài viết đã được sửa lại mượt mà, hay hơn."
}
`;

    const text = await generateContentWithFallback(prompt, customApiKey);
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Essay Evaluate API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Không thể chấm bài essay" },
      { status: 500 }
    );
  }
}
