"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  History,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  TrendingUp,
  Trash2,
  Sparkles,
  ArrowRight,
  BookOpen,
  PenTool,
} from "lucide-react";
import { PracticeRecord, getPracticeHistory, clearHistory } from "@/lib/history";
import { soundFx } from "@/lib/sound";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPracticeSimilar: (record: PracticeRecord) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onPracticeSimilar,
}) => {
  const [history, setHistory] = useState<PracticeRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "mistakes">("mistakes");

  useEffect(() => {
    if (isOpen) {
      setHistory(getPracticeHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mistakesCount = history.filter((h) => h.isMistake && !h.mastered).length;
  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length)
      : 0;

  const filteredList =
    filter === "mistakes"
      ? history.filter((h) => h.isMistake && !h.mastered)
      : history;

  const handleClear = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử luyện tập?")) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Lịch sử & Sổ tay lỗi sai</h3>
              <p className="text-xs text-slate-400">
                Ôn luyện và tạo câu tương tự cho các lỗi sai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/70 border-b border-slate-800 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Đã luyện</span>
            <span className="text-base font-bold text-white">{history.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Điểm TB</span>
            <span className="text-base font-bold text-indigo-400">{avgScore} / 100</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Cần sửa lại</span>
            <span className="text-base font-bold text-rose-400">{mistakesCount} câu</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setFilter("mistakes");
                soundFx.playKeyClick();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === "mistakes"
                  ? "bg-rose-600/90 text-white shadow-md shadow-rose-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Cần luyện lại ({mistakesCount})
            </button>
            <button
              onClick={() => {
                setFilter("all");
                soundFx.playKeyClick();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tất cả ({history.length})
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center space-x-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-500">
              <CheckCircle className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
              <p className="font-medium text-slate-300">
                {filter === "mistakes"
                  ? "Tuyệt vời! Bạn không còn câu nào cần sửa lại."
                  : "Chưa có lịch sử làm bài nào."}
              </p>
              <p className="text-xs mt-1 text-slate-500">
                Các bài làm và lỗi sai sẽ được tự động lưu lại tại đây.
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isMistake && !item.mastered
                    ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header item */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        item.score >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.score >= 60
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {item.score}/100
                    </span>
                    <span className="text-slate-400">{item.topic}</span>
                    {item.type === "sentence" ? (
                      <span className="text-slate-500 flex items-center space-x-1">
                        <PenTool className="w-3 h-3" />
                        <span>Dịch câu</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Essay</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Pattern & target tag */}
                {item.patternName && (
                  <div className="mb-2">
                    <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                      🎯 Cấu trúc: {item.patternName}
                    </span>
                  </div>
                )}

                {/* Vietnamese prompt */}
                {item.vietnamese && (
                  <p className="text-sm font-medium text-slate-200 mb-1.5 font-serif">
                    &ldquo;{item.vietnamese}&rdquo;
                  </p>
                )}

                {/* User answer */}
                <div className="text-xs bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-slate-300 mb-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">
                    Bài làm của bạn:
                  </span>
                  <span>{item.userText}</span>
                </div>

                {/* Errors display */}
                {item.grammarErrors && item.grammarErrors.length > 0 && (
                  <div className="space-y-1 mb-3 pt-1">
                    {item.grammarErrors.slice(0, 2).map((err, idx) => (
                      <div
                        key={idx}
                        className="text-xs flex items-start space-x-1.5 text-rose-300"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-rose-400" />
                        <div>
                          <span className="line-through opacity-75">{err.mistake}</span>
                          {" ➔ "}
                          <span className="text-emerald-400 font-bold">{err.correction}</span>
                          <span className="text-slate-400 block text-[11px]">
                            {err.explanation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button: Retry similar structure */}
                {item.type === "sentence" && item.patternName && (
                  <button
                    onClick={() => {
                      onPracticeSimilar(item);
                      onClose();
                      soundFx.playKeyClick();
                    }}
                    className="w-full mt-2 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Luyện 1 câu mới cùng cấu trúc này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
