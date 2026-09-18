# Sketchbook Prompt Generator

A small, offline-friendly web app that generates text prompts for sketchbook
drawing practice — words, objects, things (creatures/characters), scenarios,
and scenes — plus combined sentence-style prompts.

This is strictly an **idea generator for pencil-and-paper drawing**. It does
not generate, call, or connect to any AI image generation service.

## Features

- Five categories — **Word**, **Object**, **Thing**, **Scenario**, **Scene**
  — each with its own shuffle button, drawn from a shuffle-bag so you won't
  see the same item twice in a row until the list cycles.
- **Full prompt** composer that weaves categories together into a sentence
  using randomized templates (e.g. *"A lighthouse keeper is fishing for
  something unusual in a foggy forest."*).
- **History** of generated prompts and a **Favorites** list, both saved to
  `localStorage` so they persist between sessions on the same device.
- One-click copy to clipboard for any prompt.

## Running it

No build step or server required — just open `index.html` in a browser.

To serve it locally instead:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
index.html        Markup and layout
css/style.css      Styling
js/data.js         Word banks and sentence templates
js/app.js          App logic (shuffle bags, rendering, history/favorites)
```

## Customizing the word banks

Edit the arrays in `js/data.js`. Each category (`words`, `scenarios`,
`objects`, `things`, `scenes`) is a plain list of strings — add, remove, or
edit entries freely. Sentence templates for the combined "Full prompt"
feature live in `PROMPT_TEMPLATES` in the same file, using `{word}`,
`{scenario}`, `{object}` / `{object_cap}`, `{thing}` / `{thing_cap}` /
`{thing2}`, and `{scene}` placeholders.
