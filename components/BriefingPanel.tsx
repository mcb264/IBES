"use client";

import { BriefingData, TaskItem } from "@/lib/storage";
import TaskPanel from "@/components/TaskPanel";

function Field({ label, value, onChange, placeholder, done = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; done?: boolean; }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-panel border border-white/10 rounded-md px-3 py-2.5 placeholder:text-muted/60 focus:ring-1 focus:ring-amber ${done ? "text-muted line-through" : "text-ink"}`} />
    </label>
  );
}

export default function BriefingPanel({ data, modeRouge, onChange }: { data: BriefingData; modeRouge: boolean; onChange: (b: BriefingData) => void; }) {
  const set = (k: "p1" | "p2" | "p3" | "bonus" | "skip") => (v: string) => onChange({ ...data, [k]: v });
  const togglePriority = (key: "p1Done" | "p2Done" | "p3Done") => onChange({ ...data, [key]: !data[key] });
  const dateLabel = new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const accent = modeRouge ? "text-alert" : "text-amber";

  const priorities = [
    { key: "p1", doneKey: "p1Done", label: "Priorité 1", placeholder: modeRouge ? "Obligation réelle" : undefined },
    { key: "p2", doneKey: "p2Done", label: "Priorité 2", placeholder: modeRouge ? "Sommeil / récupération" : undefined },
    { key: "p3", doneKey: "p3Done", label: "Priorité 3", placeholder: modeRouge ? "Une seule avancée utile" : undefined },
  ] as const;

  return (
    <div className="space-y-6">
      <p className="font-mono text-xs text-muted uppercase tracking-widest">{dateLabel}</p>

      {modeRouge && (
        <div className="rounded-md border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">
          Mode rouge : protège l'essentiel. Trois priorités maximum et trois tâches actives à la fois.
        </div>
      )}

      <div className="space-y-4">
        {priorities.map(({ key, doneKey, label, placeholder }, index) => (
          <div key={key} className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => togglePriority(doneKey)}
              aria-label={`${data[doneKey] ? "Rouvrir" : "Terminer"} ${label.toLowerCase()}`}
              className={`mb-2.5 w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors ${data[doneKey] ? "bg-teal border-teal text-graphite" : `bg-panel ${modeRouge ? "border-alert/60" : "border-amber/60"} text-transparent`}`}
            >
              ✓
            </button>
            <span className={`font-mono text-2xl leading-none pb-2.5 ${data[doneKey] ? "text-muted" : accent}`}>0{index + 1}</span>
            <div className="flex-1">
              <Field label={label} value={data[key]} onChange={set(key)} placeholder={placeholder} done={data[doneKey]} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        <Field label="Si j'ai encore de l'énergie" value={data.bonus} onChange={set("bonus")} placeholder={modeRouge ? "Seulement si ça ne coûte presque rien" : undefined} />
        <Field label="Je peux ignorer aujourd'hui" value={data.skip} onChange={set("skip")} />
      </div>

      <div className="pt-4 border-t border-white/10 space-y-3">
        <span className="block text-xs font-mono uppercase tracking-widest text-muted">Tâches du jour</span>
        <TaskPanel items={data.tasks} maxOpenTasks={modeRouge ? 3 : undefined} onChange={(tasks: TaskItem[]) => onChange({ ...data, tasks })} />
      </div>
    </div>
  );
}
