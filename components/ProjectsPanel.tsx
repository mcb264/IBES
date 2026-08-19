"use client";

import ProjectsPanelV2 from "./ProjectsPanelV2";
import type { Project, TaskItem } from "@/lib/storage";

export type WorkspaceMode = "standard" | "sport";
type ModeProject = Project & { mode?: WorkspaceMode };

type Props = {
  projects: Project[];
  tasks: TaskItem[];
  accentColor: string;
  workspaceMode?: WorkspaceMode;
  onChange: (projects: Project[]) => void;
  onTasksChange?: (tasks: TaskItem[]) => void;
};

export default function ProjectsPanel({
  projects,
  tasks,
  accentColor,
  workspaceMode = "standard",
  onChange,
  onTasksChange,
}: Props) {
  const lockedProjects = projects.map(project => ({ ...project, mode: workspaceMode }) as ModeProject);
  const handleChange = (next: Project[]) =>
    onChange(next.map(project => ({ ...project, mode: workspaceMode }) as ModeProject));

  return (
    <div className={`workspace-mode-locked workspace-mode-${workspaceMode}`}>
      <ProjectsPanelV2
        accentColor={accentColor}
        projects={lockedProjects}
        tasks={tasks}
        onChange={handleChange}
        onTasksChange={onTasksChange}
      />
      <style jsx global>{`
        .workspace-mode-locked > .space-y-8 > .rounded-2xl > .grid + .grid {
          display: none;
        }
        .workspace-mode-locked > .space-y-8 > .rounded-2xl > div:first-child > p.mt-1 {
          display: none;
        }
        .workspace-mode-standard [class*="Mode Sport"] {
          display: none;
        }

        /* Le menu d'action reste compact : les 7 fréquences occupent une petite grille
           au lieu de sept lignes qui recouvrent les sous-projets suivants. */
        .workspace-mode-locked .absolute.right-0.top-7.z-30.w-56 {
          max-height: min(70vh, 420px);
          overflow-y: auto;
        }
        .workspace-mode-locked .absolute.right-0.top-7.z-30.w-56 > button:nth-child(n + 8):nth-child(-n + 14) {
          display: inline-flex;
          width: calc(25% - 4px);
          min-height: 30px;
          margin: 2px;
          padding: 5px 2px;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          font-size: 10px;
        }
        .workspace-mode-locked .absolute.right-0.top-7.z-30.w-56 > button:nth-child(15) {
          display: block;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
