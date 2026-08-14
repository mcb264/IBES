"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createCustomWorkspace, loadCustomWorkspaces, saveCustomWorkspaces, type CustomWorkspace } from "@/lib/storage";
import { WORKSPACE_COLORS, workspaceColor, withWorkspaceColor } from "@/lib/workspaceColors";

export default function CustomWorkspaceCards() {
  const [items, setItems] = useState<CustomWorkspace[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [newColor, setNewColor] = useState<string>(WORKSPACE_COLORS[0]);
  const refresh = () => setItems(loadCustomWorkspaces());

  useEffect(() => {
    refresh();
    window.addEventListener("ibes:workspaces-changed", refresh);
    return () => window.removeEventListener("ibes:workspaces-changed", refresh);
  }, []);

  const setColor = (id:string,color:string) => {
    const next=loadCustomWorkspaces().map(workspace=>workspace.id===id?withWorkspaceColor(workspace,color):workspace);
    saveCustomWorkspaces(next);
    setItems(next);
    window.dispatchEvent(new Event("ibes:workspaces-changed"));
  };

  const addProject = () => {
    const value = name.trim();
    if (!value) return;
    const created=createCustomWorkspace(value);
    const next=loadCustomWorkspaces().map(workspace=>workspace.id===created.id?withWorkspaceColor(workspace,newColor):workspace);
    saveCustomWorkspaces(next);
    setName(""); setNewColor(WORKSPACE_COLORS[0]); setAdding(false); setItems(next);
    window.dispatchEvent(new Event("ibes:workspaces-changed"));
  };

  return <>
    {items.map((workspace) => {
      const active = workspace.state.briefing.tasks.filter((task) => !task.done && !task.waiting);
      const waiting = workspace.state.briefing.tasks.filter((task) => task.waiting).length;
      const nextAction = active[0];
      const nextDeadline = workspace.state.projects.filter((project) => !project.done && project.dueDate).sort((a,b)=>a.dueDate!.localeCompare(b.dueDate!))[0];
      const color=workspaceColor(workspace);
      return <div key={workspace.id} className="relative min-h-[260px] rounded-2xl border bg-panel overflow-hidden transition-colors hover:border-white/25" style={{borderColor:`${color}55`}}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{backgroundColor:color}}/>
        <input aria-label={`Couleur de ${workspace.name}`} title="Changer la couleur du projet" type="color" value={color} onChange={e=>setColor(workspace.id,e.target.value)} className="absolute right-5 top-5 z-20 h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0" />
        <Link href={`/projet/${workspace.id}`} className="group h-full min-h-[260px] p-6 pr-14 flex flex-col">
          <div className="flex items-start justify-between gap-4"><div><div className="font-display text-3xl" style={{color}}>{workspace.name}</div><div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1">{active.length} action{active.length!==1?"s":""} active{active.length!==1?"s":""}{waiting>0?` · ${waiting} en attente`:""}</div></div><span className="text-muted group-hover:text-ink mt-1">→</span></div>
          <div className="mt-8 flex-1"><p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Prochaine action</p>{nextAction?<p className="text-xl leading-snug">{nextAction.text}</p>:<p className="text-lg text-muted">Rien d'actif pour l'instant.</p>}</div>
          <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between text-xs"><span className="text-muted">{nextDeadline?"Prochaine échéance":"Aucune échéance proche"}</span>{nextDeadline&&<span className="font-mono" style={{color}}>{new Date(nextDeadline.dueDate!+"T00:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>}</div>
        </Link>
      </div>;
    })}

    <div className="col-span-full flex justify-end mt-1">
      {adding ? <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-panel px-3 py-2">
        <input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addProject();if(e.key==="Escape"){setAdding(false);setName("")}}} placeholder="Nom du projet" className="w-44 bg-transparent outline-none text-sm" />
        <div className="flex items-center gap-1">{WORKSPACE_COLORS.map(color=><button key={color} type="button" onClick={()=>setNewColor(color)} className={`h-5 w-5 rounded-full border ${newColor===color?"border-white":"border-transparent"}`} style={{backgroundColor:color}} aria-label={`Choisir ${color}`}/>)}</div>
        <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} className="h-6 w-6 cursor-pointer bg-transparent border-0 p-0" aria-label="Couleur personnalisée" />
        <button onClick={addProject} className="text-[10px] font-mono uppercase" style={{color:newColor}}>Créer</button>
        <button onClick={()=>{setAdding(false);setName("")}} className="text-[10px] font-mono uppercase text-muted">×</button>
      </div> : <button onClick={()=>setAdding(true)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-teal hover:border-white/20 transition-colors">+ Nouveau projet</button>}
    </div>
  </>;
}
