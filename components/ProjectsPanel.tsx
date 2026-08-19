"use client";

import ProjectsPanelV2 from "./ProjectsPanelV2";
import { localDateKey, type Project, type TaskItem } from "@/lib/storage";

export type WorkspaceMode = "standard" | "sport";
type ModeProject = Project & { mode?: WorkspaceMode; waiting?: boolean; waitingSince?: string };
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
  const lockedProjects = projects.map(project => ({ ...project, mode: workspaceMode }) as ModeProject);
  const handleChange = (next: Project[]) => onChange(next.map(project => ({ ...project, mode: workspaceMode }) as ModeProject));

  const toggleProjectWaiting = (projectId: string) => {
    const project = lockedProjects.find(item => item.id === projectId);
    if (!project) return;
    const pause = !project.waiting;

    onChange(
      lockedProjects.map(item =>
        item.id === projectId
          ? ({
              ...item,
              waiting: pause || undefined,
              waitingSince: pause ? localDateKey() : undefined,
              mode: workspaceMode,
            } as ModeProject)
          : item,
      ),
    );

    if (onTasksChange) {
      onTasksChange(
        tasks.map(task => {
          if (task.projectId !== projectId) return task;
          const marked = task as ProjectTask;
          if (pause) {
            return {
              ...task,
              waiting: true,
              waitingSince: task.waitingSince ?? localDateKey(),
              todayDate: undefined,
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
          } as ProjectTask;
        }),
      );
    }
  };

  return (
    <div className={`workspace-mode-locked workspace-mode-${workspaceMode}`}>
      {lockedProjects.length > 0 && (
        <div className="mb-5 rounded-xl border border-white/10 bg-panel px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[9px] font-mono uppercase tracking-[.18em] text-muted">Sous-projets</p>
            <p className="text-[9px] text-muted">Pause = aucune action proposée par IBES</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lockedProjects.filter(project => !project.done).map(project => (
              <button
                key={project.id}
                type="button"
                onClick={() => toggleProjectWaiting(project.id)}
                className="rounded-full border px-3 py-1.5 text-[10px] font-mono transition"
                style={{
                  borderColor: project.waiting ? accentColor : "rgba(255,255,255,.12)",
                  color: project.waiting ? accentColor : undefined,
                  opacity: project.waiting ? 1 : .72,
                }}
                title={project.waiting ? "Reprendre ce sous-projet" : "Mettre ce sous-projet en attente"}
              >
                {project.waiting ? "▶ Reprendre" : "Ⅱ Pause"} · {project.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
