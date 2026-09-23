# Sketchbook Prompt Generator

A web app that generates text prompts for sketchbook drawing practice —
words, objects, things (creatures/characters), scenarios, and scenes — plus
combined sentence-style prompts. Shared between two people, each with their
own login.

This is strictly an **idea generator for pencil-and-paper drawing**. It does
not generate, call, or connect to any AI image generation service.

The visual style is modeled after warm, hand-crafted generator tools (big
softly-rounded white cards on a cream dot-grid background, a bold clean
sans-serif, solid pill buttons, colorful oval palette swatches) rather than
a cold SaaS dashboard: a warm cream/white/terracotta palette in light mode,
and a warm ember (red/orange/amber — chosen to be easy on the eyes rather
than neon) palette in dark mode, both built from Nunito at heavy weights.
All of it lives in the `:root` / `:root[data-theme="light"]` variable
blocks at the top of `css/style.css` (colors, shadows, radii) plus
`js/icons.js`'s shared icon stroke width — change those to retheme the
whole app.

## Features

- Five categories — **Word**, **Object**, **Thing**, **Scenario**, **Scene**
  — each with its own shuffle button, drawn from a shuffle-bag so you won't
  see the same item twice in a row until the list cycles.
- **Category toggles**, **content themes** (Animals, People, Landscapes,
  Fantasy, Imaginative, Realistic), and a **weirdness slider** to curate
  what gets generated.
- **Full prompt** composer that weaves categories together into a sentence,
  using a coherence bias (not pure chance) so the scene/object/scenario it
  picks tends to share a "world" with whatever thing/creature it just
  picked — see "How generation is curated" below.
- **Focus on the animal/character** toggle — restricts the Full prompt
  composer to sentence structures where the thing/creature is the
  grammatical subject (a character/portrait study), rather than one
  ingredient among several.
- **Add atmospheric detail to scenes** toggle — occasionally appends a small
  curated atmospheric flourish to a scene ("...with dust motes drifting
  through a shaft of light"), in both the Scene card and the Full prompt.
- **Color palette** panel — an independent, optional tool with 51 curated
  color palettes (real named palettes and open-source theme specs, not
  generated hexes) spanning warm, cool, pastel, vibrant, muted, monochrome,
  dark, complementary, nature, retro, and painter's-limited-palette moods.
  Shuffle for a random one or browse and filter the full set. See
  `js/palettes.js`.
- **Shared History, Favorites, and Practice log** — both of you see each
  other's generated prompts, favorites, and sketch entries (including
  attached photos), tagged with who made them. Each person can only edit or
  delete their own entries.
- Dark/light theme toggle.

## Accounts and shared storage

History, favorites, and the practice log (including sketch photos) are
stored in a shared [Supabase](https://supabase.com) project rather than the
browser, so both of you see the same data from any device. Everything else
(color theme, enabled categories, content themes, weirdness, the color
palette panel) is a personal preference and stays local to each browser.

Logging in uses a plain username and password — there's no email involved
from your side. Under the hood, Supabase Auth only understands
email/password, so `js/auth.js` silently maps your username to
`<username>@sketchbook.local` before talking to it. You never see or type
that.

### One-time setup (only needed once, or if you rebuild the backend)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Settings → API**, copy the **Project URL** and **anon public** key
   (never the `service_role` key) into `js/supabase-config.js`.
3. Open the **SQL Editor**, paste in the entire contents of
   `supabase/schema.sql`, and run it. This creates the shared tables, their
   security rules (each person can read everything but only edit their own
   rows), and the private photo storage bucket.
4. In **Authentication → Users → Add user**, create one entry per person.
   For the email field, use `<username>@sketchbook.local` (that domain is
   just a placeholder the login code expects — pick any username you like).
   Set a password, and check "Auto Confirm User" if offered, since that fake
   address can't receive a real confirmation email.

That's it — reload the app and log in with the username (not the fake
email) and password for each account.

## Running it

No build step required — just open `index.html` in a browser, or serve it
locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
index.html              Markup, layout, login screen
css/style.css            Styling (dark/light theme, login screen, shared UI)
js/data.js               Word banks, theme tags, compatibility rules, sentence templates
js/generator.js          Pure generation algorithm (shuffle bags + coherence bias) — no DOM
js/palettes.js           Curated color palette data (51 palettes, tagged by mood)
js/icons.js              Shared inline-SVG icon set
js/supabase-config.js    Project URL / anon key / bucket name — fill these in
js/auth.js               Username-to-email mapping + Supabase Auth wrapper
js/app.js                App logic: UI wiring/rendering and the shared data layer
supabase/schema.sql       Database tables, security rules, and storage bucket
scripts/simulate.js       Node script that runs the generator millions of times to validate it
```

## How generation is curated

Rather than drawing every category completely independently (which tends to
produce grab-bag combinations — a fantasy dragon in a subway platform holding
a typewriter), the Full prompt composer in `js/generator.js`:

1. Draws the thing/creature first.
2. Looks up its theme tags (e.g. a griffin is tagged "fantasy"; a fox is
   tagged "animals") and expands them to related themes via
   `THEME_AFFINITY` in `js/data.js` (fantasy affines with imaginative,
   animals affines with landscapes/realistic, and so on).
3. When drawing the scenario, object, and scene, retries a few plain draws
   looking for one that shares an affinity with the thing's themes,
   preferring a theme-neutral pick (fits anywhere by design) over a
   tagged-but-mismatched one if no direct match turns up.

It's a soft bias, not a hard filter — the weirdness slider's "wild" pool
bypasses it entirely, and even the "safe" pool can still land on a mismatch
if nothing better is on offer, so surprise stays possible. Run
`node scripts/simulate.js` to see this validated at scale: it loads the
actual shipped algorithm (not a reimplementation) and runs several million
generations, reporting pool sizes, the coherence improvement over
independent random draws, grammar (a/an) correctness across the whole
vocabulary, and the back-to-back template-repeat rate.

## Color palette data

The 51 palettes in `js/palettes.js` are real, sourced combinations rather
than generated hexes — named palettes from sites like ColorHunt/Coolors/
SchemeColor/ColorKit, official open-source theme specs (Nord, Solarized,
Dracula, Gruvbox, Flat UI), a few well-documented film/art palettes (Wes
Anderson's `wesanderson` R package, a Van Gogh "Starry Night" extraction),
and two classic limited painter's palettes (the Zorn palette, a split-primary
triad) noted as digital approximations of physical pigments. Each entry has
`tags` (warm, cool, pastel, vibrant, muted, monochrome, dark, complementary,
nature, retro, painterly) used by the browse grid's filter chips — add more
by following the same `{ id, name, tags, hexes }` shape.

## Customizing the word banks

Edit the arrays in `js/data.js`. Each category (`words`, `scenarios`,
`objects`, `things`, `scenes`) is built from smaller adjective/noun-style
lists — add, remove, or edit entries freely. Theme tags
(`THINGS_NOUN_THEMES`, `SCENE_LOCATION_THEMES`, etc.) and compatibility
rules live in the same file. Sentence templates for the combined "Full
prompt" feature live in `PROMPT_TEMPLATES`, using `{word}`, `{scenario}`,
`{object}` / `{object_cap}`, `{thing}` / `{thing_cap}` / `{thing2}`, and
`{scene}` placeholders. Add `focal: "thing"` to a template if the
thing/creature is its grammatical subject — that's what "Focus on the
animal/character" filters to. After editing word banks or templates, run
`node scripts/simulate.js` to re-validate pool sizes and grammar at scale.

## Security notes

- The Supabase **anon** key in `js/supabase-config.js` is meant to be
  public — it ships in every Supabase project's client code and only grants
  what the Row Level Security policies in `supabase/schema.sql` allow.
  Never put the `service_role` key here or anywhere client-side.
- There's no public sign-up form by design — the only way to create an
  account is manually, via the Supabase dashboard. That keeps this a
  2-person tool rather than an open registration endpoint.
