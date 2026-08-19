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

  return <main className="min-h-screen flex flex-col bg-[#0b0f12]">
    <header className="sticky top-0 z-40 border-b bg-[#0b0f12]/95 backdrop-blur px-5 sm:px-8 py-4" style={{borderColor:`${color}26`}}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="shrink-0 text-sm text-muted hover:text-ink transition">←</Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-display text-xl sm:text-2xl truncate" style={{color}}>{workspace.name}</h1>
              {workspaceMode==="sport"&&<span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[8px] font-mono uppercase" style={{color}}>Sport</span>}
            </div>
            <p className="mt-0.5 text-[9px] font-mono uppercase tracking-[.18em] text-muted">Grand projet</p>
          </div>
        </div>
        <span className="hidden sm:block text-[10px] font-mono uppercase tracking-[.16em] text-muted">IBES — Système de pilotage</span>
      </div>
    </header>

    <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <nav className="flex gap-6 border-b border-white/[.07] overflow-x-auto">
        {TABS.map(([tabId,label])=><button key={tabId} onClick={()=>setTab(tabId)} className="py-4 border-b-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[.16em] transition" style={tab===tabId?{borderColor:color,color}:{borderColor:"transparent"}}>{label}</button>)}
      </nav>
    </div>

    <section className="flex-1 px-5 sm:px-8 py-7 sm:py-10 w-full max-w-6xl mx-auto">
      {tab==="projects"&&<ProjectsPanel workspaceMode={workspaceMode} accentColor={color} projects={workspace.state.projects} tasks={workspace.state.briefing.tasks} onChange={projects=>setState(s=>({...s,projects}))} onTasksChange={tasks=>setState(s=>({...s,briefing:{...s.briefing,tasks}}))}/>} 
      {tab==="review"&&<ReviewPanel draft={workspace.state.reviewDraft} history={workspace.state.reviewHistory} completedTasks={workspace.state.completedThisWeek} onDraftChange={d=>setState(s=>({...s,reviewDraft:d}))} onSave={entry=>setState(s=>({...s,reviewHistory:[entry,...s.reviewHistory],reviewDraft:emptyReviewDraft(),completedThisWeek:[]}))}/>} 
    </section>
  </main>;
}
