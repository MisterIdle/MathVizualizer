import { MATH_CATALOG } from "./data/mathCatalog.js";
import { SidebarView } from "./ui/SidebarView.js";
import { renderCSharpSandbox } from "./sandboxes/CSharpSandbox.js";
import { AppView } from "./ui/AppView.js";

class AppController {
  constructor() {
    this.pageContent = document.getElementById("page-content");
    this.breadcrumbContainer = document.getElementById("breadcrumb-container");

    this.sidebarView = new SidebarView(
      document.getElementById("sidebar-nav"),
      document.getElementById("sidebar-filter"),
      MATH_CATALOG
    );

    this.pageView = new AppView(
      this.pageContent,
      this.breadcrumbContainer
    );

    this.currentCSharpSandbox = null;

    this.initTheme();
    this.initRouter();
  }

  initTheme() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const root = document.documentElement;
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);

      if (this.currentCSharpSandbox && typeof this.currentCSharpSandbox.render === "function") {
        this.currentCSharpSandbox.render();
      } else if (this.pageView && this.pageView.currentSandbox && typeof this.pageView.currentSandbox.render === "function") {
        this.pageView.currentSandbox.render();
      }
    });
  }

  initRouter() {
    const onRoute = () => {
      const hashId = (window.location.hash.replace("#", "") || "cos").toLowerCase();

      if (this.currentCSharpSandbox) {
        if (typeof this.currentCSharpSandbox.destroy === "function") {
          this.currentCSharpSandbox.destroy();
        }
        this.currentCSharpSandbox = null;
      }

      if (hashId === "sandbox-live" || hashId === "csharp-sandbox") {
        this.sidebarView.setActive("sandbox-live");
        this.updateBreadcrumb(["Math Vizualizer", "Laboratoire", "Page Blanche (C# Live)"]);
        this.currentCSharpSandbox = renderCSharpSandbox(this.pageContent);
        return;
      }

      const found = MATH_CATALOG.find((item) => item.id.toLowerCase() === hashId) || MATH_CATALOG[0];
      this.sidebarView.setActive(found.id);
      this.pageView.render(found);
    };

    window.addEventListener("hashchange", onRoute);
    onRoute();
  }

  updateBreadcrumb(items) {
    if (!this.breadcrumbContainer) return;
    this.breadcrumbContainer.innerHTML = items
      .map((item, index) => {
        const isLast = index === items.length - 1;
        return isLast
          ? `<span class="ms-breadcrumb-item is-active">${item}</span>`
          : `<span class="ms-breadcrumb-item">${item}</span><span class="ms-breadcrumb-sep">/</span>`;
      })
      .join(" ");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new AppController();
});