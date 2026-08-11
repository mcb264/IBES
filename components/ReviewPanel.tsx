"use client";

import { ReviewDraft, ReviewEntry, CompletedTask } from "@/lib/storage";

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full bg-panel border border-white/10 rounded-md px-3 py-2.5 text-ink placeholder:text-muted/60 focus:ring-1 focus:ring-amber"
      />
    </label>
  );
}

function dayLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function ReviewPanel({
  draft,
  history,
  completedTasks,
  onDraftChange,
  onSave,
}: {
  draft: ReviewDraft;
  history: ReviewEntry[];
  completedTasks: CompletedTask[];
  onDraftChange: (d: ReviewDraft) => void;
  onSave: (entry: ReviewEntry) => void;
}) {
  const set = (k: keyof ReviewDraft) => (v: string) =>
    onDraftChange({ ...draft, [k]: v });

  const save = () => {
    onSave({
      ...draft,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      tasksDoneCount: completedTasks.length,
    });
  };

  return (
    <div className="space-y-8">
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <span className="block text-xs font-mono uppercase tracking-widest text-muted">
            Tâches réalisées cette semaine ({completedTasks.length})
          </span>
          <div className="space-y-1.5">
            {completedTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 bg-panel border border-white/10 rounded-md px-3 py-2 text-sm"
              >
                <span>{t.text}</span>
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest shrink-0">
                  {dayLabel(t.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Area label="Ce qui a réellement avancé" value={draft.advanced} onChange={set("advanced")} />
        <Area label="Ce qui n'a pas été fait" value={draft.notDone} onChange={set("notDone")} />
        <Area label="Pourquoi" value={draft.why} onChange={set("why")} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Area label="Ce qu'on garde" value={draft.keep} onChange={set("keep")} />
          <Area label="Ce qu'on modifie" value={draft.change} onChange={set("change")} />
        </div>
      </div>

      <div className="space-y-3">
        <span className="block text-xs font-mono uppercase tracking-widest text-muted">
          3 priorités pour la semaine prochaine
        </span>
        <div className="grid sm:grid-cols-3 gap-3">
          {(["next1", "next2", "next3"] as const).map((k, i) => (
            <input
              key={k}
              value={draft[k]}
              onChange={(e) => set(k)(e.target.value)}
              placeholder={`Priorité ${i + 1}`}
              className="w-full bg-panel border border-white/10 rounded-md px-3 py-2.5 text-ink placeholder:text-muted/60 focus:ring-1 focus:ring-amber"
            />
          ))}
        </div>
      </div>

      <button
        onClick={save}
        className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-md bg-amber text-graphite hover:bg-amber/90"
      >
        Enregistrer le bilan
      </button>

      {history.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <span className="block text-xs font-mono uppercase tracking-widest text-muted">
            Historique ({history.length})
          </span>
          <div className="space-y-2">
            {history.map((h) => (
              <details key={h.id} className="bg-panel border border-white/10 rounded-md px-3 py-2">
                <summary className="cursor-pointer text-sm font-mono text-muted">
                  {new Date(h.savedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </summary>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-muted">Avancé — </span>{h.advanced || "—"}</p>
                  <p><span className="text-muted">Non fait — </span>{h.notDone || "—"}</p>
                  <p><span className="text-muted">Pourquoi — </span>{h.why || "—"}</p>
                  {typeof h.tasksDoneCount === "number" && (
                    <p><span className="text-muted">Tâches réalisées — </span>{h.tasksDoneCount}</p>
                  )}
                  <p>
                    <span className="text-muted">Priorités suivantes — </span>
                    {[h.next1, h.next2, h.next3].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
