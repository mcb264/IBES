"use client";
import Link from "next/link";
import {CapacityLevel,Domain,DomainState,LoadSettings,capacityValue,effortMultiplier,localDateKey} from "@/lib/storage";

type Props={states:Record<Domain,DomainState>;capacity:CapacityLevel|null;settings:LoadSettings;onCapacity:(l:CapacityLevel)=>void};
const LABEL:Record<Domain,string>={musique:"Musique",esport:"Esport",vie:"Vie"};
export default function MorningBriefing({states,capacity,settings,onCapacity}:Props){
 const today=localDateKey();
 if(!capacity)return <section className="rounded-xl border border-white/10 bg-panel px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm"><span className="text-teal font-medium">IBES</span> · Ta capacité aujourd'hui ?</p><div className="flex gap-2">{([['low','Basse'],['normal','Normale'],['high','Haute']] as const).map(([v,l])=><button key={v} onClick={()=>onCapacity(v)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:border-teal/50">{l}</button>)}</div></div></section>;
 const domains=(['musique','esport','vie'] as Domain[]).map(domain=>{const s=states[domain],tasks=s.briefing.tasks.filter(t=>!t.done&&!t.waiting&&(!t.deferredUntil||t.deferredUntil<=today)),deadline=s.projects.filter(p=>!p.done&&p.dueDate&&p.dueDate>=today).sort((a,b)=>a.dueDate!.localeCompare(b.dueDate!))[0];return{domain,tasks,deadline,points:Math.round(tasks.reduce((n,t)=>n+settings.priorityWeight*effortMultiplier(t.effort),0))}});
 const totalPoints=domains.reduce((n,d)=>n+d.points,0),cap=capacityValue(capacity,settings),overloaded=totalPoints>cap;
 const soon=domains.filter(d=>d.deadline&&Math.ceil((new Date(d.deadline.dueDate!+'T00:00:00').getTime()-new Date(today+'T00:00:00').getTime())/86400000)<=7);
 const focus=domains.filter(d=>d.tasks.length).sort((a,b)=>((b.deadline?100:0)+b.points)-((a.deadline?100:0)+a.points))[0];
 if(!overloaded&&!soon.length&&!focus)return null;
 const message=overloaded?`Ta charge dépasse ta capacité. ${focus?`Je garderais surtout ${LABEL[focus.domain]} : ${focus.tasks[0].text}.`:''}`:soon.length?`Échéance proche sur ${LABEL[soon[0].domain]} : ${soon[0].deadline!.name}.`:focus?`Aujourd'hui, je commencerais par ${LABEL[focus.domain]} : ${focus.tasks[0].text}.`:'';
 const href=focus?.domain==='musique'?'/musique':focus?.domain==='esport'?'/esport':'/';
 return <section className="rounded-xl border border-teal/20 bg-teal/5 px-5 py-4 flex items-start justify-between gap-4"><div><p className="text-[10px] font-mono uppercase tracking-widest text-teal mb-1">IBES</p><p className="text-sm leading-relaxed">{message}</p></div>{focus&&<Link href={href} className="text-xs text-teal whitespace-nowrap mt-4">Ouvrir →</Link>}</section>;
}
