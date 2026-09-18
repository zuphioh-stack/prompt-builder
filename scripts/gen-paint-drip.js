// Generates assets/paint-drip.svg: a pixel-art strip of paint drips in the
// app's category colors, hanging from the top edge. Deterministic (seeded
// RNG) so re-running it reproduces the same artwork. Run with:
//   node scripts/gen-paint-drip.js

const fs = require("fs");
const path = require("path");

// Small seeded PRNG (mulberry32) so the art is reproducible.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260918);

const PIXEL = 8;
const WIDTH = 1200;
const HEIGHT = 220;
const COLUMNS = Math.floor(WIDTH / PIXEL);

// A tonal black / beige / amber / cream palette — no pastels, matches the
// app's single accent color system.
const PALETTE = [
  "#c99a44", // accent (amber)
  "#e0b565", // accent-dark (light amber)
  "#8f6a2e", // deep amber / bronze
  "#f0e6d2", // cream (ink)
  "#7c7261", // muted taupe (ink-faint)
  "#332c22" // near-black (line)
];

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const rects = [];

function px(col, row, color) {
  rects.push(`<rect x="${col * PIXEL}" y="${row * PIXEL}" width="${PIXEL}" height="${PIXEL}" fill="${color}"/>`);
}

// Walk across the strip in small clusters of 2-4 pixel-wide columns, each
// cluster becoming one drip (or staying dry) so drips read as separate
// blobs rather than a solid colored bar.
let col = 0;
while (col < COLUMNS) {
  const clusterWidth = 2 + Math.floor(rand() * 3); // 2-4 columns
  const isDry = rand() < 0.22; // some gaps so it doesn't feel like a solid rule

  if (!isDry) {
    const color = pick(PALETTE);
    const stemCol = col + Math.floor(clusterWidth / 2);

    // Pool along the very top edge: a clean 2-row-tall blob, always wider
    // than the stem, so it reads as paint sitting at the frame edge before
    // it runs.
    for (let row = 0; row < 2; row++) {
      for (let c = -1; c <= 1; c++) px(stemCol + c, row, color);
    }

    // A weighted length so most drips are short/medium and a few run long
    // enough to be cropped by the header's fixed height ("out of frame").
    const roll = rand();
    let length;
    if (roll < 0.45) length = 3 + Math.floor(rand() * 4); // short: 3-6
    else if (roll < 0.8) length = 7 + Math.floor(rand() * 6); // medium: 7-12
    else length = 14 + Math.floor(rand() * 12); // long: 14-25 (bleeds off)

    // A single straight pixel-wide stem, kept clean (no stray side pixels —
    // those read as flags/crosses rather than a wobble at this pixel size).
    for (let row = 2; row < 2 + length; row++) {
      px(stemCol, row, color);
    }

    // A teardrop tip: one row a little wider (the "belly"), then a single
    // point — only drawn if it fits before the canvas ends, so long drips
    // that bleed off the bottom just stay a plain cut-off stem.
    const bellyRow = 2 + length;
    if (bellyRow + 1 < HEIGHT / PIXEL) {
      for (let c = -1; c <= 1; c++) px(stemCol + c, bellyRow, color);
      px(stemCol, bellyRow + 1, color);
    }
  }

  col += clusterWidth + 1; // 1-column gap between clusters
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="none" shape-rendering="crispEdges">
${rects.join("\n")}
</svg>
`;

const outPath = path.join(__dirname, "..", "assets", "paint-drip.svg");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, svg);
console.log(`Wrote ${outPath} (${rects.length} pixels)`);
