"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {LoadSettings,loadCustomWorkspaces,saveCustomWorkspaces,CustomWorkspace} from "@/lib/storage";
import {CURRENT_LOAD_DEFAULTS,loadCurrentLoadSettings,saveCurrentLoadSettings} from "@/lib/loadScale";

const capacityFields:[keyof LoadSettings,string][]=[["lowCapacity","Basse"],["normalCapacity","Normale"],["highCapacity","Haute"]];
const actionFields:[keyof LoadSettings,string][]=[["lightActionPoints","Basse"],["normalActionPoints","Normale"],["heavyActionPoints","Haute"]];
const accountKeys=["ibes:musique","ibes:esport","ibes:vie","ibes:inbox","ibes:custom-workspaces","ibes:mode-rouge","ibes:load-settings","ibes:daily-capacity","ibes:load-history","ibes:load-insight-dismissed","ibes:active-user"];

export default function Settings(){
  const[s,setS]=useState<LoadSettings|null>(null);
  const[workspaces,setWorkspaces]=useState<CustomWorkspace[]>([]);
  const[confirmId,setConfirmId]=useState<string|null>(null);
  useEffect(()=>{setS(loadCurrentLoadSettings());setWorkspaces(loadCustomWorkspaces())},[]);
  if(!s)return null;
  const change=(k:keyof LoadSettings,v:string)=>{const n={...s,[k]:Math.max(.1,Number(v)||.1)};setS(n);saveCurrentLoadSettings(n)};
  const reset=()=>{setS(CURRENT_LOAD_DEFAULTS);saveCurrentLoadSettings(CURRENT_LOAD_DEFAULTS)};
  const removeProject=(id:string)=>{const next=workspaces.filter(w=>w.id!==id);setWorkspaces(next);saveCustomWorkspaces(next);setConfirmId(null);window.dispatchEvent(new Event("ibes:workspaces-changed"));};
  const logout=async()=>{
    await fetch("/api/auth/logout",{method:"POST"});
    for(const key of accountKeys) window.localStorage.removeItem(key);
    window.sessionStorage.clear();
    window.location.replace("/login");
  };
  const field=(k:keyof LoadSettings,label:string)=><label key={k} className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0"><span className="text-sm">{label}</span><div className="flex items-center gap-2"><input type="number" min="0.1" step="0.1" value={s[k]} onChange={e=>change(k,e.target.value)} className="w-20 bg-graphite border border-white/10 rounded px-3 py-2 text-right font-mono"/><span className="text-[10px] text-muted font-mono">PTS</span></div></label>;
  return <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
    <div className="flex items-center justify-between mb-8"><div><h1 className="font-display text-3xl">Réglages</h1><p className="text-xs font-mono uppercase tracking-widest text-muted">points de charge</p></div><Link href="/" className="text-xs font-mono uppercase tracking-widest text-muted">← Cockpit</Link></div>
    <div className="rounded-lg border border-white/10 bg-panel p-5 mb-6"><p className="text-sm mb-2">Une seule échelle.</p><p className="text-xs text-muted">Une action consomme des points de charge. Ta capacité du jour indique combien de ces mêmes points tu peux absorber. Les échéances servent seulement à choisir l’ordre.</p></div>
    <section className="rounded-xl border border-white/10 bg-panel px-5 mb-4"><div className="pt-4 pb-1"><h2 className="font-display text-lg">Coût d’une action</h2><p className="text-xs text-muted">La valeur utilisée partout dans IBES.</p></div>{actionFields.map(([k,label])=>field(k,label))}</section>
    <section className="rounded-xl border border-white/10 bg-panel px-5"><div className="pt-4 pb-1"><h2 className="font-display text-lg">Capacité du jour</h2><p className="text-xs text-muted">Le budget disponible sur la même échelle.</p></div>{capacityFields.map(([k,label])=>field(k,label))}</section>
    <div className="mt-5 text-xs text-muted">Échelle par défaut : actions 1,2 / 2 / 3 pts · capacité 6 / 10 / 14 pts.</div>
    <button onClick={reset} className="mt-4 text-xs font-mono uppercase tracking-widest text-muted hover:text-alert">Réinitialiser les valeurs par défaut</button>
    {workspaces.length>0&&<section className="mt-12 border-t border-white/10 pt-8"><div className="mb-4"><h2 className="font-display text-xl">Projets personnalisés</h2><p className="text-xs text-muted mt-1">Les projets structurants ne se suppriment que depuis les réglages.</p></div><div className="space-y-2">{workspaces.map(w=><div key={w.id} className="bg-panel border border-white/10 rounded-md px-4 py-3"><div className="flex items-center justify-between gap-4"><span className="text-sm font-medium">{w.name}</span>{confirmId!==w.id&&<button onClick={()=>setConfirmId(w.id)} className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-alert">Supprimer</button>}</div>{confirmId===w.id&&<div className="mt-3 pt-3 border-t border-alert/20 flex items-center justify-between gap-3"><p className="text-xs text-alert">Supprimer définitivement ce projet et toutes ses données ?</p><div className="flex gap-3 shrink-0"><button onClick={()=>setConfirmId(null)} className="text-[10px] font-mono uppercase text-muted">Annuler</button><button onClick={()=>removeProject(w.id)} className="text-[10px] font-mono uppercase text-alert">Confirmer</button></div></div>}</div>)}</div></section>}
    <section className="mt-12 border-t border-white/10 pt-8"><h2 className="font-display text-xl">Compte</h2><button onClick={logout} className="mt-4 text-xs font-mono uppercase tracking-widest text-muted hover:text-alert">Se déconnecter</button></section>
  </main>;
}