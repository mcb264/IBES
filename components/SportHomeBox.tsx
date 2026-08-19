"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadCustomWorkspaces,
  recurringComplete,
  recurringProgress,
  type CustomWorkspace,
  type Project,
  type TaskItem,
} from "@/lib/storage";
import { workspaceColor } from "@/lib/workspaceColors";

type SportWorkspace = CustomWorkspace & { mode?: "standard" | "sport" };
type SportTask = TaskItem & {
  sportSteps?: string[];
  projectPaused?: boolean;
};

function currentSportStep(task: TaskItem) {
  const steps = (task as SportTask).sportSteps;
  if (!steps?.length) return null;
  const index = Math.min(task.recurrenceHistory?.length ?? 0, steps.length - 1);
  return { label: steps[index], index, total: steps.length };
}

function activePhase(workspace: CustomWorkspace, tasks: TaskItem[]): Project | undefined {
  return [...workspace.state.projects]
    .filter((project) => !project.done)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .find((project) => {
      const linked = tasks.filter((task) => task.projectId === project.id);
      return linked.length === 0 || linked.some((task) => !(task as SportTask).projectPaused);
    });
}

export default function SportHomeBox() {
  const [workspaces, setWorkspaces] = useState<SportWorkspace[]>([]);

  const refresh = () => {
    setWorkspaces(
      loadCustomWorkspaces().filter(
        (workspace) => (workspace as SportWorkspace).mode === "sport",
      ) as SportWorkspace[],
    );
  };

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("ibes:workspaces-changed", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ibes:workspaces-changed", refresh);
    };
  }, []);

  if (workspaces.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Sport</p>
          <p className="mt-1 text-xs text-muted">Ta progression sportive sans la mélanger à la charge du Programme perso.</p>
        </div>
        <span className="text-[10px] font-mono uppercase text-muted">{workspaces.length} projet{workspaces.length > 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-3">
        {workspaces.map((workspace) => {
          const tasks = workspace.state.briefing.tasks;
          const phase = activePhase(workspace, tasks);
          const phaseTasks = phase ? tasks.filter((task) => task.projectId === phase.id) : tasks;
          const usableTasks = phaseTasks.filter(
            (task) => !task.done && !task.waiting && !(task as SportTask).projectPaused,
          );
          const recurring = usableTasks.filter((task) => !!task.recurringTarget);
          const weeklyTarget = recurring.reduce((sum, task) => sum + recurringProgress(task).target, 0);
          const weeklyDone = recurring.reduce(
            (sum, task) => {
              const progress = recurringProgress(task);
              return sum + Math.min(progress.count, progress.target);
            },
            0,
          );
          const nextTask = usableTasks.find((task) => !task.recurringTarget || !recurringComplete(task));
          const nextStep = nextTask ? currentSportStep(nextTask) : null;
          const color = workspaceColor(workspace);
          const percent = weeklyTarget > 0 ? Math.min(100, Math.round((weeklyDone / weeklyTarget) * 100)) : 0;

          return (
            <Link
              key={workspace.id}
              href={`/projet/${workspace.id}`}
              className="group block overflow-hidden rounded-2xl border bg-panel/80 transition hover:border-white/25"
              style={{ borderColor: `${color}55` }}
            >
              <div className="h-1 w-full" style={{ backgroundColor: color }} />
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl" style={{ color }}>{workspace.name}</h2>
                      {phase && <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-mono uppercase text-muted">{phase.name}</span>}
                    </div>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-muted">
                      {weeklyTarget > 0 ? `${weeklyDone}/${weeklyTarget} séances cette semaine` : "Programme sportif"}
                    </p>
                  </div>
                  <span className="text-muted transition group-hover:text-ink">→</span>
                </div>

                {weeklyTarget > 0 && (
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
                  </div>
                )}

                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Prochaine séance</p>
                    {nextTask ? (
                      <div className="mt-2">
                        <p className="text-lg leading-snug">{nextStep?.label ?? nextTask.text}</p>
                        {nextStep && <p className="mt-1 text-[10px] font-mono uppercase text-muted">{nextTask.text} · séance {nextStep.index + 1}/{nextStep.total}</p>}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm" style={{ color }}>Semaine sportive terminée ✓</p>
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
            </Link>
          );
        })}
      </div>
    </section>
  );
}
