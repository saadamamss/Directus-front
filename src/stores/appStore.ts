import { create } from "zustand";
import type { CollectionResponse } from "@/types/api";
import type { FieldResponse } from "@/lib/api/fields";
import type { RelationResponse } from "@/lib/api/relations";
import { fetchAllFields } from "@/lib/api/fields";
import { fetchRelations } from "@/lib/api/relations";

interface AppState {
  lastAccessedCollection: string | null;
  lastSettingsRoute: string | null;
  initialized: boolean;
  collections: CollectionResponse[];
  fields: FieldResponse[];
  relations: RelationResponse[];
  setLastAccessedCollection: (id: string) => void;
  setLastSettingsRoute: (route: string) => void;
  setInitialized: () => void;
  setCollections: (collections: CollectionResponse[]) => void;
  setFields: (fields: FieldResponse[]) => void;
  setRelations: (relations: RelationResponse[]) => void;
  refreshFields: () => void;
  refreshRelations: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  lastAccessedCollection: null,
  lastSettingsRoute: null,
  initialized: false,
  collections: [],
  fields: [],
  relations: [],
  setLastAccessedCollection: (id) => set({ lastAccessedCollection: id }),
  setLastSettingsRoute: (route) => set({ lastSettingsRoute: route }),
  setInitialized: () => set({ initialized: true }),
  setCollections: (collections) => set({ collections }),
  setFields: (fields) => set({ fields }),
  setRelations: (relations) => set({ relations }),
  refreshFields: () => {
    fetchAllFields().then((fields) => set({ fields }));
  },
  refreshRelations: () => {
    fetchRelations().then((relations) => set({ relations }));
  },
}));
