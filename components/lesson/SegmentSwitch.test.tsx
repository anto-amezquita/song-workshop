// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SegmentSwitch } from "./SegmentSwitch";

afterEach(cleanup);

const MODES = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Relative minor" },
] as const;

const THREE = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
] as const;

function Controlled({
  options = THREE as readonly { value: string; label: string }[],
  initial = "a",
  onChange,
}: {
  options?: readonly { value: string; label: string }[];
  initial?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <SegmentSwitch
      label="Pick one"
      options={options}
      value={value}
      onChange={(v) => {
        onChange?.(v);
        setValue(v);
      }}
    />
  );
}

const checked = () =>
  screen.getAllByRole("radio").map((r) => r.getAttribute("aria-checked") === "true");

describe("SegmentSwitch", () => {
  it("is a named radio group with the chosen option checked", () => {
    render(<SegmentSwitch label="Mode" options={MODES} value="major" onChange={() => {}} />);
    expect(screen.getByRole("radiogroup", { name: "Mode" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Major" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Relative minor" }).getAttribute("aria-checked")).toBe(
      "false",
    );
  });

  it("puts only the chosen option in the tab order", () => {
    render(<Controlled initial="b" />);
    expect(screen.getAllByRole("radio").map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("chooses an option on click", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "C" }));
    expect(onChange).toHaveBeenCalledWith("c");
    expect(checked()).toEqual([false, false, true]);
  });

  it("moves the choice and focus with the arrow keys, wrapping at the ends", async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "A" }));

    await user.keyboard("{ArrowRight}");
    expect(checked()).toEqual([false, true, false]);
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "B" }));

    await user.keyboard("{ArrowDown}{ArrowDown}"); // C, then wraps to A
    expect(checked()).toEqual([true, false, false]);

    await user.keyboard("{ArrowLeft}"); // wraps back to C
    expect(checked()).toEqual([false, false, true]);
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "C" }));

    await user.keyboard("{ArrowUp}");
    expect(checked()).toEqual([false, true, false]);
  });

  it("ignores other keys", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Controlled onChange={onChange} />);
    await user.tab();
    await user.keyboard("x{Home}");
    expect(onChange).not.toHaveBeenCalled();
  });

  describe("the thumb", () => {
    // jsdom has no layout, so each option gets a fixed position and size.
    const boxes: Record<string, [number, number, number, number]> = {
      A: [4, 4, 40, 30],
      B: [44, 4, 60, 30],
      C: [104, 4, 50, 30],
    };
    beforeEach(() => {
      for (const [prop, i] of [
        ["offsetLeft", 0],
        ["offsetTop", 1],
        ["offsetWidth", 2],
        ["offsetHeight", 3],
      ] as const) {
        vi.spyOn(HTMLElement.prototype, prop, "get").mockImplementation(function (
          this: HTMLElement,
        ) {
          return boxes[this.textContent ?? ""]?.[i] ?? 0;
        });
      }
    });
    afterEach(() => vi.restoreAllMocks());

    const thumb = () => document.querySelector<HTMLElement>(".segment-switch__thumb")!;

    it("sits on the chosen option, placed without a transition the first time", () => {
      render(<Controlled initial="b" />);
      expect(thumb().style.transform).toBe("translate(44px, 4px)");
      expect(thumb().style.width).toBe("60px");
      expect(thumb().style.height).toBe("30px");
      expect(thumb().style.transition).toBe("");
      expect(document.querySelector(".segment-switch")!.hasAttribute("data-measured")).toBe(true);
    });

    it("slides to the new choice", async () => {
      render(<Controlled />);
      await userEvent.click(screen.getByRole("radio", { name: "C" }));
      expect(thumb().style.transform).toBe("translate(104px, 4px)");
      expect(thumb().style.width).toBe("50px");
    });
  });
});
