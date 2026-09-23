// Curated cat/dog species+breed lists for the "Guarantee an animal" feature
// (see js/app.js's animal-mode settings and the Species/Breed dropdowns in
// Settings). Compiled from well-established breed-registry (CFA/TICA/AKC/
// FCI) and taxonomic (Felidae/Canidae) references — not generated. Domestic
// cat breed names get " cat" appended at use time (see
// PromptGenerator.phraseForFixedNoun's caller in app.js) since names like
// "Siamese" read as an adjective, not a noun, on their own; dog breeds and
// wild species names are already complete nouns and are used as-is.
const CAT_BREEDS_DOMESTIC = [
  "Abyssinian", "American Bobtail", "American Curl", "American Shorthair", "American Wirehair",
  "Arabian Mau", "Australian Mist", "Bambino", "Bengal", "Birman", "Bombay", "British Longhair",
  "British Shorthair", "Burmese", "Burmilla", "Chantilly-Tiffany", "Chartreux", "Chausie",
  "Cheetoh", "Colorpoint Shorthair", "Cornish Rex", "Cymric", "Devon Rex", "Donskoy",
  "Egyptian Mau", "European Shorthair", "Exotic Shorthair", "German Rex", "Havana Brown",
  "Highlander", "Himalayan", "Japanese Bobtail", "Javanese", "Khao Manee", "Korat",
  "Kurilian Bobtail", "LaPerm", "Maine Coon", "Manx", "Munchkin", "Nebelung",
  "Norwegian Forest Cat", "Ocicat", "Ojos Azules", "Oriental Longhair", "Oriental Shorthair",
  "Persian", "Peterbald", "Pixie-bob", "Ragamuffin", "Ragdoll", "Russian Blue", "Savannah",
  "Scottish Fold", "Scottish Straight", "Selkirk Rex", "Serengeti", "Siamese", "Siberian",
  "Singapura", "Snowshoe", "Sokoke", "Somali", "Sphynx", "Thai", "Tonkinese", "Toyger",
  "Turkish Angora", "Turkish Van"
];

// Lowercase, like every other common animal name in js/data.js ("fox",
// "komodo dragon") — these are common species names, not registered breed
// names, so they don't get kennel-club-style capitalization. The two
// genuine proper nouns (surnames) keep theirs.
const CAT_BREEDS_WILD = [
  "lion", "bengal tiger", "siberian tiger", "jaguar", "leopard", "snow leopard",
  "clouded leopard", "cheetah", "cougar", "eurasian lynx", "canada lynx", "iberian lynx",
  "bobcat", "caracal", "serval", "ocelot", "margay", "oncilla", "Geoffroy's cat",
  "pampas cat", "jaguarundi", "fishing cat", "leopard cat", "asian golden cat",
  "african golden cat", "rusty-spotted cat", "black-footed cat", "sand cat", "Pallas's cat",
  "jungle cat"
];

const DOG_BREEDS_DOMESTIC = [
  "Labrador Retriever", "Golden Retriever", "German Shepherd", "French Bulldog", "Bulldog",
  "Poodle", "Beagle", "Rottweiler", "German Shorthaired Pointer", "Yorkshire Terrier",
  "Boxer", "Dachshund", "Siberian Husky", "Great Dane", "Doberman Pinscher",
  "Australian Shepherd", "Miniature Schnauzer", "Cavalier King Charles Spaniel", "Shih Tzu",
  "Boston Terrier", "Bernese Mountain Dog", "Pomeranian", "Havanese", "English Springer Spaniel",
  "Shetland Sheepdog", "Brittany", "Pembroke Welsh Corgi", "Cocker Spaniel", "Border Collie",
  "Basset Hound", "Chihuahua", "Belgian Malinois", "Vizsla", "Newfoundland", "Weimaraner",
  "Collie", "Akita", "Bloodhound", "Bull Terrier", "Mastiff", "Rhodesian Ridgeback",
  "West Highland White Terrier", "Shiba Inu", "Papillon", "Bichon Frise", "Alaskan Malamute",
  "Great Pyrenees", "Maltese", "Whippet", "Chinese Shar-Pei", "Portuguese Water Dog",
  "Soft Coated Wheaten Terrier", "Cane Corso", "Airedale Terrier", "Dalmatian",
  "Australian Cattle Dog", "Cardigan Welsh Corgi", "Saint Bernard", "Irish Setter", "Pointer",
  "Basenji", "Afghan Hound", "Borzoi", "Greyhound", "Italian Greyhound", "Samoyed",
  "Chow Chow", "Lhasa Apso", "Pekingese", "Pug"
];

const DOG_BREEDS_WILD = [
  "gray wolf", "red wolf", "ethiopian wolf", "coyote", "golden jackal", "black-backed jackal",
  "side-striped jackal", "african wild dog", "dhole", "dingo", "maned wolf", "bush dog",
  "crab-eating fox", "culpeo", "pampas fox", "Darwin's fox", "red fox", "arctic fox",
  "fennec fox", "kit fox", "swift fox", "gray fox", "island fox", "tibetan fox",
  "Blanford's fox", "cape fox", "pale fox", "Rüppell's fox", "bat-eared fox", "raccoon dog"
];

// `all` is what the Breed dropdown lists (plain names, domestic + wild
// mixed) and what "any breed" picks randomly from. `wild` tracks which of
// those names are already complete nouns ("Snow leopard") as opposed to
// adjectival domestic breed names ("Siamese") that need " cat" appended to
// read as a noun phrase — see animalNounPhrase below.
const ANIMAL_BREEDS = {
  cat: { all: CAT_BREEDS_DOMESTIC.concat(CAT_BREEDS_WILD), wild: new Set(CAT_BREEDS_WILD) },
  dog: { all: DOG_BREEDS_DOMESTIC.concat(DOG_BREEDS_WILD), wild: new Set(DOG_BREEDS_WILD) }
};

// Dog breed names and every wild species name are already complete nouns
// ("Labrador Retriever", "Snow leopard"); only domestic cat breed names
// ("Siamese") are adjectival and need " cat" appended to read as one.
function animalNounPhrase(species, name) {
  if (species === "cat" && !ANIMAL_BREEDS.cat.wild.has(name)) return `${name} cat`;
  return name;
}
