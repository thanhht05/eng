import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";

const DIVERSE_STRUCTURES = [
  {
    type: "Kể lại một trải nghiệm / sự việc trong quá khứ",
    grammarTarget: "Thì Quá khứ đơn (Past Simple) hoặc Quá khứ tiếp diễn",
    instruction: "Tạo một tình huống cụ thể đã xảy ra (hôm qua, tối thứ bảy, tuần trước, sáng nay...), có chi tiết sinh động.",
    example: "Hôm qua lúc tôi đang đợi xe buýt thì trời đổ mưa to, may mắn là một bạn học sinh đã cho tôi che chung ô."
  },
  {
    type: "Tình huống bất ngờ hoặc rắc rối nhỏ đời thường",
    grammarTarget: "Quá khứ đơn, Hiện tại hoàn thành, hoặc liên từ nguyên nhân - kết quả (so, because)",
    instruction: "Một tình huống thực tế thường gặp như: quên đồ, tắc đường, điện thoại hết pin, lỡ chuyến tàu, mất chìa khóa...",
    example: "Tôi để quên sạc điện thoại ở văn phòng nên tối nay tôi phải mượn của bạn cùng phòng để dùng tạm."
  },
  {
    type: "Mệnh đề đối lập / Nhượng bộ (Mặc dù... nhưng...)",
    grammarTarget: "Cấu trúc Although / Even though / Despite / But",
    instruction: "Thể hiện sự tương phản rõ ràng giữa hai vế câu.",
    example: "Mặc dù quán cà phê đó khá nhỏ và đông khách, tôi vẫn thích đến đó vì không gian rất ấm cúng."
  },
  {
    type: "Câu điều kiện / Giả định tương lai (Nếu... thì...)",
    grammarTarget: "Câu điều kiện loại 1 (If + Hiện tại đơn, will + Động từ nguyên mẫu)",
    instruction: "Kế hoạch hoặc khả năng trong tương lai phụ thuộc vào điều kiện thời tiết, tài chính hoặc thời gian.",
    example: "Nếu chiều mai trời không mưa, chúng tôi sẽ đạp xe quanh hồ và chụp một vài bức ảnh hoàng hôn."
  },
  {
    type: "Nguyên nhân & Hệ quả (Vì... nên...)",
    grammarTarget: "Liên từ Because / Since / As / So / Therefore",
    instruction: "Giải thích lý do cụ thể dẫn đến một hành động, quyết định hoặc kết quả.",
    example: "Vì tuyến đường chính đang sửa chữa nên tôi phải dậy sớm hơn 20 phút để đi đường vòng đến trường."
  },
  {
    type: "Kế hoạch & Dự định tương lai",
    grammarTarget: "Be going to, Plan to, Hope to, Would like to",
    instruction: "Một dự định thú vị sắp tới kèm lý do hoặc mục tiêu cụ thể.",
    example: "Vào kỳ nghỉ hè tới, nhóm bạn của tôi dự định sẽ thuê một căn homestay ở Đà Lạt để thư giãn."
  },
  {
    type: "So sánh hoặc Nêu quan điểm cá nhân",
    grammarTarget: "So sánh hơn (Comparative), As...as, In my opinion, Find it...",
    instruction: "So sánh hai trải nghiệm, thói quen, đồ vật hoặc nêu góc nhìn của người nói.",
    example: "Tôi thấy tự nấu ăn ở nhà vừa tiết kiệm chi phí lại vừa đảm bảo vệ sinh hơn là đi ăn ngoài hàng."
  },
  {
    type: "Hội thoại giao tiếp thực tế / Lời khuyên",
    grammarTarget: "Could you please..., Why don't we..., You should..., Would you mind...",
    instruction: "Một câu giao tiếp thực tế (hỏi đường, mua sắm, đề xuất ý kiến, hỏi han lịch sự).",
    example: "Bạn có thể chỉ giúp tôi đường đến nhà ga gần nhất được không? Tôi sợ mình sẽ bị trễ chuyến tàu lúc 5 giờ."
  },
  {
    type: "Chủ ngữ giả / Câu mô tả khách quan (It takes... / It is...)",
    grammarTarget: "It takes [time] to..., It is [adj] to..., There is/are...",
    instruction: "Không bắt đầu bằng 'Tôi', sử dụng chủ ngữ giả hoặc mô tả khách quan một hiện tượng, sự việc.",
    example: "Thường mất hơn một tiếng đồng hồ để đi từ ngoại ô vào trung tâm thành phố vào giờ cao điểm."
  },
  {
    type: "Góc nhìn về người khác (Bạn bè, người thân, đồng nghiệp)",
    grammarTarget: "Ngôi thứ ba số ít/số nhiều (He, She, They, My coworker, The neighbor...)",
    instruction: "Miêu tả thói quen, hành động hoặc phẩm chất của một người khác thay vì nói về bản thân.",
    example: "Đồng nghiệp mới của tôi rất chăm chỉ; anh ấy luôn đến công ty sớm để chuẩn bị tài liệu trước các cuộc họp."
  }
];

const PERSPECTIVES = [
  "Ngôi thứ nhất (Tôi / Chúng tôi / Gia đình tôi)",
  "Ngôi thứ ba (Một người bạn / Đồng nghiệp / Người thân / Hàng xóm)",
  "Chủ ngữ khách quan (Thời tiết / Chuyến xe / Khách sạn / Bữa ăn / Cuốn sách)",
  "Giao tiếp trực tiếp (Hỏi hoặc nhờ vả đối phương một cách lịch sự)"
];

export async function POST(req: NextRequest) {
  try {
    const { topic, level, customApiKey } = await req.json().catch(() => ({}));

    // Randomly pick a structural blueprint to guarantee variety every time
    const selectedStructure =
      DIVERSE_STRUCTURES[Math.floor(Math.random() * DIVERSE_STRUCTURES.length)];
    const selectedPerspective =
      PERSPECTIVES[Math.floor(Math.random() * PERSPECTIVES.length)];

    const prompt = `
Bạn là một chuyên gia giáo dục tiếng Anh hàng đầu cho học viên trình độ A2 - B1 (CEFR).
Nhiệm vụ: Tạo ra một câu hoặc đoạn ngắn tiếng Việt (1-2 câu, độ dài khoảng 18-35 từ) mang tính thực tế đời sống cao để học viên dịch sang tiếng Anh.

THÔNG TIN BẮT BUỘC:
- Trình độ mục tiêu: ${level || "A2-B1"}
- Chủ đề: ${topic || "Đời sống hàng ngày (Daily Life)"}
- Dạng cấu trúc yêu cầu: ${selectedStructure.type}
- Trọng tâm ngữ pháp: ${selectedStructure.grammarTarget}
- Hướng dẫn chi tiết: ${selectedStructure.instruction}
- Góc nhìn / Ngôi xưng ưu tiên: ${selectedPerspective}
- Ví dụ tham khảo về phong cách: "${selectedStructure.example}"

NGUYÊN TẮC CHỐNG LẶP LẠI (CỰC KỲ QUAN TRỌNG):
1. TUYỆT ĐỐI CẤM các cấu trúc rập khuôn nhàm chán như:
   - "Tôi thường dành [X] phút để..."
   - "Tôi thích [làm gì đó] vì..."
   - "Mỗi buổi sáng tôi thức dậy lúc..."
   - "Tôi thường [động từ] vào mỗi ngày..."
2. Câu tiếng Việt phải tự nhiên, mang hơi thở cuộc sống thật, có bối cảnh hoặc cảm xúc rõ ràng.
3. Không dùng từ ngữ quá hàn lâm, nhưng cấu trúc phải đa dạng theo đúng yêu cầu dạng cấu trúc ở trên.
4. Cung cấp 2-4 cụm từ gợi ý tiếng Anh (hints) sát nghĩa, hữu ích cho cấp độ ${level || "A2-B1"}.

Trả về ĐÚNG ĐỊNH DẠNG JSON sau (không kèm markdown ngoài JSON):
{
  "vietnamese": "Nội dung câu tiếng Việt đa dạng cấu trúc",
  "topic": "${topic || "Daily Life"}",
  "level": "${level || "A2-B1"}",
  "patternName": "${selectedStructure.type}",
  "grammarTarget": "${selectedStructure.grammarTarget}",
  "hints": ["cụm từ gợi ý 1", "cụm từ gợi ý 2", "cụm từ gợi ý 3"]
}
`;

    const text = await generateContentWithFallback(prompt, customApiKey, {
      temperature: 0.9, // High creativity to avoid repetition
    });
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
