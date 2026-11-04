"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Send,
  RotateCw,
  HelpCircle,
  BookOpen,
  Award,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Target,
  FileText,
} from "lucide-react";
import { soundFx } from "@/lib/sound";

interface EssayPromptData {
  title: string;
  titleVi: string;
  description: string;
  minWords: number;
  maxWords: number;
  guidingQuestions: string[];
  usefulVocabulary: { word: string; meaning: string }[];
}

interface EssayEvaluation {
  overallScore: number;
  estimatedLevel: string;
  summary: string;
  criteria: {
    taskResponse: { score: number; feedback: string };
    coherence: { score: number; feedback: string };
    lexical: { score: number; feedback: string };
    grammar: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  corrections: { original: string; replacement: string; reason: string }[];
  improvedEssay: string;
}

interface EssayPracticeProps {
  apiKey: string;
  openApiKeyModal: () => void;
}

const ESSAY_CATEGORIES = [
  "Đời sống & Thói quen (Daily Life & Habits)",
  "Du lịch & Khám phá (Travel & Exploration)",
  "Môi trường & Thiên nhiên (Environment)",
  "Công nghệ & Đời sống (Technology in Life)",
  "Sở thích & Ước mơ (Hobbies & Future Goals)",
];

export const EssayPractice: React.FC<EssayPracticeProps> = ({
  apiKey,
  openApiKeyModal,
}) => {
  const [category, setCategory] = useState(ESSAY_CATEGORIES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [essayPrompt, setEssayPrompt] = useState<EssayPromptData | null>(null);
  const [essayText, setEssayText] = useState("");
  const [evaluation, setEvaluation] = useState<EssayEvaluation | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wordsCount = essayText.trim()
    ? essayText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setEvaluation(null);
    setEssayText("");

    try {
      const res = await fetch("/api/gemini/essay/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo đề bài");
      }
      setEssayPrompt(data);
    } catch (err: any) {
      setErrorMsg(err.message);
      if (err.message.includes("API Key")) {
        openApiKeyModal();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async () => {
    if (!essayPrompt || !essayText.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/gemini/essay/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essayTopic: `${essayPrompt.title} - ${essayPrompt.description}`,
          userEssay: essayText.trim(),
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể chấm bài");
      }

      setEvaluation(data);
      soundFx.playSuccess();

      if (data.overallScore >= 80) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
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

  const handleCopyImproved = () => {
    if (evaluation?.improvedEssay) {
      navigator.clipboard.writeText(evaluation.improvedEssay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    soundFx.playKeyClick();
  };

  return (
    <div className="space-y-6">
      {/* Category and control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Chủ đề:
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ESSAY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGeneratePrompt}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{essayPrompt ? "Đổi chủ đề khác" : "Tìm chủ đề luận mới"}</span>
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

      {/* Initial state */}
      {!essayPrompt && !isGenerating && (
        <div className="text-center py-16 px-6 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Luyện viết đoạn văn / Essay A2-B1</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Gemini sẽ gợi ý chủ đề thú vị kèm dàn ý và từ vựng gợi ý. Hãy viết khoảng 100 - 180 từ để AI chấm điểm toàn diện.
          </p>
          <button
            onClick={handleGeneratePrompt}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            <span>Gợi ý chủ đề ngay</span>
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="p-12 text-center border border-slate-800 rounded-3xl bg-slate-900/40">
          <RotateCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">
            Gemini đang thiết kế đề bài và gợi ý từ vựng cho bạn...
          </p>
        </div>
      )}

      {/* Prompt Card */}
      {essayPrompt && !isGenerating && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Essay Target: {essayPrompt.minWords} - {essayPrompt.maxWords} words
              </span>
              <span className="text-xs text-slate-400">Trình độ mục tiêu: A2 - B1</span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {essayPrompt.title}
            </h3>
            <p className="text-sm text-indigo-300 font-medium mb-3">
              {essayPrompt.titleVi}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {essayPrompt.description}
            </p>

            {/* Questions outline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dàn ý gợi ý trả lời:</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {essayPrompt.guidingQuestions.map((q, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Useful Vocabulary */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Từ vựng nên dùng:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {essayPrompt.usefulVocabulary.map((vocab, idx) => (
                    <span
                      key={idx}
                      title={vocab.meaning}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700 font-mono hover:border-indigo-500 transition-all cursor-help"
                    >
                      <strong className="text-indigo-300">{vocab.word}</strong>:{" "}
                      {vocab.meaning}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Writing Pad */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-2xl transition-all">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-300 font-medium">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Không gian viết bài (Essay Editor)</span>
              </div>

              {/* Word counter progress */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span
                    className={`font-bold ${
                      wordsCount >= essayPrompt.minWords &&
                      wordsCount <= essayPrompt.maxWords
                        ? "text-emerald-400"
                        : wordsCount > essayPrompt.maxWords
                        ? "text-amber-400"
                        : "text-slate-400"
                    }`}
                  >
                    {wordsCount}
                  </span>
                  <span className="text-slate-500">
                    / {essayPrompt.minWords}-{essayPrompt.maxWords} từ
                  </span>
                </div>
              </div>
            </div>

            <textarea
              rows={9}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bắt đầu viết bài luận của bạn tại đây... Hãy cố gắng sử dụng các thì thích hợp và từ vựng gợi ý ở trên nhé!"
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base focus:outline-none resize-y leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-3">
              <div className="text-xs text-slate-500">
                {wordsCount < essayPrompt.minWords ? (
                  <span>
                    💡 Cần thêm tối thiểu {essayPrompt.minWords - wordsCount} từ nữa để đạt độ dài chuẩn.
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    ✓ Độ dài bài viết đã đạt mục tiêu!
                  </span>
                )}
              </div>

              <button
                onClick={handleEvaluate}
                disabled={wordsCount < 30 || isEvaluating}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                {isEvaluating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>AI Đang Chấm Bài...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Nộp & Chấm Bài</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Essay Evaluation Results */}
          {evaluation && (
            <div className="space-y-6 pt-2 animate-fade-in">
              {/* Header Score */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <div
                    className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center font-black shadow-xl border ${
                      evaluation.overallScore >= 80
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10"
                        : evaluation.overallScore >= 60
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10"
                    }`}
                  >
                    <span className="text-4xl leading-none">
                      {evaluation.overallScore}
                    </span>
                    <span className="text-[10px] uppercase font-bold opacity-80 mt-1">
                      / 100
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-lg font-bold text-white">
                        Trình độ ước tính: {evaluation.estimatedLevel}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 max-w-xl">
                      {evaluation.summary}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGeneratePrompt}
                  className="flex items-center space-x-2 px-5 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md transition-all flex-shrink-0"
                >
                  <RotateCw className="w-4 h-4 text-indigo-400" />
                  <span>Viết chủ đề khác</span>
                </button>
              </div>

              {/* Rubric 4 criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Task Response",
                    data: evaluation.criteria.taskResponse,
                  },
                  {
                    title: "Coherence & Cohesion",
                    data: evaluation.criteria.coherence,
                  },
                  {
                    title: "Lexical Resource",
                    data: evaluation.criteria.lexical,
                  },
                  {
                    title: "Grammatical Accuracy",
                    data: evaluation.criteria.grammar,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        {item.title}
                      </span>
                      <span className="text-sm font-bold text-indigo-400">
                        {item.data.score}/10
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${(item.data.score / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                      {item.data.feedback}
                    </p>
                  </div>
                ))}
              </div>

              {/* Strengths and improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
                  <h5 className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                    <span>🌟 Điểm làm tốt</span>
                  </h5>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {evaluation.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
                  <h5 className="text-sm font-bold text-amber-400 flex items-center space-x-1.5">
                    <span>🎯 Điểm cần chú ý & cải thiện</span>
                  </h5>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {evaluation.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sentence by sentence corrections */}
              {evaluation.corrections && evaluation.corrections.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <h4 className="font-bold text-white flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <span>Chi tiết các câu cần sửa ({evaluation.corrections.length})</span>
                  </h4>
                  <div className="space-y-3">
                    {evaluation.corrections.map((corr, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm space-y-1.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="line-through text-rose-300">
                            {corr.original}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:inline" />
                          <span className="text-emerald-400 font-bold">
                            {corr.replacement}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 pt-1">
                          💡 {corr.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model improved essay */}
              {evaluation.improvedEssay && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-indigo-400">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="font-bold text-white">
                        Bản bài viết đã được trau chuốt (Model Version)
                      </h4>
                    </div>

                    <button
                      onClick={handleCopyImproved}
                      className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép bài mẫu</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm font-serif text-slate-200 leading-relaxed bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 whitespace-pre-line">
                    {evaluation.improvedEssay}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

