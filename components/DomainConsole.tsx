"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Domain,
  DomainState,
  loadDomainState,
  saveDomainState,
  loadModeRouge,
  saveModeRouge,
  emptyReviewDraft,
  syncWeeklyCompletedTasks,
  BriefingData,
} from "@/lib/storage";
import DomainIcon from "@/components/DomainIcon";
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

const DOMAIN_META: Record<Domain, { label: string; ch: string; text: string; border: string; dot: string }> = {
  musique: { label: "Musique", ch: "CH.01", text: "text-amber", border: "border-amber", dot: "bg-amber" },
  esport: { label: "Esport", ch: "CH.02", text: "text-cyan", border: "border-cyan", dot: "bg-cyan" },
  vie: { label: "Vie", ch: "CH.03", text: "text-teal", border: "border-teal", dot: "bg-teal" },
};

export default function DomainConsole({ domain }: { domain: Domain }) {
  const meta = DOMAIN_META[domain];
  const [state, setState] = useState<DomainState>(loadDomainState(domain));
  const [modeRouge, setModeRouge] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>("briefing");

  useEffect(() => {
    setState(loadDomainState(domain));
    setModeRouge(loadModeRouge());
    setHydrated(true);
  }, [domain]);

  useEffect(() => {
    if (hydrated) saveDomainState(domain, state);
  }, [state, hydrated, domain]);

  const toggleModeRouge = () => {
    const next = !modeRouge;
    setModeRouge(next);
    saveModeRouge(next);
  };

  if (!hydrated) return null;

  const activeBorder = modeRouge ? "border-alert" : meta.border;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-ink border border-white/15 rounded-full px-3 py-1.5"
          >
            ← Accueil
          </Link>
          <div className={`flex items-center gap-2 ${modeRouge ? "text-alert" : meta.text}`}>
            <DomainIcon domain={domain} className="w-5 h-5" />
            <div>
              <h1 className="font-display text-xl tracking-tight leading-none">{meta.label}</h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted">{meta.ch}</p>
            </div>
          </div>
        </div>
        <ModeRougeSwitch active={modeRouge} onToggle={toggleModeRouge} />
      </header>

      {modeRouge && (
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
            modeRouge={modeRouge}
            onChange={(b: BriefingData) =>
              setState((s) => ({
                ...s,
                briefing: b,
                completedThisWeek: syncWeeklyCompletedTasks(s.completedThisWeek, b),
              }))
            }
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
            completedTasks={state.completedThisWeek}
            onDraftChange={(d) => setState((s) => ({ ...s, reviewDraft: d }))}
            onSave={(entry) =>
              setState((s) => ({
                ...s,
                reviewHistory: [entry, ...s.reviewHistory],
                reviewDraft: emptyReviewDraft(),
                completedThisWeek: [],
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
