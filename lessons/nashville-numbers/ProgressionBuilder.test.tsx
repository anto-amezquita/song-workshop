// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { chordsFor, scaleFor, type Degree } from "@/lib/music/theory";
import { EMPTY_PROGRESSION } from "./copy";
import { ProgressionBuilder } from "./ProgressionBuilder";

afterEach(cleanup);

const scale = scaleFor("C", "major");
const chords = chordsFor(scale);

/** The builder in building mode, with removal wired up and a stand-in for the first chord card. */
function Building({ initial }: { initial: Degree[] }) {
  const [progression, setProgression] = useState(initial);
  const [generation, setGeneration] = useState(0);
  return (
    <>
      <button type="button">First chord</button>
      <ProgressionBuilder
        tonality="major"
        scale={scale}
        chords={chords}
        labels="numbers"
        progression={progression}
        preset={null}
        building
        litSlot={null}
        generation={generation}
        onPreset={() => {}}
        onBuild={() => {}}
        onRemove={(i) => {
          setProgression((p) => p.filter((_, k) => k !== i));
          setGeneration((g) => g + 1);
        }}
        focusFirstChord={() => screen.getByRole("button", { name: "First chord" }).focus()}
      />
    </>
  );
}

const slotButtons = () =>
  within(screen.getByRole("list", { name: "Progression" })).getAllByRole("button");

describe("ProgressionBuilder", () => {
  it("shows the presets with their numbers, and the chosen one pressed", () => {
    render(
      <ProgressionBuilder
        tonality="major"
        scale={scale}
        chords={chords}
        labels="numbers"
        progression={[0, 4, 5, 3]}
        preset="pop"
        building={false}
        litSlot={1}
        generation={0}
        onPreset={() => {}}
        onBuild={() => {}}
        onRemove={() => {}}
        focusFirstChord={() => {}}
      />,
    );
    const pop = screen.getByRole("button", { name: "Pop anthem 1–5–6m–4" });
    expect(pop.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("button", { name: "Build your own" }).getAttribute("aria-pressed"),
    ).toBe("false");
    // Outside building, slots are content, not buttons.
    const list = screen.getByRole("list", { name: "Progression" });
    expect(within(list).queryAllByRole("button")).toHaveLength(0);
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(list.querySelectorAll("[data-lit]")).toHaveLength(1);
  });

  it("shows the empty state with nothing added", () => {
    render(<Building initial={[]} />);
    expect(screen.getByText(EMPTY_PROGRESSION)).toBeTruthy();
    expect(screen.queryByRole("list", { name: "Progression" })).toBeNull();
  });

  it("names each slot's button by what it removes", () => {
    render(<Building initial={[0, 5]} />);
    expect(slotButtons().map((b) => b.getAttribute("aria-label"))).toEqual([
      "Remove bar 1: 1, C (C major)",
      "Remove bar 2: 6m, Am (A minor)",
    ]);
  });

  it("removes a bar on click, and focuses the slot that took its place", async () => {
    render(<Building initial={[0, 3, 4]} />);
    await userEvent.click(slotButtons()[1]!);
    expect(slotButtons()).toHaveLength(2);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Remove bar 2: 5, G (G major)");
  });

  it("removes by keyboard, focusing the bar before when the last one goes", async () => {
    const user = userEvent.setup();
    render(<Building initial={[0, 3, 4]} />);
    slotButtons()[2]!.focus();
    await user.keyboard("{Enter}");
    expect(slotButtons()).toHaveLength(2);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Remove bar 2: 4, F (F major)");
    await user.keyboard(" ");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Remove bar 1: 1, C (C major)");
  });

  it("focuses the first chord card when the progression empties", async () => {
    const user = userEvent.setup();
    render(<Building initial={[2]} />);
    slotButtons()[0]!.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText(EMPTY_PROGRESSION)).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "First chord" }));
  });

  it("calls back for presets and Build your own", async () => {
    const onPreset = vi.fn();
    const onBuild = vi.fn();
    render(
      <ProgressionBuilder
        tonality="minor"
        scale={scaleFor("C", "minor")}
        chords={chordsFor(scaleFor("C", "minor"))}
        labels="numbers"
        progression={[0]}
        preset="minorpop"
        building={false}
        litSlot={null}
        generation={0}
        onPreset={onPreset}
        onBuild={onBuild}
        onRemove={() => {}}
        focusFirstChord={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /^Cinematic/ }));
    await userEvent.click(screen.getByRole("button", { name: "Build your own" }));
    expect(onPreset).toHaveBeenCalledWith("cinema");
    expect(onBuild).toHaveBeenCalledOnce();
  });
});
