// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { Key, Tonality } from "@/lib/music/theory";
import { KeyPicker } from "./KeyPicker";

afterEach(cleanup);

function Picker({ tonality = "major" as Tonality, initial = "C" as Key }) {
  const [key, setKey] = useState<Key>(initial);
  return <KeyPicker value={key} tonality={tonality} onChange={setKey} />;
}

const chosen = () =>
  screen.getAllByRole("radio").find((r) => r.getAttribute("aria-checked") === "true");

describe("KeyPicker", () => {
  it("is a radio group of 12 keys in circle-of-fifths order", () => {
    render(<Picker />);
    expect(screen.getByRole("radiogroup", { name: "Choose a key" })).toBeTruthy();
    expect(screen.getAllByRole("radio").map((r) => r.textContent)).toEqual([
      "C",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F♯",
      "D♭",
      "A♭",
      "E♭",
      "B♭",
      "F",
    ]);
  });

  it("shows relative minors in minor, with full names for screen readers (C-11)", () => {
    render(<Picker tonality="minor" />);
    expect(screen.getAllByRole("radio")[7]!.textContent).toBe("B♭m");
    expect(screen.getByRole("radio", { name: "B♭m, B♭ minor" })).toBeTruthy();
    expect(chosen()!.getAttribute("aria-label")).toBe("Am, A minor");
  });

  it("chooses by click", async () => {
    render(<Picker />);
    await userEvent.click(screen.getByRole("radio", { name: "E♭ major" }));
    expect(chosen()!.textContent).toBe("E♭");
  });

  it("moves round the circle with the arrow keys, wrapping, with one tab stop (C-01)", async () => {
    const user = userEvent.setup();
    render(<Picker />);
    expect(screen.getAllByRole("radio").filter((r) => r.tabIndex === 0)).toHaveLength(1);
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(chosen()!.textContent).toBe("F");
    expect(document.activeElement).toBe(chosen());
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(chosen()!.textContent).toBe("G");
  });
});
