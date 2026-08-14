import { loadCustomWorkspaces, loadDomainState, saveCustomWorkspaces, type DomainState } from "@/lib/storage";

function hasContent(state: DomainState) {
  return state.projects.length > 0 || state.briefing.tasks.length > 0 || state.dump.length > 0 || state.reviewHistory.length > 0 || state.completedThisWeek.length > 0;
}

export function migrateLegacyProjects(userId?:string) {
  if (typeof window === "undefined" || !userId) return;
  const migrationKey=`ibes:generic-projects-v1:${userId.toLowerCase()}`;
  if(window.localStorage.getItem(migrationKey)==="1")return;

  const workspaces = loadCustomWorkspaces();
  const legacy = [
    { name: "Musique", state: loadDomainState("musique") },
    { name: "Esport", state: loadDomainState("esport") },
  ];

  const next = [...workspaces];
  for (const item of legacy) {
    if (!hasContent(item.state)) continue;
    const id = `legacy-${item.name.toLowerCase()}`;
    if (!next.some(w => w.id === id)) next.push({ id, name: item.name, state: item.state });
  }

  if (next.length !== workspaces.length) saveCustomWorkspaces(next);
  window.localStorage.removeItem("ibes:musique");
  window.localStorage.removeItem("ibes:esport");
  window.localStorage.setItem(migrationKey,"1");
  window.dispatchEvent(new Event("ibes:workspaces-changed"));
}
