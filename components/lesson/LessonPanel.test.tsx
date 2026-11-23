// @vitest-environment jsdom
import { act, cleanup, render as rtlRender, screen } from "@testing-library/react";
import { createRef, useImperativeHandle, type Ref } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HIGHLIGHT_MS, usePanelHighlight } from "@/hooks/usePanelHighlight";
import { LessonPanel } from "./LessonPanel";

type Id = "key" | "chords";
type Api = ReturnType<typeof usePanelHighlight<Id>>;

function Panels({ ref }: { ref: Ref<Api> }) {
  const api = usePanelHighlight<Id>();
  useImperativeHandle(ref, () => api, [api]);
  return (
    <>
      <LessonPanel label="Key" ref={api.register("key")} highlighted={api.highlighted === "key"}>
        key
      </LessonPanel>
      <LessonPanel
        label="Chords"
        ref={api.register("chords")}
        highlighted={api.highlighted === "chords"}
      >
        chords
      </LessonPanel>
    </>
  );
}

const panelsRef = createRef<Api>();
const api = () => panelsRef.current!;
const renderPanels = () => rtlRender(<Panels ref={panelsRef} />);

function placeChordsPanel(top: number, bottom: number) {
  const panel = screen.getByRole("region", { name: "Chords" });
  panel.getBoundingClientRect = () => ({ top, bottom }) as DOMRect;
  panel.scrollIntoView = vi.fn();
  return panel;
}

function reducedMotion(on: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: on }) as unknown as typeof matchMedia;
}

const isHighlighted = (name: string) =>
  screen.getByRole("region", { name }).hasAttribute("data-highlighted");

beforeEach(() => {
  vi.useFakeTimers();
  window.innerHeight = 800;
  reducedMotion(false);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("LessonPanel", () => {
  it("is a named region", () => {
    renderPanels();
    expect(screen.getByRole("region", { name: "Key" }).tagName).toBe("SECTION");
    expect(isHighlighted("Key")).toBe(false);
  });

  it("can be the lesson path's aside", () => {
    rtlRender(
      <LessonPanel as="aside" label="Lesson path">
        steps
      </LessonPanel>,
    );
    expect(screen.getByRole("complementary", { name: "Lesson path" })).toBeTruthy();
  });
});

describe("usePanelHighlight", () => {
  it("highlights one panel for 2.6 seconds", () => {
    renderPanels();
    placeChordsPanel(100, 400);
    act(() => api().highlight("chords"));
    expect(isHighlighted("Chords")).toBe(true);
    act(() => vi.advanceTimersByTime(HIGHLIGHT_MS - 1));
    expect(isHighlighted("Chords")).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(isHighlighted("Chords")).toBe(false);
  });

  it("moves the highlight, and restarts its time, when another panel is highlighted", () => {
    renderPanels();
    placeChordsPanel(100, 400);
    act(() => api().highlight("chords"));
    act(() => vi.advanceTimersByTime(2000));
    act(() => api().highlight("key"));
    expect(isHighlighted("Chords")).toBe(false);
    expect(isHighlighted("Key")).toBe(true);
    act(() => vi.advanceTimersByTime(2000));
    expect(isHighlighted("Key")).toBe(true);
  });

  it("doesn't scroll a panel that's fully on screen", () => {
    renderPanels();
    const panel = placeChordsPanel(100, 400);
    act(() => api().highlight("chords"));
    expect(panel.scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls a panel that's partly off screen to the middle, smoothly", () => {
    renderPanels();
    const panel = placeChordsPanel(600, 900);
    act(() => api().highlight("chords"));
    expect(panel.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
  });

  it("jumps instead of gliding with reduced motion on", () => {
    reducedMotion(true);
    renderPanels();
    const panel = placeChordsPanel(-50, 200);
    act(() => api().highlight("chords"));
    expect(panel.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "center" });
  });
});
