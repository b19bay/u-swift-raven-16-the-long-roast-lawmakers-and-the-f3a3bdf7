import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "They passed a law requiring every AI system to explain itself in plain language, then spent the afternoon asking an intern to turn the law itself into a PDF.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outDir) {
  throw new Error("MAKEFUN_OUTPUT_DIR is not set");
}

// Gate: one sentence, 1-320 characters, not only whitespace.
// Ties break on bytes (fewer is better), so assert the UTF-8 byte count
// too: the line is all ASCII, so bytes must equal characters.
const byteLen = Buffer.byteLength(LINE, "utf8");
if (LINE.length < 1 || LINE.length > 320 || byteLen > 320) {
  throw new Error(
    `entry is ${LINE.length} characters / ${byteLen} bytes, must be 1-320`,
  );
}
if (byteLen !== LINE.length) {
  throw new Error("entry must be plain ASCII so bytes equal characters");
}
if (LINE.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
const terminators = (LINE.match(/[.!?]/g) ?? []).length;
if (terminators !== 1 || !LINE.endsWith(".")) {
  throw new Error("entry must be exactly one sentence");
}

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

// Read-back check: what landed on disk must be byte-identical to the line.
const back = readFileSync(outPath, "utf8");
if (back !== LINE) {
  throw new Error("read-back mismatch: entry.txt differs from the line");
}
