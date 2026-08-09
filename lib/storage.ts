export type BriefingData = {
  date: string;
  p1: string;
  p2: string;
  p3: string;
  bonus: string;
  skip: string;
};

export type DumpCategory = "URGENT" | "PLANIFIER" | "PARKING" | "OUBLIE" | null;

export type DumpItem = {
  id: string;
  text: string;
  category: DumpCategory;
};

export type ReviewDraft = {
  advanced: string;
  notDone: string;
  why: string;
  keep: string;
  change: string;
  next1: string;
  next2: string;
  next3: string;
};

export type ReviewEntry = ReviewDraft & { id: string; savedAt: string };

export type IbesState = {
  modeRouge: boolean;
  briefing: BriefingData;
  dump: DumpItem[];
  reviewDraft: ReviewDraft;
  reviewHistory: ReviewEntry[];
};

const KEY = "ibes:v1";

export const emptyBriefing = (): BriefingData => ({
  date: new Date().toISOString().slice(0, 10),
  p1: "",
  p2: "",
  p3: "",
  bonus: "",
  skip: "",
});

export const emptyReviewDraft = (): ReviewDraft => ({
  advanced: "",
  notDone: "",
  why: "",
  keep: "",
  change: "",
  next1: "",
  next2: "",
  next3: "",
});

export const defaultState = (): IbesState => ({
  modeRouge: false,
  briefing: emptyBriefing(),
  dump: [],
  reviewDraft: emptyReviewDraft(),
  reviewHistory: [],
});

export function loadState(): IbesState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function saveState(state: IbesState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}
