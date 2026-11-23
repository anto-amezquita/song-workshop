import { describe, expect, it } from "vitest";
import reference from "@/lib/music/__fixtures__/reference.json";
import { KEYS, chordsFor, scaleFor, type Key, type Tonality } from "@/lib/music/theory";
import { keySubline, keyTitle, pillLabel, pillName, removeBarName } from "./copy";
import { PRESETS } from "./presets";

type Case = (typeof reference.cases)[number] & { key: Key; mode: Tonality };
const cases = reference.cases as Case[];

describe.each(cases)("$key $mode", (c) => {
  it("names the key and its relative as the file does", () => {
    expect(keyTitle(c.key, c.mode)).toBe(c.keyName);
    expect(keySubline(c.key, c.mode)).toBe(c.keySub);
  });

  it("labels the pills as the file does", () => {
    expect(KEYS.map((k) => pillLabel(k, c.mode))).toEqual(c.pills);
  });
});

describe("the presets", () => {
  it("are the file's, in its order", () => {
    const ids = (t: Tonality) => PRESETS[t].map((p) => ({ id: p.id, deg: p.degrees }));
    const fromFile = (t: Tonality) => reference.presets[t].map((p) => ({ id: p.id, deg: p.deg }));
    expect(ids("major")).toEqual(fromFile("major"));
    expect(ids("minor")).toEqual(fromFile("minor"));
  });
});

describe("names for screen readers", () => {
  it("gives a pill its full key, starting with what it shows (C-11)", () => {
    expect(pillName("Db", "major")).toBe("D♭ major");
    expect(pillName("Db", "minor")).toBe("B♭m, B♭ minor");
    expect(pillName("F#", "minor")).toBe("D♯m, D♯ minor");
  });

  it("names a slot's remove button by what it shows, then the chord said out loud (R3, C-15)", () => {
    const scale = scaleFor("C", "major");
    const chords = chordsFor(scale);
    expect(removeBarName(1, "6m", "Am", chords[5]!, scale)).toBe("Remove bar 2: 6m, Am (A minor)");
    expect(removeBarName(0, "B°", "7°", chords[6]!, scale)).toBe(
      "Remove bar 1: B°, 7° (B diminished)",
    );
  });
});
