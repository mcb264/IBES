import { CompletedTask, localDateKey } from "@/lib/storage";

export type CompletionHistoryItem = CompletedTask & {
  workspace?: string;
  project?: string;
};

const COMPLETION_HISTORY_KEY = "ibes:completion-history-v1";
const RETENTION_DAYS = 180;

function cutoffDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (RETENTION_DAYS - 1));
  return localDateKey(d);
}

export function loadCompletionHistory(): CompletionHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(COMPLETION_HISTORY_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    const cutoff = cutoffDate();
    return raw
      .filter((item): item is CompletionHistoryItem => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.text === "string" && typeof item.date === "string")
      .filter(item => item.date >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

export function recordCompletion(item: CompletionHistoryItem) {
  if (typeof window === "undefined") return;
  const current = loadCompletionHistory();
  const key = `${item.date}:${item.id}`;
  const next = [...current.filter(x => `${x.date}:${x.id}` !== key), item]
    .sort((a, b) => a.date.localeCompare(b.date));
  window.localStorage.setItem(COMPLETION_HISTORY_KEY, JSON.stringify(next));
}
