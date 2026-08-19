"use client";

import { useState } from "react";
import {
  EffortLevel,
  Project,
  TaskItem,
  completeRecurringTask,
  localDateKey,
  recurringProgress,
} from "@/lib/storage";

const EFFORT_LABEL: Record<EffortLevel, string> = {
  light: "Basse",
  normal: "Normale",
  heavy: "Haute",
};

type ProjectMode = "standard" | "sport";
type SportProject = Project & { mode?: ProjectMode };
type SportTask = TaskItem & { sportSteps?: string[] };
type ProjectTask = TaskItem & {
  projectPaused?: boolean;
  projectPausedWasWaiting?: boolean;
};

type Props = {
  projects: Project[];
  tasks: TaskItem[];
  accentColor: string;
  onChange: (projects: Project[]) => void;
  onTasksChange?: (tasks: TaskItem[]) => void;
};

function currentSportStep(task: TaskItem) {
  const sportTask = task as SportTask;
  if (!sportTask.sportSteps?.length) return null;
  const index = Math.min(task.recurrenceHistory?.length ?? 0, sportTask.sportSteps.length - 1);
  return { label: sportTask.sportSteps[index], index, total: sportTask.sportSteps.length };
}

export default function ProjectsPanelV2({ projects, tasks, accentColor, onChange, onTasksChange }: Props) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectMode, setProjectMode] = useState<ProjectMode>("standard");
  const [newActions, setNewActions] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [projectDragged, setProjectDragged] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingActionDate, setEditingActionDate] = useState<string | null>(null);
  const [editingActionText, setEditingActionText] = useState<string | null>(null);
  const [actionText, setActionText] = useState("");
  const [editingSportProgram, setEditingSportProgram] = useState<string | null>(null);
  const [sportProgramText, setSportProgramText] = useState("");

  const today = localDateKey();
  const ordered = [...projects].sort((a, b) =>
    (a.done !== b.done ? (a.done ? 1 : -1) : 0) ||
    (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
    a.name.localeCompare(b.name, "fr"),
  );

  const normalizeOrder = (items: Project[]) => items.map((project, index) => ({ ...project, order: index }));

  const addProject = () => {
    if (!name.trim()) return;
    const project: SportProject = {
      id: crypto.randomUUID(),
      name: name.trim(),
      goal: goal.trim(),
      dueDate: dueDate || undefined,
      done: false,
      order: projects.length,
      mode: projectMode,
    };
    onChange([...projects, project]);
    setName("");
    setGoal("");
    setDueDate("");
    setProjectMode("standard");
    setCreating(false);
  };

  const moveProject = (id: string, delta: number) => {
    const list = [...ordered];
    const from = list.findIndex((project) => project.id === id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
    onChange(normalizeOrder(list));
    setMenu(null);
  };

  const dropProject = (targetId: string) => {
    if (!projectDragged || projectDragged === targetId) return;
    const list = [...ordered];
    const from = list.findIndex((project) => project.id === projectDragged);
    const to = list.findIndex((project) => project.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    onChange(normalizeOrder(list));
    setProjectDragged(null);
  };

  const isProjectPaused = (projectId: string) =>
    tasks.some((task) => task.projectId === projectId && (task as ProjectTask).projectPaused);

  const toggleProjectPause = (projectId: string) => {
    if (!onTasksChange) return;
    const pause = !isProjectPaused(projectId);
    onTasksChange(tasks.map((task) => {
      if (task.projectId !== projectId) return task;
      const marked = task as ProjectTask;
      if (pause) {
        return {
          ...task,
          waiting: true,
          waitingSince: task.waitingSince ?? today,
          todayDate: undefined,
          capacityOverrideDate: undefined,
          projectPaused: true,
          projectPausedWasWaiting: !!task.waiting,
        } as ProjectTask;
      }
      if (!marked.projectPaused) return task;
      return {
        ...task,
        waiting: marked.projectPausedWasWaiting || false,
        waitingSince: marked.projectPausedWasWaiting ? task.waitingSince : undefined,
        projectPaused: undefined,
        projectPausedWasWaiting: undefined,
        todayDate: undefined,
        capacityOverrideDate: undefined,
      } as ProjectTask;
    }));
    setMenu(null);
  };

  const addAction = (projectId: string) => {
    const text = (newActions[projectId] || "").trim();
    if (!text || !onTasksChange) return;
    const paused = isProjectPaused(projectId);
    onTasksChange([...tasks, {
      id: crypto.randomUUID(),
      text,
      done: false,
      effort: "normal",
      projectId,
      ...(paused ? { waiting: true, waitingSince: today, projectPaused: true, projectPausedWasWaiting: false } : {}),
    } as ProjectTask]);
    setNewActions((current) => ({ ...current, [projectId]: "" }));
  };

  const patchAction = (id: string, patch: Partial<TaskItem>) => {
    onTasksChange?.(tasks.map((task) => task.id === id ? { ...task, ...patch } : task));
  };

  const toggleAction = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task || (task as ProjectTask).projectPaused) return;
    if (task.recurringTarget) {
      onTasksChange?.(tasks.map((item) => item.id === id ? completeRecurringTask(item) : item));
      return;
    }
    patchAction(id, {
      done: !task.done,
      todayDate: task.done ? task.todayDate : undefined,
      waiting: task.done ? task.waiting : false,
    });
  };

  const setRecurrence = (id: string, times?: number) => {
    patchAction(id, times ? {
      recurringTarget: times,
      recurringPeriod: "week",
      recurringCount: 0,
      recurringPeriodKey: undefined,
      recurrenceHistory: [],
      done: false,
    } : {
      recurringTarget: undefined,
      recurringPeriod: undefined,
      recurringCount: undefined,
      recurringPeriodKey: undefined,
      recurrenceHistory: undefined,
    });
    setMenu(null);
  };

  const toggleWaiting = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task || (task as ProjectTask).projectPaused) return;
    patchAction(id, {
      waiting: !task.waiting,
      waitingSince: !task.waiting ? today : undefined,
      todayDate: !task.waiting ? undefined : task.todayDate,
    });
    setMenu(null);
  };

  const setEffort = (id: string, effort: EffortLevel) => {
    patchAction(id, { effort });
    setMenu(null);
  };

  const deleteAction = (id: string) => {
    onTasksChange?.(tasks.filter((task) => task.id !== id));
    setMenu(null);
  };

  const startRenamingAction = (task: TaskItem) => {
    setEditingActionText(task.id);
    setActionText(task.text);
    setMenu(null);
  };

  const renameAction = (id: string) => {
    const text = actionText.trim();
    if (text) patchAction(id, { text });
    setEditingActionText(null);
    setActionText("");
  };

  const startSportProgram = (task: TaskItem) => {
    setEditingSportProgram(task.id);
    setSportProgramText(((task as SportTask).sportSteps ?? []).join("\n"));
    setMenu(null);
  };

  const saveSportProgram = (id: string) => {
    const steps = sportProgramText.split("\n").map((line) => line.trim()).filter(Boolean);
    onTasksChange?.(tasks.map((task) => task.id === id
      ? ({ ...task, sportSteps: steps.length ? steps : undefined } as SportTask)
      : task));
    setEditingSportProgram(null);
    setSportProgramText("");
  };

  const reorder = (projectId: string, targetId: string) => {
    if (!dragged || dragged === targetId || !onTasksChange) return;
    const projectTasks = tasks.filter((task) => task.projectId === projectId);
    const from = projectTasks.findIndex((task) => task.id === dragged);
    const to = projectTasks.findIndex((task) => task.id === targetId);
    if (from < 0 || to < 0) return;
    const reordered = [...projectTasks];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    let index = 0;
    onTasksChange(tasks.map((task) => task.projectId === projectId ? reordered[index++] : task));
    setDragged(null);
  };

  const editingSportTask = editingSportProgram ? tasks.find((task) => task.id === editingSportProgram) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[.22em] text-muted">Pilotage</p>
          <h2 className="font-display text-3xl mt-1" style={{ color: accentColor }}>Projets</h2>
          <p className="text-sm text-muted mt-2">La couleur identifie le grand projet sans envahir l’interface.</p>
        </div>
        <button
          onClick={() => setCreating((value) => !value)}
          className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-[11px] font-mono uppercase tracking-widest"
          style={{ color: accentColor }}
        >{creating ? "Fermer" : "+ Nouveau"}</button>
      </div>

      {creating && (
        <div className="rounded-2xl border border-white/10 bg-panel p-5 space-y-5" style={{ boxShadow: `inset 3px 0 0 ${accentColor}` }}>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: accentColor }}>Nouveau projet</p>
            <p className="mt-1 text-xs text-muted">Choisis son fonctionnement. Un projet Sport reste un projet IBES normal.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du projet" className="bg-graphite border border-white/10 rounded-lg px-4 py-3" />
            <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Résultat attendu" className="bg-graphite border border-white/10 rounded-lg px-4 py-3" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {(["standard", "sport"] as ProjectMode[]).map((mode) => {
              const active = projectMode === mode;
              return (
                <button key={mode} type="button" onClick={() => setProjectMode(mode)} className="rounded-xl border bg-graphite/50 p-4 text-left transition" style={{ borderColor: active ? accentColor : "rgba(255,255,255,.10)" }}>
                  <div className="flex items-center justify-between"><span className="font-display text-base">{mode === "sport" ? "Mode Sport" : "Projet standard"}</span>{active && <span style={{ color: accentColor }}>✓</span>}</div>
                  <p className="mt-1 text-xs text-muted">{mode === "sport" ? "Séances évolutives et outils sportifs à venir." : "Actions, échéances, charges et récurrences classiques."}</p>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1 bg-graphite border border-white/10 rounded-lg px-4 py-3 text-sm" />
            <button onClick={addProject} disabled={!name.trim()} className="rounded-lg px-5 py-3 font-mono text-xs uppercase text-graphite disabled:opacity-40" style={{ backgroundColor: accentColor }}>Créer</button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {projects.length === 0 && (
          <div className="rounded-2xl border border-white/10 border-dashed px-6 py-10 text-center">
            <p className="font-display text-xl" style={{ color: accentColor }}>Aucun projet.</p>
          </div>
        )}

        {ordered.map((project, projectIndex) => {
          const sportProject = project as SportProject;
          const linked = tasks.filter((task) => task.projectId === project.id);
          const open = linked.filter((task) => !task.done);
          const done = linked.filter((task) => task.done);
          const paused = isProjectPaused(project.id);

          return (
            <article
              key={project.id}
              draggable
              onDragStart={(event) => {
                if ((event.target as HTMLElement).closest("[data-no-project-drag]")) {
                  event.preventDefault();
                  return;
                }
                setProjectDragged(project.id);
              }}
              onDragEnd={() => setProjectDragged(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropProject(project.id)}
              className={`rounded-2xl border border-white/10 bg-panel overflow-visible ${project.done ? "opacity-60" : ""} ${projectDragged === project.id ? "opacity-40" : ""}`}
              style={{ boxShadow: `inset 3px 0 0 ${accentColor}` }}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <button
                    data-no-project-drag
                    onClick={() => onChange(projects.map((item) => item.id === project.id ? { ...item, done: !item.done } : item))}
                    className="mt-1 w-6 h-6 rounded-md border border-white/20 shrink-0 text-xs"
                    style={project.done ? { color: accentColor } : { color: "transparent" }}
                  >✓</button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="cursor-grab select-none text-muted/40" title="Glisser pour réordonner">⠿</span>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                      <h3 className={`font-display text-2xl ${project.done ? "line-through" : ""}`} style={{ color: accentColor }}>{project.name}</h3>
                      {sportProject.mode === "sport" && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase" style={{ color: accentColor }}>Sport</span>}
                      {paused && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">En attente</span>}
                    </div>
                    {project.goal && <p className="text-sm text-muted mt-3">{project.goal}</p>}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="rounded-full border border-white/10 bg-graphite px-2.5 py-1 text-[10px] font-mono uppercase text-muted">{open.length} à faire</span>
                      {done.length > 0 && <span className="rounded-full border border-white/10 bg-graphite px-2.5 py-1 text-[10px] font-mono uppercase text-muted">{done.length} terminée{done.length > 1 ? "s" : ""}</span>}
                      {editingDate === project.id ? (
                        <input
                          data-no-project-drag autoFocus type="date" defaultValue={project.dueDate || ""}
                          onBlur={(event) => {
                            onChange(projects.map((item) => item.id === project.id ? { ...item, dueDate: event.target.value || undefined } : item));
                            setEditingDate(null);
                          }}
                          className="bg-graphite rounded-full px-3 py-1 text-[10px] border border-white/10"
                        />
                      ) : (
                        <button data-no-project-drag onClick={() => setEditingDate(project.id)} className="rounded-full border border-white/10 bg-graphite px-2.5 py-1 text-[10px] font-mono uppercase text-muted">
                          {project.dueDate ? new Date(`${project.dueDate}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "+ échéance"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div data-no-project-drag className="relative" onPointerDown={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => setMenu(menu === `p:${project.id}` ? null : `p:${project.id}`)} className="px-2 py-1 text-muted">•••</button>
                    {menu === `p:${project.id}` && (
                      <div className="absolute right-0 top-8 z-20 w-52 rounded-lg border border-white/10 bg-graphite p-1 shadow-xl">
                        <button disabled={projectIndex === 0} onClick={() => moveProject(project.id, -1)} className="w-full px-3 py-2 text-left text-xs text-muted disabled:opacity-30">↑ Monter</button>
                        <button disabled={projectIndex === ordered.length - 1} onClick={() => moveProject(project.id, 1)} className="w-full px-3 py-2 text-left text-xs text-muted disabled:opacity-30">↓ Descendre</button>
                        <div className="my-1 border-t border-white/10" />
                        <button onClick={() => toggleProjectPause(project.id)} className="w-full px-3 py-2 text-left text-xs text-muted">{paused ? "Reprendre le sous-projet" : "Mettre en attente"}</button>
                        <button onClick={() => { onChange(projects.filter((item) => item.id !== project.id)); setMenu(null); }} className="w-full px-3 py-2 text-left text-xs text-alert">Supprimer le projet</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div data-no-project-drag className="border-t border-white/10 px-5 sm:px-6 py-5 rounded-b-2xl bg-white/[.015]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-mono uppercase tracking-[.18em]" style={{ color: accentColor }}>Actions</p>
                  {sportProject.mode === "sport" && <span className="text-[9px] font-mono uppercase text-muted">Séances évolutives disponibles</span>}
                </div>

                <div className="space-y-2">
                  {open.length === 0 && <p className="text-sm text-muted py-2">Aucune action ouverte.</p>}
                  {open.map((task, taskIndex) => {
                    const progress = recurringProgress(task);
                    const recurrenceComplete = !!task.recurringTarget && progress.target > 0 && progress.count >= progress.target;
                    const sportStep = sportProject.mode === "sport" ? currentSportStep(task) : null;
                    const taskPaused = !!(task as ProjectTask).projectPaused;

                    return (
                      <div
                        key={task.id}
                        draggable={!taskPaused}
                        onDragStart={() => !taskPaused && setDragged(task.id)}
                        onDragEnd={() => setDragged(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => !taskPaused && reorder(project.id, task.id)}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-graphite/40 px-3 py-3.5"
                        style={{ boxShadow: `inset 2px 0 0 ${accentColor}`, opacity: task.waiting ? 0.55 : 1 }}
                      >
                        <button onClick={() => toggleAction(task.id)} disabled={recurrenceComplete || taskPaused} className="w-5 h-5 rounded border border-white/20 text-transparent disabled:opacity-30">✓</button>
                        <span className="font-mono text-[10px] text-muted">{String(taskIndex + 1).padStart(2, "0")}</span>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        <div className="min-w-0 flex-1">
                          {editingActionText === task.id ? (
                            <input
                              autoFocus value={actionText} onChange={(e) => setActionText(e.target.value)} onBlur={() => renameAction(task.id)}
                              onKeyDown={(e) => { if (e.key === "Enter") renameAction(task.id); if (e.key === "Escape") { setEditingActionText(null); setActionText(""); } }}
                              className="w-full rounded border border-white/20 bg-graphite px-2 py-1 text-sm outline-none"
                            />
                          ) : <span className="text-sm">{task.text}</span>}
                          {sportStep && <p className="mt-1 text-[11px] text-muted"><span style={{ color: accentColor }}>Prochaine séance · </span>{sportStep.label}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {!!task.recurringTarget && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase" style={recurrenceComplete ? { color: accentColor } : undefined}>{progress.count}/{progress.target} semaine</span>}
                          {sportStep && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">{sportStep.index + 1}/{sportStep.total}</span>}
                          <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">{EFFORT_LABEL[task.effort ?? "normal"]}</span>
                          {task.todayDate === today && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">Aujourd’hui</span>}
                          {task.waiting && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">En attente</span>}
                          {editingActionDate === task.id ? (
                            <input autoFocus type="date" defaultValue={task.dueDate || ""} onBlur={(e) => { patchAction(task.id, { dueDate: e.target.value || undefined }); setEditingActionDate(null); }} className="bg-graphite rounded-md px-2 py-1 text-[9px] border border-white/10" />
                          ) : task.dueDate ? (
                            <button onClick={() => setEditingActionDate(task.id)} className="text-[9px] font-mono text-muted">{new Date(`${task.dueDate}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</button>
                          ) : null}

                          <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
                            <button onClick={() => setMenu(menu === `a:${task.id}` ? null : `a:${task.id}`)} className="px-1.5 text-muted">•••</button>
                            {menu === `a:${task.id}` && (
                              <div className="absolute right-0 top-7 z-30 w-56 rounded-lg border border-white/10 bg-graphite p-1 shadow-xl">
                                <button onClick={() => startRenamingAction(task)} className="w-full px-3 py-2 text-left text-xs text-muted">Renommer</button>
                                <p className="px-3 pt-2 pb-1 text-[9px] font-mono uppercase text-muted">Charge</p>
                                {([ ["light", "Basse"], ["normal", "Normale"], ["heavy", "Haute"] ] as const).map(([value, label]) => (
                                  <button key={value} onClick={() => setEffort(task.id, value)} className="w-full px-3 py-1.5 text-left text-xs" style={task.effort === value || (!task.effort && value === "normal") ? { color: accentColor } : undefined}>{label}</button>
                                ))}
                                <button onClick={() => { setEditingActionDate(task.id); setMenu(null); }} className="w-full px-3 py-2 text-left text-xs text-muted">Échéance</button>
                                <p className="px-3 pt-2 pb-1 text-[9px] font-mono uppercase text-muted">Récurrence</p>
                                {[1,2,3,4,5,6,7].map((times) => <button key={times} onClick={() => setRecurrence(task.id, times)} className="w-full px-3 py-1.5 text-left text-xs" style={task.recurringTarget === times ? { color: accentColor } : undefined}>{times}× / semaine</button>)}
                                {!!task.recurringTarget && <button onClick={() => setRecurrence(task.id)} className="w-full px-3 py-1.5 text-left text-xs text-muted">Aucune récurrence</button>}
                                {sportProject.mode === "sport" && <><div className="my-1 border-t border-white/10" /><p className="px-3 pt-2 pb-1 text-[9px] font-mono uppercase" style={{ color: accentColor }}>Mode Sport</p><button onClick={() => startSportProgram(task)} className="w-full px-3 py-2 text-left text-xs text-muted">Séances évolutives</button></>}
                                <button disabled={taskPaused} onClick={() => toggleWaiting(task.id)} className="w-full px-3 py-2 text-left text-xs text-muted disabled:opacity-30">{task.waiting ? "Réactiver" : "Mettre en attente"}</button>
                                <button onClick={() => deleteAction(task.id)} className="w-full px-3 py-2 text-left text-xs text-alert">Supprimer</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {editingSportTask?.projectId === project.id && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-graphite/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-xs font-medium" style={{ color: accentColor }}>Séances évolutives · {editingSportTask.text}</p><p className="mt-1 text-[11px] text-muted">1 ligne = 1 séance. Après chaque validation, IBES affiche automatiquement la suivante.</p></div>
                      <button onClick={() => { setEditingSportProgram(null); setSportProgramText(""); }} className="text-xs text-muted">×</button>
                    </div>
                    <textarea autoFocus rows={7} value={sportProgramText} onChange={(e) => setSportProgramText(e.target.value)} placeholder={"Course facile — 25 min\nCourse facile — 25 min\nSortie longue — 35 min\nCourse facile — 30 min\n..."} className="mt-3 w-full resize-y rounded-lg border border-white/10 bg-panel px-3 py-3 text-sm outline-none" />
                    <div className="mt-3 flex items-center justify-between gap-3"><p className="text-[10px] text-muted">Tu peux coller tout ton programme d’un coup.</p><div className="flex gap-2"><button onClick={() => { setEditingSportProgram(null); setSportProgramText(""); }} className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-mono uppercase text-muted">Annuler</button><button onClick={() => saveSportProgram(editingSportTask.id)} className="rounded-lg px-3 py-2 text-[10px] font-mono uppercase text-graphite" style={{ backgroundColor: accentColor }}>Enregistrer</button></div></div>
                  </div>
                )}

                {done.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-[10px] font-mono uppercase text-muted">{done.length} terminée{done.length > 1 ? "s" : ""}</summary>
                    <div className="mt-2 space-y-1">
                      {done.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-muted">
                          <button onClick={() => toggleAction(task.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span style={{ color: accentColor }}>✓</span><span className="line-through flex-1 truncate">{task.text}</span><span className="text-[9px] font-mono uppercase">Réouvrir</span></button>
                          <button onClick={() => startRenamingAction(task)} className="text-muted/50 hover:text-ink">✎</button>
                          <button onClick={() => deleteAction(task.id)} className="text-muted/30 hover:text-alert">×</button>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {onTasksChange && (
                  <div className="mt-4 flex gap-2">
                    <input value={newActions[project.id] || ""} onChange={(e) => setNewActions((current) => ({ ...current, [project.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addAction(project.id); }} placeholder={sportProject.mode === "sport" ? "Ajouter une séance / action…" : "Ajouter une action…"} className="min-w-0 flex-1 bg-transparent border-b border-white/10 px-1 py-2 text-sm outline-none" />
                    <button onClick={() => addAction(project.id)} disabled={!(newActions[project.id] || "").trim()} className="text-[10px] font-mono uppercase tracking-widest disabled:opacity-30" style={{ color: accentColor }}>Ajouter</button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
