"use client";

import { useEffect } from "react";
import { hydrateFromCloud, queueCloudSync } from "@/lib/cloud-sync";

export default function CloudBootstrap() {
  useEffect(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (this === window.localStorage && key.startsWith("ibes:")) queueCloudSync();
    };

    hydrateFromCloud().then((changed) => {
      if (changed) window.location.reload();
    });

    return () => {
      Storage.prototype.setItem = originalSetItem;
    };
  }, []);
  return null;
}
