"use client";

import { useEffect } from "react";
import { hydrateFromCloud, isCloudHydrating, queueCloudSync } from "@/lib/cloud-sync";

const RELOAD_GUARD = "ibes:cloud-bootstrap-reloaded";

export default function CloudBootstrap() {
  useEffect(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (this === window.localStorage && key.startsWith("ibes:") && !isCloudHydrating()) queueCloudSync();
    };

    hydrateFromCloud().then((changed) => {
      if (!changed) {
        window.sessionStorage.removeItem(RELOAD_GUARD);
        return;
      }

      if (window.sessionStorage.getItem(RELOAD_GUARD) === "1") return;
      window.sessionStorage.setItem(RELOAD_GUARD, "1");
      window.location.reload();
    });

    return () => {
      Storage.prototype.setItem = originalSetItem;
    };
  }, []);
  return null;
}
