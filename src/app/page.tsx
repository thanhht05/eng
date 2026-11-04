"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { SentencePractice } from "@/components/SentencePractice";
import { EssayPractice } from "@/components/EssayPractice";
import { soundFx } from "@/lib/sound";
import { Sparkles, Shield, Cpu, Flame, Target } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"sentence" | "essay">("sentence");
  const [apiKey, setApiKey] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Load persisted settings
    const savedKey = localStorage.getItem("engsprint_gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }

    const savedSound = localStorage.getItem("engsprint_sound_enabled");
    if (savedSound !== null) {
      const isEnabled = savedSound === "true";
      setSoundEnabled(isEnabled);
      soundFx.enabled = isEnabled;
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("engsprint_gemini_api_key", key);
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundFx.enabled = enabled;
    localStorage.setItem("engsprint_sound_enabled", String(enabled));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={handleToggleSound}
        openApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasCustomKey={Boolean(apiKey)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Subtle Welcome Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/10 p-6 md:p-8">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/20">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Luyện Viết Tiếng Anh Chuẩn CEFR A2 - B1</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {activeTab === "sentence"
                  ? "Luyện Dịch Câu Ngắn Hàng Ngày"
                  : "Luyện Viết Bài Luận & Đoạn Văn Ngắn"}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                {activeTab === "sentence"
                  ? "AI tạo tình huống tiếng Việt thực tế. Bạn dịch sang tiếng Anh và AI sẽ chấm ngữ pháp, từ vựng và đưa ra câu chuẩn bản xứ."
                  : "Viết đoạn văn ngắn 100-180 từ theo chủ đề có sẵn. Nhận đánh giá 4 tiêu chí chuẩn quốc tế kèm bài sửa chi tiết."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Powered by Gemini Flash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "sentence" ? (
          <SentencePractice
            apiKey={apiKey}
            openApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        ) : (
          <EssayPractice
            apiKey={apiKey}
            openApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">EngSprint AI</span>
            <span>•</span>
            <span>Công cụ luyện viết tiếng Anh thông minh</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              Cài đặt API Key
            </button>
            <span>•</span>
            <span>Mức độ: A2 - B1</span>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
}

