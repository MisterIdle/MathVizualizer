import { MATH_CATALOG, CATEGORIES, getConceptById, getNeighbors } from "./data/catalog.js";
import { ThemeManager } from "./core/ThemeManager.js";
import { Gamification } from "./core/Gamification.js";
import { CommandPalette } from "./core/CommandPalette.js";
import { SandboxFactory } from "./sandboxes/SandboxFactory.js";
import { CodeSnippetBuilder, ENGINE_TABS } from "./core/CodeSnippetBuilder.js";
import { BlueprintRenderer } from "./core/BlueprintRenderer.js";
import { ICONS } from "./core/Icons.js";

class ConceptPageController {
  constructor() {
    const conceptId = document.body.dataset.conceptId;
    this.concept = getConceptById(conceptId) || MATH_CATALOG[0];
    this.activeEngine = Gamification.getPreferredEngine();
    this.compareAll = false;
    this.currentSandbox = null;
    this.lastState = {};

    this.initShell();
    this.renderSidebar("");
    this.renderArticle();
  }

  initShell() {
    ThemeManager.init(document.getElementById("mv-theme-toggle"), () => {
      if (this.currentSandbox && typeof this.currentSandbox.render === "function") {
        this.currentSandbox.render();
      }
    });

    const searchSlot = document.getElementById("mv-search-icon-slot");
    if (searchSlot) searchSlot.innerHTML = ICONS.search;

    const xpPill = document.getElementById("mv-xp-pill");
    Gamification.renderHeaderPill(xpPill);
    xpPill?.addEventListener("click", () => Gamification.openProfileModal("../"));

    CommandPalette.init(document.getElementById("mv-search-trigger"), "./");

    const filterInput = document.getElementById("mv-sidebar-filter");
    filterInput?.addEventListener("input", () => {
      this.renderSidebar(filterInput.value.trim().toLowerCase());
    });
  }

  renderSidebar(query) {
    const tree = document.getElementById("mv-sidebar-tree");
    if (!tree) return;
    const data = Gamification.load();

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
        <div class="mv-side-group">
          <div class="mv-side-group-title">${cat.index}. ${cat.shortName}</div>
          <ul class="mv-side-list">
            ${items.map((item) => {
              const active = item.id === this.concept.id;
              const mastered = Boolean(data.mastered[item.id]);
              return `
                <li>
                  <a href="./${item.id}.html" class="mv-side-link ${active ? "is-active" : ""}">
                    <span>${item.name}</span>
                    ${mastered ? `<span class="mv-side-check" title="Assimilé">✓</span>` : ""}
                  </a>
                </li>
              `;
            }).join("")}
          </ul>
        </div>
      `);
    });

    tree.innerHTML = html.join("");
    if (!query) {
      tree.querySelector(".mv-side-link.is-active")?.scrollIntoView({ block: "center" });
    }
  }

  renderArticle() {
    const c = this.concept;
    const root = document.getElementById("mv-article-root");
    const data = Gamification.load();
    const isMastered = Boolean(data.mastered[c.id]);
    const isPinned = Boolean(data.pinned[c.id]);
    const { prev, next } = getNeighbors(c.id);

    const relatedConcepts = (c.related || [])
      .map((id) => getConceptById(id))
      .filter(Boolean);

    root.innerHTML = `
      <nav class="mv-breadcrumb" aria-label="Fil d'Ariane">
        <a href="../index.html">Bible Mathématique</a>
        <span>/</span>
        <span>${c.categoryIndex}. ${c.categoryShort}</span>
        <span>/</span>
        <strong style="color:var(--text-primary)">${c.name}</strong>
      </nav>

      <header class="mv-doc-header" id="sec-def">
        <div class="mv-doc-title-row">
          <div class="mv-doc-title-group">
            <span class="mv-doc-glyph">${c.glyph}</span>
            <div>
              <h1 class="mv-doc-title">${c.name}</h1>
              <div class="mv-doc-subtitle">${c.subtitle}</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <button type="button" id="mv-btn-pin" class="mv-btn mv-btn-sm">
              ${isPinned ? ICONS.pinFilled : ICONS.pin}
              <span>${isPinned ? "Épinglé" : "Épingler"}</span>
            </button>
            <button type="button" id="mv-btn-master" class="mv-mastery-btn ${isMastered ? "is-mastered" : ""}">
              ${ICONS.check}
              <span>${isMastered ? "Assimilé" : "Marquer assimilé"}</span>
            </button>
          </div>
        </div>

        <div class="mv-doc-badges">
          <span class="mv-badge ${c.dimensionMeta.badgeClass}">${c.dimensionMeta.label}</span>
          <span class="mv-badge ${c.difficultyMeta.badgeClass}">${c.difficultyMeta.label}</span>
          ${(c.tags || []).map((t) => `<span class="mv-badge">${t}</span>`).join("")}
        </div>

        <p class="mv-doc-summary">${c.summary}</p>

        <div class="mv-callout-grid">
          <div class="mv-callout mv-callout-tldr">
            <span class="mv-callout-label">L'intuition à retenir</span>
            <div>${c.tldr}</div>
          </div>
          <div class="mv-callout mv-callout-formula-box">
            <span class="mv-callout-label">Formule Mathématique</span>
            <div class="mv-callout-formula">${c.formula}</div>
            ${c.formulaVars ? `<div style="font-size:12px;color:var(--text-muted)">${c.formulaVars}</div>` : ""}
          </div>
        </div>
      </header>

      <!-- Interactive Playground -->
      <section class="mv-doc-section" id="sec-sandbox">
        <h2 class="mv-doc-h2">
          <span>Playground Interactif</span>
          <span style="font-size:12px;font-weight:500;color:var(--text-muted)">Manipulation directe temps réel</span>
        </h2>
        <div class="mv-sandbox-card">
          <div class="mv-sandbox-toolbar" id="mv-sandbox-toolbar"></div>
          <div class="mv-canvas-wrap">
            <canvas id="mv-sandbox-canvas"></canvas>
          </div>
          <div class="mv-sandbox-footer">
            <span>Glissez directement les poignées sur le canvas ou ajustez les paramètres pour observer le comportement exact.</span>
          </div>
        </div>
      </section>

      <!-- Live Code Multi-Engines -->
      <section class="mv-doc-section" id="sec-code">
        <h2 class="mv-doc-h2">
          <span>Code Temps Réel Multi-Moteurs</span>
          <span style="font-size:12px;font-weight:500;color:var(--text-muted)">Synchronisé avec le playground</span>
        </h2>
        <div class="mv-code-shell">
          <div class="mv-code-tabs-bar">
            <div class="mv-code-tabs" id="mv-code-tabs"></div>
            <div class="mv-code-actions">
              <button type="button" id="mv-code-compare" class="mv-btn mv-btn-sm mv-btn-ghost" title="Comparer tous les moteurs côte à côte">
                ${ICONS.columns} <span>Comparer</span>
              </button>
              <button type="button" id="mv-code-copy" class="mv-btn mv-btn-sm">
                ${ICONS.copy} <span>Copier</span>
              </button>
            </div>
          </div>
          <div id="mv-code-body"></div>
        </div>
      </section>

      <!-- Live Telemetry Table -->
      <section class="mv-doc-section" id="sec-live">
        <h2 class="mv-doc-h2">Valeurs en Direct</h2>
        <div class="mv-live-table-wrap" id="mv-live-table"></div>
      </section>

      <!-- Concrete Gameplay Use Cases -->
      <section class="mv-doc-section" id="sec-examples">
        <h2 class="mv-doc-h2">Cas d'Usage en Gameplay Programming</h2>
        <div class="mv-cards-2col">
          ${(c.examples || []).map((ex) => `
            <div class="mv-info-card">
              <div class="mv-info-card-title">${ex.title}</div>
              <div class="mv-info-card-body">${ex.desc}</div>
              ${ex.code ? `<pre class="mv-code-pre" style="margin-top:6px;padding:10px 12px;border-radius:6px;background:var(--bg-inset);border:1px solid var(--border-muted);font-size:12px">${CodeSnippetBuilder.highlight(ex.code)}</pre>` : ""}
            </div>
          `).join("")}
        </div>
      </section>

      <!-- Pitfalls & Optimizations -->
      ${(c.pitfalls && c.pitfalls.length > 0) ? `
        <section class="mv-doc-section" id="sec-pitfalls">
          <h2 class="mv-doc-h2">Pièges Classiques &amp; Optimisations Studio</h2>
          <div class="mv-pitfall-list">
            ${c.pitfalls.map((p) => `<div class="mv-pitfall-item">${p}</div>`).join("")}
          </div>
        </section>
      ` : ""}

      <!-- Related Concepts -->
      ${relatedConcepts.length > 0 ? `
        <section class="mv-doc-section" id="sec-related">
          <h2 class="mv-doc-h2">Concepts Liés</h2>
          <div class="mv-related-grid">
            ${relatedConcepts.map((rc) => `
              <a href="./${rc.id}.html" class="mv-related-card">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                  <span class="mv-related-name">${rc.name}</span>
                  <span class="mv-badge ${rc.dimensionMeta.badgeClass}">${rc.dimensionMeta.label}</span>
                </div>
                <span class="mv-related-sub">${rc.subtitle}</span>
              </a>
            `).join("")}
          </div>
        </section>
      ` : ""}

      <!-- Prev / Next Navigation -->
      <nav class="mv-prev-next" aria-label="Concept précédent et suivant">
        ${prev ? `
          <a href="./${prev.id}.html" class="mv-pn-link">
            <span class="mv-pn-dir">← Précédent</span>
            <span class="mv-pn-title">${prev.name}</span>
          </a>
        ` : `<div></div>`}
        ${next ? `
          <a href="./${next.id}.html" class="mv-pn-link is-next">
            <span class="mv-pn-dir">Suivant →</span>
            <span class="mv-pn-title">${next.name}</span>
          </a>
        ` : `<div></div>`}
      </nav>
    `;

    this.bindHeaderActions();
    this.initCodeTabs();
    this.initSandbox();
  }

  bindHeaderActions() {
    const pinBtn = document.getElementById("mv-btn-pin");
    pinBtn?.addEventListener("click", () => {
      const pinned = Gamification.togglePinned(this.concept.id);
      pinBtn.innerHTML = `${pinned ? ICONS.pinFilled : ICONS.pin} <span>${pinned ? "Épinglé" : "Épingler"}</span>`;
    });

    const masterBtn = document.getElementById("mv-btn-master");
    masterBtn?.addEventListener("click", () => {
      const res = Gamification.toggleMastered(this.concept.id);
      masterBtn.classList.toggle("is-mastered", res.mastered);
      masterBtn.innerHTML = `${ICONS.check} <span>${res.mastered ? "Assimilé" : "Marquer assimilé"}</span>`;
      Gamification.renderHeaderPill(document.getElementById("mv-xp-pill"));
      this.renderSidebar(document.getElementById("mv-sidebar-filter")?.value.trim().toLowerCase() || "");
      if (res.mastered) {
        Gamification.showToast(`Concept assimilé : ${this.concept.name}`, "+35 XP");
      }
    });
  }

  initCodeTabs() {
    const tabsEl = document.getElementById("mv-code-tabs");
    const renderTabs = () => {
      tabsEl.innerHTML = ENGINE_TABS.map((t) => `
        <button type="button" class="mv-code-tab ${!this.compareAll && this.activeEngine === t.id ? "is-active" : ""}" data-eng="${t.id}">
          <span class="mv-engine-dot" style="background:${t.dot}"></span>
          <span>${t.label}</span>
        </button>
      `).join("");

      tabsEl.querySelectorAll(".mv-code-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.compareAll = false;
          this.activeEngine = btn.dataset.eng;
          Gamification.setPreferredEngine(this.activeEngine);
          renderTabs();
          this.renderCodePanel();
        });
      });
    };
    renderTabs();

    const compareBtn = document.getElementById("mv-code-compare");
    compareBtn?.addEventListener("click", () => {
      this.compareAll = !this.compareAll;
      renderTabs();
      this.renderCodePanel();
    });

    const copyBtn = document.getElementById("mv-code-copy");
    copyBtn?.addEventListener("click", async () => {
      const snippets = CodeSnippetBuilder.build(this.concept, this.lastState);
      const raw = snippets[this.activeEngine];
      const text = typeof raw === "string" ? raw : `Unreal Blueprint Node: ${raw?.title || ""}`;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.innerHTML = `${ICONS.check} <span>Copié</span>`;
        setTimeout(() => { copyBtn.innerHTML = `${ICONS.copy} <span>Copier</span>`; }, 1500);
      } catch (_) {}
    });
  }

  initSandbox() {
    const canvas = document.getElementById("mv-sandbox-canvas");
    const toolbar = document.getElementById("mv-sandbox-toolbar");

    this.currentSandbox = SandboxFactory.create(
      canvas,
      this.concept,
      (state) => {
        this.lastState = state || {};
        this.renderCodePanel();
        this.renderLiveTable();
      },
      () => {
        const res = Gamification.markExplored(this.concept.id);
        if (res.newlyAwarded) {
          Gamification.renderHeaderPill(document.getElementById("mv-xp-pill"));
          Gamification.showToast(`Playground exploré : ${this.concept.name}`, `+${res.xpGained} XP`);
        }
      }
    );

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
        btn.className = "mv-btn mv-btn-sm";
        btn.textContent = ctrl.label;
        btn.addEventListener("click", () => ctrl.onClick(btn));
        toolbar.appendChild(btn);
        return;
      }
      const group = document.createElement("div");
      group.className = "mv-ctrl-group";
      const lbl = document.createElement("label");
      lbl.textContent = ctrl.label;
      const input = document.createElement("input");
      input.type = "range";
      input.min = ctrl.min;
      input.max = ctrl.max;
      input.step = ctrl.step;
      input.value = ctrl.value;
      const val = document.createElement("span");
      val.className = "mv-ctrl-val";
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
    const body = document.getElementById("mv-code-body");
    if (!body) return;
    const snippets = CodeSnippetBuilder.build(this.concept, this.lastState);

    if (this.compareAll) {
      body.innerHTML = `
        <div class="mv-code-compare-grid">
          ${ENGINE_TABS.map((t) => {
            const val = snippets[t.id];
            const inner = t.id === "unrealBp"
              ? BlueprintRenderer.render(val)
              : `<div class="mv-code-panel"><pre class="mv-code-pre">${CodeSnippetBuilder.highlight(val)}</pre></div>`;
            return `
              <div class="mv-code-compare-cell">
                <div class="mv-code-compare-head">
                  <span style="display:inline-flex;align-items:center;gap:6px"><span class="mv-engine-dot" style="background:${t.dot}"></span>${t.label}</span>
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
      body.innerHTML = `<div class="mv-code-panel"><pre class="mv-code-pre">${CodeSnippetBuilder.highlight(active)}</pre></div>`;
    }
  }

  renderLiveTable() {
    const el = document.getElementById("mv-live-table");
    if (!el) return;
    const s = this.lastState || {};

    if (s.quat) {
      const q = s.quat;
      el.innerHTML = `
        <table class="mv-table">
          <thead><tr><th>Quat X</th><th>Quat Y</th><th>Quat Z</th><th>Scalaire W</th><th>Norme ‖q‖</th></tr></thead>
          <tbody><tr>
            <td class="mono-cell">${q.x.toFixed(4)}</td>
            <td class="mono-cell">${q.y.toFixed(4)}</td>
            <td class="mono-cell">${q.z.toFixed(4)}</td>
            <td class="mono-cell"><strong>${q.w.toFixed(4)}</strong></td>
            <td class="mono-cell">${Math.hypot(q.x, q.y, q.z, q.w).toFixed(4)}</td>
          </tr></tbody>
        </table>`;
      return;
    }

    if (s.points && s.points.length) {
      el.innerHTML = `
        <table class="mv-table">
          <thead><tr><th>Point</th><th>Angle</th><th>Rayon</th><th>(X, Y)</th><th>Résultat</th></tr></thead>
          <tbody>
            ${s.points.map((p) => `
              <tr>
                <td><span class="mv-dot-swatch" style="background:${p.color}"></span>P${p.index}</td>
                <td class="mono-cell">${p.angleDeg.toFixed(1)}° (${p.angleRad.toFixed(3)} rad)</td>
                <td class="mono-cell">${p.radius.toFixed(2)}</td>
                <td class="mono-cell">(${p.x.toFixed(3)}, ${p.y.toFixed(3)})</td>
                <td class="mono-cell"><strong>${typeof p.out === "object" ? `sin:${p.out.sin.toFixed(3)}, cos:${p.out.cos.toFixed(3)}` : Number(p.out).toFixed(4)}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
      return;
    }

    if (s.vecA && s.vecB) {
      el.innerHTML = `
        <table class="mv-table">
          <thead><tr><th>Vecteur / Point A</th><th>Vecteur / Point B</th><th>Dot (A·B)</th><th>Det 2D</th></tr></thead>
          <tbody><tr>
            <td class="mono-cell">(${Number(s.vecA.x || 0).toFixed(3)}, ${Number(s.vecA.y || 0).toFixed(3)}, ${Number(s.vecA.z || 0).toFixed(3)})</td>
            <td class="mono-cell">(${Number(s.vecB.x || 0).toFixed(3)}, ${Number(s.vecB.y || 0).toFixed(3)}, ${Number(s.vecB.z || 0).toFixed(3)})</td>
            <td class="mono-cell"><strong>${Number(s.dot || 0).toFixed(4)}</strong></td>
            <td class="mono-cell"><strong>${Number(s.det || 0).toFixed(4)}</strong></td>
          </tr></tbody>
        </table>`;
      return;
    }

    if (s.probes && s.probes.length) {
      el.innerHTML = `
        <table class="mv-table">
          <thead><tr><th>Sonde</th><th>Entrée</th><th>Sortie f(x)</th></tr></thead>
          <tbody>
            ${s.probes.map((p) => `
              <tr>
                <td><span class="mv-dot-swatch" style="background:${p.color}"></span>${p.label || "Curseur"}</td>
                <td class="mono-cell">${Number(p.x).toFixed(3)}</td>
                <td class="mono-cell"><strong>${Number(p.y).toFixed(4)}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
      return;
    }

    if (s.probe) {
      el.innerHTML = `
        <table class="mv-table">
          <thead><tr><th>Coordonnée U</th><th>Coordonnée V</th><th>Valeur échantillonnée</th></tr></thead>
          <tbody><tr>
            <td class="mono-cell">${Number(s.probe.x).toFixed(3)}</td>
            <td class="mono-cell">${Number(s.probe.y).toFixed(3)}</td>
            <td class="mono-cell"><strong>${Number(s.probe.val || 0).toFixed(4)}</strong></td>
          </tr></tbody>
        </table>`;
      return;
    }

    el.innerHTML = `
      <table class="mv-table">
        <thead><tr><th>Paramètre</th><th>Valeur live</th></tr></thead>
        <tbody><tr>
          <td>Mode actif</td>
          <td class="mono-cell">${this.concept.name} (${this.concept.dimensionMeta.label})</td>
        </tr></tbody>
      </table>`;
  }
}

window.addEventListener("DOMContentLoaded", () => new ConceptPageController());
