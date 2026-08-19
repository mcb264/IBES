import assert from "node:assert/strict";
import { buildDailyProposal, buildDownProposal, PlannerSource } from "../lib/planner";
import { selectActiveSportTasks } from "../lib/sportHome";
import { DEFAULT_LOAD_SETTINGS, TaskItem, loadCustomWorkspaces, localDateKey, withWorkspaceMode } from "../lib/storage";

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

const values = new Map<string, string>();
const localStorage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value); },
  removeItem: (key: string) => { values.delete(key); },
};
Object.defineProperty(globalThis, "window", { value: { localStorage }, configurable: true });

values.set("ibes:purge-done-v2:custom", "1");
values.set("ibes:custom-workspaces", JSON.stringify([
  { id: "valid", name: "Projet", state: { briefing: { date: "2020-01-01", tasks: [{ id: "done", text: "Terminé", done: true }] } } },
  { id: 42, name: "Invalide", state: {} },
]));
const normalized = loadCustomWorkspaces();
assert.equal(normalized.length, 1, "invalid workspace records are ignored");
assert.deepEqual(normalized[0].state.projects, [], "missing project collections are repaired");
assert.deepEqual(normalized[0].state.dump, [], "missing inbox collections are repaired");
assert.equal(normalized[0].state.briefing.date, localDateKey(), "custom workspaces roll over to the current day");
assert.equal(normalized[0].state.briefing.tasks[0].todayDate, undefined, "daily task selection is cleared during rollover");
assert.equal(normalized[0].state.completedThisWeek.length, 0, "stale completions do not leak into the current week");

const sportSelection = selectActiveSportTasks(
  [
    { id: "empty", name: "Phase vide", goal: "", done: false, order: 0 },
    { id: "active", name: "Phase active", goal: "", done: false, order: 1 },
  ],
  [{ id: "session", text: "Fractionné", done: false, projectId: "active" }],
);
assert.equal(sportSelection.phase?.id, "active", "sport home skips empty phases and selects the phase with active work");
assert.deepEqual(sportSelection.tasks.map((task) => task.id), ["session"], "sport home exposes active sessions from the selected phase");

const mixedSportSelection = selectActiveSportTasks(
  [{ id: "phase", name: "Phase", goal: "", done: false }],
  [
    { id: "linked", text: "Séance liée", done: false, projectId: "phase" },
    { id: "unassigned", text: "Séance libre", done: false },
  ],
);
assert.deepEqual(mixedSportSelection.tasks.map((task) => task.id), ["linked", "unassigned"], "sport home keeps active unassigned sessions visible");

const converted = withWorkspaceMode({...normalized[0],state:{...normalized[0].state,projects:[{id:"phase",name:"Préparation",goal:"",done:false}]}}, "sport");
assert.equal(converted.mode, "sport", "an existing workspace can be converted to Sport");
assert.ok(converted.state.projects.every((project) => project.mode === "sport"), "Sport conversion keeps subproject modes coherent");

values.set("ibes:custom-workspaces", JSON.stringify([
  { id: "legacy-run", name: "Semi Marathon", state: { briefing: { date: localDateKey(), tasks: [] }, projects: [{ id: "training", name: "Préparation", goal: "", done: false }] } },
  { id: "legacy-esport", name: "Esport", state: { briefing: { date: localDateKey(), tasks: [] }, projects: [] } },
]));
const migratedModes = loadCustomWorkspaces();
assert.equal(migratedModes.find((workspace) => workspace.id === "legacy-run")?.mode, "sport", "legacy physical-sport workspaces migrate automatically");
assert.equal(migratedModes.find((workspace) => workspace.id === "legacy-esport")?.mode, undefined, "Esport is not misclassified as physical Sport");

console.log("planner tests passed");
