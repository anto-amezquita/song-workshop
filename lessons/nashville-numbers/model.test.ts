import { describe, expect, it, vi } from "vitest";
import { MAX_BARS, createLabStore, initialState, reducer, type Action, type State } from "./model";

const building = (progression: State["progression"] = []): State => ({
  ...initialState,
  building: true,
  preset: null,
  progression,
});

describe("the first state", () => {
  it("is C major, Pop anthem, numbers, Loop on, 100 BPM, nothing lit", () => {
    expect(initialState).toMatchObject({
      key: "C",
      tonality: "major",
      labels: "numbers",
      progression: [0, 4, 5, 3],
      preset: "pop",
      building: false,
      playing: false,
      loop: true,
      bpm: 100,
      pathStep: null,
      lights: { chord: null, notes: [], slot: null },
    });
  });
});

describe("the reducer", () => {
  it("changes nothing when the key is already chosen", () => {
    expect(reducer(initialState, { type: "key", key: "C" })).toBe(initialState);
    expect(reducer(initialState, { type: "key", key: "G" }).key).toBe("G");
  });

  it("loads the new tonality's first preset and rebuilds the slots", () => {
    const next = reducer(initialState, { type: "tonality", tonality: "minor" });
    expect(next).toMatchObject({
      tonality: "minor",
      preset: "minorpop",
      progression: [0, 5, 2, 6],
    });
    expect(next.slotsGeneration).toBe(initialState.slotsGeneration + 1);
  });

  it("keeps your own progression when switching tonality while building", () => {
    const next = reducer(building([0, 3]), { type: "tonality", tonality: "minor" });
    expect(next).toMatchObject({ tonality: "minor", preset: null, progression: [0, 3] });
    expect(next.slotsGeneration).toBe(1);
  });

  it("only loads presets of the current tonality", () => {
    expect(reducer(initialState, { type: "preset", id: "cinema" })).toBe(initialState);
    expect(reducer(building(), { type: "preset", id: "jazz" })).toMatchObject({
      preset: "jazz",
      building: false,
      progression: [1, 4, 0, 0],
    });
  });

  it("empties the slots to build your own", () => {
    expect(reducer(initialState, { type: "build" })).toMatchObject({
      building: true,
      preset: null,
      progression: [],
    });
  });

  it("adds chords only while building, up to eight", () => {
    expect(reducer(initialState, { type: "add", degree: 2 })).toBe(initialState);
    let state = building();
    for (let i = 0; i < 10; i++) state = reducer(state, { type: "add", degree: 4 });
    expect(state.progression).toHaveLength(MAX_BARS);
  });

  it("removes one bar, and ignores a bar that isn't there", () => {
    const state = building([0, 4, 5]);
    expect(reducer(state, { type: "remove", index: 1 }).progression).toEqual([0, 5]);
    expect(reducer(state, { type: "remove", index: 3 })).toBe(state);
  });

  it("merges lights", () => {
    const lit = reducer(initialState, { type: "lights", lights: { chord: 4, notes: [4, 6, 1] } });
    expect(reducer(lit, { type: "lights", lights: { slot: 2 } }).lights).toEqual({
      chord: 4,
      notes: [4, 6, 1],
      slot: 2,
    });
  });

  it("unlights the playing slot whenever the slots are rebuilt, and keeps the chord and notes lit", () => {
    const playing = (state: State): State =>
      reducer(state, { type: "lights", lights: { chord: 4, notes: [4, 6, 1], slot: 1 } });
    const rebuilds: [State, Action][] = [
      [initialState, { type: "tonality", tonality: "minor" }],
      [initialState, { type: "preset", id: "rock" }],
      [initialState, { type: "build" }],
      [building([0, 4]), { type: "add", degree: 5 }],
      [building([0, 4, 5]), { type: "remove", index: 0 }],
    ];
    for (const [state, action] of rebuilds) {
      expect(reducer(playing(state), action).lights, action.type).toEqual({
        chord: 4,
        notes: [4, 6, 1],
        slot: null,
      });
    }
  });

  it("keeps the playing slot lit when nothing is rebuilt", () => {
    const lit = reducer(initialState, { type: "lights", lights: { slot: 1 } });
    expect(reducer(lit, { type: "key", key: "G" }).lights.slot).toBe(1);
    expect(reducer(lit, { type: "labels", labels: "names" }).lights.slot).toBe(1);
  });

  it("keeps the tempo between 60 and 150", () => {
    expect(reducer(initialState, { type: "bpm", bpm: 200 }).bpm).toBe(150);
    expect(reducer(initialState, { type: "bpm", bpm: 10 }).bpm).toBe(60);
    expect(reducer(initialState, { type: "bpm", bpm: 87.4 }).bpm).toBe(87);
  });
});

describe("the store", () => {
  it("tells subscribers about changes, and only about changes", () => {
    const store = createLabStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.dispatch({ type: "key", key: "C" });
    expect(listener).not.toHaveBeenCalled();
    store.dispatch({ type: "key", key: "D" });
    expect(listener).toHaveBeenCalledOnce();
    expect(store.getState().key).toBe("D");
    unsubscribe();
    store.dispatch({ type: "key", key: "E" });
    expect(listener).toHaveBeenCalledOnce();
  });

  it("keeps the same view through a lights change, and makes a new one for anything else", () => {
    const store = createLabStore();
    const first = store.getView();
    expect(first).not.toHaveProperty("lights");
    store.dispatch({ type: "lights", lights: { chord: 2, notes: [2, 4, 6], slot: 0 } });
    expect(store.getView()).toBe(first);
    store.dispatch({ type: "loop", loop: false });
    expect(store.getView()).not.toBe(first);
    expect(store.getView()).toMatchObject({ loop: false, key: "C" });
  });
});
