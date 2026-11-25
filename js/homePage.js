import { MATH_CATALOG, CATEGORIES, DIMENSIONS, resolveConceptId } from "./data/catalog.js?v=2.2";
import { GAMEPLAY_TAGS } from "./data/categories.js?v=2.2";
import { ThemeManager } from "./core/ThemeManager.js?v=2.2";
import { CommandPalette } from "./core/CommandPalette.js?v=2.2";
import { ICONS } from "./core/Icons.js?v=2.2";
import { mountAmbientLayer } from "./core/AmbientLayer.js?v=2.2";

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

    mountAmbientLayer();
    this.initShell();
    this.initFilters();
    this.renderConcepts();
  }

  initShell() {
    ThemeManager.init(document.getElementById("mv-theme-toggle"));
    const searchIcon = document.getElementById("mv-search-icon");
    if (searchIcon) searchIcon.innerHTML = ICONS.search;
    const inlineIcon = document.getElementById("mv-inline-search-icon");
    if (inlineIcon) inlineIcon.innerHTML = ICONS.search;

    CommandPalette.init(document.getElementById("mv-search-trigger"), "./concepts/");
  }

  initFilters() {
    this.renderDimControls();

    const tagSelect = document.getElementById("mv-tag-select");
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

    const inlineInput = document.getElementById("mv-inline-filter");
    inlineInput.addEventListener("input", () => {
      this.state.query = inlineInput.value.trim().toLowerCase();
      this.renderConcepts();
    });
  }

  renderDimControls() {
    const topNav = document.getElementById("mv-top-dims");
    const pillsWrap = document.getElementById("mv-dim-pills");

    if (topNav) {
      topNav.innerHTML = DIMENSIONS.map(
        (d) => `
        <button type="button" class="mv-seg-item ${this.state.dimension === d.id ? "is-active" : ""}" data-dim="${d.id}">
          ${d.label}
        </button>
      `
      ).join("");
      topNav.querySelectorAll("[data-dim]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.state.dimension = btn.dataset.dim;
          this.renderDimControls();
          this.renderConcepts();
        });
      });
    }

    if (pillsWrap) {
      pillsWrap.innerHTML = DIMENSIONS.map((d) => {
        const count = d.id === "all"
          ? MATH_CATALOG.length
          : MATH_CATALOG.filter((c) => c.dimension === d.id).length;
        return `
          <button type="button" class="mv-pill-btn ${this.state.dimension === d.id ? "is-active" : ""}" data-dim="${d.id}">
            <span>${d.label}</span>
            <span class="mv-pill-count">${count}</span>
          </button>
        `;
      }).join("");
      pillsWrap.querySelectorAll("[data-dim]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.state.dimension = btn.dataset.dim;
          this.renderDimControls();
          this.renderConcepts();
        });
      });
    }
  }

  renderConcepts() {
    const root = document.getElementById("mv-sections");
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
        <div class="apple-glass mv-empty">
          <p style="font-size:15px;font-weight:600;color:var(--text-primary)">Aucun concept trouvé</p>
          <p style="margin-top:4px;font-size:13px">Essaie un autre mot-clé ou réinitialise les filtres.</p>
          <button type="button" class="mv-btn mv-btn-sm" id="mv-reset-btn" style="margin-top:14px">Tout afficher</button>
        </div>
      `;
      root.querySelector("#mv-reset-btn")?.addEventListener("click", () => {
        this.state = { dimension: "all", tag: "all", query: "" };
        document.getElementById("mv-inline-filter").value = "";
        document.getElementById("mv-tag-select").value = "all";
        this.renderDimControls();
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
        <section id="cat-${cat.id}">
          <div class="mv-cat-head">
            <div class="mv-cat-left">
              <span class="mv-cat-num">${cat.index}</span>
              <h2 class="mv-cat-title">${cat.name}</h2>
            </div>
            <span class="mv-cat-desc">${cat.desc}</span>
          </div>

          <div class="mv-cards-grid">
            ${items
              .map(
                (c) => `
              <a href="./concepts/${c.id}.html" class="mv-card">
                <div class="mv-card-preview">
                  <div class="mv-card-preview-top">
                    <span class="mv-card-glyph">${c.glyph}</span>
                    <span class="gb-tag ${c.dimensionMeta.badgeClass}">${c.dimensionMeta.label}</span>
                  </div>
                  <div class="mv-card-formula">${c.formula}</div>
                </div>

                <div class="mv-card-body">
                  <h3 class="mv-card-title">${c.name}</h3>
                  <p class="mv-card-sub">${c.subtitle}</p>
                </div>

                <div class="mv-card-foot">
                  <div class="mv-card-tags">
                    <span>${(c.tags || []).slice(0, 2).join(" · ")}</span>
                  </div>
                  <span class="mv-card-arrow">Ouvrir →</span>
                </div>
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
