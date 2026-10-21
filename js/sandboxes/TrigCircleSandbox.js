import { BaseSandbox } from "./BaseSandbox.js";
import { MathEvaluator } from "../core/MathEvaluator.js";

export class TrigCircleSandbox extends BaseSandbox {
  constructor(canvas, funcItem, onStateChange) {
    super(canvas, funcItem, onStateChange);
    this.draggingIndex = -1;
    this.lerpT = 0.5;
    this.spawnCount = 8;

    const id = funcItem.id;
    if (id === "deltaangle" || id === "lerpangle") {
      this.points = [
        { angleRad: 0.35, radius: 1.0 },
        { angleRad: 5.4, radius: 1.0 }
      ];
    } else if (id === "acos") {
      this.points = [{ angleRad: Math.acos(0.45), radius: 1.0 }];
    } else if (id === "asin") {
      this.points = [{ angleRad: Math.asin(0.55), radius: 1.0 }];
    } else {
      this.points = [{ angleRad: Math.PI / 4, radius: 1.0 }];
    }

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    if (this.funcItem.id === "lerpangle") {
      return [
        {
          type: "range",
          key: "lerpT",
          label: "Curseur d'interpolation t (0 → 1)",
          min: 0,
          max: 1,
          step: 0.02,
          value: this.lerpT,
          onChange: (val) => {
            this.lerpT = val;
            this.updateStateAndRender();
          }
        }
      ];
    }
    if (this.funcItem.id === "sincos") {
      return [
        {
          type: "range",
          key: "spawnCount",
          label: "Objets spawnés en cercle",
          min: 3,
          max: 16,
          step: 1,
          value: this.spawnCount,
          onChange: (val) => {
            this.spawnCount = val;
            this.updateStateAndRender();
          }
        }
      ];
    }
    return [];
  }

  bindEvents() {
    const onDown = (e) => {
      const pos = this.getMousePos(e);
      const { cx, cy, baseR } = this.getGeometry();
      let bestIdx = 0;
      let bestDist = 9999;

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
      const id = this.funcItem.id;

      if (id === "acos") {
        const clampedX = MathEvaluator.clamp(dx, -1, 1);
        this.points[0] = { angleRad: Math.acos(clampedX), radius: 1.0 };
        this.updateStateAndRender();
        return;
      }

      if (id === "asin") {
        const clampedY = MathEvaluator.clamp(dy, -1, 1);
        let a = Math.asin(clampedY);
        if (a < 0) a += Math.PI * 2;
        this.points[0] = { angleRad: a, radius: 1.0 };
        this.updateStateAndRender();
        return;
      }

      let angleRad = Math.atan2(dy, dx);
      if (angleRad < 0) angleRad += Math.PI * 2;

      const allowFreeRadius = id === "atan" || id === "atan2" || id === "sincos";
      const radius = allowFreeRadius ? MathEvaluator.clamp(Math.hypot(dx, dy), 0.3, 1.3) : 1.0;

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
    const cx = hasWave || id === "tan" ? this.width * 0.32 : this.width * 0.5;
    const cy = this.height * 0.5;
    const baseR = Math.min(this.width, this.height) * 0.31;
    return { cx, cy, baseR, hasWave };
  }

  updateStateAndRender() {
    if (!this.points) return;
    const id = this.funcItem.id;
    const computed = this.points.map((p, idx) => {
      let x = Math.cos(p.angleRad) * p.radius;
      let y = Math.sin(p.angleRad) * p.radius;
      let angleDeg = (p.angleRad * 180) / Math.PI;
      if (id === "asin" && angleDeg > 180) {
        angleDeg -= 360;
      }
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
      pt.out = MathEvaluator.evaluateTrig(id, pt, other, this.lerpT);
    });

    this.computedPoints = computed;
    this.render();
    this.emitState({
      points: computed,
      lerpT: this.lerpT
    });
  }

  render() {
    if (!this.ctx || !this.computedPoints) return;
    const ctx = this.ctx;
    const id = this.funcItem.id;
    const colors = this.getThemeColors();
    const { cx, cy, baseR } = this.getGeometry();

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * (baseR * 0.5), 0);
      ctx.lineTo(cx + i * (baseR * 0.5), this.height);
      ctx.moveTo(0, cy + i * (baseR * 0.5));
      ctx.lineTo(this.width, cy + i * (baseR * 0.5));
      ctx.stroke();
    }

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(this.width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.height);
    ctx.stroke();

    if (id === "atan" || id === "atan2") {
      this.drawTurretDemo(ctx, id, cx, cy, baseR, colors);
      return;
    }

    if (id === "tan") {
      this.drawTanDemo(ctx, cx, cy, baseR, colors);
      return;
    }

    if (id === "acos") {
      this.drawAcosDemo(ctx, cx, cy, baseR, colors);
      return;
    }

    if (id === "asin") {
      this.drawAsinDemo(ctx, cx, cy, baseR, colors);
      return;
    }

    if (id === "sincos") {
      this.drawSinCosDemo(ctx, cx, cy, baseR, colors);
      return;
    }

    if (id === "deltaangle" || id === "lerpangle") {
      this.drawAngleComparison(ctx, id, cx, cy, baseR, colors);
      return;
    }

    this.drawCosOrSinDemo(ctx, id, cx, cy, baseR, colors);
  }

  drawCosOrSinDemo(ctx, id, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.stroke();

    this.drawSideWave(ctx, id, cx, cy, baseR, colors);

    const activeColor = id === "cos" ? colors.colorX : colors.colorY;

    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    if (id === "cos") ctx.lineTo(px, cy);
    else ctx.lineTo(cx, py);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    if (id === "cos") ctx.lineTo(px, cy);
    else ctx.lineTo(cx, py);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#4cc2ff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#4cc2ff";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = activeColor;
    ctx.font = "700 13px Consolas, monospace";
    if (id === "cos") {
      ctx.fillText(`Cos(${p.angleDeg.toFixed(0)}°) = Largeur X = ${p.x.toFixed(2)}`, cx - baseR * 0.6, cy + 26);
    } else {
      ctx.fillText(`Sin(${p.angleDeg.toFixed(0)}°) = Hauteur Y = ${p.y.toFixed(2)}`, cx + 14, (cy + py) / 2);
    }
  }

  drawTanDemo(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;
    const wallX = cx + baseR;

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(204, 93, 232, 0.08)";
    ctx.fillRect(wallX, 0, 14, this.height);
    ctx.strokeStyle = "#cc5de8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wallX, 0);
    ctx.lineTo(wallX, this.height);
    ctx.stroke();

    const cosVal = Math.cos(p.angleRad);
    const tanVal = Math.tan(p.angleRad);
    const hitY = cy - tanVal * baseR;

    if (Math.abs(cosVal) > 0.04 && cosVal > 0) {
      ctx.fillStyle = "rgba(252, 196, 25, 0.12)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(wallX, cy);
      ctx.lineTo(wallX, hitY);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "#fcc419";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(wallX, hitY);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = "#cc5de8";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(wallX, cy);
      ctx.lineTo(wallX, hitY);
      ctx.stroke();

      const clampedLabelY = MathEvaluator.clamp(hitY, 28, this.height - 28);
      ctx.beginPath();
      ctx.arc(wallX, clampedLabelY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#fcc419";
      ctx.fill();

      ctx.fillStyle = "#cc5de8";
      ctx.font = "700 14px Consolas, monospace";
      ctx.fillText(`Impact Mur : Tan(${p.angleDeg.toFixed(0)}°) = ${tanVal.toFixed(2)}`, wallX + 22, clampedLabelY + 4);
    } else {
      ctx.fillStyle = "#ff6b6b";
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.fillText("Angle orienté à gauche : visez vers le mur de droite (-85° à +85°)", wallX + 20, cy - 10);
    }

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#4cc2ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#4cc2ff";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = "700 13px Segoe UI, sans-serif";
    ctx.fillText(`Angle = ${p.angleDeg.toFixed(0)}°`, px + 12, py - 10);
  }

  drawAcosDemo(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;

    ctx.fillStyle = "rgba(76, 194, 255, 0.08)";
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, Math.PI, 0, false);
    ctx.strokeStyle = "#4cc2ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx - baseR, cy);
    ctx.lineTo(cx + baseR, cy);
    ctx.stroke();

    ctx.strokeStyle = colors.colorX;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#fcc419";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(252, 196, 25, 0.22)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, baseR * 0.42, 0, -p.angleRad, true);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#fcc419";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, cy, 11, 0, Math.PI * 2);
    ctx.fillStyle = colors.colorX;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fcc419";
    ctx.fill();

    ctx.fillStyle = colors.colorX;
    ctx.font = "700 13px Segoe UI, sans-serif";
    ctx.fillText(`Glissez X ici (${p.x.toFixed(2)})`, px - 48, cy + 28);

    ctx.fillStyle = "#fcc419";
    ctx.font = "700 15px Consolas, monospace";
    ctx.fillText(`Angle trouvé = Acos(${p.x.toFixed(2)}) = ${p.angleDeg.toFixed(1)}°`, cx - 140, cy - baseR - 18);
  }

  drawAsinDemo(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;

    ctx.fillStyle = "rgba(81, 207, 102, 0.08)";
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, -Math.PI / 2, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, -Math.PI / 2, Math.PI / 2, false);
    ctx.strokeStyle = "#51cf66";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - baseR);
    ctx.lineTo(cx, cy + baseR);
    ctx.stroke();

    ctx.strokeStyle = colors.colorY;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, py);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#fcc419";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, py);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();

    const signedRad = Math.asin(MathEvaluator.clamp(p.y, -1, 1));
    ctx.fillStyle = "rgba(252, 196, 25, 0.22)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, baseR * 0.42, 0, -signedRad, signedRad > 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#fcc419";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, py, 11, 0, Math.PI * 2);
    ctx.fillStyle = colors.colorY;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fcc419";
    ctx.fill();

    ctx.fillStyle = colors.colorY;
    ctx.font = "700 13px Segoe UI, sans-serif";
    ctx.fillText(`Glissez Hauteur Y (${p.y.toFixed(2)})`, cx - 155, py + 5);

    ctx.fillStyle = "#fcc419";
    ctx.font = "700 15px Consolas, monospace";
    ctx.fillText(`Pitch = Asin(${p.y.toFixed(2)}) = ${((signedRad * 180) / Math.PI).toFixed(1)}°`, cx - 120, cy - baseR - 18);
  }

  drawSinCosDemo(ctx, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const rPx = p.radius * baseR;
    const px = cx + p.x * baseR;
    const py = cy - p.y * baseR;

    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(76, 194, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < this.spawnCount; i++) {
      const a = p.angleRad + (i * Math.PI * 2) / this.spawnCount;
      const sx = cx + Math.cos(a) * rPx;
      const sy = cy - Math.sin(a) * rPx;
      ctx.beginPath();
      ctx.arc(sx, sy, i === 0 ? 10 : 6, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "#fcc419" : "#cc5de8";
      ctx.fill();
    }

    ctx.fillStyle = "rgba(76, 194, 255, 0.16)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = colors.colorX;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    ctx.strokeStyle = colors.colorY;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#fcc419";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = "700 13px Consolas, monospace";
    ctx.fillText(`X = R·Cos = ${p.x.toFixed(2)} | Y = R·Sin = ${p.y.toFixed(2)}`, 18, this.height - 16);
  }

  drawTurretDemo(ctx, id, cx, cy, baseR, colors) {
    const p = this.computedPoints[0];
    const targetX = cx + p.x * baseR;
    const targetY = cy - p.y * baseR;

    if (id === "atan") {
      ctx.fillStyle = "rgba(255, 107, 107, 0.14)";
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, Math.PI / 2, (3 * Math.PI) / 2, false);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ff6b6b";
      ctx.font = "700 13px Segoe UI, sans-serif";
      ctx.fillText("ZONE INVERSÉE ATAN (X < 0)", cx - baseR + 10, cy - baseR - 12);
    } else {
      ctx.fillStyle = "rgba(81, 207, 102, 0.08)";
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.fill();
    }

    const turretAngle = id === "atan" ? Math.atan(p.y / (p.x || 0.0001)) : Math.atan2(p.y, p.x);
    const isWrongDirection = id === "atan" && p.x < 0;

    const laserEndX = cx + Math.cos(turretAngle) * baseR * 1.25;
    const laserEndY = cy - Math.sin(turretAngle) * baseR * 1.25;

    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = isWrongDirection ? "#ff6b6b" : "#51cf66";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(laserEndX, laserEndY);
    ctx.stroke();
    ctx.restore();

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
      ? `❌ BUG ATAN : y/x = ${(p.y / p.x).toFixed(2)} -> Le canon tire à 180° à l'opposé !`
      : `🎯 ${id.toUpperCase()} : Canon verrouillé à ${((turretAngle * 180) / Math.PI).toFixed(1)}°`;
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
    const val = id === "cos" ? Math.cos(p.angleRad) : Math.sin(p.angleRad);
    const wy = cy - val * baseR;

    ctx.beginPath();
    ctx.arc(wx, wy, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#fcc419";
    ctx.fill();
  }

  drawAngleComparison(ctx, id, cx, cy, baseR, colors) {
    const p1 = this.computedPoints[0];
    const p2 = this.computedPoints[1];
    const deltaDeg = MathEvaluator.deltaAngle(p1.angleDeg, p2.angleDeg);
    const deltaRad = (deltaDeg * Math.PI) / 180;
    const arcR = baseR * 0.55;

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.strokeStyle = deltaDeg >= 0 ? "#51cf66" : "#ff922b";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy, arcR, -p1.angleRad, -(p1.angleRad + deltaRad), deltaDeg > 0);
    ctx.stroke();
    ctx.restore();

    if (id === "lerpangle") {
      const curRad = p1.angleRad + deltaRad * this.lerpT;
      const lx = cx + Math.cos(curRad) * baseR;
      const ly = cy - Math.sin(curRad) * baseR;

      ctx.strokeStyle = "#fcc419";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lx, ly, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#fcc419";
      ctx.fill();
      ctx.fillStyle = "#fcc419";
      ctx.font = "700 13px Consolas, monospace";
      ctx.fillText(`t=${this.lerpT.toFixed(2)}`, lx + 12, ly + 4);
    }

    [p1, p2].forEach((p, idx) => {
      const px = cx + p.x * baseR;
      const py = cy - p.y * baseR;
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
      ctx.fillStyle = colors.text;
      ctx.font = "700 13px Segoe UI, sans-serif";
      ctx.fillText(`${idx === 0 ? "Départ A" : "Cible B"} (${p.angleDeg.toFixed(0)}°)`, px + 12, py - 10);
    });

    ctx.fillStyle = deltaDeg >= 0 ? "#51cf66" : "#ff922b";
    ctx.font = "700 14px Segoe UI, sans-serif";
    ctx.fillText(`Plus court chemin A → B : ${deltaDeg > 0 ? "+" : ""}${deltaDeg.toFixed(1)}°`, 18, this.height - 16);
  }
}