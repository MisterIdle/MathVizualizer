import { SandboxFactory } from "../sandboxes/SandboxFactory.js";
import { CodeSnippetBuilder } from "../core/CodeSnippetBuilder.js";

export class AppView {
  constructor(articleContainer, breadcrumbContainer) {
    this.articleContainer = articleContainer;
    this.breadcrumbContainer = breadcrumbContainer;
    this.currentSandbox = null;
  }

  render(funcItem) {
    if (this.currentSandbox) {
      this.currentSandbox.destroy();
      this.currentSandbox = null;
    }

    this.breadcrumbContainer.innerHTML = `
      <span>Documentation</span>
      <span class="ms-breadcrumb-sep">/</span>
      <span>${funcItem.category}</span>
      <span class="ms-breadcrumb-sep">/</span>
      <strong>${funcItem.name}</strong>
    `;

    const examplesHtml = (funcItem.examples || [])
      .map(
        (ex) => `
        <div class="ms-example-card">
          <div class="ms-example-title">${ex.title}</div>
          <div class="ms-example-desc">${ex.desc}</div>
        </div>
      `
      )
      .join("");

    this.articleContainer.innerHTML = `
      <header class="ms-article-header" id="section-definition">
        <h1 class="ms-article-title">${funcItem.name}</h1>
        <div class="ms-badge-row">
          <span class="ms-badge">Unity: ${funcItem.unitySig}</span>
          <span class="ms-badge">Godot C#: ${funcItem.godotCsSig}</span>
          <span class="ms-badge">C++: ${funcItem.cppSig}</span>
          <span class="ms-badge">UE C++: ${funcItem.unrealSig}</span>
        </div>
        <p class="ms-article-summary">${funcItem.summary}</p>
        ${funcItem.tldr ? `<div class="ms-formula-box" style="margin-top:10px;border-left-color:#51cf66;"><strong>${funcItem.tldr}</strong></div>` : ""}
        <div class="ms-formula-box">Formule : ${funcItem.formula}</div>
        ${examplesHtml ? `<div class="ms-examples-grid">${examplesHtml}</div>` : ""}
      </header>

      <section class="ms-section" id="section-sandbox">
        <h2 class="ms-section-title">Playground Interactif</h2>
        <div class="ms-sandbox-card">
          <div class="ms-sandbox-toolbar" id="sandbox-toolbar"></div>
          <div class="ms-canvas-container">
            <canvas id="sandbox-canvas"></canvas>
          </div>
          <div class="ms-sandbox-footer">
            <span>Cliquez et glissez directement sur le canvas pour manipuler la simulation en temps réel.</span>
          </div>
        </div>
      </section>

      <section class="ms-section" id="section-code">
        <h2 class="ms-section-title">Code Temps Réel (Multi-Moteurs)</h2>
        <div class="ms-code-grid">
          <div class="ms-code-card">
            <div class="ms-code-header">Unity (C# Mathf / Quaternion)</div>
            <pre class="ms-code-pre"><code id="code-unity"></code></pre>
          </div>
          <div class="ms-code-card">
            <div class="ms-code-header">Godot 4 (C# Godot.Mathf)</div>
            <pre class="ms-code-pre"><code id="code-godotCs"></code></pre>
          </div>
          <div class="ms-code-card">
            <div class="ms-code-header">.NET (C# System.Numerics)</div>
            <pre class="ms-code-pre"><code id="code-dotnet"></code></pre>
          </div>
          <div class="ms-code-card">
            <div class="ms-code-header">C++ (std / GLM)</div>
            <pre class="ms-code-pre"><code id="code-cpp"></code></pre>
          </div>
          <div class="ms-code-card">
            <div class="ms-code-header">Unreal Engine (C++ FMath / FQuat)</div>
            <pre class="ms-code-pre"><code id="code-unreal"></code></pre>
          </div>
          <div class="ms-code-card">
            <div class="ms-code-header">Unreal Engine (Blueprint)</div>
            <pre class="ms-code-pre"><code id="code-blueprint"></code></pre>
          </div>
        </div>
      </section>

      <section class="ms-section" id="section-parameters">
        <h2 class="ms-section-title">Valeurs en Direct</h2>
        <div id="live-table-container"></div>
      </section>
    `;

    const canvas = document.getElementById("sandbox-canvas");
    const toolbar = document.getElementById("sandbox-toolbar");

    this.currentSandbox = SandboxFactory.create(canvas, funcItem, (state) => {
      this.updateLiveOutputs(funcItem, state);
    });

    const controls = this.currentSandbox.getControlsConfig();
    if (controls.length === 0) {
      toolbar.style.display = "none";
    } else {
      toolbar.style.display = "flex";
      this.buildToolbar(toolbar, controls);
    }
  }

  buildToolbar(toolbar, controls) {
    toolbar.innerHTML = "";
    controls.forEach((ctrl) => {
      if (ctrl.type === "button") {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ms-btn";
        btn.textContent = ctrl.label;
        btn.addEventListener("click", ctrl.onClick);
        toolbar.appendChild(btn);
        return;
      }

      const group = document.createElement("div");
      group.className = "ms-control-group";

      const label = document.createElement("label");
      label.textContent = ctrl.label;

      const input = document.createElement("input");
      input.type = "range";
      input.min = ctrl.min;
      input.max = ctrl.max;
      input.step = ctrl.step;
      input.value = ctrl.value;

      const valSpan = document.createElement("span");
      valSpan.className = "ms-control-value";
      valSpan.textContent = ctrl.value;

      input.addEventListener("input", () => {
        const num = parseFloat(input.value);
        valSpan.textContent = num;
        ctrl.onChange(num);
      });

      group.appendChild(label);
      group.appendChild(input);
      group.appendChild(valSpan);
      toolbar.appendChild(group);
    });
  }

  updateLiveOutputs(funcItem, state) {
    const snippets = CodeSnippetBuilder.build(funcItem, state);

    document.getElementById("code-unity").textContent = snippets.unity;
    document.getElementById("code-godotCs").textContent = snippets.godotCs;
    document.getElementById("code-dotnet").textContent = snippets.dotnet;
    document.getElementById("code-cpp").textContent = snippets.cpp;
    document.getElementById("code-unreal").textContent = snippets.unreal;
    document.getElementById("code-blueprint").textContent = snippets.blueprint;

    const tableContainer = document.getElementById("live-table-container");
    if (!tableContainer) return;

    if (state.quat) {
      const q = state.quat;
      tableContainer.innerHTML = `
        <table class="ms-table">
          <thead><tr><th>Quaternion X</th><th>Quaternion Y</th><th>Quaternion Z</th><th>Scalaire W</th><th>Norme ||q||</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>${q.x.toFixed(4)}</strong></td>
              <td><strong>${q.y.toFixed(4)}</strong></td>
              <td><strong>${q.z.toFixed(4)}</strong></td>
              <td><strong>${q.w.toFixed(4)}</strong></td>
              <td>${Math.hypot(q.x, q.y, q.z, q.w).toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (state.points) {
      const rows = state.points
        .map(
          (p) => `
        <tr>
          <td><span class="ms-point-pill" style="background:${p.color}"></span>Point ${p.index}</td>
          <td>${p.angleDeg.toFixed(1)}° (${p.angleRad.toFixed(2)} rad)</td>
          <td>${p.radius.toFixed(2)}</td>
          <td>(${p.x.toFixed(2)}, ${p.y.toFixed(2)})</td>
          <td><strong>${typeof p.out === "object" ? `sin:${p.out.sin.toFixed(2)}, cos:${p.out.cos.toFixed(2)}` : p.out.toFixed(4)}</strong></td>
        </tr>
      `
        )
        .join("");

      tableContainer.innerHTML = `<table class="ms-table"><thead><tr><th>Point</th><th>Angle</th><th>Rayon</th><th>Coordonnées (X, Y)</th><th>Sortie ${funcItem.name}</th></tr></thead><tbody>${rows}</tbody></table>`;
    } else if (state.vecA && state.vecB) {
      tableContainer.innerHTML = `
        <table class="ms-table">
          <thead><tr><th>Vecteur A</th><th>Vecteur B</th><th>Dot (A · B)</th><th>Déterminant 2D</th></tr></thead>
          <tbody>
            <tr>
              <td>(${state.vecA.x.toFixed(2)}, ${state.vecA.y.toFixed(2)}, ${state.vecA.z.toFixed(2)})</td>
              <td>(${state.vecB.x.toFixed(2)}, ${state.vecB.y.toFixed(2)}, ${state.vecB.z.toFixed(2)})</td>
              <td><strong>${state.dot.toFixed(3)}</strong></td>
              <td><strong>${(state.det || 0).toFixed(3)}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (state.probes) {
      const rows = state.probes
        .map(
          (p) => `
        <tr>
          <td><span class="ms-point-pill" style="background:${p.color}"></span>Curseur</td>
          <td>${p.x.toFixed(3)}</td>
          <td><strong>${(p.y !== undefined ? p.y : p.val).toFixed(4)}</strong></td>
        </tr>
      `
        )
        .join("");

      tableContainer.innerHTML = `<table class="ms-table"><thead><tr><th>Sonde</th><th>Entrée (X)</th><th>Sortie f(X)</th></tr></thead><tbody>${rows}</tbody></table>`;
    }
  }
}