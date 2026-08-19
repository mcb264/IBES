"use client";

import { useEffect, useRef } from "react";
import ProjectsPanelV2 from "./ProjectsPanelV2";
import { localDateKey, type Project, type TaskItem } from "@/lib/storage";

export type WorkspaceMode = "standard" | "sport";
type ModeProject = Project & { mode?: WorkspaceMode };
type ProjectTask = TaskItem & { projectPaused?: boolean; projectPausedWasWaiting?: boolean };

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
  const rootRef = useRef<HTMLDivElement>(null);
  const lockedProjects = projects.map(project => ({ ...project, mode: workspaceMode }) as ModeProject);
  const handleChange = (next: Project[]) =>
    onChange(next.map(project => ({ ...project, mode: workspaceMode }) as ModeProject));

  const isProjectPaused = (projectId: string) =>
    tasks.some(task => task.projectId === projectId && (task as ProjectTask).projectPaused);

  const toggleProjectPause = (projectId: string) => {
    if (!onTasksChange) return;
    const pause = !isProjectPaused(projectId);
    const today = localDateKey();

    onTasksChange(
      tasks.map(task => {
        if (task.projectId !== projectId) return task;
        const marked = task as ProjectTask;
        if (pause) {
          return {
            ...task,
            waiting: true,
            waitingSince: task.waitingSince ?? today,
            todayDate: undefined,
            capacityOverrideDate: undefined,
            projectPaused: true,
            projectPausedWasWaiting: !!task.waiting,
          } as ProjectTask;
        }
        if (!marked.projectPaused) return task;
        return {
          ...task,
          waiting: marked.projectPausedWasWaiting || false,
          waitingSince: marked.projectPausedWasWaiting ? task.waitingSince : undefined,
          projectPaused: undefined,
          projectPausedWasWaiting: undefined,
          todayDate: undefined,
          capacityOverrideDate: undefined,
        } as ProjectTask;
      }),
    );
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !onTasksChange) return;

    const installPauseItems = () => {
      const articles = Array.from(root.querySelectorAll("article"));
      articles.forEach((article, index) => {
        const project = lockedProjects[index];
        if (!project) return;
        const menus = Array.from(article.querySelectorAll("div.absolute"));
        const projectMenu = menus.find(menu => menu.textContent?.includes("Supprimer le projet"));
        if (!projectMenu) return;

        const old = projectMenu.querySelector<HTMLButtonElement>("[data-project-pause]");
        if (old) old.remove();

        const button = document.createElement("button");
        button.type = "button";
        button.dataset.projectPause = project.id;
        button.className = "w-full px-3 py-2 text-left text-xs text-muted";
        button.textContent = isProjectPaused(project.id) ? "Reprendre le sous-projet" : "Mettre en attente";
        button.onclick = event => {
          event.preventDefault();
          event.stopPropagation();
          toggleProjectPause(project.id);
        };

        const deleteButton = Array.from(projectMenu.querySelectorAll("button")).find(el =>
          el.textContent?.includes("Supprimer le projet"),
        );
        if (deleteButton) projectMenu.insertBefore(button, deleteButton);
        else projectMenu.appendChild(button);
      });
    };

    installPauseItems();
    const observer = new MutationObserver(installPauseItems);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [lockedProjects, tasks, onTasksChange]);

  return (
    <div ref={rootRef} className={`workspace-mode-locked workspace-mode-${workspaceMode}`}>
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
