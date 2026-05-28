"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { setLastCollectionCookie, setLastSettingsCookie } from "@/lib/lastCollection";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function useLastCollectionInit() {
  const { setLastAccessedCollection, setLastSettingsRoute, setInitialized } = useAppStore();

  useEffect(() => {
    const savedCollection = readCookie("last-collection");
    const savedSettings = readCookie("last-settings");

    if (savedCollection) {
      setLastAccessedCollection(savedCollection);
    }
    if (savedSettings) {
      setLastSettingsRoute(savedSettings);
    }

    if (!savedCollection) {
      setLastCollectionCookie("");
    }
    if (!savedSettings) {
      setLastSettingsCookie("/admin/settings/data-model");
      setLastSettingsRoute("/admin/settings/data-model");
    }

    setInitialized();
  }, [setLastAccessedCollection, setLastSettingsRoute, setInitialized]);
}
