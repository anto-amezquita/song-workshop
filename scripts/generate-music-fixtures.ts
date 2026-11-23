// Generates lib/music/__fixtures__/reference.json from the original lesson file,
// by running the file's own theory code. The port's tests compare against it.
//
//   node scripts/generate-music-fixtures.ts
//
// One-off: run it once, commit the JSON. It's deleted together with reference/
// once the port passes the side-by-side check (architecture.md §2, §10).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

const SOURCE = "reference/nashville-number-lab.html";
const OUT = "lib/music/__fixtures__/reference.json";

const html = readFileSync(SOURCE, "utf8");

/** The text between two markers in the file, failing loudly if either is missing. */
function between(start: string, end: string): string {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`Can't find "${start}" … "${end}" in ${SOURCE}`);
  return html.slice(from, to);
}

/** One line of the file that starts with `start`, failing loudly if missing. */
function line(start: string): string {
  const found = html.split("\n").find((l) => l.trim().startsWith(start));
  if (!found) throw new Error(`Can't find a line starting "${start}" in ${SOURCE}`);
  return found;
}

// The file's own code, unchanged: the theory section, the voicing functions
// from the audio section, and two label helpers.
const fileCode = [
  between("// ---------- theory ----------", "// ---------- state ----------"),
  "let scale, chords;",
  between("const baseMidi", "function playChord"),
  line("const pattern"),
  line("const keyLabel"),
].join("\n");

// What the fixture records, for every key in both tonalities. The three
// expressions marked "renderKey" are copied from the file's renderKey().
const driver = `
const out = { keys: KEYS, presets: PRESETS, cases: [] };
for (const key of KEYS) {
  for (const mode of ['major', 'minor']) {
    scale = scaleFor(key, mode);
    chords = chordsFor(scale);
    const maj = majorScale(key);
    out.cases.push({
      key,
      mode,
      scale: scale.map(n => ({ name: n.name, pc: n.pc, semis: n.semis })),
      chords: chords.map(c => ({ degree: c.i, quality: c.q, number: c.num, name: c.name, tones: c.tones })),
      // renderKey, line 445
      keyName: mode === 'major' ? \`\${maj[0].name} major\` : \`\${maj[5].name} minor\`,
      // renderKey, line 446
      keySub: mode === 'major' ? \`Relative minor: \${maj[5].name} minor\` : \`Same notes as \${maj[0].name} major\`,
      // renderKey, line 455
      steps: scale.map((n, i) => ((i < 6 ? scale[i + 1].semis : 12) - n.semis) === 1 ? 'H' : 'W'),
      pills: KEYS.map(k => keyLabel(k, mode)),
      baseMidi: baseMidi(),
      voicings: chords.map(c => chordMidis(c.i)),
      // playScale(): b = baseMidi() + 12, then b + (i === 7 ? 12 : scale[i].semis)
      scaleMidis: [0, 1, 2, 3, 4, 5, 6, 7].map(i => baseMidi() + 12 + (i === 7 ? 12 : scale[i].semis)),
      presetPatterns: PRESETS[mode].map(p => ({ id: p.id, pattern: pattern(p.deg) })),
    });
  }
}
out;
`;

const result = vm.runInNewContext(fileCode + "\n" + driver, {}, { filename: SOURCE });
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      $comment: `Generated from ${SOURCE} by scripts/generate-music-fixtures.ts. Don't edit.`,
      ...result,
    },
    null,
    2,
  ) + "\n",
);
console.log(`Wrote ${OUT}: ${result.cases.length} cases`);
