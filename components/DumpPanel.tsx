"use client";

import { useState } from "react";
import { DumpItem } from "@/lib/storage";

const COLUMNS: { key: NonNullable<DumpItem["category"]>; label: string; dot: string }[] = [
  { key: "URGENT", label: "Urgent", dot: "bg-alert" },
  { key: "PLANIFIER", label: "À planifier", dot: "bg-amber" },
  { key: "PARKING", label: "Parking", dot: "bg-teal" },
  { key: "OUBLIE", label: "À oublier", dot: "bg-muted" },
];

export default function DumpPanel({
  items,
  onChange,
}: {
  items: DumpItem[];
  onChange: (items: DumpItem[]) => void;
}) {
  const [raw, setRaw] = useState("");

  const addLines = () => {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const newItems: DumpItem[] = lines.map((text) => ({
      id: crypto.randomUUID(),
      text,
      category: null,
    }));
    onChange([...items, ...newItems]);
    setRaw("");
  };

  const setCategory = (id: string, category: DumpItem["category"]) => {
    onChange(items.map((i) => (i.id === id ? { ...i, category } : i)));
  };

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const inbox = items.filter((i) => i.category === null);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="block text-xs font-mono uppercase tracking-widest text-muted">
          Balance tout, une idée par ligne
        </span>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={4}
          className="w-full bg-panel border border-white/10 rounded-md px-3 py-2.5 text-ink placeholder:text-muted/60 focus:ring-1 focus:ring-amber"
          placeholder={"Répondre au mail de X\nIdée de clip pour C'est fini\nAppeler le plombier"}
        />
        <button
          onClick={addLines}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-md bg-amber text-graphite hover:bg-amber/90"
        >
          Trier
        </button>
      </div>

      {inbox.length > 0 && (
        <div className="space-y-2">
          <span className="block text-xs font-mono uppercase tracking-widest text-muted">
            À classer ({inbox.length})
          </span>
          <div className="space-y-2">
            {inbox.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-panel border border-white/10 rounded-md px-3 py-2"
              >
                <span className="text-sm">{item.text}</span>
                <div className="flex gap-1.5 shrink-0">
                  {COLUMNS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCategory(item.id, c.key)}
                      title={c.label}
                      className={`w-2.5 h-2.5 rounded-full ${c.dot} opacity-60 hover:opacity-100`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.category === col.key);
          return (
            <div key={col.key} className="space-y-2">
              <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted">
                <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                {col.label} ({colItems.length})
              </span>
              <div className="space-y-1.5 min-h-[2rem]">
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-start justify-between gap-2 bg-panel border border-white/10 rounded-md px-2.5 py-2 text-sm ${
                      col.key === "OUBLIE" ? "text-muted line-through" : ""
                    }`}
                  >
                    <span>{item.text}</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted hover:text-alert text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
