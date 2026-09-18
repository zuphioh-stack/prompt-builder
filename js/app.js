(function () {
  "use strict";

  // All categories share the same accent color (set in CSS) rather than
  // each getting its own hue — one restrained palette instead of a rainbow.
  const CATEGORY_META = {
    words: { label: "Word", icon: "categoryWord" },
    scenarios: { label: "Scenario", icon: "categoryScenario" },
    objects: { label: "Object", icon: "categoryObject" },
    things: { label: "Thing", icon: "categoryThing" },
    scenes: { label: "Scene", icon: "categoryScene" }
  };

  const STORAGE_KEYS = {
    history: "sketchbook.history",
    favorites: "sketchbook.favorites",
    settings: "sketchbook.settings",
    practice: "sketchbook.practice",
    theme: "sketchbook.theme"
  };

  const MAX_HISTORY = 60;
  const MAX_PRACTICE_ENTRIES = 200;
  const PHOTO_MAX_DIMENSION = 480;
  const PHOTO_QUALITY = 0.6;

  /* ---------- Persistence helpers ---------- */

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- Theme (dark by default, with a manual light-mode toggle) ---------- */

  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.innerHTML = theme === "light" ? ICONS.moon : ICONS.sun;
  }

  function initTheme() {
    const stored = load(STORAGE_KEYS.theme, "dark");
    applyTheme(stored);
    document.getElementById("theme-toggle").addEventListener("click", (e) => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const next = isLight ? "dark" : "light";
      applyTheme(next);
      save(STORAGE_KEYS.theme, next);
      replayAnimation(e.currentTarget, "spin-once");
    });
  }

  /* ---------- Settings (category toggles + content themes + weirdness) ---------- */

  const settings = Object.assign(
    {
      categories: { words: true, scenarios: true, objects: true, things: true, scenes: true },
      themes: [],
      weirdness: 0
    },
    load(STORAGE_KEYS.settings, {})
  );
  settings.categories = Object.assign(
    { words: true, scenarios: true, objects: true, things: true, scenes: true },
    settings.categories
  );
  if (!Array.isArray(settings.themes)) settings.themes = [];

  function saveSettings() {
    save(STORAGE_KEYS.settings, settings);
  }

  function isCategoryEnabled(category) {
    return settings.categories[category] !== false;
  }

  function enabledCategoryCount() {
    return Object.keys(CATEGORY_META).filter(isCategoryEnabled).length;
  }

  function isThemeSelected(themeId) {
    return settings.themes.includes(themeId);
  }

  /* ---------- Shuffle bags — one "safe" pool, one "wild" (unfiltered) pool ---------- */
  // Each draw independently rolls against the weirdness setting to decide
  // which pool to pull from, so the mix of sensible vs. surprising results
  // matches the slider on average without needing to rebuild anything.
  // The pools themselves (promptData) get rebuilt from scratch whenever the
  // selected content themes change — see rebuildPromptData().

  let promptData = buildPromptData(settings.themes);
  const bags = { safe: {}, all: {} };

  function poolFor(kind, category) {
    return kind === "all" ? promptData.all[category] : promptData.safe[category];
  }

  function rebuildPromptData() {
    promptData = buildPromptData(settings.themes);
    bags.safe = {};
    bags.all = {};
    Object.keys(CATEGORY_META).forEach((category) => {
      if (isCategoryEnabled(category)) generateSingle(category);
    });
  }

  function refillBag(kind, category) {
    const items = poolFor(kind, category).slice();
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    bags[kind][category] = items;
  }

  function draw(category, exclude) {
    const kind = Math.random() * 100 < settings.weirdness ? "all" : "safe";
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

  /* ---------- Current single-card values ---------- */

  const current = {};

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // (re)plays a CSS animation class on an element, even if it's already
  // present (e.g. clicking "Shuffle" twice fast) — removing the class,
  // forcing a reflow, then re-adding it restarts the animation from scratch.
  function replayAnimation(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  /* ---------- Rendering single category cards ---------- */

  function renderCard(category) {
    const valueEl = document.querySelector(`#card-${category} .card-value`);
    valueEl.textContent = current[category] ? capitalize(current[category]) : "—";
    replayAnimation(valueEl, "pop");
  }

  function generateSingle(category) {
    if (!isCategoryEnabled(category)) return;
    current[category] = draw(category, current[category]);
    renderCard(category);
  }

  function shuffleAll() {
    Object.keys(CATEGORY_META).forEach(generateSingle);
  }

  function applyCategoryEnabledState() {
    Object.keys(CATEGORY_META).forEach((category) => {
      const card = document.getElementById(`card-${category}`);
      const toggle = document.getElementById(`toggle-${category}`);
      const enabled = isCategoryEnabled(category);
      if (card) {
        card.classList.toggle("disabled", !enabled);
        const shuffleBtn = card.querySelector(".card-shuffle");
        if (shuffleBtn) shuffleBtn.disabled = !enabled;
        if (enabled && !current[category]) generateSingle(category);
      }
      if (toggle) {
        toggle.checked = enabled;
        toggle.closest(".toggle-chip").classList.toggle("checked", enabled);
      }
    });
    refreshFullPromptAvailability();
  }

  /* ---------- Composed full prompt ---------- */

  function eligibleTemplates() {
    return PROMPT_TEMPLATES.filter((tpl) => tpl.categories.every(isCategoryEnabled));
  }

  // Prefer templates that weave multiple categories together; the
  // single-category "Draw {x}." templates only come into play when nothing
  // richer is available (i.e. very few categories are enabled).
  function templatesToUse() {
    const eligible = eligibleTemplates();
    const rich = eligible.filter((tpl) => tpl.categories.length > 1);
    return rich.length > 0 ? rich : eligible;
  }

  function refreshFullPromptAvailability() {
    const hasTemplates = eligibleTemplates().length > 0;
    document.getElementById("generate-prompt-btn").disabled = !hasTemplates;
    document.getElementById("full-prompt-text").style.display = hasTemplates ? "" : "none";
    document.getElementById("full-prompt-empty-message").style.display = hasTemplates ? "none" : "";
  }

  function fillTemplate(templateText) {
    const thing = draw("things");
    const thing2 = draw("things", thing);
    const scenario = draw("scenarios");
    const object = draw("objects");
    const scene = draw("scenes");
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

  const GENERATE_SPIN_MS = 480;

  function generateFullPrompt() {
    const templates = templatesToUse();
    if (templates.length === 0) {
      refreshFullPromptAvailability();
      return;
    }
    const template = templates[Math.floor(Math.random() * templates.length)];
    const text = fillTemplate(template.text);
    const textEl = document.getElementById("full-prompt-text");
    const generateBtn = document.getElementById("generate-prompt-btn");
    const iconEl = generateBtn.querySelector(".btn-icon");

    // A brief, deliberate "generating" beat — the icon spins and the old
    // text fades while the new prompt (already picked above) waits to be
    // revealed, so clicking always feels like something happened.
    generateBtn.disabled = true;
    iconEl.innerHTML = ICONS.spinner;
    iconEl.classList.add("spin-loop");
    textEl.classList.add("fade-out");

    setTimeout(() => {
      textEl.textContent = text;
      textEl.classList.remove("fade-out");
      iconEl.classList.remove("spin-loop");
      iconEl.innerHTML = ICONS.pencil;
      generateBtn.disabled = false;
    }, GENERATE_SPIN_MS);

    document.getElementById("full-prompt-card").dataset.text = text;
    const starBtn = document.getElementById("full-prompt-star");
    setButtonContent(starBtn, isFavorited(text) ? "starFilled" : "starOutline", isFavorited(text) ? "Favorited" : "Favorite");
    starBtn.classList.toggle("active", isFavorited(text));
    addToHistory(text);
  }

  /* ---------- History / favorites ---------- */

  let history = load(STORAGE_KEYS.history, []);
  let favorites = load(STORAGE_KEYS.favorites, []);

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

  /* ---------- Practice log (streaks + optional photos) ---------- */

  let practiceLog = load(STORAGE_KEYS.practice, []);

  function todayKey() {
    return formatDateKey(new Date());
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function addPracticeEntry(text, photo) {
    const entry = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      text,
      date: todayKey(),
      timestamp: Date.now(),
      photo: photo || null
    };
    practiceLog.unshift(entry);
    if (practiceLog.length > MAX_PRACTICE_ENTRIES) practiceLog.length = MAX_PRACTICE_ENTRIES;
    if (!save(STORAGE_KEYS.practice, practiceLog)) {
      // Likely a storage quota hit from photos — drop the oldest few and retry once.
      practiceLog.splice(-10, 10);
      save(STORAGE_KEYS.practice, practiceLog);
    }
    renderPractice();
    renderHistory();
    renderFavorites();
  }

  function removePracticeEntry(id) {
    practiceLog = practiceLog.filter((e) => e.id !== id);
    save(STORAGE_KEYS.practice, practiceLog);
    renderPractice();
    renderHistory();
    renderFavorites();
  }

  function clearPractice() {
    if (!confirm("Clear your entire sketch log, including photos and streaks?")) return;
    practiceLog = [];
    save(STORAGE_KEYS.practice, practiceLog);
    renderPractice();
    renderHistory();
    renderFavorites();
  }

  function hasBeenSketched(text) {
    return practiceLog.some((e) => e.text === text);
  }

  function computeStreaks() {
    const dates = new Set(practiceLog.map((e) => e.date));
    let current = 0;
    const cursor = new Date();
    if (!dates.has(formatDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (dates.has(formatDateKey(cursor))) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const sorted = Array.from(dates).sort();
    let best = 0;
    let run = 0;
    let prev = null;
    sorted.forEach((dateStr) => {
      if (prev) {
        const prevDate = new Date(prev);
        prevDate.setDate(prevDate.getDate() + 1);
        run = formatDateKey(prevDate) === dateStr ? run + 1 : 1;
      } else {
        run = 1;
      }
      best = Math.max(best, run);
      prev = dateStr;
    });

    return { current, best: Math.max(best, current), totalDays: dates.size, totalEntries: practiceLog.length };
  }

  function renderPracticeStats() {
    const stats = computeStreaks();
    const el = document.getElementById("practice-stats");
    el.innerHTML = `
      <div class="stat-tile"><span class="stat-value">${stats.current}</span><span class="stat-label">day streak</span></div>
      <div class="stat-tile"><span class="stat-value">${stats.best}</span><span class="stat-label">best streak</span></div>
      <div class="stat-tile"><span class="stat-value">${stats.totalDays}</span><span class="stat-label">days practiced</span></div>
      <div class="stat-tile"><span class="stat-value">${stats.totalEntries}</span><span class="stat-label">sketches logged</span></div>
    `;
  }

  function renderPracticeHeatmap() {
    const counts = {};
    practiceLog.forEach((e) => {
      counts[e.date] = (counts[e.date] || 0) + 1;
    });

    const weeks = 14;
    const container = document.getElementById("practice-heatmap");
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${weeks}, 1fr)`;

    const today = new Date();
    const totalDays = weeks * 7;
    // Align columns to calendar weeks (row 0 = Sunday) so today lands in the
    // last column, at the row matching its weekday.
    const todaySunday = new Date(today);
    todaySunday.setDate(today.getDate() - today.getDay());
    const start = new Date(todaySunday);
    start.setDate(todaySunday.getDate() - (weeks - 1) * 7);

    const cells = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      cells.push(d);
    }

    cells.forEach((date) => {
      const key = formatDateKey(date);
      const count = counts[key] || 0;
      const cell = document.createElement("div");
      cell.className = "heatmap-cell";
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count >= 3) level = 3;
      cell.dataset.level = String(level);
      cell.title = `${key}: ${count} sketch${count === 1 ? "" : "es"}`;
      container.appendChild(cell);
    });
  }

  function renderPracticeGallery() {
    const list = document.getElementById("practice-list");
    list.innerHTML = "";
    if (practiceLog.length === 0) {
      list.innerHTML = '<li class="empty">Nothing logged yet — mark a prompt as sketched to start your streak.</li>';
      return;
    }
    practiceLog.forEach((entry) => {
      const row = document.createElement("li");
      row.className = "list-row practice-row";

      if (entry.photo) {
        const img = document.createElement("img");
        img.className = "practice-thumb";
        img.src = entry.photo;
        img.alt = "Sketch for: " + entry.text;
        row.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "practice-thumb practice-thumb-empty";
        placeholder.innerHTML = ICONS.pencil;
        row.appendChild(placeholder);
      }

      const info = document.createElement("div");
      info.className = "practice-info";
      const text = document.createElement("span");
      text.className = "list-text";
      text.textContent = entry.text;
      const date = document.createElement("span");
      date.className = "practice-date";
      date.textContent = entry.date;
      info.appendChild(text);
      info.appendChild(date);
      row.appendChild(info);

      const removeBtn = document.createElement("button");
      removeBtn.className = "icon-btn";
      removeBtn.title = "Remove";
      removeBtn.setAttribute("aria-label", "Remove");
      removeBtn.innerHTML = ICONS.close;
      removeBtn.addEventListener("click", () => removePracticeEntry(entry.id));
      row.appendChild(removeBtn);

      list.appendChild(row);
    });
  }

  function renderPractice() {
    renderPracticeStats();
    renderPracticeHeatmap();
    renderPracticeGallery();
  }

  function compressImage(file, maxDimension, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxDimension) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  let pendingPhotoText = null;

  function requestPhotoFor(text) {
    pendingPhotoText = text;
    document.getElementById("practice-photo-input").click();
  }

  /* ---------- Clipboard ---------- */

  function setButtonContent(btn, iconName, label) {
    btn.innerHTML = `<span class="btn-icon">${ICONS[iconName]}</span>${label}`;
  }

  function flashIcon(btn, iconName, duration) {
    const original = btn.innerHTML;
    btn.innerHTML = ICONS[iconName];
    setTimeout(() => {
      btn.innerHTML = original;
    }, duration || 1200);
  }

  function flashButtonContent(btn, iconName, label, duration) {
    const original = btn.innerHTML;
    setButtonContent(btn, iconName, label);
    setTimeout(() => {
      btn.innerHTML = original;
    }, duration || 1200);
  }

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(() => fallbackCopy(text, onDone));
    } else {
      fallbackCopy(text, onDone);
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

  /* ---------- List rendering (History / Favorites) ---------- */

  function makeListRow(text, { starred, onStar, onRemove, onCopy, sketched, onSketch, onPhoto }) {
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
    copyBtn.setAttribute("aria-label", "Copy");
    copyBtn.innerHTML = ICONS.copy;
    copyBtn.addEventListener("click", () => onCopy(copyBtn));
    actions.appendChild(copyBtn);

    if (onSketch) {
      const sketchBtn = document.createElement("button");
      sketchBtn.className = "icon-btn" + (sketched ? " active" : "");
      sketchBtn.title = sketched ? "Logged as sketched" : "Mark as sketched";
      sketchBtn.setAttribute("aria-label", sketchBtn.title);
      sketchBtn.innerHTML = ICONS.check;
      sketchBtn.addEventListener("click", onSketch);
      actions.appendChild(sketchBtn);
    }

    if (onPhoto) {
      const photoBtn = document.createElement("button");
      photoBtn.className = "icon-btn";
      photoBtn.title = "Attach a photo of your sketch";
      photoBtn.setAttribute("aria-label", photoBtn.title);
      photoBtn.innerHTML = ICONS.camera;
      photoBtn.addEventListener("click", onPhoto);
      actions.appendChild(photoBtn);
    }

    if (onStar) {
      const starBtn = document.createElement("button");
      starBtn.className = "icon-btn" + (starred ? " active" : "");
      starBtn.title = starred ? "Unfavorite" : "Favorite";
      starBtn.setAttribute("aria-label", starBtn.title);
      starBtn.innerHTML = starred ? ICONS.starFilled : ICONS.starOutline;
      starBtn.addEventListener("click", () => {
        onStar();
        if (isFavorited(text)) replayAnimation(starBtn, "star-pop");
      });
      actions.appendChild(starBtn);
    }

    if (onRemove) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "icon-btn";
      removeBtn.title = "Remove";
      removeBtn.setAttribute("aria-label", "Remove");
      removeBtn.innerHTML = ICONS.close;
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
        onCopy: (btn) => copyText(entry.text, () => flashIcon(btn, "check")),
        sketched: hasBeenSketched(entry.text),
        onSketch: () => addPracticeEntry(entry.text, null),
        onPhoto: () => requestPhotoFor(entry.text)
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
        onCopy: (btn) => copyText(entry.text, () => flashIcon(btn, "check")),
        sketched: hasBeenSketched(entry.text),
        onSketch: () => addPracticeEntry(entry.text, null),
        onPhoto: () => requestPhotoFor(entry.text)
      });
      list.appendChild(row);
    });
  }

  /* ---------- Tabs ---------- */

  function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const indicator = document.getElementById("tab-indicator");

    function moveIndicator(tab) {
      if (!indicator) return;
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.left = `${tab.offsetLeft}px`;
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
        document.getElementById(tab.dataset.target).classList.add("active");
        moveIndicator(tab);
      });
    });

    const activeTab = document.querySelector(".tab-btn.active");
    if (activeTab) moveIndicator(activeTab);
    window.addEventListener("resize", () => {
      const active = document.querySelector(".tab-btn.active");
      if (active) moveIndicator(active);
    });
  }

  /* ---------- Settings UI ---------- */

  function weirdnessDescription(value) {
    if (value === 0) return "Sensible combos only";
    if (value <= 25) return "Mostly sensible, occasional surprise";
    if (value <= 60) return "Frequent unexpected combos";
    return "Anything goes";
  }

  function buildCategoryToggles() {
    const wrap = document.getElementById("category-toggles");
    Object.keys(CATEGORY_META).forEach((category) => {
      const meta = CATEGORY_META[category];
      const label = document.createElement("label");
      label.className = "toggle-chip";
      label.innerHTML = `
        <input type="checkbox" id="toggle-${category}" checked />
        <span class="toggle-chip-icon">${ICONS[meta.icon]}</span>
        <span>${meta.label}</span>
      `;
      wrap.appendChild(label);

      label.querySelector("input").addEventListener("change", (e) => {
        if (!e.target.checked && enabledCategoryCount() <= 1 && isCategoryEnabled(category)) {
          e.target.checked = true;
          return;
        }
        settings.categories[category] = e.target.checked;
        saveSettings();
        applyCategoryEnabledState();
      });
    });
  }

  function buildThemeToggles() {
    const wrap = document.getElementById("theme-toggles");
    THEMES.forEach((theme) => {
      const label = document.createElement("label");
      label.className = "toggle-chip theme-chip";
      label.innerHTML = `
        <input type="checkbox" id="theme-${theme.id}" />
        <span>${theme.label}</span>
      `;
      wrap.appendChild(label);

      const input = label.querySelector("input");
      input.checked = isThemeSelected(theme.id);
      label.classList.toggle("checked", input.checked);

      input.addEventListener("change", (e) => {
        if (e.target.checked) {
          if (!settings.themes.includes(theme.id)) settings.themes.push(theme.id);
        } else {
          settings.themes = settings.themes.filter((t) => t !== theme.id);
        }
        label.classList.toggle("checked", e.target.checked);
        saveSettings();
        rebuildPromptData();
      });
    });
  }

  function initWeirdnessSlider() {
    const slider = document.getElementById("weirdness-slider");
    const valueLabel = document.getElementById("weirdness-value");
    slider.value = String(settings.weirdness);
    valueLabel.textContent = weirdnessDescription(settings.weirdness);
    slider.addEventListener("input", (e) => {
      settings.weirdness = Number(e.target.value);
      valueLabel.textContent = weirdnessDescription(settings.weirdness);
      saveSettings();
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
          <span class="card-icon">${ICONS[meta.icon]}</span>
          <span class="card-label">${meta.label}</span>
        </div>
        <div class="card-value">—</div>
        <button class="card-shuffle" type="button" title="Shuffle ${meta.label}"><span class="btn-icon">${ICONS.shuffle}</span>Shuffle</button>
      `;
      grid.appendChild(card);
      const shuffleBtn = card.querySelector(".card-shuffle");
      shuffleBtn.addEventListener("click", () => {
        replayAnimation(shuffleBtn.querySelector(".btn-icon"), "spin-once");
        generateSingle(category);
      });
    });
  }

  function init() {
    initTheme();
    document.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = ICONS[el.dataset.icon] || "";
    });
    buildCategoryToggles();
    buildThemeToggles();
    initWeirdnessSlider();
    buildCategoryCards();
    applyCategoryEnabledState();
    initTabs();
    renderHistory();
    renderFavorites();
    renderPractice();

    document.getElementById("shuffle-all-btn").addEventListener("click", (e) => {
      replayAnimation(e.currentTarget.querySelector(".btn-icon"), "spin-once");
      shuffleAll();
    });
    document.getElementById("generate-prompt-btn").addEventListener("click", generateFullPrompt);
    document.getElementById("clear-history-btn").addEventListener("click", clearHistory);
    document.getElementById("clear-favorites-btn").addEventListener("click", clearFavorites);
    document.getElementById("clear-practice-btn").addEventListener("click", clearPractice);

    document.getElementById("full-prompt-copy").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const text = document.getElementById("full-prompt-card").dataset.text || "";
      if (text) copyText(text, () => flashButtonContent(btn, "check", "Copied!"));
    });

    document.getElementById("full-prompt-star").addEventListener("click", (e) => {
      const text = document.getElementById("full-prompt-card").dataset.text || "";
      if (!text) return;
      toggleFavorite(text);
      const nowFavorited = isFavorited(text);
      setButtonContent(e.currentTarget, nowFavorited ? "starFilled" : "starOutline", nowFavorited ? "Favorited" : "Favorite");
      e.currentTarget.classList.toggle("active", nowFavorited);
      if (nowFavorited) replayAnimation(e.currentTarget.querySelector(".btn-icon"), "star-pop");
    });

    document.getElementById("practice-photo-input").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      const targetText = pendingPhotoText;
      pendingPhotoText = null;
      if (!file || !targetText) return;
      try {
        const dataUrl = await compressImage(file, PHOTO_MAX_DIMENSION, PHOTO_QUALITY);
        addPracticeEntry(targetText, dataUrl);
      } catch (err) {
        addPracticeEntry(targetText, null);
      }
    });

    generateFullPrompt();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
