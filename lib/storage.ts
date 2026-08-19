export type Domain = "musique" | "esport" | "vie";
export type CapacityLevel = "low" | "normal" | "high";
export type EffortLevel = "light" | "normal" | "heavy";
export type WorkspaceMode = "standard" | "sport";
export type TaskItem = { id:string;text:string;done:boolean;dueDate?:string;projectId?:string;carried?:boolean;effort?:EffortLevel;waiting?:boolean;waitingSince?:string;deferredUntil?:string;capacityOverrideDate?:string;todayDate?:string;recurringTarget?:number;recurringPeriod?:"week";recurringCount?:number;recurringPeriodKey?:string;recurrenceHistory?:string[];projectPaused?:boolean;projectPausedWasWaiting?:boolean;sportSteps?:string[] };
export type Project={id:string;name:string;goal:string;dueDate?:string;done:boolean;order?:number;mode?:WorkspaceMode};
export type BriefingData={date:string;p1:string;p2:string;p3:string;p1Done:boolean;p2Done:boolean;p3Done:boolean;p1Effort?:EffortLevel;p2Effort?:EffortLevel;p3Effort?:EffortLevel;bonus:string;skip:string;tasks:TaskItem[]};
export type DumpCategory="PLANIFIER"|"PARKING"|"OUBLIE"|null;
export type DumpItem={id:string;text:string;category:DumpCategory};
export type ReviewDraft={advanced:string;notDone:string;why:string;keep:string;change:string;next1:string;next2:string;next3:string};
export type ReviewEntry=ReviewDraft&{id:string;savedAt:string;tasksDoneCount?:number;prioritiesDoneCount?:number};
export type CompletedTask={id:string;text:string;date:string;kind?:"priority"|"task";priorityRank?:1|2|3};
export type DomainState={briefing:BriefingData;dump:DumpItem[];projects:Project[];completedThisWeek:CompletedTask[];reviewDraft:ReviewDraft;reviewHistory:ReviewEntry[]};
export type CustomWorkspace={id:string;name:string;state:DomainState;mode?:WorkspaceMode;color?:string};
export type LoadSettings={lowCapacity:number;normalCapacity:number;highCapacity:number;lightActionPoints:number;normalActionPoints:number;heavyActionPoints:number};
export type DailyCapacity={date:string;level:CapacityLevel};
export type LoadHistoryEntry={date:string;capacity:CapacityLevel|null;plannedPoints:number;peakPlannedPoints:number;completedPoints:number;completedPriorities:number;completedTasks:number;carriedTasks:number;updatedAt:string};
export type LoadInsight={level:CapacityLevel;sampleSize:number;configured:number;averagePlanned:number;averageCompleted:number;completionRate:number;suggested:number;direction:"lower"|"higher";signature:string};

export const DEFAULT_LOAD_SETTINGS:LoadSettings={lowCapacity:60,normalCapacity:100,highCapacity:140,lightActionPoints:12,normalActionPoints:20,heavyActionPoints:30};
export function taskPoints(t:TaskItem,s:LoadSettings){return t.effort==="light"?s.lightActionPoints:t.effort==="heavy"?s.heavyActionPoints:s.normalActionPoints;}
export function localDateKey(date=new Date()){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");return`${y}-${m}-${d}`;}
export function weekKey(date=new Date()){const d=new Date(date);const day=d.getDay();d.setHours(0,0,0,0);d.setDate(d.getDate()+(day===0?-6:1-day));return localDateKey(d);}
export function normalizeRecurringTask(t:TaskItem,date=new Date()):TaskItem{if(!t.recurringTarget)return t;const key=weekKey(date);if(t.recurringPeriodKey===key)return t;return{...t,done:false,recurringCount:0,recurringPeriod:"week",recurringPeriodKey:key,todayDate:undefined,capacityOverrideDate:undefined};}
export function recurringProgress(t:TaskItem){const n=normalizeRecurringTask(t);return{count:n.recurringCount??0,target:n.recurringTarget??0};}
export function recurringComplete(t:TaskItem){if(!t.recurringTarget)return false;const p=recurringProgress(t);return p.count>=p.target;}
export function completeRecurringTask(t:TaskItem,date=localDateKey()):TaskItem{const n=normalizeRecurringTask(t);if(!n.recurringTarget||recurringComplete(n))return n;return{...n,done:false,recurringCount:Math.min(n.recurringTarget,(n.recurringCount??0)+1),recurrenceHistory:[...(n.recurrenceHistory??[]),date],todayDate:undefined,capacityOverrideDate:undefined};}
export function isOpenAction(t:TaskItem){const n=normalizeRecurringTask(t);return !n.done&&!n.waiting&&!recurringComplete(n);}
export function isTaskActiveToday(t:TaskItem,date=localDateKey()){return isOpenAction(t)&&t.todayDate===date;}
function startOfCurrentWeek(){return weekKey();}
function keepCurrentWeek(tasks:CompletedTask[]){const monday=startOfCurrentWeek(),today=localDateKey();return tasks.filter(t=>t.date>=monday&&t.date<=today);}
export const emptyBriefing=():BriefingData=>({date:localDateKey(),p1:"",p2:"",p3:"",p1Done:false,p2Done:false,p3Done:false,p1Effort:"normal",p2Effort:"normal",p3Effort:"normal",bonus:"",skip:"",tasks:[]});
export const emptyReviewDraft=():ReviewDraft=>({advanced:"",notDone:"",why:"",keep:"",change:"",next1:"",next2:"",next3:""});
export const defaultDomainState=():DomainState=>({briefing:emptyBriefing(),dump:[],projects:[],completedThisWeek:[],reviewDraft:emptyReviewDraft(),reviewHistory:[]});
export function waitingNeedsAttention(task:TaskItem,projects:Project[]){if(!task.waiting||!task.projectId)return false;const p=projects.find(x=>x.id===task.projectId);if(!p?.dueDate||p.done)return false;const today=new Date(localDateKey()+"T00:00:00"),due=new Date(p.dueDate+"T00:00:00");return Math.ceil((due.getTime()-today.getTime())/86400000)<=2;}
export function rawWorkload(state:DomainState,settings:LoadSettings){return state.briefing.tasks.filter(t=>isTaskActiveToday(t)).reduce((n,t)=>n+taskPoints(t,settings),0);}
export function workloadBreakdown(state:DomainState,settings:LoadSettings){const ts=state.briefing.tasks.filter(t=>isTaskActiveToday(t)),points=ts.reduce((n,t)=>n+taskPoints(t,settings),0);return{actions:ts.length,points};}
export function capacityValue(level:CapacityLevel,s:LoadSettings){return level==="low"?s.lowCapacity:level==="high"?s.highCapacity:s.normalCapacity;}
export function workloadUsage(state:DomainState,s:LoadSettings,l:CapacityLevel){const raw=rawWorkload(state,s),capacity=capacityValue(l,s);return{raw,capacity,percent:capacity?Math.round(raw/capacity*100):0};}
export function syncWeeklyCompletedTasks(log:CompletedTask[],b:BriefingData){const current=keepCurrentWeek(log),existing=new Set(current.map(e=>e.id));return[...current,...b.tasks.filter(t=>t.done&&!existing.has(t.id)).map(t=>({id:t.id,text:t.text,date:b.date,kind:"priority" as const}))];}

function migrateBriefing(b:BriefingData){const old=([1,2,3]as const).flatMap(rank=>{const text=b[`p${rank}` as "p1"|"p2"|"p3"].trim();if(!text)return[];return[{id:`legacy-priority:${b.date}:${rank}`,text,done:b[`p${rank}Done` as "p1Done"|"p2Done"|"p3Done"],effort:b[`p${rank}Effort` as "p1Effort"|"p2Effort"|"p3Effort"]??"normal"}];});const existing=(b.tasks??[]).map(t=>normalizeRecurringTask({...t}));return{...b,p1:"",p2:"",p3:"",p1Done:false,p2Done:false,p3Done:false,tasks:[...old.filter(x=>!existing.some(t=>t.id===x.id)),...existing]};}
function domainKey(d:Domain){return`ibes:${d}`;}
function parseDomainState(d:Domain):DomainState{try{const raw=window.localStorage.getItem(domainKey(d));if(!raw)return defaultDomainState();const parsed=JSON.parse(raw);const briefing=migrateBriefing({...emptyBriefing(),...parsed.briefing});return{...defaultDomainState(),...parsed,briefing,projects:parsed.projects??[]};}catch{return defaultDomainState();}}

function normalizeState(value:unknown):DomainState{
 const parsed=value&&typeof value==="object"?value as Partial<DomainState>:{};
 const briefingValue=parsed.briefing&&typeof parsed.briefing==="object"?parsed.briefing:{};
 const briefing=migrateBriefing({...emptyBriefing(),...briefingValue,tasks:Array.isArray((briefingValue as Partial<BriefingData>).tasks)?(briefingValue as BriefingData).tasks:[]});
 const state:DomainState={
  ...defaultDomainState(),
  ...parsed,
  briefing,
  dump:Array.isArray(parsed.dump)?parsed.dump:[],
  projects:Array.isArray(parsed.projects)?parsed.projects:[],
  completedThisWeek:keepCurrentWeek(Array.isArray(parsed.completedThisWeek)?parsed.completedThisWeek:[]),
  reviewDraft:{...emptyReviewDraft(),...(parsed.reviewDraft&&typeof parsed.reviewDraft==="object"?parsed.reviewDraft:{})},
  reviewHistory:Array.isArray(parsed.reviewHistory)?parsed.reviewHistory:[],
 };
 if(state.briefing.date!==localDateKey()){
  const previousDate=state.briefing.date;
  const known=new Set(state.completedThisWeek.map(task=>task.id));
  const completed=state.briefing.tasks
   .filter(task=>task.done&&!known.has(task.id))
   .map(task=>({id:task.id,text:task.text,date:previousDate,kind:"priority" as const}));
  state.completedThisWeek=keepCurrentWeek([...state.completedThisWeek,...completed]);
  state.briefing={...state.briefing,date:localDateKey(),tasks:state.briefing.tasks.map(task=>normalizeRecurringTask({...task,todayDate:undefined,capacityOverrideDate:undefined}))};
 }
 return state;
}

const MODE_ROUGE_KEY="ibes:mode-rouge",LOAD_SETTINGS_KEY="ibes:load-settings",DAILY_CAPACITY_KEY="ibes:daily-capacity",LOAD_HISTORY_KEY="ibes:load-history",INSIGHT_DISMISS_KEY="ibes:load-insight-dismissed",CUSTOM_WORKSPACES_KEY="ibes:custom-workspaces",PURGE_DONE_KEY="ibes:purge-done-v2";
function purgeDomainDoneOnce(d:Domain,state:DomainState){const key=`${PURGE_DONE_KEY}:${d}`;if(window.localStorage.getItem(key)==="1")return state;const cleaned={...state,briefing:{...state.briefing,tasks:state.briefing.tasks.filter(t=>!t.done)}};window.localStorage.setItem(key,"1");return cleaned;}
export function loadCustomWorkspaces():CustomWorkspace[]{if(typeof window==="undefined")return[];try{const value:unknown=JSON.parse(window.localStorage.getItem(CUSTOM_WORKSPACES_KEY)||"[]");if(!Array.isArray(value))return[];const parsed=value.filter((item):item is Partial<CustomWorkspace>=>!!item&&typeof item==="object"&&typeof item.id==="string"&&typeof item.name==="string").map(item=>({...item,id:item.id!,name:item.name!,state:normalizeState(item.state)} as CustomWorkspace));const key=`${PURGE_DONE_KEY}:custom`;if(window.localStorage.getItem(key)==="1"){window.localStorage.setItem(CUSTOM_WORKSPACES_KEY,JSON.stringify(parsed));return parsed;}const cleaned=parsed.map(w=>({...w,state:{...w.state,briefing:{...w.state.briefing,tasks:w.state.briefing.tasks.filter(t=>!t.done)}}}));window.localStorage.setItem(CUSTOM_WORKSPACES_KEY,JSON.stringify(cleaned));window.localStorage.setItem(key,"1");return cleaned;}catch{return[];}}
export function saveCustomWorkspaces(items:CustomWorkspace[]){if(typeof window!=="undefined")window.localStorage.setItem(CUSTOM_WORKSPACES_KEY,JSON.stringify(items));}
export function withWorkspaceMode(workspace:CustomWorkspace,mode:WorkspaceMode):CustomWorkspace{return{...workspace,mode,state:{...workspace.state,projects:workspace.state.projects.map(project=>({...project,mode}))}};}
export function createCustomWorkspace(name:string){const item:CustomWorkspace={id:crypto.randomUUID(),name,state:defaultDomainState()};saveCustomWorkspaces([...loadCustomWorkspaces(),item]);return item;}
export function saveCustomWorkspace(id:string,state:DomainState){saveCustomWorkspaces(loadCustomWorkspaces().map(w=>w.id===id?{...w,state}:w));recordLoadHistory();}

function recordLoadHistory(){if(typeof window==="undefined")return;const settings=loadLoadSettings(),states=[...((["musique","esport","vie"]as Domain[]).map(parseDomainState)),...loadCustomWorkspaces().map(w=>w.state)],date=localDateKey(),capacity=loadDailyCapacity()?.level??null,plannedPoints=states.reduce((n,s)=>n+rawWorkload(s,settings),0);let completedPoints=0,completedPriorities=0;for(const s of states)for(const t of s.briefing.tasks){if(t.done){completedPriorities++;completedPoints+=taskPoints(t,settings);}}try{const history:LoadHistoryEntry[]=JSON.parse(window.localStorage.getItem(LOAD_HISTORY_KEY)||"[]"),old=history.find(h=>h.date===date),entry:LoadHistoryEntry={date,capacity,plannedPoints,peakPlannedPoints:Math.max(old?.peakPlannedPoints??0,plannedPoints+completedPoints),completedPoints,completedPriorities,completedTasks:0,carriedTasks:0,updatedAt:new Date().toISOString()};window.localStorage.setItem(LOAD_HISTORY_KEY,JSON.stringify([...history.filter(h=>h.date!==date),entry].sort((a,b)=>a.date.localeCompare(b.date)).slice(-90)));}catch{}}
export function loadLoadHistory():LoadHistoryEntry[]{if(typeof window==="undefined")return[];try{return JSON.parse(window.localStorage.getItem(LOAD_HISTORY_KEY)||"[]");}catch{return[];}}
export function getLoadInsight(settings:LoadSettings):LoadInsight|null{if(typeof window==="undefined")return null;const history=loadLoadHistory().filter(h=>h.capacity&&h.date<localDateKey()&&h.peakPlannedPoints>0);for(const level of["normal","low","high"]as CapacityLevel[]){const rows=history.filter(h=>h.capacity===level);if(rows.length<7)continue;const recent=rows.slice(-14),avgPlanned=Math.round(recent.reduce((n,h)=>n+h.peakPlannedPoints,0)/recent.length),avgCompleted=Math.round(recent.reduce((n,h)=>n+h.completedPoints,0)/recent.length),completionRate=avgPlanned?Math.round(avgCompleted/avgPlanned*100):0,configured=capacityValue(level,settings);let direction:"lower"|"higher"|null=null,suggested=configured;if(completionRate<75&&avgPlanned>=configured*.7){direction="lower";suggested=Math.max(20,Math.round(avgCompleted/5)*5);}else if(completionRate>=90&&avgPlanned>=configured*.9&&avgCompleted>=configured*.9){direction="higher";suggested=Math.round(Math.max(configured*1.1,avgCompleted*1.1)/5)*5;}if(!direction||Math.abs(suggested-configured)<10)continue;const signature=`${level}:${rows.length}:${direction}:${suggested}`;if(window.localStorage.getItem(INSIGHT_DISMISS_KEY)===signature)continue;return{level,sampleSize:recent.length,configured,averagePlanned:avgPlanned,averageCompleted:avgCompleted,completionRate,suggested,direction,signature};}return null;}
export function dismissLoadInsight(s:string){if(typeof window!=="undefined")window.localStorage.setItem(INSIGHT_DISMISS_KEY,s);}
export function loadDomainState(d:Domain){if(typeof window==="undefined")return defaultDomainState();try{let state=parseDomainState(d);state.completedThisWeek=keepCurrentWeek(state.completedThisWeek??[]);if(state.briefing.date!==localDateKey()){const previousDate=state.briefing.date,completed=state.briefing.tasks.filter(t=>t.done).map(t=>({id:t.id,text:t.text,date:previousDate,kind:"priority" as const})),known=new Set(state.completedThisWeek.map(t=>t.id));state.completedThisWeek=keepCurrentWeek([...state.completedThisWeek,...completed.filter(t=>!known.has(t.id))]);state.briefing={...state.briefing,date:localDateKey(),tasks:state.briefing.tasks.map(t=>normalizeRecurringTask({...t,todayDate:undefined,capacityOverrideDate:undefined}))};}else state.briefing={...state.briefing,tasks:state.briefing.tasks.map(t=>normalizeRecurringTask(t))};state=purgeDomainDoneOnce(d,state);window.localStorage.setItem(domainKey(d),JSON.stringify(state));return state;}catch{return defaultDomainState();}}
export function saveDomainState(d:Domain,s:DomainState){if(typeof window!=="undefined"){window.localStorage.setItem(domainKey(d),JSON.stringify(s));recordLoadHistory();}}
export function loadModeRouge(){return typeof window!=="undefined"&&window.localStorage.getItem(MODE_ROUGE_KEY)==="1";}
export function saveModeRouge(a:boolean){if(typeof window!=="undefined")window.localStorage.setItem(MODE_ROUGE_KEY,a?"1":"0");}
export function loadLoadSettings():LoadSettings{if(typeof window==="undefined")return DEFAULT_LOAD_SETTINGS;try{const raw=JSON.parse(window.localStorage.getItem(LOAD_SETTINGS_KEY)||"{}");const legacyNormal=Number(raw.priorityWeight)||DEFAULT_LOAD_SETTINGS.normalActionPoints;return{lowCapacity:Number(raw.lowCapacity)||DEFAULT_LOAD_SETTINGS.lowCapacity,normalCapacity:Number(raw.normalCapacity)||DEFAULT_LOAD_SETTINGS.normalCapacity,highCapacity:Number(raw.highCapacity)||DEFAULT_LOAD_SETTINGS.highCapacity,lightActionPoints:Number(raw.lightActionPoints)||Math.max(1,Math.round(legacyNormal*.6)),normalActionPoints:Number(raw.normalActionPoints)||legacyNormal,heavyActionPoints:Number(raw.heavyActionPoints)||Math.max(1,Math.round(legacyNormal*1.5))};}catch{return DEFAULT_LOAD_SETTINGS;}}
export function saveLoadSettings(s:LoadSettings){if(typeof window!=="undefined"){window.localStorage.setItem(LOAD_SETTINGS_KEY,JSON.stringify(s));recordLoadHistory();}}
export function loadDailyCapacity():DailyCapacity|null{if(typeof window==="undefined")return null;try{const p=JSON.parse(window.localStorage.getItem(DAILY_CAPACITY_KEY)||"null");return p?.date===localDateKey()?p:null;}catch{return null;}}
export function saveDailyCapacity(level:CapacityLevel){if(typeof window!=="undefined"){window.localStorage.setItem(DAILY_CAPACITY_KEY,JSON.stringify({date:localDateKey(),level}));recordLoadHistory();}}
