// Curated color palettes for the optional "Color palette" panel — real,
// well-documented hex combinations (named design-tool palettes, official
// open-source theme specs, and well-known curated sets), not generated or
// guessed at. Each palette: { id, name, tags, hexes }. `tags` drive the
// filter chips in the browse grid; a palette can carry more than one when it
// genuinely spans categories (e.g. warm + retro).
const COLOR_PALETTES = [
  // --- Warm / autumn / earthy ---
  { id: "autumn-woods", name: "Autumn Woods", tags: ["warm"], hexes: ["#582F0E", "#6A040F", "#BC6C25", "#DDA15E", "#FEFAE0"] },
  { id: "harvest-core", name: "Harvest Core", tags: ["warm", "retro"], hexes: ["#C6943E", "#76875A", "#C3542C", "#A55535"] },
  { id: "raw-umber-fields", name: "Raw Umber Fields", tags: ["warm"], hexes: ["#925C2B", "#968037", "#E5CFBA", "#AE5B22", "#8C2517"] },
  { id: "late-fall-ember", name: "Late Fall Ember", tags: ["warm"], hexes: ["#B78B68", "#864F30", "#DD954B", "#AF362B", "#911D20"] },
  { id: "adobe-village", name: "Adobe Village", tags: ["warm", "nature"], hexes: ["#F7E0CC", "#E5B998", "#CF8A5A", "#A55A35", "#70412B"] },

  // --- Cool / ocean / winter ---
  { id: "deep-sea-current", name: "Deep Sea Current", tags: ["cool", "nature"], hexes: ["#003F5C", "#2A9D8F", "#48CAE4", "#90E0C8", "#1B263B"] },
  { id: "ocean-breeze", name: "Ocean Breeze", tags: ["cool"], hexes: ["#0EA5E9", "#06B6D4", "#14B8A6", "#10B981", "#34D399"] },
  { id: "ocean-teal-classic", name: "Ocean Teal Classic", tags: ["cool", "monochrome"], hexes: ["#B2D8D8", "#66B2B2", "#008080", "#006666", "#004C4C"] },
  { id: "nord-frost", name: "Nord Frost", tags: ["cool", "muted"], hexes: ["#8FBCBB", "#88C0D0", "#81A1C1", "#5E81AC"] },
  { id: "cool-winter-frost", name: "Cool Winter Frost", tags: ["cool"], hexes: ["#358AD4", "#2FC9F6", "#BBD2E6", "#EAEFF2", "#D6ECEF"] },

  // --- Pastel / soft ---
  { id: "pastel-rainbow", name: "Pastel Rainbow", tags: ["pastel"], hexes: ["#CC99C9", "#9EC1CF", "#9EE09E", "#FDFD97", "#FEB144", "#FF6663"] },
  { id: "soft-spring", name: "Soft Spring", tags: ["pastel"], hexes: ["#98FF98", "#E6E6FA", "#89CFF0", "#FFDAB9", "#B0E0E6"] },
  { id: "cherry-blossom-soft", name: "Cherry Blossom Soft", tags: ["pastel", "nature"], hexes: ["#FFEFD6", "#FBC9E4", "#FFA3C3", "#ED7B8D", "#999D55"] },
  { id: "baby-pastels", name: "Baby Pastels", tags: ["pastel"], hexes: ["#FFD1DC", "#E6E6FA", "#B2EBB2", "#FFDAB9", "#B0E0E6"] },

  // --- Vibrant / high-saturation ---
  { id: "tropical-sunrise", name: "Tropical Sunrise", tags: ["vibrant", "nature"], hexes: ["#E12729", "#F37324", "#F8CC1B", "#72B043", "#007F4E"] },
  { id: "emerald-spring-whisper", name: "Emerald Spring Whisper", tags: ["vibrant"], hexes: ["#3C9245", "#FCB404", "#F783A3", "#F94315", "#E4E3DB"] },
  { id: "jungle-opal-morning", name: "Jungle Opal Morning", tags: ["vibrant"], hexes: ["#41B97D", "#E7F8BE", "#454545", "#B3F7FE", "#FCC5F8"] },
  { id: "classic-neon", name: "Classic Neon", tags: ["vibrant", "retro"], hexes: ["#FF6EC7", "#39FF14", "#7DF9FF", "#FFFF33", "#FF6700", "#BC13FE"] },

  // --- Muted / dusty / desaturated ---
  { id: "dusty-rose-sage", name: "Dusty Rose & Sage", tags: ["muted"], hexes: ["#F3D1D1", "#E2A0A0", "#D26F6F", "#95B3A2", "#559C82"] },
  { id: "muted-mauve-neutral", name: "Muted Mauve Neutral", tags: ["muted"], hexes: ["#A17F7A", "#CEACA1", "#ECE7E8", "#AAB09D", "#909878"] },
  { id: "sagebrush-oasis", name: "Sagebrush Oasis", tags: ["muted", "nature"], hexes: ["#F2EADC", "#D7D0B4", "#A3B08A", "#6C8A6A", "#3D5045"] },
  { id: "dusty-blue-slate", name: "Dusty Blue Slate", tags: ["muted", "cool"], hexes: ["#A0D2E7", "#81B1D5", "#3D60A7", "#26408B", "#0F084B"] },

  // --- Monochrome / near-monochrome ---
  { id: "monochrome-ocean-blue", name: "Monochrome Ocean Blue", tags: ["monochrome", "cool"], hexes: ["#03045E", "#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"] },
  { id: "sky-blue-steps", name: "Sky Blue Steps", tags: ["monochrome", "cool"], hexes: ["#408AF1", "#5AA2F6", "#78B6FA", "#88CBFA", "#A8D7FA"] },
  { id: "grayscale-classic", name: "Grayscale Classic", tags: ["monochrome"], hexes: ["#EEEEEE", "#CCCCCC", "#999999", "#666666", "#333333", "#000000"] },
  { id: "nord-polar-night", name: "Nord Polar Night", tags: ["monochrome", "dark", "cool"], hexes: ["#2E3440", "#3B4252", "#434C5E", "#4C566A", "#D8DEE9"] },
  { id: "terracotta-monochrome", name: "Terracotta Monochrome", tags: ["monochrome", "warm"], hexes: ["#FBE9E7", "#FFAB91", "#FF7043", "#D84315", "#BF360C"] },

  // --- Dark / moody / night ---
  { id: "dracula", name: "Dracula", tags: ["dark"], hexes: ["#282A36", "#44475A", "#6272A4", "#BD93F9", "#FF79C6", "#F1FA8C"] },
  { id: "gruvbox-dark", name: "Gruvbox Dark", tags: ["dark", "warm"], hexes: ["#1D2021", "#282828", "#3C3836", "#504945", "#665C54", "#D79921"] },
  { id: "night-sky-deep", name: "Night Sky Deep", tags: ["dark", "cool"], hexes: ["#0C152B", "#0C1735", "#1C2657", "#0C1A54", "#14365C"] },
  { id: "starry-night", name: "Starry Night", tags: ["dark"], hexes: ["#151E2F", "#2A3E83", "#6D82B1", "#A3945D", "#FEEB54"] },
  { id: "solarized-dark", name: "Solarized Dark", tags: ["dark", "cool"], hexes: ["#002B36", "#073642", "#586E75", "#268BD2", "#B58900", "#DC322F"] },

  // --- Complementary contrast ---
  { id: "cinematic-teal-orange", name: "Cinematic Teal & Orange", tags: ["complementary"], hexes: ["#0F4C5C", "#127C99", "#FF7A3C", "#FFB25C", "#FFF2E2"] },
  { id: "classic-orange-teal", name: "Classic Orange & Teal", tags: ["complementary"], hexes: ["#FD5901", "#F78104", "#FAAB36", "#249EA0", "#005F60"] },
  { id: "purple-gold-royal", name: "Purple & Gold Royal", tags: ["complementary"], hexes: ["#290849", "#55185D", "#ECB602", "#FFD524"] },
  { id: "violet-butter-soft", name: "Violet & Butter Soft", tags: ["complementary", "pastel"], hexes: ["#5D3F8F", "#B78EDD", "#E1B4E4", "#FCE1A4"] },
  { id: "coral-evergreen", name: "Coral & Evergreen", tags: ["complementary"], hexes: ["#FD7C50", "#FF8559", "#53AA81", "#2F8652", "#006A4D"] },

  // --- Nature-inspired ---
  { id: "forest-canopy", name: "Forest Canopy", tags: ["nature"], hexes: ["#F0FDF4", "#BBF7D0", "#22C55E", "#15803D", "#78350F", "#1C1917"] },
  { id: "pine-moss", name: "Pine & Moss", tags: ["nature", "muted"], hexes: ["#01796F", "#355E3B", "#8A9A5B", "#98A869", "#F5F0E1"] },
  { id: "desert-canyon", name: "Desert Canyon", tags: ["nature", "warm"], hexes: ["#F2E6D0", "#C97C5D", "#C98A2A", "#2E2A27"] },
  { id: "sakura-floral", name: "Sakura Floral", tags: ["nature", "pastel"], hexes: ["#BF8065", "#541F1F", "#901F3B", "#FF92C4", "#FBB7DD"] },
  { id: "sunset-blaze", name: "Sunset Blaze", tags: ["nature", "vibrant", "warm"], hexes: ["#F2C447", "#F76218", "#FF1D68", "#B10065", "#740580"] },
  { id: "coastal-sunset", name: "Coastal Sunset", tags: ["nature", "warm"], hexes: ["#1C6387", "#6F9BB4", "#FFEE95", "#F9C397", "#FE9E38"] },

  // --- Retro / vintage ---
  { id: "groovy-70s", name: "Groovy 70s", tags: ["retro", "warm"], hexes: ["#C6943E", "#76875A", "#C3542C", "#A55535", "#5C3317"] },
  { id: "flat-ui-classic", name: "Flat UI Classic", tags: ["retro", "vibrant"], hexes: ["#1ABC9C", "#2ECC71", "#3498DB", "#9B59B6", "#F1C40F", "#E74C3C"] },
  { id: "vaporwave", name: "Vaporwave", tags: ["retro", "vibrant"], hexes: ["#FF71CE", "#01CDFE", "#05FFA1", "#B967FF", "#FFFB96"] },
  { id: "wes-anderson-budapest", name: "Grand Budapest Hotel", tags: ["retro", "warm"], hexes: ["#F1BB7B", "#FD6467", "#5B1A18", "#D67236"] },
  { id: "wes-anderson-tenenbaums", name: "Royal Tenenbaums", tags: ["retro", "muted"], hexes: ["#899DA4", "#C93312", "#FAEFD1", "#DC863B"] },
  { id: "wes-anderson-moonrise", name: "Moonrise Kingdom", tags: ["retro", "muted"], hexes: ["#F3DF6C", "#CEAB07", "#D5D5D3", "#24281A"] },

  // --- Painter's limited palettes (digital approximations of pigments) ---
  { id: "zorn-palette", name: "Zorn Palette", tags: ["painterly", "muted"], hexes: ["#F3F4F7", "#C18F32", "#E30022", "#231F20"] },
  { id: "split-primary-triad", name: "Split-Primary Triad", tags: ["painterly", "vibrant"], hexes: ["#FDDA0D", "#E30022", "#120A8F", "#FFFFFF"] },

  // --- Dark / moody developer-theme palettes ---
  { id: "catppuccin-mocha", name: "Catppuccin Mocha", tags: ["dark", "muted"], hexes: ["#1E1E2E", "#313244", "#CBA6F7", "#F38BA8", "#A6E3A1", "#89B4FA"] },
  { id: "tokyo-night", name: "Tokyo Night", tags: ["dark", "cool"], hexes: ["#1A1B26", "#24283B", "#3B4261", "#565F89", "#A9B1D6", "#C0CAF5"] },
  { id: "rose-pine-moon", name: "Rosé Pine Moon", tags: ["dark", "muted"], hexes: ["#232136", "#2A273F", "#EB6F92", "#F6C177", "#9CCFD8", "#E0DEF4"] },
  { id: "everforest-dark", name: "Everforest Dark", tags: ["dark", "nature"], hexes: ["#2D353B", "#3D484D", "#A7C080", "#E67E80", "#DBBC7F", "#D3C6AA"] },
  { id: "monokai-classic", name: "Monokai Classic", tags: ["dark", "vibrant"], hexes: ["#272822", "#F92672", "#A6E22E", "#66D9EF", "#FD971F", "#AE81FF"] },
  { id: "atom-one-dark", name: "Atom One Dark", tags: ["dark", "muted"], hexes: ["#282C34", "#ABB2BF", "#E06C75", "#98C379", "#E5C07B", "#61AFEF"] },
  { id: "ayu-dark", name: "Ayu Dark", tags: ["dark", "cool"], hexes: ["#0D1017", "#BFBDB6", "#E6B450", "#39BAE6", "#91B362"] },
  { id: "solarized-light", name: "Solarized Light", tags: ["muted", "warm"], hexes: ["#FDF6E3", "#EEE8D5", "#93A1A1", "#268BD2", "#B58900", "#DC322F"] },
  { id: "gruvbox-light", name: "Gruvbox Light", tags: ["retro", "warm"], hexes: ["#FBF1C7", "#EBDBB2", "#3C3836", "#CC241D", "#98971A", "#D79921"] },
  { id: "blade-runner-2049", name: "Blade Runner 2049", tags: ["dark", "complementary"], hexes: ["#0A0A14", "#153A42", "#027F93", "#23AE9C", "#F78B04", "#A30502"] },

  // --- Film & design movements ---
  { id: "wes-anderson-zissou", name: "The Life Aquatic (Zissou1)", tags: ["cool", "vibrant"], hexes: ["#3B9AB2", "#78B7C5", "#EBCC2A", "#E1AF00", "#F21A00"] },
  { id: "wes-anderson-fantastic-fox", name: "Fantastic Mr Fox", tags: ["warm", "vibrant"], hexes: ["#DD8D29", "#E2D200", "#46ACC8", "#E58601", "#B40F20"] },
  { id: "wes-anderson-isle-of-dogs-1", name: "Isle of Dogs I", tags: ["muted", "dark"], hexes: ["#9986A5", "#79402E", "#CCBA72", "#0F0D0E", "#D9D0D3", "#8D8680"] },
  { id: "wes-anderson-isle-of-dogs-2", name: "Isle of Dogs II", tags: ["warm", "muted"], hexes: ["#EAD3BF", "#AA9486", "#B6854D", "#39312F", "#1C1718"] },
  { id: "wes-anderson-darjeeling", name: "Darjeeling Limited", tags: ["vibrant", "complementary"], hexes: ["#FF0000", "#00A08A", "#F2AD00", "#F98400", "#5BBCD6"] },
  { id: "amelie", name: "Amélie", tags: ["warm", "vibrant"], hexes: ["#DA1F2D", "#F1A71F", "#47B748", "#11743B", "#200C0B"] },
  { id: "bauhaus", name: "Bauhaus", tags: ["vibrant", "retro"], hexes: ["#BE1E2D", "#FFDE17", "#21409A", "#000000", "#FFFFFF"] },
  { id: "art-deco", name: "Art Deco", tags: ["dark", "retro"], hexes: ["#1C1C1C", "#D4AF37", "#005C4A", "#EADAB1"] },
  { id: "memphis-design", name: "Memphis Design", tags: ["vibrant", "retro"], hexes: ["#FBFBFB", "#070707", "#FCC9C4", "#FBD15A", "#CADEFF", "#86CCCA"] },
  { id: "cyberpunk-neon", name: "Cyberpunk Neon", tags: ["vibrant", "dark"], hexes: ["#050505", "#0B0D17", "#00E5FF", "#FF2DAA", "#7C4DFF"] },
  { id: "synthwave", name: "Synthwave", tags: ["vibrant", "retro"], hexes: ["#461E52", "#DD517F", "#E68E36", "#556DC8", "#7998EE"] },

  // --- Painterly / art history ---
  { id: "rembrandt-tenebrism", name: "Rembrandt Tenebrism", tags: ["dark", "painterly"], hexes: ["#F8F4E9", "#C68E17", "#8A3324", "#6E4B3A", "#B22222", "#1C1C1C"] },
  { id: "van-gogh-night-sky", name: "Van Gogh Night Sky", tags: ["dark", "painterly"], hexes: ["#0B1A33", "#1F3E7A", "#4C6394", "#7EA4B0", "#F4DB53", "#E8C468"] },
  { id: "fauvism", name: "Fauvism", tags: ["vibrant", "painterly"], hexes: ["#1B7340", "#E2472D", "#F2C230", "#4B4E9E", "#E85D9E"] },
  { id: "impressionist-monet", name: "Impressionist Monet", tags: ["painterly", "nature"], hexes: ["#5F9E6E", "#3E86A0", "#B081C6", "#FFC72C", "#FF3B30"] },
  { id: "rococo-pastel", name: "Rococo Pastel", tags: ["pastel", "painterly"], hexes: ["#F8E8E7", "#F1C5B8", "#E9A79E", "#B5C7D3", "#D0E0D0", "#D4AF37"] },
  { id: "dutch-golden-age-vermeer", name: "Dutch Golden Age (Vermeer)", tags: ["dark", "painterly"], hexes: ["#1B3A6B", "#C9A227", "#8B1E3F", "#F5F0E1", "#2B2B28"] },
  { id: "ukiyo-e", name: "Ukiyo-e", tags: ["painterly", "muted"], hexes: ["#1E3A5F", "#C93756", "#F6C453", "#1C1C1C", "#F5F0E6"] },
  { id: "zorn-palette-extended", name: "Zorn Palette (Extended)", tags: ["muted", "painterly"], hexes: ["#F5F0E1", "#CC7722", "#A13A2E", "#1C1C1C", "#1F4E7A", "#2E6E5D"] },
  { id: "art-nouveau", name: "Art Nouveau", tags: ["muted", "nature"], hexes: ["#F2EFE5", "#6D8B74", "#3F5F5B", "#8EA6B2", "#9C932F"] },

  // --- Monochrome / gemstone ---
  { id: "amethyst-monochrome", name: "Amethyst Monochrome", tags: ["monochrome", "muted"], hexes: ["#261623", "#673A59", "#97637F", "#B899A1", "#D8CBC6"] },
  { id: "emerald-monochrome", name: "Emerald Monochrome", tags: ["monochrome", "nature"], hexes: ["#062E1F", "#0B3D2E", "#14532D", "#50C878", "#A8E6B0"] },
  { id: "ruby-wine-monochrome", name: "Ruby Wine Monochrome", tags: ["monochrome", "dark"], hexes: ["#2B0A10", "#4A0E17", "#7A1128", "#A11D3A", "#C94F63", "#E8A0AC"] },
  { id: "mustard-gold-monochrome", name: "Mustard Gold Monochrome", tags: ["monochrome", "warm"], hexes: ["#3A2A00", "#6B4E00", "#A67C00", "#D4A017", "#E8C468", "#F5E1A4"] },

  // --- Complementary contrast ---
  { id: "violet-gold-ultraviolet", name: "Violet & Gold (Ultraviolet)", tags: ["complementary", "vibrant"], hexes: ["#2D1B4E", "#7F00FF", "#B98CE0", "#FFD700", "#1A1A1A"] },
  { id: "red-green-classic", name: "Red & Green Classic", tags: ["complementary", "warm"], hexes: ["#7A0C0C", "#C8102E", "#EDE0C8", "#0F5C3C", "#1E7A4C"] },
  { id: "cerulean-vermilion", name: "Cerulean & Vermilion", tags: ["complementary", "painterly"], hexes: ["#163A5F", "#2E6E9E", "#EFE6D8", "#C1440E", "#7A2810"] },
  { id: "magenta-chartreuse", name: "Magenta & Chartreuse", tags: ["complementary", "vibrant"], hexes: ["#FF2DAA", "#7A0B4E", "#0B0B0B", "#B7FF3D", "#4A6B12"] },

  // --- Vibrant / jewel tones ---
  { id: "jewel-tone-gemstones", name: "Jewel Tone Gemstones", tags: ["vibrant", "painterly"], hexes: ["#50C878", "#0F52BA", "#E0115F", "#9966CC", "#FFC87C"] },

  // --- Pastel ---
  { id: "pastel-macaron", name: "Pastel Macaron", tags: ["pastel"], hexes: ["#FDE2E4", "#FAD2E1", "#E2ECE9", "#BEE1E6", "#DFE7FD"] },
  { id: "easter-pastel", name: "Easter Pastel", tags: ["pastel"], hexes: ["#FFD1DC", "#C1E1C1", "#FFF5BA", "#B5D8EB", "#E6C9E8"] },
  { id: "pastel-goth", name: "Pastel Goth", tags: ["pastel", "dark"], hexes: ["#EDDCFF", "#FFEDFE", "#E2FBF9", "#7A7A7A", "#333333"] },

  // --- Retro / seasonal ---
  { id: "seventies-earth-tones", name: "1970s Earth Tones", tags: ["retro", "warm"], hexes: ["#568203", "#D4A017", "#B7410E", "#6B3A6B", "#D4C5A9"] },
  { id: "mid-century-modern", name: "Mid-Century Modern", tags: ["retro", "muted"], hexes: ["#1E4F5A", "#F0E3C4", "#C26D5A", "#7A8A4A", "#FFDA44"] },
  { id: "christmas-classic", name: "Christmas Classic", tags: ["warm", "vibrant"], hexes: ["#BB2528", "#146B3A", "#F8B229", "#EA4630", "#FFF8E7"] },
  { id: "halloween-classic", name: "Halloween Classic", tags: ["vibrant", "dark"], hexes: ["#FF6D01", "#000000", "#902EBB", "#63C328"] }
];
