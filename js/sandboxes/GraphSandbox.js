import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class GraphSandbox extends BaseSandbox {
  constructor(canvas, concept, onStateChange, onInteract) {
    super(canvas, concept, onStateChange, onInteract);
    this.params = {};
    (concept.params || []).forEach((p) => {
      this.params[p.key] = p.value;
    });

    this.cursorX = ["lerp", "smoothstep", "easing", "expdamp", "balance"].includes(this.mode) ? 0.5 : 0.75;
    this.isDragging = false;

    // Live spring state
    this.springPos = 0;
    this.springVel = 0;
    this.springTarget = 1;
    this.springHistory = new Array(160).fill(0);

    // Loot simulator state
    this.lootRolls = { Commun: 0, Rare: 0, Epique: 0, Legendaire: 0 };
    this.lastLoot = null;

    // PRNG seed state
    this.prngSeed = 1337;
    this.prngHover = { x: 4, y: 3 };

    this.bindEvents();
    this.updateStateAndRender();

    if (this.mode === "spring") {
      this.startSpringLoop();
    }
  }

  getControlsConfig() {
    if (this.mode === "prng") {
      return [
        {
          type: "range",
          key: "seed",
          label: "Seed (Graine)",
          min: 1,
          max: 9999,
          step: 1,
          value: this.prngSeed,
          onChange: (v) => {
            this.prngSeed = Math.round(v);
            this.notifyInteract();
            this.updateStateAndRender();
          }
        },
        {
          type: "button",
          label: "Seed Aléatoire",
          onClick: () => {
            this.prngSeed = Math.floor(Math.random() * 9999) + 1;
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }

    if (this.mode === "loot") {
      const base = (this.concept.params || []).map((p) => ({
        type: "range",
        key: p.key,
        label: p.label,
        min: p.min,
        max: p.max,
        step: p.step,
        value: this.params[p.key],
        onChange: (v) => {
          this.params[p.key] = v;
          this.notifyInteract();
          this.updateStateAndRender();
        }
      }));
      base.push(
        {
          type: "button",
          label: "Tirer 1 Coffre",
          onClick: () => {
            this.rollLoot(1);
            this.notifyInteract();
          }
        },
        {
          type: "button",
          label: "Simuler ×100",
          onClick: () => {
            this.rollLoot(100);
            this.notifyInteract();
          }
        },
        {
          type: "button",
          label: "Reset",
          onClick: () => {
            this.lootRolls = { Commun: 0, Rare: 0, Epique: 0, Legendaire: 0 };
            this.lastLoot = null;
            this.updateStateAndRender();
          }
        }
      );
      return base;
    }

    const sliders = (this.concept.params || []).map((p) => ({
      type: "range",
      key: p.key,
      label: p.label,
      min: p.min,
      max: p.max,
      step: p.step,
      value: this.params[p.key],
      onChange: (v) => {
        this.params[p.key] = v;
        this.notifyInteract();
        this.updateStateAndRender();
      }
    }));

    if (this.mode === "spring") {
      sliders.push(
        {
          type: "button",
          label: "Inverser Cible",
          onClick: () => {
            this.springTarget = this.springTarget > 0 ? -1 : 1;
            this.notifyInteract();
          }
        },
        {
          type: "button",
          label: "Impulsion Recul",
          onClick: () => {
            this.springVel += 12;
            this.notifyInteract();
          }
        }
      );
    }

    return sliders;
  }

  getLootWeights() {
    const leg = this.params.a ?? 5;
    const rare = this.params.b ?? 25;
    return [
      { name: "Commun", w: 60, color: "#8b949e" },
      { name: "Rare", w: rare, color: "#58a6ff" },
      { name: "Epique", w: 15, color: "#bc8cff" },
      { name: "Legendaire", w: leg, color: "#e3b341" }
    ];
  }

  rollLoot(count) {
    const items = this.getLootWeights();
    const total = items.reduce((s, it) => s + it.w, 0);
    for (let i = 0; i < count; i++) {
      let r = Math.random() * total;
      let picked = items[items.length - 1];
      for (const it of items) {
        r -= it.w;
        if (r <= 0) {
          picked = it;
          break;
        }
      }
      this.lootRolls[picked.name] = (this.lootRolls[picked.name] || 0) + 1;
      this.lastLoot = picked;
    }
    this.updateStateAndRender();
  }

  startSpringLoop() {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const w = this.params.a ?? 8;
      const z = this.params.b ?? 0.45;
      // Semi-implicit Euler spring with 2 substeps for guaranteed stability
      const sub = dt / 2;
      for (let i = 0; i < 2; i++) {
        const accel = -2 * z * w * this.springVel - w * w * (this.springPos - this.springTarget);
        this.springVel += accel * sub;
        this.springPos += this.springVel * sub;
      }
      this.springHistory.push(this.springPos);
      if (this.springHistory.length > 180) this.springHistory.shift();
      this.render();
      this.emitState({
        mode: "spring",
        probes: [{ label: "Ressort x(t)", x: this.springTarget, y: this.springPos, vel: this.springVel, color: "#58a6ff" }],
        params: this.params
      });
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  bindEvents() {
    this.bindPointer(
      (pos) => {
        if (this.mode === "bitmask" || this.mode === "loot") return;
        if (this.mode === "prng") {
          const cols = 12, rows = 7;
          const cellW = (this.width - 48) / cols;
          const cellH = (this.height - 90) / rows;
          const gx = MathEvaluator.clamp(Math.floor((pos.x - 24) / cellW), 0, cols - 1);
          const gy = MathEvaluator.clamp(Math.floor((pos.y - 36) / cellH), 0, rows - 1);
          this.prngHover = { x: gx, y: gy };
          this.updateStateAndRender();
          return;
        }
        if (this.mode === "spring") {
          const norm = MathEvaluator.clamp(((pos.x - 40) / (this.width - 80)) * 2 - 1, -1.2, 1.2);
          this.springTarget = norm;
          return;
        }
        this.isDragging = true;
        this.updateCursorFromPos(pos);
      },
      (pos) => {
        if (this.mode === "prng" && pos.x > 24 && pos.x < this.width - 24 && pos.y > 36 && pos.y < this.height - 54) {
          const cols = 12, rows = 7;
          const cellW = (this.width - 48) / cols;
          const cellH = (this.height - 90) / rows;
          this.prngHover = {
            x: MathEvaluator.clamp(Math.floor((pos.x - 24) / cellW), 0, cols - 1),
            y: MathEvaluator.clamp(Math.floor((pos.y - 36) / cellH), 0, rows - 1)
          };
          this.updateStateAndRender();
          return;
        }
        if (!this.isDragging) return;
        this.updateCursorFromPos(pos);
      },
      () => {
        this.isDragging = false;
      }
    );
  }

  updateCursorFromPos(pos) {
    const { cx, scale, minX, maxX } = this.getGeometry();
    const x = (pos.x - cx) / scale;
    this.cursorX = MathEvaluator.clamp(x, minX, maxX);
    this.updateStateAndRender();
  }

  getGeometry() {
    if (["lerp", "smoothstep", "easing", "expdamp", "balance"].includes(this.mode)) {
      const marginX = 64;
      const spanX = this.mode === "expdamp" || this.mode === "balance" ? 3.5 : 1.5;
      const scale = Math.min((this.width - marginX * 2) / (spanX + 0.4), this.height * 0.24);
      return {
        cx: marginX + scale * 0.25,
        cy: this.height * 0.66,
        scale,
        minX: 0,
        maxX: this.mode === "expdamp" || this.mode === "balance" ? 3.5 : 1.0
      };
    }
    return {
      cx: this.width / 2,
      cy: this.height * 0.56,
      scale: Math.min(this.width, this.height) * 0.105,
      minX: -4.0,
      maxX: 4.0
    };
  }

  updateStateAndRender() {
    const y = MathEvaluator.evaluate1D(this.mode, this.cursorX, this.params);
    this.computedProbes = [
      {
        label: this.mode === "balance" ? (Math.round(this.params.b || 0) === 1 ? "Niveau" : "Armure") : "Entrée X",
        x: this.cursorX,
        y,
        color: "#e3b341"
      }
    ];
    this.render();
    this.emitState({
      mode: this.mode,
      probes: this.computedProbes,
      params: this.params,
      seed: this.prngSeed,
      prngCell: this.prngHover,
      prngVal: MathEvaluator.hash2D(this.prngHover.x, this.prngHover.y, this.prngSeed),
      lootWeights: this.mode === "loot" ? this.getLootWeights() : null,
      lastLoot: this.lastLoot
    });
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === "bitmask") return this.renderBitmask(ctx, colors);
    if (this.mode === "spring") return this.renderSpring(ctx, colors);
    if (this.mode === "loot") return this.renderLoot(ctx, colors);
    if (this.mode === "prng") return this.renderPrng(ctx, colors);
    if (this.mode === "expdamp") return this.renderExpDamp(ctx, colors);

    const { cx, cy, scale, minX, maxX } = this.getGeometry();
    this.drawGrid(ctx, cx, cy, scale, colors, true);

    // Optional reference curve
    if (this.mode === "smoothstep") {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = colors.aux;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= this.width; px += 3) {
        const x = (px - cx) / scale;
        const a = this.params.a ?? -1.75;
        const b = this.params.b ?? 2.0;
        const y = a + (b - a) * MathEvaluator.smootherStep(x);
        const py = cy - y * scale;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (this.mode === "balance" && Math.round(this.params.b || 0) === 0) {
      // Also plot Effective HP multiplier (linear!)
      const k = Math.max(10, this.params.a ?? 100);
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = colors.y;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let px = cx; px <= this.width; px += 3) {
        const x = (px - cx) / scale;
        const armor = Math.max(0, x * 100);
        const ehpMult = (1 + armor / k) * 0.5;
        const py = cy - ehpMult * scale;
        if (px === cx) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Main curve
    ctx.beginPath();
    ctx.strokeStyle = colors.z;
    ctx.lineWidth = 2.8;
    let started = false;
    for (let px = 0; px <= this.width; px += 2) {
      const x = (px - cx) / scale;
      if (this.mode === "easing" && (x < 0 || x > 1)) continue;
      if (this.mode === "balance" && x < 0) continue;
      const y = MathEvaluator.evaluate1D(this.mode, x, this.params);
      const py = cy - y * scale;
      if (!Number.isFinite(py) || Math.abs(py) > this.height * 4) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Cursor probe
    const p = this.computedProbes[0];
    const px = cx + p.x * scale;
    const py = cy - p.y * scale;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, this.height);
    ctx.moveTo(0, py);
    ctx.lineTo(this.width, py);
    ctx.stroke();
    ctx.restore();

    this.drawHandle(ctx, px, py, colors.accent, `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`, colors);

    // Top 1D gameplay preview track
    this.drawPreviewBar(ctx, p.x, p.y, colors);

    let msg = `Glissez horizontalement — x = ${p.x.toFixed(2)}  →  f(x) = ${p.y.toFixed(3)}`;
    if (this.mode === "smoothstep") msg = `Bleu: SmoothStep (3t²-2t³) | Violet pointillé: SmootherStep (6t⁵-15t⁴+10t³) | t = ${p.x.toFixed(2)}`;
    if (this.mode === "balance" && Math.round(this.params.b || 0) === 0) {
      const armor = Math.round(Math.max(0, p.x * 100));
      const k = this.params.a ?? 100;
      const dmgPct = (p.y * 100).toFixed(1);
      const ehp = (1 + armor / k).toFixed(2);
      msg = `Armure ${armor} (K=${k}) → Dégâts reçus: ${dmgPct}% | Vie Effective (vert): ×${ehp}`;
    }
    this.drawStatusBanner(ctx, msg, colors.text, colors);
  }

  drawPreviewBar(ctx, x, y, colors) {
    const barW = Math.min(440, this.width - 36);
    const barX = (this.width - barW) / 2;
    const barY = 14;
    ctx.save();
    ctx.fillStyle = colors.isLight ? "rgba(255,255,255,0.92)" : "rgba(22,27,34,0.9)";
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    this.roundRect(ctx, barX, barY, barW, 44, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors.secondary;
    ctx.font = '600 11px "SF Mono", Consolas, monospace';
    ctx.fillText(`SORTIE TEMPS RÉEL : ${y.toFixed(3)}`, barX + 12, barY + 17);

    const trackX = barX + 12;
    const trackW = barW - 24;
    const trackY = barY + 31;
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trackX, trackY);
    ctx.lineTo(trackX + trackW, trackY);
    ctx.stroke();

    const norm = MathEvaluator.clamp01((y + 3) / 6);
    const dotX = trackX + norm * trackW;
    ctx.beginPath();
    ctx.arc(dotX, trackY, 6, 0, Math.PI * 2);
    ctx.fillStyle = colors.y;
    ctx.fill();
    ctx.restore();
  }

  renderExpDamp(ctx, colors) {
    const { cx, cy, scale } = this.getGeometry();
    this.drawGrid(ctx, cx, cy, scale, colors, true);

    const lambda = this.params.a ?? 6.0;
    const lowFps = this.params.b ?? 20;

    // Exact continuous exponential curve (144fps and 20fps BOTH fall right on it!)
    ctx.strokeStyle = colors.y;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = cx; px <= this.width; px += 3) {
      const t = (px - cx) / scale;
      const y = 1 - Math.exp(-lambda * t);
      const py = cy - y * scale * 2.2;
      if (px === cx) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Exact exp(-lambda*dt) discrete points at lowFps
    const dt = 1 / lowFps;
    let exactVal = 0;
    let naiveVal = 0;
    ctx.strokeStyle = colors.x;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let step = 1; step <= Math.ceil(3.5 * lowFps); step++) {
      const t = step * dt;
      naiveVal = naiveVal + (1 - naiveVal) * Math.min(1, lambda * dt);
      const px = cx + t * scale;
      const py = cy - naiveVal * scale * 2.2;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw sample dots for exact exp-damp at lowFps (they land ON the green curve!)
    for (let step = 0; step <= Math.ceil(3.5 * lowFps); step++) {
      const t = step * dt;
      if (step > 0) {
        exactVal = exactVal + (1 - exactVal) * (1 - Math.exp(-lambda * dt));
      }
      const px = cx + t * scale;
      if (px > this.width - 10) break;
      const py = cy - exactVal * scale * 2.2;
      ctx.beginPath();
      ctx.arc(px, py, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = colors.y;
      ctx.fill();
    }

    const p = this.computedProbes[0];
    const px = cx + p.x * scale;
    const py = cy - p.y * scale * 2.2;
    this.drawHandle(ctx, px, py, colors.accent, `t=${p.x.toFixed(2)}s → ${(p.y * 100).toFixed(0)}%`, colors);
    this.drawStatusBanner(
      ctx,
      `Vert: 1 - exp(-λ·dt) identique à ${lowFps} & 144 FPS | Rouge: Lerp(a,b,λ·dt) diverge à ${lowFps} FPS`,
      colors.text,
      colors
    );
  }

  renderSpring(ctx, colors) {
    const padX = 44;
    const trackY = 82;
    const trackW = this.width - padX * 2;
    const toScreenX = (v) => padX + ((v + 1.4) / 2.8) * trackW;

    // Top spring rail
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padX, trackY);
    ctx.lineTo(padX + trackW, trackY);
    ctx.stroke();

    const tx = toScreenX(this.springTarget);
    const px = toScreenX(MathEvaluator.clamp(this.springPos, -1.35, 1.35));

    // Coil spring zig-zag
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const coils = 14;
    ctx.moveTo(tx, trackY);
    for (let i = 1; i < coils; i++) {
      const f = i / coils;
      const cx = tx + (px - tx) * f;
      const cy = trackY + (i % 2 === 0 ? -11 : 11);
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(px, trackY);
    ctx.stroke();

    // Target & mass
    this.drawHandle(ctx, tx, trackY, colors.accent, `Cible (${this.springTarget.toFixed(2)})`, colors, -30, -22);
    this.drawHandle(ctx, px, trackY, colors.z, `Masse (${this.springPos.toFixed(2)})`, colors, -26, 26);

    // Live oscilloscope graph below
    const gTop = 148;
    const gH = this.height - gTop - 54;
    const gMid = gTop + gH / 2;
    ctx.fillStyle = colors.surface;
    ctx.strokeStyle = colors.border;
    this.roundRect(ctx, padX, gTop, trackW, gH, 8);
    ctx.fill();
    ctx.stroke();

    // Target dashed line
    const targetLineY = gMid - this.springTarget * (gH * 0.34);
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(padX, targetLineY);
    ctx.lineTo(padX + trackW, targetLineY);
    ctx.stroke();
    ctx.restore();

    // History wave
    ctx.strokeStyle = colors.z;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    this.springHistory.forEach((val, idx) => {
      const hx = padX + (idx / (this.springHistory.length - 1)) * trackW;
      const hy = gMid - MathEvaluator.clamp(val, -1.6, 1.6) * (gH * 0.34);
      if (idx === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    });
    ctx.stroke();

    const z = this.params.b ?? 0.45;
    const regime = z < 0.95 ? "Sous-amorti (Rebond / Juice)" : z <= 1.05 ? "Critique (SmoothDamp idéal)" : "Sur-amorti (Lourd)";
    this.drawStatusBanner(ctx, `Cliquez sur le rail pour déplacer la cible | ζ=${z.toFixed(2)} : ${regime}`, colors.z, colors);
  }

  renderBitmask(ctx, colors) {
    const a = Math.round(this.params.a ?? 45) & 0xff;
    const b = Math.round(this.params.b ?? 23) & 0xff;
    const rows = [
      { label: "Masque A", val: a, color: colors.z },
      { label: "Masque B", val: b, color: colors.accent },
      { label: "A | B  (OR — Fusion Layers)", val: a | b, color: colors.y },
      { label: "A & B  (AND — Intersection)", val: a & b, color: colors.aux },
      { label: "A ^ B  (XOR — Différence)", val: a ^ b, color: colors.x }
    ];

    const startX = 220;
    const cellW = Math.min(44, (this.width - startX - 36) / 8 - 6);
    const rowH = 58;

    // Bit headers
    ctx.font = '600 11px "SF Mono", Consolas, monospace';
    ctx.fillStyle = colors.muted;
    for (let bit = 7; bit >= 0; bit--) {
      const col = 7 - bit;
      ctx.fillText(`1<<${bit}`, startX + col * (cellW + 6) + 3, 40);
    }

    rows.forEach((row, rIdx) => {
      const y = 56 + rIdx * rowH;
      ctx.fillStyle = colors.text;
      ctx.font = '600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText(row.label, 22, y + 25);

      for (let bit = 7; bit >= 0; bit--) {
        const col = 7 - bit;
        const on = ((row.val >> bit) & 1) === 1;
        const bx = startX + col * (cellW + 6);
        ctx.fillStyle = on ? row.color + "33" : colors.surface;
        ctx.strokeStyle = on ? row.color : colors.border;
        ctx.lineWidth = on ? 1.8 : 1;
        this.roundRect(ctx, bx, y, cellW, 38, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = on ? row.color : colors.muted;
        ctx.font = '700 14px "SF Mono", Consolas, monospace';
        ctx.fillText(on ? "1" : "0", bx + cellW / 2 - 4, y + 24);
      }

      ctx.fillStyle = colors.muted;
      ctx.font = '600 12px "SF Mono", Consolas, monospace';
      ctx.fillText(`= ${row.val}`, startX + 8 * (cellW + 6) + 8, y + 24);
    });

    this.drawStatusBanner(ctx, `Test collision : (A & B) != 0  →  ${(a & b) !== 0 ? "TRUE (collision autorisée)" : "FALSE (ignoré)"}`, (a & b) !== 0 ? colors.y : colors.x, colors);
  }

  renderLoot(ctx, colors) {
    const items = this.getLootWeights();
    const totalW = items.reduce((s, it) => s + it.w, 0);
    const totalRolls = Object.values(this.lootRolls).reduce((s, n) => s + n, 0);

    const pad = 28;
    const barW = this.width - pad * 2;
    const barY = 58;
    const barH = 44;

    ctx.fillStyle = colors.secondary;
    ctx.font = '600 12px "SF Mono", Consolas, monospace';
    ctx.fillText(`DISTRIBUTION CUMULÉE (CDF) — Poids Total Σw = ${totalW}`, pad, 42);

    let cursor = pad;
    items.forEach((it) => {
      const segW = (it.w / totalW) * barW;
      ctx.fillStyle = it.color + "38";
      ctx.strokeStyle = it.color;
      ctx.lineWidth = 1.6;
      ctx.fillRect(cursor, barY, segW, barH);
      ctx.strokeRect(cursor, barY, segW, barH);
      if (segW > 46) {
        ctx.fillStyle = colors.text;
        ctx.font = '600 11.5px "SF Mono", Consolas, monospace';
        ctx.fillText(`${((it.w / totalW) * 100).toFixed(0)}%`, cursor + 8, barY + 26);
      }
      cursor += segW;
    });

    // Histogram of actual rolls vs theoretical
    const histTop = 148;
    const histH = 190;
    const colW = (barW - 36) / items.length;

    items.forEach((it, idx) => {
      const x = pad + idx * (colW + 12);
      const theoPct = it.w / totalW;
      const actualCount = this.lootRolls[it.name] || 0;
      const actualPct = totalRolls > 0 ? actualCount / totalRolls : 0;

      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.border;
      this.roundRect(ctx, x, histTop, colW, histH, 8);
      ctx.fill();
      ctx.stroke();

      // Theoretical bar
      const thH = theoPct * (histH - 54);
      ctx.fillStyle = it.color + "33";
      ctx.fillRect(x + 14, histTop + histH - 36 - thH, colW * 0.35, thH);

      // Observed bar
      const obH = actualPct * (histH - 54);
      ctx.fillStyle = it.color;
      ctx.fillRect(x + colW * 0.52, histTop + histH - 36 - obH, colW * 0.35, obH);

      ctx.fillStyle = colors.text;
      ctx.font = '600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText(it.name, x + 12, histTop + 22);

      ctx.fillStyle = colors.muted;
      ctx.font = '11px "SF Mono", Consolas, monospace';
      ctx.fillText(`Théo ${(theoPct * 100).toFixed(1)}% | Obs ${actualCount}`, x + 10, histTop + histH - 12);
    });

    const msg = this.lastLoot
      ? `Dernier tirage : ${this.lastLoot.name} | Total tirages : ${totalRolls} (Gauche: Théorique, Droite: Observé)`
      : `Cliquez sur "Tirer 1 Coffre" ou "Simuler ×100" pour vérifier la loi des grands nombres.`;
    this.drawStatusBanner(ctx, msg, this.lastLoot ? this.lastLoot.color : colors.text, colors);
  }

  renderPrng(ctx, colors) {
    const cols = 12, rows = 7;
    const padX = 24, padTop = 36, padBot = 54;
    const cellW = (this.width - padX * 2) / cols;
    const cellH = (this.height - padTop - padBot) / rows;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const val = MathEvaluator.hash2D(x, y, this.prngSeed);
        const cx = padX + x * cellW;
        const cy = padTop + y * cellH;
        const isSel = x === this.prngHover.x && y === this.prngHover.y;
        const shade = Math.round(val * 215 + 20);
        ctx.fillStyle = `rgb(${Math.round(shade * 0.45)}, ${Math.round(shade * 0.72)}, ${shade})`;
        ctx.fillRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
        if (isSel) {
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(cx + 2, cy + 2, cellW - 4, cellH - 4);
        }
        ctx.fillStyle = val > 0.55 ? "#0d1117" : "#e6edf3";
        ctx.font = '600 10.5px "SF Mono", Consolas, monospace';
        ctx.fillText(val.toFixed(2), cx + 6, cy + cellH / 2 + 4);
      }
    }

    const selHash = MathEvaluator.squirrel3(this.prngHover.x + Math.imul(this.prngHover.y, 198491317), this.prngSeed);
    this.drawStatusBanner(
      ctx,
      `Cell(${this.prngHover.x}, ${this.prngHover.y}) | Seed ${this.prngSeed} → 0x${selHash.toString(16).toUpperCase().padStart(8, "0")} (${(selHash / 4294967295).toFixed(4)})`,
      colors.z,
      colors
    );
  }
}
