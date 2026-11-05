"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Send,
  RotateCw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw,
} from "lucide-react";
import { soundFx } from "@/lib/sound";
import { PracticeRecord, savePracticeRecord, markRecordMastered } from "@/lib/history";

interface SentenceData {
  vietnamese: string;
  topic: string;
  level: string;
  hints: string[];
  patternName?: string;
  grammarTarget?: string;
}

interface GrammarError {
  mistake: string;
  correction: string;
  explanation: string;
}

interface VocabSuggestion {
  original: string;
  better: string;
  reason: string;
}

interface EvaluationResult {
  score: number;
  levelAchieved: string;
  overallFeedback: string;
  modelAnswers: { type: string; sentence: string }[];
  grammarErrors: GrammarError[];
  vocabularySuggestions: VocabSuggestion[];
}

interface SentencePracticeProps {
  apiKey: string;
  openApiKeyModal: () => void;
  similarRequest?: PracticeRecord | null;
  onClearSimilarRequest?: () => void;
  onHistoryUpdate?: () => void;
}

const TOPICS = [
  "Thói quen hàng ngày (Daily Routine)",
  "Du lịch & Kì nghỉ (Travel & Holidays)",
  "Ăn uống & Nấu ăn (Food & Dining)",
  "Công việc & Học tập (Work & Study)",
  "Sở thích & Thời gian rảnh (Hobbies)",
  "Mua sắm (Shopping)",
  "Gia đình & Bạn bè (Family & Friends)",
];

export const SentencePractice: React.FC<SentencePracticeProps> = ({
  apiKey,
  openApiKeyModal,
  similarRequest,
  onClearSimilarRequest,
  onHistoryUpdate,
}) => {
  const [level, setLevel] = useState<"A2" | "B1">("A2");
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const [currentPrompt, setCurrentPrompt] = useState<SentenceData | null>(null);
  const [userTranslation, setUserTranslation] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeRetryRecordId, setActiveRetryRecordId] = useState<string | null>(null);

  // Listen to similar request from History Drawer
  useEffect(() => {
    if (similarRequest) {
      setActiveRetryRecordId(similarRequest.id);
      handleGenerateSentence({
        targetPattern: similarRequest.patternName,
        retryMistakeContext: similarRequest.grammarErrors?.[0]
          ? `Lỗi: ${similarRequest.grammarErrors[0].mistake} -> Sửa: ${similarRequest.grammarErrors[0].correction} (${similarRequest.grammarErrors[0].explanation})`
          : undefined,
      });
      if (onClearSimilarRequest) onClearSimilarRequest();
    }
  }, [similarRequest]);

  // Generate new sentence (standard or retry similar)
  const handleGenerateSentence = async (retryParams?: {
    targetPattern?: string;
    retryMistakeContext?: string;
  }) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setResult(null);
    setUserTranslation("");
    setShowHints(false);

    try {
      const res = await fetch("/api/gemini/sentence/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          topic: selectedTopic,
          customApiKey: apiKey || undefined,
          targetPattern: retryParams?.targetPattern,
          retryMistakeContext: retryParams?.retryMistakeContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo câu");
      }
      setCurrentPrompt(data);
    } catch (err: any) {
      setErrorMsg(err.message);
      if (err.message.includes("API Key")) {
        openApiKeyModal();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Evaluate user translation
  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentPrompt || !userTranslation.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/gemini/sentence/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vietnamese: currentPrompt.vietnamese,
          userEnglish: userTranslation.trim(),
          level,
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể chấm câu");
      }

      setResult(data);
      soundFx.playSuccess();

      // Lưu vào Lịch sử & Sổ tay lỗi sai
      const hasErrors = data.score < 80 || (data.grammarErrors && data.grammarErrors.length > 0);
      savePracticeRecord({
        type: "sentence",
        level,
        topic: currentPrompt.topic,
        vietnamese: currentPrompt.vietnamese,
        userText: userTranslation.trim(),
        score: data.score,
        patternName: currentPrompt.patternName,
        grammarTarget: currentPrompt.grammarTarget,
        overallFeedback: data.overallFeedback,
        grammarErrors: data.grammarErrors,
        modelAnswer: data.modelAnswers?.[0]?.sentence,
        isMistake: hasErrors,
      });

      // Nếu đang luyện lại câu sai trước đó và đã đạt điểm cao >= 80, đánh dấu đã khắc phục!
      if (activeRetryRecordId && data.score >= 80) {
        markRecordMastered(activeRetryRecordId);
        setActiveRetryRecordId(null);
      }

      if (onHistoryUpdate) {
        onHistoryUpdate();
      }

      // Trigger celebration confetti if score is high
      if (data.score >= 80) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      if (err.message.includes("API Key")) {
        openApiKeyModal();
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    soundFx.playKeyClick();
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleEvaluate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cấp độ:
          </span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(["A2", "B1"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  soundFx.playKeyClick();
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  level === lvl
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Level {lvl}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-5 w-[1px] bg-slate-800" />

          {/* Topic selector */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => handleGenerateSentence()}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{currentPrompt ? "Đổi câu khác" : "Tạo câu luyện tập"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">Đã xảy ra lỗi:</p>
            <p className="text-xs text-rose-200 mt-0.5">{errorMsg}</p>
          </div>
          {errorMsg.includes("API Key") && (
            <button
              onClick={openApiKeyModal}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium"
            >
              Nhập API Key
            </button>
          )}
        </div>
      )}

      {/* Main Challenge Card */}
      {!currentPrompt && !isGenerating && (
        <div className="text-center py-16 px-6 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Bắt đầu buổi luyện viết ngắn</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Hệ thống AI sẽ tạo ngẫu nhiên một câu văn bản tiếng Việt phù hợp trình độ {level}. Bạn sẽ dịch sang tiếng Anh và AI sẽ chấm bài tức thì.
          </p>
          <button
            onClick={() => handleGenerateSentence()}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            <span>Tạo câu đầu tiên ngay</span>
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="p-12 text-center border border-slate-800 rounded-3xl bg-slate-900/40">
          <RotateCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">
            Gemini đang thiết kế câu tiếng Việt tự nhiên...
          </p>
        </div>
      )}

      {currentPrompt && !isGenerating && (
        <div className="space-y-6">
          {/* Vietnamese sentence prompt */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentPrompt.level}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentPrompt.topic}
                </span>
                {currentPrompt.patternName && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    🎯 {currentPrompt.patternName}
                  </span>
                )}
                {currentPrompt.grammarTarget && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px] hidden sm:inline-block">
                    {currentPrompt.grammarTarget}
                  </span>
                )}
              </div>

              {currentPrompt.hints && currentPrompt.hints.length > 0 && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/20 transition-all"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHints ? "Ẩn gợi ý" : "Xem từ vựng gợi ý"}</span>
                </button>
              )}
            </div>

            <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed font-serif">
              &ldquo;{currentPrompt.vietnamese}&rdquo;
            </p>

            {/* Hints dropdown */}
            {showHints && currentPrompt.hints && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gợi ý:</span>
                </span>
                {currentPrompt.hints.map((hint, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                  >
                    {hint}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* User translation input with smooth visual typing effect */}
          <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-2xl transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">
                Bản dịch tiếng Anh của bạn:
              </span>
              <div className="flex items-center space-x-3">
                <span>{userTranslation.length} ký tự</span>
                <span>•</span>
                <span>
                  {userTranslation.trim() ? userTranslation.trim().split(/\s+/).length : 0} từ
                </span>
              </div>
            </div>

            <textarea
              rows={3}
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu dịch tiếng Anh của bạn tại đây... (Nhấn Ctrl + Enter để nộp bài)"
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base md:text-lg focus:outline-none resize-none font-sans leading-relaxed selection:bg-indigo-500"
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Mẹo: Nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Enter</kbd> để kiểm tra
              </span>

              <button
                onClick={() => handleEvaluate()}
                disabled={!userTranslation.trim() || isEvaluating}
                className="ml-auto flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isEvaluating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>AI Đang Chấm...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kiểm tra bài viết</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Evaluation Results */}
          {result && (
            <div className="space-y-6 pt-2 animate-fade-in">
              {/* Score header */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <div
                    className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black shadow-xl border ${
                      result.score >= 80
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10"
                        : result.score >= 60
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10"
                    }`}
                  >
                    <span className="text-3xl leading-none">{result.score}</span>
                    <span className="text-[10px] uppercase font-bold opacity-80 mt-1">
                      / 100
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-lg font-bold text-white">
                        Đạt trình độ: {result.levelAchieved}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 max-w-xl">
                      {result.overallFeedback}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-shrink-0">
                  {/* Nếu làm sai hoặc điểm < 80, nút này sẽ hiện ra nổi bật */}
                  {(result.score < 80 || (result.grammarErrors && result.grammarErrors.length > 0)) &&
                    currentPrompt.patternName && (
                      <button
                        onClick={() =>
                          handleGenerateSentence({
                            targetPattern: currentPrompt.patternName,
                            retryMistakeContext: result.grammarErrors?.[0]
                              ? `Lỗi: ${result.grammarErrors[0].mistake} -> Sửa: ${result.grammarErrors[0].correction}`
                              : undefined,
                          })
                        }
                        className="flex items-center space-x-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02]"
                      >
                        <RefreshCw className="w-4 h-4 animate-spin-slow" />
                        <span>Luyện 1 câu tương tự để sửa lỗi</span>
                      </button>
                    )}

                  <button
                    onClick={() => handleGenerateSentence()}
                    className="flex items-center space-x-2 px-5 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md transition-all"
                  >
                    <RotateCw className="w-4 h-4 text-indigo-400" />
                    <span>Luyện câu tiếp theo</span>
                  </button>
                </div>
              </div>

              {/* Model Answers */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h4 className="font-bold text-white">Câu mẫu chuẩn bản xứ</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.modelAnswers.map((model, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 inline-block mb-2">
                        {model.type}
                      </span>
                      <p className="text-sm font-medium text-slate-100 font-sans leading-relaxed">
                        &ldquo;{model.sentence}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grammar Errors */}
              {result.grammarErrors && result.grammarErrors.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <AlertCircle className="w-5 h-5" />
                    <h4 className="font-bold text-white">
                      Phân tích lỗi ngữ pháp ({result.grammarErrors.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {result.grammarErrors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-sm space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="line-through text-rose-300 font-medium">
                            {err.mistake}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-500" />
                          <span className="text-emerald-400 font-bold">
                            {err.correction}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 pt-1">
                          💡 {err.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Suggestions */}
              {result.vocabularySuggestions && result.vocabularySuggestions.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                    <h4 className="font-bold text-white">Gợi ý nâng cấp từ vựng</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.vocabularySuggestions.map((vocab, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-sm space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">{vocab.original}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-300 font-bold">
                            {vocab.better}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{vocab.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
