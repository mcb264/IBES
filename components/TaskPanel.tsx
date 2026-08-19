"use client";

import { useState } from "react";
import {
  EffortLevel,
  Project,
  TaskItem,
  completeRecurringTask,
  localDateKey,
  normalizeRecurringTask,
  recurringComplete,
  recurringProgress,
  waitingNeedsAttention,
  weekKey,
} from "@/lib/storage";

const EFFORTS:[EffortLevel,string][]=[["light","Légère"],["normal","Normale"],["heavy","Lourde"]];

export default function TaskPanel({items,onChange,maxOpenTasks,projects=[]}:{items:TaskItem[];onChange:(items:TaskItem[])=>void;maxOpenTasks?:number;projects?:Project[]}){
  const [text,setText]=useState("");
  const [projectId,setProjectId]=useState("");
  const [effort,setEffort]=useState<EffortLevel>("normal");
  const [recurring,setRecurring]=useState(false);
  const [recurringTarget,setRecurringTarget]=useState(3);
  const normalized=items.map(t=>normalizeRecurringTask(t));
  const openCount=normalized.filter(t=>!t.done&&!t.waiting&&!recurringComplete(t)).length;
  const limitReached=typeof maxOpenTasks==="number"&&openCount>=maxOpenTasks;

  const addTask=()=>{
    const value=text.trim();
    if(!value||limitReached)return;
    onChange([...normalized,{
      id:crypto.randomUUID(),text:value,done:false,projectId:projectId||undefined,effort,
      ...(recurring?{recurringTarget:Math.max(1,recurringTarget),recurringPeriod:"week" as const,recurringCount:0,recurringPeriodKey:weekKey(),recurrenceHistory:[]}:{})
    }]);
    setText("");setProjectId("");setEffort("normal");setRecurring(false);setRecurringTarget(3);
  };
  const toggle=(id:string)=>onChange(normalized.map(t=>{
    if(t.id!==id)return t;
    if(t.recurringTarget)return completeRecurringTask(t);
    return {...t,done:!t.done,waiting:false,waitingSince:undefined};
  }));
  const wait=(id:string)=>onChange(normalized.map(t=>t.id===id?{...t,done:false,waiting:true,waitingSince:localDateKey(),carried:false}:t));
  const resolveWait=(id:string)=>onChange(normalized.map(t=>t.id===id?{...t,done:true,waiting:false,waitingSince:undefined}:t));
  const reactivate=(id:string)=>onChange(normalized.map(t=>t.id===id?{...t,done:false,waiting:false,waitingSince:undefined}:t));
  const remove=(id:string)=>onChange(normalized.filter(t=>t.id!==id));
  const setTaskEffort=(id:string,e:EffortLevel)=>onChange(normalized.map(t=>t.id===id?{...t,effort:e}:t));
  const todo=normalized.filter(t=>!t.done&&!t.waiting),waiting=normalized.filter(t=>t.waiting),done=normalized.filter(t=>t.done);

  const row=(t:TaskItem,isDone:boolean)=>{
    const progress=recurringProgress(t),isRecurring=!!t.recurringTarget,periodDone=isRecurring&&recurringComplete(t);
    return <div key={t.id} className={`group flex items-center gap-3 border rounded-md px-3 py-2.5 ${isDone?"bg-panel/60 border-white/5":"bg-panel border-white/10"}`}>
      <input type="checkbox" checked={isDone||periodDone} disabled={periodDone&&!isDone} onChange={()=>toggle(t.id)} className={`w-4 h-4 shrink-0 ${isDone||periodDone?"accent-teal":"accent-amber"}`}/>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${isDone?"text-muted line-through":""}`}>{t.text}</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {isRecurring&&<span className={`font-mono text-[9px] uppercase tracking-widest ${periodDone?"text-teal":"text-amber"}`}>{progress.count}/{progress.target} cette semaine{periodDone?" ✓":""}</span>}
          {!isDone&&<select value={t.effort??"normal"} onChange={e=>setTaskEffort(t.id,e.target.value as EffortLevel)} className="bg-transparent font-mono text-[9px] uppercase tracking-widest text-muted"><option value="light">légère</option><option value="normal">normale</option><option value="heavy">lourde</option></select>}
          {t.carried&&!isDone&&<span className="font-mono text-[9px] uppercase tracking-widest text-alert">reportée</span>}
          {t.projectId&&<span className="font-mono text-[9px] uppercase tracking-widest text-muted">{projects.find(p=>p.id===t.projectId)?.name??"projet"}</span>}
        </div>
      </div>
      {!isDone&&!periodDone&&<button title="Terminé — en attente d’un retour" onClick={()=>wait(t.id)} className="text-muted hover:text-cyan text-sm p-2 -m-2 sm:opacity-0 sm:group-hover:opacity-100">⏳</button>}
      <button onClick={()=>remove(t.id)} className="text-muted hover:text-alert text-xs p-2 -m-2 sm:opacity-0 sm:group-hover:opacity-100">✕</button>
    </div>;
  };

  return <div className="space-y-8">
    <div className="space-y-2">
      <div className="flex gap-2"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addTask()}} disabled={limitReached} placeholder={limitReached?"Limite du mode rouge atteinte":"Nouvelle tâche"} className="flex-1 min-w-0 bg-panel border border-white/10 rounded-md px-3 py-2.5 disabled:opacity-50"/><button onClick={addTask} disabled={limitReached} className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-md bg-amber text-graphite disabled:opacity-40">Ajouter</button></div>
      <div className="grid grid-cols-2 gap-2"><select value={effort} onChange={e=>setEffort(e.target.value as EffortLevel)} className="bg-panel border border-white/10 rounded-md px-3 py-2 text-xs text-muted">{EFFORTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>{projects.filter(p=>!p.done).length>0?<select value={projectId} onChange={e=>setProjectId(e.target.value)} className="bg-panel border border-white/10 rounded-md px-3 py-2 text-xs text-muted"><option value="">Aucun projet lié</option>{projects.filter(p=>!p.done).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>:<div/>}</div>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-white/10 bg-panel px-3 py-2 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={recurring} onChange={e=>setRecurring(e.target.checked)} className="accent-amber"/>Récurrente</label>{recurring&&<><input type="number" min={1} max={14} value={recurringTarget} onChange={e=>setRecurringTarget(Math.max(1,Number(e.target.value)||1))} className="w-16 rounded border border-white/10 bg-transparent px-2 py-1"/><span className="text-muted">fois / semaine</span></>}</div>
      {typeof maxOpenTasks==="number"&&<p className="text-xs text-alert font-mono uppercase tracking-widest">Mode rouge — {openCount}/{maxOpenTasks} tâches actives maximum</p>}
    </div>
    {todo.length===0&&done.length===0&&waiting.length===0&&<p className="text-sm text-muted">Aucune tâche pour l&apos;instant.</p>}
    {todo.length>0&&<div className="space-y-2">{todo.map(t=>row(t,false))}</div>}
    {waiting.length>0&&<details className="group/wait"><summary className="cursor-pointer list-none text-xs font-mono uppercase tracking-widest text-muted">⏳ {waiting.length} en attente</summary><div className="space-y-2 mt-2">{waiting.map(t=>{const attention=waitingNeedsAttention(t,projects);return <div key={t.id} className={`flex items-center gap-3 border rounded-md px-3 py-2.5 ${attention?"border-alert/40 bg-alert/5":"border-white/5 bg-panel/40"}`}><span className={attention?"text-alert":"text-muted"}>⏳</span><div className="flex-1 min-w-0"><div className="text-sm text-muted">{t.text}</div>{attention&&<div className="text-[9px] font-mono uppercase tracking-widest text-alert mt-1">échéance du projet proche</div>}</div><button onClick={()=>resolveWait(t.id)} className="text-[10px] font-mono uppercase tracking-widest text-teal">Reçu</button><button onClick={()=>reactivate(t.id)} className="text-[10px] font-mono uppercase tracking-widest text-muted">Réactiver</button></div>})}</div></details>}
    {done.length>0&&<div className="space-y-2"><span className="block text-xs font-mono uppercase tracking-widest text-muted">Fait ({done.length})</span>{done.map(t=>row(t,true))}</div>}
  </div>;
}
