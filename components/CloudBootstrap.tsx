"use client";

import { ReactNode, useEffect, useState } from "react";
import { hydrateFromCloud, isCloudHydrating, queueCloudSync } from "@/lib/cloud-sync";

export default function CloudBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (this === window.localStorage && key.startsWith("ibes:") && !isCloudHydrating()) queueCloudSync();
    };

    hydrateFromCloud().finally(() => setReady(true));

    return () => {
      Storage.prototype.setItem = originalSetItem;
    };
  }, []);

  // Important : aucun composant métier ne doit lire localStorage avant que
  // l'état du compte connecté ait remplacé celui du compte précédent.
  if (!ready) return null;
  return <>{children}</>;
}
