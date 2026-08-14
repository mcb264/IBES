"use client";
import {useEffect,useState,type ReactNode} from "react";
import {migrateLegacyProjects} from "@/lib/projectMigration";
export default function ProjectMigration({children}:{children:ReactNode}){const[ready,setReady]=useState(false);useEffect(()=>{migrateLegacyProjects();setReady(true)},[]);return ready?<>{children}</>:null}
