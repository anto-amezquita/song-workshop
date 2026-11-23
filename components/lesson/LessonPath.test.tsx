// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonPath, type PathStep } from "./LessonPath";

afterEach(cleanup);

const STEPS: PathStep[] = [
  {
    title: "Number the scale",
    description: "Each note gets a number.",
    actionLabel: "Play the scale",
  },
  {
    title: "A chord on every note",
    description: "Stack every other note.",
    actionLabel: "Play all seven",
  },
  { title: "Hear a pattern", description: "1–5–6m–4.", actionLabel: "Play 1–5–6m–4" },
];

const states = () =>
  screen.getAllByRole("listitem").map((li) => li.getAttribute("data-state") ?? "");

describe("LessonPath", () => {
  it("is a complementary region named Lesson path, with a numbered list of steps", () => {
    render(<LessonPath steps={STEPS} current={null} onAction={() => {}} />);
    const region = screen.getByRole("complementary", { name: "Lesson path" });
    expect(within(region).getByRole("heading", { level: 2, name: "Lesson path" })).toBeTruthy();
    expect(within(region).getByRole("list").tagName).toBe("OL");
    expect(
      within(region)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(STEPS.map((s) => s.title));
  });

  it("names each button by its action, without the arrow", () => {
    render(<LessonPath steps={STEPS} current={null} onAction={() => {}} />);
    expect(screen.getByRole("button", { name: "Play the scale" })).toBeTruthy();
  });

  it("marks nothing before a step is pressed", () => {
    render(<LessonPath steps={STEPS} current={null} onAction={() => {}} />);
    expect(states()).toEqual(["", "", ""]);
  });

  it("marks the current step, and every earlier one as done", () => {
    render(<LessonPath steps={STEPS} current={1} onAction={() => {}} />);
    expect(states()).toEqual(["done", "current", ""]);
    expect(screen.getAllByRole("listitem")[1]!.getAttribute("aria-current")).toBe("step");
  });

  it("calls back with the step's index", async () => {
    const onAction = vi.fn();
    render(<LessonPath steps={STEPS} current={null} onAction={onAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Play all seven" }));
    expect(onAction).toHaveBeenCalledWith(1);
  });
});
