import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class TrigCircleSandbox extends BaseSandbox {
  constructor(canvas, concept, onStateChange, onInteract) {
    super(canvas, concept, onStateChange, onInteract);
    this.draggingIndex = -1;
    this.lerpT = 0.5;
    this.spawnCount = 8;
    this.useBuggyAtan = false;

    if (this.mode === "deltaangle" || this.mode === "lerpangle") {
      this.points = [
        { angleRad: 0.35, radius: 1.0 },
        { angleRad: 5.55, radius: 1.0 }
      ];
    } else if (this.mode === "acos") {
      this.points = [{ angleRad: Math.acos(0.45), radius: 1.0 }];
    } else if (this.mode === "asin") {
      this.points = [{ angleRad: Math.asin(0.55), radius: 1.0 }];
    } else if (this.mode === "atan2") {
      this.points = [{ angleRad: Math.PI * 0.78, radius: 1.05 }];
    } else {
      this.points = [{ angleRad: Math.PI / 4, radius: 1.0 }];
    }

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.mode === "atan2") {
      return [
        {
          type: "button",
          label: this.useBuggyAtan ? "Mode : Atan(y/x) [Bug à gauche]" : "Mode : Atan2(y, x) [360° Parfait]",
          onClick: (btn) => {
            this.useBuggyAtan = !this.useBuggyAtan;
            if (btn) btn.textContent = this.useBuggyAtan ? "Mode : Atan(y/x) [Bug à gauche]" : "Mode : Atan2(y, x) [360° Parfait]";
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "lerpangle") {
      return [
        {
          type: "range",
          key: "lerpT",
          label: "Interpolation t (0 → 1)",
          min: 0,
          max: 1,
          step: 0.02,
          value: this.lerpT,
          onChange: (v) => {
            this.lerpT = v;
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.mode === "sincos") {
      return [
        {
          type: "range",
          key: "spawnCount",
          label: "Objets sur le cercle",
          min: 3,
          max: 24,
          step: 1,
          value: this.spawnCount,
          onChange: (v) => {
            this.spawnCount = Math.round(v);
            this.notifyInteract();
            this.updateStateAndRender();
          }
        }
      ];
    }
    return [];
  }

  bindEvents() {
    const updateFromPos = (pos) => {
      if (this.draggingIndex === -1) return;
      const { cx, cy, baseR } = this.getGeometry();
      const dx = (pos.x - cx) / baseR;
      const dy = (cy - pos.y) / baseR;

      if (this.mode === "acos") {
        const clampedX = MathEvaluator.clamp(dx, -1, 1);
        this.points[0] = { angleRad: Math.acos(clampedX), radius: 1.0 };
        this.updateStateAndRender();
        return;
      }
      if (this.mode === "asin") {
        const clampedY = MathEvaluator.clamp(dy, -1, 1);
        let a = Math.asin(clampedY);
        if (a < 0) a += Math.PI * 2;
        this.points[0] = { angleRad: a, radius: 1.0 };
        this.updateStateAndRender();
        return;
      }

      let angleRad = Math.atan2(dy, dx);
      if (angleRad < 0) angleRad += Math.PI * 2;
      const freeRadius = this.mode === "atan2" || this.mode === "sincos";
      const radius = freeRadius ? MathEvaluator.clamp(Math.hypot(dx, dy), 0.35, 1.35) : 1.0;
      this.points[this.draggingIndex] = { angleRad, radius };
      this.updateStateAndRender();
    };

    this.bindPointer(
      (pos) => {
        const { cx, cy, baseR } = this.getGeometry();
        let bestIdx = 0;
        let bestDist = Infinity;
        this.points.forEach((p, idx) => {
          const px = cx + Math.cos(p.angleRad) * p.radius * baseR;
          const py = cy - Math.sin(p.angleRad) * p.radius * baseR;
          const d = Math.hypot(pos.x - px, pos.y - py);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = idx;
          }
        });
        this.draggingIndex = bestIdx;
        updateFromPos(pos);
      },
      updateFromPos,
      () => {
        this.draggingIndex = -1;
      }
    );
  }

  getGeometry() {
    const hasWave = this.mode === "cos" || this.mode === "sin";
    const cx = hasWave || this.mode === "tan" ? this.width * 0.32 : this.width * 0.5;
    const cy = this.height * 0.48;
    const baseR = Math.min(this.width, this.height) * 0.31;
    return { cx, cy, baseR };
  }

  updateStateAndRender() {
    if (!this.points) return;
    const evalMode = this.mode === "atan2" && this.useBuggyAtan ? "atan" : this.mode;
    const computed = this.points.map((p, idx) => {
      const x = Math.cos(p.angleRad) * p.radius;
      const y = Math.sin(p.angleRad) * p.radius;
      let angleDeg = (p.angleRad * 180) / Math.PI;
      if (this.mode === "asin" && angleDeg > 180) angleDeg -= 360;
      return {
        index: idx + 1,
        color: this.palette[idx % this.palette.length],
        angleRad: p.angleRad,
        angleDeg,
        radius: p.radius,
        x,
        y,
        out: 0
      };
    });

    computed.forEach((pt, idx) => {
      const other = computed[(idx + 1) % computed.length];
      pt.out = MathEvaluator.evaluateTrig(evalMode, pt, other, this.lerpT);
    });

    this.computedPoints = computed;
    this.render();
    this.emitState({
      mode: evalMode,
      points: computed,
      lerpT: this.lerpT,
      spawnCount: this.spawnCount,
      useBuggyAtan: this.useBuggyAtan
    });
  }

  render() {
    if (!this.ctx || !this.computedPoints) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    const { cx, cy, baseR } = this.getGeometry();

    ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid(ctx, cx, cy, baseR * 0.5, colors, false);

    if (this.mode === "atan2") return this.drawTurret(ctx, cx, cy, baseR, colors);
    if (this.mode === "tan") return this.drawTan(ctx, cx, cy, baseR, colors);
    if (this.mode === "acos") return this.drawAcos(ctx, cx, cy, baseR, colors);
    if (this.mode === "asin") return this.drawAsin(ctx, cx, cy, baseR, colors);
    if (this.mode === "sincos") return this.drawSinCos(ctx, cx, cy, baseR, colors);
    if (this.mode === "deltaangle" || this.mode === "lerpangle") return this.drawAngleCompare(ctx, cx, cy, baseR, colors);
    this.drawCosSin(ctx, cx, cy, baseR, colors);
  }

  drawCosSin(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;
    const active = this.mode === "cos" ? colors.x : colors.y;

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Side wave
    const waveLeft = cx + baseR * 1.32;
    const waveW = Math.max(110, this.width - waveLeft - 24);
    ctx.strokeStyle = colors.border;
    ctx.strokeRect(waveLeft, cy - baseR, waveW, baseR * 2);

    ctx.beginPath();
    ctx.strokeStyle = active;
    ctx.lineWidth = 2.4;
    for (let i = 0; i <= waveW; i += 2) {
      const a = (i / waveW) * Math.PI * 2;
      const val = this.mode === "cos" ? Math.cos(a) : Math.sin(a);
      const wx = waveLeft + i;
      const wy = cy - val * baseR;
      if (i === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    const wx = waveLeft + (p.angleRad / (Math.PI * 2)) * waveW;
    const wy = cy - (this.mode === "cos" ? p.x : p.y) * baseR;
    ctx.beginPath();
    ctx.arc(wx, wy, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();

    // Projection dashed line
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = active;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    if (this.mode === "cos") ctx.lineTo(px, cy);
    else ctx.lineTo(cx, py);
    ctx.stroke();
    ctx.restore();

    // Highlighted axis component
    ctx.strokeStyle = active;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    if (this.mode === "cos") ctx.lineTo(px, cy);
    else ctx.lineTo(cx, py);
    ctx.stroke();

    // Radius line
    ctx.strokeStyle = colors.z;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    this.drawHandle(ctx, px, py, colors.z, `${p.angleDeg.toFixed(0)}°`, colors);
    const lbl = this.mode === "cos"
      ? `cos(${p.angleDeg.toFixed(1)}°) = ${p.x.toFixed(4)}  (${p.angleRad.toFixed(2)} rad)`
      : `sin(${p.angleDeg.toFixed(1)}°) = ${p.y.toFixed(4)}  (${p.angleRad.toFixed(2)} rad)`;
    this.drawStatusBanner(ctx, lbl, active, colors);
  }

  drawTan(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;
    const wallX = cx + baseR;

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.strokeStyle = colors.aux;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(wallX, 0);
    ctx.lineTo(wallX, this.height);
    ctx.stroke();

    const cosV = Math.cos(p.angleRad);
    const tanV = Math.tan(p.angleRad);
    const hitY = cy - tanV * baseR;

    if (cosV > 0.04) {
      ctx.fillStyle = colors.accent + "1a";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(wallX, cy);
      ctx.lineTo(wallX, hitY);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(wallX, hitY);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = colors.aux;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(wallX, cy);
      ctx.lineTo(wallX, hitY);
      ctx.stroke();

      const clampedY = MathEvaluator.clamp(hitY, 24, this.height - 54);
      ctx.beginPath();
      ctx.arc(wallX, clampedY, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.accent;
      ctx.fill();
    }

    ctx.strokeStyle = colors.z;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    this.drawHandle(ctx, px, py, colors.z, `${p.angleDeg.toFixed(0)}°`, colors);
    const msg = Math.abs(cosV) <= 0.04
      ? `Asymptote ±90° : tan(θ) → ±∞ (division par cos ≈ 0)`
      : `tan(${p.angleDeg.toFixed(1)}°) = sin/cos = ${tanV.toFixed(3)} (hauteur sur le mur à x = 1)`;
    this.drawStatusBanner(ctx, msg, colors.aux, colors);
  }

  drawAcos(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;

    ctx.fillStyle = colors.z + "14";
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.z;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - baseR, cy);
    ctx.lineTo(cx + baseR, cy);
    ctx.stroke();

    ctx.strokeStyle = colors.x;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = colors.accent + "2a";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, baseR * 0.42, 0, -p.angleRad, true);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    this.drawHandle(ctx, px, cy, colors.x, `x = ${p.x.toFixed(2)}`, colors, -24, 24);
    this.drawStatusBanner(ctx, `acos(${p.x.toFixed(3)}) = ${p.angleDeg.toFixed(1)}° (${p.angleRad.toFixed(3)} rad)`, colors.accent, colors);
  }

  drawAsin(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;
    const signedRad = Math.asin(MathEvaluator.clamp(p.y, -1, 1));

    ctx.fillStyle = colors.y + "14";
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, -Math.PI / 2, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.y;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - baseR);
    ctx.lineTo(cx, cy + baseR);
    ctx.stroke();

    ctx.strokeStyle = colors.y;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, py);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, py);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    this.drawHandle(ctx, cx, py, colors.y, `y = ${p.y.toFixed(2)}`, colors, -82, 4);
    this.drawStatusBanner(ctx, `Pitch = asin(${p.y.toFixed(3)}) = ${((signedRad * 180) / Math.PI).toFixed(1)}°`, colors.accent, colors);
  }

  drawSinCos(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const rPx = p.radius * baseR;
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;

    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.strokeStyle = colors.z + "55";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    for (let i = 0; i < this.spawnCount; i++) {
      const a = p.angleRad + (i * Math.PI * 2) / this.spawnCount;
      const sx = cx + Math.cos(a) * rPx;
      const sy = cy - Math.sin(a) * rPx;
      ctx.beginPath();
      ctx.arc(sx, sy, i === 0 ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? colors.accent : colors.aux;
      ctx.fill();
    }

    ctx.strokeStyle = colors.x;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    ctx.strokeStyle = colors.y;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    this.drawHandle(ctx, px, py, colors.accent, `r=${p.radius.toFixed(2)}, θ=${p.angleDeg.toFixed(0)}°`, colors);
    this.drawStatusBanner(ctx, `x = r·cos(θ) = ${p.x.toFixed(2)} | y = r·sin(θ) = ${p.y.toFixed(2)} | ${this.spawnCount} spawns`, colors.text, colors);
  }

  drawTurret(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const tx = cx + p.x * baseR;
    const ty = cy - p.y * baseR;

    if (this.useBuggyAtan) {
      ctx.fillStyle = colors.x + "1c";
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.15, Math.PI / 2, (3 * Math.PI) / 2, false);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = colors.y + "10";
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }

    const angle = this.useBuggyAtan ? Math.atan(p.y / (p.x || 1e-4)) : Math.atan2(p.y, p.x);
    const wrong = this.useBuggyAtan && p.x < 0;

    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = wrong ? colors.x : colors.y;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * baseR * 1.35, cy - Math.sin(angle) * baseR * 1.35);
    ctx.stroke();
    ctx.restore();

    // Turret
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-angle);
    ctx.fillStyle = colors.z;
    this.roundRect(ctx, 0, -5, 34, 10, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fillStyle = colors.surface;
    ctx.fill();
    ctx.strokeStyle = colors.z;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    this.drawHandle(ctx, tx, ty, colors.accent, `Cible (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`, colors);
    const msg = wrong
      ? `BUG ATAN(y/x) : X < 0 → les signes s'annulent, la tourelle tire à 180° à l'opposé !`
      : `${this.useBuggyAtan ? "ATAN(y/x)" : "ATAN2(y, x)"} verrouillé à ${((angle * 180) / Math.PI).toFixed(1)}°`;
    this.drawStatusBanner(ctx, msg, wrong ? colors.x : colors.y, colors);
  }

  drawAngleCompare(ctx, cx, cy, baseR, colors) {
    const p1 = this.computedPoints[0];
    const p2 = this.computedPoints[1];
    const deltaDeg = MathEvaluator.deltaAngle(p1.angleDeg, p2.angleDeg);
    const deltaRad = (deltaDeg * Math.PI) / 180;

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.strokeStyle = deltaDeg >= 0 ? colors.y : colors.x;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR * 0.56, -p1.angleRad, -(p1.angleRad + deltaRad), deltaDeg > 0);
    ctx.stroke();

    if (this.mode === "lerpangle") {
      const cur = p1.angleRad + deltaRad * this.lerpT;
      const lx = cx + Math.cos(cur) * baseR;
      const ly = cy - Math.sin(cur) * baseR;
      this.drawArrow(ctx, cx, cy, lx, ly, colors.accent, 3.2);
    }

    [p1, p2].forEach((p, idx) => {
      const px = cx + p.x * baseR;
      const py = cy - p.y * baseR;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
      this.drawHandle(ctx, px, py, p.color, `${idx === 0 ? "A" : "B"} (${p.angleDeg.toFixed(0)}°)`, colors);
    });

    this.drawStatusBanner(
      ctx,
      `Plus court chemin Δθ = ${deltaDeg >= 0 ? "+" : ""}${deltaDeg.toFixed(1)}°${this.mode === "lerpangle" ? ` | LerpAngle(t=${this.lerpT.toFixed(2)}) = ${(p1.angleDeg + deltaDeg * this.lerpT).toFixed(1)}°` : ""}`,
      deltaDeg >= 0 ? colors.y : colors.x,
      colors
    );
  }
}
