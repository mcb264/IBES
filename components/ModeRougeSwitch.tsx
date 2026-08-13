"use client";

export default function ModeRougeSwitch({active,onToggle}:{active:boolean;onToggle:()=>void}) {
  return <button onClick={onToggle} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-[11px] uppercase tracking-widest transition-colors ${active?"border-alert text-alert bg-alert/10":"border-white/15 text-muted hover:text-ink"}`}><span className={`w-2 h-2 rounded-full ${active?"bg-alert animate-pulse":"bg-muted"}`}/>↓ Down</button>;
}
