const CLOUD_KEYS = [
  "ibes:musique",
  "ibes:esport",
  "ibes:vie",
  "ibes:inbox",
  "ibes:custom-workspaces",
  "ibes:mode-rouge",
  "ibes:load-settings",
  "ibes:daily-capacity",
  "ibes:load-history",
  "ibes:load-insight-dismissed",
] as const;

const ACTIVE_USER_KEY = "ibes:active-user";
let timer: ReturnType<typeof setTimeout> | null = null;
let hydrating = false;
let readyToSync = false;

function snapshot() {
  const data: Record<string, string> = {};
  for (const key of CLOUD_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return data;
}

function clearCloudKeys() {
  for (const key of CLOUD_KEYS) window.localStorage.removeItem(key);
}

async function currentUserId() {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) return null;
  const session = await response.json();
  return typeof session?.userId === "string" ? session.userId : null;
}

export async function hydrateFromCloud() {
  if (typeof window === "undefined" || hydrating) return false;
  hydrating = true;
  readyToSync = false;
  try {
    const userId = await currentUserId();
    if (!userId) return false;

    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) return false;
    const cloud = await response.json();
    const remote = cloud?.data as Record<string, string> | undefined;

    // La DB est la source de vérité du compte connecté. On efface toujours
    // l'état local avant de charger ce compte, même si le navigateur pense
    // qu'il s'agit déjà du même utilisateur.
    clearCloudKeys();
    window.localStorage.setItem(ACTIVE_USER_KEY, userId);

    if (remote && Object.keys(remote).length > 0) {
      for (const key of CLOUD_KEYS) {
        if (remote[key] !== undefined) window.localStorage.setItem(key, remote[key]);
      }
    }

    readyToSync = true;
    return true;
  } catch {
    return false;
  } finally {
    hydrating = false;
  }
}

export function queueCloudSync() {
  if (typeof window === "undefined" || hydrating || !readyToSync) return;
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

export function isCloudHydrating() {
  return hydrating || !readyToSync;
}
