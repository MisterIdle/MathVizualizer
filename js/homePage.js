import { MATH_CATALOG, CATEGORIES, DIMENSIONS, resolveConceptId } from "./data/catalog.js";
import { GAMEPLAY_TAGS, LEARNING_PATHS } from "./data/categories.js";
import { ThemeManager } from "./core/ThemeManager.js";
import { Gamification } from "./core/Gamification.js";
import { CommandPalette } from "./core/CommandPalette.js";
import { ICONS } from "./core/Icons.js";

class HomePageController {
  constructor() {
    // Redirect legacy v1.x hash links (#cos, #dot, #perlinnoise, etc.) cleanly
    if (window.location.hash && window.location.hash.length > 1) {
      const legacyTarget = resolveConceptId(window.location.hash.slice(1));
      if (legacyTarget) {
        window.location.replace(`./concepts/${legacyTarget}.html`);
        return;
      }
    }

    this.state = {
      dimension: "all",
      category: "all",
      difficulty: "all",
      status: "all",
      tag: null,
      pathId: null,
      query: ""
    };

    this.initShell();
    this.initFilters();
    this.renderDashboard();
    this.renderPaths();
    this.renderCatalog();
  }

  initShell() {
    ThemeManager.init(document.getElementById("mv-theme-toggle"));
    const searchSlot = document.getElementById("mv-search-icon-slot");
    if (searchSlot) searchSlot.innerHTML = ICONS.search;
    const inlineIcon = document.getElementById("mv-inline-search-icon");
    if (inlineIcon) inlineIcon.innerHTML = ICONS.search;

    const xpPill = document.getElementById("mv-xp-pill");
    Gamification.renderHeaderPill(xpPill);
    xpPill?.addEventListener("click", () => Gamification.openProfileModal("./"));

    CommandPalette.init(document.getElementById("mv-search-trigger"), "./concepts/");
  }

  initFilters() {
    this.renderDimSeg();

    // Category select
    const catSel = document.getElementById("mv-cat-select");
    CATEGORIES.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = `${cat.index}. ${cat.shortName}`;
      catSel.appendChild(opt);
    });
    catSel.addEventListener("change", () => {
      this.state.category = catSel.value;
      this.renderCatalog();
    });

    // Difficulty & Status selects
    const diffSel = document.getElementById("mv-diff-select");
    diffSel.addEventListener("change", () => {
      this.state.difficulty = diffSel.value;
      this.renderCatalog();
    });

    const statusSel = document.getElementById("mv-status-select");
    statusSel.addEventListener("change", () => {
      this.state.status = statusSel.value;
      this.renderCatalog();
    });

    // Inline search input
    const searchInput = document.getElementById("mv-inline-filter");
    searchInput.addEventListener("input", () => {
      this.state.query = searchInput.value.trim().toLowerCase();
      this.renderCatalog();
    });

    this.renderTags();

    // Clear path button
    document.getElementById("mv-clear-path")?.addEventListener("click", () => {
      this.state.pathId = null;
      this.renderPaths();
      this.renderCatalog();
    });
  }

  renderDimSeg() {
    const seg = document.getElementById("mv-dim-segmented");
    if (!seg) return;
    seg.innerHTML = DIMENSIONS.map((d) => {
      const count = d.id === "all"
        ? MATH_CATALOG.length
        : MATH_CATALOG.filter((c) => c.dimension === d.id).length;
      return `
        <button type="button" class="mv-seg-btn ${this.state.dimension === d.id ? "is-active" : ""}" data-dim="${d.id}">
          <span>${d.label}</span>
          <span class="mv-seg-count">${count}</span>
        </button>
      `;
    }).join("");
    seg.querySelectorAll(".mv-seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.state.dimension = btn.dataset.dim;
        this.renderDimSeg();
        this.renderCatalog();
      });
    });
  }

  renderTags() {
    const tagsRow = document.getElementById("mv-tags-row");
    if (!tagsRow) return;
    tagsRow.innerHTML = GAMEPLAY_TAGS.map((tag) => `
      <button type="button" class="mv-tag-pill ${this.state.tag === tag ? "is-active" : ""}" data-tag="${tag}">${tag}</button>
    `).join("");
    tagsRow.querySelectorAll(".mv-tag-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.state.tag = this.state.tag === btn.dataset.tag ? null : btn.dataset.tag;
        this.renderTags();
        this.renderCatalog();
      });
    });
  }

  renderDashboard() {
    const card = document.getElementById("mv-dashboard-card");
    if (!card) return;
    const stats = Gamification.getStats();
    const pct = Math.round((stats.masteredCount / Math.max(1, stats.totalCount)) * 100);

    const cellsHtml = MATH_CATALOG.map((c) => {
      const lvl = Gamification.getConceptLevel(c.id);
      const statusTxt = lvl === 3 ? "Assimilé" : lvl === 1 ? "Exploré" : "Non exploré";
      return `<a href="./concepts/${c.id}.html" class="mv-matrix-cell" data-level="${lvl}" title="${c.name} (${c.dimensionMeta.label}) — ${statusTxt}"></a>`;
    }).join("");

    card.innerHTML = `
      <div class="mv-dash-top">
        <div>
          <div class="mv-dash-rank-label">Niveau ${stats.rank.level} · Maîtrise</div>
          <div class="mv-dash-rank-name">${stats.rank.name}</div>
        </div>
        <div class="mv-dash-xp">
          <div class="mv-dash-xp-big">${stats.xp} XP</div>
          <div class="mv-dash-xp-sub">${stats.nextRank ? `${stats.nextRank.minXp - stats.xp} XP → Niv.${stats.nextRank.level}` : "Rang max"}</div>
        </div>
      </div>

      <div class="mv-progress-track">
        <div class="mv-progress-fill is-green" style="width:${Math.round(stats.rankProgress * 100)}%"></div>
      </div>

      <div class="mv-dash-metrics">
        <div class="mv-metric-box">
          <span class="mv-metric-val">${stats.masteredCount}/${stats.totalCount}</span>
          <span class="mv-metric-lbl">Assimilés (${pct}%)</span>
        </div>
        <div class="mv-metric-box">
          <span class="mv-metric-val">${stats.exploredCount}</span>
          <span class="mv-metric-lbl">Explorés</span>
        </div>
        <div class="mv-metric-box">
          <span class="mv-metric-val">${stats.pinnedCount}</span>
          <span class="mv-metric-lbl">Épinglés</span>
        </div>
        <div class="mv-metric-box">
          <span class="mv-metric-val">${stats.streak}j</span>
          <span class="mv-metric-lbl">Série</span>
        </div>
      </div>

      <div class="mv-matrix-wrap">
        <div class="mv-matrix-head">
          <span>Carte de maîtrise (${stats.totalCount} concepts)</span>
          <span>${stats.unlockedMilestones}/${stats.milestones.length} paliers</span>
        </div>
        <div class="mv-matrix-grid">${cellsHtml}</div>
      </div>
    `;
  }

  renderPaths() {
    const grid = document.getElementById("mv-paths-grid");
    const clearBtn = document.getElementById("mv-clear-path");
    if (clearBtn) clearBtn.style.display = this.state.pathId ? "inline-flex" : "none";

    const data = Gamification.load();
    grid.innerHTML = LEARNING_PATHS.map((path) => {
      const done = path.concepts.filter((id) => data.mastered[id]).length;
      const pct = Math.round((done / path.concepts.length) * 100);
      const isActive = this.state.pathId === path.id;
      return `
        <button type="button" class="mv-path-card ${isActive ? "is-active" : ""}" data-path="${path.id}">
          <div class="mv-path-top">
            <span class="mv-path-title">${path.title}</span>
            <span class="mv-path-count">${done}/${path.concepts.length}</span>
          </div>
          <p class="mv-path-desc">${path.desc}</p>
          <div class="mv-progress-track">
            <div class="mv-progress-fill ${pct === 100 ? "is-green" : ""}" style="width:${pct}%"></div>
          </div>
        </button>
      `;
    }).join("");

    grid.querySelectorAll(".mv-path-card").forEach((card) => {
      card.addEventListener("click", () => {
        this.state.pathId = this.state.pathId === card.dataset.path ? null : card.dataset.path;
        this.renderPaths();
        this.renderCatalog();
        if (this.state.pathId) {
          document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  getFilteredCatalog() {
    const data = Gamification.load();
    const activePath = this.state.pathId ? LEARNING_PATHS.find((p) => p.id === this.state.pathId) : null;
    const pathSet = activePath ? new Set(activePath.concepts) : null;

    return MATH_CATALOG.filter((c) => {
      if (pathSet && !pathSet.has(c.id)) return false;
      if (this.state.dimension !== "all" && c.dimension !== this.state.dimension) return false;
      if (this.state.category !== "all" && c.categoryId !== this.state.category) return false;
      if (this.state.difficulty !== "all" && String(c.difficulty) !== this.state.difficulty) return false;
      if (this.state.tag && !(c.tags || []).includes(this.state.tag)) return false;
      if (this.state.status === "pinned" && !data.pinned[c.id]) return false;
      if (this.state.status === "mastered" && !data.mastered[c.id]) return false;
      if (this.state.status === "todo" && data.mastered[c.id]) return false;

      if (this.state.query) {
        const hay = `${c.name} ${c.subtitle} ${c.summary} ${c.formula} ${c.categoryName} ${(c.tags || []).join(" ")} ${Object.values(c.signatures || {}).join(" ")}`.toLowerCase();
        if (!this.state.query.split(/\s+/).every((tok) => hay.includes(tok))) return false;
      }
      return true;
    });
  }

  renderCatalog() {
    const container = document.getElementById("mv-catalog-body");
    const items = this.getFilteredCatalog();
    const data = Gamification.load();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="mv-empty-state">
          <h3>Aucun concept trouvé</h3>
          <p>Essayez d'élargir vos filtres ou de réinitialiser le parcours actif.</p>
          <button type="button" class="mv-btn mv-btn-sm" id="mv-reset-filters" style="margin-top:14px">Réinitialiser les filtres</button>
        </div>
      `;
      container.querySelector("#mv-reset-filters")?.addEventListener("click", () => {
        this.state = { dimension: "all", category: "all", difficulty: "all", status: "all", tag: null, pathId: null, query: "" };
        document.getElementById("mv-inline-filter").value = "";
        document.getElementById("mv-cat-select").value = "all";
        document.getElementById("mv-diff-select").value = "all";
        document.getElementById("mv-status-select").value = "all";
        this.renderDimSeg();
        this.renderTags();
        this.renderPaths();
        this.renderCatalog();
      });
      return;
    }

    // Group by category in canonical order
    const groups = new Map();
    CATEGORIES.forEach((cat) => groups.set(cat.id, { cat, items: [] }));
    items.forEach((item) => {
      if (groups.has(item.categoryId)) groups.get(item.categoryId).items.push(item);
    });

    const html = [];
    groups.forEach(({ cat, items: groupItems }) => {
      if (groupItems.length === 0) return;
      const allCatItems = MATH_CATALOG.filter((c) => c.categoryId === cat.id);
      const catMastered = allCatItems.filter((c) => data.mastered[c.id]).length;
      const pct = Math.round((catMastered / Math.max(1, allCatItems.length)) * 100);

      const cardsHtml = groupItems.map((c) => {
        const isMastered = Boolean(data.mastered[c.id]);
        const isExplored = Boolean(data.explored[c.id]);
        const isPinned = Boolean(data.pinned[c.id]);
        return `
          <a href="./concepts/${c.id}.html" class="mv-concept-card ${isMastered ? "is-mastered" : ""}">
            <div class="mv-card-top">
              <div class="mv-card-id-group">
                <span class="mv-card-glyph">${c.glyph}</span>
                <div class="mv-card-titles">
                  <span class="mv-card-title">${c.name}</span>
                  <span class="mv-card-sub">${c.subtitle}</span>
                </div>
              </div>
              <div class="mv-card-actions">
                <button type="button" class="mv-pin-btn ${isPinned ? "is-pinned" : ""}" data-pin="${c.id}" title="${isPinned ? "Retirer des favoris" : "Épingler ce concept"}">
                  ${isPinned ? ICONS.pinFilled : ICONS.pin}
                </button>
              </div>
            </div>
            <div class="mv-card-formula">${c.formula}</div>
            <p class="mv-card-summary">${c.summary}</p>
            <div class="mv-card-footer">
              <div class="mv-card-badges">
                <span class="mv-badge ${c.dimensionMeta.badgeClass}">${c.dimensionMeta.label}</span>
                <span class="mv-badge ${c.difficultyMeta.badgeClass}">${c.difficultyMeta.label}</span>
                ${isMastered ? `<span class="mv-badge mv-badge-mastered">Assimilé</span>` : ""}
              </div>
              <div class="mv-mastery-dots" title="${isMastered ? "Assimilé" : isExplored ? "Playground exploré" : "À découvrir"}">
                <span class="mv-m-dot ${isExplored ? "is-done" : ""}"></span>
                <span class="mv-m-dot ${isMastered ? "is-done" : ""}"></span>
              </div>
            </div>
          </a>
        `;
      }).join("");

      html.push(`
        <div class="mv-cat-block">
          <div class="mv-cat-header">
            <div>
              <div class="mv-cat-title-wrap">
                <span class="mv-cat-index">${cat.index}</span>
                <h3 class="mv-cat-title">${cat.name}</h3>
              </div>
              <p class="mv-cat-desc">${cat.desc}</p>
            </div>
            <div class="mv-cat-progress" title="${catMastered} sur ${allCatItems.length} assimilés">
              <span>${catMastered}/${allCatItems.length}</span>
              <div class="mv-cat-mini-bar"><div class="mv-cat-mini-fill" style="width:${pct}%"></div></div>
            </div>
          </div>
          <div class="mv-cards-grid">${cardsHtml}</div>
        </div>
      `);
    });

    container.innerHTML = html.join("");

    // Bind pin buttons cleanly without triggering card navigation
    container.querySelectorAll("[data-pin]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        Gamification.togglePinned(btn.dataset.pin);
        this.renderDashboard();
        this.renderCatalog();
        Gamification.renderHeaderPill(document.getElementById("mv-xp-pill"));
      });
    });
  }
}

window.addEventListener("DOMContentLoaded", () => new HomePageController());
