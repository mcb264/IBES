import assert from "node:assert/strict";
import { buildDailyProposal, buildDownProposal, PlannerSource } from "../lib/planner";
import { DEFAULT_LOAD_SETTINGS, TaskItem } from "../lib/storage";

const today = "2026-08-16";
const source = (key: string, task: Partial<TaskItem> = {}, order = 0): PlannerSource => ({
  key,
  order,
  task: { id: key, text: key, done: false, effort: "normal", ...task },
});

const backlog = Array.from({ length: 12 }, (_, index) => source(`project-${index}`, {}, index));
const life = source("life", { dueDate: today, effort: "light" }, 99);
const all = [...backlog, life];

const down = buildDownProposal(all, DEFAULT_LOAD_SETTINGS, today);
assert.ok(down.length >= 1 && down.length <= 2, "DOWN keeps a genuinely minimal plan");
assert.ok(down.some(item => item.key === "life"), "urgent Vie work participates in the DOWN plan");

const heavyUrgent = source("heavy-urgent", { dueDate: today, effort: "heavy" });
assert.deepEqual(
  buildDownProposal([heavyUrgent], DEFAULT_LOAD_SETTINGS, today).map(item => item.key),
  ["heavy-urgent"],
  "DOWN never turns an urgent heavy day into an empty plan",
);

const low = buildDailyProposal(backlog, "low", DEFAULT_LOAD_SETTINGS, today);
const normal = buildDailyProposal(backlog, "normal", DEFAULT_LOAD_SETTINGS, today);
const high = buildDailyProposal(backlog, "high", DEFAULT_LOAD_SETTINGS, today);
assert.ok(low.length < normal.length && normal.length < high.length, "capacity changes remain progressive");

console.log("planner tests passed");
