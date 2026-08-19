"use client";

import type { EffortLevel, TaskItem } from "@/lib/storage";

type Props = {
  task: TaskItem;
  accentColor: string;
  sportMode: boolean;
  paused: boolean;
  onRename: () => void;
  onEffort: (effort: EffortLevel) => void;
  onEditDate: () => void;
  onRecurrence: (times?: number) => void;
  onSportProgram: () => void;
  onToggleWaiting: () => void;
  onDelete: () => void;
};

const EFFORTS: Array<[EffortLevel, string]> = [
  ["light", "Basse"],
  ["normal", "Normale"],
  ["heavy", "Haute"],
];

export default function TaskMenu({
  task,
  accentColor,
  sportMode,
  paused,
  onRename,
  onEffort,
  onEditDate,
  onRecurrence,
  onSportProgram,
  onToggleWaiting,
  onDelete,
}: Props) {
  return (
    <div
      className="task-menu absolute right-0 top-7 z-30 w-[250px] max-h-[min(72vh,450px)] overflow-y-auto rounded-xl border border-white/15 p-2 shadow-2xl"
      style={{ backgroundColor: "#0c1116" }}
    >
      <button onClick={onRename} className="w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-white/[.06]">Renommer</button>

      <p className="px-3 pb-1 pt-2 text-[9px] font-mono uppercase text-muted">Charge</p>
      <div className="grid grid-cols-3 gap-1 px-1">
        {EFFORTS.map(([value, label]) => (
          <button
            key={value}
            onClick={() => onEffort(value)}
            className="rounded-lg border border-white/10 px-2 py-2 text-[10px] hover:bg-white/[.06]"
            style={task.effort === value || (!task.effort && value === "normal") ? { color: accentColor, borderColor: `${accentColor}66` } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <button onClick={onEditDate} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-white/[.06]">Échéance</button>

      <p className="px-3 pb-1 pt-2 text-[9px] font-mono uppercase text-muted">Récurrence</p>
      <div className="grid grid-cols-3 gap-1 px-1">
        {[1, 2, 3, 4, 5, 6, 7].map((times) => (
          <button
            key={times}
            onClick={() => onRecurrence(times)}
            className="min-h-9 rounded-lg border border-white/10 px-1 text-[10px] hover:bg-white/[.06]"
            style={task.recurringTarget === times ? { color: accentColor, borderColor: `${accentColor}66` } : undefined}
          >
            {times}× / sem.
          </button>
        ))}
      </div>
      {!!task.recurringTarget && (
        <button onClick={() => onRecurrence()} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-white/[.06]">Aucune récurrence</button>
      )}

      {sportMode && (
        <>
          <div className="my-2 border-t border-white/10" />
          <p className="px-3 pb-1 pt-1 text-[9px] font-mono uppercase" style={{ color: accentColor }}>Mode Sport</p>
          <button onClick={onSportProgram} className="w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-white/[.06]">Séances évolutives</button>
        </>
      )}

      <div className="my-2 border-t border-white/10" />
      <button disabled={paused} onClick={onToggleWaiting} className="w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-white/[.06] disabled:opacity-30">
        {task.waiting ? "Réactiver" : "Mettre en attente"}
      </button>
      <button onClick={onDelete} className="w-full rounded-lg px-3 py-2 text-left text-xs text-alert hover:bg-white/[.06]">Supprimer</button>
    </div>
  );
}
