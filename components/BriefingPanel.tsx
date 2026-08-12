"use client";

import { useState } from "react";
import {
  BriefingData,
  EffortLevel,
  Project,
  TaskItem,
  capacityValue,
  effortMultiplier,
  loadLoadSettings,
  localDateKey,
  waitingNeedsAttention,
} from "@/lib/storage";

const EFFORTS: Array<[EffortLevel, string]> = [
  ["light", "Légère"],
  ["normal", "Normale"],
  ["heavy", "Lourde"],
];

export default function BriefingPanel({
  data,
  modeRouge,
  projects = [],
  onChange,
}: {
  data: BriefingData;
  modeRouge: boolean;
  projects?: Project[];
  onChange: (briefing: BriefingData) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [newEffort, setNewEffort] = useState<EffortLevel>("normal");
  const [newProjectId, setNewProjectId] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const settings = loadLoadSettings();
  const active = data.tasks.filter((task) => !task.done && !task.waiting);
  const waiting = data.tasks.filter((task) => task.waiting);
  const done = data.tasks.filter((task) => task.done);
  const activeProjects = projects.filter((project) => !project.done);

  let used = 0;
  const redCap = capacityValue("low", settings);
  const visibleIds = new Set<string>();

  for (const task of active) {
    const cost = settings.priorityWeight * effortMultiplier(task.effort);
    if (!modeRouge || used + cost <= redCap || visibleIds.size === 0) {
      visibleIds.add(task.id);
      used += cost;
    }
  }

  const visible = active.filter((task) => visibleIds.has(task.id));
  const hidden = active.filter((task) => !visibleIds.has(task.id));

  const change = (items: TaskItem[]) => onChange({ ...data, tasks: items });
  const patch = (id: string, patchValue: Partial<TaskItem>) =>
    change(data.tasks.map((task) => (task.id === id ? { ...task, ...patchValue } : task)));

  const resetCreation = () => {
    setText("");
    setNewEffort("normal");
    setNewProjectId("");
    setAdding(false);
  };

  const add = () => {
    const value = text.trim();
    if (!value) return;

    change([
      ...data.tasks,
      {
        id: crypto.randomUUID(),
        text: value,
        done: false,
        effort: newEffort,
        projectId: newProjectId || undefined,
      },
    ]);
    resetCreation();
  };

  const row = (task: TaskItem, index: number) => {
    const expanded = open === task.id;

    return (
      <div
        key={task.id}
        className={`rounded-xl border transition-colors ${
          expanded ? "border-amber/40 bg-panel" : "border-white/10 bg-panel/70 hover:border-white/20"
        }`}
      >
        <div className="flex items-center gap-4 px-5 py-5 min-h-[84px]">
          <button
            onClick={() => patch(task.id, { done: true, waiting: false })}
            className="w-7 h-7 rounded-md border border-amber/60 text-transparent hover:text-amber shrink-0"
          >
            ✓
          </button>

          <span className="font-mono text-lg text-amber/80 w-9 shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>

          <button
            onClick={() => setOpen(expanded ? null : task.id)}
            className="flex-1 text-left text-lg leading-snug"
          >
            {task.text}
          </button>
        </div>

        {expanded && (
          <div className="px-5 pb-5 pt-1 ml-[68px] flex flex-wrap items-center gap-3 text-xs">
            <select
              value={task.effort ?? "normal"}
              onChange={(event) => patch(task.id, { effort: event.target.value as EffortLevel })}
              className="bg-graphite border border-white/10 rounded-md px-3 py-2 text-muted"
            >
              {EFFORTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {activeProjects.length > 0 && (
              <select
                value={task.projectId ?? ""}
                onChange={(event) => patch(task.id, { projectId: event.target.value || undefined })}
                className="bg-graphite border border-white/10 rounded-md px-3 py-2 text-muted"
              >
                <option value="">Aucun projet</option>
                {activeProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() =>
                patch(task.id, {
                  waiting: true,
                  waitingSince: localDateKey(),
                  carried: false,
                })
              }
              className="rounded-md border border-cyan/20 px-3 py-2 text-cyan"
            >
              ⏳ Mettre en attente
            </button>

            <button
              onClick={() => change(data.tasks.filter((item) => item.id !== task.id))}
              className="rounded-md border border-alert/20 px-3 py-2 text-alert"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted uppercase tracking-widest">
            {new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h2 className="font-display text-2xl mt-2">Priorités du jour</h2>
        </div>
        <span className="font-mono text-xs text-muted">{active.length} active{active.length !== 1 ? "s" : ""}</span>
      </div>

      {modeRouge && (
        <div className="rounded-lg border border-alert/30 bg-alert/10 px-5 py-4">
          <p className="text-sm text-alert font-medium">Mode Rouge — charge protégée</p>
          <p className="text-xs text-muted mt-1">
            IBES ne te montre que la portion de ta liste qui rentre dans ta capacité basse.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {visible.map((task, index) => row(task, index))}

        {modeRouge && hidden.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowHidden(!showHidden)}
              className="text-xs font-mono uppercase tracking-widest text-muted"
            >
              {hidden.length} priorité{hidden.length > 1 ? "s" : ""} masquée
              {hidden.length > 1 ? "s" : ""} {showHidden ? "↑" : "↓"}
            </button>
            {showHidden && (
              <div className="opacity-60 mt-3 space-y-3">
                {hidden.map((task, index) => row(task, visible.length + index))}
              </div>
            )}
          </div>
        )}
      </div>

      {!modeRouge && (
        <div className="pt-2">
          {adding ? (
            <div className="rounded-xl border border-amber/30 bg-panel p-5 space-y-4">
              <input
                autoFocus
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") add();
                  if (event.key === "Escape") resetCreation();
                }}
                className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-3 text-lg"
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
                    Effort
                  </span>
                  <div className="flex gap-2">
                    {EFFORTS.map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setNewEffort(value)}
                        className={`flex-1 rounded-md border px-3 py-2 text-xs ${
                          newEffort === value
                            ? "border-amber/50 bg-amber/10 text-amber"
                            : "border-white/10 text-muted"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
                    Projet
                  </span>
                  <select
                    value={newProjectId}
                    onChange={(event) => setNewProjectId(event.target.value)}
                    className="w-full bg-graphite border border-white/10 rounded-md px-3 py-2 text-sm text-muted"
                  >
                    <option value="">Aucun projet</option>
                    {activeProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={resetCreation} className="text-xs font-mono uppercase text-muted">
                  Annuler
                </button>
                <button
                  onClick={add}
                  disabled={!text.trim()}
                  className="rounded-md bg-amber px-4 py-2 text-xs font-mono uppercase tracking-widest text-graphite disabled:opacity-40"
                >
                  Ajouter
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full rounded-xl border border-dashed border-white/15 px-5 py-4 text-left text-sm font-mono uppercase tracking-widest text-amber hover:border-amber/40"
            >
              + Ajouter une priorité
            </button>
          )}
        </div>
      )}

      {modeRouge && hidden.length === 0 && (
        <p className="text-xs text-teal">Cette liste tient dans ta capacité protégée.</p>
      )}

      {waiting.length > 0 && (
        <details className="rounded-lg border border-white/10 bg-panel/40 px-4 py-3">
          <summary className="cursor-pointer text-xs font-mono uppercase tracking-widest text-muted">
            ⏳ {waiting.length} en attente
          </summary>
          <div className="mt-3 space-y-2">
            {waiting.map((task) => {
              const attention = waitingNeedsAttention(task, projects);
              return (
                <div
                  key={task.id}
                  className={`rounded border px-3 py-3 flex gap-3 items-center ${
                    attention ? "border-alert/40" : "border-white/5"
                  }`}
                >
                  <span className="flex-1 text-sm text-muted">{task.text}</span>
                  {attention && (
                    <span className="text-[9px] text-alert uppercase">échéance proche</span>
                  )}
                  <button
                    onClick={() => patch(task.id, { done: true, waiting: false, waitingSince: undefined })}
                    className="text-xs text-teal"
                  >
                    Reçu
                  </button>
                  <button
                    onClick={() => patch(task.id, { waiting: false, waitingSince: undefined })}
                    className="text-xs text-muted"
                  >
                    Réactiver
                  </button>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {done.length > 0 && (
        <details className="rounded-lg border border-white/10 bg-panel/30 px-4 py-3">
          <summary className="cursor-pointer text-xs font-mono uppercase tracking-widest text-muted">
            Fait ({done.length})
          </summary>
          <div className="mt-2 space-y-1">
            {done.map((task) => (
              <div key={task.id} className="text-sm text-muted line-through py-1">
                {task.text}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
