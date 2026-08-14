"use client";
import {useEffect,useState,type ReactNode} from "react";
import {migrateLegacyProjects} from "@/lib/projectMigration";
export default function ProjectMigration({children}:{children:ReactNode}){const[ready,setReady]=useState(false);useEffect(()=>{let live=true;fetch("/api/auth/session",{cache:"no-store"}).then(async r=>{if(r.ok){const s=await r.json();if(typeof s?.userId==="string")migrateLegacyProjects(s.userId)}}).finally(()=>{if(live)setReady(true)});return()=>{live=false}},[]);return ready?<>{children}</>:null}
