import { CapacityLevel, LoadSettings, Project, TaskItem, capacityValue, taskPoints } from "./storage";

export type PlannerSource = {
  key: string;
  task: TaskItem;
  project?: Project;
  order: number;
};

export function daysUntil(date: string | undefined, today: string) {
  if (!date) return null;
  return Math.ceil((new Date(date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
}

function dateUrgency(date: string | undefined, today: string) {
  const days = daysUntil(date, today);
  if (days === null) return 0;
  if (days <= 0) return 60;
  return Math.max(0, 30 - days);
}

export function urgencyScore(item: PlannerSource, today: string) {
  const actionUrgency = dateUrgency(item.task.dueDate, today);
  const projectUrgency = dateUrgency(item.project?.dueDate, today);
  return actionUrgency * 2 + projectUrgency;
}

export function rankPlannerSources(items: PlannerSource[], today: string) {
  return [...items].sort((a, b) => {
    const aScore = urgencyScore(a, today) * 10 - a.order;
    const bScore = urgencyScore(b, today) * 10 - b.order;
    return bScore - aScore;
  });
}

export function buildDailyProposal(items: PlannerSource[], level: CapacityLevel, settings: LoadSettings, today: string) {
  const cap = capacityValue(level, settings);
  let used = 0;
  return rankPlannerSources(items, today).filter(item => {
    const points = taskPoints(item.task, settings);
    if (used + points > cap && used > 0) return false;
    used += points;
    return true;
  });
}

/**
 * DOWN is deliberately stricter than the regular low-capacity plan. It keeps
 * at most two ranked actions and roughly one normal action worth of load.
 * The first action is always kept so an unusually heavy urgent action does
 * not result in an empty day.
 */
export function buildDownProposal(items: PlannerSource[], settings: LoadSettings, today: string) {
  const cap = Math.min(
    capacityValue("low", settings),
    Math.max(settings.normalActionPoints, settings.lightActionPoints * 2),
  );
  let used = 0;
  return rankPlannerSources(items, today).filter(item => {
    if (used > 0 && used + taskPoints(item.task, settings) > cap) return false;
    if (used > 0 && used >= cap) return false;
    used += taskPoints(item.task, settings);
    return true;
  }).slice(0, 2);
}
