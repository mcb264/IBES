"use client";

import { ReactNode, useEffect, useState } from "react";

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

let activeUserId: string | null = null;
let hydrated = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

function snapshot() {
  const data: Record<string, string> = {};
  for (const key of CLOUD_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return data;
}

function clearAccountState() {
  for (const key of CLOUD_KEYS) window.localStorage.removeItem(key);
}

async function pushState() {
  if (!hydrated || !activeUserId) return;
  await fetch("/api/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot()),
  });
}

export default function CloudBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const originalSetItem = Storage.prototype.setItem;

    async function boot() {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        if (!sessionResponse.ok) return;
        const session = await sessionResponse.json();
        if (typeof session?.userId !== "string") return;
        activeUserId = session.userId;

        const stateResponse = await fetch("/api/state", { cache: "no-store" });
        if (!stateResponse.ok) return;
        const state = await stateResponse.json();
        const remote = state?.data && typeof state.data === "object" ? state.data as Record<string, string> : {};

        // Toujours repartir de l'état Neon du compte connecté.
        clearAccountState();
        for (const key of CLOUD_KEYS) {
          if (typeof remote[key] === "string") originalSetItem.call(window.localStorage, key, remote[key]);
        }

        hydrated = true;

        Storage.prototype.setItem = function (key: string, value: string) {
          originalSetItem.call(this, key, value);
          if (this !== window.localStorage || !CLOUD_KEYS.includes(key as (typeof CLOUD_KEYS)[number]) || !hydrated) return;
          if (syncTimer) clearTimeout(syncTimer);
          syncTimer = setTimeout(() => { void pushState(); }, 400);
        };
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void boot();

    return () => {
      cancelled = true;
      hydrated = false;
      activeUserId = null;
      if (syncTimer) clearTimeout(syncTimer);
      Storage.prototype.setItem = originalSetItem;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
