import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { category, customApiKey } = await req.json().catch(() => ({}));

    const prompt = `
Bạn là giáo viên hướng dẫn viết luận tiếng Anh cho người mới học ở trình độ A2-B1 (độ dài đoạn văn 100-180 từ).
Chủ đề thể loại: ${category || "Đời sống, sở thích, kế hoạch tương lai hoặc quan điểm đơn giản"}.

Nhiệm vụ:
Tạo 1 đề bài viết luận ngắn (Short Essay / Paragraph Writing) thiết thực, lôi cuốn, dễ phát triển ý.

Trả về ĐÚNG ĐỊNH DẠNG JSON sau:
{
  "title": "Tên chủ đề tiếng Anh (VD: Describe Your Favorite Season)",
  "titleVi": "Tên chủ đề tiếng Việt (VD: Miêu tả mùa bạn yêu thích nhất trong năm)",
  "description": "Hướng dẫn cụ thể về bài viết bằng cả tiếng Việt và tiếng Anh",
  "minWords": 100,
  "maxWords": 180,
  "guidingQuestions": [
    "Câu hỏi gợi ý 1 (kèm giải thích tiếng Việt)",
    "Câu hỏi gợi ý 2 (kèm giải thích tiếng Việt)",
    "Câu hỏi gợi ý 3 (kèm giải thích tiếng Việt)"
  ],
  "usefulVocabulary": [
    { "word": "từ/cụm từ 1", "meaning": "nghĩa tiếng Việt" },
    { "word": "từ/cụm từ 2", "meaning": "nghĩa tiếng Việt" },
    { "word": "từ/cụm từ 3", "meaning": "nghĩa tiếng Việt" },
    { "word": "từ/cụm từ 4", "meaning": "nghĩa tiếng Việt" }
  ]
}
`;

    const text = await generateContentWithFallback(prompt, customApiKey);
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Essay Generate API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Không thể tạo đề bài essay" },
      { status: 500 }
    );
  }
}
