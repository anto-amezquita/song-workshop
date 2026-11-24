import { describe, expect, it } from "vitest";
import reference from "../__fixtures__/reference.json";
import {
  KEYS,
  chordsFor,
  keyName,
  progressionPattern,
  scaleFor,
  stepPattern,
  tonicName,
  type Degree,
  type Key,
  type Tonality,
} from "./index";

// Every case was computed by the original lesson file's own code (see the fixture's $comment).
type Case = (typeof reference.cases)[number] & { key: Key; mode: Tonality };
const cases = reference.cases as Case[];

describe("the fixture", () => {
  it("covers all 12 keys in both tonalities", () => {
    expect(cases).toHaveLength(24);
    expect(reference.keys).toEqual([...KEYS]);
  });
});

describe.each(cases)("$key $mode", (c) => {
  const scale = scaleFor(c.key, c.mode);
  const chords = chordsFor(scale);

  it("spells the scale as the file does", () => {
    expect(scale.map((n) => ({ name: n.name, pc: n.pitchClass, semis: n.semitones }))).toEqual(
      c.scale,
    );
  });

  it("builds the same seven chords", () => {
    expect(chords).toEqual(c.chords);
  });

  it("has the same W/H steps", () => {
    expect(stepPattern(scale)).toEqual(c.steps);
  });

  it("names the key and its relative as the file does", () => {
    const other: Tonality = c.mode === "major" ? "minor" : "major";
    expect(`${tonicName(c.key, c.mode)} ${c.mode}`).toBe(c.keyName);
    const relative = `${tonicName(c.key, other)} ${other}`;
    expect(c.keySub).toBe(
      c.mode === "major" ? `Relative minor: ${relative}` : `Same notes as ${relative}`,
    );
  });

  it("labels the key pills as the file does", () => {
    const pills = KEYS.map((k) => (c.mode === "minor" ? `${tonicName(k, "minor")}m` : keyName(k)));
    expect(pills).toEqual(c.pills);
  });

  it("gives each preset the same number pattern", () => {
    const presets = reference.presets[c.mode];
    const patterns = presets.map((p) => ({
      id: p.id,
      pattern: progressionPattern(chords, p.deg as Degree[]),
    }));
    expect(patterns).toEqual(c.presetPatterns);
  });
});

describe("the theory, in words", () => {
  it("gives every major key the same qualities: 1, 2m, 3m, 4, 5, 6m, 7°", () => {
    for (const key of KEYS) {
      expect(chordsFor(scaleFor(key, "major")).map((c) => c.number)).toEqual([
        "1",
        "2m",
        "3m",
        "4",
        "5",
        "6m",
        "7°",
      ]);
    }
  });

  it("makes the relative minor the same notes from the sixth", () => {
    for (const key of KEYS) {
      const major = scaleFor(key, "major").map((n) => n.name);
      const minor = scaleFor(key, "minor").map((n) => n.name);
      expect(minor).toEqual([...major.slice(5), ...major.slice(0, 5)]);
      expect(stepPattern(scaleFor(key, "minor")).join("")).toBe("WHWWHWW");
    }
  });

  it("is pure: the same input gives the same output", () => {
    expect(chordsFor(scaleFor("Db", "minor"))).toEqual(chordsFor(scaleFor("Db", "minor")));
  });
});
