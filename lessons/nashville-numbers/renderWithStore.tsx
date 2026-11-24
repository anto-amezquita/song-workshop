// For component tests: renders inside a lesson store, as NashvilleLab does,
// so the cards, notes and slots can read their lights (lights.ts).

import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { LabStoreContext } from "./lights";
import { createLabStore, type Lights } from "./model";

export function renderWithStore(ui: ReactNode, lights: Partial<Lights> = {}) {
  const store = createLabStore();
  store.dispatch({ type: "lights", lights });
  const result = render(<LabStoreContext value={store}>{ui}</LabStoreContext>);
  return { store, ...result };
}
