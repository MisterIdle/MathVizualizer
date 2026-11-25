import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class VectorSandbox extends BaseSandbox {
  constructor(canvas, concept, onStateChange, onInteract) {
    super(canvas, concept, onStateChange, onInteract);
    this.vecA = { x: 1.9, y: 1.3, z: 0 };
    this.vecB = { x: -1.1, y: 2.1, z: 0 };
    this.vecC = { x: -2.2, y: -1.1, z: 0 };
    this.rangeLimit = 2.6;
    this.distanceMetric = 0; // 0: Euclidean, 1: Manhattan, 2: Chebyshev
    this.projectPlaneMode = true; // true: ProjectOnPlane, false: Project onto B
    this.restitution = 0.85;
    this.friction = 0.1;
    this.innerDeadzone = 0.28;
    this.outerDeadzone = 0.95;
    this.rawStick = { x: 0.45, y: 0.35 };
    this.trs = { tx: 0.8, ty: 0.4, rot: 30, sx: 1.3, sy: 0.9 };
    this.normalizeVectors = this.mode === "dot";
    this.draggingTarget = null;

    if (this.mode === "reflect") {
      this.vecA = { x: 0.2, y: 1.9, z: 0 }; // normal
      this.vecB = { x: -2.2, y: 1.7, z: 0 }; // laser source
    } else if (this.mode === "projectonplane") {
      this.vecA = { x: 2.0, y: -1.3, z: 0 };
      this.vecB = { x: -0.5, y: 1.6, z: 0 };
    } else if (this.mode === "rayplane") {
      this.vecC = { x: -2.4, y: 1.5, z: 0 }; // origin
      this.vecA = { x: 1.8, y: -1.0, z: 0 }; // dir
      this.vecB = { x: -0.35, y: 1.2, z: 0 }; // plane normal
    }

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.mode === "magnitude") {
      return [
        {
          type: "range",
          key: "range",
          label: "Portée Radar",
          min: 1.0,
          max: 4.5,
          step: 0.1,
          value: this.rangeLimit,
          onChange: (v) => { this.rangeLimit = v; this.notifyInteract(); this.updateStateAndRender(); }
        },
        {
          type: "button",
          label: "Métrique : Euclidienne",
          onClick: (btn) => {
            this.distanceMetric = (this.distanceMetric + 1) % 3;
            const names = ["Euclidienne (Cercle)", "Manhattan L₁ (Losange)", "Chebyshev L∞ (Carré)"];
            if (btn) btn.textContent = `Métrique : ${names[this.distanceMetric]}`;
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "dot") {
      return [
        {
          type: "button",
          label: this.normalizeVectors ? "Normaliser A & B : Activé" : "Normaliser A & B : Désactivé",
          onClick: (btn) => {
            this.normalizeVectors = !this.normalizeVectors;
            if (btn) btn.textContent = this.normalizeVectors ? "Normaliser A & B : Activé" : "Normaliser A & B : Désactivé";
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "projectonplane") {
      return [
        {
          type: "button",
          label: "Mode : ProjectOnPlane (Pente)",
          onClick: (btn) => {
            this.projectPlaneMode = !this.projectPlaneMode;
            if (btn) btn.textContent = this.projectPlaneMode ? "Mode : ProjectOnPlane (Pente)" : "Mode : Project sur Axe (Rail)";
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "reflect") {
      return [
        {
          type: "range",
          key: "e",
          label: "Restitution (e)",
          min: 0.0,
          max: 1.0,
          step: 0.05,
          value: this.restitution,
          onChange: (v) => { this.restitution = v; this.notifyInteract(); this.updateStateAndRender(); }
        },
        {
          type: "range",
          key: "mu",
          label: "Friction (μ)",
          min: 0.0,
          max: 0.8,
          step: 0.05,
          value: this.friction,
          onChange: (v) => { this.friction = v; this.notifyInteract(); this.updateStateAndRender(); }
        }
      ];
    }
    if (this.mode === "deadzone") {
      return [
        {
          type: "range",
          key: "inner",
          label: "Deadzone interne",
          min: 0.05,
          max: 0.6,
          step: 0.05,
          value: this.innerDeadzone,
          onChange: (v) => { this.innerDeadzone = v; this.notifyInteract(); this.updateStateAndRender(); }
        },
        {
          type: "range",
          key: "outer",
          label: "Plafond externe",
          min: 0.7,
          max: 1.0,
          step: 0.05,
          value: this.outerDeadzone,
          onChange: (v) => { this.outerDeadzone = v; this.notifyInteract(); this.updateStateAndRender(); }
        }
      ];
    }
    if (this.mode === "matrixtrs") {
      return [
        { type: "range", key: "tx", label: "Tx", min: -2.5, max: 2.5, step: 0.1, value: this.trs.tx, onChange: (v) => { this.trs.tx = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "ty", label: "Ty", min: -1.8, max: 1.8, step: 0.1, value: this.trs.ty, onChange: (v) => { this.trs.ty = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "rot", label: "Rotation (°)", min: -180, max: 180, step: 5, value: this.trs.rot, onChange: (v) => { this.trs.rot = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "sx", label: "Scale X", min: 0.3, max: 2.2, step: 0.1, value: this.trs.sx, onChange: (v) => { this.trs.sx = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "sy", label: "Scale Y", min: 0.3, max: 2.2, step: 0.1, value: this.trs.sy, onChange: (v) => { this.trs.sy = v; this.notifyInteract(); this.updateStateAndRender(); } }
      ];
    }
    return [];
  }

  getGeometry() {
    return {
      cx: this.width / 2,
      cy: this.height * 0.48,
      scale: Math.min(this.width, this.height) * (this.mode === "deadzone" ? 0.33 : 0.13)
    };
  }

  project(v, cx, cy, scale) {
    return { x: cx + v.x * scale, y: cy - v.y * scale };
  }

  normalize(v) {
    const len = Math.hypot(v.x, v.y, v.z || 0) || 1;
    return { x: v.x / len, y: v.y / len, z: (v.z || 0) / len };
  }

  bindEvents() {
    this.bindPointer(
      (pos) => {
        const { cx, cy, scale } = this.getGeometry();
        if (this.mode === "deadzone") {
          this.draggingTarget = "STICK";
          this.updateStick(pos);
          return;
        }
        if (this.mode === "matrixtrs") {
          this.draggingTarget = "TRS";
          this.trs.tx = MathEvaluator.clamp((pos.x - cx) / scale, -2.5, 2.5);
          this.trs.ty = MathEvaluator.clamp((cy - pos.y) / scale, -1.8, 1.8);
          this.updateStateAndRender();
          return;
        }
        let hitA = this.currentA || this.vecA;
        let hitB = this.currentB || this.vecB;
        let hitC = this.vecC;

        if (this.mode === "rayplane") {
          hitA = { x: hitC.x + this.vecA.x, y: hitC.y + this.vecA.y };
          hitB = this.normalize(this.vecB);
        } else if (this.mode === "projectonplane" && this.projectPlaneMode) {
          hitB = this.normalize(this.vecB);
        } else if (this.mode === "reflect") {
          hitA = this.normalize(this.vecA);
        }

        const aScr = this.project(hitA, cx, cy, scale);
        const bScr = this.project(hitB, cx, cy, scale);
        const cScr = this.project(hitC, cx, cy, scale);

        if (Math.hypot(pos.x - aScr.x, pos.y - aScr.y) < 30) this.draggingTarget = "A";
        else if (Math.hypot(pos.x - bScr.x, pos.y - bScr.y) < 30) this.draggingTarget = "B";
        else if (this.mode === "rayplane" && Math.hypot(pos.x - cScr.x, pos.y - cScr.y) < 30) this.draggingTarget = "C";
      },
      (pos) => {
        if (!this.draggingTarget) return;
        const { cx, cy, scale } = this.getGeometry();
        if (this.draggingTarget === "STICK") {
          this.updateStick(pos);
          return;
        }
        if (this.draggingTarget === "TRS") {
          this.trs.tx = MathEvaluator.clamp((pos.x - cx) / scale, -2.5, 2.5);
          this.trs.ty = MathEvaluator.clamp((cy - pos.y) / scale, -1.8, 1.8);
          this.updateStateAndRender();
          return;
        }
        const vx = MathEvaluator.clamp((pos.x - cx) / scale, -4.4, 4.4);
        const vy = MathEvaluator.clamp((cy - pos.y) / scale, -3.1, 3.1);

        if (this.draggingTarget === "A") {
          if (this.mode === "rayplane") {
            this.vecA.x = vx - this.vecC.x;
            this.vecA.y = vy - this.vecC.y;
          } else {
            this.vecA.x = vx;
            this.vecA.y = vy;
          }
        } else if (this.draggingTarget === "B") {
          this.vecB.x = vx;
          this.vecB.y = vy;
        } else if (this.draggingTarget === "C") {
          this.vecC.x = vx;
          this.vecC.y = vy;
        }
        this.updateStateAndRender();
      },
      () => {
        this.draggingTarget = null;
      }
    );
  }

  updateStick(pos) {
    const { cx, cy, scale } = this.getGeometry();
    let dx = (pos.x - cx) / scale;
    let dy = (cy - pos.y) / scale;
    const mag = Math.hypot(dx, dy);
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }
    this.rawStick = { x: dx, y: dy };
    this.updateStateAndRender();
  }

  updateStateAndRender() {
    const a = this.normalizeVectors ? this.normalize(this.vecA) : { ...this.vecA };
    const b = this.normalizeVectors ? this.normalize(this.vecB) : { ...this.vecB };
    const dot = a.x * b.x + a.y * b.y;
    const det = a.x * b.y - a.y * b.x;

    this.currentA = a;
    this.currentB = b;
    this.currentDot = dot;
    this.currentDet = det;

    // Deadzone computation
    const rawMag = Math.hypot(this.rawStick.x, this.rawStick.y);
    let scaledStick = { x: 0, y: 0, mag: 0 };
    if (rawMag > this.innerDeadzone) {
      const m = MathEvaluator.clamp01((rawMag - this.innerDeadzone) / Math.max(0.05, this.outerDeadzone - this.innerDeadzone));
      scaledStick = { x: (this.rawStick.x / rawMag) * m, y: (this.rawStick.y / rawMag) * m, mag: m };
    }
    this.scaledStick = scaledStick;

    this.render();
    this.emitState({
      mode: this.mode,
      vecA: a,
      vecB: b,
      vecC: this.vecC,
      dot,
      det,
      rangeLimit: this.rangeLimit,
      restitution: this.restitution,
      friction: this.friction,
      rawStick: this.rawStick,
      scaledStick,
      innerDeadzone: this.innerDeadzone,
      trs: this.trs
    });
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    const { cx, cy, scale } = this.getGeometry();
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === "deadzone") return this.renderDeadzone(ctx, cx, cy, scale, colors);
    if (this.mode === "matrixtrs") return this.renderMatrixTrs(ctx, cx, cy, scale, colors);

    this.drawGrid(ctx, cx, cy, scale, colors, true);

    const pA = this.project(this.currentA, cx, cy, scale);
    const pB = this.project(this.currentB, cx, cy, scale);

    if (this.mode === "direction") {
      const dx = this.currentB.x - this.currentA.x;
      const dy = this.currentB.y - this.currentA.y;
      const len = Math.hypot(dx, dy);
      this.drawArrow(ctx, pA.x, pA.y, pB.x, pB.y, colors.accent, 3);
      this.drawHandle(ctx, pA.x, pA.y, colors.x, `Origine A (${this.currentA.x.toFixed(1)}, ${this.currentA.y.toFixed(1)})`, colors);
      this.drawHandle(ctx, pB.x, pB.y, colors.z, `Cible B (${this.currentB.x.toFixed(1)}, ${this.currentB.y.toFixed(1)})`, colors, 13, 16);
      this.drawStatusBanner(ctx, `Dir = B - A = (${dx.toFixed(2)}, ${dy.toFixed(2)}) | Longueur = ${len.toFixed(2)}m`, colors.accent, colors);
      return;
    }

    if (this.mode === "magnitude") {
      const dx = Math.abs(this.currentB.x - this.currentA.x);
      const dy = Math.abs(this.currentB.y - this.currentA.y);
      const dist = this.distanceMetric === 0 ? Math.hypot(dx, dy) : this.distanceMetric === 1 ? dx + dy : Math.max(dx, dy);
      const inside = dist <= this.rangeLimit;
      const col = inside ? colors.x : colors.y;

      ctx.save();
      ctx.fillStyle = col + "1c";
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      const rPx = this.rangeLimit * scale;
      ctx.beginPath();
      if (this.distanceMetric === 0) {
        ctx.arc(pA.x, pA.y, rPx, 0, Math.PI * 2);
      } else if (this.distanceMetric === 1) {
        ctx.moveTo(pA.x, pA.y - rPx);
        ctx.lineTo(pA.x + rPx, pA.y);
        ctx.lineTo(pA.x, pA.y + rPx);
        ctx.lineTo(pA.x - rPx, pA.y);
        ctx.closePath();
      } else {
        ctx.rect(pA.x - rPx, pA.y - rPx, rPx * 2, rPx * 2);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      this.drawArrow(ctx, pA.x, pA.y, pB.x, pB.y, col, 2.6);
      this.drawHandle(ctx, pA.x, pA.y, colors.x, "Radar A", colors);
      this.drawHandle(ctx, pB.x, pB.y, colors.z, "Cible B", colors, 13, 16);
      const sqrText = this.distanceMetric === 0 ? ` | sqrMag = ${(dist * dist).toFixed(2)} vs r² = ${(this.rangeLimit ** 2).toFixed(2)}` : "";
      this.drawStatusBanner(ctx, `${inside ? "À PORTÉE" : "Hors portée"} — d = ${dist.toFixed(2)}m (seuil ${this.rangeLimit.toFixed(1)}m)${sqrText}`, col, colors);
      return;
    }

    if (this.mode === "dot") {
      const guardAngle = Math.atan2(this.currentB.y, this.currentB.x);
      ctx.fillStyle = colors.y + "18";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, scale * 2.5, -(guardAngle + Math.PI / 4), -(guardAngle - Math.PI / 4), false);
      ctx.closePath();
      ctx.fill();

      this.drawArrow(ctx, cx, cy, pB.x, pB.y, colors.z, 3);
      this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.x, 3);
      this.drawHandle(ctx, pB.x, pB.y, colors.z, "Regard Garde B", colors);
      this.drawHandle(ctx, pA.x, pA.y, colors.x, "Vers Joueur A", colors);

      const angleDeg = (Math.acos(MathEvaluator.clamp(this.currentDot / (Math.hypot(this.currentA.x, this.currentA.y) * Math.hypot(this.currentB.x, this.currentB.y) || 1), -1, 1)) * 180) / Math.PI;
      let status = `Dot = ${this.currentDot.toFixed(3)} (${angleDeg.toFixed(1)}°) — `;
      let col = colors.y;
      if (this.currentDot > 0.707) { status += "DANS LE CÔNE DE VISION (Détecté)"; col = colors.x; }
      else if (this.currentDot > 0.05) { status += "Devant, hors cône 90°"; col = colors.accent; }
      else if (this.currentDot >= -0.05) { status += "Perpendiculaire (Angle droit 90°)"; col = colors.z; }
      else { status += "Dans le dos du garde (Backstab)"; col = colors.y; }
      this.drawStatusBanner(ctx, status, col, colors);
      return;
    }

    if (this.mode === "reflect") {
      const n = this.normalize(this.currentA);
      const tx = -n.y, ty = n.x;
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - tx * scale * 4, cy + ty * scale * 4);
      ctx.lineTo(cx + tx * scale * 4, cy - ty * scale * 4);
      ctx.stroke();

      const vIn = { x: -this.currentB.x, y: -this.currentB.y };
      const vnScalar = vIn.x * n.x + vIn.y * n.y;
      const vn = { x: vnScalar * n.x, y: vnScalar * n.y };
      const vt = { x: vIn.x - vn.x, y: vIn.y - vn.y };
      const vOut = {
        x: vt.x * (1 - this.friction) - vn.x * this.restitution,
        y: vt.y * (1 - this.friction) - vn.y * this.restitution
      };

      const pNorm = this.project(n, cx, cy, scale);
      const pRef = this.project(vOut, cx, cy, scale);

      this.drawArrow(ctx, pB.x, pB.y, cx, cy, colors.z, 2.8);
      this.drawArrow(ctx, cx, cy, pNorm.x, pNorm.y, colors.accent, 2.6);
      this.drawArrow(ctx, cx, cy, pRef.x, pRef.y, colors.aux, 3);

      this.drawHandle(ctx, pB.x, pB.y, colors.z, "Rayon incident B", colors);
      this.drawHandle(ctx, pNorm.x, pNorm.y, colors.accent, "Normale N̂", colors);
      this.drawStatusBanner(ctx, `V' = Vt·(1-μ) - e·Vn | e=${this.restitution.toFixed(2)}, μ=${this.friction.toFixed(2)} → (${vOut.x.toFixed(2)}, ${vOut.y.toFixed(2)})`, colors.aux, colors);
      return;
    }

    if (this.mode === "projectonplane") {
      if (this.projectPlaneMode) {
        const n = this.normalize(this.currentB);
        const tx = -n.y, ty = n.x;
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - tx * scale * 4.5, cy + ty * scale * 4.5);
        ctx.lineTo(cx + tx * scale * 4.5, cy - ty * scale * 4.5);
        ctx.stroke();

        const d = this.currentA.x * n.x + this.currentA.y * n.y;
        const slide = { x: this.currentA.x - d * n.x, y: this.currentA.y - d * n.y };
        const pSlide = this.project(slide, cx, cy, scale);
        const pNorm = this.project(n, cx, cy, scale);

        this.drawArrow(ctx, pA.x, pA.y, pSlide.x, pSlide.y, colors.muted, 1.6, true);
        this.drawArrow(ctx, cx, cy, pNorm.x, pNorm.y, colors.accent, 2.4);
        this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.x, 2.8);
        this.drawArrow(ctx, cx, cy, pSlide.x, pSlide.y, colors.y, 3.4);
        this.drawHandle(ctx, pNorm.x, pNorm.y, colors.accent, "Normale Pente N̂", colors);
        this.drawHandle(ctx, pA.x, pA.y, colors.x, "Mouvement V", colors);
        this.drawStatusBanner(ctx, `ProjectOnPlane = V - (V·N̂)N̂ = (${slide.x.toFixed(2)}, ${slide.y.toFixed(2)})`, colors.y, colors);
      } else {
        const bSq = this.currentB.x ** 2 + this.currentB.y ** 2 || 1;
        const f = this.currentDot / bSq;
        const proj = { x: this.currentB.x * f, y: this.currentB.y * f };
        const pProj = this.project(proj, cx, cy, scale);
        this.drawArrow(ctx, pA.x, pA.y, pProj.x, pProj.y, colors.muted, 1.6, true);
        this.drawArrow(ctx, cx, cy, pB.x, pB.y, colors.z, 2.6);
        this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.x, 2.8);
        this.drawArrow(ctx, cx, cy, pProj.x, pProj.y, colors.accent, 3.4);
        this.drawHandle(ctx, pA.x, pA.y, colors.x, "Vecteur A", colors);
        this.drawHandle(ctx, pB.x, pB.y, colors.z, "Rail B", colors);
        this.drawStatusBanner(ctx, `Project(A, B) = (${proj.x.toFixed(2)}, ${proj.y.toFixed(2)}) | Facteur = ${f.toFixed(2)}`, colors.accent, colors);
      }
      return;
    }

    if (this.mode === "rayplane") {
      const n = this.normalize(this.currentB);
      const tx = -n.y, ty = n.x;
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - tx * scale * 5, cy + ty * scale * 5);
      ctx.lineTo(cx + tx * scale * 5, cy - ty * scale * 5);
      ctx.stroke();

      const pO = this.project(this.vecC, cx, cy, scale);
      const pNorm = this.project(n, cx, cy, scale);
      const dirEnd = { x: this.vecC.x + this.vecA.x, y: this.vecC.y + this.vecA.y };
      const pD = this.project(dirEnd, cx, cy, scale);

      this.drawArrow(ctx, cx, cy, pNorm.x, pNorm.y, colors.accent, 2.4);
      this.drawArrow(ctx, pO.x, pO.y, pD.x, pD.y, colors.x, 2.6);

      const denom = this.vecA.x * n.x + this.vecA.y * n.y;
      let status = "Rayon parallèle au plan (D·N ≈ 0)";
      let sCol = colors.muted;
      if (Math.abs(denom) > 1e-4) {
        const t = -(this.vecC.x * n.x + this.vecC.y * n.y) / denom;
        if (t >= 0) {
          const hit = { x: this.vecC.x + this.vecA.x * t, y: this.vecC.y + this.vecA.y * t };
          const pHit = this.project(hit, cx, cy, scale);
          ctx.save();
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = colors.x;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(pO.x, pO.y);
          ctx.lineTo(pHit.x, pHit.y);
          ctx.stroke();
          ctx.restore();
          this.drawHandle(ctx, pHit.x, pHit.y, colors.aux, `Impact (${hit.x.toFixed(2)}, ${hit.y.toFixed(2)})`, colors);
          status = `IMPACT à t = ${t.toFixed(2)} → Point (${hit.x.toFixed(2)}, ${hit.y.toFixed(2)})`;
          sCol = colors.aux;
        } else {
          status = `Plan derrière le rayon (t = ${t.toFixed(2)} < 0)`;
          sCol = colors.x;
        }
      }

      this.drawHandle(ctx, pO.x, pO.y, colors.x, "Origine O", colors);
      this.drawHandle(ctx, pD.x, pD.y, colors.z, "Direction D", colors);
      this.drawHandle(ctx, pNorm.x, pNorm.y, colors.accent, "Normale N̂", colors);
      this.drawStatusBanner(ctx, status, sCol, colors);
      return;
    }

    // Default: Determinant 2D (matrix)
    const sum = { x: this.currentA.x + this.currentB.x, y: this.currentA.y + this.currentB.y };
    const pSum = this.project(sum, cx, cy, scale);
    const col = this.currentDet >= 0 ? colors.y : colors.x;
    ctx.fillStyle = col + "22";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pA.x, pA.y);
    ctx.lineTo(pSum.x, pSum.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.closePath();
    ctx.fill();

    this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.x, 2.8);
    this.drawArrow(ctx, cx, cy, pB.x, pB.y, colors.z, 2.8);
    this.drawHandle(ctx, pA.x, pA.y, colors.x, `A (${this.currentA.x.toFixed(1)}, ${this.currentA.y.toFixed(1)})`, colors);
    this.drawHandle(ctx, pB.x, pB.y, colors.z, `B (${this.currentB.x.toFixed(1)}, ${this.currentB.y.toFixed(1)})`, colors);
    this.drawStatusBanner(
      ctx,
      `det(A, B) = ${this.currentDet.toFixed(2)} → ${this.currentDet >= 0 ? "B est à GAUCHE de A (+)" : "B est à DROITE de A (-)"}`,
      col,
      colors
    );
  }

  renderDeadzone(ctx, cx, cy, scale, colors) {
    this.drawGrid(ctx, cx, cy, scale * 0.5, colors, false);

    // Outer boundary
    ctx.beginPath();
    ctx.arc(cx, cy, scale * this.outerDeadzone, 0, Math.PI * 2);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner deadzone circle
    ctx.beginPath();
    ctx.arc(cx, cy, scale * this.innerDeadzone, 0, Math.PI * 2);
    ctx.fillStyle = colors.x + "22";
    ctx.fill();
    ctx.strokeStyle = colors.x;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Axial deadzone cross (shown faint to contrast why radial is superior!)
    ctx.save();
    ctx.fillStyle = colors.muted + "16";
    ctx.fillRect(cx - scale, cy - scale * this.innerDeadzone, scale * 2, scale * this.innerDeadzone * 2);
    ctx.fillRect(cx - scale * this.innerDeadzone, cy - scale, scale * this.innerDeadzone * 2, scale * 2);
    ctx.restore();

    const pRaw = this.project(this.rawStick, cx, cy, scale);
    const pScaled = this.project(this.scaledStick, cx, cy, scale);

    this.drawArrow(ctx, cx, cy, pRaw.x, pRaw.y, colors.muted, 2, true);
    if (this.scaledStick.mag > 0.001) {
      this.drawArrow(ctx, cx, cy, pScaled.x, pScaled.y, colors.y, 3.4);
    }
    this.drawHandle(ctx, pRaw.x, pRaw.y, colors.accent, `Stick Brut (${this.rawStick.x.toFixed(2)}, ${this.rawStick.y.toFixed(2)})`, colors);

    const rawMag = Math.hypot(this.rawStick.x, this.rawStick.y);
    this.drawStatusBanner(
      ctx,
      `Brut ‖v‖=${rawMag.toFixed(2)} → Sortie Radiale Remappée ‖v'‖=${this.scaledStick.mag.toFixed(2)} (${this.scaledStick.x.toFixed(2)}, ${this.scaledStick.y.toFixed(2)})`,
      this.scaledStick.mag > 0 ? colors.y : colors.x,
      colors
    );
  }

  renderMatrixTrs(ctx, cx, cy, scale, colors) {
    this.drawGrid(ctx, cx, cy, scale, colors, true);

    const rad = (this.trs.rot * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const { tx, ty, sx, sy } = this.trs;

    // Matrix M = T * R * S
    const m00 = c * sx, m01 = -s * sy, m02 = tx;
    const m10 = s * sx, m11 = c * sy, m12 = ty;

    const unitQuad = [
      { x: -0.6, y: -0.6 }, { x: 0.6, y: -0.6 },
      { x: 0.6, y: 0.6 }, { x: -0.6, y: 0.6 }
    ];

    // Original unit quad (ghost)
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.muted;
    ctx.beginPath();
    unitQuad.forEach((v, i) => {
      const p = this.project(v, cx, cy, scale);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Transformed quad
    const xform = (v) => ({ x: m00 * v.x + m01 * v.y + m02, y: m10 * v.x + m11 * v.y + m12 });
    const tQuad = unitQuad.map(xform);
    ctx.fillStyle = colors.z + "26";
    ctx.strokeStyle = colors.z;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    tQuad.forEach((v, i) => {
      const p = this.project(v, cx, cy, scale);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Local transformed axes (Matrix columns 0 & 1!)
    const o = this.project({ x: tx, y: ty }, cx, cy, scale);
    const axX = this.project({ x: tx + m00, y: ty + m10 }, cx, cy, scale);
    const axY = this.project({ x: tx + m01, y: ty + m11 }, cx, cy, scale);
    this.drawArrow(ctx, o.x, o.y, axX.x, axX.y, colors.x, 2.8);
    this.drawArrow(ctx, o.x, o.y, axY.x, axY.y, colors.y, 2.8);
    this.drawHandle(ctx, o.x, o.y, colors.accent, `Pivot (${tx.toFixed(1)}, ${ty.toFixed(1)})`, colors);

    // Live 3x3 matrix overlay card
    ctx.save();
    ctx.fillStyle = colors.isLight ? "rgba(255,255,255,0.92)" : "rgba(22,27,34,0.92)";
    ctx.strokeStyle = colors.border;
    this.roundRect(ctx, 14, 14, 214, 86, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = '600 11.5px "SF Mono", Consolas, monospace';
    ctx.fillStyle = colors.secondary;
    ctx.fillText("M = T · R · S  (Colonnes = X, Y, T)", 24, 32);
    ctx.fillStyle = colors.text;
    ctx.fillText(`[ ${m00.toFixed(2).padStart(5)}  ${m01.toFixed(2).padStart(5)}  ${m02.toFixed(2).padStart(5)} ]`, 24, 52);
    ctx.fillText(`[ ${m10.toFixed(2).padStart(5)}  ${m11.toFixed(2).padStart(5)}  ${m12.toFixed(2).padStart(5)} ]`, 24, 70);
    ctx.fillStyle = colors.muted;
    ctx.fillText(`[  0.00   0.00   1.00 ]`, 24, 88);
    ctx.restore();

    this.drawStatusBanner(ctx, `Glissez sur le canvas pour translater | det(M) = ${(sx * sy).toFixed(2)} (facteur d'aire)`, colors.z, colors);
  }
}
