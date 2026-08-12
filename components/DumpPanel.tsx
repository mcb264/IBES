"use client";

import { useState } from "react";
import { DumpItem } from "@/lib/storage";

const COLUMNS: { key: NonNullable<DumpItem["category"]>; label: string; dot: string }[] = [
  { key: "URGENT", label: "Urgent", dot: "bg-alert" },
  { key: "PLANIFIER", label: "À planifier", dot: "bg-amber" },
  { key: "PARKING", label: "Parking", dot: "bg-teal" },
  { key: "OUBLIE", label: "À oublier", dot: "bg-muted" },
];

export default function DumpPanel({ items, onChange }: { items: DumpItem[]; onChange: (items: DumpItem[]) => void; }) {
  const [raw, setRaw] = useState("");

  const addLines = () => {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const newItems: DumpItem[] = lines.map((text) => ({ id: crypto.randomUUID(), text, category: null }));
    onChange([...items, ...newItems]);
    setRaw("");
  };

  const setCategory = (id: string, category: DumpItem["category"]) => onChange(items.map((i) => (i.id === id ? { ...i, category } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const inbox = items.filter((i) => i.category === null);

  const categoryButtons = (item: DumpItem) => (
    <div className="flex gap-2 shrink-0" aria-label="Changer de catégorie">
      {COLUMNS.map((c) => (
        <button
          key={c.key}
          onClick={() => setCategory(item.id, c.key)}
          title={c.label}
          aria-label={c.label}
          className={`w-3 h-3 rounded-full ${c.dot} ${item.category === c.key ? "ring-2 ring-white/60 opacity-100" : "opacity-50 hover:opacity-100"}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="block text-xs font-mono uppercase tracking-widest text-muted">Balance tout, une idée par ligne</span>
        <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={4} className="w-full bg-panel border border-white/10 rounded-md px-3 py-2.5 text-ink placeholder:text-muted/60 focus:ring-1 focus:ring-amber" placeholder={"Répondre au mail de X\nIdée de clip pour C'est fini\nAppeler le plombier"} />
        <button onClick={addLines} className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-md bg-amber text-graphite hover:bg-amber/90">Trier</button>
      </div>

      {inbox.length > 0 && (
        <div className="space-y-2">
          <span className="block text-xs font-mono uppercase tracking-widest text-muted">À classer ({inbox.length})</span>
          <div className="space-y-2">
            {inbox.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 bg-panel border border-white/10 rounded-md px-3 py-2">
                <span className="text-sm min-w-0 break-words">{item.text}</span>
                {categoryButtons(item)}
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
              <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted"><span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />{col.label} ({colItems.length})</span>
              <div className="space-y-1.5 min-h-[2rem]">
                {colItems.map((item) => (
                  <div key={item.id} className={`group bg-panel border border-white/10 rounded-md px-2.5 py-2 text-sm space-y-2 ${col.key === "OUBLIE" ? "text-muted" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`break-words min-w-0 ${col.key === "OUBLIE" ? "line-through" : ""}`}>{item.text}</span>
                      <button onClick={() => remove(item.id)} aria-label={`Supprimer ${item.text}`} className="text-muted hover:text-alert text-xs p-2 -m-2 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100">✕</button>
                    </div>
                    {categoryButtons(item)}
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
