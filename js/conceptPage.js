import { MATH_CATALOG, CATEGORIES, getConceptById, getNeighbors } from "./data/catalog.js?v=2.1";
import { ThemeManager } from "./core/ThemeManager.js?v=2.1";
import { CommandPalette } from "./core/CommandPalette.js?v=2.1";
import { SandboxFactory } from "./sandboxes/SandboxFactory.js?v=2.1";
import { CodeSnippetBuilder, ENGINE_TABS } from "./core/CodeSnippetBuilder.js?v=2.1";
import { BlueprintRenderer } from "./core/BlueprintRenderer.js?v=2.1";
import { ICONS } from "./core/Icons.js?v=2.1";

const ENGINE_PREF_KEY = "mv_preferred_engine_v2";

class ConceptPageController {
  constructor() {
    const conceptId = document.body.dataset.conceptId;
    this.concept = getConceptById(conceptId) || MATH_CATALOG[0];
    this.activeEngine = localStorage.getItem(ENGINE_PREF_KEY) || "unity";
    this.compareAll = false;
    this.currentSandbox = null;
    this.lastState = {};

    this.initShell();
    this.renderSidebar("");
    this.renderArticle();
  }

  initShell() {
    ThemeManager.init(document.getElementById("gb-theme-toggle"), () => {
      if (this.currentSandbox && typeof this.currentSandbox.render === "function") {
        this.currentSandbox.render();
      }
    });

    const searchIcon = document.getElementById("gb-search-icon");
    if (searchIcon) searchIcon.innerHTML = ICONS.search;
    CommandPalette.init(document.getElementById("gb-search-trigger"), "./");

    const filterInput = document.getElementById("gb-sidebar-filter");
    filterInput?.addEventListener("input", () => {
      this.renderSidebar(filterInput.value.trim().toLowerCase());
    });
  }

  renderSidebar(query) {
    const tree = document.getElementById("gb-sidebar-tree");
    if (!tree) return;

    const groups = new Map();
    CATEGORIES.forEach((cat) => groups.set(cat.id, { cat, items: [] }));
    MATH_CATALOG.forEach((item) => {
      if (query) {
        const hay = `${item.name} ${item.subtitle} ${item.categoryName} ${item.dimensionMeta.label}`.toLowerCase();
        if (!hay.includes(query)) return;
      }
      groups.get(item.categoryId)?.items.push(item);
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
                <a href="./${item.id}.html" class="gb-nav-link ${item.id === this.concept.id ? "is-active" : ""}">
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
    if (!query) {
      tree.querySelector(".gb-nav-link.is-active")?.scrollIntoView({ block: "center" });
    }
  }

  renderArticle() {
    const c = this.concept;
    const root = document.getElementById("gb-article-root");
    const { prev, next } = getNeighbors(c.id);
    const relatedConcepts = (c.related || []).map((id) => getConceptById(id)).filter(Boolean);

    root.innerHTML = `
      <nav class="gb-breadcrumb" aria-label="Fil d'Ariane">
        <a href="../index.html">Bible Mathématique</a>
        <span>/</span>
        <span>${c.categoryIndex} · ${c.categoryShort}</span>
      </nav>

      <header class="gb-doc-header" id="sec-def">
        <div class="gb-doc-kicker">
          <span class="gb-tag ${c.dimensionMeta.badgeClass}">${c.dimensionMeta.label}</span>
          ${(c.tags || []).map((t) => `<span class="gb-tag gb-tag-muted">${t}</span>`).join("")}
        </div>
        <h1 class="gb-doc-title">${c.name}</h1>
        <p class="gb-doc-subtitle">${c.subtitle}</p>
        <p class="gb-doc-summary">${c.summary}</p>

        <div class="gb-hints">
          <div class="gb-hint is-tip">
            <span class="gb-hint-label">À retenir</span>
            <div>${c.tldr}</div>
          </div>
          <div class="gb-hint">
            <span class="gb-hint-label">Formule Mathématique</span>
            <div class="gb-formula">${c.formula}</div>
            ${c.formulaVars ? `<div class="gb-formula-vars">${c.formulaVars}</div>` : ""}
          </div>
        </div>
      </header>

      <section class="gb-section" id="sec-sandbox">
        <h2 class="gb-h2">Playground Interactif</h2>
        <div class="gb-sandbox">
          <div class="gb-sandbox-toolbar" id="gb-sandbox-toolbar"></div>
          <div class="gb-canvas-wrap">
            <canvas id="gb-sandbox-canvas"></canvas>
          </div>
          <div class="gb-sandbox-caption">
            Cliquez et glissez directement les poignées sur le canvas pour tester en temps réel.
          </div>
        </div>
      </section>

      <section class="gb-section" id="sec-code">
        <h2 class="gb-h2">Code Temps Réel Multi-Moteurs</h2>
        <div class="gb-code-box">
          <div class="gb-code-head">
            <div class="gb-code-tabs" id="gb-code-tabs"></div>
            <div class="gb-code-actions">
              <button type="button" id="gb-code-compare" class="gb-btn gb-btn-sm gb-btn-ghost">
                ${ICONS.columns} <span>Comparer</span>
              </button>
              <button type="button" id="gb-code-copy" class="gb-btn gb-btn-sm">
                ${ICONS.copy} <span>Copier</span>
              </button>
            </div>
          </div>
          <div id="gb-code-body"></div>
        </div>
      </section>

      <section class="gb-section" id="sec-live">
        <h2 class="gb-h2">Valeurs en Direct</h2>
        <div class="gb-table-wrap" id="gb-live-table"></div>
      </section>

      <section class="gb-section" id="sec-examples">
        <h2 class="gb-h2">Cas d'Usage en Gameplay</h2>
        <div class="gb-examples">
          ${(c.examples || [])
            .map(
              (ex) => `
            <div class="gb-example-card">
              <div class="gb-example-title">${ex.title}</div>
              <div class="gb-example-desc">${ex.desc}</div>
              ${
                ex.code
                  ? `<pre class="gb-code-pre" style="padding:10px 13px;border-radius:6px;background:var(--bg-code);border:1px solid var(--border-subtle);font-size:12.5px">${CodeSnippetBuilder.highlight(ex.code)}</pre>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      </section>

      ${
        c.pitfalls && c.pitfalls.length > 0
          ? `
        <section class="gb-section" id="sec-pitfalls">
          <h2 class="gb-h2">Pièges Classiques &amp; Bonnes Pratiques</h2>
          <div class="gb-hints">
            ${c.pitfalls
              .map(
                (p) => `
              <div class="gb-hint is-warn">
                <span class="gb-hint-label">Attention</span>
                <div>${p}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </section>
      `
          : ""
      }

      ${
        relatedConcepts.length > 0
          ? `
        <section class="gb-section" id="sec-related">
          <h2 class="gb-h2">Concepts Liés</h2>
          <div class="gb-related-grid">
            ${relatedConcepts
              .map(
                (rc) => `
              <a href="./${rc.id}.html" class="gb-related-card">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                  <strong style="font-size:13.5px;color:var(--text-primary)">${rc.name}</strong>
                  <span class="gb-tag ${rc.dimensionMeta.badgeClass}">${rc.dimensionMeta.label}</span>
                </div>
                <span style="font-size:12px;color:var(--text-muted)">${rc.subtitle}</span>
              </a>
            `
              )
              .join("")}
          </div>
        </section>
      `
          : ""
      }

      <nav class="gb-pager" aria-label="Pagination">
        ${
          prev
            ? `<a href="./${prev.id}.html" class="gb-pager-card"><span class="gb-pager-dir">← Précédent</span><span class="gb-pager-title">${prev.name}</span></a>`
            : `<div></div>`
        }
        ${
          next
            ? `<a href="./${next.id}.html" class="gb-pager-card is-next"><span class="gb-pager-dir">Suivant →</span><span class="gb-pager-title">${next.name}</span></a>`
            : `<div></div>`
        }
      </nav>
    `;

    this.initCodeTabs();
    this.initSandbox();
  }

  initCodeTabs() {
    const tabsEl = document.getElementById("gb-code-tabs");
    const renderTabs = () => {
      tabsEl.innerHTML = ENGINE_TABS.map(
        (t) => `
        <button type="button" class="gb-code-tab ${!this.compareAll && this.activeEngine === t.id ? "is-active" : ""}" data-eng="${t.id}">
          <span class="gb-engine-dot" style="background:${t.dot}"></span>
          <span>${t.label}</span>
        </button>
      `
      ).join("");

      tabsEl.querySelectorAll(".gb-code-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.compareAll = false;
          this.activeEngine = btn.dataset.eng;
          localStorage.setItem(ENGINE_PREF_KEY, this.activeEngine);
          renderTabs();
          this.renderCodePanel();
        });
      });
    };
    renderTabs();

    document.getElementById("gb-code-compare")?.addEventListener("click", () => {
      this.compareAll = !this.compareAll;
      renderTabs();
      this.renderCodePanel();
    });

    const copyBtn = document.getElementById("gb-code-copy");
    copyBtn?.addEventListener("click", async () => {
      const snippets = CodeSnippetBuilder.build(this.concept, this.lastState);
      const raw = snippets[this.activeEngine];
      const text = typeof raw === "string" ? raw : `Unreal Blueprint Node: ${raw?.title || ""}`;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.innerHTML = `${ICONS.check} <span>Copié</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `${ICONS.copy} <span>Copier</span>`;
        }, 1500);
      } catch (_) {}
    });
  }

  initSandbox() {
    const canvas = document.getElementById("gb-sandbox-canvas");
    const toolbar = document.getElementById("gb-sandbox-toolbar");

    this.currentSandbox = SandboxFactory.create(canvas, this.concept, (state) => {
      this.lastState = state || {};
      this.renderCodePanel();
      this.renderLiveTable();
    });

    const controls = this.currentSandbox.getControlsConfig();
    if (!controls || controls.length === 0) {
      toolbar.style.display = "none";
      return;
    }

    toolbar.innerHTML = "";
    controls.forEach((ctrl) => {
      if (ctrl.type === "button") {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gb-btn gb-btn-sm";
        btn.textContent = ctrl.label;
        btn.addEventListener("click", () => ctrl.onClick(btn));
        toolbar.appendChild(btn);
        return;
      }
      const group = document.createElement("div");
      group.className = "gb-ctrl-group";
      const lbl = document.createElement("label");
      lbl.textContent = ctrl.label;
      const input = document.createElement("input");
      input.type = "range";
      input.min = ctrl.min;
      input.max = ctrl.max;
      input.step = ctrl.step;
      input.value = ctrl.value;
      const val = document.createElement("span");
      val.className = "gb-ctrl-val";
      val.textContent = ctrl.value;
      input.addEventListener("input", () => {
        const num = parseFloat(input.value);
        val.textContent = num;
        ctrl.onChange(num);
      });
      group.append(lbl, input, val);
      toolbar.appendChild(group);
    });
  }

  renderCodePanel() {
    const body = document.getElementById("gb-code-body");
    if (!body) return;
    const snippets = CodeSnippetBuilder.build(this.concept, this.lastState);

    if (this.compareAll) {
      body.innerHTML = `
        <div class="gb-compare-grid">
          ${ENGINE_TABS.map((t) => {
            const val = snippets[t.id];
            const inner = t.id === "unrealBp"
              ? BlueprintRenderer.render(val)
              : `<div class="gb-code-body"><pre class="gb-code-pre">${CodeSnippetBuilder.highlight(val)}</pre></div>`;
            return `
              <div class="gb-compare-cell">
                <div class="gb-compare-head">
                  <span class="gb-engine-dot" style="background:${t.dot}"></span>
                  <span>${t.label}</span>
                </div>
                ${inner}
              </div>
            `;
          }).join("")}
        </div>
      `;
      return;
    }

    const active = snippets[this.activeEngine];
    if (this.activeEngine === "unrealBp") {
      body.innerHTML = BlueprintRenderer.render(active);
    } else {
      body.innerHTML = `<div class="gb-code-body"><pre class="gb-code-pre">${CodeSnippetBuilder.highlight(active)}</pre></div>`;
    }
  }

  renderLiveTable() {
    const el = document.getElementById("gb-live-table");
    if (!el) return;
    const s = this.lastState || {};

    if (s.quat) {
      const q = s.quat;
      el.innerHTML = `
        <table class="gb-table">
          <thead><tr><th>Quat X</th><th>Quat Y</th><th>Quat Z</th><th>Scalaire W</th><th>Norme ‖q‖</th></tr></thead>
          <tbody><tr>
            <td class="gb-mono">${q.x.toFixed(4)}</td>
            <td class="gb-mono">${q.y.toFixed(4)}</td>
            <td class="gb-mono">${q.z.toFixed(4)}</td>
            <td class="gb-mono"><strong>${q.w.toFixed(4)}</strong></td>
            <td class="gb-mono">${Math.hypot(q.x, q.y, q.z, q.w).toFixed(4)}</td>
          </tr></tbody>
        </table>`;
      return;
    }

    if (s.points && s.points.length) {
      el.innerHTML = `
        <table class="gb-table">
          <thead><tr><th>Point</th><th>Angle</th><th>Rayon</th><th>(X, Y)</th><th>Résultat</th></tr></thead>
          <tbody>
            ${s.points
              .map(
                (p) => `
              <tr>
                <td><span class="gb-swatch" style="background:${p.color}"></span>P${p.index}</td>
                <td class="gb-mono">${p.angleDeg.toFixed(1)}° (${p.angleRad.toFixed(3)} rad)</td>
                <td class="gb-mono">${p.radius.toFixed(2)}</td>
                <td class="gb-mono">(${p.x.toFixed(3)}, ${p.y.toFixed(3)})</td>
                <td class="gb-mono"><strong>${typeof p.out === "object" ? `sin:${p.out.sin.toFixed(3)}, cos:${p.out.cos.toFixed(3)}` : Number(p.out).toFixed(4)}</strong></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>`;
      return;
    }

    if (s.vecA && s.vecB) {
      el.innerHTML = `
        <table class="gb-table">
          <thead><tr><th>Vecteur / Point A</th><th>Vecteur / Point B</th><th>Dot (A·B)</th><th>Det 2D</th></tr></thead>
          <tbody><tr>
            <td class="gb-mono">(${Number(s.vecA.x || 0).toFixed(3)}, ${Number(s.vecA.y || 0).toFixed(3)}, ${Number(s.vecA.z || 0).toFixed(3)})</td>
            <td class="gb-mono">(${Number(s.vecB.x || 0).toFixed(3)}, ${Number(s.vecB.y || 0).toFixed(3)}, ${Number(s.vecB.z || 0).toFixed(3)})</td>
            <td class="gb-mono"><strong>${Number(s.dot || 0).toFixed(4)}</strong></td>
            <td class="gb-mono"><strong>${Number(s.det || 0).toFixed(4)}</strong></td>
          </tr></tbody>
        </table>`;
      return;
    }

    if (s.probes && s.probes.length) {
      el.innerHTML = `
        <table class="gb-table">
          <thead><tr><th>Sonde</th><th>Entrée</th><th>Sortie f(x)</th></tr></thead>
          <tbody>
            ${s.probes
              .map(
                (p) => `
              <tr>
                <td><span class="gb-swatch" style="background:${p.color}"></span>${p.label || "Curseur"}</td>
                <td class="gb-mono">${Number(p.x).toFixed(3)}</td>
                <td class="gb-mono"><strong>${Number(p.y).toFixed(4)}</strong></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>`;
      return;
    }

    if (s.probe) {
      el.innerHTML = `
        <table class="gb-table">
          <thead><tr><th>Coordonnée U</th><th>Coordonnée V</th><th>Valeur échantillonnée</th></tr></thead>
          <tbody><tr>
            <td class="gb-mono">${Number(s.probe.x).toFixed(3)}</td>
            <td class="gb-mono">${Number(s.probe.y).toFixed(3)}</td>
            <td class="gb-mono"><strong>${Number(s.probe.val || 0).toFixed(4)}</strong></td>
          </tr></tbody>
        </table>`;
      return;
    }

    el.innerHTML = `
      <table class="gb-table">
        <thead><tr><th>Concept</th><th>Dimension</th></tr></thead>
        <tbody><tr>
          <td>${this.concept.name}</td>
          <td class="gb-mono">${this.concept.dimensionMeta.label}</td>
        </tr></tbody>
      </table>`;
  }
}

window.addEventListener("DOMContentLoaded", () => new ConceptPageController());
