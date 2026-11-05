"use client";

import React from "react";
import { Sparkles, Key, Volume2, VolumeX, BookOpen, PenTool, History } from "lucide-react";
import { soundFx } from "@/lib/sound";

interface NavbarProps {
  activeTab: "sentence" | "essay";
  setActiveTab: (tab: "sentence" | "essay") => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  openApiKeyModal: () => void;
  hasCustomKey: boolean;
  openHistoryDrawer: () => void;
  mistakesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  openApiKeyModal,
  hasCustomKey,
  openHistoryDrawer,
  mistakesCount = 0,
}) => {
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundFx.enabled = nextState;
    if (nextState) {
      soundFx.playKeyClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-sky-300 to-pink-400 bg-clip-text text-transparent">
                EngSprint AI
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                A2-B1
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Luyện viết Tiếng Anh với Gemini Flash
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              setActiveTab("sentence");
              soundFx.playKeyClick();
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "sentence"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Dịch Câu Ngắn</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("essay");
              soundFx.playKeyClick();
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "essay"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Viết Bài Luận</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* History & Mistake Notebook */}
          <button
            onClick={openHistoryDrawer}
            title="Xem lịch sử và sổ tay câu làm sai"
            className="relative flex items-center space-x-1.5 text-xs px-3 py-2 rounded-lg border bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 transition-all"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Lịch sử & Lỗi sai</span>
            {mistakesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {mistakesCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Tắt âm thanh gõ phím" : "Bật âm thanh gõ phím"}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? "bg-slate-800/80 border-slate-700 text-indigo-400 hover:bg-slate-800"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={openApiKeyModal}
            className={`flex items-center space-x-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${
              hasCustomKey
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasCustomKey ? "Key: Đã lưu" : "Cấu hình API Key"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
