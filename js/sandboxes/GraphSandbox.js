import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class GraphSandbox extends BaseSandbox {
  constructor(canvas, funcItem, onStateChange) {
    super(canvas, funcItem, onStateChange);
    this.params = {};
    (funcItem.params || []).forEach((p) => {
      this.params[p.key] = p.value;
    });

    this.cursorX = 0.5;
    this.isDragging = false;

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    return (this.funcItem.params || []).map((p) => ({
      type: "range",
      key: p.key,
      label: p.label,
      min: p.min,
      max: p.max,
      step: p.step,
      value: this.params[p.key],
      onChange: (val) => {
        this.params[p.key] = val;
        this.updateStateAndRender();
      }
    }));
  }

  bindEvents() {
    const updateFromMouse = (e) => {
      const pos = this.getMousePos(e);
      const { cx, scale } = this.getGeometry();
      const x = (pos.x - cx) / scale;
      this.cursorX = MathEvaluator.clamp(x, -4.0, 4.0);
      this.updateStateAndRender();
    };

    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      updateFromMouse(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      updateFromMouse(e);
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
  }

  getGeometry() {
    return {
      cx: this.width / 2,
      cy: this.height * 0.56,
      scale: Math.min(this.width, this.height) * 0.1
    };
  }

  updateStateAndRender() {
    const y = MathEvaluator.evaluate1D(this.funcItem.id, this.cursorX, this.params);
    this.computedProbes = [
      {
        index: 1,
        color: this.palette[0],
        x: this.cursorX,
        y
      }
    ];

    this.render();
    this.emitState({
      probes: this.computedProbes,
      params: this.params
    });
  }

  drawGameplayPreview(ctx, x, y, colors) {
    const barW = Math.min(460, this.width - 40);
    const barX = (this.width - barW) / 2;
    const barY = 26;

    ctx.fillStyle = "rgba(25, 25, 25, 0.85)";
    ctx.fillRect(barX - 12, barY - 14, barW + 24, 48);
    ctx.strokeStyle = colors.grid;
    ctx.strokeRect(barX - 12, barY - 14, barW + 24, 48);

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(barX, barY + 14);
    ctx.lineTo(barX + barW, barY + 14);
    ctx.stroke();

    const norm = MathEvaluator.clamp01((y + 4) / 8);
    const objX = barX + norm * barW;

    ctx.beginPath();
    ctx.arc(objX, barY + 14, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#51cf66";
    ctx.fill();

    ctx.fillStyle = colors.text;
    ctx.font = "700 12px Segoe UI, sans-serif";
    ctx.fillText(`Aperçu Gameplay : Entrée X = ${x.toFixed(2)}  ➔  Résultat = ${y.toFixed(2)}`, barX, barY - 1);
  }

  render() {
    if (!this.ctx || !this.computedProbes) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    const { cx, cy, scale } = this.getGeometry();

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * scale, 0);
      ctx.lineTo(cx + i * scale, this.height);
      ctx.moveTo(0, cy + i * scale);
      ctx.lineTo(this.width, cy + i * scale);
      ctx.stroke();

      if (i !== 0 && i >= -4 && i <= 4) {
        ctx.fillStyle = colors.muted;
        ctx.font = "11px Consolas, monospace";
        ctx.fillText(`${i}`, cx + i * scale - 4, cy + 15);
      }
    }

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(this.width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#4cc2ff";
    ctx.lineWidth = 3;
    for (let px = 0; px <= this.width; px += 3) {
      const x = (px - cx) / scale;
      const y = MathEvaluator.evaluate1D(this.funcItem.id, x, this.params);
      const py = cy - y * scale;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const p = this.computedProbes[0];
    const px = cx + p.x * scale;
    const py = cy - p.y * scale;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#fcc419";
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, this.height);
    ctx.moveTo(0, py);
    ctx.lineTo(this.width, py);
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#fcc419";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    this.drawGameplayPreview(ctx, p.x, p.y, colors);

    ctx.fillStyle = colors.muted;
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.fillText("Cliquez et glissez n'importe où horizontalement pour déplacer le curseur jaune sur la courbe.", 16, this.height - 14);
  }
}