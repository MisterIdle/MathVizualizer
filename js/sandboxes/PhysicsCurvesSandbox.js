import { BaseSandbox } from "./BaseSandbox.js?v=2.1";
import { MathEvaluator } from "../core/MathEvaluator.js?v=2.1";

export class PhysicsCurvesSandbox extends BaseSandbox {
  constructor(canvas, concept, onStateChange, onInteract) {
    super(canvas, concept, onStateChange, onInteract);
    this.dragging = null;
    this.time = 0;

    // Ballistic & Platformer jump
    this.v0 = { x: 2.3, y: 2.1 };
    this.gravity = 9.81;
    this.jumpMode = false;
    this.jumpHeight = 3.2;
    this.timeToApex = 0.45;

    // Lead target interception
    this.bulletSpeed = 5.5;
    this.targetSpeed = 2.4;
    this.leadTime = 0;

    // Verlet rope (12 nodes)
    this.verletNodes = [];
    for (let i = 0; i < 12; i++) {
      this.verletNodes.push({ x: -1.8 + i * 0.34, y: 1.4, px: -1.8 + i * 0.34, py: 1.4, pinned: i === 0 });
    }
    this.verletIterations = 6;

    // Kinematics / Steering
    this.agent = { x: -1.5, y: 0, vx: 1.2, vy: 0.4 };
    this.goal = { x: 1.6, y: 0.6 };
    this.steerMode = 0; // 0: Arrive, 1: Seek, 2: Flee, 3: Wander
    this.accel = 9.0;
    this.drag = 2.4;
    this.trail = [];

    // Boids / Flow Field
    this.flowMode = false;
    this.vortex = { x: 0.5, y: 0.2 };
    this.boids = [];
    for (let i = 0; i < 38; i++) {
      const a = (i / 38) * Math.PI * 2;
      this.boids.push({
        x: Math.cos(a) * 1.8 + (Math.random() - 0.5),
        y: Math.sin(a) * 1.2 + (Math.random() - 0.5),
        vx: Math.cos(a + 1.2) * 1.4,
        vy: Math.sin(a + 1.2) * 1.4
      });
    }
    this.wSep = 1.6;
    this.wAlign = 1.0;
    this.wCoh = 0.8;

    // Curves (Bezier / Catmull-Rom / ArcLength)
    this.curveT = 0.45;
    this.animPlay = true;
    this.ctrlPts = this.mode === "catmullrom"
      ? [{ x: -3.0, y: -0.6 }, { x: -1.5, y: 1.2 }, { x: 0.1, y: -0.9 }, { x: 1.6, y: 1.1 }, { x: 3.0, y: -0.3 }]
      : this.mode === "arclength"
        ? [{ x: -3.0, y: -1.0 }, { x: -2.4, y: 1.7 }, { x: 2.8, y: -1.5 }, { x: 3.0, y: 1.2 }]
        : [{ x: -2.7, y: -1.0 }, { x: -1.4, y: 1.6 }, { x: 1.4, y: 1.5 }, { x: 2.7, y: -0.9 }];

    this.bindEvents();
    this.updateState();

    const animatedModes = ["leadtarget", "verlet", "kinematics", "steering", "boids", "arclength", "bezier", "catmullrom"];
    if (animatedModes.includes(this.mode)) {
      this.startLoop();
    } else {
      this.render();
    }
  }

  getControlsConfig() {
    if (this.mode === "ballistic") {
      return [
        { type: "range", key: "g", label: "Gravité g (m/s²)", min: 2.0, max: 22.0, step: 0.2, value: this.gravity, onChange: (v) => { this.gravity = v; this.notifyInteract(); this.updateState(); this.render(); } },
        { type: "range", key: "jh", label: "Hauteur Saut H (m)", min: 1.0, max: 5.5, step: 0.2, value: this.jumpHeight, onChange: (v) => { this.jumpHeight = v; this.notifyInteract(); this.updateState(); this.render(); } },
        { type: "range", key: "jt", label: "Durée Apex (s)", min: 0.2, max: 0.9, step: 0.05, value: this.timeToApex, onChange: (v) => { this.timeToApex = v; this.notifyInteract(); this.updateState(); this.render(); } },
        {
          type: "button",
          label: "Mode : Parabole Grenade",
          onClick: (btn) => {
            this.jumpMode = !this.jumpMode;
            if (btn) btn.textContent = this.jumpMode ? "Mode : Saut Platformer (H, t)" : "Mode : Parabole Grenade";
            this.notifyInteract();
            this.updateState();
            this.render();
          }
        }
      ];
    }
    if (this.mode === "leadtarget") {
      return [
        { type: "range", key: "bs", label: "Vitesse Balle (s)", min: 3.0, max: 10.0, step: 0.25, value: this.bulletSpeed, onChange: (v) => { this.bulletSpeed = v; this.notifyInteract(); } },
        { type: "range", key: "ts", label: "Vitesse Cible (Vt)", min: 0.8, max: 4.5, step: 0.2, value: this.targetSpeed, onChange: (v) => { this.targetSpeed = v; this.notifyInteract(); } }
      ];
    }
    if (this.mode === "verlet") {
      return [
        { type: "range", key: "it", label: "Itérations Contraintes", min: 1, max: 14, step: 1, value: this.verletIterations, onChange: (v) => { this.verletIterations = Math.round(v); this.notifyInteract(); } },
        { type: "range", key: "g", label: "Gravité", min: 2.0, max: 20.0, step: 0.5, value: this.gravity, onChange: (v) => { this.gravity = v; this.notifyInteract(); } }
      ];
    }
    if (this.mode === "kinematics") {
      return [
        { type: "range", key: "acc", label: "Accélération", min: 2.0, max: 18.0, step: 0.5, value: this.accel, onChange: (v) => { this.accel = v; this.notifyInteract(); } },
        { type: "range", key: "drg", label: "Drag (Friction)", min: 0.2, max: 6.0, step: 0.2, value: this.drag, onChange: (v) => { this.drag = v; this.notifyInteract(); } }
      ];
    }
    if (this.mode === "steering") {
      return [
        {
          type: "button",
          label: "Comportement : Arrive",
          onClick: (btn) => {
            this.steerMode = (this.steerMode + 1) % 4;
            const names = ["Arrive (Freinage doux)", "Seek (Poursuite)", "Flee (Fuite)", "Wander (Errance)"];
            if (btn) btn.textContent = `Comportement : ${names[this.steerMode]}`;
            this.notifyInteract();
          }
        }
      ];
    }
    if (this.mode === "boids") {
      return [
        { type: "range", key: "sep", label: "Séparation", min: 0, max: 3, step: 0.1, value: this.wSep, onChange: (v) => { this.wSep = v; this.notifyInteract(); } },
        { type: "range", key: "ali", label: "Alignement", min: 0, max: 3, step: 0.1, value: this.wAlign, onChange: (v) => { this.wAlign = v; this.notifyInteract(); } },
        {
          type: "button",
          label: "Mode : Nuée Boids",
          onClick: (btn) => {
            this.flowMode = !this.flowMode;
            if (btn) btn.textContent = this.flowMode ? "Mode : Champ Vectoriel / Vortex" : "Mode : Nuée Boids";
            this.notifyInteract();
          }
        }
      ];
    }
    if (this.mode === "bezier" || this.mode === "catmullrom" || this.mode === "arclength") {
      return [
        { type: "range", key: "t", label: "Paramètre t", min: 0, max: 1, step: 0.01, value: this.curveT, onChange: (v) => { this.curveT = v; this.animPlay = false; this.notifyInteract(); this.updateState(); this.render(); } },
        {
          type: "button",
          label: "Pause / Play",
          onClick: () => {
            this.animPlay = !this.animPlay;
            this.notifyInteract();
          }
        }
      ];
    }
    return [];
  }

  getGeometry() {
    if (this.mode === "ballistic") {
      return { cx: this.width * 0.13, cy: this.height * 0.78, scale: Math.min(this.width, this.height) * 0.12 };
    }
    return { cx: this.width / 2, cy: this.height * 0.48, scale: Math.min(this.width, this.height) * 0.14 };
  }

  toScreen(p, g) { return { x: g.cx + p.x * g.scale, y: g.cy - p.y * g.scale }; }

  bindEvents() {
    this.bindPointer(
      (pos) => {
        const g = this.getGeometry();
        if (this.mode === "ballistic") {
          this.dragging = "V0";
          this.handleMove(pos);
        } else if (this.mode === "verlet") {
          this.dragging = "PIN";
          this.handleMove(pos);
        } else if (this.mode === "kinematics" || this.mode === "steering") {
          this.dragging = "GOAL";
          this.handleMove(pos);
        } else if (this.mode === "boids") {
          this.dragging = "VORTEX";
          this.handleMove(pos);
        } else if (this.mode === "bezier" || this.mode === "catmullrom" || this.mode === "arclength") {
          let hitIdx = -1;
          this.ctrlPts.forEach((pt, idx) => {
            const s = this.toScreen(pt, g);
            if (Math.hypot(pos.x - s.x, pos.y - s.y) < 28) hitIdx = idx;
          });
          if (hitIdx !== -1) this.dragging = hitIdx;
        }
      },
      (pos) => this.handleMove(pos),
      () => { this.dragging = null; }
    );
  }

  handleMove(pos) {
    if (this.dragging === null) return;
    const g = this.getGeometry();
    const vx = (pos.x - g.cx) / g.scale;
    const vy = (g.cy - pos.y) / g.scale;

    if (this.dragging === "V0") {
      this.v0.x = MathEvaluator.clamp(vx, 0.3, 4.8);
      this.v0.y = MathEvaluator.clamp(vy, 0.3, 3.8);
      this.updateState();
      this.render();
    } else if (this.dragging === "PIN") {
      this.verletNodes[0].x = MathEvaluator.clamp(vx, -3.5, 3.5);
      this.verletNodes[0].y = MathEvaluator.clamp(vy, -2.0, 2.3);
    } else if (this.dragging === "GOAL") {
      this.goal.x = MathEvaluator.clamp(vx, -3.6, 3.6);
      this.goal.y = MathEvaluator.clamp(vy, -2.2, 2.2);
    } else if (this.dragging === "VORTEX") {
      this.vortex.x = MathEvaluator.clamp(vx, -3.6, 3.6);
      this.vortex.y = MathEvaluator.clamp(vy, -2.2, 2.2);
    } else if (typeof this.dragging === "number") {
      this.ctrlPts[this.dragging].x = MathEvaluator.clamp(vx, -3.6, 3.6);
      this.ctrlPts[this.dragging].y = MathEvaluator.clamp(vy, -2.1, 2.1);
      this.updateState();
      this.render();
    }
  }

  startLoop() {
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      this.time += dt;
      this.stepSimulation(dt);
      this.render();
      this._rafId = requestAnimationFrame(step);
    };
    this._rafId = requestAnimationFrame(step);
  }

  stepSimulation(dt) {
    if (this.mode === "verlet") {
      for (const n of this.verletNodes) {
        if (n.pinned) { n.px = n.x; n.py = n.y; continue; }
        const vx = (n.x - n.px) * 0.99;
        const vy = (n.y - n.py) * 0.99;
        n.px = n.x; n.py = n.y;
        n.x += vx;
        n.y += vy - this.gravity * dt * dt * 0.65;
      }
      const rest = 0.34;
      for (let it = 0; it < this.verletIterations; it++) {
        for (let i = 0; i < this.verletNodes.length - 1; i++) {
          const a = this.verletNodes[i], b = this.verletNodes[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1e-4;
          const diff = (d - rest) / d;
          if (a.pinned) { b.x -= dx * diff; b.y -= dy * diff; }
          else {
            a.x += dx * diff * 0.5; a.y += dy * diff * 0.5;
            b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5;
          }
        }
      }
    } else if (this.mode === "kinematics") {
      const dx = this.goal.x - this.agent.x, dy = this.goal.y - this.agent.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.08) {
        const ix = dx / dist, iy = dy / dist;
        const dot = ix * this.agent.vx + iy * this.agent.vy;
        const rate = dot < 0 ? this.accel * 1.8 : this.accel;
        this.agent.vx += ix * rate * dt;
        this.agent.vy += iy * rate * dt;
      }
      const damp = Math.exp(-this.drag * dt);
      this.agent.vx *= damp;
      this.agent.vy *= damp;
      this.agent.x += this.agent.vx * dt;
      this.agent.y += this.agent.vy * dt;
      this.trail.push({ x: this.agent.x, y: this.agent.y });
      if (this.trail.length > 60) this.trail.shift();
    } else if (this.mode === "steering") {
      const maxSpeed = 2.8, maxForce = 5.5;
      let tx = this.goal.x, ty = this.goal.y;
      if (this.steerMode === 3) {
        tx = Math.cos(this.time * 0.9) * 2.2;
        ty = Math.sin(this.time * 1.4) * 1.4;
      }
      const dx = tx - this.agent.x, dy = ty - this.agent.y;
      const d = Math.hypot(dx, dy) || 1e-4;
      let desSpeed = maxSpeed;
      if (this.steerMode === 0) desSpeed = maxSpeed * MathEvaluator.clamp01(d / 1.4);
      const sign = this.steerMode === 2 ? -1 : 1;
      const desX = (dx / d) * desSpeed * sign;
      const desY = (dy / d) * desSpeed * sign;
      let fx = desX - this.agent.vx, fy = desY - this.agent.vy;
      const fLen = Math.hypot(fx, fy);
      if (fLen > maxForce) { fx = (fx / fLen) * maxForce; fy = (fy / fLen) * maxForce; }
      this.agent.vx += fx * dt; this.agent.vy += fy * dt;
      this.agent.x = MathEvaluator.clamp(this.agent.x + this.agent.vx * dt, -3.6, 3.6);
      this.agent.y = MathEvaluator.clamp(this.agent.y + this.agent.vy * dt, -2.2, 2.2);
      this.trail.push({ x: this.agent.x, y: this.agent.y });
      if (this.trail.length > 55) this.trail.shift();
    } else if (this.mode === "boids" && !this.flowMode) {
      for (let i = 0; i < this.boids.length; i++) {
        const b = this.boids[i];
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, count = 0;
        for (let j = 0; j < this.boids.length; j++) {
          if (i === j) continue;
          const o = this.boids[j];
          const dx = b.x - o.x, dy = b.y - o.y;
          const d = Math.hypot(dx, dy);
          if (d < 0.95 && d > 0.001) {
            if (d < 0.45) { sx += dx / (d * d); sy += dy / (d * d); }
            ax += o.vx; ay += o.vy;
            cx += o.x; cy += o.y;
            count++;
          }
        }
        let fx = (this.vortex.x - b.x) * 0.55, fy = (this.vortex.y - b.y) * 0.55;
        if (count > 0) {
          fx += sx * this.wSep * 0.4 + (ax / count - b.vx) * this.wAlign * 0.9 + (cx / count - b.x) * this.wCoh;
          fy += sy * this.wSep * 0.4 + (ay / count - b.vy) * this.wAlign * 0.9 + (cy / count - b.y) * this.wCoh;
        }
        b.vx += fx * dt * 2.2; b.vy += fy * dt * 2.2;
        const sp = Math.hypot(b.vx, b.vy) || 1;
        const targetSp = MathEvaluator.clamp(sp, 1.1, 2.5);
        b.vx = (b.vx / sp) * targetSp; b.vy = (b.vy / sp) * targetSp;
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x > 3.7) b.x = -3.7; if (b.x < -3.7) b.x = 3.7;
        if (b.y > 2.3) b.y = -2.3; if (b.y < -2.3) b.y = 2.3;
      }
    } else if ((this.mode === "bezier" || this.mode === "catmullrom" || this.mode === "arclength") && this.animPlay) {
      this.curveT = (this.curveT + dt * 0.24) % 1;
    }

    if (Math.floor(this.time * 10) !== Math.floor((this.time - dt) * 10)) {
      this.updateState();
    }
  }

  updateState() {
    this.emitState({
      mode: this.mode,
      v0: this.v0,
      gravity: this.gravity,
      jumpHeight: this.jumpHeight,
      timeToApex: this.timeToApex,
      bulletSpeed: this.bulletSpeed,
      targetSpeed: this.targetSpeed,
      curveT: this.curveT,
      ctrlPts: this.ctrlPts,
      agent: this.agent,
      goal: this.goal
    });
  }

  evalCubicBezier(t) {
    const [p0, p1, p2, p3] = this.ctrlPts;
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    };
  }

  evalCatmullRom(pts, globalT) {
    const segs = pts.length - 1;
    const scaled = MathEvaluator.clamp01(globalT) * segs;
    const i = Math.min(segs - 1, Math.floor(scaled));
    const t = scaled - i;
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[Math.min(pts.length - 1, i + 1)];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const t2 = t * t, t3 = t2 * t;
    const calc = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    return { x: calc(p0.x, p1.x, p2.x, p3.x), y: calc(p0.y, p1.y, p2.y, p3.y) };
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    const g = this.getGeometry();
    ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid(ctx, g.cx, g.cy, g.scale, colors, true);

    if (this.mode === "ballistic") return this.renderBallistic(ctx, g, colors);
    if (this.mode === "leadtarget") return this.renderLeadTarget(ctx, g, colors);
    if (this.mode === "verlet") return this.renderVerlet(ctx, g, colors);
    if (this.mode === "kinematics" || this.mode === "steering") return this.renderAgent(ctx, g, colors);
    if (this.mode === "boids") return this.renderBoidsOrFlow(ctx, g, colors);
    if (this.mode === "bezier") return this.renderBezier(ctx, g, colors);
    if (this.mode === "catmullrom") return this.renderCatmullRom(ctx, g, colors);
    if (this.mode === "arclength") return this.renderArcLength(ctx, g, colors);
  }

  renderBallistic(ctx, g, colors) {
    let vx, vy, grav;
    if (this.jumpMode) {
      vy = (2 * this.jumpHeight) / this.timeToApex;
      grav = (2 * this.jumpHeight) / (this.timeToApex * this.timeToApex);
      vx = 4.2;
    } else {
      vx = this.v0.x * 3.0;
      vy = this.v0.y * 3.0;
      grav = this.gravity;
    }

    const tFlight = (2 * vy) / grav;
    const maxH = (vy * vy) / (2 * grav);
    const range = vx * tFlight;

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * tFlight;
      const x = vx * t;
      const y = vy * t - 0.5 * grav * t * t;
      const sp = this.toScreen({ x: x * 0.5, y: y * 0.5 }, g);
      if (i === 0) ctx.moveTo(sp.x, sp.y);
      else ctx.lineTo(sp.x, sp.y);
    }
    ctx.stroke();

    // Apex marker
    const apex = this.toScreen({ x: (range * 0.5) * 0.5, y: maxH * 0.5 }, g);
    ctx.beginPath(); ctx.arc(apex.x, apex.y, 5.5, 0, Math.PI * 2); ctx.fillStyle = colors.y; ctx.fill();

    if (!this.jumpMode) {
      const pV = this.toScreen(this.v0, g);
      this.drawArrow(ctx, g.cx, g.cy, pV.x, pV.y, colors.x, 3);
      this.drawHandle(ctx, pV.x, pV.y, colors.x, `V0 (${vx.toFixed(1)}, ${vy.toFixed(1)}) m/s`, colors);
      this.drawStatusBanner(ctx, `Portée = ${range.toFixed(2)}m | Sommet H = ${maxH.toFixed(2)}m | Temps de vol = ${tFlight.toFixed(2)}s`, colors.accent, colors);
    } else {
      this.drawStatusBanner(ctx, `Saut calibré H=${this.jumpHeight.toFixed(1)}m, t=${this.timeToApex.toFixed(2)}s → v₀ = ${vy.toFixed(2)} m/s, g = -${grav.toFixed(2)} m/s²`, colors.y, colors);
    }
  }

  renderLeadTarget(ctx, g, colors) {
    const shooter = { x: -2.6, y: -1.4 };
    const cycle = this.time % 3.2;
    const tStart = { x: -1.2, y: 1.5 };
    const vt = { x: this.targetSpeed, y: -0.35 };
    const targetPos = { x: tStart.x + vt.x * (cycle * 0.7), y: tStart.y + vt.y * (cycle * 0.7) };

    const d = { x: targetPos.x - shooter.x, y: targetPos.y - shooter.y };
    const s = this.bulletSpeed;
    const a = vt.x * vt.x + vt.y * vt.y - s * s;
    const b = 2 * (d.x * vt.x + d.y * vt.y);
    const c = d.x * d.x + d.y * d.y;
    const disc = b * b - 4 * a * c;

    let tHit = -1;
    if (Math.abs(a) < 1e-4) tHit = -c / b;
    else if (disc >= 0) {
      const sq = Math.sqrt(disc);
      const r1 = (-b - sq) / (2 * a);
      const r2 = (-b + sq) / (2 * a);
      if (r1 > 0 && r2 > 0) tHit = Math.min(r1, r2);
      else tHit = Math.max(r1, r2);
    }

    const sShooter = this.toScreen(shooter, g);
    const sTarget = this.toScreen(targetPos, g);
    const sTargetFwd = this.toScreen({ x: targetPos.x + vt.x * 0.9, y: targetPos.y + vt.y * 0.9 }, g);

    // Target path & naive aim line
    this.drawArrow(ctx, sTarget.x, sTarget.y, sTargetFwd.x, sTargetFwd.y, colors.z, 2.4);
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = colors.muted; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(sShooter.x, sShooter.y); ctx.lineTo(sTarget.x, sTarget.y); ctx.stroke(); ctx.restore();

    let status = "Cible trop rapide (Δ < 0, interception impossible)";
    let col = colors.x;
    if (tHit > 0) {
      const intercept = { x: targetPos.x + vt.x * tHit, y: targetPos.y + vt.y * tHit };
      const sInt = this.toScreen(intercept, g);
      this.drawArrow(ctx, sShooter.x, sShooter.y, sInt.x, sInt.y, colors.y, 2.8);
      ctx.beginPath(); ctx.arc(sInt.x, sInt.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = colors.y; ctx.lineWidth = 2.4; ctx.stroke();

      // Animated projectile dot on intercept ray
      const prog = (this.time * 1.1) % 1;
      const bPos = this.toScreen({ x: shooter.x + (intercept.x - shooter.x) * prog, y: shooter.y + (intercept.y - shooter.y) * prog }, g);
      ctx.beginPath(); ctx.arc(bPos.x, bPos.y, 5, 0, Math.PI * 2); ctx.fillStyle = colors.y; ctx.fill();

      status = `INTERCEPTION : t* = ${tHit.toFixed(2)}s → Viser (${intercept.x.toFixed(2)}, ${intercept.y.toFixed(2)}) (Ligne verte)`;
      col = colors.y;
    }

    this.drawHandle(ctx, sShooter.x, sShooter.y, colors.x, "Tourelle", colors);
    this.drawHandle(ctx, sTarget.x, sTarget.y, colors.z, "Cible Mobile", colors);
    this.drawStatusBanner(ctx, status, col, colors);
  }

  renderVerlet(ctx, g, colors) {
    ctx.strokeStyle = colors.z;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    this.verletNodes.forEach((n, i) => {
      const s = this.toScreen(n, g);
      if (i === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.stroke();

    this.verletNodes.forEach((n, i) => {
      const s = this.toScreen(n, g);
      if (i === 0) this.drawHandle(ctx, s.x, s.y, colors.accent, "Ancre (Glissez !)", colors);
      else {
        ctx.beginPath(); ctx.arc(s.x, s.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = i === this.verletNodes.length - 1 ? colors.y : colors.text;
        ctx.fill();
      }
    });
    this.drawStatusBanner(ctx, `Corde Verlet (12 nœuds · ${this.verletIterations} passes de contrainte) — Secouez l'ancre jaune !`, colors.z, colors);
  }

  renderAgent(ctx, g, colors) {
    if (this.trail.length > 1) {
      ctx.strokeStyle = colors.z + "66";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.trail.forEach((pt, i) => {
        const s = this.toScreen(pt, g);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.stroke();
    }

    const sG = this.toScreen(this.goal, g);
    if (this.mode === "steering" && this.steerMode === 0) {
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = colors.y + "66"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(sG.x, sG.y, 1.4 * g.scale, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }

    const sA = this.toScreen(this.agent, g);
    const sVel = this.toScreen({ x: this.agent.x + this.agent.vx * 0.45, y: this.agent.y + this.agent.vy * 0.45 }, g);
    this.drawArrow(ctx, sA.x, sA.y, sVel.x, sVel.y, colors.y, 2.8);
    this.drawHandle(ctx, sA.x, sA.y, colors.z, "Agent", colors);
    this.drawHandle(ctx, sG.x, sG.y, colors.accent, "Cible (Cliquez/Glissez)", colors);

    const spd = Math.hypot(this.agent.vx, this.agent.vy);
    this.drawStatusBanner(ctx, `Vitesse ‖v‖ = ${spd.toFixed(2)} m/s | Glissez la cible jaune pour observer la réaction de l'agent`, colors.y, colors);
  }

  renderBoidsOrFlow(ctx, g, colors) {
    if (this.flowMode) {
      for (let gx = -3.4; gx <= 3.4; gx += 0.65) {
        for (let gy = -2.0; gy <= 2.0; gy += 0.65) {
          const dx = this.vortex.x - gx, dy = this.vortex.y - gy;
          const fx = -dy * 0.32 + dx * 0.16;
          const fy = dx * 0.32 + dy * 0.16;
          const s1 = this.toScreen({ x: gx, y: gy }, g);
          const s2 = this.toScreen({ x: gx + fx * 0.42, y: gy + fy * 0.42 }, g);
          this.drawArrow(ctx, s1.x, s1.y, s2.x, s2.y, colors.z, 1.6);
        }
      }
      const sV = this.toScreen(this.vortex, g);
      this.drawHandle(ctx, sV.x, sV.y, colors.x, "Vortex ∇ (Glissez)", colors);
      this.drawStatusBanner(ctx, `Flow Field / Vortex Nabla : chaque case oriente instantanément des milliers d'unités`, colors.z, colors);
      return;
    }

    this.boids.forEach((b) => {
      const s = this.toScreen(b, g);
      const a = Math.atan2(-b.vy, b.vx);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(a);
      ctx.fillStyle = colors.z;
      ctx.beginPath();
      ctx.moveTo(8, 0); ctx.lineTo(-6, -4.5); ctx.lineTo(-4, 0); ctx.lineTo(-6, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    const sV = this.toScreen(this.vortex, g);
    this.drawHandle(ctx, sV.x, sV.y, colors.accent, "Attracteur (Glissez)", colors);
    this.drawStatusBanner(ctx, `38 Boids — Séparation (${this.wSep.toFixed(1)}) · Alignement (${this.wAlign.toFixed(1)}) · Cohésion (${this.wCoh.toFixed(1)})`, colors.z, colors);
  }

  renderBezier(ctx, g, colors) {
    const [p0, p1, p2, p3] = this.ctrlPts;
    const lerpP = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    const t = this.curveT;

    // Control polygon
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = colors.muted; ctx.lineWidth = 1.4;
    ctx.beginPath();
    this.ctrlPts.forEach((pt, i) => { const s = this.toScreen(pt, g); if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y); });
    ctx.stroke(); ctx.restore();

    // Curve
    ctx.strokeStyle = colors.z; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const s = this.toScreen(this.evalCubicBezier(i / 80), g);
      if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
    }
    ctx.stroke();

    // De Casteljau construction lines
    const q0 = lerpP(p0, p1, t), q1 = lerpP(p1, p2, t), q2 = lerpP(p2, p3, t);
    const r0 = lerpP(q0, q1, t), r1 = lerpP(q1, q2, t);
    const bPt = lerpP(r0, r1, t);

    const drawSeg = (a, b, col) => {
      const sa = this.toScreen(a, g), sb = this.toScreen(b, g);
      ctx.strokeStyle = col; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y); ctx.stroke();
    };
    drawSeg(q0, q1, colors.aux + "aa"); drawSeg(q1, q2, colors.aux + "aa");
    drawSeg(r0, r1, colors.y);

    const sB = this.toScreen(bPt, g);
    ctx.beginPath(); ctx.arc(sB.x, sB.y, 7.5, 0, Math.PI * 2); ctx.fillStyle = colors.accent; ctx.fill();

    this.ctrlPts.forEach((pt, i) => {
      const s = this.toScreen(pt, g);
      this.drawHandle(ctx, s.x, s.y, i === 0 || i === 3 ? colors.x : colors.z, `P${i}`, colors);
    });
    this.drawStatusBanner(ctx, `De Casteljau (t = ${t.toFixed(2)}) → B(t) = (${bPt.x.toFixed(2)}, ${bPt.y.toFixed(2)}) | Ligne verte = Tangente exacte`, colors.y, colors);
  }

  renderCatmullRom(ctx, g, colors) {
    ctx.strokeStyle = colors.z; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const s = this.toScreen(this.evalCatmullRom(this.ctrlPts, i / 120), g);
      if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
    }
    ctx.stroke();

    const pos = this.evalCatmullRom(this.ctrlPts, this.curveT);
    const sPos = this.toScreen(pos, g);
    ctx.beginPath(); ctx.arc(sPos.x, sPos.y, 8, 0, Math.PI * 2); ctx.fillStyle = colors.y; ctx.fill();

    this.ctrlPts.forEach((pt, i) => {
      const s = this.toScreen(pt, g);
      this.drawHandle(ctx, s.x, s.y, colors.accent, `WP${i}`, colors);
    });
    this.drawStatusBanner(ctx, `Catmull-Rom passe par les 5 Waypoints | Position t=${this.curveT.toFixed(2)} : (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`, colors.y, colors);
  }

  renderArcLength(ctx, g, colors) {
    // Build LUT (100 samples)
    const N = 100;
    const lut = [0];
    let prev = this.evalCubicBezier(0);
    ctx.strokeStyle = colors.border; ctx.lineWidth = 3;
    ctx.beginPath();
    const s0 = this.toScreen(prev, g); ctx.moveTo(s0.x, s0.y);
    for (let i = 1; i <= N; i++) {
      const cur = this.evalCubicBezier(i / N);
      lut.push(lut[i - 1] + Math.hypot(cur.x - prev.x, cur.y - prev.y));
      prev = cur;
      const s = this.toScreen(cur, g); ctx.lineTo(s.x, s.y);
    }
    ctx.stroke();

    const totalLen = lut[N] || 1;
    // Uniform-t ticks (red) vs Constant-distance LUT ticks (green)
    const targetDist = this.curveT * totalLen;
    let lo = 0, hi = N;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (lut[mid] < targetDist) lo = mid + 1; else hi = mid; }
    const idx = Math.max(1, lo);
    const frac = (targetDist - lut[idx - 1]) / Math.max(1e-5, lut[idx] - lut[idx - 1]);
    const lutT = ((idx - 1) + frac) / N;

    const pNaive = this.toScreen(this.evalCubicBezier(this.curveT), g);
    const pLut = this.toScreen(this.evalCubicBezier(lutT), g);

    ctx.beginPath(); ctx.arc(pNaive.x, pNaive.y, 9, 0, Math.PI * 2); ctx.fillStyle = colors.x; ctx.fill();
    ctx.beginPath(); ctx.arc(pLut.x, pLut.y, 9, 0, Math.PI * 2); ctx.fillStyle = colors.y; ctx.fill();

    this.ctrlPts.forEach((pt, i) => {
      const s = this.toScreen(pt, g);
      this.drawHandle(ctx, s.x, s.y, colors.z, `P${i}`, colors);
    });
    this.drawStatusBanner(ctx, `Rouge: t uniforme (${this.curveT.toFixed(2)}) accélère/ralentit | Vert: LUT (${lutT.toFixed(2)}) vitesse constante exacte (L=${totalLen.toFixed(2)}m)`, colors.y, colors);
  }
}
