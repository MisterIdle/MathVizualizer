import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class SpecialSandbox extends BaseSandbox {
  constructor(canvas, funcItem, onStateChange) {
    super(canvas, funcItem, onStateChange);
    this.mode = funcItem.sandbox;
    this.freq = 3.0;
    this.kelvin = 6500;
    this.probes = [
      { x: 0.35, y: 0.45 },
      { x: 0.7, y: 0.6 }
    ];
    this.draggingIndex = -1;

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.mode === "colortemp") {
      return [
        {
          type: "range",
          key: "kelvin",
          label: "Température (Kelvin)",
          min: 1000,
          max: 20000,
          step: 100,
          value: this.kelvin,
          onChange: (val) => {
            this.kelvin = val;
            this.updateStateAndRender();
          }
        }
      ];
    }

    return [
      {
        type: "range",
        key: "freq",
        label: "Fréquence du bruit",
        min: 1,
        max: 10,
        step: 0.25,
        value: this.freq,
        onChange: (val) => {
          this.freq = val;
          this.updateStateAndRender();
        }
      }
    ];
  }

  bindEvents() {
    const onDown = (e) => {
      if (this.mode !== "perlin") return;
      const pos = this.getMousePos(e);
      this.probes.forEach((p, idx) => {
        const px = p.x * this.width;
        const py = p.y * this.height;
        if (Math.hypot(pos.x - px, pos.y - py) < 24) {
          this.draggingIndex = idx;
        }
      });
    };

    const onMove = (e) => {
      if (this.draggingIndex === -1) return;
      const pos = this.getMousePos(e);
      this.probes[this.draggingIndex].x = MathEvaluator.clamp01(pos.x / this.width);
      this.probes[this.draggingIndex].y = MathEvaluator.clamp01(pos.y / this.height);
      this.updateStateAndRender();
    };

    const onUp = () => {
      this.draggingIndex = -1;
    };

    this.canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  updateStateAndRender() {
    if (this.mode === "colortemp") {
      this.rgb = MathEvaluator.kelvinToRGB(this.kelvin);
      this.render();
      this.emitState({ kelvin: this.kelvin, rgb: this.rgb });
      return;
    }

    if (!this.probes) return;
    this.computedProbes = this.probes.map((p, idx) => ({
      index: idx + 1,
      color: this.palette[idx % this.palette.length],
      x: p.x,
      y: p.y,
      val: MathEvaluator.perlin2D(p.x * this.freq, p.y * this.freq)
    }));

    this.render();
    this.emitState({
      freq: this.freq,
      probes: this.computedProbes
    });
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === "colortemp") {
      const rgb = this.rgb || MathEvaluator.kelvinToRGB(this.kelvin || 6500);
      const r255 = Math.round(rgb.r * 255);
      const g255 = Math.round(rgb.g * 255);
      const b255 = Math.round(rgb.b * 255);

      ctx.fillStyle = `rgb(${r255}, ${g255}, ${b255})`;
      ctx.fillRect(40, 40, this.width - 80, this.height - 80);

      ctx.fillStyle = "#000";
      ctx.font = "700 20px Segoe UI, sans-serif";
      ctx.fillText(`${this.kelvin} K — RGB(${rgb.r.toFixed(2)}, ${rgb.g.toFixed(2)}, ${rgb.b.toFixed(2)})`, 64, 90);
      return;
    }

    const cell = 14;
    for (let y = 0; y < this.height; y += cell) {
      for (let x = 0; x < this.width; x += cell) {
        const nx = (x / this.width) * this.freq;
        const ny = (y / this.height) * this.freq;
        const v = Math.round(MathEvaluator.perlin2D(nx, ny) * 255);
        ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
        ctx.fillRect(x, y, cell, cell);
      }
    }

    (this.computedProbes || []).forEach((p) => {
      const px = p.x * this.width;
      const py = p.y * this.height;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#4cc2ff";
      ctx.font = "700 12px Segoe UI, sans-serif";
      ctx.fillText(`P${p.index}: ${p.val.toFixed(3)}`, px + 12, py + 4);
    });
  }
}