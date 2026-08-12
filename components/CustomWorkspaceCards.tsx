"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadCustomWorkspaces, type CustomWorkspace } from "@/lib/storage";

export default function CustomWorkspaceCards() {
  const pathname = usePathname();
  const [items, setItems] = useState<CustomWorkspace[]>([]);

  useEffect(() => {
    if (pathname !== "/") return;
    const refresh = () => setItems(loadCustomWorkspaces());
    refresh();
    window.addEventListener("ibes:workspaces-changed", refresh);
    return () => window.removeEventListener("ibes:workspaces-changed", refresh);
  }, [pathname]);

  if (pathname !== "/" || items.length === 0) return null;

  return (
    <section className="px-6 pb-9 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-5">
        {items.map((workspace) => {
          const active = workspace.state.briefing.tasks.filter((task) => !task.done && !task.waiting);
          const waiting = workspace.state.briefing.tasks.filter((task) => task.waiting).length;
          const nextAction = active[0];
          const nextDeadline = workspace.state.projects
            .filter((project) => !project.done && project.dueDate)
            .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))[0];

          return (
            <Link
              key={workspace.id}
              href={`/projet/${workspace.id}`}
              className="group min-h-[260px] rounded-2xl border border-white/10 bg-panel p-6 flex flex-col hover:border-white/25 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-3xl text-teal">{workspace.name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1">
                    {active.length} priorité{active.length !== 1 ? "s" : ""} active{active.length !== 1 ? "s" : ""}{waiting > 0 ? ` · ${waiting} en attente` : ""}
                  </div>
                </div>
                <span className="text-muted group-hover:text-ink transition-colors">→</span>
              </div>

              <div className="mt-8 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Prochaine action</p>
                {nextAction ? <p className="text-xl leading-snug">{nextAction.text}</p> : <p className="text-lg text-muted">Rien d'actif pour l'instant.</p>}
              </div>

              <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-muted">{nextDeadline ? "Prochaine échéance" : "Aucune échéance proche"}</span>
                {nextDeadline && <span className="font-mono text-amber">{new Date(nextDeadline.dueDate! + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
