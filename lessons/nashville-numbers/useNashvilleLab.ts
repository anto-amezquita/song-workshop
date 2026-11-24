"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { usePanelHighlight } from "@/hooks/usePanelHighlight";
import { createAudioEngine, type AudioStatus } from "@/lib/music/audio/engine";
import { NO_SOUND } from "./copy";
import { createController, type PanelId } from "./controller";
import { createLabStore } from "./model";

/**
 * The lesson's state and actions, for NashvilleLab.
 *
 * The state lives in a small store around the pure reducer (model.ts), so the
 * controller always sees the latest state, even from the transport's timer
 * between renders. React reads it with useSyncExternalStore
 * (architecture.md §4, State management): this hook reads the view, the state
 * without the lights, so a playback step doesn't re-render the lesson. The
 * store is returned too, for the parts that read the lights (lights.ts).
 */
export function useNashvilleLab() {
  // Live-region messages. A new id per message makes a repeat announce again.
  const [message, setMessage] = useState({ text: "", id: 0 });
  const say = useCallback((text: string) => setMessage((m) => ({ text, id: m.id + 1 })), []);

  const { highlighted, highlight, register } = usePanelHighlight<PanelId>();

  // Created once. The engine makes no audio context until the first sound.
  const [lab] = useState(() => {
    const store = createLabStore();
    const engine = createAudioEngine();
    const controller = createController({
      getState: store.getState,
      dispatch: store.dispatch,
      engine,
      highlight,
      say,
    });
    return { store, engine, controller };
  });

  const view = useSyncExternalStore(lab.store.subscribe, lab.store.getView, lab.store.getView);

  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  useEffect(
    () =>
      lab.engine.onStatusChange((status) => {
        setAudioStatus(status);
        if (status === "unavailable") say(NO_SOUND);
      }),
    [lab, say],
  );

  useEffect(() => () => lab.controller.dispose(), [lab]);

  return {
    store: lab.store,
    view,
    controller: lab.controller,
    audioStatus,
    message,
    highlighted,
    register,
  };
}
