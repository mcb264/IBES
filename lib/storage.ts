export type Domain = "musique" | "esport" | "vie";
export type TaskItem = { id: string; text: string; done: boolean; dueDate?: string; projectId?: string };
export type Project = { id: string; name: string; goal: string; dueDate?: string; done: boolean };
export type BriefingData = { date: string; p1: string; p2: string; p3: string; p1Done: boolean; p2Done: boolean; p3Done: boolean; bonus: string; skip: string; tasks: TaskItem[] };
export type DumpCategory = "URGENT" | "PLANIFIER" | "PARKING" | "OUBLIE" | null;
export type DumpItem = { id: string; text: string; category: DumpCategory };
export type ReviewDraft = { advanced: string; notDone: string; why: string; keep: string; change: string; next1: string; next2: string; next3: string };
export type ReviewEntry = ReviewDraft & { id: string; savedAt: string; tasksDoneCount?: number };
export type CompletedTask = { id: string; text: string; date: string };
export type DomainState = { briefing: BriefingData; dump: DumpItem[]; projects: Project[]; completedThisWeek: CompletedTask[]; reviewDraft: ReviewDraft; reviewHistory: ReviewEntry[] };

export function localDateKey(date = new Date()): string { const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,"0"); const d=String(date.getDate()).padStart(2,"0"); return `${y}-${m}-${d}`; }
function startOfCurrentWeek(): string { const date=new Date(); const day=date.getDay(); date.setHours(0,0,0,0); date.setDate(date.getDate()+(day===0?-6:1-day)); return localDateKey(date); }
function keepCurrentWeek(tasks: CompletedTask[]): CompletedTask[] { const monday=startOfCurrentWeek(), today=localDateKey(); return tasks.filter(t=>t.date>=monday&&t.date<=today); }
export const emptyBriefing=():BriefingData=>({date:localDateKey(),p1:"",p2:"",p3:"",p1Done:false,p2Done:false,p3Done:false,bonus:"",skip:"",tasks:[]});
export const emptyReviewDraft=():ReviewDraft=>({advanced:"",notDone:"",why:"",keep:"",change:"",next1:"",next2:"",next3:""});
export const defaultDomainState=():DomainState=>({briefing:emptyBriefing(),dump:[],projects:[],completedThisWeek:[],reviewDraft:emptyReviewDraft(),reviewHistory:[]});
export function syncWeeklyCompletedTasks(log:CompletedTask[],briefing:BriefingData):CompletedTask[]{ const current=keepCurrentWeek(log); const ids=new Set(briefing.tasks.map(t=>t.id)); const kept=current.filter(e=>!ids.has(e.id)||(briefing.tasks.find(t=>t.id===e.id)?.done??false)); const existing=new Set(kept.map(e=>e.id)); return [...kept,...briefing.tasks.filter(t=>t.done&&!existing.has(t.id)).map(t=>({id:t.id,text:t.text,date:briefing.date}))]; }
function domainKey(domain:Domain){return `ibes:${domain}`;}
export function loadDomainState(domain:Domain):DomainState{ if(typeof window==="undefined")return defaultDomainState(); try{const raw=window.localStorage.getItem(domainKey(domain)); if(!raw)return defaultDomainState(); const parsed=JSON.parse(raw); const state:DomainState={...defaultDomainState(),...parsed}; state.briefing={...emptyBriefing(),...state.briefing}; state.projects=state.projects??[]; state.completedThisWeek=keepCurrentWeek(state.completedThisWeek??[]); if(state.briefing.date!==localDateKey())state.briefing=emptyBriefing(); return state;}catch{return defaultDomainState();}}
export function saveDomainState(domain:Domain,state:DomainState){if(typeof window!=="undefined")window.localStorage.setItem(domainKey(domain),JSON.stringify(state));}
const MODE_ROUGE_KEY="ibes:mode-rouge";
export function loadModeRouge():boolean{return typeof window!=="undefined"&&window.localStorage.getItem(MODE_ROUGE_KEY)==="1";}
export function saveModeRouge(active:boolean){if(typeof window!=="undefined")window.localStorage.setItem(MODE_ROUGE_KEY,active?"1":"0");}
