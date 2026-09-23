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
    settings: "sketchbook.settings",
    theme: "sketchbook.theme"
  };

  const MAX_HISTORY = 60;
  const MAX_PRACTICE_ENTRIES = 200;
  const PHOTO_MAX_DIMENSION = 480;
  const PHOTO_QUALITY = 0.6;

  /* ---------- Local persistence (per-person UI preferences only) ---------- */
  // History, favorites, and the practice log are shared between the two of
  // you and live in Supabase (see the data layer further down). Only
  // personal generator preferences — color theme, enabled categories,
  // content themes, weirdness — stay in this browser's localStorage.

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
      weirdness: 0,
      focalSubject: false,
      sceneDetails: false,
      palette: { enabled: false, id: null }
    },
    load(STORAGE_KEYS.settings, {})
  );
  settings.categories = Object.assign(
    { words: true, scenarios: true, objects: true, things: true, scenes: true },
    settings.categories
  );
  if (!Array.isArray(settings.themes)) settings.themes = [];
  settings.focalSubject = Boolean(settings.focalSubject);
  settings.sceneDetails = Boolean(settings.sceneDetails);
  if (!settings.palette || typeof settings.palette !== "object") settings.palette = { enabled: false, id: null };
  settings.palette.enabled = Boolean(settings.palette.enabled);
  if (typeof settings.palette.id !== "string") settings.palette.id = null;

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

  /* ---------- Generation engine ---------- */
  // The actual shuffle-bag/coherence-biasing algorithm lives in
  // js/generator.js (PromptGenerator) so it has no DOM dependency and can be
  // exercised directly by scripts/simulate.js. This app just owns the
  // promptData (which themes are selected) and the live weirdness value.

  let promptData = buildPromptData(settings.themes);
  let generator = PromptGenerator.createGenerator(promptData, () => settings.weirdness);

  function draw(category, exclude) {
    return generator.draw(category, exclude);
  }

  function rebuildPromptData() {
    promptData = buildPromptData(settings.themes);
    generator = PromptGenerator.createGenerator(promptData, () => settings.weirdness);
    Object.keys(CATEGORY_META).forEach((category) => {
      if (isCategoryEnabled(category)) generateSingle(category);
    });
  }

  /* ---------- Current single-card values ---------- */

  const current = {};

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function replayAnimation(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  /* ---------- Rendering single category cards ---------- */

  function renderCard(category) {
    const valueEl = document.querySelector(`#card-${category} .card-value`);
    let display = current[category];
    if (display && category === "scenes") {
      display = generator.maybeEmbellishScene(display, isSceneDetailsActive());
    }
    valueEl.textContent = display ? capitalize(display) : "—";
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
    updateAllSettingsToggles();
    refreshFullPromptAvailability();
  }

  /* ---------- Composed full prompt ---------- */

  function eligibleTemplates() {
    return PROMPT_TEMPLATES.filter((tpl) => tpl.categories.every(isCategoryEnabled));
  }

  // "Focus on the animal/character" restricts the composer to templates
  // where the thing/creature is the grammatical subject (see `focal: "thing"`
  // in PROMPT_TEMPLATES) instead of one ingredient among several. It only
  // does anything useful when Things is actually enabled, so the checkbox
  // in Settings is disabled otherwise rather than silently doing nothing.
  function isFocalSubjectActive() {
    return settings.focalSubject && isCategoryEnabled("things");
  }

  function isSceneDetailsActive() {
    return settings.sceneDetails && isCategoryEnabled("scenes");
  }

  function templatesToUse() {
    const eligible = eligibleTemplates();
    if (isFocalSubjectActive()) {
      const focal = eligible.filter((tpl) => tpl.focal === "thing");
      if (focal.length > 0) return focal;
    }
    const rich = eligible.filter((tpl) => tpl.categories.length > 1);
    return rich.length > 0 ? rich : eligible;
  }

  function refreshFullPromptAvailability() {
    const hasTemplates = eligibleTemplates().length > 0;
    document.getElementById("generate-prompt-btn").disabled = !hasTemplates;
    document.getElementById("full-prompt-text").style.display = hasTemplates ? "" : "none";
    document.getElementById("full-prompt-empty-message").style.display = hasTemplates ? "none" : "block";
  }

  const GENERATE_SPIN_MS = 480;

  // Avoids picking the exact same sentence template twice in a row — with
  // uniform random choice alone, a run of "New prompt" clicks can otherwise
  // land on the same structure back to back, which reads as repetitive even
  // though the words themselves differ.
  let lastTemplateText = null;

  function pickTemplate(templates) {
    if (templates.length === 1) return templates[0];
    let template = templates[Math.floor(Math.random() * templates.length)];
    if (template.text === lastTemplateText) {
      template = templates[Math.floor(Math.random() * templates.length)];
    }
    lastTemplateText = template.text;
    return template;
  }

  function generateFullPrompt() {
    const templates = templatesToUse();
    if (templates.length === 0) {
      refreshFullPromptAvailability();
      return;
    }
    const template = pickTemplate(templates);
    const text = generator.fillTemplate(template.text, { embellishScenes: isSceneDetailsActive() });
    const textEl = document.getElementById("full-prompt-text");
    const generateBtn = document.getElementById("generate-prompt-btn");
    const iconEl = generateBtn.querySelector(".btn-icon");

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

  /* ---------- Shared data layer (Supabase) ---------- */
  // History, favorites, and the practice log are shared between both
  // accounts. Row Level Security (see supabase/schema.sql) means everyone
  // can READ every row, but each person can only INSERT/DELETE their own —
  // that's enforced by the database itself, not just this code.

  let currentUser = null; // { id, username }
  let history = [];
  let favorites = [];
  let practiceLog = [];
  let realtimeChannel = null;

  function myId() {
    return currentUser ? currentUser.id : null;
  }

  function mapPracticeRow(row) {
    return {
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      text: row.text,
      date: row.sketch_date,
      photo_path: row.photo_path
    };
  }

  async function fetchInitialData() {
    const [historyRes, favoritesRes, practiceRes] = await Promise.all([
      Auth.client.from("prompt_history").select("*").order("created_at", { ascending: false }).limit(MAX_HISTORY),
      Auth.client.from("favorites").select("*").order("created_at", { ascending: false }),
      Auth.client.from("practice_log").select("*").order("created_at", { ascending: false }).limit(MAX_PRACTICE_ENTRIES)
    ]);
    if (historyRes.error) console.error("Failed to load history:", historyRes.error);
    if (favoritesRes.error) console.error("Failed to load favorites:", favoritesRes.error);
    if (practiceRes.error) console.error("Failed to load practice log:", practiceRes.error);

    history = historyRes.data || [];
    favorites = favoritesRes.data || [];
    practiceLog = (practiceRes.data || []).map(mapPracticeRow);
    renderHistory();
    renderFavorites();
    renderPractice();
  }

  function setupRealtime() {
    realtimeChannel = Auth.client
      .channel("shared-data")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "prompt_history" }, (payload) => {
        if (payload.new.user_id === myId()) return; // already applied locally on insert
        history.unshift(payload.new);
        if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
        renderHistory();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "prompt_history" }, (payload) => {
        history = history.filter((h) => h.id !== payload.old.id);
        renderHistory();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "favorites" }, (payload) => {
        if (payload.new.user_id === myId()) return;
        favorites.unshift(payload.new);
        renderHistory();
        renderFavorites();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "favorites" }, (payload) => {
        favorites = favorites.filter((f) => f.id !== payload.old.id);
        renderHistory();
        renderFavorites();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "practice_log" }, (payload) => {
        if (payload.new.user_id === myId()) return;
        practiceLog.unshift(mapPracticeRow(payload.new));
        renderPractice();
        renderHistory();
        renderFavorites();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "practice_log" }, (payload) => {
        practiceLog = practiceLog.filter((e) => e.id !== payload.old.id);
        renderPractice();
        renderHistory();
        renderFavorites();
      })
      .subscribe();
  }

  function teardownRealtime() {
    if (realtimeChannel) {
      Auth.client.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  }

  async function addToHistory(text) {
    const { data, error } = await Auth.client
      .from("prompt_history")
      .insert({ user_id: myId(), username: currentUser.username, text })
      .select()
      .single();
    if (error) {
      console.error(error);
      return;
    }
    history.unshift(data);
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    renderHistory();
  }

  function isFavorited(text) {
    return favorites.some((f) => f.text === text && f.user_id === myId());
  }

  async function toggleFavorite(text) {
    const mine = favorites.find((f) => f.text === text && f.user_id === myId());
    if (mine) {
      const { error } = await Auth.client.from("favorites").delete().eq("id", mine.id);
      if (error) {
      console.error(error);
      return;
    }
      favorites = favorites.filter((f) => f.id !== mine.id);
    } else {
      const { data, error } = await Auth.client
        .from("favorites")
        .insert({ user_id: myId(), username: currentUser.username, text })
        .select()
        .single();
      if (error) {
      console.error(error);
      return;
    }
      favorites.unshift(data);
    }
    renderHistory();
    renderFavorites();
  }

  async function removeFavorite(id) {
    const { error } = await Auth.client.from("favorites").delete().eq("id", id).eq("user_id", myId());
    if (error) {
      console.error(error);
      return;
    }
    favorites = favorites.filter((f) => f.id !== id);
    renderFavorites();
    renderHistory();
  }

  async function clearHistory() {
    if (!confirm("Clear your history entries? Your partner's stay.")) return;
    const { error } = await Auth.client.from("prompt_history").delete().eq("user_id", myId());
    if (error) {
      console.error(error);
      return;
    }
    history = history.filter((h) => h.user_id !== myId());
    renderHistory();
  }

  async function clearFavorites() {
    if (!confirm("Clear your favorites? Your partner's stay.")) return;
    const { error } = await Auth.client.from("favorites").delete().eq("user_id", myId());
    if (error) {
      console.error(error);
      return;
    }
    favorites = favorites.filter((f) => f.user_id !== myId());
    renderFavorites();
    renderHistory();
  }

  /* ---------- Practice log (streaks + optional photos) ---------- */

  function todayKey() {
    return formatDateKey(new Date());
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  async function addPracticeEntry(text, photoBlob) {
    let photoPath = null;
    if (photoBlob) {
      const path = `${myId()}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error: uploadError } = await Auth.client.storage
        .from(SKETCHES_BUCKET)
        .upload(path, photoBlob, { contentType: "image/jpeg", upsert: false });
      if (uploadError) console.error("Photo upload failed:", uploadError);
      else photoPath = path;
    }

    const { data, error } = await Auth.client
      .from("practice_log")
      .insert({
        user_id: myId(),
        username: currentUser.username,
        text,
        sketch_date: todayKey(),
        photo_path: photoPath
      })
      .select()
      .single();
    if (error) {
      console.error(error);
      return;
    }

    practiceLog.unshift(mapPracticeRow(data));
    renderPractice();
    renderHistory();
    renderFavorites();
  }

  async function removePracticeEntry(id) {
    const { error } = await Auth.client.from("practice_log").delete().eq("id", id).eq("user_id", myId());
    if (error) {
      console.error(error);
      return;
    }
    practiceLog = practiceLog.filter((e) => e.id !== id);
    renderPractice();
    renderHistory();
    renderFavorites();
  }

  async function clearPractice() {
    if (!confirm("Clear your sketch log entries (including your photos)? Your partner's stay.")) return;
    const { error } = await Auth.client.from("practice_log").delete().eq("user_id", myId());
    if (error) {
      console.error(error);
      return;
    }
    practiceLog = practiceLog.filter((e) => e.user_id !== myId());
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

  async function getSignedPhotoUrl(path) {
    if (!path) return null;
    const { data, error } = await Auth.client.storage.from(SKETCHES_BUCKET).createSignedUrl(path, 3600);
    if (error) {
      console.error("Could not get signed photo URL:", error);
      return null;
    }
    return data.signedUrl;
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

      if (entry.photo_path) {
        const img = document.createElement("img");
        img.className = "practice-thumb";
        img.alt = "Sketch for: " + entry.text;
        row.appendChild(img);
        getSignedPhotoUrl(entry.photo_path).then((url) => {
          if (url) img.src = url;
        });
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "practice-thumb practice-thumb-empty";
        placeholder.innerHTML = ICONS.pencil;
        row.appendChild(placeholder);
      }

      const info = document.createElement("div");
      info.className = "practice-info";
      const author = document.createElement("span");
      author.className = "entry-author";
      author.textContent = entry.username;
      const text = document.createElement("span");
      text.className = "list-text";
      text.textContent = entry.text;
      const date = document.createElement("span");
      date.className = "practice-date";
      date.textContent = entry.date;
      info.appendChild(author);
      info.appendChild(text);
      info.appendChild(date);
      row.appendChild(info);

      if (entry.user_id === myId()) {
        const removeBtn = document.createElement("button");
        removeBtn.className = "icon-btn";
        removeBtn.title = "Remove";
        removeBtn.setAttribute("aria-label", "Remove");
        removeBtn.innerHTML = ICONS.close;
        removeBtn.addEventListener("click", () => removePracticeEntry(entry.id));
        row.appendChild(removeBtn);
      }

      list.appendChild(row);
    });
  }

  function renderPractice() {
    renderPracticeStats();
    renderPracticeHeatmap();
    renderPracticeGallery();
  }

  // Compresses an uploaded/captured photo down to a small JPEG Blob before
  // it ever leaves the browser, both for faster uploads and to keep shared
  // storage usage low.
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
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Could not compress image"));
            },
            "image/jpeg",
            quality
          );
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

  function makeListRow(text, { username, starred, onStar, onRemove, onCopy, sketched, onSketch, onPhoto }) {
    const row = document.createElement("li");
    row.className = "list-row";

    const textWrap = document.createElement("div");
    textWrap.className = "list-text-wrap";
    if (username) {
      const author = document.createElement("span");
      author.className = "entry-author";
      author.textContent = username;
      textWrap.appendChild(author);
    }
    const span = document.createElement("span");
    span.className = "list-text";
    span.textContent = text;
    textWrap.appendChild(span);
    row.appendChild(textWrap);

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
        const wasFavorited = isFavorited(text);
        onStar();
        if (!wasFavorited) replayAnimation(starBtn, "star-pop");
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
        username: entry.username,
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
        username: entry.username,
        starred: true,
        onStar: () => toggleFavorite(entry.text),
        onRemove: entry.user_id === myId() ? () => removeFavorite(entry.id) : null,
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

  /* ---------- Color palette ---------- */
  // A personal, local-only tool alongside the generator (not saved to
  // history/favorites/Supabase) — pick a curated palette to sketch with,
  // either at random or from the full browsable set. See js/palettes.js.

  const PALETTE_TAGS = ["warm", "cool", "pastel", "vibrant", "muted", "monochrome", "dark", "complementary", "nature", "retro", "painterly"];
  let activePaletteFilter = "all";

  function findPalette(id) {
    return COLOR_PALETTES.find((p) => p.id === id) || null;
  }

  function currentPalette() {
    return findPalette(settings.palette.id);
  }

  function pickRandomPalette(excludeId) {
    const pool = COLOR_PALETTES.length > 1 ? COLOR_PALETTES.filter((p) => p.id !== excludeId) : COLOR_PALETTES;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function ensurePaletteSelected() {
    if (!currentPalette()) settings.palette.id = pickRandomPalette(null).id;
  }

  function renderCurrentPalette() {
    const palette = currentPalette();
    const swatchesEl = document.getElementById("palette-swatches");
    const nameEl = document.getElementById("palette-name");
    if (!palette) {
      swatchesEl.innerHTML = "";
      nameEl.textContent = "—";
      return;
    }
    swatchesEl.innerHTML = palette.hexes
      .map((hex) => `<div class="palette-swatch" style="background:${hex}"><span class="palette-swatch-hex">${hex.toUpperCase()}</span></div>`)
      .join("");
    nameEl.textContent = palette.name;
    replayAnimation(swatchesEl, "pop");
  }

  function updatePaletteVisibility() {
    const active = settings.palette.enabled;
    document.getElementById("palette-empty-message").style.display = active ? "none" : "block";
    document.getElementById("palette-active").hidden = !active;
  }

  function buildPaletteFilters() {
    const wrap = document.getElementById("palette-filters");
    wrap.innerHTML = "";
    ["all"].concat(PALETTE_TAGS).forEach((tag) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "palette-filter-chip" + (tag === activePaletteFilter ? " active" : "");
      chip.textContent = tag;
      chip.addEventListener("click", () => {
        activePaletteFilter = tag;
        wrap.querySelectorAll(".palette-filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        buildPaletteBrowserGrid();
      });
      wrap.appendChild(chip);
    });
  }

  function buildPaletteBrowserGrid() {
    const grid = document.getElementById("palette-browser-grid");
    grid.innerHTML = "";
    const list = activePaletteFilter === "all" ? COLOR_PALETTES : COLOR_PALETTES.filter((p) => p.tags.includes(activePaletteFilter));
    list.forEach((palette) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "palette-browser-item" + (palette.id === settings.palette.id ? " active" : "");
      item.innerHTML = `
        <div class="palette-browser-swatches">${palette.hexes.map((hex) => `<span style="background:${hex}"></span>`).join("")}</div>
        <div class="palette-browser-item-name">${palette.name}</div>
      `;
      item.addEventListener("click", () => {
        settings.palette.id = palette.id;
        saveSettings();
        renderCurrentPalette();
        grid.querySelectorAll(".palette-browser-item").forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
      });
      grid.appendChild(item);
    });
  }

  function buildPaletteBrowser() {
    const browser = document.getElementById("palette-browser");
    browser.innerHTML = '<div class="palette-filters" id="palette-filters"></div><div class="palette-browser-grid" id="palette-browser-grid"></div>';
    buildPaletteFilters();
    buildPaletteBrowserGrid();
  }

  function initPaletteFeature() {
    const toggle = document.getElementById("palette-toggle");
    toggle.checked = settings.palette.enabled;
    if (settings.palette.enabled) {
      ensurePaletteSelected();
      renderCurrentPalette();
    }
    updatePaletteVisibility();

    toggle.addEventListener("change", (e) => {
      settings.palette.enabled = e.target.checked;
      if (settings.palette.enabled) {
        ensurePaletteSelected();
        renderCurrentPalette();
      }
      updatePaletteVisibility();
      saveSettings();
    });

    document.getElementById("palette-shuffle-btn").addEventListener("click", (e) => {
      replayAnimation(e.currentTarget.querySelector(".btn-icon"), "shuffle-spin");
      settings.palette.id = pickRandomPalette(settings.palette.id).id;
      renderCurrentPalette();
      saveSettings();
      const browser = document.getElementById("palette-browser");
      if (!browser.hidden) buildPaletteBrowserGrid();
    });

    document.getElementById("palette-browse-btn").addEventListener("click", () => {
      const browser = document.getElementById("palette-browser");
      const wasHidden = browser.hidden;
      browser.hidden = !wasHidden;
      if (wasHidden) buildPaletteBrowser();
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

  // Only meaningful while Things is enabled — otherwise there's no
  // Both of these settings toggles only do anything useful while a
  // particular category is enabled (focal subject needs Things, scene
  // detail needs Scenes) — this wires up one checkbox/label pair, disabling
  // it (not hiding it, so it's clear why) whenever that category is off.
  const settingsToggles = [];

  function initSettingsToggle(checkboxId, labelId, settingKey, requiredCategory) {
    const checkbox = document.getElementById(checkboxId);
    const label = document.getElementById(labelId);
    checkbox.checked = settings[settingKey];
    label.classList.toggle("checked", checkbox.checked);
    checkbox.addEventListener("change", (e) => {
      settings[settingKey] = e.target.checked;
      label.classList.toggle("checked", e.target.checked);
      saveSettings();
    });
    const entry = { checkbox, label, requiredCategory };
    settingsToggles.push(entry);
    updateSettingsToggleAvailability(entry);
  }

  function updateSettingsToggleAvailability(entry) {
    const enabled = isCategoryEnabled(entry.requiredCategory);
    entry.checkbox.disabled = !enabled;
    entry.label.classList.toggle("disabled", !enabled);
    entry.label.title = enabled ? "" : `Enable the ${CATEGORY_META[entry.requiredCategory].label} category to use this`;
  }

  function updateAllSettingsToggles() {
    settingsToggles.forEach(updateSettingsToggleAvailability);
  }

  function initFocalToggle() {
    initSettingsToggle("focal-subject-toggle", "focal-toggle-label", "focalSubject", "things");
    initSettingsToggle("scene-details-toggle", "scene-details-toggle-label", "sceneDetails", "scenes");
  }

  /* ---------- Category cards ---------- */

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
        replayAnimation(shuffleBtn.querySelector(".btn-icon"), "shuffle-spin");
        generateSingle(category);
      });
    });
  }

  /* ---------- App bootstrap (one-time UI wiring) ---------- */

  let appStarted = false;

  function initApp() {
    document.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = ICONS[el.dataset.icon] || "";
    });
    buildCategoryToggles();
    buildThemeToggles();
    initWeirdnessSlider();
    initFocalToggle();
    initPaletteFeature();
    buildCategoryCards();
    applyCategoryEnabledState();
    initTabs();

    document.getElementById("shuffle-all-btn").addEventListener("click", (e) => {
      replayAnimation(e.currentTarget.querySelector(".btn-icon"), "shuffle-spin");
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

    document.getElementById("full-prompt-star").addEventListener("click", async (e) => {
      const text = document.getElementById("full-prompt-card").dataset.text || "";
      if (!text) return;
      const wasFavorited = isFavorited(text);
      await toggleFavorite(text);
      const nowFavorited = isFavorited(text);
      setButtonContent(e.currentTarget, nowFavorited ? "starFilled" : "starOutline", nowFavorited ? "Favorited" : "Favorite");
      e.currentTarget.classList.toggle("active", nowFavorited);
      if (!wasFavorited && nowFavorited) replayAnimation(e.currentTarget.querySelector(".btn-icon"), "star-pop");
    });

    document.getElementById("practice-photo-input").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      const targetText = pendingPhotoText;
      pendingPhotoText = null;
      if (!file || !targetText) return;
      try {
        const blob = await compressImage(file, PHOTO_MAX_DIMENSION, PHOTO_QUALITY);
        await addPracticeEntry(targetText, blob);
      } catch (err) {
        await addPracticeEntry(targetText, null);
      }
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
      Auth.logout();
    });
  }

  /* ---------- Auth gating ---------- */

  function showAuthScreen() {
    document.getElementById("app-root").hidden = true;
    document.getElementById("auth-screen").hidden = false;
    document.getElementById("login-password").value = "";
  }

  async function showApp(session) {
    currentUser = { id: session.user.id, username: Auth.usernameFromSession(session) };
    document.getElementById("account-username").textContent = currentUser.username;
    document.getElementById("auth-screen").hidden = true;
    document.getElementById("app-root").hidden = false;

    if (!appStarted) {
      appStarted = true;
      initApp();
      await fetchInitialData();
      setupRealtime();
      generateFullPrompt();
    } else {
      await fetchInitialData();
    }
  }

  function handleSignedOut() {
    teardownRealtime();
    history = [];
    favorites = [];
    practiceLog = [];
    currentUser = null;
    showAuthScreen();
  }

  function initAuthScreen() {
    const form = document.getElementById("login-form");
    const errorEl = document.getElementById("login-error");
    const submitBtn = document.getElementById("login-submit");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;
      errorEl.hidden = true;
      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing in…";
      try {
        await Auth.login(username, password);
        // Auth.onChange (registered below) picks up the new session from here.
      } catch (err) {
        errorEl.textContent = "Wrong username or password.";
        errorEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });

    Auth.onChange((session) => {
      if (session) showApp(session);
      else handleSignedOut();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initAuthScreen();
  });
})();
