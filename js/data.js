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

// ---------------------------------------------------------------------------
// Compatibility system
//
// Cross-multiplying a modifier bank against a noun bank produces some pairs
// that don't make physical or logical sense ("a velvet anchor", "a furry
// librarian", "a tropical glacier", "training a curtain"). Rather than leave
// that to chance, every generated pair is scored against a small set of
// semantic rules below, and only compatible pairs are added to the live
// prompt pool — incompatible ones are filtered out rather than shipped.
// A pair is either compatible (kept) or not (dropped); there's no partial
// credit, since a shuffle bag has no use for "maybe".
// ---------------------------------------------------------------------------

// --- Objects: material adjectives must suit the noun's real-world material ---

const OBJECT_MATERIAL_ADJECTIVES = new Set([
  "wooden", "iron", "brass", "copper", "crystal", "velvet", "silver", "golden",
  "bronze", "marble", "ceramic", "rubber", "leather", "silk", "linen", "porcelain"
]);

// Every other object adjective (condition/size/age/style/magic/optical, e.g.
// "rusty", "giant", "ancient", "glowing") is universal and fits any noun.
// Material adjectives are pickier: a "velvet anchor" or "marble kettle"
// doesn't track, so each noun below lists only the materials it could
// plausibly be made of. An empty list means no material adjective applies —
// the noun is organic (potted cactus), paper-based (scroll), or already
// names its own material (wooden mask, knitted scarf).
const OBJECT_NOUN_MATERIALS = {
  "key": ["iron", "brass", "copper", "silver", "golden", "bronze"],
  "umbrella": ["silk", "linen", "velvet"],
  "book": ["leather", "linen", "velvet", "golden"],
  "teapot": ["porcelain", "ceramic", "brass", "copper", "silver", "iron", "golden"],
  "pocket watch": ["brass", "silver", "golden", "bronze", "copper"],
  "pair of boots": ["leather", "rubber", "velvet"],
  "birdcage": ["iron", "brass", "wooden", "copper", "golden"],
  "lantern": ["iron", "brass", "copper", "crystal", "wooden", "golden"],
  "violin": ["wooden"],
  "chess piece": ["wooden", "marble", "crystal", "ceramic", "golden", "silver"],
  "jar of buttons": ["ceramic", "crystal", "porcelain"],
  "paper crane": [],
  "mirror": ["crystal", "silver", "golden", "brass", "wooden", "iron"],
  "treasure chest": ["wooden", "iron", "brass", "golden", "copper"],
  "spool of thread": ["wooden"],
  "magnifying glass": ["brass", "wooden", "silver", "golden", "iron"],
  "skateboard": ["wooden", "rubber"],
  "typewriter": ["iron", "brass"],
  "potted cactus": [],
  "fishing rod": ["wooden", "brass", "rubber"],
  "compass": ["brass", "silver", "golden", "iron", "copper"],
  "wooden mask": [],
  "hourglass": ["wooden", "brass", "crystal", "golden"],
  "camera": ["brass", "leather", "iron"],
  "suitcase": ["leather", "linen", "velvet"],
  "music box": ["wooden", "brass", "porcelain", "golden"],
  "bicycle": ["iron", "brass", "rubber", "copper"],
  "crown": ["golden", "silver", "bronze", "crystal"],
  "bottle": ["crystal", "ceramic", "porcelain"],
  "pair of glasses": ["golden", "silver", "brass", "rubber"],
  "tarot card": [],
  "robot toy": ["iron", "brass", "rubber", "copper"],
  "sailboat model": ["wooden"],
  "quiver of arrows": ["leather", "wooden"],
  "satchel": ["leather", "linen", "velvet"],
  "lute": ["wooden"],
  "candle holder": ["brass", "iron", "silver", "golden", "crystal", "ceramic"],
  "globe": ["wooden", "brass", "crystal"],
  "anchor": ["iron", "copper", "bronze"],
  "kite": ["silk", "linen", "wooden"],
  "spinning top": ["wooden", "brass", "iron"],
  "hand mirror": ["silver", "golden", "brass", "crystal", "wooden"],
  "sundial": ["brass", "marble", "copper", "iron"],
  "birdhouse": ["wooden"],
  "wheelbarrow": ["wooden", "iron", "rubber"],
  "ladder": ["wooden", "iron", "rubber"],
  "fire hydrant": ["iron", "brass", "copper"],
  "knitted scarf": [],
  "bundle of letters": [],
  "teacup": ["porcelain", "ceramic", "silver", "golden"],
  "kettle": ["iron", "brass", "copper", "ceramic", "silver"],
  "chandelier": ["crystal", "brass", "iron", "golden", "silver"],
  "doorknob": ["brass", "iron", "golden", "silver", "crystal", "ceramic"],
  "padlock": ["iron", "brass", "copper", "silver"],
  "steamer trunk": ["wooden", "leather", "iron", "brass"],
  "wooden drawer": [],
  "vase": ["ceramic", "porcelain", "crystal", "golden", "silver", "marble"],
  "urn": ["ceramic", "marble", "bronze", "golden", "silver"],
  "goblet": ["silver", "golden", "bronze", "crystal", "ceramic"],
  "chalice": ["golden", "silver", "bronze", "crystal"],
  "dagger": ["iron", "silver", "bronze", "golden"],
  "sword": ["iron", "silver", "bronze", "golden"],
  "shield": ["iron", "wooden", "brass", "bronze"],
  "helmet": ["iron", "brass", "bronze", "silver", "golden"],
  "gauntlet": ["iron", "leather", "brass", "bronze"],
  "quill": [],
  "inkwell": ["ceramic", "crystal", "brass", "silver"],
  "scroll": [],
  "folded map": [],
  "telescope": ["brass", "iron", "copper"],
  "pair of binoculars": ["brass", "iron", "rubber"],
  "lantern post": ["iron", "brass", "wooden", "copper"],
  "weathervane": ["iron", "brass", "copper", "bronze", "golden"],
  "gramophone": ["brass", "wooden"],
  "record player": ["wooden", "rubber"],
  "vintage radio": ["wooden", "brass", "rubber"],
  "rotary phone": ["rubber", "iron", "ceramic"],
  "sewing machine": ["iron", "brass", "wooden"],
  "spinning wheel": ["wooden"],
  "loom": ["wooden"],
  "anvil": ["iron", "bronze"],
  "hammer": ["wooden", "iron", "rubber"],
  "wrench": ["iron", "brass", "copper", "rubber"],
  "gear": ["iron", "brass", "copper", "bronze"],
  "pulley": ["iron", "wooden", "brass"],
  "pendulum": ["brass", "iron", "golden", "crystal"],
  "clock face": ["brass", "iron", "wooden", "golden", "porcelain"],
  "thermometer": ["brass", "wooden"],
  "barometer": ["brass", "wooden", "copper"],
  "sextant": ["brass", "iron", "copper"]
};

function isObjectCompatible(adjective, noun) {
  if (!OBJECT_MATERIAL_ADJECTIVES.has(adjective)) return true;
  const allowed = OBJECT_NOUN_MATERIALS[noun];
  return Array.isArray(allowed) && allowed.includes(adjective);
}

// --- Things: anatomical adjectives only suit creatures, not human roles ---

// "winged", "furry", etc. describe non-human anatomy — fine on a fox or a
// dragon, nonsensical on a librarian or a blacksmith. Personality/history
// adjectives ("grumpy", "legendary", "masked", "one-eyed") describe anyone.
const THINGS_ANATOMICAL_ADJECTIVES = new Set([
  "winged", "horned", "scaled", "furry", "feathered", "sharp-toothed", "three-legged"
]);

const THINGS_CREATURE_NOUNS = new Set([
  "cat", "owl", "fox", "turtle", "raven", "hedgehog", "stag", "octopus", "jellyfish",
  "chameleon", "dragon", "griffin", "mermaid", "centaur", "phoenix", "kraken", "unicorn",
  "gnome", "fairy", "golem", "werewolf", "sphinx", "minotaur", "will-o'-the-wisp", "yeti",
  "giant", "talking crow", "clockwork spider", "river spirit"
]);

function isThingCompatible(adjective, noun) {
  if (!THINGS_ANATOMICAL_ADJECTIVES.has(adjective)) return true;
  return THINGS_CREATURE_NOUNS.has(noun);
}

// --- Scenes: climate/water modifiers shouldn't contradict the location ---

const SCENE_CLIMATE_HOT = new Set(["sun-scorched", "tropical", "arid", "sun-drenched"]);
const SCENE_CLIMATE_COLD = new Set(["snow-covered", "frozen", "frost-bitten"]);
const SCENE_CLIMATE_WET = new Set(["underwater", "half-submerged", "waterlogged"]);

const SCENE_COLD_ONLY_LOCATIONS = new Set(["glacier", "frozen lake", "ice cave"]);
const SCENE_ARID_ONLY_LOCATIONS = new Set(["desert oasis", "sand dune", "desert camp", "salt flat"]);

function isSceneCompatible(modifier, location) {
  if (SCENE_CLIMATE_HOT.has(modifier) && SCENE_COLD_ONLY_LOCATIONS.has(location)) return false;
  if (SCENE_CLIMATE_COLD.has(modifier) && SCENE_ARID_ONLY_LOCATIONS.has(location)) return false;
  if (SCENE_CLIMATE_WET.has(modifier) && SCENE_ARID_ONLY_LOCATIONS.has(location)) return false;
  return true;
}

// --- Scenarios: some actions need a physical, or even a living, subject ---

// "polishing", "folding", "carrying" etc. need something with a physical
// form — "polishing a distant sound" doesn't parse. "training" specifically
// needs something alive to train.
const SCENARIO_TOUCH_ACTIONS = new Set([
  "repairing", "mending", "folding", "unpacking", "wrapping", "unwrapping",
  "carrying", "dragging", "pushing", "polishing", "sharpening", "assembling",
  "dismantling", "lighting", "extinguishing", "weighing", "measuring",
  "restoring", "digging up", "unearthing"
]);

const SCENARIO_ANIMATE_ONLY_ACTIONS = new Set(["training"]);

const SCENARIO_ANIMATE_SUBJECTS = new Set(["a wild animal", "a strange creature", "a stranger"]);

const SCENARIO_ABSTRACT_SUBJECTS = new Set([
  "a distant sound", "old secrets", "something unusual", "a coming storm", "the dark",
  "the stars", "a forgotten name", "a shadow", "a secret handshake", "a distant light",
  "a fading star", "an old promise", "a long journey", "a reflection",
  "a bus that never comes", "footprints in the snow", "an empty room",
  "a garden at midnight", "a quiet corner", "an odd corner", "a narrow ledge", "a worn path"
]);

function isScenarioCompatible(action, subject) {
  if (SCENARIO_ANIMATE_ONLY_ACTIONS.has(action)) return SCENARIO_ANIMATE_SUBJECTS.has(subject);
  if (SCENARIO_TOUCH_ACTIONS.has(action)) return !SCENARIO_ABSTRACT_SUBJECTS.has(subject);
  return true;
}

// ---------------------------------------------------------------------------
// Themes
//
// The compatibility system above stops nonsense; themes let someone curate
// the *content* itself — draw only animals, only realistic scenes, and so
// on. Each theme-tagged list below maps a noun/location/subject to the
// theme(s) it fits. Untagged entries (or an empty array) are "neutral":
// everyday items like "a key" or "a teapot" don't belong to any one theme,
// so they stay available no matter what's selected, rather than vanishing
// because they weren't explicitly tagged "realistic".
//
// Only the content-bearing lists (creatures/characters, locations, objects,
// scenario subjects) are tagged. Modifiers/adjectives/verbs and the mood
// "words" category stay theme-agnostic — "ancient", "glowing", or "quiet
// longing" all fit an animal scene as easily as a realistic one.
// ---------------------------------------------------------------------------

const THEMES = [
  { id: "animals", label: "Animals" },
  { id: "people", label: "People" },
  { id: "landscapes", label: "Landscapes" },
  { id: "fantasy", label: "Fantasy" },
  { id: "imaginative", label: "Imaginative" },
  { id: "realistic", label: "Realistic" }
];

const THINGS_NOUN_THEMES = {
  "cat": ["animals"], "owl": ["animals"], "fox": ["animals"], "turtle": ["animals"],
  "raven": ["animals"], "hedgehog": ["animals"], "stag": ["animals"], "octopus": ["animals"],
  "jellyfish": ["animals"], "chameleon": ["animals"],
  "dragon": ["fantasy"], "griffin": ["fantasy"], "mermaid": ["fantasy"], "centaur": ["fantasy"],
  "phoenix": ["fantasy"], "kraken": ["fantasy"], "unicorn": ["fantasy"], "gnome": ["fantasy"],
  "fairy": ["fantasy"], "golem": ["fantasy"], "werewolf": ["fantasy"], "sphinx": ["fantasy"],
  "minotaur": ["fantasy"], "will-o'-the-wisp": ["fantasy"], "yeti": ["fantasy"],
  "giant": ["fantasy"], "talking crow": ["fantasy"], "clockwork spider": ["fantasy"],
  "river spirit": ["fantasy"], "ghost": ["fantasy"],
  "sailor": ["people", "realistic"], "street musician": ["people", "realistic"],
  "knight": ["people", "realistic"], "librarian": ["people", "realistic"],
  "fortune teller": ["people", "fantasy"], "wizard": ["people", "fantasy"],
  "masked vigilante": ["people", "imaginative"], "lighthouse keeper": ["people", "realistic"],
  "merchant": ["people", "realistic"], "circus performer": ["people", "realistic"],
  "robot butler": ["people", "imaginative"], "astronaut": ["people", "imaginative"],
  "detective": ["people", "realistic"], "blacksmith": ["people", "realistic"],
  "beekeeper": ["people", "realistic"], "scarecrow": ["people", "imaginative"],
  "puppet master": ["people", "imaginative"], "time traveler": ["people", "imaginative"],
  "pirate captain": ["people", "imaginative"], "retired superhero": ["people", "imaginative"],
  "tailor": ["people", "realistic"], "cartographer": ["people", "realistic"],
  "apothecary": ["people", "fantasy"], "gravedigger": ["people", "realistic"],
  "innkeeper": ["people", "realistic"], "shepherd": ["people", "realistic"],
  "monk": ["people", "realistic"], "hermit": ["people", "realistic"],
  "jester": ["people", "realistic"], "alchemist": ["people", "fantasy"],
  "falconer": ["people", "realistic"], "potter": ["people", "realistic"],
  "cobbler": ["people", "realistic"], "weaver": ["people", "realistic"],
  "bard": ["people", "realistic"], "ferryman": ["people", "realistic"],
  "gatekeeper": ["people", "realistic"], "watchmaker": ["people", "realistic"],
  "herbalist": ["people", "realistic"], "chimney sweep": ["people", "realistic"],
  "stowaway": ["people", "realistic"], "castaway": ["people", "realistic"],
  "courier": ["people", "realistic"], "scribe": ["people", "realistic"],
  "executioner": ["people", "realistic"], "undertaker": ["people", "realistic"],
  "midwife": ["people", "realistic"], "gardener": ["people", "realistic"],
  "locksmith": ["people", "realistic"], "glassblower": ["people", "realistic"]
};

const SCENE_LOCATION_THEMES = {
  "lighthouse": ["realistic", "landscapes"], "night market": ["realistic", "imaginative"],
  "forest": ["landscapes"], "floating island": ["fantasy", "imaginative"],
  "underwater cave": ["fantasy", "landscapes"], "attic": ["realistic"],
  "desert oasis": ["landscapes"], "rooftop garden": ["realistic", "imaginative"],
  "train station": ["realistic"], "village": ["realistic"], "greenhouse": ["realistic"],
  "carnival": ["imaginative", "realistic"], "library": ["realistic"],
  "shipwreck": ["landscapes", "imaginative"], "monastery": ["realistic", "landscapes"],
  "subway platform": ["realistic"], "witch's cottage": ["fantasy"], "junkyard": ["realistic"],
  "canyon": ["landscapes"], "windmill": ["realistic", "landscapes"], "waterfall": ["landscapes"],
  "city skyline": ["realistic"], "crystal cave": ["fantasy", "landscapes"], "swamp": ["landscapes"],
  "spaceship interior": ["fantasy", "imaginative"], "marketplace": ["realistic"],
  "bunker": ["realistic"], "cherry blossom park": ["landscapes", "realistic"],
  "coastal cliff": ["landscapes"], "study": ["realistic"], "alley": ["realistic"],
  "hot air balloon": ["imaginative"], "ancient ruin": ["fantasy", "landscapes"],
  "frozen lake": ["landscapes"], "bathhouse": ["realistic"], "mountain pass": ["landscapes"],
  "courtyard": ["realistic"], "tidepool": ["landscapes"], "harbor": ["realistic", "landscapes"],
  "bell tower": ["realistic"], "observatory": ["realistic", "imaginative"],
  "greenhouse dome": ["imaginative", "realistic"], "orchard": ["landscapes"],
  "vineyard": ["landscapes"], "quarry": ["landscapes", "realistic"], "mine shaft": ["realistic"],
  "catacomb": ["fantasy"], "chapel": ["realistic"], "monastery garden": ["realistic", "landscapes"],
  "watchtower": ["realistic", "landscapes"], "pier": ["realistic", "landscapes"],
  "boardwalk": ["realistic"], "amphitheater": ["realistic"], "bazaar": ["realistic"],
  "teahouse": ["realistic"], "floating market": ["fantasy", "imaginative"],
  "treehouse": ["imaginative"], "cave system": ["landscapes"], "glacier": ["landscapes"],
  "volcano rim": ["landscapes"], "salt flat": ["landscapes"], "rice terrace": ["landscapes"],
  "bamboo grove": ["landscapes"], "mangrove swamp": ["landscapes"], "sand dune": ["landscapes"],
  "ice cave": ["landscapes", "fantasy"], "hedge maze": ["imaginative", "realistic"],
  "botanical garden": ["realistic", "landscapes"], "rooftop cafe": ["realistic"],
  "train yard": ["realistic"], "shipyard": ["realistic"],
  "fishing village": ["realistic", "landscapes"], "mountain hut": ["realistic", "landscapes"],
  "desert camp": ["realistic", "landscapes"], "riverbank": ["landscapes"],
  "canal street": ["realistic"], "rooftop terrace": ["realistic"],
  "courtyard garden": ["realistic"], "stone bridge": ["realistic", "landscapes"],
  "ferry dock": ["realistic"]
};

// Objects and scenario subjects are mostly theme-neutral props (a key, a
// letter — equally at home in any theme); only the entries with a clear
// genre signal get tagged here.
const OBJECT_NOUN_THEMES = {
  "crown": ["fantasy"], "tarot card": ["fantasy"], "quiver of arrows": ["fantasy"],
  "dagger": ["fantasy"], "sword": ["fantasy"], "shield": ["fantasy"], "helmet": ["fantasy"],
  "gauntlet": ["fantasy"], "chalice": ["fantasy"], "goblet": ["fantasy"], "scroll": ["fantasy"],
  "wooden mask": ["fantasy"],
  "typewriter": ["realistic"], "camera": ["realistic"], "bicycle": ["realistic"],
  "sewing machine": ["realistic"], "rotary phone": ["realistic"], "thermometer": ["realistic"],
  "barometer": ["realistic"], "record player": ["realistic"], "vintage radio": ["realistic"],
  "gramophone": ["realistic"], "telescope": ["realistic"], "pair of binoculars": ["realistic"],
  "sextant": ["realistic"], "anvil": ["realistic"], "wrench": ["realistic"],
  "hammer": ["realistic"], "gear": ["realistic"], "pulley": ["realistic"], "skateboard": ["realistic"],
  "robot toy": ["imaginative"], "music box": ["imaginative"], "hourglass": ["imaginative"],
  "paper crane": ["imaginative"], "spinning top": ["imaginative"], "kite": ["imaginative"],
  "spinning wheel": ["imaginative"], "clock face": ["imaginative"], "pendulum": ["imaginative"],
  "sailboat model": ["imaginative"]
};

const SCENARIO_SUBJECT_THEMES = {
  "a magic spell": ["fantasy"], "a strange creature": ["fantasy"], "an ancient scroll": ["fantasy"],
  "a glowing stone": ["fantasy"], "a fading star": ["fantasy", "imaginative"],
  "a mysterious contract": ["fantasy", "imaginative"],
  "a wild animal": ["animals"],
  "a stranger": ["people"],
  "a letter": ["realistic"], "a broken machine": ["realistic"], "a map": ["realistic"],
  "a bus that never comes": ["realistic"], "an urgent message": ["realistic"],
  "a family recipe": ["realistic"], "a family heirloom": ["realistic"],
  "a village map": ["realistic"], "an old photograph": ["realistic"], "a torn page": ["realistic"],
  "a locked door": ["realistic"], "a market stall": ["realistic"], "a broken clock": ["realistic"],
  "a rusty gate": ["realistic"], "a heavy trunk": ["realistic"], "an old cart": ["realistic"]
};

// A pair passes if the filter is off (nothing selected), the entry is
// neutral (untagged), or it carries at least one of the selected themes.
function themeMatches(tags, selectedThemes) {
  if (!selectedThemes || selectedThemes.length === 0) return true;
  if (!tags || tags.length === 0) return true;
  return tags.some((t) => selectedThemes.includes(t));
}

// Filters a base list by theme, but never returns an empty list: if a theme
// selection happens to match nothing in this particular list (e.g.
// "Landscapes" against the creature-noun list), the filter clearly isn't
// meant for this list, so it falls back to the unfiltered list rather than
// leaving a category with nothing to draw.
function filterByTheme(list, themeMap, selectedThemes) {
  if (!selectedThemes || selectedThemes.length === 0) return list;
  const filtered = list.filter((item) => themeMatches(themeMap[item], selectedThemes));
  return filtered.length > 0 ? filtered : list;
}

// "{a/an} {modifier} {noun}" — used for objects, things, and scenes.
function buildArticled(modifiers, nouns, isCompatible) {
  const list = [];
  modifiers.forEach((mod) => {
    nouns.forEach((noun) => {
      if (isCompatible && !isCompatible(mod, noun)) return;
      list.push(`${indefiniteArticle(mod)} ${mod} ${noun}`);
    });
  });
  return list;
}

// "{gerund phrase} {subject phrase}" — subjects already carry their own article.
function buildScenarios(actions, subjects, isCompatible) {
  const list = [];
  actions.forEach((action) => {
    subjects.forEach((subject) => {
      if (isCompatible && !isCompatible(action, subject)) return;
      list.push(`${action} ${subject}`);
    });
  });
  return list;
}

// "{qualifier} {concept}" — short mood/theme phrases, e.g. "quiet longing".
// Abstract qualifier + abstract concept is essentially always a sensible
// mood phrase, so this category has no compatibility filter.
function buildWordPhrases(qualifiers, concepts) {
  const list = [];
  qualifiers.forEach((q) => {
    concepts.forEach((c) => {
      list.push(`${q} ${c}`);
    });
  });
  return list;
}

// Builds both prompt pools (the compatibility-checked "safe" one and the
// unfiltered "wild" one) for a given set of selected theme ids. Called once
// at load with no themes (everything included), and again any time the
// theme selection changes in Settings.
function buildPromptData(selectedThemes) {
  const thingsNouns = filterByTheme(WORD_BANKS.things.nouns, THINGS_NOUN_THEMES, selectedThemes);
  const sceneLocations = filterByTheme(WORD_BANKS.scenes.locations, SCENE_LOCATION_THEMES, selectedThemes);
  const objectNouns = filterByTheme(WORD_BANKS.objects.nouns, OBJECT_NOUN_THEMES, selectedThemes);
  const scenarioSubjects = filterByTheme(WORD_BANKS.scenarios.subjects, SCENARIO_SUBJECT_THEMES, selectedThemes);

  const words = buildWordPhrases(WORD_BANKS.words.qualifiers, WORD_BANKS.words.concepts);

  // The "safe" pool — every pair has passed the compatibility checks above.
  // This is what the app draws from by default.
  const safe = {
    words,
    scenarios: buildScenarios(WORD_BANKS.scenarios.actions, scenarioSubjects, isScenarioCompatible),
    objects: buildArticled(WORD_BANKS.objects.adjectives, objectNouns, isObjectCompatible),
    things: buildArticled(WORD_BANKS.things.adjectives, thingsNouns, isThingCompatible),
    scenes: buildArticled(WORD_BANKS.scenes.modifiers, sceneLocations, isSceneCompatible)
  };

  // The full, unfiltered cross product — includes every pair the
  // compatibility rules would normally drop ("a velvet anchor", "a tropical
  // glacier"). The "weirdness" slider in Settings controls how often the
  // app pulls from this pool instead of the safe one. Words has no filter
  // to begin with, so its two pools are identical.
  const all = {
    words,
    scenarios: buildScenarios(WORD_BANKS.scenarios.actions, scenarioSubjects),
    objects: buildArticled(WORD_BANKS.objects.adjectives, objectNouns),
    things: buildArticled(WORD_BANKS.things.adjectives, thingsNouns),
    scenes: buildArticled(WORD_BANKS.scenes.modifiers, sceneLocations)
  };

  return { safe, all };
}

// Sentence templates used to weave categories together into one prompt.
// Placeholders are filled from the matching PROMPT_DATA lists. `categories`
// lists which categories must be enabled (in Settings) for this template to
// be eligible, so the composer never has to read the sentence text to figure
// that out.
const PROMPT_TEMPLATES = [
  { text: "{thing_cap} {scenario} in {scene}.", categories: ["things", "scenarios", "scenes"] },
  { text: "{thing_cap} in {scene}, surrounded by {object}.", categories: ["things", "scenes", "objects"] },
  { text: "Draw {object}, as if it belongs to {thing}, with a feeling of {word}.", categories: ["objects", "things", "words"] },
  { text: "A scene of {word}: {thing} {scenario}.", categories: ["words", "things", "scenarios"] },
  { text: "{object_cap}, abandoned in {scene}.", categories: ["objects", "scenes"] },
  { text: "{thing_cap} {scenario}, clutching {object}.", categories: ["things", "scenarios", "objects"] },
  { text: "In {scene}, {thing} is {scenario}.", categories: ["scenes", "things", "scenarios"] },
  { text: "{thing_cap} and {thing2} {scenario} in {scene}.", categories: ["things", "scenarios", "scenes"] },
  { text: "{object_cap} sits in {scene}, radiating {word}.", categories: ["objects", "scenes", "words"] },
  { text: "A moment of {word}: {thing} {scenario} near {object}.", categories: ["words", "things", "scenarios", "objects"] },
  // Single-category fallbacks, so the composer still works when only one
  // or two categories are enabled in Settings.
  { text: "Draw {word}.", categories: ["words"] },
  { text: "Draw {scenario}.", categories: ["scenarios"] },
  { text: "Draw {object}.", categories: ["objects"] },
  { text: "Draw {thing}.", categories: ["things"] },
  { text: "Draw {scene}.", categories: ["scenes"] }
];
