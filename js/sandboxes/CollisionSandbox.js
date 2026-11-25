import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class CollisionSandbox extends BaseSandbox {
  constructor(canvas, concept, onStateChange, onInteract) {
    super(canvas, concept, onStateChange, onInteract);
    this.dragging = null;

    this.pA = { x: -1.5, y: -0.9 };
    this.pB = { x: 1.5, y: -0.9 };
    this.pC = { x: 1.5, y: 1.4 };
    this.pD = { x: 2.4, y: -0.9 };
    this.pP = { x: 0.4, y: 0.2 };

    // Euclide
    this.totalItems = 17;
    this.stackSize = 5;

    // TransformPoint
    this.parentAngle = 32;
    this.transformDirMode = false;

    // Circle-Sphere / Circle-AABB
    this.circleVsBox = true;
    this.circleR = 0.85;

    // OBB SAT
    this.angleA = 18;
    this.angleB = -28;

    // Ray Sphere / Ray Slab
    this.rayO = { x: -2.9, y: -0.7 };
    this.rayDirTarget = { x: -1.1, y: -0.2 };

    // IK (2-Bone Al-Kashi vs 5-bone FABRIK)
    this.ikFabrik = false;
    this.ikTarget = { x: 1.6, y: 0.8 };

    if (this.mode === "thales") {
      this.pA = { x: -2.7, y: -1.1 };
      this.pB = { x: -0.3, y: 0.5 };
      this.pC = { x: -0.3, y: -1.1 };
      this.pD = { x: 2.3, y: -1.1 };
    } else if (this.mode === "normalized") {
      this.pB = { x: 2.3, y: 1.4 };
    } else if (this.mode === "aabb" || this.mode === "sat") {
      this.pA = { x: -0.75, y: 0.1 };
      this.pB = { x: 0.85, y: -0.15 };
    } else if (this.mode === "circlesphere") {
      this.pA = { x: -1.2, y: 0.5 };
      this.pB = { x: 0.8, y: -0.2 };
    } else if (this.mode === "capsule") {
      this.pA = { x: -1.5, y: -0.6 };
      this.pB = { x: 1.4, y: 0.9 };
      this.pP = { x: 0.2, y: -0.9 };
    } else if (this.mode === "barycentric") {
      this.pA = { x: -2.1, y: -1.2 };
      this.pB = { x: 2.1, y: -1.0 };
      this.pC = { x: 0.1, y: 1.8 };
      this.pP = { x: 0.1, y: 0.0 };
    } else if (this.mode === "transformpoint") {
      this.pA = { x: -0.9, y: -0.3 };
      this.pB = { x: 1.6, y: 0.7 }; // local offset
    }

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.mode === "euclide") {
      return [
        { type: "range", key: "tot", label: "Objets (A)", min: 1, max: 35, step: 1, value: this.totalItems, onChange: (v) => { this.totalItems = Math.round(v); this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "stk", label: "Taille Stack (B)", min: 2, max: 10, step: 1, value: this.stackSize, onChange: (v) => { this.stackSize = Math.round(v); this.notifyInteract(); this.updateStateAndRender(); } }
      ];
    }
    if (this.mode === "transformpoint") {
      return [
        { type: "range", key: "ang", label: "Rotation Parent (°)", min: -180, max: 180, step: 5, value: this.parentAngle, onChange: (v) => { this.parentAngle = v; this.notifyInteract(); this.updateStateAndRender(); } },
        {
          type: "button",
          label: "Mode : TransformPoint (T+R)",
          onClick: (btn) => {
            this.transformDirMode = !this.transformDirMode;
            if (btn) btn.textContent = this.transformDirMode ? "Mode : TransformDirection (R seul)" : "Mode : TransformPoint (T+R)";
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "circlesphere") {
      return [
        { type: "range", key: "r", label: "Rayon Cercle", min: 0.35, max: 1.6, step: 0.05, value: this.circleR, onChange: (v) => { this.circleR = v; this.notifyInteract(); this.updateStateAndRender(); } },
        {
          type: "button",
          label: "Test : Cercle vs AABB",
          onClick: (btn) => {
            this.circleVsBox = !this.circleVsBox;
            if (btn) btn.textContent = this.circleVsBox ? "Test : Cercle vs AABB" : "Test : Cercle vs Cercle";
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "sat") {
      return [
        { type: "range", key: "aA", label: "Angle OBB A (°)", min: -90, max: 90, step: 2, value: this.angleA, onChange: (v) => { this.angleA = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "aB", label: "Angle OBB B (°)", min: -90, max: 90, step: 2, value: this.angleB, onChange: (v) => { this.angleB = v; this.notifyInteract(); this.updateStateAndRender(); } }
      ];
    }
    if (this.mode === "capsule") {
      return [
        { type: "range", key: "r", label: "Rayon Capsule", min: 0.3, max: 1.3, step: 0.05, value: this.circleR, onChange: (v) => { this.circleR = v; this.notifyInteract(); this.updateStateAndRender(); } }
      ];
    }
    if (this.mode === "ik") {
      return [
        {
          type: "button",
          label: "Solveur : 2-Bone Al-Kashi",
          onClick: (btn) => {
            this.ikFabrik = !this.ikFabrik;
            if (btn) btn.textContent = this.ikFabrik ? "Solveur : Chaîne FABRIK (5 os)" : "Solveur : 2-Bone Al-Kashi";
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    return [];
  }

  getGeometry() {
    return {
      cx: this.width / 2,
      cy: this.height * 0.48,
      scale: Math.min(this.width, this.height) * 0.145
    };
  }

  toScreen(p, g) {
    return { x: g.cx + p.x * g.scale, y: g.cy - p.y * g.scale };
  }

  bindEvents() {
    this.bindPointer(
      (pos) => {
        if (this.mode === "euclide") return;
        const g = this.getGeometry();
        const hit = (pt) => Math.hypot(pos.x - (g.cx + pt.x * g.scale), pos.y - (g.cy - pt.y * g.scale)) < 30;

        if (this.mode === "pythagore") {
          if (hit(this.pA)) this.dragging = "A";
          else if (hit(this.pC)) this.dragging = "C";
        } else if (this.mode === "thales") {
          if (hit(this.pB)) this.dragging = "B";
          else if (hit(this.pD)) this.dragging = "D";
        } else if (this.mode === "normalized") {
          this.dragging = "B";
        } else if (this.mode === "aabb" || this.mode === "sat" || this.mode === "circlesphere") {
          if (hit(this.pA)) this.dragging = "A";
          else if (hit(this.pB)) this.dragging = "B";
        } else if (this.mode === "capsule") {
          if (hit(this.pP)) this.dragging = "P";
          else if (hit(this.pA)) this.dragging = "A";
          else if (hit(this.pB)) this.dragging = "B";
        } else if (this.mode === "raysphere" || this.mode === "rayslab") {
          if (hit(this.rayDirTarget)) this.dragging = "RD";
          else if (hit(this.rayO)) this.dragging = "RO";
        } else if (this.mode === "barycentric") {
          if (hit(this.pP)) this.dragging = "P";
          else if (hit(this.pA)) this.dragging = "A";
          else if (hit(this.pB)) this.dragging = "B";
          else if (hit(this.pC)) this.dragging = "C";
        } else if (this.mode === "ik") {
          this.dragging = "IK";
          this.movePointer(pos);
        } else if (this.mode === "transformpoint") {
          const rad = (this.parentAngle * Math.PI) / 180;
          const wB = {
            x: this.pA.x + this.pB.x * Math.cos(rad) - this.pB.y * Math.sin(rad),
            y: this.pA.y + this.pB.x * Math.sin(rad) + this.pB.y * Math.cos(rad)
          };
          if (hit(wB)) this.dragging = "TB";
          else if (hit(this.pA)) this.dragging = "A";
        }
      },
      (pos) => this.movePointer(pos),
      () => { this.dragging = null; }
    );
  }

  movePointer(pos) {
    if (!this.dragging) return;
    const g = this.getGeometry();
    const vx = MathEvaluator.clamp((pos.x - g.cx) / g.scale, -3.7, 3.7);
    const vy = MathEvaluator.clamp((g.cy - pos.y) / g.scale, -2.5, 2.5);

    if (this.mode === "pythagore") {
      if (this.dragging === "A") { this.pA.x = vx; this.pA.y = vy; this.pB.y = vy; }
      if (this.dragging === "C") { this.pC.x = vx; this.pC.y = vy; this.pB.x = vx; }
    } else if (this.mode === "thales") {
      if (this.dragging === "B") { this.pB.x = MathEvaluator.clamp(vx, -1.9, 1.2); this.pC.x = this.pB.x; this.pB.y = MathEvaluator.clamp(vy, -0.7, 1.7); }
      if (this.dragging === "D") { this.pD.x = MathEvaluator.clamp(vx, this.pB.x + 0.5, 3.4); }
    } else if (this.dragging === "A") { this.pA.x = vx; this.pA.y = vy; }
    else if (this.dragging === "B") { this.pB.x = vx; this.pB.y = vy; }
    else if (this.dragging === "C") { this.pC.x = vx; this.pC.y = vy; }
    else if (this.dragging === "P") { this.pP.x = vx; this.pP.y = vy; }
    else if (this.dragging === "RO") {
      const dx = this.rayDirTarget.x - this.rayO.x;
      const dy = this.rayDirTarget.y - this.rayO.y;
      this.rayO.x = vx; this.rayO.y = vy;
      this.rayDirTarget.x = vx + dx; this.rayDirTarget.y = vy + dy;
    } else if (this.dragging === "RD") { this.rayDirTarget.x = vx; this.rayDirTarget.y = vy; }
    else if (this.dragging === "IK") { this.ikTarget.x = vx; this.ikTarget.y = vy; }
    else if (this.dragging === "TB") {
      const rad = (-this.parentAngle * Math.PI) / 180;
      const dx = vx - this.pA.x, dy = vy - this.pA.y;
      this.pB.x = dx * Math.cos(rad) - dy * Math.sin(rad);
      this.pB.y = dx * Math.sin(rad) + dy * Math.cos(rad);
    }
    this.updateStateAndRender();
  }

  updateStateAndRender() {
    this.render();
    this.emitState({
      mode: this.mode,
      vecA: this.pA,
      vecB: this.pB,
      vecC: this.pC,
      pointP: this.pP,
      totalItems: this.totalItems,
      stackSize: this.stackSize,
      parentAngle: this.parentAngle,
      circleR: this.circleR,
      angleA: this.angleA,
      angleB: this.angleB,
      rayO: this.rayO,
      rayD: { x: this.rayDirTarget.x - this.rayO.x, y: this.rayDirTarget.y - this.rayO.y },
      ikTarget: this.ikTarget,
      ikFabrik: this.ikFabrik
    });
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    const g = this.getGeometry();
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === "euclide") return this.renderEuclide(ctx, colors);
    this.drawGrid(ctx, g.cx, g.cy, g.scale, colors, true);

    if (this.mode === "pythagore") return this.renderPythagore(ctx, g, colors);
    if (this.mode === "thales") return this.renderThales(ctx, g, colors);
    if (this.mode === "normalized") return this.renderNormalized(ctx, g, colors);
    if (this.mode === "transformpoint") return this.renderTransform(ctx, g, colors);
    if (this.mode === "aabb") return this.renderAABB(ctx, g, colors);
    if (this.mode === "circlesphere") return this.renderCircleSphere(ctx, g, colors);
    if (this.mode === "sat") return this.renderSAT(ctx, g, colors);
    if (this.mode === "capsule") return this.renderCapsule(ctx, g, colors);
    if (this.mode === "raysphere") return this.renderRaySphere(ctx, g, colors);
    if (this.mode === "rayslab") return this.renderRaySlab(ctx, g, colors);
    if (this.mode === "barycentric") return this.renderBarycentric(ctx, g, colors);
    if (this.mode === "ik") return this.renderIK(ctx, g, colors);
  }

  renderEuclide(ctx, colors) {
    const q = Math.floor(this.totalItems / this.stackSize);
    const r = this.totalItems % this.stackSize;
    const box = 42, gap = 7, sx = 28, sy = 52;

    for (let i = 0; i < this.totalItems; i++) {
      const row = Math.floor(i / this.stackSize);
      const col = i % this.stackSize;
      const isRem = row === q;
      const x = sx + col * (box + gap);
      const y = sy + row * (box + 14);
      const colC = isRem ? colors.accent : colors.y;

      ctx.fillStyle = colC + "26";
      ctx.strokeStyle = colC;
      ctx.lineWidth = 1.8;
      this.roundRect(ctx, x, y, box, box, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = '600 12px "SF Mono", Consolas, monospace';
      ctx.fillText(String(i + 1), x + 13, y + 25);

      if (col === this.stackSize - 1 && !isRem) {
        ctx.fillStyle = colors.y;
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText(`Stack #${row + 1} complet`, x + box + 12, y + 25);
      }
      if (i === this.totalItems - 1 && isRem) {
        ctx.fillStyle = colors.accent;
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText(`Reste (Modulo %) = ${r}`, x + box + 12, y + 25);
      }
    }
    this.drawStatusBanner(ctx, `${this.totalItems} = ${this.stackSize} × ${q} + ${r}  |  Quotient = ${q}  ·  Reste = ${r}`, colors.text, colors);
  }

  renderPythagore(ctx, g, colors) {
    const a = this.toScreen(this.pA, g), b = this.toScreen(this.pB, g), c = this.toScreen(this.pC, g);
    const dA = Math.abs(this.pC.y - this.pB.y), dB = Math.abs(this.pA.x - this.pB.x), dC = Math.hypot(dA, dB);

    ctx.fillStyle = colors.z + "18";
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.closePath(); ctx.fill();

    ctx.lineWidth = 3.2;
    ctx.strokeStyle = colors.y; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = colors.x; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = colors.z; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();

    ctx.strokeStyle = colors.muted; ctx.lineWidth = 1.6;
    ctx.strokeRect(b.x, b.y, (Math.sign(a.x - b.x) || 1) * 16, (Math.sign(c.y - b.y) || -1) * 16);

    this.drawHandle(ctx, c.x, c.y, colors.y, `a = ${dA.toFixed(2)}`, colors);
    this.drawHandle(ctx, a.x, a.y, colors.x, `b = ${dB.toFixed(2)}`, colors);
    this.drawStatusBanner(ctx, `c = √(${dA.toFixed(2)}² + ${dB.toFixed(2)}²) = ${dC.toFixed(3)}`, colors.z, colors);
  }

  renderThales(ctx, g, colors) {
    const a = this.toScreen(this.pA, g), b = this.toScreen(this.pB, g), c = this.toScreen(this.pC, g), d = this.toScreen(this.pD, g);
    const dSmall = Math.max(0.2, this.pB.x - this.pA.x);
    const hSmall = this.pB.y - this.pC.y;
    const dBig = Math.max(dSmall + 0.2, this.pD.x - this.pA.x);
    const hBig = (hSmall * dBig) / dSmall;
    const e = { x: d.x, y: d.y - hBig * g.scale };

    ctx.fillStyle = colors.accent + "16";
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(e.x, e.y); ctx.lineTo(d.x, d.y); ctx.closePath(); ctx.fill();

    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(e.x, e.y); ctx.moveTo(a.x, a.y); ctx.lineTo(d.x, d.y); ctx.stroke();
    ctx.restore();

    ctx.lineWidth = 4.5;
    ctx.strokeStyle = colors.x; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.stroke();
    ctx.strokeStyle = colors.y; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(d.x, d.y); ctx.stroke();

    this.drawHandle(ctx, a.x, a.y, colors.accent, "Caméra", colors);
    this.drawHandle(ctx, b.x, b.y, colors.x, `h=${hSmall.toFixed(2)}`, colors);
    this.drawHandle(ctx, d.x, d.y, colors.y, `H=${hBig.toFixed(2)}`, colors);
    this.drawStatusBanner(ctx, `Thalès : H = (${hSmall.toFixed(2)} × ${dBig.toFixed(2)}) / ${dSmall.toFixed(2)} = ${hBig.toFixed(2)}`, colors.y, colors);
  }

  renderNormalized(ctx, g, colors) {
    const pB = this.toScreen(this.pB, g);
    const len = Math.hypot(this.pB.x, this.pB.y) || 1;
    const n = { x: this.pB.x / len, y: this.pB.y / len };
    const pN = this.toScreen(n, g);

    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = colors.y + "66"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(g.cx, g.cy, g.scale, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

    this.drawArrow(ctx, g.cx, g.cy, pB.x, pB.y, colors.x + "88", 3);
    this.drawArrow(ctx, g.cx, g.cy, pN.x, pN.y, colors.y, 4);
    this.drawHandle(ctx, pB.x, pB.y, colors.x, `Brut (‖v‖ = ${len.toFixed(2)})`, colors);
    this.drawHandle(ctx, pN.x, pN.y, colors.y, `v̂ (‖v̂‖ = 1.00)`, colors);
    this.drawStatusBanner(ctx, `v̂ = (${n.x.toFixed(3)}, ${n.y.toFixed(3)}) — Toujours verrouillé sur le cercle unitaire R = 1`, colors.y, colors);
  }

  renderTransform(ctx, g, colors) {
    const rad = (this.parentAngle * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const rotB = { x: this.pB.x * c - this.pB.y * s, y: this.pB.x * s + this.pB.y * c };
    const world = this.transformDirMode ? rotB : { x: this.pA.x + rotB.x, y: this.pA.y + rotB.y };
    const pP = this.toScreen(this.pA, g);
    const pW = this.toScreen(world, g);

    ctx.save();
    ctx.translate(pP.x, pP.y);
    ctx.rotate(-rad);
    ctx.strokeStyle = colors.border;
    ctx.strokeRect(-75, -75, 150, 150);
    this.drawArrow(ctx, 0, 0, 62, 0, colors.x + "88", 2);
    this.drawArrow(ctx, 0, 0, 0, -62, colors.y + "88", 2);
    ctx.restore();

    const start = this.transformDirMode ? { x: g.cx, y: g.cy } : pP;
    this.drawArrow(ctx, start.x, start.y, pW.x, pW.y, colors.z, 2.8);
    this.drawHandle(ctx, pP.x, pP.y, colors.accent, `Parent (${this.pA.x.toFixed(1)}, ${this.pA.y.toFixed(1)})`, colors);
    this.drawHandle(ctx, pW.x, pW.y, colors.y, `Monde (${world.x.toFixed(2)}, ${world.y.toFixed(2)})`, colors);
    this.drawStatusBanner(
      ctx,
      `${this.transformDirMode ? "TransformDirection (R seul, ignore Pos)" : "TransformPoint (Pos + R)"} : Local (${this.pB.x.toFixed(2)}, ${this.pB.y.toFixed(2)}) → Monde (${world.x.toFixed(2)}, ${world.y.toFixed(2)})`,
      colors.y,
      colors
    );
  }

  renderAABB(ctx, g, colors) {
    const hwA = 0.85, hhA = 0.65, hwB = 0.7, hhB = 0.8;
    const ox = hwA + hwB - Math.abs(this.pB.x - this.pA.x);
    const oy = hhA + hhB - Math.abs(this.pB.y - this.pA.y);
    const hit = ox > 0 && oy > 0;
    const col = hit ? colors.x : colors.y;

    const drawBox = (p, hw, hh) => {
      const tl = this.toScreen({ x: p.x - hw, y: p.y + hh }, g);
      ctx.fillStyle = col + "22";
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.4;
      ctx.fillRect(tl.x, tl.y, hw * 2 * g.scale, hh * 2 * g.scale);
      ctx.strokeRect(tl.x, tl.y, hw * 2 * g.scale, hh * 2 * g.scale);
    };
    drawBox(this.pA, hwA, hhA);
    drawBox(this.pB, hwB, hhB);

    const pA = this.toScreen(this.pA, g), pB = this.toScreen(this.pB, g);
    if (hit) {
      // Draw MTV separation vector on Box A
      const mtv = ox < oy
        ? { x: (this.pA.x < this.pB.x ? -ox : ox), y: 0 }
        : { x: 0, y: (this.pA.y < this.pB.y ? -oy : oy) };
      const pEnd = this.toScreen({ x: this.pA.x + mtv.x, y: this.pA.y + mtv.y }, g);
      this.drawArrow(ctx, pA.x, pA.y, pEnd.x, pEnd.y, colors.accent, 3.2);
    }

    this.drawHandle(ctx, pA.x, pA.y, col, "AABB A", colors);
    this.drawHandle(ctx, pB.x, pB.y, col, "AABB B", colors);
    this.drawStatusBanner(
      ctx,
      hit ? `COLLISION ! Overlap X=${ox.toFixed(2)}, Y=${oy.toFixed(2)} → MTV = ${Math.min(ox, oy).toFixed(2)} sur axe ${ox < oy ? "X" : "Y"}` : "Aucune intersection (Séparées)",
      col,
      colors
    );
  }

  renderCircleSphere(ctx, g, colors) {
    const pA = this.toScreen(this.pA, g), pB = this.toScreen(this.pB, g);
    let hit = false, dist = 0, closest = this.pB;

    if (this.circleVsBox) {
      const hw = 0.9, hh = 0.7;
      closest = {
        x: MathEvaluator.clamp(this.pA.x, this.pB.x - hw, this.pB.x + hw),
        y: MathEvaluator.clamp(this.pA.y, this.pB.y - hh, this.pB.y + hh)
      };
      dist = Math.hypot(this.pA.x - closest.x, this.pA.y - closest.y);
      hit = dist <= this.circleR;

      const tl = this.toScreen({ x: this.pB.x - hw, y: this.pB.y + hh }, g);
      ctx.fillStyle = (hit ? colors.x : colors.z) + "20";
      ctx.strokeStyle = hit ? colors.x : colors.z;
      ctx.lineWidth = 2.4;
      ctx.fillRect(tl.x, tl.y, hw * 2 * g.scale, hh * 2 * g.scale);
      ctx.strokeRect(tl.x, tl.y, hw * 2 * g.scale, hh * 2 * g.scale);
    } else {
      const rB = 0.75;
      dist = Math.hypot(this.pA.x - this.pB.x, this.pA.y - this.pB.y);
      hit = dist <= this.circleR + rB;
      ctx.beginPath();
      ctx.arc(pB.x, pB.y, rB * g.scale, 0, Math.PI * 2);
      ctx.fillStyle = (hit ? colors.x : colors.z) + "20";
      ctx.fill();
      ctx.strokeStyle = hit ? colors.x : colors.z;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(pA.x, pA.y, this.circleR * g.scale, 0, Math.PI * 2);
    ctx.fillStyle = (hit ? colors.x : colors.y) + "20";
    ctx.fill();
    ctx.strokeStyle = hit ? colors.x : colors.y;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    if (this.circleVsBox) {
      const pCl = this.toScreen(closest, g);
      ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = colors.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pCl.x, pCl.y); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(pCl.x, pCl.y, 5.5, 0, Math.PI * 2); ctx.fillStyle = colors.accent; ctx.fill();
    }

    this.drawHandle(ctx, pA.x, pA.y, hit ? colors.x : colors.y, `Cercle (r=${this.circleR.toFixed(2)})`, colors);
    this.drawHandle(ctx, pB.x, pB.y, colors.z, this.circleVsBox ? "Boîte AABB" : "Cercle B", colors);
    this.drawStatusBanner(
      ctx,
      this.circleVsBox
        ? `${hit ? "COLLISION Cercle-AABB" : "Libre"} | Distance au point clampé = ${dist.toFixed(2)} vs r = ${this.circleR.toFixed(2)}`
        : `${hit ? "COLLISION Cercle-Cercle" : "Libre"} | d = ${dist.toFixed(2)} vs rA+rB = ${(this.circleR + 0.75).toFixed(2)}`,
      hit ? colors.x : colors.y,
      colors
    );
  }

  renderSAT(ctx, g, colors) {
    const getCorners = (center, hw, hh, deg) => {
      const rad = (deg * Math.PI) / 180;
      const c = Math.cos(rad), s = Math.sin(rad);
      const local = [[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]];
      return local.map(([lx, ly]) => ({ x: center.x + lx * c - ly * s, y: center.y + lx * s + ly * c }));
    };
    const getAxes = (deg) => {
      const rad = (deg * Math.PI) / 180;
      return [{ x: Math.cos(rad), y: Math.sin(rad) }, { x: -Math.sin(rad), y: Math.cos(rad) }];
    };

    const polyA = getCorners(this.pA, 0.9, 0.55, this.angleA);
    const polyB = getCorners(this.pB, 0.8, 0.6, this.angleB);
    const axes = [...getAxes(this.angleA), ...getAxes(this.angleB)];

    let separated = false;
    let sepAxis = null;
    let minOverlap = Infinity;
    let mtvAxis = axes[0];

    const projectPoly = (poly, ax) => {
      let min = Infinity, max = -Infinity;
      poly.forEach((p) => {
        const v = p.x * ax.x + p.y * ax.y;
        if (v < min) min = v;
        if (v > max) max = v;
      });
      return { min, max };
    };

    for (const ax of axes) {
      const p1 = projectPoly(polyA, ax);
      const p2 = projectPoly(polyB, ax);
      const overlap = Math.min(p1.max, p2.max) - Math.max(p1.min, p2.min);
      if (overlap < 0) {
        separated = true;
        sepAxis = ax;
        break;
      }
      if (overlap < minOverlap) {
        minOverlap = overlap;
        mtvAxis = ax;
      }
    }

    const col = separated ? colors.y : colors.x;
    const drawPoly = (poly, stroke) => {
      ctx.fillStyle = stroke + "22";
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      poly.forEach((pt, i) => {
        const s = this.toScreen(pt, g);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawPoly(polyA, col);
    drawPoly(polyB, col);

    // Draw separating axis or MTV
    const mid = { x: (this.pA.x + this.pB.x) / 2, y: (this.pA.y + this.pB.y) / 2 };
    if (separated && sepAxis) {
      const tx = -sepAxis.y, ty = sepAxis.x;
      const s1 = this.toScreen({ x: mid.x - tx * 3, y: mid.y - ty * 3 }, g);
      const s2 = this.toScreen({ x: mid.x + tx * 3, y: mid.y + ty * 3 }, g);
      ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = colors.y; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke(); ctx.restore();
    } else if (!separated) {
      const sign = (this.pA.x - this.pB.x) * mtvAxis.x + (this.pA.y - this.pB.y) * mtvAxis.y >= 0 ? 1 : -1;
      const pStart = this.toScreen(this.pA, g);
      const pEnd = this.toScreen({ x: this.pA.x + mtvAxis.x * minOverlap * sign, y: this.pA.y + mtvAxis.y * minOverlap * sign }, g);
      this.drawArrow(ctx, pStart.x, pStart.y, pEnd.x, pEnd.y, colors.accent, 3.5);
    }

    const pA = this.toScreen(this.pA, g), pB = this.toScreen(this.pB, g);
    this.drawHandle(ctx, pA.x, pA.y, col, "OBB A", colors);
    this.drawHandle(ctx, pB.x, pB.y, col, "OBB B", colors);
    this.drawStatusBanner(
      ctx,
      separated ? "SÉPARÉES : Un axe séparateur (ligne verte) prouve qu'il n'y a pas collision !" : `COLLISION SAT (4/4 axes recouverts) | Pénétration MTV = ${minOverlap.toFixed(2)}`,
      col,
      colors
    );
  }

  renderCapsule(ctx, g, colors) {
    const abx = this.pB.x - this.pA.x, aby = this.pB.y - this.pA.y;
    const abSq = abx * abx + aby * aby || 1;
    const t = MathEvaluator.clamp01(((this.pP.x - this.pA.x) * abx + (this.pP.y - this.pA.y) * aby) / abSq);
    const closest = { x: this.pA.x + abx * t, y: this.pA.y + aby * t };
    const dist = Math.hypot(this.pP.x - closest.x, this.pP.y - closest.y);
    const inside = dist <= this.circleR;
    const col = inside ? colors.x : colors.z;

    const sA = this.toScreen(this.pA, g), sB = this.toScreen(this.pB, g);
    const sP = this.toScreen(this.pP, g), sC = this.toScreen(closest, g);

    // Capsule body
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = col + "28";
    ctx.lineWidth = this.circleR * 2 * g.scale;
    ctx.beginPath(); ctx.moveTo(sA.x, sA.y); ctx.lineTo(sB.x, sB.y); ctx.stroke();

    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(sA.x, sA.y); ctx.lineTo(sB.x, sB.y); ctx.stroke();
    ctx.restore();

    ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = colors.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sP.x, sP.y); ctx.lineTo(sC.x, sC.y); ctx.stroke(); ctx.restore();

    ctx.beginPath(); ctx.arc(sC.x, sC.y, 6, 0, Math.PI * 2); ctx.fillStyle = colors.accent; ctx.fill();
    this.drawHandle(ctx, sA.x, sA.y, colors.z, "A", colors);
    this.drawHandle(ctx, sB.x, sB.y, colors.z, "B", colors);
    this.drawHandle(ctx, sP.x, sP.y, inside ? colors.x : colors.y, `Point P (d=${dist.toFixed(2)})`, colors);
    this.drawStatusBanner(ctx, `t = ${t.toFixed(2)} | Distance au segment = ${dist.toFixed(2)} vs R = ${this.circleR.toFixed(2)} → ${inside ? "DANS LA CAPSULE" : "Extérieur"}`, inside ? colors.x : colors.y, colors);
  }

  renderRaySphere(ctx, g, colors) {
    const center = { x: 0.6, y: 0.1 }, r = 1.15;
    const dx = this.rayDirTarget.x - this.rayO.x, dy = this.rayDirTarget.y - this.rayO.y;
    const len = Math.hypot(dx, dy) || 1;
    const d = { x: dx / len, y: dy / len };
    const L = { x: this.rayO.x - center.x, y: this.rayO.y - center.y };
    const b = L.x * d.x + L.y * d.y;
    const c = L.x * L.x + L.y * L.y - r * r;
    const disc = b * b - c;

    const sC = this.toScreen(center, g);
    ctx.beginPath(); ctx.arc(sC.x, sC.y, r * g.scale, 0, Math.PI * 2);
    ctx.fillStyle = (disc >= 0 ? colors.y : colors.z) + "1c"; ctx.fill();
    ctx.strokeStyle = disc >= 0 ? colors.y : colors.z; ctx.lineWidth = 2.4; ctx.stroke();

    const sO = this.toScreen(this.rayO, g);
    const sFar = this.toScreen({ x: this.rayO.x + d.x * 8, y: this.rayO.y + d.y * 8 }, g);
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(sO.x, sO.y); ctx.lineTo(sFar.x, sFar.y); ctx.stroke(); ctx.restore();

    let status = `Δ = ${disc.toFixed(2)} < 0 → Rayon raté`;
    let col = colors.x;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      const t1 = -b - sq, t2 = -b + sq;
      if (t2 >= 0) {
        if (t1 >= 0) {
          const p1 = this.toScreen({ x: this.rayO.x + d.x * t1, y: this.rayO.y + d.y * t1 }, g);
          ctx.beginPath(); ctx.arc(p1.x, p1.y, 7, 0, Math.PI * 2); ctx.fillStyle = colors.y; ctx.fill();
        }
        const p2 = this.toScreen({ x: this.rayO.x + d.x * t2, y: this.rayO.y + d.y * t2 }, g);
        ctx.beginPath(); ctx.arc(p2.x, p2.y, 6, 0, Math.PI * 2); ctx.fillStyle = colors.aux; ctx.fill();
        status = `HIT ! Δ = ${disc.toFixed(2)} | Entrée t₁ = ${t1.toFixed(2)} · Sortie t₂ = ${t2.toFixed(2)}`;
        col = colors.y;
      }
    }

    const sD = this.toScreen(this.rayDirTarget, g);
    this.drawArrow(ctx, sO.x, sO.y, sD.x, sD.y, colors.accent, 2.6);
    this.drawHandle(ctx, sO.x, sO.y, colors.x, "Origine O", colors);
    this.drawHandle(ctx, sD.x, sD.y, colors.accent, "Dir D̂", colors);
    this.drawStatusBanner(ctx, status, col, colors);
  }

  renderRaySlab(ctx, g, colors) {
    const bMin = { x: -0.4, y: -0.9 }, bMax = { x: 1.7, y: 1.1 };
    const dx = this.rayDirTarget.x - this.rayO.x, dy = this.rayDirTarget.y - this.rayO.y;
    const len = Math.hypot(dx, dy) || 1;
    const d = { x: dx / len, y: dy / len };

    const invX = Math.abs(d.x) > 1e-6 ? 1 / d.x : 1e9;
    const invY = Math.abs(d.y) > 1e-6 ? 1 / d.y : 1e9;
    const tx1 = (bMin.x - this.rayO.x) * invX, tx2 = (bMax.x - this.rayO.x) * invX;
    const ty1 = (bMin.y - this.rayO.y) * invY, ty2 = (bMax.y - this.rayO.y) * invY;

    const tmin = Math.max(Math.min(tx1, tx2), Math.min(ty1, ty2));
    const tmax = Math.min(Math.max(tx1, tx2), Math.max(ty1, ty2));
    const hit = tmax >= Math.max(0, tmin);

    const tl = this.toScreen({ x: bMin.x, y: bMax.y }, g);
    ctx.fillStyle = (hit ? colors.y : colors.z) + "20";
    ctx.strokeStyle = hit ? colors.y : colors.z;
    ctx.lineWidth = 2.4;
    ctx.fillRect(tl.x, tl.y, (bMax.x - bMin.x) * g.scale, (bMax.y - bMin.y) * g.scale);
    ctx.strokeRect(tl.x, tl.y, (bMax.x - bMin.x) * g.scale, (bMax.y - bMin.y) * g.scale);

    const sO = this.toScreen(this.rayO, g);
    const sFar = this.toScreen({ x: this.rayO.x + d.x * 8, y: this.rayO.y + d.y * 8 }, g);
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(sO.x, sO.y); ctx.lineTo(sFar.x, sFar.y); ctx.stroke(); ctx.restore();

    if (hit) {
      const pIn = this.toScreen({ x: this.rayO.x + d.x * Math.max(0, tmin), y: this.rayO.y + d.y * Math.max(0, tmin) }, g);
      const pOut = this.toScreen({ x: this.rayO.x + d.x * tmax, y: this.rayO.y + d.y * tmax }, g);
      ctx.beginPath(); ctx.arc(pIn.x, pIn.y, 7, 0, Math.PI * 2); ctx.fillStyle = colors.y; ctx.fill();
      ctx.beginPath(); ctx.arc(pOut.x, pOut.y, 5.5, 0, Math.PI * 2); ctx.fillStyle = colors.aux; ctx.fill();
    }

    const sD = this.toScreen(this.rayDirTarget, g);
    this.drawArrow(ctx, sO.x, sO.y, sD.x, sD.y, colors.accent, 2.6);
    this.drawHandle(ctx, sO.x, sO.y, colors.x, "Origine O", colors);
    this.drawHandle(ctx, sD.x, sD.y, colors.accent, "Dir D̂", colors);
    this.drawStatusBanner(
      ctx,
      hit ? `SLAB HIT ! t_enter = ${tmin.toFixed(2)} ≤ t_exit = ${tmax.toFixed(2)} (Face ${Math.min(tx1, tx2) > Math.min(ty1, ty2) ? "X" : "Y"})` : `Raté : t_enter (${tmin.toFixed(2)}) > t_exit (${tmax.toFixed(2)})`,
      hit ? colors.y : colors.x,
      colors
    );
  }

  renderBarycentric(ctx, g, colors) {
    const a = this.pA, b = this.pB, c = this.pC, p = this.pP;
    const detT = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y) || 1e-6;
    const u = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / detT;
    const v = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / detT;
    const w = 1 - u - v;
    const inside = u >= 0 && v >= 0 && w >= 0;

    const sA = this.toScreen(a, g), sB = this.toScreen(b, g), sC = this.toScreen(c, g), sP = this.toScreen(p, g);
    ctx.fillStyle = (inside ? colors.y : colors.x) + "1c";
    ctx.strokeStyle = inside ? colors.y : colors.z;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(sA.x, sA.y); ctx.lineTo(sB.x, sB.y); ctx.lineTo(sC.x, sC.y); ctx.closePath(); ctx.fill(); ctx.stroke();

    // Sub-triangle lines
    ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = colors.muted; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(sP.x, sP.y); ctx.lineTo(sA.x, sA.y); ctx.moveTo(sP.x, sP.y); ctx.lineTo(sB.x, sB.y); ctx.moveTo(sP.x, sP.y); ctx.lineTo(sC.x, sC.y); ctx.stroke(); ctx.restore();

    this.drawHandle(ctx, sA.x, sA.y, colors.x, `A (u=${u.toFixed(2)})`, colors);
    this.drawHandle(ctx, sB.x, sB.y, colors.z, `B (v=${v.toFixed(2)})`, colors);
    this.drawHandle(ctx, sC.x, sC.y, colors.y, `C (w=${w.toFixed(2)})`, colors);
    this.drawHandle(ctx, sP.x, sP.y, colors.accent, "Point P", colors);
    this.drawStatusBanner(ctx, `u=${u.toFixed(2)}, v=${v.toFixed(2)}, w=${w.toFixed(2)} (somme=1.00) → ${inside ? "À L'INTÉRIEUR DU TRIANGLE" : "À l'extérieur (poids négatif)"}`, inside ? colors.y : colors.x, colors);
  }

  renderIK(ctx, g, colors) {
    const root = { x: -1.8, y: -0.6 };
    const target = this.ikTarget;
    let joints = [];
    let status = "";

    if (!this.ikFabrik) {
      // Exact 2-Bone Al-Kashi analytical IK
      const L1 = 1.75, L2 = 1.55;
      const dx = target.x - root.x, dy = target.y - root.y;
      const dist = MathEvaluator.clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 0.05, L1 + L2 - 0.01);
      const baseAngle = Math.atan2(dy, dx);
      const cosAlpha = MathEvaluator.clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
      const alpha = Math.acos(cosAlpha);
      const elbowAngle = baseAngle + alpha;
      const elbow = { x: root.x + Math.cos(elbowAngle) * L1, y: root.y + Math.sin(elbowAngle) * L1 };
      const cosGamma = MathEvaluator.clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1);
      const gammaDeg = (Math.acos(cosGamma) * 180) / Math.PI;
      const handAngle = Math.atan2(target.y - elbow.y, target.x - elbow.x);
      const hand = { x: elbow.x + Math.cos(handAngle) * L2, y: elbow.y + Math.sin(handAngle) * L2 };
      joints = [root, elbow, hand];
      status = `2-Bone Al-Kashi : Angle Coude γ = ${gammaDeg.toFixed(1)}° | Dist = ${dist.toFixed(2)}m (max ${(L1 + L2).toFixed(2)}m)`;
    } else {
      // 5-bone FABRIK iterative solver (6 passes)
      const count = 5, segLen = 0.78;
      joints = [];
      for (let i = 0; i <= count; i++) joints.push({ x: root.x + i * segLen, y: root.y });
      for (let iter = 0; iter < 8; iter++) {
        // Forward reaching (from target)
        joints[count] = { ...target };
        for (let i = count - 1; i >= 0; i--) {
          const dx = joints[i].x - joints[i + 1].x, dy = joints[i].y - joints[i + 1].y;
          const d = Math.hypot(dx, dy) || 1;
          joints[i] = { x: joints[i + 1].x + (dx / d) * segLen, y: joints[i + 1].y + (dy / d) * segLen };
        }
        // Backward reaching (from fixed root)
        joints[0] = { ...root };
        for (let i = 1; i <= count; i++) {
          const dx = joints[i].x - joints[i - 1].x, dy = joints[i].y - joints[i - 1].y;
          const d = Math.hypot(dx, dy) || 1;
          joints[i] = { x: joints[i - 1].x + (dx / d) * segLen, y: joints[i - 1].y + (dy / d) * segLen };
        }
      }
      status = `FABRIK (5 os, 8 passes) : convergence immédiate vers la cible (${target.x.toFixed(2)}, ${target.y.toFixed(2)})`;
    }

    // Draw bones
    for (let i = 0; i < joints.length - 1; i++) {
      const a = this.toScreen(joints[i], g), b = this.toScreen(joints[i + 1], g);
      ctx.strokeStyle = i % 2 === 0 ? colors.z : colors.y;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    joints.forEach((j, idx) => {
      const s = this.toScreen(j, g);
      ctx.beginPath(); ctx.arc(s.x, s.y, idx === 0 ? 7 : 5.5, 0, Math.PI * 2);
      ctx.fillStyle = idx === 0 ? colors.x : colors.text;
      ctx.fill();
    });

    const sT = this.toScreen(target, g);
    this.drawHandle(ctx, sT.x, sT.y, colors.accent, "Cible IK (Glissez)", colors);
    this.drawStatusBanner(ctx, status, colors.z, colors);
  }
}
