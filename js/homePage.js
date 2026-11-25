import { MATH_CATALOG, CATEGORIES, DIMENSIONS, resolveConceptId } from "./data/catalog.js?v=2.1";
import { GAMEPLAY_TAGS } from "./data/categories.js?v=2.1";
import { ThemeManager } from "./core/ThemeManager.js?v=2.1";
import { CommandPalette } from "./core/CommandPalette.js?v=2.1";
import { ICONS } from "./core/Icons.js?v=2.1";

class HomePageController {
  constructor() {
    // Redirect legacy v1.x hash links (#cos, #dot, #perlinnoise, etc.)
    if (window.location.hash && window.location.hash.length > 1) {
      const target = resolveConceptId(window.location.hash.slice(1));
      if (target) {
        window.location.replace(`./concepts/${target}.html`);
        return;
      }
    }

    this.state = {
      dimension: "all",
      tag: "all",
      query: ""
    };

    this.initShell();
    this.renderSidebar("");
    this.initFilters();
    this.renderConcepts();
  }

  initShell() {
    ThemeManager.init(document.getElementById("gb-theme-toggle"));
    const searchIcon = document.getElementById("gb-search-icon");
    if (searchIcon) searchIcon.innerHTML = ICONS.search;
    CommandPalette.init(document.getElementById("gb-search-trigger"), "./concepts/");

    const sideFilter = document.getElementById("gb-sidebar-filter");
    sideFilter?.addEventListener("input", () => {
      this.renderSidebar(sideFilter.value.trim().toLowerCase());
    });
  }

  renderSidebar(query) {
    const tree = document.getElementById("gb-sidebar-tree");
    if (!tree) return;

    const groups = new Map();
    CATEGORIES.forEach((cat) => groups.set(cat.id, { cat, items: [] }));

    MATH_CATALOG.forEach((c) => {
      if (query) {
        const hay = `${c.name} ${c.subtitle} ${c.categoryName} ${c.dimensionMeta.label}`.toLowerCase();
        if (!hay.includes(query)) return;
      }
      groups.get(c.categoryId)?.items.push(c);
    });

    const html = [];
    groups.forEach(({ cat, items }) => {
      if (items.length === 0) return;
      html.push(`
        <div class="gb-nav-group">
          <div class="gb-nav-group-title">${cat.index} · ${cat.shortName}</div>
          <ul class="gb-nav-list">
            ${items
              .map(
                (item) => `
              <li>
                <a href="./concepts/${item.id}.html" class="gb-nav-link">
                  <span>${item.name}</span>
                  <span class="gb-nav-dim">${item.dimension === "general" ? "GEN" : item.dimension.toUpperCase()}</span>
                </a>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `);
    });
    tree.innerHTML = html.join("");
  }

  initFilters() {
    this.renderDimTabs();

    const tagSelect = document.getElementById("gb-tag-select");
    GAMEPLAY_TAGS.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      tagSelect.appendChild(opt);
    });
    tagSelect.addEventListener("change", () => {
      this.state.tag = tagSelect.value;
      this.renderConcepts();
    });

    const inlineInput = document.getElementById("gb-inline-filter");
    inlineInput.addEventListener("input", () => {
      this.state.query = inlineInput.value.trim().toLowerCase();
      this.renderConcepts();
    });
  }

  renderDimTabs() {
    const wrap = document.getElementById("gb-dim-tabs");
    if (!wrap) return;
    wrap.innerHTML = DIMENSIONS.map((d) => {
      const count = d.id === "all"
        ? MATH_CATALOG.length
        : MATH_CATALOG.filter((c) => c.dimension === d.id).length;
      return `
        <button type="button" class="gb-dim-tab ${this.state.dimension === d.id ? "is-active" : ""}" data-dim="${d.id}">
          <span>${d.label}</span>
          <span class="gb-dim-count">${count}</span>
        </button>
      `;
    }).join("");

    wrap.querySelectorAll(".gb-dim-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.state.dimension = btn.dataset.dim;
        this.renderDimTabs();
        this.renderConcepts();
      });
    });
  }

  renderConcepts() {
    const root = document.getElementById("gb-sections");
    const filtered = MATH_CATALOG.filter((c) => {
      if (this.state.dimension !== "all" && c.dimension !== this.state.dimension) return false;
      if (this.state.tag !== "all" && !(c.tags || []).includes(this.state.tag)) return false;
      if (this.state.query) {
        const hay = `${c.name} ${c.subtitle} ${c.summary} ${c.formula} ${c.categoryName} ${(c.tags || []).join(" ")} ${Object.values(c.signatures || {}).join(" ")}`.toLowerCase();
        if (!this.state.query.split(/\s+/).every((tok) => hay.includes(tok))) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      root.innerHTML = `
        <div class="gb-empty">
          <p>Aucun concept ne correspond à ce filtre.</p>
          <button type="button" class="gb-btn gb-btn-sm" id="gb-reset-btn" style="margin-top:12px">Réinitialiser</button>
        </div>
      `;
      root.querySelector("#gb-reset-btn")?.addEventListener("click", () => {
        this.state = { dimension: "all", tag: "all", query: "" };
        document.getElementById("gb-inline-filter").value = "";
        document.getElementById("gb-tag-select").value = "all";
        this.renderDimTabs();
        this.renderConcepts();
      });
      return;
    }

    const groups = new Map();
    CATEGORIES.forEach((cat) => groups.set(cat.id, { cat, items: [] }));
    filtered.forEach((item) => groups.get(item.categoryId)?.items.push(item));

    const sectionsHtml = [];
    groups.forEach(({ cat, items }) => {
      if (items.length === 0) return;
      sectionsHtml.push(`
        <section class="gb-section-block" id="cat-${cat.id}">
          <div class="gb-section-head">
            <div class="gb-section-title-row">
              <span class="gb-section-num">${cat.index}</span>
              <h2 class="gb-section-title">${cat.name}</h2>
            </div>
            <p class="gb-section-desc">${cat.desc}</p>
          </div>

          <div class="gb-grid">
            ${items
              .map(
                (c) => `
              <a href="./concepts/${c.id}.html" class="gb-card">
                <div class="gb-card-top">
                  <span class="gb-card-title">${c.name}</span>
                  <span class="gb-tag ${c.dimensionMeta.badgeClass}">${c.dimensionMeta.label}</span>
                </div>
                <p class="gb-card-sub">${c.subtitle}</p>
                <div class="gb-card-formula">${c.formula}</div>
              </a>
            `
              )
              .join("")}
          </div>
        </section>
      `);
    });

    root.innerHTML = sectionsHtml.join("");
  }
}

window.addEventListener("DOMContentLoaded", () => new HomePageController());
