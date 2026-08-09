"use client";

import { useEffect, useState } from "react";
import {
  loadState,
  saveState,
  defaultState,
  emptyReviewDraft,
  IbesState,
} from "@/lib/storage";
import ModeRougeSwitch from "@/components/ModeRougeSwitch";
import BriefingPanel from "@/components/BriefingPanel";
import DumpPanel from "@/components/DumpPanel";
import ReviewPanel from "@/components/ReviewPanel";

type Tab = "briefing" | "dump" | "review";

const TABS: { id: Tab; label: string }[] = [
  { id: "briefing", label: "Briefing du jour" },
  { id: "dump", label: "Décharge mentale" },
  { id: "review", label: "Bilan semaine" },
];

export default function Page() {
  const [state, setState] = useState<IbesState>(defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>("briefing");

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  if (!hydrated) return null;

  const activeBorder = state.modeRouge ? "border-alert" : "border-amber";

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-tight">IBES</h1>
          <p className="text-xs text-muted font-mono uppercase tracking-widest">
            console personnelle
          </p>
        </div>
        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] text-muted uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            CH.01 Musique
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
            CH.02 Communication
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ink/60" />
            CH.03 Développement
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ink" />
            CH.04 Vie
          </span>
        </div>
        <ModeRougeSwitch
          active={state.modeRouge}
          onToggle={() => setState((s) => ({ ...s, modeRouge: !s.modeRouge }))}
        />
      </header>

      {state.modeRouge && (
        <div className="bg-alert/10 border-b border-alert/30 text-alert text-xs font-mono uppercase tracking-widest px-6 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-alert animate-pulse" />
          Mode rouge actif — objectifs réduits, rien ne se reporte sur la semaine prochaine
        </div>
      )}

      <nav className="flex gap-1 px-6 pt-4 font-mono text-xs uppercase tracking-widest overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id ? `${activeBorder} text-ink` : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="flex-1 px-6 py-8 max-w-3xl w-full mx-auto">
        {tab === "briefing" && (
          <BriefingPanel
            data={state.briefing}
            modeRouge={state.modeRouge}
            onChange={(b) => setState((s) => ({ ...s, briefing: b }))}
          />
        )}
        {tab === "dump" && (
          <DumpPanel
            items={state.dump}
            onChange={(items) => setState((s) => ({ ...s, dump: items }))}
          />
        )}
        {tab === "review" && (
          <ReviewPanel
            draft={state.reviewDraft}
            history={state.reviewHistory}
            onDraftChange={(d) => setState((s) => ({ ...s, reviewDraft: d }))}
            onSave={(entry) =>
              setState((s) => ({
                ...s,
                reviewHistory: [entry, ...s.reviewHistory],
                reviewDraft: emptyReviewDraft(),
              }))
            }
          />
        )}
      </section>

      <footer className="px-6 py-4 text-center font-mono text-[10px] text-muted/70 uppercase tracking-widest">
        Données stockées uniquement dans ce navigateur
      </footer>
    </main>
  );
}
