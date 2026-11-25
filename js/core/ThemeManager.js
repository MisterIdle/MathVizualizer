import { ICONS } from "./Icons.js?v=2.2";

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
    btn.classList.toggle("is-sun", theme === "dark");
    btn.classList.toggle("is-moon", theme !== "dark");
    btn.setAttribute("title", theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre");
    btn.setAttribute("aria-label", theme === "dark" ? "Mode clair" : "Mode sombre");
  }
}
