const CLOUD_KEYS = [
  "ibes:musique",
  "ibes:esport",
  "ibes:vie",
  "ibes:inbox",
  "ibes:mode-rouge",
  "ibes:load-settings",
  "ibes:daily-capacity",
  "ibes:load-history",
  "ibes:load-insight-dismissed",
] as const;

let timer: ReturnType<typeof setTimeout> | null = null;
let hydrating = false;

function snapshot() {
  const data: Record<string, string> = {};
  for (const key of CLOUD_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return data;
}

export async function hydrateFromCloud() {
  if (typeof window === "undefined" || hydrating) return false;
  hydrating = true;
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) return false;
    const cloud = await response.json();
    const remote = cloud?.data as Record<string, string> | undefined;
    const hasRemote = remote && Object.keys(remote).length > 0;

    if (hasRemote) {
      let changed = false;
      for (const key of CLOUD_KEYS) {
        if (remote[key] !== undefined && window.localStorage.getItem(key) !== remote[key]) {
          window.localStorage.setItem(key, remote[key]);
          changed = true;
        }
      }
      return changed;
    }

    const local = snapshot();
    if (Object.keys(local).length > 0) {
      await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local),
      });
    }
    return false;
  } catch {
    return false;
  } finally {
    hydrating = false;
  }
}

export function queueCloudSync() {
  if (typeof window === "undefined" || hydrating) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot()),
      });
    } catch {
      // localStorage reste le filet de sécurité hors-ligne.
    }
  }, 350);
}
