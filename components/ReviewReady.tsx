"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

const WEEK_KEY="ibes:review-week-seen";
const MONTH_KEY="ibes:review-month-seen";
function localKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function weekKey(d=new Date()){const x=new Date(d);const day=x.getDay()||7;x.setDate(x.getDate()-day+1);return localKey(x)}
function monthKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
function lastDay(d=new Date()){return new Date(d.getFullYear(),d.getMonth()+1,0).getDate()}

export default function ReviewReady(){
 const[weekly,setWeekly]=useState(false),[monthly,setMonthly]=useState(false);
 useEffect(()=>{const now=new Date(),after18=now.getHours()>=18;const weekReady=now.getDay()===0&&after18;const monthReady=now.getDate()===lastDay(now)&&after18;setWeekly(weekReady&&localStorage.getItem(WEEK_KEY)!==weekKey(now));setMonthly(monthReady&&localStorage.getItem(MONTH_KEY)!==monthKey(now));},[]);
 if(!weekly&&!monthly)return null;
 const openWeek=()=>{localStorage.setItem(WEEK_KEY,weekKey());setWeekly(false)};
 const openMonth=()=>{localStorage.setItem(MONTH_KEY,monthKey());setMonthly(false)};
 return <div className="space-y-3">
  {weekly&&<Link href="/historique?bilan=semaine" onClick={openWeek} className="block rounded-xl border border-teal/30 bg-teal/5 p-5 hover:border-teal/60 transition-colors"><div className="flex items-center justify-between gap-4"><div><p className="font-display text-xl text-teal">Ton bilan de semaine est prêt.</p><p className="text-sm text-muted mt-1">IBES a rassemblé ta semaine. Ouvre-la pour prendre du recul.</p></div><span className="text-teal">→</span></div></Link>}
  {monthly&&<Link href="/historique?bilan=mois" onClick={openMonth} className="block rounded-xl border border-amber/30 bg-amber/5 p-5 hover:border-amber/60 transition-colors"><div className="flex items-center justify-between gap-4"><div><p className="font-display text-xl text-amber">Ton mois est prêt.</p><p className="text-sm text-muted mt-1">Voir ce que tu as construit ce mois-ci.</p></div><span className="text-amber">→</span></div></Link>}
 </div>;
}
