import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class TrigCircleSandbox extends BaseSandbox {
  constructor(canvas, funcItem, onStateChange) {
    super(canvas, funcItem, onStateChange);
    this.radiusStep = 0;
    this.draggingIndex = -1;

    const needsTwoPoints = funcItem.id === "deltaangle" || funcItem.id === "lerpangle";
    this.points = needsTwoPoints
      ? [
          { angleRad: Math.PI / 6, radius: 1.0 },
          { angleRad: (4 * Math.PI) / 3, radius: 1.0 }
        ]
      : [{ angleRad: Math.PI / 4, radius: 1.0 }];

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.funcItem.id === "deltaangle" || this.funcItem.id === "lerpangle") {
      return [];
    }
    return [
      {
        type: "range",
        key: "radiusStep",
        label: "Aimantation du Rayon (0 = Fluide)",
        min: 0,
        max: 0.5,
        step: 0.25,
        value: this.radiusStep,
        onChange: (val) => {
          this.radiusStep = val;
          this.snapAllPoints();
          this.updateStateAndRender();
        }
      }
    ];
  }

  snapAllPoints() {
    this.points.forEach((p) => {
      if (this.radiusStep > 0) {
        p.radius = Math.max(this.radiusStep, MathEvaluator.snap(p.radius, this.radiusStep));
      }
      p.radius = MathEvaluator.clamp(p.radius, 0.25, 1.25);
    });
  }

  bindEvents() {
    const onDown = (e) => {
      const pos = this.getMousePos(e);
      const { cx, cy, baseR } = this.getGeometry();
      let bestIdx = 0;
      let bestDist = 999;

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
      onMove(e);
    };

    const onMove = (e) => {
      if (this.draggingIndex === -1) return;
      const pos = this.getMousePos(e);
      const { cx, cy, baseR } = this.getGeometry();
      const dx = (pos.x - cx) / baseR;
      const dy = (cy - pos.y) / baseR;

      let angleRad = Math.atan2(dy, dx);
      if (angleRad < 0) angleRad += Math.PI * 2;

      const lockUnitCircle = this.funcItem.id === "deltaangle" || this.funcItem.id === "lerpangle" || this.funcItem.id === "acos" || this.funcItem.id === "asin";
      let radius = lockUnitCircle ? 1.0 : MathEvaluator.clamp(Math.hypot(dx, dy), 0.25, 1.25);

      if (!lockUnitCircle && this.radiusStep > 0) {
        radius = Math.max(this.radiusStep, MathEvaluator.snap(radius, this.radiusStep));
      }

      this.points[this.draggingIndex] = { angleRad, radius };
      this.updateStateAndRender();
    };

    const onUp = () => {
      this.draggingIndex = -1;
    };

    this.canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  getGeometry() {
    const id = this.funcItem.id;
    const hasWave = id === "cos" || id === "sin";
    const cx = hasWave ? this.width * 0.33 : this.width * 0.5;
    const cy = this.height * 0.5;
    const baseR = Math.min(this.width, this.height) * 0.32;
    return { cx, cy, baseR, hasWave };
  }

  updateStateAndRender() {
    if (!this.points) return;
    const computed = this.points.map((p, idx) => {
      const x = Math.cos(p.angleRad) * p.radius;
      const y = Math.sin(p.angleRad) * p.radius;
      const angleDeg = (p.angleRad * 180) / Math.PI;
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
      pt.out = MathEvaluator.evaluateTrig(this.funcItem.id, pt, other, 0.5);
    });

    this.computedPoints = computed;
    this.render();
    this.emitState({
      points: computed,
      radiusStep: this.radiusStep
    });
  }

  render() {
    if (!this.ctx || !this.points) return;
    const ctx = this.ctx;
    const id = this.funcItem.id;
    const colors = this.getThemeColors();
    const { cx, cy, baseR, hasWave } = this.getGeometry();

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(this.width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.height);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (id === "atan" || id === "atan2") {
      this.drawTurretDemo(ctx, id, cx, cy, baseR, colors);
      return;
    }

    if (hasWave) {
      this.drawSideWave(ctx, id, cx, cy, baseR, colors);
    }

    if ((id === "deltaangle" || id === "lerpangle") && this.computedPoints.length >= 2) {
      this.drawAngleComparison(ctx, id, cx, cy, baseR, colors);
    }

    (this.computedPoints || []).forEach((p) => {
      const px = cx + p.x * baseR;
      const py = cy - p.y * baseR;

      if (id === "cos" || id === "acos") {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = colors.colorX;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, cy);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = colors.colorX;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, cy);
        ctx.stroke();

        ctx.fillStyle = colors.colorX;
        ctx.font = "700 13px Consolas, monospace";
        const msg = id === "acos"
          ? `Entrée X = ${p.x.toFixed(2)} ➔ Angle Acos = ${((Math.acos(MathEvaluator.clamp(p.x, -1, 1)) * 180) / Math.PI).toFixed(1)}°`
          : `Largeur X (Cos) = ${p.x.toFixed(2)}`;
        ctx.fillText(msg, cx - 70, cy + 26);
      } else if (id === "sin" || id === "asin") {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = colors.colorY;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx, py);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = colors.colorY;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, py);
        ctx.stroke();

        ctx.fillStyle = colors.colorY;
        ctx.font = "700 13px Consolas, monospace";
        const msg = id === "asin"
          ? `Entrée Y = ${p.y.toFixed(2)} ➔ Angle Asin = ${((Math.asin(MathEvaluator.clamp(p.y, -1, 1)) * 180) / Math.PI).toFixed(1)}°`
          : `Hauteur Y (Sin) = ${p.y.toFixed(2)}`;
        ctx.fillText(msg, cx + 12, (cy + py) / 2);
      } else if (id === "tan") {
        const wallX = cx + baseR;
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wallX, 0);
        ctx.lineTo(wallX, this.height);
        ctx.stroke();

        const tanVal = Math.tan(p.angleRad);
        const tanY = cy - tanVal * baseR;

        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(wallX, tanY);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = "#fcc419";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(wallX, cy);
        ctx.lineTo(wallX, tanY);
        ctx.stroke();

        ctx.fillStyle = "#fcc419";
        ctx.font = "700 13px Consolas, monospace";
        ctx.fillText(`Pente Tan = ${tanVal.toFixed(2)}`, wallX + 12, MathEvaluator.clamp(tanY, 24, this.height - 24));
      } else if (id === "sincos") {
        ctx.fillStyle = "rgba(76, 194, 255, 0.14)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, cy);
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = colors.colorX;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, cy);
        ctx.stroke();

        ctx.strokeStyle = colors.colorY;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      const ptName = this.computedPoints.length > 1 ? (p.index === 1 ? "Départ A" : "Cible B") : "Curseur";
      ctx.fillStyle = colors.text;
      ctx.font = "700 13px Segoe UI, sans-serif";
      ctx.fillText(`${ptName} (${p.angleDeg.toFixed(0)}°)`, px + 12, py - 10);
    });
  }

  drawTurretDemo(ctx, id, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const targetX = cx + p.x * baseR;
    const targetY = cy - p.y * baseR;

    if (id === "atan") {
      ctx.fillStyle = "rgba(255, 107, 107, 0.12)";
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, Math.PI / 2, (3 * Math.PI) / 2, false);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ff6b6b";
      ctx.font = "700 13px Segoe UI, sans-serif";
      ctx.fillText("ZONE MORTE ATAN (x < 0)", cx - baseR + 15, cy - baseR - 12);
    } else {
      ctx.fillStyle = "rgba(81, 207, 102, 0.08)";
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.fill();
    }

    const turretAngle = id === "atan" ? Math.atan(p.y / (p.x || 0.0001)) : Math.atan2(p.y, p.x);
    const isWrongDirection = id === "atan" && p.x < 0;

    const laserEndX = cx + Math.cos(turretAngle) * baseR * 1.3;
    const laserEndY = cy - Math.sin(turretAngle) * baseR * 1.3;

    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = isWrongDirection ? "#ff6b6b" : "#51cf66";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(laserEndX, laserEndY);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = colors.text;
    ctx.font = "700 12px Consolas, monospace";
    ctx.fillText(isWrongDirection ? "❌ TIR DU CANON (À L'ENVERS !)" : "🎯 TIR DU CANON (VERROUILLÉ)", laserEndX - 60, laserEndY - 10);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-turretAngle);
    ctx.fillStyle = "#4cc2ff";
    ctx.fillRect(0, -6, 36, 12);
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = "#292929";
    ctx.fill();
    ctx.strokeStyle = "#4cc2ff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(targetX, targetY, 11, 0, Math.PI * 2);
    ctx.fillStyle = "#fcc419";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fcc419";
    ctx.font = "700 13px Segoe UI, sans-serif";
    ctx.fillText(`ENNEMI (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`, targetX + 14, targetY + 4);

    ctx.fillStyle = isWrongDirection ? "#ff6b6b" : "#51cf66";
    ctx.font = "700 14px Segoe UI, sans-serif";
    const statusText = isWrongDirection
      ? `⚠️ BUG DE ATAN : (${p.y.toFixed(1)}) / (${p.x.toFixed(1)}) = ${(p.y / p.x).toFixed(2)} -> Atan croit que l'ennemi est à DROITE et tire à 180° à l'opposé !`
      : `✓ ${id.toUpperCase()} : Angle du canon = ${((turretAngle * 180) / Math.PI).toFixed(1)}° (Essayez de glisser l'ennemi à gauche à X < 0)`;
    ctx.fillText(statusText, 18, this.height - 16);
  }

  drawSideWave(ctx, id, cx, cy, baseR, colors) {
    const waveLeft = cx + baseR * 1.35;
    const waveWidth = Math.max(120, this.width - waveLeft - 24);

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    ctx.strokeRect(waveLeft, cy - baseR, waveWidth, baseR * 2);

    ctx.beginPath();
    ctx.strokeStyle = id === "cos" ? colors.colorX : colors.colorY;
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= waveWidth; i += 2) {
      const a = (i / waveWidth) * Math.PI * 2;
      const val = id === "cos" ? Math.cos(a) : Math.sin(a);
      const wx = waveLeft + i;
      const wy = cy - val * baseR;
      if (i === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    const p = this.computedPoints[0];
    const wx = waveLeft + (p.angleRad / (Math.PI * 2)) * waveWidth;
    const val = id === "cos" ? Math.cos(p.angleRad) * p.radius : Math.sin(p.angleRad) * p.radius;
    const wy = cy - val * baseR;

    ctx.beginPath();
    ctx.arc(wx, wy, 7, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  drawAngleComparison(ctx, id, cx, cy, baseR, colors) {
    const p1 = this.computedPoints[0];
    const p2 = this.computedPoints[1];
    const deltaDeg = MathEvaluator.deltaAngle(p1.angleDeg, p2.angleDeg);
    const deltaRad = (deltaDeg * Math.PI) / 180;
    const arcR = baseR * 0.55;

    ctx.save();
    ctx.strokeStyle = deltaDeg >= 0 ? "#51cf66" : "#ff922b";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, arcR, -p1.angleRad, -(p1.angleRad + deltaRad), deltaDeg > 0);
    ctx.stroke();
    ctx.restore();

    if (id === "lerpangle") {
      [0.25, 0.5, 0.75].forEach((step) => {
        const midRad = p1.angleRad + deltaRad * step;
        const mx = cx + Math.cos(midRad) * baseR;
        const my = cy - Math.sin(midRad) * baseR;
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#fcc419";
        ctx.fill();
        ctx.fillStyle = colors.text;
        ctx.font = "700 11px Consolas, monospace";
        ctx.fillText(`t=${step}`, mx + 8, my + 4);
      });
    }

    ctx.fillStyle = deltaDeg >= 0 ? "#51cf66" : "#ff922b";
    ctx.font = "700 14px Segoe UI, sans-serif";
    ctx.fillText(`Chemin le plus court de A vers B = ${deltaDeg.toFixed(1)}°`, 18, this.height - 16);
  }
}