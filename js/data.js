// Word banks for the sketchbook prompt generator.
// Purely text-based drawing prompts — nothing here is meant for AI image generation.
//
// Each category is generated combinatorially from two curated word banks
// (e.g. adjectives x nouns) rather than a single flat list. That keeps the
// source lists readable and easy to edit by hand, while the resulting pool
// of unique prompts comfortably clears 5,000 per category. See buildArticled/
// buildScenario/buildWordPhrase below for exactly how each category is put
// together.

const WORD_BANKS = {
  objects: {
    adjectives: [
      "rusty", "broken", "antique", "ornate", "tiny", "giant", "glowing", "weathered",
      "porcelain", "tarnished", "dusty", "gilded", "cracked", "polished", "chipped",
      "forgotten", "handcrafted", "miniature", "oversized", "tattered", "embroidered",
      "carved", "painted", "faded", "gleaming", "patched", "folded", "sealed", "engraved",
      "wooden", "iron", "brass", "copper", "crystal", "velvet", "woven", "knotted",
      "chained", "lacquered", "stitched", "bent", "twisted", "waterlogged", "sun-bleached",
      "moth-eaten", "jeweled", "enameled", "splintered", "lopsided", "secondhand",
      "vintage", "modern", "futuristic", "makeshift", "hollow", "heavy", "featherlight",
      "translucent", "opaque", "speckled", "striped", "patterned", "mismatched",
      "silver", "golden", "bronze", "marble", "ceramic", "rubber", "leather", "silk",
      "linen", "patchwork", "threadbare", "glazed", "dented", "scorched", "frost-covered",
      "salt-crusted", "moss-covered", "cobweb-covered", "half-buried", "overgrown",
      "abandoned", "borrowed", "enchanted", "ancient", "angular", "spiral", "geometric"
    ],
    nouns: [
      "key", "umbrella", "book", "teapot", "pocket watch", "pair of boots", "birdcage",
      "lantern", "violin", "chess piece", "jar of buttons", "paper crane", "mirror",
      "treasure chest", "spool of thread", "magnifying glass", "skateboard", "typewriter",
      "potted cactus", "fishing rod", "compass", "wooden mask", "hourglass", "camera",
      "suitcase", "music box", "bicycle", "crown", "bottle", "pair of glasses",
      "tarot card", "robot toy", "sailboat model", "quiver of arrows", "satchel", "lute",
      "candle holder", "globe", "anchor", "kite", "spinning top", "hand mirror", "sundial",
      "birdhouse", "wheelbarrow", "ladder", "fire hydrant", "knitted scarf",
      "bundle of letters", "teacup", "kettle", "chandelier", "doorknob", "padlock",
      "steamer trunk", "wooden drawer", "vase", "urn", "goblet", "chalice", "dagger",
      "sword", "shield", "helmet", "gauntlet", "quill", "inkwell", "scroll", "folded map",
      "telescope", "pair of binoculars", "lantern post", "weathervane", "gramophone",
      "record player", "vintage radio", "rotary phone", "sewing machine", "spinning wheel",
      "loom", "anvil", "hammer", "wrench", "gear", "pulley", "pendulum", "clock face",
      "thermometer", "barometer", "sextant"
    ]
  },

  things: {
    adjectives: [
      "sleepy", "grumpy", "mischievous", "ancient", "lonely", "curious", "gentle",
      "ferocious", "timid", "wise", "weary", "cheerful", "mysterious", "cunning",
      "clumsy", "graceful", "stubborn", "playful", "solemn", "restless", "brave",
      "cowardly", "arrogant", "humble", "eccentric", "forgetful", "watchful", "silent",
      "talkative", "loyal", "treacherous", "kind-hearted", "bitter", "hopeful",
      "exhausted", "energetic", "frail", "towering", "diminutive", "hunched", "scarred",
      "masked", "hooded", "cloaked", "armored", "ragged", "elegant", "disheveled",
      "one-eyed", "three-legged", "winged", "horned", "scaled", "furry", "feathered",
      "translucent", "glowing", "shadowy", "spectral", "mechanical", "clockwork",
      "half-asleep", "wide-eyed", "sharp-toothed", "soft-spoken", "thunderous",
      "whispering", "wandering", "retired", "exiled", "banished", "forgotten",
      "legendary", "cursed", "blessed", "nameless", "star-crossed", "road-weary",
      "sun-worn", "moon-touched"
    ],
    nouns: [
      "cat", "owl", "fox", "turtle", "raven", "hedgehog", "stag", "octopus", "jellyfish",
      "chameleon", "dragon", "griffin", "mermaid", "centaur", "phoenix", "kraken",
      "unicorn", "gnome", "fairy", "golem", "werewolf", "sphinx", "minotaur",
      "will-o'-the-wisp", "yeti", "sailor", "street musician", "knight", "librarian",
      "fortune teller", "wizard", "masked vigilante", "lighthouse keeper", "merchant",
      "circus performer", "robot butler", "astronaut", "detective", "blacksmith",
      "beekeeper", "scarecrow", "puppet master", "ghost", "time traveler",
      "pirate captain", "giant", "talking crow", "clockwork spider", "river spirit",
      "retired superhero", "tailor", "cartographer", "apothecary", "gravedigger",
      "innkeeper", "shepherd", "monk", "hermit", "jester", "alchemist", "falconer",
      "potter", "cobbler", "weaver", "bard", "ferryman", "gatekeeper", "watchmaker",
      "herbalist", "chimney sweep", "stowaway", "castaway", "courier", "scribe",
      "executioner", "undertaker", "midwife", "gardener", "locksmith", "glassblower"
    ]
  },

  scenes: {
    modifiers: [
      "abandoned", "foggy", "bustling", "floating", "underwater", "cluttered",
      "sun-scorched", "snow-covered", "overgrown", "candlelit", "rain-soaked", "quiet",
      "hidden", "crumbling", "sunlit", "moonlit", "windswept", "frozen", "tropical",
      "arid", "misty", "echoing", "forgotten", "ancient", "futuristic", "half-submerged",
      "cliffside", "subterranean", "mountaintop", "coastal", "starlit", "twilight",
      "dawn-lit", "storm-battered", "sleepy", "remote", "secluded", "overcrowded",
      "deserted", "thriving", "haunted", "enchanted", "war-torn", "peaceful", "chaotic",
      "silent", "humming", "glowing", "shadowy", "dusty", "lantern-lit", "vine-covered",
      "ash-covered", "salt-crusted", "ivy-covered", "cobblestone", "narrow", "sprawling",
      "tucked-away", "forsaken", "crumbled", "restored", "ruined", "blooming", "wilting",
      "frost-bitten", "sun-drenched", "rain-swept", "cloud-wrapped", "wind-carved",
      "dream-like", "waterlogged", "moss-covered", "timeworn", "weathered", "gilded",
      "tarnished", "humble", "grand"
    ],
    locations: [
      "lighthouse", "night market", "forest", "floating island", "underwater cave",
      "attic", "desert oasis", "rooftop garden", "train station", "village", "greenhouse",
      "carnival", "library", "shipwreck", "monastery", "subway platform",
      "witch's cottage", "junkyard", "canyon", "windmill", "waterfall", "city skyline",
      "crystal cave", "swamp", "spaceship interior", "marketplace", "bunker",
      "cherry blossom park", "coastal cliff", "study", "alley", "hot air balloon",
      "ancient ruin", "frozen lake", "bathhouse", "mountain pass", "courtyard",
      "tidepool", "harbor", "bell tower", "observatory", "greenhouse dome", "orchard",
      "vineyard", "quarry", "mine shaft", "catacomb", "chapel", "monastery garden",
      "watchtower", "pier", "boardwalk", "amphitheater", "bazaar", "teahouse",
      "floating market", "treehouse", "cave system", "glacier", "volcano rim",
      "salt flat", "rice terrace", "bamboo grove", "mangrove swamp", "sand dune",
      "ice cave", "hedge maze", "botanical garden", "rooftop cafe", "train yard",
      "shipyard", "fishing village", "mountain hut", "desert camp", "riverbank",
      "canal street", "rooftop terrace", "courtyard garden", "stone bridge", "ferry dock"
    ]
  },

  scenarios: {
    actions: [
      "reading", "running from", "repairing", "arguing over", "waiting for",
      "discovering", "practicing", "trading secrets about", "fishing for", "climbing",
      "playing", "hiding from", "sharing", "chasing", "training", "building",
      "wandering in search of", "signing", "escaping through", "counting",
      "packing for", "solving", "planting", "delivering", "dancing near",
      "spying from behind", "mending", "sketching", "napping near", "bargaining for",
      "guarding", "following", "trying to remember", "outrunning", "collecting",
      "balancing on", "arguing with", "digging up", "singing to", "painting",
      "folding", "unpacking", "wrapping", "unwrapping", "lighting", "extinguishing",
      "carrying", "dragging", "pushing", "polishing", "sharpening", "assembling",
      "dismantling", "translating", "decoding", "memorizing", "forgetting",
      "searching for", "losing", "finding", "revealing", "whispering about",
      "shouting about", "dreaming of", "remembering", "studying",
      "examining", "measuring", "weighing", "trading", "stealing", "returning",
      "borrowing", "lending", "gifting", "burying", "unearthing", "restoring"
    ],
    subjects: [
      "a letter", "a distant sound", "a broken machine", "a map",
      "a bus that never comes", "a hidden door", "a magic spell", "old secrets",
      "something unusual", "a rope ladder", "a strange instrument", "a coming storm",
      "a meal by candlelight", "a runaway kite", "a wild animal", "a fire",
      "the dark", "a mysterious contract", "an open window", "the stars",
      "a long journey", "a puzzle box", "a garden at midnight", "an urgent message",
      "an empty room", "a curtain", "a torn sail", "a stranger", "an odd corner",
      "a market stall", "a locked door", "footprints in the snow", "a forgotten name",
      "a shadow", "rainwater in jars", "a narrow ledge", "a reflection",
      "a buried treasure", "an old song", "a self-portrait", "a paper crane",
      "a gift", "a candle", "a torch", "a heavy trunk", "an old cart", "a rusty gate",
      "an old blade", "a broken clock", "a tangled net", "a hidden message",
      "a locked box", "a forgotten diary", "an unfinished painting", "a tattered flag",
      "a village map", "a family heirloom", "a strange creature", "a distant light",
      "a fading star", "an old photograph", "an abandoned nest", "a lost glove",
      "a torn page", "an old promise", "a secret handshake", "a hidden staircase",
      "a rare flower", "a glowing stone", "a broken statue", "an old compass",
      "a worn path", "a quiet corner", "a forgotten toy", "an ancient scroll",
      "a sealed letter", "a family recipe"
    ]
  },

  words: {
    qualifiers: [
      "quiet", "sudden", "fading", "distant", "fragile", "aching", "restless", "gentle",
      "fierce", "hollow", "bittersweet", "tender", "silent", "endless", "brief",
      "lingering", "weightless", "burning", "frozen", "drifting", "unspoken",
      "forgotten", "unexpected", "overwhelming", "faint", "sharp", "soft", "deep",
      "shallow", "rising", "falling", "hidden", "open", "buried", "blooming",
      "withering", "sacred", "forbidden", "stolen", "borrowed", "reckless", "careful",
      "patient", "impatient", "wandering", "settled", "unsettled", "familiar",
      "unfamiliar", "raw", "weary", "hopeful", "hopeless", "slow", "quick", "ancient",
      "newborn", "private", "shared", "secret", "open-hearted", "closed-off",
      "trembling", "steady", "uneasy", "calm", "chaotic", "luminous", "shadowed",
      "warm", "cold", "radiant", "dim", "vast", "small", "ordinary", "extraordinary"
    ],
    concepts: [
      "nostalgia", "solitude", "chaos", "wonder", "decay", "resilience", "mischief",
      "serenity", "rebellion", "curiosity", "melancholy", "abundance", "fragility",
      "courage", "isolation", "whimsy", "grit", "transformation", "longing", "mystery",
      "harmony", "urgency", "freedom", "temptation", "growth", "silence",
      "illumination", "entropy", "wanderlust", "defiance", "comfort", "dread",
      "innocence", "ambition", "gratitude", "confusion", "triumph", "stillness",
      "hunger", "devotion", "clarity", "shadow", "warmth", "ruin", "hope", "vanity",
      "patience", "surrender", "wildness", "memory", "grief", "joy", "envy", "trust",
      "betrayal", "wonderment", "awe", "dignity", "shame", "pride", "belonging",
      "exile", "renewal", "ritual", "ceremony", "departure", "arrival", "homecoming",
      "farewell", "discovery", "change", "permanence", "balance", "tension",
      "release", "connection", "distance", "presence", "absence", "time"
    ]
  }
};

// A handful of words don't follow the simple "starts with a vowel letter"
// rule for choosing "a" vs "an" (e.g. "unicorn" sounds like it starts with
// a consonant; "honest" sounds like it starts with a vowel).
const ARTICLE_CONSONANT_SOUND_EXCEPTIONS = ["unicorn", "unique", "one-eyed", "useful", "european"];
const ARTICLE_VOWEL_SOUND_EXCEPTIONS = ["honest", "honor", "hour", "heir"];

function indefiniteArticle(word) {
  const lower = word.toLowerCase();
  if (ARTICLE_CONSONANT_SOUND_EXCEPTIONS.some((w) => lower.startsWith(w))) return "a";
  if (ARTICLE_VOWEL_SOUND_EXCEPTIONS.some((w) => lower.startsWith(w))) return "an";
  return /^[aeiou]/.test(lower) ? "an" : "a";
}

// "{a/an} {modifier} {noun}" — used for objects, things, and scenes.
function buildArticled(modifiers, nouns) {
  const list = [];
  modifiers.forEach((mod) => {
    nouns.forEach((noun) => {
      list.push(`${indefiniteArticle(mod)} ${mod} ${noun}`);
    });
  });
  return list;
}

// "{gerund phrase} {subject phrase}" — subjects already carry their own article.
function buildScenarios(actions, subjects) {
  const list = [];
  actions.forEach((action) => {
    subjects.forEach((subject) => {
      list.push(`${action} ${subject}`);
    });
  });
  return list;
}

// "{qualifier} {concept}" — short mood/theme phrases, e.g. "quiet longing".
function buildWordPhrases(qualifiers, concepts) {
  const list = [];
  qualifiers.forEach((q) => {
    concepts.forEach((c) => {
      list.push(`${q} ${c}`);
    });
  });
  return list;
}

const PROMPT_DATA = {
  words: buildWordPhrases(WORD_BANKS.words.qualifiers, WORD_BANKS.words.concepts),
  scenarios: buildScenarios(WORD_BANKS.scenarios.actions, WORD_BANKS.scenarios.subjects),
  objects: buildArticled(WORD_BANKS.objects.adjectives, WORD_BANKS.objects.nouns),
  things: buildArticled(WORD_BANKS.things.adjectives, WORD_BANKS.things.nouns),
  scenes: buildArticled(WORD_BANKS.scenes.modifiers, WORD_BANKS.scenes.locations)
};

// Sentence templates used to weave categories together into one prompt.
// Placeholders are filled from the matching PROMPT_DATA lists.
const PROMPT_TEMPLATES = [
  "{thing_cap} {scenario} in {scene}.",
  "{thing_cap} in {scene}, surrounded by {object}.",
  "Draw {object}, as if it belongs to {thing}, with a feeling of {word}.",
  "A scene of {word}: {thing} {scenario}.",
  "{object_cap}, abandoned in {scene}.",
  "{thing_cap} {scenario}, clutching {object}.",
  "In {scene}, {thing} is {scenario}.",
  "{thing_cap} and {thing2} {scenario} in {scene}.",
  "{object_cap} sits in {scene}, radiating {word}.",
  "A moment of {word}: {thing} {scenario} near {object}."
];
