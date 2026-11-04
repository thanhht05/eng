# EngSprint AI - Luyện Viết Tiếng Anh A2 - B1

Website luyện viết tiếng Anh (Dịch câu ngắn & Viết bài luận) tích hợp AI Gemini Flash chấm điểm và sửa lỗi chi tiết, giao diện hiện đại với hiệu ứng gõ phím.

---

## 🚀 Các tính năng chính

### 1. Dịch câu ngắn (Sentence Translation)
- **Tạo câu theo trình độ**: AI tự sinh câu/đoạn tiếng Việt (1-2 câu, 15-30 từ) tự nhiên theo nhiều chủ đề (Đời sống hàng ngày, Du lịch, Mua sắm, v.v.).
- **Gợi ý từ vựng (Hints)**: Hỗ trợ người học khi bí từ.
- **AI chấm bài & Bắt lỗi ngữ pháp**:
  - Chấm điểm trên thang 100 và đánh giá chuẩn CEFR (A2 / B1).
  - Phân tích chi tiết lỗi ngữ pháp (Lỗi sai -> Cách sửa -> Giải thích).
  - Gợi ý nâng cấp từ vựng tự nhiên hơn.
  - Cung cấp **2 câu mẫu chuẩn bản xứ** (1 câu chuẩn A2-B1 và 1 câu nâng cao).

### 2. Viết bài luận ngắn (Short Essay Writing)
- **Tạo đề bài thông minh**: Đề bài kèm dàn ý 3 câu hỏi gợi ý và danh sách từ vựng trọng tâm.
- **Bộ đếm từ mục tiêu**: Realtime counter theo dõi mục tiêu 100-180 từ chuẩn A2-B1.
- **Đánh giá 4 tiêu chí quốc tế**:
  - Task Response (Đúng đề & đủ ý)
  - Coherence & Cohesion (Mạch lạc & liên kết câu)
  - Lexical Resource (Từ vựng)
  - Grammatical Range & Accuracy (Ngữ pháp)
- **Sửa chi tiết từng câu** & **Viết lại toàn bộ bài mẫu trau chuốt (Model Version)** kèm nút Copy tiện lợi.

### 3. Giao diện & Trải nghiệm (UI/UX)
- Hiệu ứng âm thanh gõ phím máy cơ tự nhiên (Web Audio API Synthesizer - bật/tắt tùy chọn).
- Hiệu ứng pháo hoa ăn mừng (Confetti) khi nộp bài hoặc đạt điểm cao (≥ 80).
- Thiết kế Dark Mode hiện đại, tối giản.
- Phím tắt tiện lợi: `Ctrl + Enter` (hoặc `Cmd + Enter`) để nộp bài ngay.
- Cấu hình API Key linh hoạt: Nhập trực tiếp trên giao diện web (lưu vào trình duyệt) hoặc lưu trong file `.env.local`.

---

## 🛠 Hướng dẫn chạy dự án

### Bước 1: Khởi động máy chủ dev
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

### Bước 2: Cấu hình Gemini API Key
Bạn có thể cấu hình theo 1 trong 2 cách:
1. **Cách 1 (Nhanh nhất)**: Mở web lên, click nút **"Cấu hình API Key"** góc trên cùng bên phải và dán API key của bạn vào.
2. **Cách 2**: Điền key vào file `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
*(Lấy API Key hoàn toàn miễn phí tại [Google AI Studio](https://aistudio.google.com/app/apikey))*

