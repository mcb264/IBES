"use client";

import { useEffect } from "react";
import { hydrateFromCloud } from "@/lib/cloud-sync";

export default function CloudBootstrap() {
  useEffect(() => {
    hydrateFromCloud().then((changed) => {
      if (changed) window.location.reload();
    });
  }, []);
  return null;
}
