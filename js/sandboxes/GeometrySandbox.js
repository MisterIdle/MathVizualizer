import { BaseSandbox } from "./BaseSandbox.js";

export class GeometrySandbox extends BaseSandbox {
  constructor(canvas, funcItem, onStateChange) {
    super(canvas, funcItem, onStateChange);
    this.mode = funcItem.id;
    this.draggingTarget = null;

    this.pointA = { x: -1.8, y: -1.2, z: 0 };
    this.pointB = { x: 1.8, y: -1.2, z: 0 };
    this.pointC = { x: 1.8, y: 1.4, z: 0 };
    this.pointD = { x: 2.5, y: -1.2, z: 0 };

    if (this.mode === "thales") {
      this.pointA = { x: -2.6, y: -1.3, z: 0 };
      this.pointB = { x: -0.2, y: 0.4, z: 0 };
      this.pointC = { x: -0.2, y: -1.3, z: 0 };
      this.pointD = { x: 2.2, y: -1.3, z: 0 };
    } else if (this.mode === "normalized") {
      this.pointA = { x: 0, y: 0, z: 0 };
      this.pointB = { x: 2.4, y: 1.6, z: 0 };
    }

    this.totalItems = 17;
    this.stackSize = 5;

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.mode === "euclide") {
      return [
        {
          type: "range",
          key: "totalItems",
          label: "Nombre d'objets (A)",
          min: 1,
          max: 32,
          step: 1,
          value: this.totalItems,
          onChange: (val) => {
            this.totalItems = val;
            this.updateStateAndRender();
          }
        },
        {
          type: "range",
          key: "stackSize",
          label: "Taille d'un coffre / Stack (B)",
          min: 2,
          max: 10,
          step: 1,
          value: this.stackSize,
          onChange: (val) => {
            this.stackSize = val;
            this.updateStateAndRender();
          }
        }
      ];
    }
    return [];
  }

  bindEvents() {
    const onDown = (e) => {
      if (this.mode === "euclide") return;
      const pos = this.getMousePos(e);
      const { cx, cy, scale } = this.getGeometry();
      const checkHit = (p) => Math.hypot(pos.x - (cx + p.x * scale), pos.y - (cy - p.y * scale)) < 30;

      if (this.mode === "pythagore") {
        if (checkHit(this.pointA)) this.draggingTarget = "A";
        else if (checkHit(this.pointC)) this.draggingTarget = "C";
      } else if (this.mode === "thales") {
        if (checkHit(this.pointB)) this.draggingTarget = "B";
        else if (checkHit(this.pointD)) this.draggingTarget = "D";
      } else if (this.mode === "normalized") {
        if (checkHit(this.pointB)) this.draggingTarget = "B";
      }
    };

    const onMove = (e) => {
      if (!this.draggingTarget) return;
      const pos = this.getMousePos(e);
      const { cx, cy, scale } = this.getGeometry();
      const vx = Math.max(-3.4, Math.min(3.4, (pos.x - cx) / scale));
      const vy = Math.max(-2.2, Math.min(2.2, (cy - pos.y) / scale));

      if (this.mode === "pythagore") {
        if (this.draggingTarget === "A") {
          this.pointA.x = vx;
          this.pointA.y = vy;
          this.pointB.y = vy;
        }
        if (this.draggingTarget === "C") {
          this.pointC.x = vx;
          this.pointC.y = vy;
          this.pointB.x = vx;
        }
      } else if (this.mode === "thales") {
        if (this.draggingTarget === "B") {
          this.pointB.x = Math.max(-1.8, Math.min(1.2, vx));
          this.pointC.x = this.pointB.x;
          this.pointB.y = Math.max(-0.8, Math.min(1.6, vy));
        }
        if (this.draggingTarget === "D") {
          this.pointD.x = Math.max(this.pointB.x + 0.5, Math.min(3.2, vx));
        }
      } else if (this.mode === "normalized") {
        if (this.draggingTarget === "B") {
          this.pointB.x = vx;
          this.pointB.y = vy;
        }
      }
      this.updateStateAndRender();
    };

    const onUp = () => {
      this.draggingTarget = null;
    };

    this.canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  getGeometry() {
    return {
      cx: this.width / 2,
      cy: this.height / 2,
      scale: Math.min(this.width, this.height) * 0.15
    };
  }

  updateStateAndRender() {
    this.render();
    const dist = Math.hypot(this.pointB.x - this.pointA.x, this.pointB.y - this.pointA.y);
    this.emitState({
      vecA: { x: this.pointA.x, y: this.pointA.y, z: 0 },
      vecB: { x: this.pointB.x, y: this.pointB.y, z: 0 },
      vecC: { x: this.pointC.x, y: this.pointC.y, z: 0 },
      dot: dist,
      det: this.mode === "euclide" ? this.totalItems % this.stackSize : 0
    });
  }

  drawPoint(ctx, x, y, color, label) {
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
      ctx.fillText(label, x + 12, y - 8);
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    const { cx, cy, scale } = this.getGeometry();

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * scale, 0);
      ctx.lineTo(cx + i * scale, this.height);
      ctx.moveTo(0, cy + i * scale);
      ctx.lineTo(this.width, cy + i * scale);
      ctx.stroke();
    }

    if (this.mode === "euclide") {
      const q = Math.floor(this.totalItems / this.stackSize);
      const r = this.totalItems % this.stackSize;
      const boxW = 46;
      const boxH = 46;
      const gap = 8;
      const startX = 40;
      const startY = 80;

      ctx.fillStyle = colors.text;
      ctx.font = "700 16px Segoe UI, sans-serif";
      ctx.fillText(
        `${this.totalItems} objets ÷ ${this.stackSize} par coffre  ➔  Quotient = ${q} coffre(s) plein(s)  |  Reste (Modulo %) = ${r} objet(s)`,
        30,
        42
      );

      for (let i = 0; i < this.totalItems; i++) {
        const groupIdx = Math.floor(i / this.stackSize);
        const inGroupIdx = i % this.stackSize;
        const isRemainder = groupIdx === q;

        const x = startX + inGroupIdx * (boxW + gap);
        const y = startY + groupIdx * (boxH + 18);

        ctx.fillStyle = isRemainder ? "rgba(252, 196, 25, 0.25)" : "rgba(81, 207, 102, 0.25)";
        ctx.strokeStyle = isRemainder ? "#fcc419" : "#51cf66";
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, boxW, boxH);
        ctx.strokeRect(x, y, boxW, boxH);

        ctx.fillStyle = colors.text;
        ctx.font = "700 13px Consolas, monospace";
        ctx.fillText(`#${i + 1}`, x + 10, y + 28);

        if (inGroupIdx === this.stackSize - 1 && !isRemainder) {
          ctx.fillStyle = "#51cf66";
          ctx.font = "700 13px Segoe UI, sans-serif";
          ctx.fillText(`✓ Coffre complet #${groupIdx + 1}`, x + boxW + 16, y + 28);
        }
        if (i === this.totalItems - 1 && isRemainder) {
          ctx.fillStyle = "#fcc419";
          ctx.font = "700 13px Segoe UI, sans-serif";
          ctx.fillText(`⚡ Reste (Modulo) = ${r} unité(s)`, x + boxW + 16, y + 28);
        }
      }
      return;
    }

    if (this.mode === "pythagore") {
      const pA = { x: cx + this.pointA.x * scale, y: cy - this.pointA.y * scale };
      const pB = { x: cx + this.pointB.x * scale, y: cy - this.pointB.y * scale };
      const pC = { x: cx + this.pointC.x * scale, y: cy - this.pointC.y * scale };

      const distA = Math.abs(this.pointC.y - this.pointB.y);
      const distB = Math.abs(this.pointA.x - this.pointB.x);
      const distC = Math.hypot(distA, distB);

      ctx.fillStyle = "rgba(77, 171, 247, 0.15)";
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(pC.x, pC.y);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = colors.colorY;
      ctx.beginPath();
      ctx.moveTo(pC.x, pC.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.stroke();

      ctx.strokeStyle = colors.colorX;
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.stroke();

      ctx.strokeStyle = "#4cc2ff";
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pC.x, pC.y);
      ctx.stroke();

      const signX = Math.sign(pA.x - pB.x) || 1;
      const signY = Math.sign(pC.y - pB.y) || -1;
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 2;
      ctx.strokeRect(pB.x, pB.y, signX * 18, signY * 18);

      this.drawPoint(ctx, pC.x, pC.y, colors.colorY, `Hauteur A = ${distA.toFixed(2)}`);
      this.drawPoint(ctx, pA.x, pA.y, colors.colorX, `Largeur B = ${distB.toFixed(2)}`);

      ctx.fillStyle = "#4cc2ff";
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.fillText(
        `Hypoténuse C = √(${distA.toFixed(2)}² + ${distB.toFixed(2)}²) = ${distC.toFixed(2)}`,
        18,
        this.height - 16
      );
      return;
    }

    if (this.mode === "thales") {
      const pA = { x: cx + this.pointA.x * scale, y: cy - this.pointA.y * scale };
      const pB = { x: cx + this.pointB.x * scale, y: cy - this.pointB.y * scale };
      const pC = { x: cx + this.pointC.x * scale, y: cy - this.pointC.y * scale };
      const pD = { x: cx + this.pointD.x * scale, y: cy - this.pointD.y * scale };

      const distSmall = Math.max(0.2, this.pointB.x - this.pointA.x);
      const hSmall = this.pointB.y - this.pointC.y;
      const distBig = Math.max(distSmall + 0.2, this.pointD.x - this.pointA.x);
      const hBig = (hSmall * distBig) / distSmall;
      const pE = { x: pD.x, y: pD.y - hBig * scale };

      ctx.fillStyle = "rgba(252, 196, 25, 0.1)";
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pE.x, pE.y);
      ctx.lineTo(pD.x, pD.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(252, 196, 25, 0.6)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pE.x, pE.y);
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pD.x, pD.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = colors.colorX;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(pB.x, pB.y);
      ctx.lineTo(pC.x, pC.y);
      ctx.stroke();

      ctx.strokeStyle = colors.colorY;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(pE.x, pE.y);
      ctx.lineTo(pD.x, pD.y);
      ctx.stroke();

      this.drawPoint(ctx, pA.x, pA.y, "#fcc419", "Caméra / Lumière");
      this.drawPoint(ctx, pB.x, pB.y, colors.colorX, `Objet Proche (h=${hSmall.toFixed(2)})`);
      this.drawPoint(ctx, pD.x, pD.y, colors.colorY, `Mur Lointain (H=${hBig.toFixed(2)})`);

      ctx.fillStyle = "#51cf66";
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.fillText(
        `Thalès : H_mur = (${hSmall.toFixed(2)} × ${distBig.toFixed(2)}) / ${distSmall.toFixed(2)} = ${hBig.toFixed(2)}`,
        18,
        this.height - 16
      );
      return;
    }

    if (this.mode === "normalized") {
      const pB = { x: cx + this.pointB.x * scale, y: cy - this.pointB.y * scale };
      const dist = Math.hypot(this.pointB.x, this.pointB.y) || 1;
      const normX = this.pointB.x / dist;
      const normY = this.pointB.y / dist;
      const pNorm = { x: cx + normX * scale, y: cy - normY * scale };

      ctx.strokeStyle = "rgba(81, 207, 102, 0.35)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(cx, cy, scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(255, 107, 107, 0.45)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(pB.x, pB.y);
      ctx.stroke();

      ctx.strokeStyle = "#51cf66";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(pNorm.x, pNorm.y);
      ctx.stroke();

      this.drawPoint(ctx, pB.x, pB.y, "#ff6b6b", `Vecteur Brut (Longueur = ${dist.toFixed(2)})`);
      this.drawPoint(ctx, pNorm.x, pNorm.y, "#51cf66", `Normalized (Longueur = 1.00)`);

      ctx.fillStyle = "#51cf66";
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.fillText(
        `Vecteur Normalisé = (${normX.toFixed(2)}, ${normY.toFixed(2)}) — Toujours bloqué sur le cercle de rayon 1 !`,
        18,
        this.height - 16
      );
    }
  }
}