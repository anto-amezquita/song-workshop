// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { chordsFor, scaleFor } from "@/lib/music/theory";
import { ChordGrid } from "./ChordGrid";

afterEach(cleanup);

const chords = chordsFor(scaleFor("C", "major"));

describe("ChordGrid", () => {
  it("names each card as the file does, with numbers first", () => {
    render(<ChordGrid chords={chords} labels="numbers" lit={null} onTap={() => {}} />);
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Chord 1, C major, home",
      "Chord 2m, Dm minor",
      "Chord 3m, Em minor",
      "Chord 4, F major",
      "Chord 5, G major",
      "Chord 6m, Am minor",
      "Chord 7°, B° dim",
    ]);
    // The visible text, which the name has to contain.
    expect(screen.getAllByRole("button")[5]!.textContent).toBe("6m Am minor");
  });

  it("follows what the card shows with names first, so the name contains the label (C-15)", () => {
    render(<ChordGrid chords={chords} labels="names" lit={null} onTap={() => {}} />);
    expect(screen.getByRole("button", { name: "Chord Am, 6m minor" })).toBeTruthy();
  });

  it("marks the lit card, the diminished one and home", () => {
    render(<ChordGrid chords={chords} labels="numbers" lit={4} onTap={() => {}} />);
    const cards = screen.getAllByRole("button");
    expect(cards.map((c) => c.hasAttribute("data-lit"))).toEqual([
      false,
      false,
      false,
      false,
      true,
      false,
      false,
    ]);
    expect(cards[6]!.hasAttribute("data-dim")).toBe(true);
    expect(cards[0]!.hasAttribute("data-home")).toBe(true);
  });

  it("calls back with the tapped degree", async () => {
    const onTap = vi.fn();
    render(<ChordGrid chords={chords} labels="numbers" lit={null} onTap={onTap} />);
    await userEvent.click(screen.getByRole("button", { name: "Chord 4, F major" }));
    expect(onTap).toHaveBeenCalledWith(3);
  });
});
