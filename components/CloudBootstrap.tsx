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
let dirty = false;

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

async function pushState(keepalive = false) {
  if (!hydrated || !activeUserId || !dirty) return;
  dirty = false;
  try {
    const response = await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot()),
      keepalive,
    });
    if (!response.ok) dirty = true;
  } catch {
    dirty = true;
  }
}

function scheduleSync() {
  dirty = true;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void pushState();
  }, 250);
}

export default function CloudBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const originalSetItem = Storage.prototype.setItem;

    const flushPendingState = () => {
      if (syncTimer) {
        clearTimeout(syncTimer);
        syncTimer = null;
      }
      void pushState(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushPendingState();
    };

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
        dirty = false;

        Storage.prototype.setItem = function (key: string, value: string) {
          originalSetItem.call(this, key, value);
          if (this !== window.localStorage || !CLOUD_KEYS.includes(key as (typeof CLOUD_KEYS)[number]) || !hydrated) return;
          scheduleSync();
        };

        window.addEventListener("pagehide", flushPendingState);
        document.addEventListener("visibilitychange", handleVisibilityChange);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void boot();

    return () => {
      cancelled = true;
      flushPendingState();
      window.removeEventListener("pagehide", flushPendingState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      Storage.prototype.setItem = originalSetItem;
      hydrated = false;
      activeUserId = null;
      dirty = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
