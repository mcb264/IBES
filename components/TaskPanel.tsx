"use client";

import { useState } from "react";
import { TaskItem } from "@/lib/storage";

export default function TaskPanel({
  items,
  onChange,
  maxOpenTasks,
}: {
  items: TaskItem[];
  onChange: (items: TaskItem[]) => void;
  maxOpenTasks?: number;
}) {
  const [text, setText] = useState("");
  const openCount = items.filter((t) => !t.done).length;
  const limitReached = typeof maxOpenTasks === "number" && openCount >= maxOpenTasks;

  const addTask = () => {
    const value = text.trim();
    if (!value || limitReached) return;
    onChange([...items, { id: crypto.randomUUID(), text: value, done: false }]);
    setText("");
  };

  const toggle = (id: string) => {
    onChange(items.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const remove = (id: string) => onChange(items.filter((t) => t.id !== id));

  const todo = items.filter((t) => !t.done);
  const done = items.filter((t) => t.done);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
            disabled={limitReached}
            placeholder={limitReached ? "Limite du mode rouge atteinte" : "Nouvelle tâche"}
            className="flex-1 min-w-0 bg-panel border border-white/10 rounded-md px-3 py-2.5 text-ink placeholder:text-muted/60 focus:ring-1 focus:ring-amber disabled:opacity-50"
          />
          <button
            onClick={addTask}
            disabled={limitReached}
            className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-md bg-amber text-graphite hover:bg-amber/90 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
        </div>
        {typeof maxOpenTasks === "number" && (
          <p className="text-xs text-alert font-mono uppercase tracking-widest">
            Mode rouge — {openCount}/{maxOpenTasks} tâches actives maximum
          </p>
        )}
      </div>

      {todo.length === 0 && done.length === 0 && (
        <p className="text-sm text-muted">Aucune tâche pour l'instant.</p>
      )}

      {todo.length > 0 && (
        <div className="space-y-2">
          {todo.map((t) => (
            <label key={t.id} className="group flex items-center gap-3 bg-panel border border-white/10 rounded-md px-3 py-2.5 cursor-pointer">
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="w-4 h-4 accent-amber shrink-0" />
              <span className="text-sm flex-1">{t.text}</span>
              <button
                onClick={(e) => { e.preventDefault(); remove(t.id); }}
                aria-label={`Supprimer ${t.text}`}
                className="text-muted hover:text-alert text-xs p-2 -m-2 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >✕</button>
            </label>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-2">
          <span className="block text-xs font-mono uppercase tracking-widest text-muted">Fait ({done.length})</span>
          {done.map((t) => (
            <label key={t.id} className="group flex items-center gap-3 bg-panel/60 border border-white/5 rounded-md px-3 py-2.5 cursor-pointer">
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="w-4 h-4 accent-teal shrink-0" />
              <span className="text-sm flex-1 text-muted line-through">{t.text}</span>
              <button
                onClick={(e) => { e.preventDefault(); remove(t.id); }}
                aria-label={`Supprimer ${t.text}`}
                className="text-muted hover:text-alert text-xs p-2 -m-2 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >✕</button>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
