import { ICONS } from "./Icons.js";

const STORAGE_KEY = "mv_theme_v2";

export class ThemeManager {
  static init(toggleBtn, onChange) {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved || "dark";
    document.documentElement.setAttribute("data-theme", initial);
    this.syncButton(toggleBtn, initial);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme") || "dark";
        const next = cur === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_KEY, next);
        this.syncButton(toggleBtn, next);
        if (onChange) onChange(next);
      });
    }
  }

  static syncButton(btn, theme) {
    if (!btn) return;
    btn.innerHTML = theme === "dark" ? ICONS.sun : ICONS.moon;
    btn.setAttribute("title", theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre");
    btn.setAttribute("aria-label", theme === "dark" ? "Thème clair" : "Thème sombre");
  }
}
