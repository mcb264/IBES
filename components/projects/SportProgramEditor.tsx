"use client";

import type { TaskItem } from "@/lib/storage";

type Props = {
  task: TaskItem;
  accentColor: string;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function SportProgramEditor({ task, accentColor, value, onChange, onCancel, onSave }: Props) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-graphite/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium" style={{ color: accentColor }}>Séances évolutives · {task.text}</p>
          <p className="mt-1 text-[11px] text-muted">1 ligne = 1 séance. Après chaque validation, IBES affiche automatiquement la suivante.</p>
        </div>
        <button onClick={onCancel} className="text-xs text-muted">×</button>
      </div>
      <textarea
        autoFocus
        rows={7}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Course facile — 25 min\nCourse facile — 25 min\nSortie longue — 35 min\nCourse facile — 30 min\n..."}
        className="mt-3 w-full resize-y rounded-lg border border-white/10 bg-panel px-3 py-3 text-sm outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[10px] text-muted">Tu peux coller tout ton programme d’un coup.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-mono uppercase text-muted">Annuler</button>
          <button onClick={onSave} className="rounded-lg px-3 py-2 text-[10px] font-mono uppercase text-graphite" style={{ backgroundColor: accentColor }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
