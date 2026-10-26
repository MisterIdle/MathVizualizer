import { BaseSandbox } from "./BaseSandbox.js";

export class VectorSandbox extends BaseSandbox {
  constructor(canvas, funcItem, onStateChange) {
    super(canvas, funcItem, onStateChange);
    this.mode = funcItem.sandbox;
    this.id = funcItem.id;
    this.vecA = { x: 1.8, y: 1.4, z: 0.0 };
    this.vecB = { x: -1.0, y: 2.2, z: 0.0 };
    this.vecC = { x: -1.8, y: -0.8, z: 0.0 };
    this.weightA = 1.0;
    this.weightB = 1.0;
    this.weightC = 1.0;
    this.gravity = 9.81;
    this.rangeLimit = 2.5;

    this.normalizeVectors =
      (this.mode === "dot" || this.mode === "cross" || this.mode === "project") &&
      this.id !== "direction" &&
      this.id !== "magnitude" &&
      this.id !== "reflect" &&
      this.id !== "projectonplane" &&
      this.id !== "rayplane";
    this.draggingTarget = null;

    if (this.id === "reflect") {
      this.vecA = { x: 0.0, y: 2.0, z: 0.0 };
      this.vecB = { x: -2.2, y: 1.8, z: 0.0 };
    }

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.mode === "barycentre") {
      return [
        { type: "range", key: "wa", label: "Masse α (Point A)", min: 0.1, max: 5, step: 0.1, value: this.weightA, onChange: (v) => { this.weightA = v; this.updateStateAndRender(); } },
        { type: "range", key: "wb", label: "Masse β (Point B)", min: 0.1, max: 5, step: 0.1, value: this.weightB, onChange: (v) => { this.weightB = v; this.updateStateAndRender(); } },
        { type: "range", key: "wc", label: "Masse γ (Point C)", min: 0.1, max: 5, step: 0.1, value: this.weightC, onChange: (v) => { this.weightC = v; this.updateStateAndRender(); } }
      ];
    }
    if (this.mode === "ballistic") {
      return [
        { type: "range", key: "g", label: "Gravité g (m/s²)", min: 1.6, max: 20, step: 0.2, value: this.gravity, onChange: (v) => { this.gravity = v; this.updateStateAndRender(); } }
      ];
    }
    if (this.id === "magnitude") {
      return [
        { type: "range", key: "range", label: "Portée du Radar", min: 1.0, max: 4.5, step: 0.1, value: this.rangeLimit, onChange: (v) => { this.rangeLimit = v; this.updateStateAndRender(); } }
      ];
    }
    if ((this.mode === "dot" || this.mode === "cross" || this.mode === "project") && this.id !== "direction" && this.id !== "magnitude" && this.id !== "reflect" && this.id !== "projectonplane" && this.id !== "rayplane") {
      return [
        { type: "button", label: "Normaliser A & B (Longueur = 1) : On/Off", onClick: () => { this.normalizeVectors = !this.normalizeVectors; this.updateStateAndRender(); } }
      ];
    }
    return [];
  }
  
  bindEvents() {
    const onDown = (e) => {
      const pos = this.getMousePos(e);
      const { cx, cy, scale } = this.getGeometry();

      let hitA = this.currentA || this.vecA;
      let hitB = this.currentB || this.vecB;
      let hitC = this.vecC;

      if (this.id === "rayplane") {
        hitA = { x: hitC.x + hitA.x, y: hitC.y + hitA.y };
        hitB = this.normalize(hitB);
      } else if (this.id === "projectonplane") {
        hitB = this.normalize(hitB);
      } else if (this.id === "reflect") {
        hitA = this.normalize(hitA);
      }

      const aScr = this.project(hitA, cx, cy, scale);
      const bScr = this.project(hitB, cx, cy, scale);
      const cScr = this.project(hitC, cx, cy, scale);

      if (Math.hypot(pos.x - aScr.x, pos.y - aScr.y) < 28) this.draggingTarget = "A";
      else if (Math.hypot(pos.x - bScr.x, pos.y - bScr.y) < 28) this.draggingTarget = "B";
      else if (Math.hypot(pos.x - cScr.x, pos.y - cScr.y) < 28) this.draggingTarget = "C";
    };

    const onMove = (e) => {
      if (!this.draggingTarget) return;
      const pos = this.getMousePos(e);
      const { cx, cy, scale } = this.getGeometry();
      const vx = Math.max(-4.2, Math.min(4.2, (pos.x - cx) / scale));
      const vy = Math.max(-3.2, Math.min(3.2, (cy - pos.y) / scale));

      if (this.draggingTarget === "A") {
        if (this.id === "rayplane") {
          this.vecA.x = vx - this.vecC.x;
          this.vecA.y = vy - this.vecC.y;
        } else {
          this.vecA.x = vx;
          this.vecA.y = vy;
        }
      }
      else if (this.draggingTarget === "B") { this.vecB.x = vx; this.vecB.y = vy; }
      else if (this.draggingTarget === "C") { this.vecC.x = vx; this.vecC.y = vy; }
      
      this.updateStateAndRender();
    };
    
    const onUp = () => { this.draggingTarget = null; };

    this.canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  getGeometry() {
    return {
      cx: this.mode === "ballistic" ? this.width * 0.14 : this.width / 2,
      cy: this.mode === "ballistic" ? this.height * 0.82 : this.height / 2,
      scale: Math.min(this.width, this.height) * 0.13
    };
  }

  project(v, cx, cy, scale) {
    return { x: cx + v.x * scale, y: cy - v.y * scale };
  }

  normalize(v) {
    const len = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  }

  updateStateAndRender() {
    if (!this.vecA || !this.vecB) return;
    const a = this.normalizeVectors ? this.normalize(this.vecA) : { ...this.vecA };
    const b = this.normalizeVectors ? this.normalize(this.vecB) : { ...this.vecB };

    const dot = a.x * b.x + a.y * b.y + a.z * b.z;
    const det2D = a.x * b.y - a.y * b.x;
    const cross = { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: det2D };

    this.currentA = a;
    this.currentB = b;
    this.currentDot = dot;
    this.currentDet = det2D;
    this.currentCross = cross;

    this.render();
    this.emitState({ vecA: a, vecB: b, vecC: this.vecC, dot, det: det2D, cross });
  }

  drawArrow(ctx, x1, y1, x2, y2, color, label, isDashed = false) {
    const headLen = 11;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    if (isDashed) ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    if (label) {
      ctx.font = "700 13px Segoe UI, sans-serif";
      ctx.fillText(label, x2 + 12, y2 - 6);
    }
  }

  drawPointWithLabel(ctx, x, y, color, label) {
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    if (label) {
      ctx.fillStyle = color;
      ctx.font = "700 13px Segoe UI, sans-serif";
      ctx.fillText(label, x + 14, y + 4);
    }
  }

  drawPointWithLabelCustom(ctx, x, y, color, label, offsetX = 14, offsetY = 4) {
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    if (label) {
      ctx.fillStyle = color;
      ctx.font = "700 13px Segoe UI, sans-serif";
      ctx.fillText(label, x + offsetX, y + offsetY);
    }
  }

  render() {
    if (!this.ctx || !this.currentA) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    const { cx, cy, scale } = this.getGeometry();

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * scale, 0);
      ctx.lineTo(cx + i * scale, this.height);
      ctx.moveTo(0, cy + i * scale);
      ctx.lineTo(this.width, cy + i * scale);
      ctx.stroke();
    }
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(this.width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.height);
    ctx.stroke();

    const pA = this.project(this.currentA, cx, cy, scale);
    const pB = this.project(this.currentB, cx, cy, scale);
    const pC = this.project(this.vecC, cx, cy, scale);

    if (this.id === "direction") {
      const dirX = this.currentB.x - this.currentA.x;
      const dirY = this.currentB.y - this.currentA.y;

      this.drawArrow(ctx, pA.x, pA.y, pB.x, pB.y, "#fcc419", "");

      const midX = (pA.x + pB.x) / 2;
      const midY = (pA.y + pB.y) / 2;
      ctx.fillStyle = "#fcc419";
      ctx.font = "700 13px Consolas, monospace";
      ctx.fillText(`Direction (${dirX.toFixed(2)}, ${dirY.toFixed(2)})`, midX + 10, midY - 12);

      this.drawPointWithLabel(ctx, pA.x, pA.y, colors.colorX, "Joueur Pos");
      this.drawPointWithLabelCustom(ctx, pB.x, pB.y, colors.colorZ, "Cible Target", 14, 22);

      ctx.fillStyle = "#fcc419";
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.fillText(`Formule : Vector3 dir = Target - Pos = (${dirX.toFixed(2)}, ${dirY.toFixed(2)})`, 18, this.height - 16);
      return;
    }

    if (this.id === "magnitude") {
      const dist = Math.hypot(this.currentB.x - this.currentA.x, this.currentB.y - this.currentA.y);
      const isInside = dist <= this.rangeLimit;

      ctx.beginPath();
      ctx.arc(pA.x, pA.y, this.rangeLimit * scale, 0, Math.PI * 2);
      ctx.fillStyle = isInside ? "rgba(255, 107, 107, 0.16)" : "rgba(81, 207, 102, 0.1)";
      ctx.fill();
      ctx.strokeStyle = isInside ? "#ff6b6b" : "#51cf66";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      this.drawArrow(ctx, pA.x, pA.y, pB.x, pB.y, isInside ? "#ff6b6b" : "#51cf66", "");
      
      const midX = (pA.x + pB.x) / 2;
      const midY = (pA.y + pB.y) / 2;
      ctx.fillStyle = isInside ? "#ff6b6b" : "#51cf66";
      ctx.font = "700 13px Consolas, monospace";
      ctx.fillText(`${dist.toFixed(2)}m`, midX - 15, midY - 12);

      this.drawPointWithLabel(ctx, pA.x, pA.y, colors.colorX, "Joueur (Centre Radar)");
      this.drawPointWithLabelCustom(ctx, pB.x, pB.y, colors.colorZ, "Ennemi", 14, 22);

      ctx.fillStyle = isInside ? "#ff6b6b" : "#51cf66";
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.fillText(
        isInside
          ? `🚨 ENNEMI À PORTÉE ! Distance = ${dist.toFixed(2)}m ≤ ${this.rangeLimit}m (sqrMagnitude = ${(dist * dist).toFixed(2)})`
          : `✓ Hors de portée : Distance = ${dist.toFixed(2)}m > ${this.rangeLimit}m`,
        18,
        this.height - 16
      );
      return;
    }

    if (this.id === "reflect") {
      const normA = this.normalize(this.currentA);
      const tangentX = -normA.y;
      const tangentY = normA.x;

      ctx.strokeStyle = "#8a8886";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - tangentX * scale * 3.5, cy + tangentY * scale * 3.5);
      ctx.lineTo(cx + tangentX * scale * 3.5, cy - tangentY * scale * 3.5);
      ctx.stroke();

      const inVec = { x: -this.currentB.x, y: -this.currentB.y };
      const dotProd = inVec.x * normA.x + inVec.y * normA.y;
      const refVec = {
        x: inVec.x - 2 * dotProd * normA.x,
        y: inVec.y - 2 * dotProd * normA.y
      };
      const pRef = this.project(refVec, cx, cy, scale);
      const pNormA = this.project(normA, cx, cy, scale);

      this.drawArrow(ctx, pB.x, pB.y, cx, cy, colors.colorZ, "");
      this.drawPointWithLabel(ctx, pB.x, pB.y, colors.colorZ, "Source Laser B (Glissez)");
      this.drawArrow(ctx, cx, cy, pNormA.x, pNormA.y, "#fcc419", "Normale Mur A (Glissez)");
      this.drawArrow(ctx, cx, cy, pRef.x, pRef.y, "#cc5de8", "Laser Rebondi (Reflect)");

      ctx.fillStyle = "#cc5de8";
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.fillText(`Reflect = Rayon rebondit symétriquement par rapport à la Normale jaune`, 18, this.height - 16);
      return;
    }

    if (this.mode === "dot") {
      const guardAngle = Math.atan2(this.currentB.y, this.currentB.x);
      ctx.fillStyle = "rgba(81, 207, 102, 0.14)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, scale * 2.4, -(guardAngle + Math.PI / 4), -(guardAngle - Math.PI / 4), false);
      ctx.closePath();
      ctx.fill();

      this.drawArrow(ctx, cx, cy, pB.x, pB.y, colors.colorZ, `Regard du Garde B`);
      this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.colorX, `Direction Joueur A`);

      let verdict = "";
      let vColor = "#51cf66";
      if (this.currentDot > 0.7) {
        verdict = `👀 Dot = ${this.currentDot.toFixed(2)} (> 0.7) : JOUEUR DANS LE CÔNE DE VISION (DÉTECTÉ !)`;
        vColor = "#ff6b6b";
      } else if (this.currentDot > 0.05) {
        verdict = `⚠️ Dot = ${this.currentDot.toFixed(2)} (> 0) : DEVANT MAIS HORS CÔNE PÉRIPHÉRIQUE`;
        vColor = "#fcc419";
      } else if (this.currentDot >= -0.05) {
        verdict = `📐 Dot ≈ 0 : EXACTEMENT À 90° SUR LE FLANC`;
        vColor = "#4cc2ff";
      } else {
        verdict = `🥷 Dot = ${this.currentDot.toFixed(2)} (< 0) : DANS LE DOS DU GARDE (BACKSTAB)`;
        vColor = "#51cf66";
      }

      ctx.fillStyle = vColor;
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.fillText(verdict, 18, this.height - 16);
      return;
    }

    if (this.mode === "alkashi") {
      ctx.fillStyle = "rgba(76, 194, 255, 0.12)";
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(pC.x, pC.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4cc2ff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const cLen = Math.hypot(this.currentA.x - this.currentB.x, this.currentA.y - this.currentB.y);
      const aLen = Math.hypot(this.currentB.x - this.vecC.x, this.currentB.y - this.vecC.y);
      const bLen = Math.hypot(this.currentA.x - this.vecC.x, this.currentA.y - this.vecC.y);
      const cosGamma = Math.max(-1, Math.min(1, (aLen ** 2 + bLen ** 2 - cLen ** 2) / (2 * aLen * bLen || 1)));
      const gammaDeg = (Math.acos(cosGamma) * 180) / Math.PI;

      this.drawPointWithLabel(ctx, pA.x, pA.y, colors.colorX, "Épaule A");
      this.drawPointWithLabel(ctx, pB.x, pB.y, colors.colorZ, "Main B");
      this.drawPointWithLabel(ctx, pC.x, pC.y, "#fcc419", `Coude C (Angle = ${gammaDeg.toFixed(1)}°)`);
      return;
    }

    if (this.mode === "barycentre") {
      const sumW = this.weightA + this.weightB + this.weightC;
      const gx = (this.weightA * this.currentA.x + this.weightB * this.currentB.x + this.weightC * this.vecC.x) / sumW;
      const gy = (this.weightA * this.currentA.y + this.weightB * this.currentB.y + this.weightC * this.vecC.y) / sumW;
      const pG = this.project({ x: gx, y: gy, z: 0 }, cx, cy, scale);

      ctx.strokeStyle = colors.muted;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(pC.x, pC.y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "#cc5de8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let t = 0; t <= 1.01; t += 0.02) {
        const u = 1 - t;
        const bx = u * u * this.currentA.x + 2 * u * t * this.currentB.x + t * t * this.vecC.x;
        const by = u * u * this.currentA.y + 2 * u * t * this.currentB.y + t * t * this.vecC.y;
        const bp = this.project({ x: bx, y: by, z: 0 }, cx, cy, scale);
        if (t === 0) ctx.moveTo(bp.x, bp.y);
        else ctx.lineTo(bp.x, bp.y);
      }
      ctx.stroke();

      this.drawPointWithLabel(ctx, pG.x, pG.y, "#51cf66", `Centre de Masse G (${gx.toFixed(1)}, ${gy.toFixed(1)})`);
      this.drawPointWithLabel(ctx, pA.x, pA.y, colors.colorX, `A (α=${this.weightA})`);
      this.drawPointWithLabel(ctx, pB.x, pB.y, colors.colorZ, `B (β=${this.weightB})`);
      this.drawPointWithLabel(ctx, pC.x, pC.y, "#fcc419", `C (γ=${this.weightC})`);
      return;
    }

    if (this.mode === "ballistic") {
      const vx = Math.max(0.5, this.currentA.x * 3.5);
      const vy = Math.max(0.5, this.currentA.y * 3.5);
      ctx.strokeStyle = "#fcc419";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let t = 0; t <= 4.0; t += 0.04) {
        const x = vx * t;
        const y = vy * t - 0.5 * this.gravity * t * t;
        const sp = this.project({ x, y, z: 0 }, cx, cy, scale * 0.45);
        if (t === 0) ctx.moveTo(sp.x, sp.y);
        else ctx.lineTo(sp.x, sp.y);
        if (y < -0.5 && t > 0.2) break;
      }
      ctx.stroke();
      this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.colorX, `Vitesse Initiale V0 (Glissez)`);
      return;
    }

    if (this.mode === "vectorfield") {
      for (let gx = -3.5; gx <= 3.5; gx += 0.7) {
        for (let gy = -2.5; gy <= 2.5; gy += 0.7) {
          const fx = -gy * 0.35 + (this.currentA.x - gx) * 0.15;
          const fy = gx * 0.35 + (this.currentA.y - gy) * 0.15;
          const s1 = this.project({ x: gx, y: gy, z: 0 }, cx, cy, scale);
          const s2 = this.project({ x: gx + fx, y: gy + fy, z: 0 }, cx, cy, scale);
          this.drawArrow(ctx, s1.x, s1.y, s2.x, s2.y, "#4cc2ff", "");
        }
      }
      this.drawPointWithLabel(ctx, pA.x, pA.y, colors.colorX, `Vortex Nabla ∇ (${this.currentA.x.toFixed(1)}, ${this.currentA.y.toFixed(1)})`);
      return;
    }

    if (this.id === "project") {
      const bLenSq = this.currentB.x ** 2 + this.currentB.y ** 2 || 1;
      const projFactor = this.currentDot / bLenSq;
      const projVec = { x: this.currentB.x * projFactor, y: this.currentB.y * projFactor, z: 0 };
      const pProj = this.project(projVec, cx, cy, scale);
      const distOrtho = Math.hypot(this.currentA.x - projVec.x, this.currentA.y - projVec.y);

      this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.colorX, `Vecteur A`);
      this.drawArrow(ctx, cx, cy, pB.x, pB.y, colors.colorZ, `Mur / Rail B`);
      this.drawArrow(ctx, pA.x, pA.y, pProj.x, pProj.y, "#51cf66", "", true);
      this.drawArrow(ctx, cx, cy, pProj.x, pProj.y, "#fcc419", `Projeté H (Dist=${distOrtho.toFixed(2)})`);
      return;
    }

    if (this.id === "projectonplane") {
      const normB = this.normalize(this.currentB);
      const tx = -normB.y, ty = normB.x;

      ctx.strokeStyle = "#8a8886";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - tx * scale * 5, cy + ty * scale * 5);
      ctx.lineTo(cx + tx * scale * 5, cy - ty * scale * 5);
      ctx.stroke();

      const dot = this.currentA.x * normB.x + this.currentA.y * normB.y;
      const projVec = { x: this.currentA.x - dot * normB.x, y: this.currentA.y - dot * normB.y };
      
      const pProj = this.project(projVec, cx, cy, scale);
      const pNorm = this.project(normB, cx, cy, scale);

      this.drawArrow(ctx, cx, cy, pNorm.x, pNorm.y, "#fcc419", "Normale Plan N");
      this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.colorX, "Mouvement Brut V");
      this.drawArrow(ctx, cx, cy, pProj.x, pProj.y, "#51cf66", "Glissement (ProjectOnPlane)");
      return;
    }

    if (this.id === "rayplane") {
      const normB = this.normalize(this.currentB);
      const tx = -normB.y, ty = normB.x;

      ctx.strokeStyle = "#8a8886";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - tx * scale * 5, cy + ty * scale * 5);
      ctx.lineTo(cx + tx * scale * 5, cy - ty * scale * 5);
      ctx.stroke();

      const pOrigin = this.project(this.vecC, cx, cy, scale);
      const pNorm = this.project(normB, cx, cy, scale);
      const pDir = this.project({ x: this.vecC.x + this.currentA.x, y: this.vecC.y + this.currentA.y }, cx, cy, scale);

      this.drawArrow(ctx, cx, cy, pNorm.x, pNorm.y, "#fcc419", "Normale N");
      this.drawPointWithLabel(ctx, pOrigin.x, pOrigin.y, colors.colorX, "Fusil (Origine)");
      this.drawArrow(ctx, pOrigin.x, pOrigin.y, pDir.x, pDir.y, colors.colorX, "");

      const denom = this.currentA.x * normB.x + this.currentA.y * normB.y;
      if (Math.abs(denom) > 0.001) {
        const t = -(this.vecC.x * normB.x + this.vecC.y * normB.y) / denom;
        if (t >= 0) {
          const hit = { x: this.vecC.x + this.currentA.x * t, y: this.vecC.y + this.currentA.y * t };
          const pHit = this.project(hit, cx, cy, scale);

          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = colors.colorX;
          ctx.beginPath(); ctx.moveTo(pOrigin.x, pOrigin.y); ctx.lineTo(pHit.x, pHit.y); ctx.stroke();
          ctx.setLineDash([]);
          
          this.drawPointWithLabel(ctx, pHit.x, pHit.y, "#cc5de8", `Impact (Raycast Hit) t=${t.toFixed(1)}`);
        }
      }
      return;
    }

    const sumAB = { x: this.currentA.x + this.currentB.x, y: this.currentA.y + this.currentB.y, z: 0 };
    const pSum = this.project(sumAB, cx, cy, scale);

    ctx.fillStyle = this.currentDet >= 0 ? "rgba(81, 207, 102, 0.16)" : "rgba(255, 107, 107, 0.16)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pA.x, pA.y);
    ctx.lineTo(pSum.x, pSum.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.closePath();
    ctx.fill();

    this.drawArrow(ctx, cx, cy, pA.x, pA.y, colors.colorX, `A (${this.currentA.x.toFixed(1)}, ${this.currentA.y.toFixed(1)})`);
    this.drawArrow(ctx, cx, cy, pB.x, pB.y, colors.colorZ, `B (${this.currentB.x.toFixed(1)}, ${this.currentB.y.toFixed(1)})`);

    ctx.fillStyle = this.currentDet >= 0 ? "#51cf66" : "#ff6b6b";
    ctx.font = "700 14px Segoe UI, sans-serif";
    ctx.fillText(
      `Déterminant = ${this.currentDet.toFixed(2)} (${this.currentDet >= 0 ? "B est à GAUCHE de A" : "B est à DROITE de A"})`,
      18,
      this.height - 16
    );
  }
}