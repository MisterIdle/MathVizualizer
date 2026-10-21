import { BaseSandbox } from "./BaseSandbox.js";

export class Space3DSandbox extends BaseSandbox {
  constructor(canvas, funcItem, onStateChange) {
    super(canvas, funcItem, onStateChange);
    this.mode = funcItem.id;
    this.camYaw = -0.6;
    this.camPitch = 0.42;
    this.pitch = 20;
    this.yaw = 35;
    this.roll = 10;
    this.axisX = 0.0;
    this.axisY = 1.0;
    this.axisZ = 0.0;
    this.angleDeg = 55;
    this.slerpT = 0.5;
    this.rho = 1.8;
    this.thetaDeg = 45;
    this.phiDeg = 55;
    this.targetPos = { x: 1.6, y: 1.1, z: 1.4 };
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    const resetBtn = {
      type: "button",
      label: "Réinitialiser Vue 3D",
      onClick: () => {
        this.camYaw = -0.6;
        this.camPitch = 0.42;
        this.render();
      }
    };

    if (this.mode === "qeuler" || this.mode === "euler") {
      return [
        { type: "range", key: "pitch", label: "Pitch X (Haut/Bas °)", min: -90, max: 90, step: 1, value: this.pitch, onChange: (v) => { this.pitch = v; this.updateStateAndRender(); } },
        { type: "range", key: "yaw", label: "Yaw Y (Gauche/Droite °)", min: -180, max: 180, step: 1, value: this.yaw, onChange: (v) => { this.yaw = v; this.updateStateAndRender(); } },
        { type: "range", key: "roll", label: "Roll Z (Roulis °)", min: -180, max: 180, step: 1, value: this.roll, onChange: (v) => { this.roll = v; this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "qangleaxis") {
      return [
        { type: "range", key: "angleDeg", label: "Angle de rotation (°)", min: 0, max: 360, step: 1, value: this.angleDeg, onChange: (v) => { this.angleDeg = v; this.updateStateAndRender(); } },
        { type: "range", key: "axisX", label: "Axe X", min: -1, max: 1, step: 0.05, value: this.axisX, onChange: (v) => { this.axisX = v; this.updateStateAndRender(); } },
        { type: "range", key: "axisY", label: "Axe Y (Haut)", min: -1, max: 1, step: 0.05, value: this.axisY, onChange: (v) => { this.axisY = v; this.updateStateAndRender(); } },
        { type: "range", key: "axisZ", label: "Axe Z", min: -1, max: 1, step: 0.05, value: this.axisZ, onChange: (v) => { this.axisZ = v; this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "qlookrotation") {
      return [
        { type: "range", key: "tx", label: "Cible X (Gauche/Droite)", min: -2.2, max: 2.2, step: 0.1, value: this.targetPos.x, onChange: (v) => { this.targetPos.x = v; this.updateStateAndRender(); } },
        { type: "range", key: "ty", label: "Cible Y (Hauteur)", min: -1.5, max: 2.2, step: 0.1, value: this.targetPos.y, onChange: (v) => { this.targetPos.y = v; this.updateStateAndRender(); } },
        { type: "range", key: "tz", label: "Cible Z (Profondeur)", min: -2.2, max: 2.2, step: 0.1, value: this.targetPos.z, onChange: (v) => { this.targetPos.z = v; this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "qslerp") {
      return [
        { type: "range", key: "slerpT", label: "Progression Slerp (0 → 1)", min: 0, max: 1, step: 0.02, value: this.slerpT, onChange: (v) => { this.slerpT = v; this.updateStateAndRender(); } },
        { type: "range", key: "yaw", label: "Angle Arrivée Y (°)", min: -180, max: 180, step: 5, value: this.yaw, onChange: (v) => { this.yaw = v; this.updateStateAndRender(); } },
        { type: "range", key: "pitch", label: "Angle Arrivée X (°)", min: -80, max: 80, step: 5, value: this.pitch, onChange: (v) => { this.pitch = v; this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "coord3d") {
      return [
        { type: "range", key: "rho", label: "Distance Rayon (ρ)", min: 0.5, max: 2.3, step: 0.1, value: this.rho, onChange: (v) => { this.rho = v; this.updateStateAndRender(); } },
        { type: "range", key: "thetaDeg", label: "Angle Horizontal θ (°)", min: 0, max: 360, step: 5, value: this.thetaDeg, onChange: (v) => { this.thetaDeg = v; this.updateStateAndRender(); } },
        { type: "range", key: "phiDeg", label: "Angle depuis le Haut φ (°)", min: 5, max: 175, step: 5, value: this.phiDeg, onChange: (v) => { this.phiDeg = v; this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    return [resetBtn];
  }

  bindEvents() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.lastMouse = this.getMousePos(e);
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const pos = this.getMousePos(e);
      const dx = pos.x - this.lastMouse.x;
      const dy = pos.y - this.lastMouse.y;
      this.lastMouse = pos;
      
      this.camYaw += dx * 0.008;
      this.camPitch = Math.max(-1.1, Math.min(1.2, this.camPitch - dy * 0.008));
      
      this.render();
    });
    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
  }

  eulerToQuat(pitchDeg, yawDeg, rollDeg) {
    const px = (pitchDeg * Math.PI) / 360;
    const py = (yawDeg * Math.PI) / 360;
    const pz = (rollDeg * Math.PI) / 360;
    const cx = Math.cos(px), sx = Math.sin(px);
    const cy = Math.cos(py), sy = Math.sin(py);
    const cz = Math.cos(pz), sz = Math.sin(pz);
    return {
      x: sx * cy * cz + cx * sy * sz,
      y: cx * sy * cz - sx * cy * sz,
      z: cx * cy * sz - sx * sy * cz,
      w: cx * cy * cz + sx * sy * sz
    };
  }

  axisAngleToQuat(ax, ay, az, angleDeg) {
    const len = Math.hypot(ax, ay, az) || 1;
    const nx = ax / len, ny = ay / len, nz = az / len;
    const half = (angleDeg * Math.PI) / 360;
    const s = Math.sin(half);
    return { x: nx * s, y: ny * s, z: nz * s, w: Math.cos(half) };
  }

  slerpQuat(q1, q2, t) {
    let cosHalfTheta = q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
    let qb = { ...q2 };
    if (cosHalfTheta < 0) {
      qb = { x: -q2.x, y: -q2.y, z: -q2.z, w: -q2.w };
      cosHalfTheta = -cosHalfTheta;
    }
    if (cosHalfTheta >= 0.999) {
      return {
        x: q1.x + t * (qb.x - q1.x),
        y: q1.y + t * (qb.y - q1.y),
        z: q1.z + t * (qb.z - q1.z),
        w: q1.w + t * (qb.w - q1.w)
      };
    }
    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    return {
      x: q1.x * ratioA + qb.x * ratioB,
      y: q1.y * ratioA + qb.y * ratioB,
      z: q1.z * ratioA + qb.z * ratioB,
      w: q1.w * ratioA + qb.w * ratioB
    };
  }

  lookAtQuat(tx, ty, tz) {
    const len = Math.hypot(tx, ty, tz) || 1;
    const fx = tx / len, fy = ty / len, fz = tz / len;
    const yaw = Math.atan2(fx, fz) * (180 / Math.PI);
    const pitch = -Math.asin(fy) * (180 / Math.PI);
    return this.eulerToQuat(pitch, yaw, 0);
  }

  rotateVecByQuat(v, q) {
    const ix = q.w * v.x + q.y * v.z - q.z * v.y;
    const iy = q.w * v.y + q.z * v.x - q.x * v.z;
    const iz = q.w * v.z + q.x * v.y - q.y * v.x;
    const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
    return {
      x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
      y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
      z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x
    };
  }

  project3D(p) {
    const cy = Math.cos(this.camYaw), sy = Math.sin(this.camYaw);
    const cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    const x1 = p.x * cy - p.z * sy;
    const z1 = p.x * sy + p.z * cy;
    const y2 = p.y * cp - z1 * sp;
    const z2 = p.y * sp + z1 * cp;
    const fov = Math.min(this.width, this.height) * 0.9;
    const dist = 5.8 + z2;
    const scale = fov / Math.max(1, dist);
    return {
      x: this.width / 2 + x1 * scale,
      y: this.height / 2 - y2 * scale,
      scale,
      depth: z2
    };
  }

  updateStateAndRender() {
    let q = { x: 0, y: 0, z: 0, w: 1 };
    if (this.mode === "qeuler" || this.mode === "euler") {
      q = this.eulerToQuat(this.pitch, this.yaw, this.roll);
    } else if (this.mode === "qangleaxis") {
      q = this.axisAngleToQuat(this.axisX, this.axisY, this.axisZ, this.angleDeg);
    } else if (this.mode === "qlookrotation") {
      q = this.lookAtQuat(this.targetPos.x, this.targetPos.y, this.targetPos.z);
    } else if (this.mode === "qslerp") {
      const qStart = this.eulerToQuat(0, -50, 0);
      const qEnd = this.eulerToQuat(this.pitch, this.yaw, 25);
      q = this.slerpQuat(qStart, qEnd, this.slerpT);
      this.qStart = qStart;
      this.qEnd = qEnd;
    }

    this.currentQuat = q;
    const theta = (this.thetaDeg * Math.PI) / 180;
    const phi = (this.phiDeg * Math.PI) / 180;
    this.sphericalPt = {
      x: this.rho * Math.sin(phi) * Math.cos(theta),
      y: this.rho * Math.cos(phi),
      z: this.rho * Math.sin(phi) * Math.sin(theta)
    };

    this.render();
    this.emitState({
      quat: q,
      euler: { x: this.pitch, y: this.yaw, z: this.roll },
      axis: { x: this.axisX, y: this.axisY, z: this.axisZ, angle: this.angleDeg },
      target: this.targetPos,
      slerpT: this.slerpT,
      coord3d: { rho: this.rho, theta: this.thetaDeg, phi: this.phiDeg, cart: this.sphericalPt }
    });
  }

  drawLine3D(ctx, p1, p2, color, width = 1.5, dash = []) {
    const a = this.project3D(p1);
    const b = this.project3D(p2);
    ctx.save();
    ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  drawWorldFloorAndAxes(ctx, colors) {
    const floorCorners = [
      this.project3D({ x: -2.2, y: 0, z: -2.2 }),
      this.project3D({ x: 2.2, y: 0, z: -2.2 }),
      this.project3D({ x: 2.2, y: 0, z: 2.2 }),
      this.project3D({ x: -2.2, y: 0, z: 2.2 })
    ];
    ctx.fillStyle = "rgba(120, 130, 145, 0.04)";
    ctx.beginPath();
    ctx.moveTo(floorCorners[0].x, floorCorners[0].y);
    floorCorners.forEach((c) => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.fill();

    for (let i = -2; i <= 2; i++) {
      this.drawLine3D(ctx, { x: i, y: 0, z: -2.2 }, { x: i, y: 0, z: 2.2 }, colors.grid, 0.8);
      this.drawLine3D(ctx, { x: -2.2, y: 0, z: i }, { x: 2.2, y: 0, z: i }, colors.grid, 0.8);
    }

    this.drawLine3D(ctx, { x: 0, y: -2.0, z: 0 }, { x: 0, y: 0, z: 0 }, "rgba(81, 207, 102, 0.2)", 1.5, [4, 4]);
    this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, { x: 0, y: 2.3, z: 0 }, "#51cf66", 2.5);
    this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, { x: 2.3, y: 0, z: 0 }, "#ff6b6b", 2);
    this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 2.3 }, "#4dabf7", 2);

    const topY = this.project3D({ x: 0, y: 2.4, z: 0 });
    const botY = this.project3D({ x: 0, y: -2.1, z: 0 });
    const posX = this.project3D({ x: 2.45, y: 0, z: 0 });
    const posZ = this.project3D({ x: 0, y: 0, z: 2.45 });

    ctx.font = "700 11px Segoe UI, sans-serif";
    ctx.fillStyle = "#51cf66";
    ctx.fillText("▲ HAUT (+Y)", topY.x - 30, topY.y - 4);
    ctx.fillStyle = colors.muted;
    ctx.fillText("▼ BAS (-Y)", botY.x - 30, botY.y + 14);
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText("X", posX.x + 4, posX.y + 4);
    ctx.fillStyle = "#4dabf7";
    ctx.fillText("Z", posZ.x - 10, posZ.y + 14);
  }

  drawCornerGizmo(ctx, colors) {
    const gx = this.width - 55;
    const gy = 55;
    const len = 28;

    ctx.fillStyle = "rgba(15, 15, 15, 0.75)";
    ctx.beginPath();
    ctx.arc(gx, gy, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.stroke();

    const axes = [
      { v: { x: 1, y: 0, z: 0 }, col: "#ff6b6b", lbl: "X" },
      { v: { x: 0, y: 1, z: 0 }, col: "#51cf66", lbl: "Y" },
      { v: { x: 0, y: 0, z: 1 }, col: "#4dabf7", lbl: "Z" }
    ];

    const cy = Math.cos(this.camYaw), sy = Math.sin(this.camYaw);
    const cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);

    axes.forEach((a) => {
      const x1 = a.v.x * cy - a.v.z * sy;
      const z1 = a.v.x * sy + a.v.z * cy;
      const y2 = a.v.y * cp - z1 * sp;
      const ex = gx + x1 * len;
      const ey = gy - y2 * len;

      ctx.strokeStyle = a.col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.fillStyle = a.col;
      ctx.font = "700 9px Segoe UI, sans-serif";
      ctx.fillText(a.lbl, ex - 4, ey - 4);
    });
  }

  drawOrientedCube(ctx, quat, size, colorStroke, alpha = 1.0) {
    const s = size;
    const rawVerts = [
      { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s },
      { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
      { x: -s, y: -s, z: s }, { x: s, y: -s, z: s },
      { x: s, y: s, z: s }, { x: -s, y: s, z: s }
    ];
    const verts = rawVerts.map((v) => this.rotateVecByQuat(v, quat));
    const projVerts = verts.map((v) => this.project3D(v));

    const faces = [
      { indices: [3, 2, 6, 7], color: `rgba(81, 207, 102, ${0.25 * alpha})` },
      { indices: [0, 1, 5, 4], color: `rgba(120, 120, 120, ${0.1 * alpha})` },
      { indices: [4, 5, 6, 7], color: `rgba(77, 171, 247, ${0.2 * alpha})` },
      { indices: [0, 3, 7, 4], color: `rgba(255, 107, 107, ${0.12 * alpha})` },
      { indices: [1, 2, 6, 5], color: `rgba(255, 107, 107, ${0.12 * alpha})` },
      { indices: [0, 1, 2, 3], color: `rgba(100, 100, 100, ${0.1 * alpha})` }
    ];

    faces.forEach((f) => {
      f.avgDepth = f.indices.reduce((sum, idx) => sum + projVerts[idx].depth, 0) / 4;
    });
    faces.sort((a, b) => a.avgDepth - b.avgDepth);

    ctx.save();
    faces.forEach((f) => {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      f.indices.forEach((idx, i) => {
        const pt = projVerts[idx];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fill();
    });

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    edges.forEach(([i, j]) => {
      this.drawLine3D(ctx, verts[i], verts[j], colorStroke, 1.5);
    });

    const origin = { x: 0, y: 0, z: 0 };
    const right = this.rotateVecByQuat({ x: s * 1.6, y: 0, z: 0 }, quat);
    const up = this.rotateVecByQuat({ x: 0, y: s * 1.6, z: 0 }, quat);
    const fwd = this.rotateVecByQuat({ x: 0, y: 0, z: s * 1.8 }, quat);

    this.drawLine3D(ctx, origin, right, "#ff6b6b", 2.2);
    this.drawLine3D(ctx, origin, up, "#51cf66", 2.5);
    this.drawLine3D(ctx, origin, fwd, "#4dabf7", 2.8);
    ctx.restore();
  }

  drawGimbalRing(ctx, radius, plane, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      let pt = { x: 0, y: 0, z: 0 };
      if (plane === "xz") pt = { x: Math.cos(a) * radius, y: 0, z: Math.sin(a) * radius };
      if (plane === "yz") pt = { x: 0, y: Math.cos(a) * radius, z: Math.sin(a) * radius };
      if (plane === "xy") pt = { x: Math.cos(a) * radius, y: Math.sin(a) * radius, z: 0 };
      const scr = this.project3D(pt);
      if (i === 0) ctx.moveTo(scr.x, scr.y);
      else ctx.lineTo(scr.x, scr.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  render() {
    if (!this.ctx || !this.currentQuat) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawWorldFloorAndAxes(ctx, colors);
    this.drawCornerGizmo(ctx, colors);

    if (this.mode === "coord3d") {
      this.drawGimbalRing(ctx, this.rho, "xz", colors.axis);
      const p = this.sphericalPt;
      const ground = { x: p.x, y: 0, z: p.z };

      const gScr = this.project3D(ground);
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(gScr.x, gScr.y, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, ground, "#fcc419", 2, [3, 3]);
      this.drawLine3D(ctx, ground, p, "#51cf66", 2.5, [3, 3]);
      this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, p, "#4cc2ff", 3);

      const sp = this.project3D(p);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#4cc2ff";
      ctx.fill();

      ctx.fillStyle = colors.text;
      ctx.font = "600 12px Segoe UI, sans-serif";
      const hState = p.y >= 0 ? "AU-DESSUS DU SOL" : "SOUS LE SOL";
      ctx.fillText(`Point P (Y = ${p.y.toFixed(2)} → ${hState})`, sp.x + 10, sp.y - 6);
      return;
    }

    if (this.mode === "qeuler" || this.mode === "euler") {
      this.drawGimbalRing(ctx, 1.5, "yz", "rgba(255, 107, 107, 0.5)");
      this.drawGimbalRing(ctx, 1.65, "xz", "rgba(81, 207, 102, 0.5)");
      this.drawGimbalRing(ctx, 1.8, "xy", "rgba(77, 171, 247, 0.5)");
    }

    if (this.mode === "qangleaxis") {
      const len = Math.hypot(this.axisX, this.axisY, this.axisZ) || 1;
      const ax = (this.axisX / len) * 2.1;
      const ay = (this.axisY / len) * 2.1;
      const az = (this.axisZ / len) * 2.1;
      this.drawLine3D(ctx, { x: -ax, y: -ay, z: -az }, { x: ax, y: ay, z: az }, "#fcc419", 2.5, [5, 4]);
      const tip = this.project3D({ x: ax, y: ay, z: az });
      ctx.fillStyle = "#fcc419";
      ctx.font = "700 11px Segoe UI, sans-serif";
      ctx.fillText(`Axe (${this.angleDeg}°)`, tip.x + 8, tip.y);
    }

    if (this.mode === "qlookrotation") {
      const groundT = { x: this.targetPos.x, y: 0, z: this.targetPos.z };
      this.drawLine3D(ctx, groundT, this.targetPos, "rgba(252, 196, 25, 0.4)", 1.5, [2, 2]);
      this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, this.targetPos, "#fcc419", 2, [4, 4]);
      const tScr = this.project3D(this.targetPos);
      ctx.beginPath();
      ctx.arc(tScr.x, tScr.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#fcc419";
      ctx.fill();
      ctx.fillText(`Cible (Y=${this.targetPos.y.toFixed(1)})`, tScr.x + 10, tScr.y + 4);
    }

    if (this.mode === "qslerp" && this.qStart && this.qEnd) {
      this.drawOrientedCube(ctx, this.qStart, 0.65, "#8a8886", 0.25);
      this.drawOrientedCube(ctx, this.qEnd, 0.65, "#fcc419", 0.25);
    }

    this.drawOrientedCube(ctx, this.currentQuat, 0.75, "#4cc2ff", 1.0);

    ctx.fillStyle = colors.muted;
    ctx.font = "11px Segoe UI, sans-serif";
    ctx.fillText("Cube : Vert = Haut | Bleu = Devant | Glissez pour pivoter la caméra", 14, this.height - 12);
  }
}