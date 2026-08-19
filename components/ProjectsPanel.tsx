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
      `}</style>
    </div>
  );
}
