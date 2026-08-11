"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Domain, loadModeRouge, saveModeRouge } from "@/lib/storage";
import DomainIcon from "@/components/DomainIcon";
import ModeRougeSwitch from "@/components/ModeRougeSwitch";

const CARDS: {
  domain: Domain;
  href: string;
  ch: string;
  label: string;
  subtitle: string;
  text: string;
  border: string;
  hoverShadow: string;
  dot: string;
}[] = [
  {
    domain: "musique",
    href: "/musique",
    ch: "CH.01",
    label: "Musique",
    subtitle: "Écriture, sorties, campagnes de communication",
    text: "text-amber",
    border: "hover:border-amber/60",
    hoverShadow: "hover:shadow-amber/10",
    dot: "bg-amber",
  },
  {
    domain: "esport",
    href: "/esport",
    ch: "CH.02",
    label: "Esport",
    subtitle: "Sessions, progression, compétition",
    text: "text-cyan",
    border: "hover:border-cyan/60",
    hoverShadow: "hover:shadow-cyan/10",
    dot: "bg-cyan",
  },
  {
    domain: "vie",
    href: "/vie",
    ch: "CH.03",
    label: "Vie",
    subtitle: "Travail, famille, argent, repos",
    text: "text-teal",
    border: "hover:border-teal/60",
    hoverShadow: "hover:shadow-teal/10",
    dot: "bg-teal",
  },
];

export default function Home() {
  const [modeRouge, setModeRouge] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setModeRouge(loadModeRouge());
    setHydrated(true);
  }, []);

  const toggleModeRouge = () => {
    const next = !modeRouge;
    setModeRouge(next);
    saveModeRouge(next);
  };

  if (!hydrated) return null;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">IBES</h1>
          <p className="text-xs text-muted font-mono uppercase tracking-widest">
            console personnelle
          </p>
        </div>
        <ModeRougeSwitch active={modeRouge} onToggle={toggleModeRouge} />
      </header>

      {modeRouge && (
        <div className="bg-alert/10 border-b border-alert/30 text-alert text-xs font-mono uppercase tracking-widest px-6 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-alert animate-pulse" />
          Mode rouge actif — objectifs réduits sur tous les canaux
        </div>
      )}

      <section className="flex-1 px-6 py-12 max-w-5xl w-full mx-auto flex flex-col justify-center">
        <p className="font-mono text-[11px] text-muted uppercase tracking-widest mb-6">
          Sélectionne un canal
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {CARDS.map((c) => (
            <Link
              key={c.domain}
              href={c.href}
              className={`group relative overflow-hidden rounded-xl border border-white/10 bg-panel px-6 py-8 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_var(--tw-shadow-color)] ${c.border} ${c.hoverShadow}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  {c.ch}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              </div>
              <div className={`${modeRouge ? "text-alert" : c.text}`}>
                <DomainIcon domain={c.domain} className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-display text-xl mb-1">{c.label}</h2>
                <p className="text-sm text-muted leading-relaxed">{c.subtitle}</p>
              </div>
              <span className="mt-auto font-mono text-[10px] uppercase tracking-widest text-muted group-hover:text-ink transition-colors">
                Ouvrir →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="px-6 py-4 text-center font-mono text-[10px] text-muted/70 uppercase tracking-widest">
        Données stockées uniquement dans ce navigateur
      </footer>
    </main>
  );
}
