"use client";

import type { EffortLevel, TaskItem } from "@/lib/storage";
import { recurringProgress } from "@/lib/storage";
import TaskMenu from "./TaskMenu";


type Props = {
  task: TaskItem;
  index: number;
  accentColor: string;
  today: string;
  sportMode: boolean;
  editingText: boolean;
  editText: string;
  editingDate: boolean;
  menuOpen: boolean;
  onEditTextChange: (value: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onToggle: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onStartRename: () => void;
  onStartDate: () => void;
  onDateCommit: (value?: string) => void;
  onMenuToggle: () => void;
  onEffort: (effort: EffortLevel) => void;
  onRecurrence: (times?: number) => void;
  onSportProgram: () => void;
  onToggleWaiting: () => void;
  onDelete: () => void;
};

const EFFORT_LABEL: Record<EffortLevel, string> = { light: "Basse", normal: "Normale", heavy: "Haute" };

function sportStep(task: TaskItem) {
  const steps = task.sportSteps;
  if (!steps?.length) return null;
  const index = Math.min(task.recurrenceHistory?.length ?? 0, steps.length - 1);
  return { label: steps[index], index, total: steps.length };
}

export default function TaskRow(props: Props) {
  const { task, index, accentColor, today, sportMode } = props;
  const progress = recurringProgress(task);
  const recurrenceComplete = !!task.recurringTarget && progress.target > 0 && progress.count >= progress.target;
  const nextSportStep = sportMode ? sportStep(task) : null;
  const paused = !!task.projectPaused;

  return (
    <div
      draggable={!paused}
      onDragStart={() => !paused && props.onDragStart()}
      onDragEnd={props.onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => !paused && props.onDrop()}
      className="task-row flex items-center gap-3 rounded-xl border border-white/10 bg-graphite/40 px-3 py-3.5"
      style={{ boxShadow: `inset 2px 0 0 ${accentColor}`, opacity: task.waiting ? 0.55 : 1 }}
    >
      <button onClick={props.onToggle} disabled={recurrenceComplete || paused} className="h-5 w-5 shrink-0 rounded border border-white/20 text-transparent disabled:opacity-30">✓</button>
      <span className="font-mono text-[10px] text-muted">{String(index + 1).padStart(2, "0")}</span>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accentColor }} />

      <div className="min-w-0 flex-1">
        {props.editingText ? (
          <input
            autoFocus
            value={props.editText}
            onChange={(e) => props.onEditTextChange(e.target.value)}
            onBlur={props.onRenameCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") props.onRenameCommit();
              if (e.key === "Escape") props.onRenameCancel();
            }}
            className="w-full rounded border border-white/20 bg-graphite px-2 py-1 text-sm outline-none"
          />
        ) : <span className="text-sm">{task.text}</span>}
        {nextSportStep && <p className="mt-1 text-[11px] text-muted"><span style={{ color: accentColor }}>Prochaine séance · </span>{nextSportStep.label}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!!task.recurringTarget && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase" style={recurrenceComplete ? { color: accentColor } : undefined}>{progress.count}/{progress.target} semaine</span>}
        {nextSportStep && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">{nextSportStep.index + 1}/{nextSportStep.total}</span>}
        <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">{EFFORT_LABEL[task.effort ?? "normal"]}</span>
        {task.todayDate === today && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">Aujourd’hui</span>}
        {task.waiting && <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase text-muted">En attente</span>}

        {props.editingDate ? (
          <input autoFocus type="date" defaultValue={task.dueDate || ""} onBlur={(e) => props.onDateCommit(e.target.value || undefined)} className="rounded-md border border-white/10 bg-graphite px-2 py-1 text-[9px]" />
        ) : task.dueDate ? (
          <button onClick={props.onStartDate} className="text-[9px] font-mono text-muted">{new Date(`${task.dueDate}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</button>
        ) : null}

        <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={props.onMenuToggle} className="px-1.5 text-muted">•••</button>
          {props.menuOpen && (
            <TaskMenu
              task={task}
              accentColor={accentColor}
              sportMode={sportMode}
              paused={paused}
              onRename={props.onStartRename}
              onEffort={props.onEffort}
              onEditDate={props.onStartDate}
              onRecurrence={props.onRecurrence}
              onSportProgram={props.onSportProgram}
              onToggleWaiting={props.onToggleWaiting}
              onDelete={props.onDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
