# Sketchbook Prompt Generator

A web app that generates text prompts for sketchbook drawing practice —
words, objects, things (creatures/characters), scenarios, and scenes — plus
combined sentence-style prompts. Shared between two people, each with their
own login.

This is strictly an **idea generator for pencil-and-paper drawing**. It does
not generate, call, or connect to any AI image generation service.

## Features

- Five categories — **Word**, **Object**, **Thing**, **Scenario**, **Scene**
  — each with its own shuffle button, drawn from a shuffle-bag so you won't
  see the same item twice in a row until the list cycles.
- **Category toggles**, **content themes** (Animals, People, Landscapes,
  Fantasy, Imaginative, Realistic), and a **weirdness slider** to curate
  what gets generated.
- **Full prompt** composer that weaves categories together into a sentence
  using randomized templates.
- **Shared History, Favorites, and Practice log** — both of you see each
  other's generated prompts, favorites, and sketch entries (including
  attached photos), tagged with who made them. Each person can only edit or
  delete their own entries.
- Dark/light theme toggle.

## Accounts and shared storage

History, favorites, and the practice log (including sketch photos) are
stored in a shared [Supabase](https://supabase.com) project rather than the
browser, so both of you see the same data from any device. Everything else
(color theme, enabled categories, content themes, weirdness) is a personal
preference and stays local to each browser.

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
js/icons.js              Shared inline-SVG icon set
js/supabase-config.js    Project URL / anon key / bucket name — fill these in
js/auth.js               Username-to-email mapping + Supabase Auth wrapper
js/app.js                App logic: generation, UI, and the shared data layer
supabase/schema.sql       Database tables, security rules, and storage bucket
```

## Customizing the word banks

Edit the arrays in `js/data.js`. Each category (`words`, `scenarios`,
`objects`, `things`, `scenes`) is built from smaller adjective/noun-style
lists — add, remove, or edit entries freely. Theme tags
(`THINGS_NOUN_THEMES`, `SCENE_LOCATION_THEMES`, etc.) and compatibility
rules live in the same file. Sentence templates for the combined "Full
prompt" feature live in `PROMPT_TEMPLATES`, using `{word}`, `{scenario}`,
`{object}` / `{object_cap}`, `{thing}` / `{thing_cap}` / `{thing2}`, and
`{scene}` placeholders.

## Security notes

- The Supabase **anon** key in `js/supabase-config.js` is meant to be
  public — it ships in every Supabase project's client code and only grants
  what the Row Level Security policies in `supabase/schema.sql` allow.
  Never put the `service_role` key here or anywhere client-side.
- There's no public sign-up form by design — the only way to create an
  account is manually, via the Supabase dashboard. That keeps this a
  2-person tool rather than an open registration endpoint.
