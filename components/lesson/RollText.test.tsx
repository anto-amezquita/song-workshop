// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RollText } from "./RollText";

afterEach(cleanup);

const span = (container: HTMLElement) => container.querySelector<HTMLElement>(".roll-text")!;

describe("RollText", () => {
  it("shows its text without rolling on the first render", () => {
    const { container } = render(<RollText text="C major" />);
    expect(span(container).textContent).toBe("C major");
    expect(span(container).hasAttribute("data-rolling")).toBe(false);
  });

  it("rolls on the first render when asked, with its delay", () => {
    const { container } = render(<RollText text="Dm" delay={40} rollOnMount />);
    expect(span(container).hasAttribute("data-rolling")).toBe(true);
    expect(span(container).style.animationDelay).toBe("40ms");
  });

  it("rolls in new text in a fresh element, so the animation restarts", () => {
    const { container, rerender } = render(<RollText text="C major" />);
    const first = span(container);
    rerender(<RollText text="G major" delay={60} />);
    const second = span(container);
    expect(second).not.toBe(first);
    expect(second.textContent).toBe("G major");
    expect(second.hasAttribute("data-rolling")).toBe(true);
    expect(second.style.animationDelay).toBe("60ms");
  });

  it("does nothing when the same text renders again", () => {
    const { container, rerender } = render(<RollText text="5" />);
    rerender(<RollText text="6m" />);
    const rolled = span(container);
    rerender(<RollText text="6m" delay={90} />);
    expect(span(container)).toBe(rolled);
  });
});
