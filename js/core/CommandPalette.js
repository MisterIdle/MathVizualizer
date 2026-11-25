import { MATH_CATALOG } from "../data/catalog.js";
import { ICONS } from "./Icons.js";

export class CommandPalette {
  static init(triggerBtn, conceptUrlPrefix = "./concepts/") {
    const backdrop = document.createElement("div");
    backdrop.className = "mv-palette-backdrop";
    backdrop.innerHTML = `
      <div class="mv-palette" role="dialog" aria-modal="true" aria-label="Recherche rapide">
        <div class="mv-palette-header">
          ${ICONS.search}
          <input type="text" class="mv-palette-input" id="mv-palette-input" placeholder="Rechercher un concept, une fonction (Dot, Slerp, SAT, Perlin, 3D, Unreal)...">
          <span class="mv-kbd">ESC</span>
        </div>
        <div class="mv-palette-results" id="mv-palette-results"></div>
        <div class="mv-palette-footer">
          <span>↑↓ Naviguer · ↵ Ouvrir</span>
          <span>${MATH_CATALOG.length} concepts disponibles</span>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const input = backdrop.querySelector("#mv-palette-input");
    const resultsEl = backdrop.querySelector("#mv-palette-results");
    let selectedIndex = 0;
    let currentMatches = [];

    const open = () => {
      backdrop.classList.add("is-open");
      input.value = "";
      renderList("");
      setTimeout(() => input.focus(), 10);
    };

    const close = () => {
      backdrop.classList.remove("is-open");
    };

    const renderList = (query) => {
      const q = query.trim().toLowerCase();
      currentMatches = MATH_CATALOG.filter((c) => {
        if (!q) return true;
        const hay = `${c.name} ${c.subtitle} ${c.categoryName} ${c.dimensionMeta.label} ${c.formula} ${(c.tags || []).join(" ")} ${Object.values(c.signatures || {}).join(" ")}`.toLowerCase();
        return q.split(/\s+/).every((tok) => hay.includes(tok));
      }).slice(0, 18);

      selectedIndex = 0;
      if (currentMatches.length === 0) {
        resultsEl.innerHTML = `<div class="mv-palette-empty">Aucun concept ne correspond à « ${query} ».</div>`;
        return;
      }

      resultsEl.innerHTML = currentMatches
        .map(
          (c, i) => `
          <a href="${conceptUrlPrefix}${c.id}.html" class="mv-palette-item ${i === 0 ? "is-selected" : ""}" data-idx="${i}">
            <div class="mv-palette-item-left">
              <span class="mv-palette-glyph">${c.glyph}</span>
              <div class="mv-palette-text">
                <span class="mv-palette-title">${c.name}</span>
                <span class="mv-palette-sub">${c.categoryShort} · ${c.subtitle}</span>
              </div>
            </div>
            <span class="mv-badge ${c.dimensionMeta.badgeClass}">${c.dimensionMeta.label}</span>
          </a>
        `
        )
        .join("");
    };

    const updateSelection = () => {
      const items = resultsEl.querySelectorAll(".mv-palette-item");
      items.forEach((el, i) => el.classList.toggle("is-selected", i === selectedIndex));
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    };

    input.addEventListener("input", () => renderList(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = Math.min(currentMatches.length - 1, selectedIndex + 1);
        updateSelection();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = Math.max(0, selectedIndex - 1);
        updateSelection();
      } else if (e.key === "Enter" && currentMatches[selectedIndex]) {
        e.preventDefault();
        window.location.href = `${conceptUrlPrefix}${currentMatches[selectedIndex].id}.html`;
      } else if (e.key === "Escape") {
        close();
      }
    });

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });

    if (triggerBtn) triggerBtn.addEventListener("click", open);

    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (backdrop.classList.contains("is-open")) close();
        else open();
      } else if (e.key === "Escape" && backdrop.classList.contains("is-open")) {
        close();
      }
    });
  }
}
