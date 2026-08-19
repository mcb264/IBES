import { recurringComplete, type Project, type TaskItem } from "./storage";

export function isActiveSportTask(task: TaskItem) {
  return !task.done && !task.waiting && !task.projectPaused && !recurringComplete(task);
}

export function selectActiveSportPhase(projects: Project[], tasks: TaskItem[]) {
  const ordered = [...projects]
    .filter((project) => !project.done)
    .sort((a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
    );

  return ordered.find((project) =>
    tasks.some((task) => task.projectId === project.id && isActiveSportTask(task)),
  );
}

export function selectActiveSportTasks(projects: Project[], tasks: TaskItem[]) {
  const phase = selectActiveSportPhase(projects, tasks);
  const candidates = phase
    ? tasks.filter((task) => task.projectId === phase.id)
    : tasks.filter((task) => !task.projectId);

  return { phase, tasks: candidates.filter(isActiveSportTask) };
}
