"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import {CustomWorkspace,emptyReviewDraft,loadCustomWorkspaces,saveCustomWorkspace} from "@/lib/storage";
import {workspaceColor} from "@/lib/workspaceColors";
import ReviewPanel from "@/components/ReviewPanel";
import ProjectsPanel,{type WorkspaceMode} from "@/components/ProjectsPanel";

type Tab="projects"|"review";
type ModeWorkspace=CustomWorkspace&{mode?:WorkspaceMode};
const TABS:[Tab,string][]=[["projects","Projets"],["review","Bilan semaine"]];

export default function CustomProjectConsole({id}:{id:string}){
  const[workspace,setWorkspace]=useState<CustomWorkspace|null>(null);
  const[tab,setTab]=useState<Tab>("projects");
  useEffect(()=>{setWorkspace(loadCustomWorkspaces().find(w=>w.id===id)??null)},[id]);
  if(!workspace)return <main className="min-h-screen p-6"><Link href="/" className="text-muted">← Accueil</Link><p className="mt-8">Projet introuvable.</p></main>;
  const color=workspaceColor(workspace);
  const workspaceMode=((workspace as ModeWorkspace).mode??"standard") as WorkspaceMode;
  const setState=(updater:(s:CustomWorkspace["state"])=>CustomWorkspace["state"])=>{const state=updater(workspace.state);setWorkspace({...workspace,state});saveCustomWorkspace(id,state)};
  return <main className="min-h-screen flex flex-col">
    <header className="border-b px-6 py-4 flex items-center gap-3" style={{borderColor:`${color}33`}}><Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-muted border rounded-full px-3 py-1.5" style={{borderColor:`${color}44`}}>← Accueil</Link><div><div className="flex items-center gap-2"><h1 className="font-display text-xl" style={{color}}>{workspace.name}</h1>{workspaceMode==="sport"&&<span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase" style={{color}}>Sport</span>}</div><p className="text-[10px] font-mono text-muted">GRAND PROJET</p></div></header>
    <nav className="flex gap-1 px-6 pt-4 overflow-x-auto">{TABS.map(([tabId,label])=><button key={tabId} onClick={()=>setTab(tabId)} className="px-4 py-2 border-b-2 whitespace-nowrap font-mono text-xs uppercase tracking-widest" style={tab===tabId?{borderColor:color,color}:{borderColor:"transparent"}}>{label}</button>)}</nav>
    <section className="flex-1 px-6 py-8 max-w-3xl w-full mx-auto">
      {tab==="projects"&&<ProjectsPanel workspaceMode={workspaceMode} accentColor={color} projects={workspace.state.projects} tasks={workspace.state.briefing.tasks} onChange={projects=>setState(s=>({...s,projects}))} onTasksChange={tasks=>setState(s=>({...s,briefing:{...s.briefing,tasks}}))}/>} 
      {tab==="review"&&<ReviewPanel draft={workspace.state.reviewDraft} history={workspace.state.reviewHistory} completedTasks={workspace.state.completedThisWeek} onDraftChange={d=>setState(s=>({...s,reviewDraft:d}))} onSave={entry=>setState(s=>({...s,reviewHistory:[entry,...s.reviewHistory],reviewDraft:emptyReviewDraft(),completedThisWeek:[]}))}/>} 
    </section>
  </main>;
}
