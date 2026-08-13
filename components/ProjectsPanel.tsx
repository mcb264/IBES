"use client";
import { useState } from "react";
import { Project, TaskItem, localDateKey } from "@/lib/storage";

export default function ProjectsPanel({projects,tasks,onChange,onTasksChange}:{projects:Project[];tasks:TaskItem[];onChange:(p:Project[])=>void;onTasksChange?:(t:TaskItem[])=>void}){
 const [name,setName]=useState(""); const [goal,setGoal]=useState(""); const [dueDate,setDueDate]=useState(""); const [newActions,setNewActions]=useState<Record<string,string>>({});
 const add=()=>{if(!name.trim())return;onChange([...projects,{id:crypto.randomUUID(),name:name.trim(),goal:goal.trim(),dueDate:dueDate||undefined,done:false}]);setName("");setGoal("");setDueDate("");};
 const addAction=(projectId:string)=>{const text=(newActions[projectId]||"").trim();if(!text||!onTasksChange)return;onTasksChange([...tasks,{id:crypto.randomUUID(),text,done:false,effort:"normal",projectId}]);setNewActions(s=>({...s,[projectId]:""}));};
 return <div className="space-y-6">
  <div className="bg-panel border border-white/10 rounded-lg p-4 space-y-3">
   <p className="text-xs font-mono uppercase tracking-widest text-muted">Nouveau projet</p>
   <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom du projet" className="w-full bg-graphite border border-white/10 rounded-md px-3 py-2.5"/>
   <input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Résultat attendu" className="w-full bg-graphite border border-white/10 rounded-md px-3 py-2.5"/>
   <div className="flex gap-2"><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="flex-1 bg-graphite border border-white/10 rounded-md px-3 py-2.5"/><button onClick={add} className="bg-amber text-graphite rounded-md px-4 font-mono text-xs uppercase">Créer</button></div>
  </div>
  <div className="space-y-3">{projects.map(p=>{
    const linked=tasks.filter(t=>t.projectId===p.id); const open=linked.filter(t=>!t.done); const done=linked.filter(t=>t.done); const today=localDateKey();
    return <div key={p.id} className="bg-panel border border-white/10 rounded-lg p-4">
      <div className="flex items-start gap-3"><input type="checkbox" checked={p.done} onChange={()=>onChange(projects.map(x=>x.id===p.id?{...x,done:!x.done}:x))} className="mt-1 accent-teal"/><div className="flex-1"><div className={`font-display ${p.done?"line-through text-muted":""}`}>{p.name}</div>{p.goal&&<p className="text-sm text-muted mt-1">{p.goal}</p>}{p.dueDate&&<p className="text-[10px] font-mono uppercase tracking-widest text-amber mt-2">Échéance {new Date(p.dueDate+"T00:00:00").toLocaleDateString("fr-FR")}</p>}<p className="text-[10px] font-mono uppercase tracking-widest text-muted mt-2">{open.length} action{open.length!==1?"s":""} restante{open.length!==1?"s":""} · {done.length} terminée{done.length!==1?"s":""}</p></div><button onClick={()=>onChange(projects.filter(x=>x.id!==p.id))} className="text-muted hover:text-alert">✕</button></div>
      <div className="mt-4 pt-4 border-t border-white/10 space-y-2"><p className="text-[10px] font-mono uppercase tracking-widest text-muted">Toutes les actions du projet</p>{linked.length===0&&<p className="text-sm text-muted">Aucune action pour l'instant.</p>}{linked.map(t=><div key={t.id} className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${t.done?"bg-graphite/30 border-white/5 opacity-55":"bg-graphite/60 border-white/5"}`}><span className={`text-sm ${t.done?"line-through":""}`}>{t.text}</span><div className="flex items-center gap-2 shrink-0">{t.todayDate===today&&<span className="text-[9px] font-mono uppercase text-teal">Aujourd'hui</span>}{t.waiting&&<span className="text-[9px] font-mono uppercase text-muted">En attente</span>}{t.done&&<span className="text-[9px] font-mono uppercase text-muted">Fait</span>}{t.dueDate&&<span className="text-[9px] font-mono uppercase text-amber">{new Date(t.dueDate+"T00:00:00").toLocaleDateString("fr-FR")}</span>}</div></div>)}{onTasksChange&&<div className="flex gap-2 pt-2"><input value={newActions[p.id]||""} onChange={e=>setNewActions(s=>({...s,[p.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")addAction(p.id)}} placeholder="Ajouter une action au projet" className="flex-1 bg-graphite border border-white/10 rounded-md px-3 py-2 text-sm"/><button onClick={()=>addAction(p.id)} className="text-xs text-teal">Ajouter</button></div>}</div>
    </div>
  })}</div>
 </div>;
}
