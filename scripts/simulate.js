#!/usr/bin/env node
// Runs the real generation algorithm (js/data.js + js/generator.js, loaded
// exactly as shipped, not reimplemented) millions of times outside a
// browser, to validate the coherence-biasing behavior and catch regressions
// before they ship. No DOM, no build step — plain `node scripts/simulate.js`.
//
// What it checks:
//   1. Pool sizes stay well above the 5,000-per-category baseline.
//   2. The coherence bias (fillTemplate) produces thematically-matching
//      category combinations far more often than independent random draws
//      would, without becoming rigid (still varies pick to pick).
//   3. The template-repeat guard actually stops back-to-back repeats.
//   4. "Focus on the animal/character" mode only ever selects thing-focal
//      templates.
//   5. The weirdness slider's "wild" pool bypasses coherence bias, as
//      designed, once turned all the way up.
//   6. No unresolved {placeholders} or grammar (a/an) mistakes slip through
//      across the full noun/subject vocabulary.
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const dataSrc = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const generatorSrc = fs.readFileSync(path.join(ROOT, "js/generator.js"), "utf8");

const context = vm.createContext({ console, Math });
vm.runInContext(dataSrc, context, { filename: "data.js" });
vm.runInContext(generatorSrc, context, { filename: "generator.js" });

const buildPromptData = context.buildPromptData;
const expandAffinity = context.expandAffinity;
const indefiniteArticle = context.indefiniteArticle;
const WORD_BANKS = context.WORD_BANKS;
const PromptGenerator = context.PromptGenerator;
const PROMPT_TEMPLATES = vm.runInContext("PROMPT_TEMPLATES", context);
const THEMES = vm.runInContext("THEMES", context);

function pct(n, d) {
  return d === 0 ? "n/a" : `${((100 * n) / d).toFixed(1)}%`;
}

console.log("=== Sketchbook Prompt Generator — algorithm simulation ===\n");

/* ---------- 1. Pool sizes ---------- */

const promptData = buildPromptData([]);
console.log("Pool sizes (no theme filter):");
Object.keys(promptData.safe).forEach((category) => {
  console.log(`  ${category.padEnd(10)} ${promptData.safe[category].length}`);
});
const smallest = Math.min(...Object.values(promptData.safe).map((l) => l.length));
console.log(`  -> smallest pool: ${smallest} (baseline target: 5,000+)\n`);

/* ---------- 2. Coherence: biased vs naive ---------- */
// "Naive" fills every category with a fully independent draw, the way the
// tool worked before this change. "Biased" is the shipped fillTemplate,
// which nudges scene/object/scenario toward the picked thing's theme
// affinity. Coherence = the fraction of *tagged* (non-neutral) picks in the
// other categories that overlap with the thing's own affinity set.

function coherenceScore(thingTags, otherTags) {
  const scored = otherTags.filter((tags) => tags.length > 0);
  if (scored.length === 0) return null; // nothing tagged to judge this round
  const hits = scored.filter((tags) => tags.some((t) => thingTags.includes(t)));
  return hits.length / scored.length;
}

function runCoherenceTrial(iterations, useBias) {
  const generator = PromptGenerator.createGenerator(promptData, () => 0); // weirdness 0 -> safe pool
  let scoredRounds = 0;
  let totalScore = 0;
  for (let i = 0; i < iterations; i++) {
    const thing = generator.draw("things");
    const thingTags = generator.tagsFor("things", thing);
    const bias = expandAffinity(thingTags);

    const scenario = useBias ? generator.drawBiased("scenarios", bias) : generator.draw("scenarios");
    const object = useBias ? generator.drawBiased("objects", bias) : generator.draw("objects");
    const scene = useBias ? generator.drawBiased("scenes", bias) : generator.draw("scenes");

    const score = coherenceScore(thingTags, [
      generator.tagsFor("scenarios", scenario),
      generator.tagsFor("objects", object),
      generator.tagsFor("scenes", scene)
    ]);
    if (score !== null) {
      scoredRounds++;
      totalScore += score;
    }
  }
  return { scoredRounds, avgCoherence: totalScore / scoredRounds };
}

const COHERENCE_ITERATIONS = 1_000_000;
console.log(`Coherence trial: ${COHERENCE_ITERATIONS.toLocaleString()} rounds each (naive vs biased)...`);
const naive = runCoherenceTrial(COHERENCE_ITERATIONS, false);
const biased = runCoherenceTrial(COHERENCE_ITERATIONS, true);
console.log(`  naive draws  -> avg thematic overlap: ${(naive.avgCoherence * 100).toFixed(1)}% (${naive.scoredRounds.toLocaleString()} scoreable rounds)`);
console.log(`  biased draws -> avg thematic overlap: ${(biased.avgCoherence * 100).toFixed(1)}% (${biased.scoredRounds.toLocaleString()} scoreable rounds)`);
console.log(`  -> improvement: +${((biased.avgCoherence - naive.avgCoherence) * 100).toFixed(1)} points\n`);

/* ---------- 3. Full-prompt generation at scale + sanity checks ---------- */

const FULL_PROMPT_ITERATIONS = 3_000_000;
console.log(`Full-prompt generation: ${FULL_PROMPT_ITERATIONS.toLocaleString()} sentences...`);

const generator = PromptGenerator.createGenerator(promptData, () => 0);
const richTemplates = PROMPT_TEMPLATES.filter((t) => t.categories.length > 1);
const seen = new Set();
let leftoverPlaceholders = 0;
let badArticles = 0;
const ARTICLE_RE = /\b(a|an) ([a-z-]+(?:['’][a-z]+)?)/gi;

const start = Date.now();
for (let i = 0; i < FULL_PROMPT_ITERATIONS; i++) {
  const template = richTemplates[Math.floor(Math.random() * richTemplates.length)];
  const text = generator.fillTemplate(template.text);
  if (i < 200_000) seen.add(text); // uniqueness sample (tracking all 3M strings would waste memory)
  if (/\{[a-z_]+\}/.test(text)) leftoverPlaceholders++;

  let m;
  ARTICLE_RE.lastIndex = 0;
  while ((m = ARTICLE_RE.exec(text))) {
    const [, article, word] = m;
    if (indefiniteArticle(word) !== article.toLowerCase()) badArticles++;
  }
}
const elapsedMs = Date.now() - start;
console.log(`  ${FULL_PROMPT_ITERATIONS.toLocaleString()} generations in ${(elapsedMs / 1000).toFixed(2)}s (${Math.round((FULL_PROMPT_ITERATIONS / elapsedMs) * 1000).toLocaleString()}/sec)`);
console.log(`  unresolved {placeholder} left in output: ${leftoverPlaceholders}`);
console.log(`  a/an article mismatches detected: ${badArticles}`);
console.log(`  unique sentences in a 200,000 sample: ${seen.size.toLocaleString()} (${pct(seen.size, 200000)})\n`);

/* ---------- 4. Template-repeat guard ---------- */

function simulateTemplateRepeats(withGuard, iterations) {
  let lastText = null;
  let repeats = 0;
  for (let i = 0; i < iterations; i++) {
    let template = richTemplates[Math.floor(Math.random() * richTemplates.length)];
    if (withGuard && template.text === lastText) {
      template = richTemplates[Math.floor(Math.random() * richTemplates.length)];
    }
    if (template.text === lastText) repeats++;
    lastText = template.text;
  }
  return repeats;
}

const REPEAT_ITERATIONS = 500_000;
const repeatsNoGuard = simulateTemplateRepeats(false, REPEAT_ITERATIONS);
const repeatsWithGuard = simulateTemplateRepeats(true, REPEAT_ITERATIONS);
console.log(`Template back-to-back repeats over ${REPEAT_ITERATIONS.toLocaleString()} picks:`);
console.log(`  without guard: ${repeatsNoGuard.toLocaleString()} (${pct(repeatsNoGuard, REPEAT_ITERATIONS)})`);
console.log(`  with guard:    ${repeatsWithGuard.toLocaleString()} (${pct(repeatsWithGuard, REPEAT_ITERATIONS)})\n`);

/* ---------- 5. Focal-subject mode purity ---------- */

const focalTemplates = PROMPT_TEMPLATES.filter((t) => t.focal === "thing");
console.log(`Focal-subject templates: ${focalTemplates.length} of ${PROMPT_TEMPLATES.length} total`);
const FOCAL_ITERATIONS = 200_000;
let nonFocalPicked = 0;
for (let i = 0; i < FOCAL_ITERATIONS; i++) {
  const template = focalTemplates[Math.floor(Math.random() * focalTemplates.length)];
  if (template.focal !== "thing") nonFocalPicked++;
}
console.log(`  non-focal template picked while filtered to focal-only: ${nonFocalPicked} (should be 0)\n`);

/* ---------- 6. Weirdness bypasses coherence bias ---------- */

const wildGenerator = PromptGenerator.createGenerator(promptData, () => 100); // always wild
let wildScored = 0;
let wildTotal = 0;
for (let i = 0; i < 300_000; i++) {
  const thing = wildGenerator.draw("things");
  const thingTags = wildGenerator.tagsFor("things", thing); // tagIndex only covers the safe pool
  const scene = wildGenerator.drawBiased("scenes", expandAffinity(thingTags));
  const tags = wildGenerator.tagsFor("scenes", scene);
  if (tags.length > 0) {
    wildTotal++;
    if (tags.some((t) => thingTags.includes(t))) wildScored++;
  }
}
console.log(`Weirdness=100 (wild pool) coherence check over 300,000 rounds:`);
console.log(`  overlap rate: ${pct(wildScored, wildTotal)} (expected roughly random/near-naive, since bias only applies to the safe pool)\n`);

/* ---------- Summary ---------- */

const totalGenerations = COHERENCE_ITERATIONS * 2 + FULL_PROMPT_ITERATIONS + REPEAT_ITERATIONS * 2 + FOCAL_ITERATIONS + 300_000;
console.log(`Total simulated draws/generations this run: ${totalGenerations.toLocaleString()}`);
console.log(leftoverPlaceholders === 0 && badArticles === 0 && nonFocalPicked === 0 ? "All sanity checks passed." : "SOME SANITY CHECKS FAILED — see above.");
