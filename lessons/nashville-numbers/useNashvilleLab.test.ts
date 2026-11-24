// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useNashvilleLab } from "./useNashvilleLab";

afterEach(cleanup);

describe("useNashvilleLab", () => {
  it("doesn't re-render the lesson for a playback step, only for anything else (architecture.md §12)", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useNashvilleLab();
    });
    const before = renders;

    act(() =>
      result.current.store.dispatch({
        type: "lights",
        lights: { chord: 4, notes: [4, 6, 1], slot: 1 },
      }),
    );
    expect(renders).toBe(before);
    expect(result.current.view).not.toHaveProperty("lights");

    act(() => result.current.store.dispatch({ type: "loop", loop: false }));
    expect(renders).toBe(before + 1);
    expect(result.current.view.loop).toBe(false);
  });

  it("hands out the same ref callback for a panel on every render", () => {
    const { result, rerender } = renderHook(() => useNashvilleLab());
    const first = result.current.register("chords");
    rerender();
    expect(result.current.register("chords")).toBe(first);
    expect(result.current.register("key")).not.toBe(first);
  });
});
