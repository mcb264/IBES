export type Domain = "musique" | "esport" | "vie";
export type TaskItem = { id: string; text: string; done: boolean; dueDate?: string; projectId?: string; carried?: boolean };
export type Project = { id: string; name: string; goal: string; dueDate?: string; done: boolean };
export type BriefingData = { date: string; p1: string; p2: string; p3: string; p1Done: boolean; p2Done: boolean; p3Done: boolean; bonus: string; skip: string; tasks: TaskItem[] };
export type DumpCategory = "URGENT" | "PLANIFIER" | "PARKING" | "OUBLIE" | null;
export type DumpItem = { id: string; text: string; category: DumpCategory };
export type ReviewDraft = { advanced: string; notDone: string; why: string; keep: string; change: string; next1: string; next2: string; next3: string };
export type ReviewEntry = ReviewDraft & { id: string; savedAt: string; tasksDoneCount?: number; prioritiesDoneCount?: number };
export type CompletedTask = { id: string; text: string; date: string; kind?: "priority" | "task"; priorityRank?: 1 | 2 | 3 };
export type DomainState = { briefing: BriefingData; dump: DumpItem[]; projects: Project[]; completedThisWeek: CompletedTask[]; reviewDraft: ReviewDraft; reviewHistory: ReviewEntry[] };

export function localDateKey(date = new Date()): string { const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,"0"); const d=String(date.getDate()).padStart(2,"0"); return `${y}-${m}-${d}`; }
function startOfCurrentWeek(): string { const date=new Date(); const day=date.getDay(); date.setHours(0,0,0,0); date.setDate(date.getDate()+(day===0?-6:1-day)); return localDateKey(date); }
function keepCurrentWeek(tasks: CompletedTask[]): CompletedTask[] { const monday=startOfCurrentWeek(), today=localDateKey(); return tasks.filter(t=>t.date>=monday&&t.date<=today); }
export const emptyBriefing=():BriefingData=>({date:localDateKey(),p1:"",p2:"",p3:"",p1Done:false,p2Done:false,p3Done:false,bonus:"",skip:"",tasks:[]});
export const emptyReviewDraft=():ReviewDraft=>({advanced:"",notDone:"",why:"",keep:"",change:"",next1:"",next2:"",next3:""});
export const defaultDomainState=():DomainState=>({briefing:emptyBriefing(),dump:[],projects:[],completedThisWeek:[],reviewDraft:emptyReviewDraft(),reviewHistory:[]});

export function workloadScore(state:DomainState):number{
 const b=state.briefing;
 const priorities=[b.p1,b.p2,b.p3].filter(Boolean).length;
 const openTasks=b.tasks.filter(t=>!t.done).length;
 const urgent=state.dump.filter(i=>i.category==="URGENT").length;
 const today=localDateKey();
 const dueSoon=state.projects.filter(p=>!p.done&&p.dueDate&&p.dueDate<=today).length;
 return Math.min(100,priorities*15+openTasks*8+urgent*12+dueSoon*15);
}

export function syncWeeklyCompletedTasks(log:CompletedTask[],briefing:BriefingData):CompletedTask[]{
 const current=keepCurrentWeek(log).map(e=>({...e,kind:e.kind??"task" as const}));
 const taskIds=new Set(briefing.tasks.map(t=>t.id));
 const priorityIds=new Set([1,2,3].map(rank=>`priority:${briefing.date}:${rank}`));
 const kept=current.filter(e=>{
   if(e.kind==="priority"&&priorityIds.has(e.id)){ const rank=e.priorityRank??Number(e.id.split(":").pop()) as 1|2|3; return Boolean(briefing[`p${rank}Done` as "p1Done"|"p2Done"|"p3Done"]); }
   if(e.kind!=="priority"&&taskIds.has(e.id)) return briefing.tasks.find(t=>t.id===e.id)?.done??false;
   return true;
 });
 const existing=new Set(kept.map(e=>e.id));
 const taskAdditions=briefing.tasks.filter(t=>t.done&&!existing.has(t.id)).map(t=>({id:t.id,text:t.text,date:briefing.date,kind:"task" as const}));
 const priorityAdditions=([1,2,3] as const).flatMap(rank=>{ const text=briefing[`p${rank}` as "p1"|"p2"|"p3"].trim(); const done=briefing[`p${rank}Done` as "p1Done"|"p2Done"|"p3Done"]; const id=`priority:${briefing.date}:${rank}`; return done&&text&&!existing.has(id)?[{id,text,date:briefing.date,kind:"priority" as const,priorityRank:rank}]:[]; });
 return [...kept,...priorityAdditions,...taskAdditions];
}
function domainKey(domain:Domain){return `ibes:${domain}`;}
export function loadDomainState(domain:Domain):DomainState{
 if(typeof window==="undefined")return defaultDomainState();
 try{
  const raw=window.localStorage.getItem(domainKey(domain)); if(!raw)return defaultDomainState();
  const parsed=JSON.parse(raw); const state:DomainState={...defaultDomainState(),...parsed}; state.briefing={...emptyBriefing(),...state.briefing}; state.projects=state.projects??[]; state.completedThisWeek=keepCurrentWeek(state.completedThisWeek??[]);
  if(state.briefing.date!==localDateKey()){
   const unfinished=(state.briefing.tasks??[]).filter((t:TaskItem)=>!t.done).map((t:TaskItem)=>({...t,carried:true}));
   state.briefing={...emptyBriefing(),tasks:unfinished};
  }
  return state;
 }catch{return defaultDomainState();}
}
export function saveDomainState(domain:Domain,state:DomainState){if(typeof window!=="undefined")window.localStorage.setItem(domainKey(domain),JSON.stringify(state));}
const MODE_ROUGE_KEY="ibes:mode-rouge";
export function loadModeRouge():boolean{return typeof window!=="undefined"&&window.localStorage.getItem(MODE_ROUGE_KEY)==="1";}
export function saveModeRouge(active:boolean){if(typeof window!=="undefined")window.localStorage.setItem(MODE_ROUGE_KEY,active?"1":"0");}
