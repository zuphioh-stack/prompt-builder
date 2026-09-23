// Pure prompt-generation logic — no DOM access, no globals besides what
// data.js defines (WORD_BANKS, THEME_AFFINITY/expandAffinity, etc.). Kept
// separate from js/app.js (which only handles UI wiring/rendering) so the
// actual generation algorithm can be driven and tested outside a browser —
// see scripts/simulate.js, which runs it millions of times to validate the
// coherence-biasing behavior below without needing a page at all.
(function (global) {
  "use strict";

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Creates one generator bound to a given promptData (safe/wild pools +
  // tagIndex, from buildPromptData) and a live weirdness getter — a function
  // rather than a fixed number, so moving the weirdness slider takes effect
  // immediately without needing to rebuild the shuffle bags.
  function createGenerator(promptData, getWeirdness) {
    const bags = { safe: {}, all: {} };

    function poolFor(kind, category) {
      return kind === "all" ? promptData.all[category] : promptData.safe[category];
    }

    function refillBag(kind, category) {
      const items = poolFor(kind, category).slice();
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      bags[kind][category] = items;
    }

    // Plain draw: picks the safe or wild pool per the weirdness odds, pulls
    // the next item off that category's shuffle bag (refilling/reshuffling
    // it once empty), and — if the pool has more than one item — avoids
    // immediately repeating whatever was just shown for this category.
    function draw(category, exclude) {
      const kind = Math.random() * 100 < getWeirdness() ? "all" : "safe";
      if (!bags[kind][category] || bags[kind][category].length === 0) {
        refillBag(kind, category);
      }
      let value = bags[kind][category].pop();
      if (exclude && value === exclude && bags[kind][category].length > 0) {
        const next = bags[kind][category].pop();
        bags[kind][category].unshift(value);
        value = next;
      }
      return value;
    }

    function tagsFor(category, phrase) {
      const idx = promptData.tagIndex && promptData.tagIndex[category];
      return (idx && idx[phrase]) || [];
    }

    // Algorithmically-curated draw: given the theme tags of whatever was
    // already picked (usually the thing/creature), searches a handful of
    // plain draws for one that shares an affinity with biasThemes — e.g. a
    // fantasy creature nudges the scene/object/scenario toward fantasy or
    // imaginative rather than combining completely independently. If no
    // direct match turns up within the search budget, it prefers a
    // theme-neutral pick (fits anywhere by design) over a tagged-but-
    // mismatched one, so a stray "realistic" object doesn't end up glued to
    // a fantasy creature just because that's what got drawn first. It's a
    // soft bias, not a filter — a mismatch is still possible if the pool
    // has nothing better on offer, so surprise stays possible, and the wild
    // pool (weirdness) is untouched by this — coherence is meant to be an
    // option, not a cage.
    const BIAS_ATTEMPTS = 6;

    function drawBiased(category, biasThemes, exclude) {
      if (!biasThemes || biasThemes.length === 0) return draw(category, exclude);
      let neutralFallback = null;
      let lastValue = null;
      for (let i = 0; i < BIAS_ATTEMPTS; i++) {
        const value = draw(category, exclude);
        lastValue = value;
        const tags = tagsFor(category, value);
        if (tags.length === 0) {
          if (neutralFallback === null) neutralFallback = value;
          continue;
        }
        if (tags.some((t) => biasThemes.includes(t))) return value;
      }
      return neutralFallback !== null ? neutralFallback : lastValue;
    }

    function fillTemplate(templateText) {
      const thing = draw("things");
      const thingTags = tagsFor("things", thing);
      const biasThemes = expandAffinity(thingTags);

      const thing2 = drawBiased("things", biasThemes, thing);
      const scenario = drawBiased("scenarios", biasThemes);
      const object = drawBiased("objects", biasThemes);
      const scene = drawBiased("scenes", biasThemes);
      const word = draw("words");

      return templateText
        .replace(/{thing_cap}/g, capitalize(thing))
        .replace(/{thing2}/g, thing2)
        .replace(/{thing}/g, thing)
        .replace(/{scenario}/g, scenario)
        .replace(/{object_cap}/g, capitalize(object))
        .replace(/{object}/g, object)
        .replace(/{scene}/g, scene)
        .replace(/{word}/g, word);
    }

    return { draw, drawBiased, tagsFor, fillTemplate };
  }

  global.PromptGenerator = { createGenerator, capitalize };
})(typeof window !== "undefined" ? window : globalThis);
