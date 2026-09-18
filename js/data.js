// Word banks for the sketchbook prompt generator.
// Purely text-based drawing prompts — nothing here is meant for AI image generation.

const PROMPT_DATA = {
  words: [
    "nostalgia", "solitude", "chaos", "wonder", "decay", "resilience", "mischief",
    "serenity", "rebellion", "curiosity", "melancholy", "abundance", "fragility",
    "courage", "isolation", "whimsy", "grit", "transformation", "longing",
    "mystery", "harmony", "urgency", "freedom", "temptation", "growth", "silence",
    "illumination", "entropy", "wanderlust", "defiance", "comfort", "dread",
    "innocence", "ambition", "gratitude", "confusion", "triumph", "stillness",
    "hunger", "devotion", "restlessness", "clarity", "shadow", "warmth", "ruin",
    "hope", "vanity", "patience", "surrender", "wildness"
  ],

  scenarios: [
    "quietly reading a letter", "running from something unseen",
    "repairing a broken machine", "having a picnic in the rain",
    "arguing over a map", "waiting for a bus that never comes",
    "discovering a hidden door", "practicing a magic spell",
    "trading secrets in whispers", "fishing for something unusual",
    "climbing a rickety ladder", "playing a strange instrument",
    "hiding from a storm", "sharing a meal by candlelight",
    "chasing a runaway kite", "training a wild animal", "building a fire",
    "getting lost in the dark", "signing a mysterious contract",
    "escaping through a window", "counting stars",
    "packing for a long journey", "solving a puzzle box",
    "planting a garden at midnight", "delivering an urgent message",
    "dancing alone in an empty room", "spying from behind a curtain",
    "mending a torn sail", "sketching a stranger", "napping in an odd place",
    "bargaining at a market stall", "reading a map upside down",
    "hiding a secret in plain sight", "balancing on a narrow ledge",
    "arguing with a reflection", "collecting rain in jars",
    "following footprints in the snow", "guarding a locked door",
    "trying to remember a forgotten name", "outrunning a shadow"
  ],

  objects: [
    "a rusty key", "a broken umbrella", "a stack of old books", "a teapot",
    "a pocket watch", "a pair of worn boots", "a birdcage", "a lantern",
    "a violin", "a chess piece", "a jar of buttons", "a folded paper crane",
    "a cracked mirror", "a treasure chest", "a spool of thread",
    "a magnifying glass", "a skateboard", "a typewriter", "a potted cactus",
    "a fishing rod", "a paper lantern", "a compass", "a wooden mask",
    "an hourglass", "a stack of pancakes", "a vintage camera",
    "a suitcase covered in stickers", "a music box", "a bicycle with a basket",
    "a crown", "a bottle with a message inside", "a pair of glasses",
    "a deck of tarot cards", "a wind-up robot toy", "a jar of fireflies",
    "a sailboat model", "a quiver of arrows", "a satchel", "a lute",
    "a candle holder", "a globe", "an anchor", "a kite", "a spinning top",
    "a hand mirror", "a sundial", "a birdhouse", "a wheelbarrow", "a ladder",
    "a fire hydrant", "a knitted scarf", "a stack of letters tied with string"
  ],

  things: [
    "a sleepy cat", "an owl", "a fox", "a turtle", "a raven", "a hedgehog",
    "a stag", "an octopus", "a jellyfish", "a chameleon", "a dragon",
    "a griffin", "a mermaid", "a centaur", "a phoenix", "a kraken",
    "a unicorn", "a gnome", "a fairy", "a golem", "a werewolf", "a sphinx",
    "a minotaur", "a will-o'-the-wisp", "a yeti", "an old sailor",
    "a street musician", "a knight in mismatched armor", "a tired librarian",
    "a fortune teller", "a clumsy wizard", "a masked vigilante",
    "a lighthouse keeper", "a traveling merchant", "a circus performer",
    "a robot butler", "an astronaut", "a detective", "a blacksmith",
    "a beekeeper", "a scarecrow come to life", "a puppet master", "a ghost",
    "a time traveler", "a pirate captain", "a shy giant", "a talking crow",
    "a clockwork spider", "a river spirit", "a retired superhero"
  ],

  scenes: [
    "an abandoned lighthouse", "a bustling night market", "a foggy forest",
    "a floating island", "an underwater cave", "a cluttered attic",
    "a desert oasis", "a rooftop garden", "a train station at dawn",
    "a snow-covered village", "a greenhouse full of overgrown plants",
    "a carnival after closing", "a library with impossibly tall shelves",
    "a shipwreck on a beach", "a mountain monastery", "a subway platform",
    "a witch's cottage", "a junkyard", "a canyon at sunset", "an old windmill",
    "a hidden waterfall", "a city rooftop at night", "a cave full of crystals",
    "a swamp with twisted trees", "a spaceship interior",
    "a medieval marketplace", "an underground bunker",
    "a cherry blossom park", "a coastal cliff", "a candlelit study",
    "a rain-soaked alley", "a hot air balloon basket", "an overgrown ruin",
    "a frozen lake", "a bathhouse", "a greenhouse at midnight",
    "a narrow mountain pass", "a quiet monastery courtyard", "a tidepool",
    "a rooftop during a storm"
  ]
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
