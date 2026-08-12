"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createCustomWorkspace, loadDomainState, saveDomainState, type Domain } from "@/lib/storage";

type InboxItem = { id: string; text: string };
const KEY = "ibes:inbox";

function readInbox(): InboxItem[] {
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeInbox(items: InboxItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export default function GlobalInbox() {
  const pathname = usePathname();
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => { if (pathname === "/") setItems(readInbox()); }, [pathname]);
  if (pathname !== "/") return null;

  const save = (next: InboxItem[]) => { setItems(next); writeInbox(next); };
  const add = () => {
    const value = text.trim();
    if (!value) return;
    save([...items, { id: crypto.randomUUID(), text: value }]);
    setText("");
  };
  const remove = (id: string) => save(items.filter((item) => item.id !== id));
  const sendTo = (item: InboxItem, domain: Domain) => {
    const state = loadDomainState(domain);
    saveDomainState(domain, { ...state, dump: [...state.dump, { id: crypto.randomUUID(), text: item.text, category: "PARKING" }] });
    remove(item.id);
    setOpen(null);
    router.push(`/${domain}?tab=dump`);
  };
  const makeProject = (item: InboxItem) => {
    const workspace = createCustomWorkspace(item.text);
    remove(item.id);
    setOpen(null);
    window.dispatchEvent(new Event("ibes:workspaces-changed"));
    router.push(`/projet/${workspace.id}`);
  };

  return (
    <section className="px-6 pb-10 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-3 gap-4">
        <div>
          <p className="font-mono text-[11px] text-muted uppercase">À garder en tête</p>
          <p className="text-xs text-muted mt-1">Une idée à poser, sans charge ni décision maintenant.</p>
        </div>
        <span className="text-[10px] text-muted">{items.length}</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-panel/70 p-4">
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Poser une idée…" className="min-w-0 flex-1 bg-graphite border border-white/10 rounded-md px-3 py-2 text-sm" />
          <button onClick={add} className="text-xs text-teal px-2">Ajouter</button>
        </div>
        {items.length > 0 && <div className="mt-3 border-t border-white/5 pt-1">
          {items.map((item) => (
            <div key={item.id} className="border-b border-white/5 last:border-0 py-3">
              <button onClick={() => setOpen(open === item.id ? null : item.id)} className="w-full flex items-center justify-between gap-3 text-left">
                <span className="text-sm">{item.text}</span><span className="text-muted text-xs">•••</span>
              </button>
              {open === item.id && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[11px] font-mono uppercase tracking-wide">
                  <button onClick={() => sendTo(item, "musique")} className="text-amber">→ Musique</button>
                  <button onClick={() => sendTo(item, "esport")} className="text-cyan">→ Esport</button>
                  <button onClick={() => makeProject(item)} className="text-teal">+ Créer un projet</button>
                  <button onClick={() => remove(item.id)} className="text-alert">Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>}
      </div>
    </section>
  );
}
