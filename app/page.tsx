"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Domain, DomainState, loadDomainState, loadModeRouge, saveModeRouge } from "@/lib/storage";
import DomainIcon from "@/components/DomainIcon";
import ModeRougeSwitch from "@/components/ModeRougeSwitch";

const CARDS = [
  { domain: "musique" as Domain, href: "/musique", ch: "CH.01", label: "Musique", subtitle: "Écriture, sorties, campagnes de communication", text: "text-amber", border: "hover:border-amber/60", dot: "bg-amber" },
  { domain: "esport" as Domain, href: "/esport", ch: "CH.02", label: "Esport", subtitle: "Sessions, progression, compétition", text: "text-cyan", border: "hover:border-cyan/60", dot: "bg-cyan" },
  { domain: "vie" as Domain, href: "/vie", ch: "CH.03", label: "Vie", subtitle: "Travail, famille, argent, repos", text: "text-teal", border: "hover:border-teal/60", dot: "bg-teal" },
];

export default function Home() {
  const [modeRouge, setModeRouge] = useState(false);
  const [states, setStates] = useState<Record<Domain, DomainState> | null>(null);

  useEffect(() => {
    setModeRouge(loadModeRouge());
    setStates({ musique: loadDomainState("musique"), esport: loadDomainState("esport"), vie: loadDomainState("vie") });
  }, []);

  const toggleModeRouge = () => {
    const next = !modeRouge;
    setModeRouge(next);
    saveModeRouge(next);
  };

  if (!states) return null;

  const totalDone = CARDS.reduce((n, c) => n + states[c.domain].completedThisWeek.length, 0);
  const urgent = CARDS.reduce((n, c) => n + states[c.domain].dump.filter((i) => i.category === "URGENT").length, 0);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-3xl tracking-tight">IBES</h1><p className="text-xs text-muted font-mono uppercase tracking-widest">console personnelle</p></div>
        <ModeRougeSwitch active={modeRouge} onToggle={toggleModeRouge} />
      </header>

      {modeRouge && <div className="bg-alert/10 border-b border-alert/30 text-alert text-xs font-mono uppercase tracking-widest px-6 py-2">● Mode rouge actif — protège l'essentiel</div>}

      <section className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto space-y-8">
        <div>
          <p className="font-mono text-[11px] text-muted uppercase tracking-widest mb-3">Vue d'ensemble</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-panel border border-white/10 rounded-lg p-4"><div className="font-display text-2xl">{totalDone}</div><div className="text-[10px] font-mono uppercase tracking-widest text-muted">tâches faites / semaine</div></div>
            <div className="bg-panel border border-white/10 rounded-lg p-4"><div className={urgent ? "font-display text-2xl text-alert" : "font-display text-2xl"}>{urgent}</div><div className="text-[10px] font-mono uppercase tracking-widest text-muted">urgences</div></div>
            <div className="bg-panel border border-white/10 rounded-lg p-4"><div className="font-display text-2xl">{CARDS.reduce((n,c)=>n+[states[c.domain].briefing.p1Done,states[c.domain].briefing.p2Done,states[c.domain].briefing.p3Done].filter(Boolean).length,0)}/9</div><div className="text-[10px] font-mono uppercase tracking-widest text-muted">priorités faites</div></div>
            <div className="bg-panel border border-white/10 rounded-lg p-4"><div className={`font-display text-lg ${modeRouge ? "text-alert" : "text-teal"}`}>{modeRouge ? "ROUGE" : "NORMAL"}</div><div className="text-[10px] font-mono uppercase tracking-widest text-muted">état système</div></div>
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] text-muted uppercase tracking-widest mb-3">Aujourd'hui</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {CARDS.map((c) => {
              const b = states[c.domain].briefing;
              const priorities = [[b.p1,b.p1Done],[b.p2,b.p2Done],[b.p3,b.p3Done]] as const;
              const openTasks = b.tasks.filter(t => !t.done).length;
              return <Link key={c.domain} href={c.href} className={`rounded-xl border border-white/10 bg-panel px-5 py-5 transition-colors ${c.border}`}>
                <div className="flex items-center justify-between mb-4"><div className={`flex items-center gap-2 ${modeRouge ? "text-alert" : c.text}`}><DomainIcon domain={c.domain} className="w-5 h-5"/><span className="font-display">{c.label}</span></div><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/></div>
                <div className="space-y-2 min-h-[5.5rem]">{priorities.map(([text,done],i)=> text ? <div key={i} className={`text-sm flex gap-2 ${done ? "text-muted line-through" : ""}`}><span className="font-mono text-[10px] text-muted pt-1">0{i+1}</span><span>{text}</span></div> : null)}</div>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted"><span>{openTasks} tâche{openTasks!==1?"s":""}</span><span>Ouvrir →</span></div>
              </Link>;
            })}
          </div>
        </div>
      </section>

      <footer className="px-6 py-4 text-center font-mono text-[10px] text-muted/70 uppercase tracking-widest">Données stockées uniquement dans ce navigateur</footer>
    </main>
  );
}
