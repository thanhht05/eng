export interface PracticeRecord {
  id: string;
  createdAt: number;
  type: "sentence" | "essay";
  level: string;
  topic: string;
  vietnamese?: string;
  userText: string;
  score: number;
  patternName?: string;
  grammarTarget?: string;
  overallFeedback: string;
  grammarErrors?: { mistake: string; correction: string; explanation: string }[];
  modelAnswer?: string;
  isMistake: boolean;
  mastered?: boolean;
}

const STORAGE_KEY = "engsprint_practice_history";

export function savePracticeRecord(record: Omit<PracticeRecord, "id" | "createdAt">): PracticeRecord {
  if (typeof window === "undefined") {
    return { ...record, id: String(Date.now()), createdAt: Date.now() };
  }

  const existing = getPracticeHistory();
  const newRecord: PracticeRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: Date.now(),
  };

  // Giữ tối đa 100 bài gần nhất
  const updated = [newRecord, ...existing].slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Lỗi khi lưu lịch sử vào localStorage:", e);
  }

  return newRecord;
}

export function getPracticeHistory(): PracticeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Lỗi khi đọc lịch sử từ localStorage:", e);
    return [];
  }
}

export function getMistakeRecords(): PracticeRecord[] {
  return getPracticeHistory().filter((r) => r.isMistake && !r.mastered);
}

export function markRecordMastered(id: string): void {
  if (typeof window === "undefined") return;
  const history = getPracticeHistory();
  const updated = history.map((item) =>
    item.id === id ? { ...item, mastered: true } : item
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
