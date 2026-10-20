export class SidebarView {
  constructor(navContainer, filterInput, catalog) {
    this.navContainer = navContainer;
    this.filterInput = filterInput;
    this.catalog = catalog;
    this.activeId = "cos";

    this.filterInput.addEventListener("input", () => {
      this.render(this.filterInput.value.trim().toLowerCase());
    });
  }

  setActive(id) {
    this.activeId = id;
    this.render(this.filterInput.value.trim().toLowerCase());
  }

  render(query = "") {
    const groups = new Map();

    this.catalog.forEach((item) => {
      if (query && !item.name.toLowerCase().includes(query) && !item.category.toLowerCase().includes(query)) {
        return;
      }
      if (!groups.has(item.category)) {
        groups.set(item.category, []);
      }
      groups.get(item.category).push(item);
    });

    this.navContainer.innerHTML = "";

    groups.forEach((items, categoryName) => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "ms-nav-group";

      const titleDiv = document.createElement("div");
      titleDiv.className = "ms-nav-group-title";
      titleDiv.textContent = categoryName;
      groupDiv.appendChild(titleDiv);

      const ul = document.createElement("ul");
      ul.className = "ms-nav-list";

      items.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${item.id}`;
        a.className = `ms-nav-link ${item.id === this.activeId ? "is-active" : ""}`;
        a.textContent = `Mathf.${item.name}`;
        li.appendChild(a);
        ul.appendChild(li);
      });

      groupDiv.appendChild(ul);
      this.navContainer.appendChild(groupDiv);
    });
  }
}