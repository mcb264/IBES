"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {DEFAULT_LOAD_SETTINGS,LoadSettings,loadLoadSettings,saveLoadSettings,loadCustomWorkspaces,saveCustomWorkspaces,CustomWorkspace} from "@/lib/storage";

const fields:[keyof LoadSettings,string,string][]=[
  ["lowCapacity","Capacité basse","points disponibles"],
  ["normalCapacity","Capacité normale","points disponibles"],
  ["highCapacity","Capacité haute","points disponibles"],
  ["lightActionPoints","Action basse","points consommés"],
  ["normalActionPoints","Action normale","points consommés"],
  ["heavyActionPoints","Action haute","points consommés"],
];

export default function Settings(){
  const[s,setS]=useState<LoadSettings|null>(null);
  const[workspaces,setWorkspaces]=useState<CustomWorkspace[]>([]);
  const[confirmId,setConfirmId]=useState<string|null>(null);
  useEffect(()=>{setS(loadLoadSettings());setWorkspaces(loadCustomWorkspaces())},[]);
  if(!s)return null;
  const change=(k:keyof LoadSettings,v:string)=>{const n={...s,[k]:Math.max(1,Number(v)||1)};setS(n);saveLoadSettings(n)};
  const reset=()=>{setS(DEFAULT_LOAD_SETTINGS);saveLoadSettings(DEFAULT_LOAD_SETTINGS)};
  const removeProject=(id:string)=>{const next=workspaces.filter(w=>w.id!==id);setWorkspaces(next);saveCustomWorkspaces(next);setConfirmId(null);window.dispatchEvent(new Event("ibes:workspaces-changed"));};
  return <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
    <div className="flex items-center justify-between mb-8"><div><h1 className="font-display text-3xl">Réglages</h1><p className="text-xs font-mono uppercase tracking-widest text-muted">calibrage de la charge</p></div><Link href="/" className="text-xs font-mono uppercase tracking-widest text-muted">← Cockpit</Link></div>
    <div className="rounded-lg border border-white/10 bg-panel p-5 mb-6"><p className="text-sm mb-2">Charge et échéance sont séparées.</p><p className="text-xs text-muted">La charge définit combien de points une action consomme. Les échéances servent uniquement à décider quelles actions remontent dans le Programme perso.</p></div>
    <div className="space-y-3">{fields.map(([k,label,helper])=><label key={k} className="flex items-center justify-between gap-4 bg-panel border border-white/10 rounded-md px-4 py-3"><div><span className="text-sm">{label}</span><p className="text-[10px] text-muted font-mono uppercase tracking-widest">{helper}</p></div><input type="number" min="1" value={s[k]} onChange={e=>change(k,e.target.value)} className="w-24 bg-graphite border border-white/10 rounded px-3 py-2 text-right font-mono"/></label>)}</div>
    <button onClick={reset} className="mt-6 text-xs font-mono uppercase tracking-widest text-muted hover:text-alert">Réinitialiser les valeurs par défaut</button>
    <div className="mt-8 border-t border-white/10 pt-5 text-xs text-muted"><p>Valeurs initiales : capacité 60 / 100 / 140 · actions 12 / 20 / 30.</p></div>
    {workspaces.length>0&&<section className="mt-12 border-t border-white/10 pt-8"><div className="mb-4"><h2 className="font-display text-xl">Projets personnalisés</h2><p className="text-xs text-muted mt-1">Les projets structurants ne se suppriment que depuis les réglages.</p></div><div className="space-y-2">{workspaces.map(w=><div key={w.id} className="bg-panel border border-white/10 rounded-md px-4 py-3"><div className="flex items-center justify-between gap-4"><span className="text-sm font-medium">{w.name}</span>{confirmId!==w.id&&<button onClick={()=>setConfirmId(w.id)} className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-alert">Supprimer</button>}</div>{confirmId===w.id&&<div className="mt-3 pt-3 border-t border-alert/20 flex items-center justify-between gap-3"><p className="text-xs text-alert">Supprimer définitivement ce projet et toutes ses données ?</p><div className="flex gap-3 shrink-0"><button onClick={()=>setConfirmId(null)} className="text-[10px] font-mono uppercase text-muted">Annuler</button><button onClick={()=>removeProject(w.id)} className="text-[10px] font-mono uppercase text-alert">Confirmer</button></div></div>}</div>)}</div></section>}
  </main>;
}
