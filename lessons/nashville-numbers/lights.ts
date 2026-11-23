"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { LabStore, Lights } from "./model";

/** The lesson's store, for the parts that light up during playback. NashvilleLab provides it. */
export const LabStoreContext = createContext<LabStore | null>(null);

/**
 * Whether one thing is lit, read straight from the store. A component that
 * uses it re-renders only when its own answer changes, so a playback step
 * re-renders the lit card, notes and slot, not the lesson (architecture.md §12).
 */
export function useLit(isLit: (lights: Lights) => boolean): boolean {
  const store = useContext(LabStoreContext);
  if (!store) throw new Error("useLit needs a LabStoreContext around it");
  const snapshot = () => isLit(store.getState().lights);
  return useSyncExternalStore(store.subscribe, snapshot, snapshot);
}
