import { describe, expect, it } from "vitest";
import reference from "../__fixtures__/reference.json";
import { DEGREES, scaleFor, type Key, type Tonality } from "../theory";
import { chordVoicing, frequency, scaleNoteMidi, tonicMidi } from "./voicing";

type Case = (typeof reference.cases)[number] & { key: Key; mode: Tonality };
const cases = reference.cases as Case[];

describe.each(cases)("$key $mode", (c) => {
  const scale = scaleFor(c.key, c.mode);

  it("puts the tonic where the file does", () => {
    expect(tonicMidi(scale)).toBe(c.baseMidi);
  });

  it("voices every chord as the file does", () => {
    expect(DEGREES.map((d) => chordVoicing(scale, d))).toEqual(c.voicings);
  });

  it("plays the scale on the file's notes", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((i) => scaleNoteMidi(scale, i))).toEqual(c.scaleMidis);
  });
});

describe("frequency", () => {
  it("tunes A4 to 440Hz and doubles at the octave", () => {
    expect(frequency(69)).toBe(440);
    expect(frequency(81)).toBeCloseTo(880);
    expect(frequency(60)).toBeCloseTo(261.626, 3);
  });
});
