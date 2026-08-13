"use client";

import { useEffect, useMemo, useState } from "react";
import { Domain, DomainState, TaskItem, loadCustomWorkspaces, loadDomainState, saveCustomWorkspace, saveDomainState, syncWeeklyCompletedTasks } from "@/lib/storage";

type Target = { id:string; label:string; kind:"domain"|"custom"; domain?:Domain };
type Props = { active:boolean; onExit:()=>void };

export default function FlowMode({active,onExit}:Props){
 const [target,setTarget]=useState<Target|null>(null);
 const [state,setState]=useState<DomainState|null>(null);
 const [startedAt,setStartedAt]=useState<number|null>(null);
 const [now,setNow]=useState(Date.now());
 const [adding,setAdding]=useState(false);
 const [text,setText]=useState("");
 const [completed,setCompleted]=useState(0);
 const targets=useMemo<Target[]>(()=>[
  {id:"musique",label:"Musique",kind:"domain",domain:"musique"},
  {id:"esport",label:"Esport",kind:"domain",domain:"esport"},
  ...loadCustomWorkspaces().map(w=>({id:w.id,label:w.name,kind:"custom" as const}))
 ],[active]);
 useEffect(()=>{if(!active){setTarget(null);setState(null);setStartedAt(null);setCompleted(0);setAdding(false);setText("");}},[active]);
 useEffect(()=>{if(!startedAt)return;const i=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(i)},[startedAt]);
 if(!active)return null;
 const choose=(t:Target)=>{setTarget(t);setState(t.kind==="domain"?loadDomainState(t.domain!):loadCustomWorkspaces().find(w=>w.id===t.id)?.state??null);setStartedAt(Date.now());setNow(Date.now());};
 const persist=(next:DomainState)=>{if(!target)return;setState(next);if(target.kind==="domain")saveDomainState(target.domain!,next);else saveCustomWorkspace(target.id,next);};
 const done=(task:TaskItem)=>{if(!state)return;const briefing={...state.briefing,tasks:state.briefing.tasks.map(t=>t.id===task.id?{...t,done:true,waiting:false}:t)};persist({...state,briefing,completedThisWeek:syncWeeklyCompletedTasks(state.completedThisWeek,briefing)});setCompleted(n=>n+1);};
 const add=()=>{if(!state||!text.trim())return;persist({...state,briefing:{...state.briefing,tasks:[...state.briefing.tasks,{id:crypto.randomUUID(),text:text.trim(),done:false,effort:"normal"}]}});setText("");setAdding(false);};
 const seconds=startedAt?Math.floor((now-startedAt)/1000):0;const time=`${String(Math.floor(seconds/3600)).padStart(2,"0")}:${String(Math.floor(seconds%3600/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
 const activeTasks=state?.briefing.tasks.filter(t=>!t.done&&!t.waiting)??[];
 if(!target)return <div className="fixed inset-0 z-50 bg-graphite overflow-auto"><header className="px-6 py-5 border-b border-white/10 flex justify-between items-center"><div><p className="font-mono text-xs tracking-[.3em] text-teal">FLOW</p><h1 className="font-display text-3xl mt-1">Sur quoi ?</h1></div><button onClick={onExit} className="text-xs font-mono uppercase text-muted">Quitter</button></header><main className="max-w-3xl mx-auto px-6 py-12 grid sm:grid-cols-2 gap-4">{targets.map(t=><button key={t.id} onClick={()=>choose(t)} className="min-h-40 text-left rounded-2xl border border-white/10 bg-panel p-6 hover:border-teal/50"><span className="font-display text-2xl">{t.label}</span><p className="text-xs text-muted mt-3">{t.kind==="domain"?loadDomainState(t.domain!).briefing.tasks.filter(x=>!x.done&&!x.waiting).length:loadCustomWorkspaces().find(w=>w.id===t.id)?.state.briefing.tasks.filter(x=>!x.done&&!x.waiting).length??0} priorités actives</p></button>)}</main></div>;
 return <div className="fixed inset-0 z-50 bg-graphite overflow-auto"><header className="px-6 py-5 border-b border-teal/20 flex justify-between items-center"><div className="flex items-center gap-4"><span className="font-mono text-xs tracking-[.3em] text-teal">FLOW</span><span className="font-display text-xl">{target.label}</span></div><div className="flex items-center gap-5"><span className="font-mono text-sm text-muted tabular-nums">{time}</span><button onClick={onExit} className="rounded-full border border-teal/30 px-3 py-1.5 text-xs font-mono text-teal">FLOW</button></div></header><main className="max-w-3xl mx-auto px-6 py-12"><div className="mb-10"><p className="text-[10px] font-mono uppercase tracking-widest text-muted">Maintenant</p>{activeTasks[0]?<div className="mt-3 rounded-2xl border border-teal/30 bg-panel p-7 flex items-center gap-5"><button onClick={()=>done(activeTasks[0])} className="w-8 h-8 rounded-md border border-teal/60 text-transparent hover:text-teal shrink-0">✓</button><p className="font-display text-3xl leading-tight">{activeTasks[0].text}</p></div>:<div className="mt-3 rounded-2xl border border-teal/20 bg-panel p-7"><p className="font-display text-2xl text-teal">Tout est absorbé.</p></div>}</div>{activeTasks.length>1&&<div className="space-y-2 mb-8"><p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">Ensuite</p>{activeTasks.slice(1).map((t,i)=><div key={t.id} className="rounded-xl border border-white/10 bg-panel/60 px-5 py-4 flex items-center gap-4"><span className="font-mono text-xs text-muted">{String(i+2).padStart(2,"0")}</span><span className="flex-1">{t.text}</span><button onClick={()=>done(t)} className="text-xs text-teal">✓</button></div>)}</div>}{adding?<div className="flex gap-2"><input autoFocus value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")add();if(e.key==="Escape")setAdding(false)}} className="flex-1 bg-panel border border-white/10 rounded-lg px-4 py-3" placeholder="Nouvelle priorité…"/><button onClick={add} className="text-xs text-teal">Ajouter</button></div>:<button onClick={()=>setAdding(true)} className="text-xs font-mono uppercase tracking-widest text-muted hover:text-teal">+ Ajouter une priorité</button>}<div className="mt-14 pt-5 border-t border-white/10 flex justify-between text-xs text-muted"><span>{completed} priorité{completed!==1?"s":""} terminée{completed!==1?"s":""}</span><button onClick={onExit} className="font-mono uppercase hover:text-ink">Terminer le Flow</button></div></main></div>;
}
