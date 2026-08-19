"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createCustomWorkspace, loadCustomWorkspaces, saveCustomWorkspaces, type CustomWorkspace } from "@/lib/storage";
import { WORKSPACE_COLORS, workspaceColor, withWorkspaceColor } from "@/lib/workspaceColors";

type WorkspaceMode = "standard" | "sport";
type ModeWorkspace = CustomWorkspace & { mode?: WorkspaceMode };

export default function CustomWorkspaceCards() {
  const [items, setItems] = useState<CustomWorkspace[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [newColor, setNewColor] = useState<string>(WORKSPACE_COLORS[0]);
  const [newMode, setNewMode] = useState<WorkspaceMode>("standard");
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
    const next=loadCustomWorkspaces().map(workspace=>{
      if(workspace.id!==created.id)return workspace;
      return {...withWorkspaceColor(workspace,newColor),mode:newMode} as ModeWorkspace;
    });
    saveCustomWorkspaces(next);
    setName("");
    setNewColor(WORKSPACE_COLORS[0]);
    setNewMode("standard");
    setAdding(false);
    setItems(next);
    window.dispatchEvent(new Event("ibes:workspaces-changed"));
  };

  return <>
    {items.map((workspace) => {
      const mode=((workspace as ModeWorkspace).mode??"standard") as WorkspaceMode;
      const active = workspace.state.briefing.tasks.filter((task) => !task.done && !task.waiting);
      const waiting = workspace.state.briefing.tasks.filter((task) => task.waiting).length;
      const nextAction = active[0];
      const nextDeadline = workspace.state.projects.filter((project) => !project.done && project.dueDate).sort((a,b)=>a.dueDate!.localeCompare(b.dueDate!))[0];
      const color=workspaceColor(workspace);
      return <div key={workspace.id} className="relative min-h-[260px] rounded-2xl border bg-panel overflow-hidden transition-colors hover:border-white/25" style={{borderColor:`${color}55`}}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{backgroundColor:color}}/>
        <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
          {mode==="sport"&&<span className="rounded-full border border-white/10 bg-graphite/90 px-2 py-1 text-[9px] font-mono uppercase" style={{color}}>Sport</span>}
          <input aria-label={`Couleur de ${workspace.name}`} title="Changer la couleur du projet" type="color" value={color} onChange={e=>setColor(workspace.id,e.target.value)} className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0" />
        </div>
        <Link href={`/projet/${workspace.id}`} className="group h-full min-h-[260px] p-6 pr-20 flex flex-col">
          <div className="flex items-start justify-between gap-4"><div><div className="font-display text-3xl" style={{color}}>{workspace.name}</div><div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1">{active.length} action{active.length!==1?"s":""} active{active.length!==1?"s":""}{waiting>0?` · ${waiting} en attente`:""}</div></div><span className="text-muted group-hover:text-ink mt-1">→</span></div>
          <div className="mt-8 flex-1"><p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Prochaine action</p>{nextAction?<p className="text-xl leading-snug">{nextAction.text}</p>:<p className="text-lg text-muted">Rien d&apos;actif pour l&apos;instant.</p>}</div>
          <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between text-xs"><span className="text-muted">{nextDeadline?"Prochaine échéance":"Aucune échéance proche"}</span>{nextDeadline&&<span className="font-mono" style={{color}}>{new Date(nextDeadline.dueDate!+"T00:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>}</div>
        </Link>
      </div>;
    })}

    <div className="col-span-full flex justify-end mt-1">
      {adding ? <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-panel p-4 space-y-4">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-mono uppercase tracking-widest text-muted">Nouveau grand projet</p><p className="text-xs text-muted mt-1">Choisis le mode ici une seule fois. Il s&apos;appliquera à tout le projet.</p></div><button onClick={()=>{setAdding(false);setName("");setNewMode("standard")}} className="text-sm text-muted">×</button></div>
        <input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addProject();if(e.key==="Escape"){setAdding(false);setName("");setNewMode("standard")}}} placeholder="Nom du projet" className="w-full rounded-lg border border-white/10 bg-graphite px-3 py-3 text-sm outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={()=>setNewMode("standard")} className="rounded-xl border p-3 text-left" style={{borderColor:newMode==="standard"?newColor:"rgba(255,255,255,.1)"}}><div className="flex items-center justify-between"><span className="font-display text-sm">Standard</span>{newMode==="standard"&&<span style={{color:newColor}}>✓</span>}</div><p className="mt-1 text-[11px] text-muted">Projet classique IBES.</p></button>
          <button type="button" onClick={()=>setNewMode("sport")} className="rounded-xl border p-3 text-left" style={{borderColor:newMode==="sport"?newColor:"rgba(255,255,255,.1)"}}><div className="flex items-center justify-between"><span className="font-display text-sm">Sport</span>{newMode==="sport"&&<span style={{color:newColor}}>✓</span>}</div><p className="mt-1 text-[11px] text-muted">Récurrences + séances évolutives.</p></button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-1.5">{WORKSPACE_COLORS.map(color=><button key={color} type="button" onClick={()=>setNewColor(color)} className={`h-6 w-6 rounded-full border ${newColor===color?"border-white":"border-transparent"}`} style={{backgroundColor:color}} aria-label={`Choisir ${color}`}/>)}<input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} className="h-7 w-7 cursor-pointer bg-transparent border-0 p-0" aria-label="Couleur personnalisée" /></div><button onClick={addProject} disabled={!name.trim()} className="rounded-lg px-4 py-2 text-[10px] font-mono uppercase text-graphite disabled:opacity-30" style={{backgroundColor:newColor}}>Créer le projet</button></div>
      </div> : <button onClick={()=>setAdding(true)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-teal hover:border-white/20 transition-colors">+ Nouveau projet</button>}
    </div>
  </>;
}
