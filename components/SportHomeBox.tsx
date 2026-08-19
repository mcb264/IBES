"use client";

import Link from "next/link";
import {
  completeRecurringTask,
  localDateKey,
  recurringProgress,
  saveCustomWorkspace,
  type CustomWorkspace,
  type TaskItem,
} from "@/lib/storage";
import { selectActiveSportTasks } from "@/lib/sportHome";
import { workspaceColor } from "@/lib/workspaceColors";

function currentSportStep(task: TaskItem) {
  const steps = task.sportSteps;
  if (!steps?.length) return null;
  const index = Math.min(task.recurrenceHistory?.length ?? 0, steps.length - 1);
  return { label: steps[index], index, total: steps.length };
}

export default function SportHomeBox({ workspaces }: { workspaces: CustomWorkspace[] }) {
  const sportWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.mode === "sport" ||
      workspace.state.projects.some((project) => project.mode === "sport") ||
      workspace.state.briefing.tasks.some((task) => !!task.sportSteps?.length),
  );

  if (sportWorkspaces.length === 0) return null;

  const completeTask = (workspace: CustomWorkspace, task: TaskItem) => {
    const today = localDateKey();
    const recurring = !!task.recurringTarget;
    const completedTask = recurring
      ? completeRecurringTask(task, today)
      : { ...task, done: true, todayDate: undefined, capacityOverrideDate: undefined };
    const completionId = recurring ? `${task.id}:${today}:${(task.recurringCount ?? 0) + 1}` : task.id;
    const completedThisWeek = workspace.state.completedThisWeek.some((item) => item.id === completionId)
      ? workspace.state.completedThisWeek
      : [...workspace.state.completedThisWeek, { id: completionId, text: task.text, date: today, kind: "task" as const }];
    saveCustomWorkspace(workspace.id, {
      ...workspace.state,
      completedThisWeek,
      briefing: {
        ...workspace.state.briefing,
        tasks: workspace.state.briefing.tasks.map((item) => item.id === task.id ? completedTask : item),
      },
    });
    window.dispatchEvent(new Event("ibes:workspaces-changed"));
  };

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Programme Sport</p>
          <p className="mt-1 text-xs text-muted">Objectif à part · hors calcul de charge du Programme perso.</p>
        </div>
        <span className="text-[10px] font-mono uppercase text-muted">{sportWorkspaces.length} projet{sportWorkspaces.length > 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-3">
        {sportWorkspaces.map((workspace) => {
          const tasks = workspace.state.briefing.tasks;
          const { phase, tasks: usableTasks } = selectActiveSportTasks(workspace.state.projects, tasks);
          const recurring = usableTasks.filter((task) => !!task.recurringTarget);
          const weeklyTarget = recurring.reduce((sum, task) => sum + recurringProgress(task).target, 0);
          const weeklyDone = recurring.reduce((sum, task) => {
            const progress = recurringProgress(task);
            return sum + Math.min(progress.count, progress.target);
          }, 0);
          const color = workspaceColor(workspace);
          const percent = weeklyTarget > 0 ? Math.min(100, Math.round((weeklyDone / weeklyTarget) * 100)) : 0;

          return (
            <article
              key={workspace.id}
              className="group overflow-hidden rounded-2xl border bg-panel/80 transition hover:border-white/25"
              style={{ borderColor: `${color}55` }}
            >
              <div className="h-1 w-full" style={{ backgroundColor: color }} />
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/projet/${workspace.id}`} className="font-display text-2xl hover:underline" style={{ color }}>{workspace.name}</Link>
                      {phase && <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-mono uppercase text-muted">{phase.name}</span>}
                    </div>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-muted">
                      {weeklyTarget > 0 ? `${weeklyDone}/${weeklyTarget} séances cette semaine` : "Programme sportif"}
                    </p>
                  </div>
                  <Link href={`/projet/${workspace.id}`} aria-label={`Ouvrir ${workspace.name}`} className="text-muted transition group-hover:text-ink">→</Link>
                </div>

                {weeklyTarget > 0 && (
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
                  </div>
                )}

                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Séances en cours</p>
                    {usableTasks.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {usableTasks.slice(0, 3).map((task) => {
                          const step = currentSportStep(task);
                          return <div key={task.id} className="flex items-start gap-3">
                            <button type="button" onClick={()=>completeTask(workspace,task)} aria-label={`Terminer ${task.text}`} className="mt-0.5 h-5 w-5 shrink-0 rounded border border-white/25 text-transparent hover:border-teal hover:text-teal">✓</button>
                            <div><p className="text-base leading-snug">{step?.label ?? task.text}</p>
                            {step && <p className="mt-0.5 text-[10px] font-mono uppercase text-muted">{task.text} · séance {step.index + 1}/{step.total}</p>}</div>
                          </div>;
                        })}
                        {usableTasks.length > 3 && <p className="text-[10px] text-muted">+ {usableTasks.length - 3} autre{usableTasks.length - 3 > 1 ? "s" : ""}</p>}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm" style={{ color }}>Aucune séance active pour cette phase.</p>
                    )}
                  </div>

                  {phase?.dueDate && (
                    <div className="sm:text-right">
                      <p className="text-[9px] font-mono uppercase text-muted">Échéance phase</p>
                      <p className="mt-1 text-xs font-mono" style={{ color }}>
                        {new Date(`${phase.dueDate}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
