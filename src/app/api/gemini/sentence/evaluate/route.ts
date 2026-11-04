import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { vietnamese, userEnglish, level, customApiKey } = await req.json();

    if (!vietnamese || !userEnglish) {
      return NextResponse.json(
        { error: "Thiếu câu gốc tiếng Việt hoặc bản dịch tiếng Anh" },
        { status: 400 }
      );
    }

    const prompt = `
Bạn là một giáo viên tiếng Anh nhiệt huyết, chấm bài dịch tiếng Anh của học viên trình độ A2-B1.

Thông tin bài tập:
- Câu gốc tiếng Việt: "${vietnamese}"
- Bản dịch của học viên: "${userEnglish}"
- Mục tiêu trình độ: ${level || "A2-B1"}

Nhiệm vụ của bạn:
1. Chấm điểm trên thang 100 dựa trên: Đúng nghĩa, Đúng ngữ pháp, Dùng từ tự nhiên, Phù hợp trình độ A2-B1.
2. Nhận xét ngắn gọn, khích lệ và giải thích dễ hiểu bằng tiếng Việt.
3. Chỉ ra các lỗi ngữ pháp cụ thể (nếu có): từ bị sai, sửa thành gì, lý do.
4. Đưa ra gợi ý nâng cấp từ vựng nếu có từ dùng chưa tự nhiên.
5. Cung cấp 2 câu mẫu chuẩn: 
   - 1 câu chuẩn mộc mạc trình độ A2-B1.
   - 1 câu tự nhiên bản xứ hơn (Native/B1+).

Trả về ĐÚNG ĐỊNH DẠNG JSON sau:
{
  "score": 85,
  "levelAchieved": "A2" hoặc "B1" hoặc "Below A2",
  "overallFeedback": "Lời nhận xét chi tiết bằng tiếng Việt",
  "modelAnswers": [
    {
      "type": "Chuẩn A2-B1",
      "sentence": "I usually wake up at 6 a.m. and jog around the park before work."
    },
    {
      "type": "Tự nhiên bản xứ (Advanced)",
      "sentence": "I tend to get up at 6 in the morning to go for a run in the park before heading to work."
    }
  ],
  "grammarErrors": [
    {
      "mistake": "từ hoặc cụm từ bị sai",
      "correction": "cách sửa đúng",
      "explanation": "giải thích ngữ pháp bằng tiếng Việt"
    }
  ],
  "vocabularySuggestions": [
    {
      "original": "từ học viên dùng",
      "better": "từ/cụm từ hay hơn",
      "reason": "lý do gợi ý bằng tiếng Việt"
    }
  ]
}
`;

    const text = await generateContentWithFallback(prompt, customApiKey);
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Sentence Evaluate API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Không thể chấm câu dịch" },
      { status: 500 }
    );
  }
}
