"use client";

import ProjectsPanelV2 from "./ProjectsPanelV2";
import ProjectUiTheme from "./projects/ProjectUiTheme";
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

/**
 * Workspace boundary for project pages.
 *
 * This component only propagates the grand-project mode and wires data.
 * Project/task interactions live in ProjectsPanelV2; presentation overrides
 * are isolated in ProjectUiTheme so this wrapper stays predictable.
 */
export default function ProjectsPanel({
  projects,
  tasks,
  accentColor,
  workspaceMode = "standard",
  onChange,
  onTasksChange,
}: Props) {
  const lockMode = (project: Project): ModeProject => ({ ...project, mode: workspaceMode });
  const lockedProjects = projects.map(lockMode);

  return (
    <div className={`workspace-mode-locked workspace-mode-${workspaceMode}`}>
      <ProjectsPanelV2
        accentColor={accentColor}
        projects={lockedProjects}
        tasks={tasks}
        onChange={(next) => onChange(next.map(lockMode))}
        onTasksChange={onTasksChange}
      />
      <ProjectUiTheme />
    </div>
  );
}
