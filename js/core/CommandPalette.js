import { MATH_CATALOG } from "../data/catalog.js";
import { ICONS } from "./Icons.js";

export class CommandPalette {
  static init(triggerBtn, conceptUrlPrefix = "./concepts/") {
    const backdrop = document.createElement("div");
    backdrop.className = "gb-palette-backdrop";
    backdrop.innerHTML = `
      <div class="gb-palette" role="dialog" aria-modal="true" aria-label="Recherche rapide">
        <div class="gb-palette-head">
          ${ICONS.search}
          <input type="text" class="gb-palette-input" id="gb-palette-input" placeholder="Rechercher un concept (Dot, Slerp, SAT, Perlin, 3D, Unreal)...">
          <span class="gb-kbd">ESC</span>
        </div>
        <div class="gb-palette-results" id="gb-palette-results"></div>
        <div class="gb-palette-foot">
          <span>↑↓ Naviguer · ↵ Ouvrir</span>
          <span>${MATH_CATALOG.length} concepts</span>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const input = backdrop.querySelector("#gb-palette-input");
    const resultsEl = backdrop.querySelector("#gb-palette-results");
    let selectedIndex = 0;
    let currentMatches = [];

    const open = () => {
      backdrop.classList.add("is-open");
      input.value = "";
      renderList("");
      setTimeout(() => input.focus(), 10);
    };

    const close = () => backdrop.classList.remove("is-open");

    const renderList = (query) => {
      const q = query.trim().toLowerCase();
      currentMatches = MATH_CATALOG.filter((c) => {
        if (!q) return true;
        const hay = `${c.name} ${c.subtitle} ${c.categoryName} ${c.dimensionMeta.label} ${c.formula} ${(c.tags || []).join(" ")} ${Object.values(c.signatures || {}).join(" ")}`.toLowerCase();
        return q.split(/\s+/).every((tok) => hay.includes(tok));
      }).slice(0, 18);

      selectedIndex = 0;
      if (currentMatches.length === 0) {
        resultsEl.innerHTML = `<div style="padding:28px;text-align:center;color:var(--text-muted);font-size:13.5px">Aucun résultat pour « ${query} ».</div>`;
        return;
      }

      resultsEl.innerHTML = currentMatches
        .map(
          (c, i) => `
          <a href="${conceptUrlPrefix}${c.id}.html" class="gb-palette-item ${i === 0 ? "is-selected" : ""}">
            <div>
              <div class="gb-palette-title">${c.name}</div>
              <div class="gb-palette-sub">${c.categoryShort} · ${c.subtitle}</div>
            </div>
            <span class="gb-tag ${c.dimensionMeta.badgeClass}">${c.dimensionMeta.label}</span>
          </a>
        `
        )
        .join("");
    };

    const updateSelection = () => {
      const items = resultsEl.querySelectorAll(".gb-palette-item");
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
