"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CapacityLevel,
  Domain,
  DomainState,
  LoadInsight,
  LoadSettings,
  TaskItem,
  capacityValue,
  dismissLoadInsight,
  getLoadInsight,
  loadDailyCapacity,
  loadDomainState,
  loadLoadSettings,
  loadModeRouge,
  localDateKey,
  rawWorkload,
  saveDailyCapacity,
  saveDomainState,
  saveModeRouge,
  workloadBreakdown,
} from "@/lib/storage";
import ModeRougeSwitch from "@/components/ModeRougeSwitch";

const PROJECT_CARDS: Array<{ domain: Domain; href: string; label: string; text: string }> = [
  { domain: "musique", href: "/musique", label: "Musique", text: "text-amber" },
  { domain: "esport", href: "/esport", label: "Esport", text: "text-cyan" },
];
const ALL_DOMAINS: Domain[] = ["musique", "esport", "vie"];
const LEVELS: Array<[CapacityLevel, string]> = [
  ["low", "Basse"],
  ["normal", "Normale"],
  ["high", "Haute"],
];

export default function Home() {
  const [modeRouge, setModeRouge] = useState(false);
  const [states, setStates] = useState<Record<Domain, DomainState> | null>(null);
  const [capacity, setCapacity] = useState<CapacityLevel | null>(null);
  const [settings, setSettings] = useState<LoadSettings | null>(null);
  const [details, setDetails] = useState(false);
  const [insight, setInsight] = useState<LoadInsight | null>(null);
  const [addingLife, setAddingLife] = useState(false);
  const [lifeText, setLifeText] = useState("");

  useEffect(() => {
    const currentSettings = loadLoadSettings();
    setModeRouge(loadModeRouge());
    setStates({
      musique: loadDomainState("musique"),
      esport: loadDomainState("esport"),
      vie: loadDomainState("vie"),
    });
    setCapacity(loadDailyCapacity()?.level ?? null);
    setSettings(currentSettings);
    setInsight(getLoadInsight(currentSettings));
  }, []);

  if (!states || !settings) return null;

  const chooseCapacity = (level: CapacityLevel) => {
    setCapacity(level);
    saveDailyCapacity(level);
  };

  const toggleModeRouge = () => {
    const next = !modeRouge;
    setModeRouge(next);
    saveModeRouge(next);
  };

  const saveLife = (next: DomainState) => {
    setStates({ ...states, vie: next });
    saveDomainState("vie", next);
  };

  const lifeActive = states.vie.briefing.tasks.filter((task) => !task.done && !task.waiting);

  const addLife = () => {
    const text = lifeText.trim();
    if (!text) return;
    const task: TaskItem = { id: crypto.randomUUID(), text, done: false, effort: "normal" };
    saveLife({
      ...states.vie,
      briefing: {
        ...states.vie.briefing,
        tasks: [...states.vie.briefing.tasks, task],
      },
    });
    setLifeText("");
    setAddingLife(false);
  };

  const completeLife = (id: string) =>
    saveLife({
      ...states.vie,
      briefing: {
        ...states.vie.briefing,
        tasks: states.vie.briefing.tasks.map((task) =>
          task.id === id ? { ...task, done: true } : task,
        ),
      },
    });

  const raw = ALL_DOMAINS.reduce(
    (total, domain) => total + rawWorkload(states[domain], settings),
    0,
  );
  const cap = capacity ? capacityValue(capacity, settings) : settings.normalCapacity;
  const percent = Math.round((raw / cap) * 100);

  const breakdown = ALL_DOMAINS.map((domain) =>
    workloadBreakdown(states[domain], settings),
  ).reduce((acc, item) => ({
    priorities: acc.priorities + item.priorities,
    tasks: 0,
    urgent: acc.urgent + item.urgent,
    due: acc.due + item.due,
    priorityPoints: acc.priorityPoints + item.priorityPoints,
    taskPoints: 0,
    urgentPoints: acc.urgentPoints + item.urgentPoints,
    duePoints: acc.duePoints + item.duePoints,
  }));

  const today = localDateKey();
  const deadlines = PROJECT_CARDS.flatMap((card) =>
    states[card.domain].projects
      .filter((project) => !project.done && project.dueDate && project.dueDate >= today)
      .map((project) => ({ ...project, domain: card.label, href: card.href })),
  )
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 4);

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10 px-6 py-5 flex justify-between">
        <div>
          <h1 className="font-display text-3xl">IBES</h1>
          <p className="text-xs text-muted font-mono uppercase tracking-widest">console personnelle</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/reglages" className="text-xs font-mono uppercase text-muted">Réglages</Link>
          <ModeRougeSwitch active={modeRouge} onToggle={toggleModeRouge} />
        </div>
      </header>

      {!capacity && (
        <div className="border-b border-amber/30 bg-amber/5 px-6 py-5">
          <div className="max-w-5xl mx-auto">
            <p className="font-display text-lg mb-3">Quelle capacité aujourd'hui ?</p>
            <div className="flex gap-2">
              {LEVELS.map(([value, label]) => (
                <button key={value} onClick={() => chooseCapacity(value)} className="px-4 py-2 rounded border border-white/10">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="px-6 py-8 max-w-5xl mx-auto space-y-9">
        {insight && (
          <div className="rounded-lg border border-cyan/30 bg-cyan/5 p-5">
            <p className="font-display text-lg text-cyan">IBES a remarqué quelque chose</p>
            <p className="text-sm mt-2">
              Sur {insight.sampleSize} journées comparables : {insight.averagePlanned} pts prévus, {insight.averageCompleted} absorbés. Réglage actuel {insight.configured}, suggestion {insight.suggested}.
            </p>
            <div className="flex gap-3 mt-3">
              <Link href="/reglages" className="text-xs text-cyan">Ouvrir les réglages</Link>
              <button onClick={() => { dismissLoadInsight(insight.signature); setInsight(null); }} className="text-xs text-muted">Compris</button>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between mb-3">
            <p className="font-mono text-[11px] text-muted uppercase">Cockpit</p>
            {capacity && (
              <div className="flex gap-1">
                {LEVELS.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => chooseCapacity(value)}
                    className={`text-[10px] px-2 py-1 rounded ${capacity === value ? "bg-amber text-graphite" : "border border-white/10 text-muted"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setDetails(!details)} className="w-full text-left bg-panel border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-end">
              <div>
                <div className={`font-display text-4xl ${percent > 100 ? "text-alert" : percent >= 75 ? "text-amber" : "text-teal"}`}>{percent}%</div>
                <div className="text-[10px] text-muted uppercase">de ta capacité utilisée</div>
              </div>
              <div className="font-mono text-sm">{raw} / {cap} pts</div>
            </div>
            {details && (
              <div className="mt-4 pt-4 border-t border-white/10 grid sm:grid-cols-3 gap-3 text-sm">
                <div>{breakdown.priorities} choses à porter<br/><span className="text-muted">{breakdown.priorityPoints} pts</span></div>
                <div>{breakdown.urgent} urgences<br/><span className="text-muted">{breakdown.urgentPoints} pts</span></div>
                <div>{breakdown.due} échéances dues<br/><span className="text-muted">{breakdown.duePoints} pts</span></div>
              </div>
            )}
          </button>
          {percent > 100 && !modeRouge && (
            <div className="mt-3 border border-alert/30 bg-alert/10 rounded px-4 py-3 text-sm text-alert">
              Programme supérieur à ta capacité. Mode Rouge recommandé.
            </div>
          )}
        </div>

        <div>
          <div className="mb-4">
            <p className="font-mono text-[11px] text-muted uppercase">Projets</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {PROJECT_CARDS.map((card) => {
              const state = states[card.domain];
              const active = state.briefing.tasks.filter((task) => !task.done && !task.waiting);
              const waiting = state.briefing.tasks.filter((task) => task.waiting).length;
              const nextAction = active[0];
              const nextDeadline = state.projects
                .filter((project) => !project.done && project.dueDate && project.dueDate >= today)
                .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))[0];

              return (
                <Link
                  key={card.domain}
                  href={card.href}
                  className="group min-h-[260px] rounded-2xl border border-white/10 bg-panel p-6 flex flex-col hover:border-white/25 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`font-display text-3xl ${card.text}`}>{card.label}</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1">
                        {active.length} priorité{active.length !== 1 ? "s" : ""} active{active.length !== 1 ? "s" : ""}{waiting > 0 ? ` · ${waiting} en attente` : ""}
                      </div>
                    </div>
                    <span className="text-muted group-hover:text-ink transition-colors">→</span>
                  </div>

                  <div className="mt-8 flex-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Prochaine action</p>
                    {nextAction ? (
                      <p className="text-xl leading-snug">{nextAction.text}</p>
                    ) : (
                      <p className="text-lg text-muted">Rien d'actif pour l'instant.</p>
                    )}
                  </div>

                  <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-muted">{nextDeadline ? "Prochaine échéance" : "Aucune échéance proche"}</span>
                    {nextDeadline && (
                      <span className="font-mono text-amber">
                        {new Date(nextDeadline.dueDate! + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-mono text-[11px] text-muted uppercase">À gérer</p>
              <p className="text-xs text-muted mt-1">Ce que la vie te demande de ne pas oublier.</p>
            </div>
            <span className="text-[10px] text-muted">{lifeActive.length} active{lifeActive.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-panel/70 p-4 space-y-2">
            {lifeActive.length === 0 && !addingLife && <p className="text-sm text-muted py-2">Rien à porter ici.</p>}
            {lifeActive.map((task) => (
              <div key={task.id} className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0">
                <button onClick={() => completeLife(task.id)} className="w-5 h-5 rounded border border-teal/50 text-transparent hover:text-teal">✓</button>
                <span className="flex-1 text-sm">{task.text}</span>
              </div>
            ))}
            {addingLife ? (
              <div className="pt-2 flex gap-2">
                <input
                  autoFocus
                  value={lifeText}
                  onChange={(event) => setLifeText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addLife();
                    if (event.key === "Escape") { setAddingLife(false); setLifeText(""); }
                  }}
                  className="min-w-0 flex-1 bg-graphite border border-white/10 rounded-md px-3 py-2 text-sm"
                />
                <button onClick={addLife} className="text-xs text-teal">Ajouter</button>
              </div>
            ) : (
              <button onClick={() => setAddingLife(true)} className="pt-2 text-xs font-mono uppercase tracking-widest text-teal">+ Ajouter</button>
            )}
          </div>
        </div>

        {deadlines.length > 0 && (
          <div>
            <p className="font-mono text-[11px] text-muted uppercase mb-3">Échéances projets</p>
            {deadlines.map((project) => (
              <Link key={project.id} href={project.href} className="flex justify-between bg-panel border border-white/10 rounded px-4 py-3 mb-2">
                <span>{project.name} <span className="text-[10px] text-muted">{project.domain}</span></span>
                <span className="font-mono text-xs text-amber">{new Date(project.dueDate! + "T00:00:00").toLocaleDateString("fr-FR")}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
