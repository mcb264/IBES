"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createCustomWorkspace, loadCustomWorkspaces, type CustomWorkspace } from "@/lib/storage";

export default function CustomWorkspaceCards() {
  const [items, setItems] = useState<CustomWorkspace[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const refresh = () => setItems(loadCustomWorkspaces());

  useEffect(() => {
    refresh();
    window.addEventListener("ibes:workspaces-changed", refresh);
    return () => window.removeEventListener("ibes:workspaces-changed", refresh);
  }, []);

  const addProject = () => {
    const value = name.trim();
    if (!value) return;
    createCustomWorkspace(value);
    setName(""); setAdding(false); refresh();
    window.dispatchEvent(new Event("ibes:workspaces-changed"));
  };

  return <>
    {items.map((workspace) => {
      const active = workspace.state.briefing.tasks.filter((task) => !task.done && !task.waiting);
      const waiting = workspace.state.briefing.tasks.filter((task) => task.waiting).length;
      const nextAction = active[0];
      const nextDeadline = workspace.state.projects.filter((project) => !project.done && project.dueDate).sort((a,b)=>a.dueDate!.localeCompare(b.dueDate!))[0];
      return <Link key={workspace.id} href={`/projet/${workspace.id}`} className="group min-h-[260px] rounded-2xl border border-white/10 bg-panel p-6 flex flex-col hover:border-white/25 transition-colors">
        <div className="flex items-start justify-between gap-4"><div><div className="font-display text-3xl text-teal">{workspace.name}</div><div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1">{active.length} action{active.length!==1?"s":""} active{active.length!==1?"s":""}{waiting>0?` · ${waiting} en attente`:""}</div></div><span className="text-muted group-hover:text-ink">→</span></div>
        <div className="mt-8 flex-1"><p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Prochaine action</p>{nextAction?<p className="text-xl leading-snug">{nextAction.text}</p>:<p className="text-lg text-muted">Rien d'actif pour l'instant.</p>}</div>
        <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between text-xs"><span className="text-muted">{nextDeadline?"Prochaine échéance":"Aucune échéance proche"}</span>{nextDeadline&&<span className="font-mono text-amber">{new Date(nextDeadline.dueDate!+"T00:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>}</div>
      </Link>;
    })}

    <div className="col-span-full flex justify-end mt-1">
      {adding ? <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-panel px-3 py-2">
        <input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addProject();if(e.key==="Escape"){setAdding(false);setName("")}}} placeholder="Nom du projet" className="w-44 bg-transparent outline-none text-sm" />
        <button onClick={addProject} className="text-[10px] font-mono uppercase text-teal">Créer</button>
        <button onClick={()=>{setAdding(false);setName("")}} className="text-[10px] font-mono uppercase text-muted">×</button>
      </div> : <button onClick={()=>setAdding(true)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-teal hover:border-white/20 transition-colors">+ Nouveau projet</button>}
    </div>
  </>;
}
