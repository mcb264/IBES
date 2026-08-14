import { defaultDomainState, loadCustomWorkspaces, loadDomainState, saveCustomWorkspaces, type DomainState } from "@/lib/storage";

const MIGRATION_KEY = "ibes:generic-projects-v1";

function hasContent(state: DomainState) {
  return state.projects.length > 0 || state.briefing.tasks.length > 0 || state.dump.length > 0 || state.reviewHistory.length > 0 || state.completedThisWeek.length > 0;
}

export function migrateLegacyProjects() {
  if (typeof window === "undefined" || window.localStorage.getItem(MIGRATION_KEY) === "1") return;

  const workspaces = loadCustomWorkspaces();
  const legacy = [
    { key: "ibes:musique", name: "Musique", state: loadDomainState("musique") },
    { key: "ibes:esport", name: "Esport", state: loadDomainState("esport") },
  ];

  let next = [...workspaces];
  for (const item of legacy) {
    if (!hasContent(item.state)) continue;
    const alreadyMigrated = next.some(w => w.id === `legacy-${item.name.toLowerCase()}`);
    if (!alreadyMigrated) next.push({ id: `legacy-${item.name.toLowerCase()}`, name: item.name, state: item.state });
  }

  if (next.length !== workspaces.length) saveCustomWorkspaces(next);
  window.localStorage.removeItem("ibes:musique");
  window.localStorage.removeItem("ibes:esport");
  window.localStorage.setItem(MIGRATION_KEY, "1");
  window.dispatchEvent(new Event("ibes:workspaces-changed"));
}
