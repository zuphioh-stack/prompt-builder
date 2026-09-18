(function () {
  "use strict";

  const CATEGORY_META = {
    words: { label: "Word", icon: "✎" },
    scenarios: { label: "Scenario", icon: "🎬" },
    objects: { label: "Object", icon: "◈" },
    things: { label: "Thing", icon: "☺" },
    scenes: { label: "Scene", icon: "🏔" }
  };

  const STORAGE_KEYS = {
    history: "sketchbook.history",
    favorites: "sketchbook.favorites"
  };

  const MAX_HISTORY = 60;

  /* ---------- Shuffle bags (no immediate repeats until a category is exhausted) ---------- */

  const bags = {};

  function refillBag(category) {
    const items = PROMPT_DATA[category].slice();
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    bags[category] = items;
  }

  function draw(category, exclude) {
    if (!bags[category] || bags[category].length === 0) {
      refillBag(category);
    }
    let value = bags[category].pop();
    if (exclude && value === exclude && bags[category].length > 0) {
      const next = bags[category].pop();
      bags[category].unshift(value);
      value = next;
    }
    return value;
  }

  Object.keys(PROMPT_DATA).forEach(refillBag);

  /* ---------- Current single-card values ---------- */

  const current = {};

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ---------- Rendering single category cards ---------- */

  function renderCard(category) {
    const valueEl = document.querySelector(`#card-${category} .card-value`);
    valueEl.textContent = capitalize(current[category]);
  }

  function generateSingle(category) {
    current[category] = draw(category, current[category]);
    renderCard(category);
  }

  function shuffleAll() {
    Object.keys(PROMPT_DATA).forEach(generateSingle);
  }

  /* ---------- Composed full prompt ---------- */

  function fillTemplate(template) {
    const thing = draw("things");
    let thing2 = draw("things", thing);
    const scenario = draw("scenarios");
    const object = draw("objects");
    const scene = draw("scenes");
    const word = draw("words");

    return template
      .replace(/{thing_cap}/g, capitalize(thing))
      .replace(/{thing2}/g, thing2)
      .replace(/{thing}/g, thing)
      .replace(/{scenario}/g, scenario)
      .replace(/{object_cap}/g, capitalize(object))
      .replace(/{object}/g, object)
      .replace(/{scene}/g, scene)
      .replace(/{word}/g, word);
  }

  function generateFullPrompt() {
    const template = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];
    const text = fillTemplate(template);
    document.getElementById("full-prompt-text").textContent = text;
    document.getElementById("full-prompt-card").dataset.text = text;
    const starBtn = document.getElementById("full-prompt-star");
    starBtn.textContent = isFavorited(text) ? "★ Favorited" : "☆ Favorite";
    addToHistory(text);
  }

  /* ---------- Persistence ---------- */

  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable — history just won't persist */
    }
  }

  let history = load(STORAGE_KEYS.history);
  let favorites = load(STORAGE_KEYS.favorites);

  function addToHistory(text) {
    const entry = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), text };
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    save(STORAGE_KEYS.history, history);
    renderHistory();
  }

  function isFavorited(text) {
    return favorites.some((f) => f.text === text);
  }

  function toggleFavorite(text) {
    if (isFavorited(text)) {
      favorites = favorites.filter((f) => f.text !== text);
    } else {
      favorites.unshift({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), text });
    }
    save(STORAGE_KEYS.favorites, favorites);
    renderHistory();
    renderFavorites();
  }

  function removeFavorite(id) {
    favorites = favorites.filter((f) => f.id !== id);
    save(STORAGE_KEYS.favorites, favorites);
    renderFavorites();
    renderHistory();
  }

  function clearHistory() {
    if (!confirm("Clear all history? Favorites will be kept.")) return;
    history = [];
    save(STORAGE_KEYS.history, history);
    renderHistory();
  }

  function clearFavorites() {
    if (!confirm("Clear all favorites?")) return;
    favorites = [];
    save(STORAGE_KEYS.favorites, favorites);
    renderFavorites();
    renderHistory();
  }

  /* ---------- Clipboard ---------- */

  function copyText(text, btn) {
    const done = () => {
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = original), 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      /* clipboard unavailable */
    }
    document.body.removeChild(ta);
  }

  /* ---------- List rendering ---------- */

  function makeListRow(text, { starred, onStar, onRemove, onCopy }) {
    const row = document.createElement("li");
    row.className = "list-row";

    const span = document.createElement("span");
    span.className = "list-text";
    span.textContent = text;
    row.appendChild(span);

    const actions = document.createElement("div");
    actions.className = "list-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "icon-btn";
    copyBtn.title = "Copy";
    copyBtn.textContent = "⧉";
    copyBtn.addEventListener("click", () => onCopy(copyBtn));
    actions.appendChild(copyBtn);

    if (onStar) {
      const starBtn = document.createElement("button");
      starBtn.className = "icon-btn" + (starred ? " active" : "");
      starBtn.title = starred ? "Unfavorite" : "Favorite";
      starBtn.textContent = starred ? "★" : "☆";
      starBtn.addEventListener("click", onStar);
      actions.appendChild(starBtn);
    }

    if (onRemove) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "icon-btn";
      removeBtn.title = "Remove";
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", onRemove);
      actions.appendChild(removeBtn);
    }

    row.appendChild(actions);
    return row;
  }

  function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";
    if (history.length === 0) {
      list.innerHTML = '<li class="empty">No prompts generated yet.</li>';
      return;
    }
    history.forEach((entry) => {
      const row = makeListRow(entry.text, {
        starred: isFavorited(entry.text),
        onStar: () => toggleFavorite(entry.text),
        onCopy: (btn) => copyText(entry.text, btn)
      });
      list.appendChild(row);
    });
  }

  function renderFavorites() {
    const list = document.getElementById("favorites-list");
    list.innerHTML = "";
    if (favorites.length === 0) {
      list.innerHTML = '<li class="empty">No favorites saved yet.</li>';
      return;
    }
    favorites.forEach((entry) => {
      const row = makeListRow(entry.text, {
        starred: true,
        onStar: () => toggleFavorite(entry.text),
        onRemove: () => removeFavorite(entry.id),
        onCopy: (btn) => copyText(entry.text, btn)
      });
      list.appendChild(row);
    });
  }

  /* ---------- Tabs ---------- */

  function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
        document.getElementById(tab.dataset.target).classList.add("active");
      });
    });
  }

  /* ---------- Init ---------- */

  function buildCategoryCards() {
    const grid = document.getElementById("category-grid");
    Object.keys(CATEGORY_META).forEach((category) => {
      const meta = CATEGORY_META[category];
      const card = document.createElement("div");
      card.className = "card";
      card.id = `card-${category}`;
      card.innerHTML = `
        <div class="card-header">
          <span class="card-icon">${meta.icon}</span>
          <span class="card-label">${meta.label}</span>
        </div>
        <div class="card-value">—</div>
        <button class="card-shuffle" type="button" title="Shuffle ${meta.label}">⟲ Shuffle</button>
      `;
      grid.appendChild(card);
      card.querySelector(".card-shuffle").addEventListener("click", () => generateSingle(category));
    });
  }

  function init() {
    buildCategoryCards();
    shuffleAll();
    initTabs();
    renderHistory();
    renderFavorites();

    document.getElementById("shuffle-all-btn").addEventListener("click", shuffleAll);
    document.getElementById("generate-prompt-btn").addEventListener("click", generateFullPrompt);
    document.getElementById("clear-history-btn").addEventListener("click", clearHistory);
    document.getElementById("clear-favorites-btn").addEventListener("click", clearFavorites);

    document.getElementById("full-prompt-copy").addEventListener("click", (e) => {
      const text = document.getElementById("full-prompt-card").dataset.text || "";
      if (text) copyText(text, e.currentTarget);
    });

    document.getElementById("full-prompt-star").addEventListener("click", (e) => {
      const text = document.getElementById("full-prompt-card").dataset.text || "";
      if (!text) return;
      toggleFavorite(text);
      e.currentTarget.textContent = isFavorited(text) ? "★ Favorited" : "☆ Favorite";
    });

    generateFullPrompt();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
