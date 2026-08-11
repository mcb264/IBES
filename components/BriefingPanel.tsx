"use client";

import { BriefingData, TaskItem } from "@/lib/storage";
import TaskPanel from "@/components/TaskPanel";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-panel border border-white/10 rounded-md px-3 py-2.5 text-ink placeholder:text-muted/60 focus:ring-1 focus:ring-amber"
      />
    </label>
  );
}

export default function BriefingPanel({
  data,
  modeRouge,
  onChange,
}: {
  data: BriefingData;
  modeRouge: boolean;
  onChange: (b: BriefingData) => void;
}) {
  const set = (k: keyof BriefingData) => (v: string) =>
    onChange({ ...data, [k]: v });

  const dateLabel = new Date(data.date + "T00:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long" }
  );

  const accent = modeRouge ? "text-alert" : "text-amber";

  return (
    <div className="space-y-6">
      <p className="font-mono text-xs text-muted uppercase tracking-widest">
        {dateLabel}
      </p>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className={`font-mono text-2xl leading-none pt-2 ${accent}`}>01</span>
          <div className="flex-1">
            <Field
              label="Priorité 1"
              value={data.p1}
              onChange={set("p1")}
              placeholder={modeRouge ? "Obligation réelle" : undefined}
            />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className={`font-mono text-2xl leading-none pt-2 ${accent}`}>02</span>
          <div className="flex-1">
            <Field
              label="Priorité 2"
              value={data.p2}
              onChange={set("p2")}
              placeholder={modeRouge ? "Sommeil / récupération" : undefined}
            />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className={`font-mono text-2xl leading-none pt-2 ${accent}`}>03</span>
          <div className="flex-1">
            <Field
              label="Priorité 3"
              value={data.p3}
              onChange={set("p3")}
              placeholder={modeRouge ? "Une seule avancée musicale" : undefined}
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        <Field
          label="Si j'ai encore de l'énergie"
          value={data.bonus}
          onChange={set("bonus")}
          placeholder={modeRouge ? "Communication minimale si nécessaire" : undefined}
        />
        <Field
          label="Je peux ignorer aujourd'hui"
          value={data.skip}
          onChange={set("skip")}
        />
      </div>

      <div className="pt-4 border-t border-white/10 space-y-3">
        <span className="block text-xs font-mono uppercase tracking-widest text-muted">
          Tâches du jour
        </span>
        <TaskPanel
          items={data.tasks}
          onChange={(tasks: TaskItem[]) => onChange({ ...data, tasks })}
        />
      </div>
    </div>
  );
}
