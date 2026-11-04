import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EngSprint - Luyện viết Tiếng Anh A2-B1 với AI",
  description: "Trang web luyện viết câu và essay tiếng Anh trình độ A2-B1 có AI chấm bài và sửa lỗi chi tiết.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

