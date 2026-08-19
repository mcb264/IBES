"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {CapacityLevel,DomainState,LoadInsight,LoadSettings,TaskItem,dismissLoadInsight,getLoadInsight,loadCustomWorkspaces,loadDailyCapacity,loadDomainState,loadModeRouge,localDateKey,saveDailyCapacity,saveDomainState,saveModeRouge} from "@/lib/storage";
import {loadCurrentLoadSettings} from "@/lib/loadScale";
import {migrateLegacyProjects} from "@/lib/projectMigration";
import ModeRougeSwitch from "@/components/ModeRougeSwitch";
import CustomWorkspaceCards from "@/components/CustomWorkspaceCards";
import FlowMode from "@/components/FlowMode";
import ReviewReady from "@/components/ReviewReady";
import DailyPlan from "@/components/DailyPlan";
import SportHomeBox from "@/components/SportHomeBox";

export default function Home(){
 const[modeRouge,setModeRouge]=useState(false),[flow,setFlow]=useState(false),[life,setLife]=useState<DomainState|null>(null),[capacity,setCapacity]=useState<CapacityLevel|null>(null),[settings,setSettings]=useState<LoadSettings|null>(null),[insight,setInsight]=useState<LoadInsight|null>(null),[addingLife,setAddingLife]=useState(false),[lifeText,setLifeText]=useState(""),[editingLifeId,setEditingLifeId]=useState<string|null>(null),[editingLifeText,setEditingLifeText]=useState("");
 const refresh=()=>{migrateLegacyProjects();setLife(loadDomainState("vie"));setCapacity(loadDailyCapacity()?.level??null);setSettings(loadCurrentLoadSettings())};
 useEffect(()=>{const s=loadCurrentLoadSettings();migrateLegacyProjects();setModeRouge(loadModeRouge());setLife(loadDomainState("vie"));setCapacity(loadDailyCapacity()?.level??null);setSettings(s);setInsight(getLoadInsight(s));window.addEventListener("focus",refresh);return()=>window.removeEventListener("focus",refresh)},[]);
 if(!life||!settings)return null;
 const chooseCapacity=(l:CapacityLevel)=>{setCapacity(l);saveDailyCapacity(l)};
 const toggleDown=()=>{const n=!modeRouge;setModeRouge(n);saveModeRouge(n);if(n)setFlow(false)};
 const toggleFlow=()=>{const n=!flow;setFlow(n);if(n&&modeRouge){setModeRouge(false);saveModeRouge(false)}};
 const saveLife=(n:DomainState)=>{setLife(n);saveDomainState("vie",n)};
 const lifeActive=life.briefing.tasks.filter(t=>!t.done&&!t.waiting);
 const addLife=()=>{const text=lifeText.trim();if(!text)return;const task:TaskItem={id:crypto.randomUUID(),text,done:false,effort:"normal"};saveLife({...life,briefing:{...life.briefing,tasks:[...life.briefing.tasks,task]}});setLifeText("");setAddingLife(false)};
 const completeLife=(id:string)=>saveLife({...life,briefing:{...life.briefing,tasks:life.briefing.tasks.map(t=>t.id===id?{...t,done:true}:t)}});
 const renameLife=(id:string)=>{const text=editingLifeText.trim();if(text)saveLife({...life,briefing:{...life.briefing,tasks:life.briefing.tasks.map(t=>t.id===id?{...t,text}:t)}});setEditingLifeId(null);setEditingLifeText("")};
 const today=localDateKey();
 const workspaces=loadCustomWorkspaces();
 const deadlines=workspaces.flatMap(w=>w.state.projects.filter(p=>!p.done&&p.dueDate&&p.dueDate>=today).map(p=>({...p,workspace:w.name,href:`/projet/${w.id}`}))).sort((a,b)=>a.dueDate!.localeCompare(b.dueDate!)).slice(0,4);
 return <main className="min-h-screen"><FlowMode active={flow} onExit={()=>setFlow(false)}/><header className="border-b border-white/10 px-6 py-5 flex justify-between"><div><h1 className="font-display text-3xl">IBES</h1><p className="text-xs text-muted font-mono uppercase tracking-widest">console personnelle</p></div><div className="flex items-center gap-2"><Link href="/historique" className="text-xs font-mono uppercase text-muted mr-2">Historique</Link><Link href="/reglages" className="text-xs font-mono uppercase text-muted mr-2">Réglages</Link><ModeRougeSwitch active={modeRouge} onToggle={toggleDown}/><button onClick={toggleFlow} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-[11px] uppercase tracking-widest transition-colors ${flow?"border-teal text-teal bg-teal/10":"border-white/15 text-muted hover:text-ink"}`}><span className={`w-2 h-2 rounded-full ${flow?"bg-teal animate-pulse":"bg-muted"}`}/>↑ Flow</button></div></header>
 <section className="px-6 py-8 max-w-5xl mx-auto space-y-9">
 <DailyPlan down={modeRouge} settings={settings} onCapacity={l=>{chooseCapacity(l);refresh()}}/>
 <SportHomeBox workspaces={workspaces}/>
 <ReviewReady/>
 {insight&&<div className="rounded-lg border border-cyan/30 bg-cyan/5 p-5"><p className="font-display text-lg text-cyan">IBES a remarqué quelque chose</p><p className="text-sm mt-2">Sur {insight.sampleSize} journées comparables : {insight.averagePlanned} pts prévus, {insight.averageCompleted} absorbés. Réglage actuel {insight.configured}, suggestion {insight.suggested}.</p><div className="flex gap-3 mt-3"><Link href="/reglages" className="text-xs text-cyan">Ouvrir les réglages</Link><button onClick={()=>{dismissLoadInsight(insight.signature);setInsight(null)}} className="text-xs text-muted">Compris</button></div></div>}
 <div><p className="font-mono text-[11px] text-muted uppercase mb-4">Projets</p><div className="grid md:grid-cols-2 gap-5"><CustomWorkspaceCards/></div></div>
 <div><div className="flex items-center justify-between mb-3"><div><p className="font-mono text-[11px] text-muted uppercase">À gérer</p><p className="text-xs text-muted mt-1">Ce que la vie te demande de ne pas oublier.</p></div><span className="text-[10px] text-muted">{lifeActive.length} active{lifeActive.length!==1?"s":""}</span></div><div className="rounded-xl border border-white/10 bg-panel/70 p-4 space-y-2">{lifeActive.length===0&&!addingLife&&<p className="text-sm text-muted py-2">Rien à porter ici.</p>}{lifeActive.map(t=><div key={t.id} className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0"><button onClick={()=>completeLife(t.id)} className="w-5 h-5 rounded border border-teal/50 text-transparent hover:text-teal">✓</button>{editingLifeId===t.id?<input autoFocus value={editingLifeText} onChange={e=>setEditingLifeText(e.target.value)} onBlur={()=>renameLife(t.id)} onKeyDown={e=>{if(e.key==="Enter")renameLife(t.id);if(e.key==="Escape"){setEditingLifeId(null);setEditingLifeText("")}}} className="min-w-0 flex-1 rounded border border-white/20 bg-graphite px-2 py-1 text-sm outline-none" aria-label="Renommer l’action"/>:<span className="flex-1 text-sm">{t.text}</span>}<button onClick={()=>{setEditingLifeId(t.id);setEditingLifeText(t.text)}} title="Renommer l’action" className="text-muted hover:text-ink">✎</button></div>)}{addingLife?<div className="pt-2 flex gap-2"><input autoFocus value={lifeText} onChange={e=>setLifeText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addLife();if(e.key==="Escape"){setAddingLife(false);setLifeText("")}}} className="min-w-0 flex-1 bg-graphite border border-white/10 rounded-md px-3 py-2 text-sm"/><button onClick={addLife} className="text-xs text-teal">Ajouter</button></div>:<button onClick={()=>setAddingLife(true)} className="pt-2 text-xs font-mono uppercase tracking-widest text-teal">+ Ajouter</button>}</div></div>
 {deadlines.length>0&&<div><p className="font-mono text-[11px] text-muted uppercase mb-3">Échéances projets</p>{deadlines.map(p=><Link key={`${p.href}:${p.id}`} href={p.href} className="flex justify-between bg-panel border border-white/10 rounded px-4 py-3 mb-2"><span>{p.name} <span className="text-[10px] text-muted">{p.workspace}</span></span><span className="font-mono text-xs text-amber">{new Date(p.dueDate!+"T00:00:00").toLocaleDateString("fr-FR")}</span></Link>)}</div>}
 </section></main>;
}
