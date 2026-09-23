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

    // Optional atmospheric flourish appended after a scene phrase — see the
    // "embellishments" list in WORD_BANKS.scenes and the "Add atmospheric
    // detail to scenes" toggle in Settings. Rolled probabilistically rather
    // than always-on so it reads as an occasional extra touch, not a fixed
    // suffix on every scene.
    const SCENE_EMBELLISH_CHANCE = 0.6;

    function embellishScene(scenePhrase) {
      const list = WORD_BANKS.scenes.embellishments || [];
      if (list.length === 0) return scenePhrase;
      const pick = list[Math.floor(Math.random() * list.length)];
      return `${scenePhrase}, ${pick}`;
    }

    function maybeEmbellishScene(scenePhrase, enabled) {
      if (!enabled || Math.random() > SCENE_EMBELLISH_CHANCE) return scenePhrase;
      return embellishScene(scenePhrase);
    }

    function fillTemplate(templateText, options) {
      const opts = options || {};
      const thing = opts.forceThing ? opts.forceThing() : draw("things");
      const thingTags = tagsFor("things", thing);
      const biasThemes = expandAffinity(thingTags);

      let thing2;
      if (opts.forceThing) {
        thing2 = opts.forceThing();
        if (thing2 === thing) thing2 = opts.forceThing();
      } else {
        thing2 = drawBiased("things", biasThemes, thing);
      }

      const scenario = drawBiased("scenarios", biasThemes);
      const object = drawBiased("objects", biasThemes);
      const scene = maybeEmbellishScene(drawBiased("scenes", biasThemes), opts.embellishScenes);
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

    return { draw, drawBiased, tagsFor, fillTemplate, maybeEmbellishScene };
  }

  // A specific animal noun (a breed, or a wild species from js/animal-
  // breeds.js) isn't part of any pool built by buildPromptData, so it needs
  // its own adjective pairing rather than going through draw()/drawBiased().
  // Anatomical adjectives ("winged", "scaled", "feathered", "horned",
  // "three-legged") don't fit a real cat or dog, so they're excluded in the
  // safe case the same way isThingCompatible excludes them for non-creature
  // nouns — except "furry" and "sharp-toothed", which are true of virtually
  // any cat/dog/wild relative and stay allowed. Weirdness still does
  // something here: at higher settings it has a chance to ignore that
  // exclusion for a stranger, less-literal result.
  const ANIMAL_ALLOWED_ANATOMICAL = new Set(["furry", "sharp-toothed"]);

  function phraseForFixedNoun(noun, weirdness) {
    const wild = Math.random() * 100 < (weirdness || 0);
    const adjectives = wild
      ? WORD_BANKS.things.adjectives
      : WORD_BANKS.things.adjectives.filter(
          (adj) => !THINGS_ANATOMICAL_ADJECTIVES.has(adj) || ANIMAL_ALLOWED_ANATOMICAL.has(adj)
        );
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    return `${indefiniteArticle(adj)} ${adj} ${noun}`;
  }

  global.PromptGenerator = { createGenerator, capitalize, phraseForFixedNoun };
})(typeof window !== "undefined" ? window : globalThis);
