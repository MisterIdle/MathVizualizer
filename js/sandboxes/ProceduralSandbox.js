import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class ProceduralSandbox extends BaseSandbox {
  constructor(canvas, concept, onStateChange, onInteract) {
    super(canvas, concept, onStateChange, onInteract);
    this.freq = 3.5;
    this.octaves = 4;
    this.lacunarity = 2.0;
    this.persistence = 0.5;
    this.fbmVisual = 0; // 0: Terrain couleur, 1: Ridged, 2: Niveaux de gris
    this.voronoiMode = 0; // 0: Biomes ID, 1: F1 Caustiques, 2: F2-F1 Fissures
    this.voronoiScale = 4;
    this.sdfK = 0.35;
    this.kelvin = 6500;
    this.hue = 0.58;
    this.probe = { x: 0.48, y: 0.52 };
    this.sdfPos = { x: 0.35, y: 0.05 };
    this.dragging = false;

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.mode === "perlin") {
      return [
        { type: "range", key: "freq", label: "Fréquence", min: 1, max: 10, step: 0.5, value: this.freq, onChange: (v) => { this.freq = v; this.notifyInteract(); this.updateStateAndRender(); } }
      ];
    }
    if (this.mode === "fbm") {
      return [
        { type: "range", key: "oct", label: "Octaves", min: 1, max: 6, step: 1, value: this.octaves, onChange: (v) => { this.octaves = Math.round(v); this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "lac", label: "Lacunarity", min: 1.4, max: 3.0, step: 0.1, value: this.lacunarity, onChange: (v) => { this.lacunarity = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "pers", label: "Persistence", min: 0.2, max: 0.85, step: 0.05, value: this.persistence, onChange: (v) => { this.persistence = v; this.notifyInteract(); this.updateStateAndRender(); } },
        {
          type: "button",
          label: "Style : Terrain Biomes",
          onClick: (btn) => {
            this.fbmVisual = (this.fbmVisual + 1) % 3;
            const lbl = ["Terrain Biomes", "Crêtes (Ridged)", "Heightmap Gris"];
            if (btn) btn.textContent = `Style : ${lbl[this.fbmVisual]}`;
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "voronoi") {
      return [
        { type: "range", key: "vs", label: "Densité Cellules", min: 2, max: 8, step: 1, value: this.voronoiScale, onChange: (v) => { this.voronoiScale = Math.round(v); this.notifyInteract(); this.updateStateAndRender(); } },
        {
          type: "button",
          label: "Vue : Biomes (ID)",
          onClick: (btn) => {
            this.voronoiMode = (this.voronoiMode + 1) % 3;
            const lbl = ["Biomes (ID)", "Distance F₁ (Caustiques)", "Fissures (F₂ - F₁)"];
            if (btn) btn.textContent = `Vue : ${lbl[this.voronoiMode]}`;
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "sdf") {
      return [
        { type: "range", key: "k", label: "Smooth Min (k)", min: 0.0, max: 0.8, step: 0.02, value: this.sdfK, onChange: (v) => { this.sdfK = v; this.notifyInteract(); this.updateStateAndRender(); } }
      ];
    }
    if (this.mode === "color") {
      return [
        { type: "range", key: "kelvin", label: "Température (K)", min: 1200, max: 16000, step: 100, value: this.kelvin, onChange: (v) => { this.kelvin = v; this.notifyInteract(); this.updateStateAndRender(); } }
      ];
    }
    return [];
  }

  bindEvents() {
    const move = (pos) => {
      if (!this.dragging) return;
      if (this.mode === "sdf") {
        const aspect = this.width / this.height;
        this.sdfPos.x = MathEvaluator.clamp(((pos.x / this.width) * 2 - 1) * aspect, -1.4, 1.4);
        this.sdfPos.y = MathEvaluator.clamp(-((pos.y / this.height) * 2 - 1), -0.85, 0.85);
      } else {
        this.probe.x = MathEvaluator.clamp01(pos.x / this.width);
        this.probe.y = MathEvaluator.clamp01(pos.y / this.height);
      }
      this.updateStateAndRender();
    };
    this.bindPointer(
      (pos) => { this.dragging = true; move(pos); },
      move,
      () => { this.dragging = false; }
    );
  }

  evalSdf(px, py) {
    // Static rounded box on left
    const bx = Math.abs(px + 0.42) - 0.36;
    const by = Math.abs(py) - 0.32;
    const dBox = Math.hypot(Math.max(bx, 0), Math.max(by, 0)) + Math.min(Math.max(bx, by), 0) - 0.08;
    // Draggable circle
    const dCirc = Math.hypot(px - this.sdfPos.x, py - this.sdfPos.y) - 0.38;
    if (this.sdfK <= 0.005) return Math.min(dBox, dCirc);
    const h = Math.max(this.sdfK - Math.abs(dBox - dCirc), 0) / this.sdfK;
    return Math.min(dBox, dCirc) - h * h * this.sdfK * 0.25;
  }

  updateStateAndRender() {
    this.render();
    let val = 0;
    if (this.mode === "perlin") val = MathEvaluator.perlin2D(this.probe.x * this.freq, this.probe.y * this.freq);
    else if (this.mode === "fbm") val = MathEvaluator.fbm2D(this.probe.x * 3.5, this.probe.y * 3.5, this.octaves, this.lacunarity, this.persistence, this.fbmVisual === 1);
    else if (this.mode === "sdf") val = this.evalSdf(0, 0);

    this.emitState({
      mode: this.mode,
      probe: { ...this.probe, val },
      freq: this.freq,
      octaves: this.octaves,
      lacunarity: this.lacunarity,
      persistence: this.persistence,
      sdfK: this.sdfK,
      sdfPos: this.sdfPos,
      kelvin: this.kelvin,
      rgb: MathEvaluator.kelvinToRGB(this.kelvin)
    });
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === "color") return this.renderColorSpaces(ctx, colors);
    if (this.mode === "sdf") return this.renderSdf(ctx, colors);
    if (this.mode === "voronoi") return this.renderVoronoi(ctx, colors);
    this.renderNoise(ctx, colors);
  }

  renderNoise(ctx, colors) {
    const step = 6;
    const cols = Math.ceil(this.width / step);
    const rows = Math.ceil(this.height / step);
    const isFbm = this.mode === "fbm";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = (c * step) / this.width;
        const v = (r * step) / this.height;
        const n = isFbm
          ? MathEvaluator.fbm2D(u * 3.5, v * 3.5, this.octaves, this.lacunarity, this.persistence, this.fbmVisual === 1)
          : MathEvaluator.perlin2D(u * this.freq, v * this.freq);

        if (isFbm && this.fbmVisual === 0) {
          if (n < 0.36) ctx.fillStyle = "#163a5f";
          else if (n < 0.44) ctx.fillStyle = "#245c8a";
          else if (n < 0.49) ctx.fillStyle = "#c9b37e";
          else if (n < 0.66) ctx.fillStyle = "#3f7d47";
          else if (n < 0.78) ctx.fillStyle = "#6c737a";
          else ctx.fillStyle = "#e6edf3";
        } else {
          const g = Math.round(MathEvaluator.clamp01(n) * 255);
          ctx.fillStyle = `rgb(${g},${g},${g})`;
        }
        ctx.fillRect(c * step, r * step, step, step);
      }
    }

    const px = this.probe.x * this.width;
    const py = this.probe.y * this.height;
    const sample = isFbm
      ? MathEvaluator.fbm2D(this.probe.x * 3.5, this.probe.y * 3.5, this.octaves, this.lacunarity, this.persistence, this.fbmVisual === 1)
      : MathEvaluator.perlin2D(this.probe.x * this.freq, this.probe.y * this.freq);
    this.drawHandle(ctx, px, py, colors.accent, `val = ${sample.toFixed(3)}`, colors);
    this.drawStatusBanner(
      ctx,
      isFbm
        ? `fBm : ${this.octaves} octaves · Lacunarity ${this.lacunarity.toFixed(1)} · Persistence ${this.persistence.toFixed(2)} → h = ${sample.toFixed(3)}`
        : `Perlin(${(this.probe.x * this.freq).toFixed(2)}, ${(this.probe.y * this.freq).toFixed(2)}) = ${sample.toFixed(4)}`,
      colors.accent,
      colors
    );
  }

  renderVoronoi(ctx, colors) {
    const step = 6;
    const sc = this.voronoiScale;
    const cols = Math.ceil(this.width / step);
    const rows = Math.ceil(this.height / step);
    const aspect = this.width / this.height;

    const sitePos = (ix, iy) => ({
      x: ix + MathEvaluator.hash2D(ix, iy, 101) * 0.8 + 0.1,
      y: iy + MathEvaluator.hash2D(ix, iy, 202) * 0.8 + 0.1
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = ((c * step) / this.width) * sc * aspect;
        const py = ((r * step) / this.height) * sc;
        const gx = Math.floor(px), gy = Math.floor(py);

        let f1 = 99, f2 = 99, bestId = 0;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const s = sitePos(gx + ox, gy + oy);
            const d = Math.hypot(px - s.x, py - s.y);
            if (d < f1) {
              f2 = f1; f1 = d;
              bestId = MathEvaluator.hash2D(gx + ox, gy + oy, 777);
            } else if (d < f2) {
              f2 = d;
            }
          }
        }

        if (this.voronoiMode === 0) {
          const rgb = MathEvaluator.hsvToRgb(bestId, 0.45, 0.55);
          ctx.fillStyle = `rgb(${Math.round(rgb.r * 255)},${Math.round(rgb.g * 255)},${Math.round(rgb.b * 255)})`;
        } else if (this.voronoiMode === 1) {
          const v = Math.round(MathEvaluator.clamp01(f1 * 1.15) * 255);
          ctx.fillStyle = `rgb(${Math.round(v * 0.55)},${Math.round(v * 0.82)},${v})`;
        } else {
          const edge = f2 - f1 < 0.08 ? 240 : 28;
          ctx.fillStyle = `rgb(${edge},${edge},${Math.min(255, edge + 18)})`;
        }
        ctx.fillRect(c * step, r * step, step, step);
      }
    }

    this.drawStatusBanner(
      ctx,
      `Voronoï/Worley (3×3 voisinage O(1)) — Densité ${sc}×${sc} | Cliquez "Vue" pour basculer Biomes / Caustiques / Fissures`,
      colors.text,
      colors
    );
  }

  renderSdf(ctx, colors) {
    const step = 6;
    const aspect = this.width / this.height;
    for (let py = 0; py < this.height; py += step) {
      for (let px = 0; px < this.width; px += step) {
        const x = ((px / this.width) * 2 - 1) * aspect;
        const y = -((py / this.height) * 2 - 1);
        const d = this.evalSdf(x, y);
        const iso = Math.abs(Math.sin(d * 34)) < 0.1 ? 0.78 : 1.0;
        if (d < 0) {
          ctx.fillStyle = `rgb(${Math.round(45 * iso)},${Math.round(135 * iso)},${Math.round(235 * iso)})`;
        } else if (d < 0.025) {
          ctx.fillStyle = "#ffffff";
        } else {
          const fade = Math.exp(-d * 1.6);
          ctx.fillStyle = `rgb(${Math.round((24 + 45 * fade) * iso)},${Math.round((30 + 38 * fade) * iso)},${Math.round((42 + 45 * fade) * iso)})`;
        }
        ctx.fillRect(px, py, step, step);
      }
    }

    const sx = ((this.sdfPos.x / aspect + 1) * 0.5) * this.width;
    const sy = ((1 - this.sdfPos.y) * 0.5) * this.height;
    this.drawHandle(ctx, sx, sy, colors.accent, "Cercle SDF (Glissez !)", colors);
    this.drawStatusBanner(ctx, `SDF 2D + SmoothMin (k=${this.sdfK.toFixed(2)}) | Isolignes de distance exacte (d < 0 dedans, d = 0 contour blanc)`, colors.z, colors);
  }

  renderColorSpaces(ctx, colors) {
    const pad = 28;
    const barW = this.width - pad * 2;
    const barH = 44;

    const drawGrad = (y, title, fn) => {
      ctx.fillStyle = colors.secondary;
      ctx.font = '600 12px "SF Mono", Consolas, monospace';
      ctx.fillText(title, pad, y - 8);
      for (let i = 0; i < barW; i += 2) {
        const t = i / barW;
        const [r, g, b] = fn(t);
        ctx.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
        ctx.fillRect(pad + i, y, 3, barH);
      }
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(pad, y, barW, barH);
    };

    // 1. Naive sRGB Red -> Green (muddy dark brown center!)
    drawGrad(42, "1. Interpolation sRGB naïve (Rouge → Vert = milieu marron sombre)", (t) => [1 - t, t, 0]);
    // 2. Physically Linear interpolation (gamma 2.2 decoded then re-encoded!)
    drawGrad(118, "2. Interpolation Linéaire corrigée Gamma 2.2 (lumineuse & exacte)", (t) => [
      Math.pow(1 - t, 1 / 2.2),
      Math.pow(t, 1 / 2.2),
      0
    ]);
    // 3. HSV Hue interpolation
    drawGrad(194, "3. Interpolation HSV (Teinte constante, saturation préservée)", (t) => {
      const c = MathEvaluator.hsvToRgb(t * 0.33, 0.92, 0.95);
      return [c.r, c.g, c.b];
    });

    // 4. Kelvin swatch
    const kRgb = MathEvaluator.kelvinToRGB(this.kelvin);
    const ky = 272;
    ctx.fillStyle = colors.secondary;
    ctx.font = '600 12px "SF Mono", Consolas, monospace';
    ctx.fillText(`4. Température Physique Kelvin : ${this.kelvin} K`, pad, ky - 8);
    ctx.fillStyle = `rgb(${Math.round(kRgb.r * 255)},${Math.round(kRgb.g * 255)},${Math.round(kRgb.b * 255)})`;
    this.roundRect(ctx, pad, ky, barW, 92, 10);
    ctx.fill();
    ctx.strokeStyle = colors.border;
    ctx.stroke();

    const preset = this.kelvin < 2400 ? "Bougie / Feu de camp" : this.kelvin < 4000 ? "Lampe chaude / Aube" : this.kelvin < 7200 ? "Lumière du jour (Soleil)" : "Ciel polaire / Clair de lune";
    ctx.fillStyle = "#0d1117";
    ctx.font = '700 16px "SF Mono", Consolas, monospace';
    ctx.fillText(`${this.kelvin} K — ${preset}  |  RGB(${kRgb.r.toFixed(2)}, ${kRgb.g.toFixed(2)}, ${kRgb.b.toFixed(2)})`, pad + 18, ky + 52);

    this.drawStatusBanner(ctx, `Glissez le curseur Kelvin ci-dessus | Toujours travailler en espace Linéaire pour les shaders PBR !`, colors.text, colors);
  }
}
