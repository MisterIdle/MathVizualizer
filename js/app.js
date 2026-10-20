import { MATH_CATALOG } from "./data/mathCatalog.js";
import { SidebarView } from "./ui/SidebarView.js";
import { AppView } from "./ui/AppView.js";

class AppController {
  constructor() {
    this.sidebarView = new SidebarView(
      document.getElementById("sidebar-nav"),
      document.getElementById("sidebar-filter"),
      MATH_CATALOG
    );

    this.pageView = new AppView(
      document.getElementById("page-content"),
      document.getElementById("breadcrumb-container")
    );

    this.initTheme();
    this.initRouter();
  }

  initTheme() {
    const btn = document.getElementById("theme-toggle");
    btn.addEventListener("click", () => {
      const root = document.documentElement;
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      if (this.pageView.currentSandbox) {
        this.pageView.currentSandbox.render();
      }
    });
  }

  initRouter() {
    const onRoute = () => {
      const hashId = window.location.hash.replace("#", "").toLowerCase() || "cos";
      const found = MATH_CATALOG.find((item) => item.id === hashId) || MATH_CATALOG[0];
      this.sidebarView.setActive(found.id);
      this.pageView.render(found);
    };

    window.addEventListener("hashchange", onRoute);
    onRoute();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new AppController();
});