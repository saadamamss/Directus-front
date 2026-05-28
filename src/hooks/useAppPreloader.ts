"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/appStore";
import { fetchCollections } from "@/lib/api/collections";
import { fetchAllFields } from "@/lib/api/fields";
import { fetchRelations } from "@/lib/api/relations";

export function useAppPreloader() {
  const ran = useRef(false);
  const { setCollections, setFields, setRelations, setInitialized } = useAppStore();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    Promise.all([
      fetchCollections().then(setCollections),
      fetchAllFields().then(setFields),
      fetchRelations().then(setRelations),
    ]).finally(() => setInitialized());
  }, [setCollections, setFields, setRelations, setInitialized]);
}
