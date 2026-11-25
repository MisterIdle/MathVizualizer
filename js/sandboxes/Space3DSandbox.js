import { BaseSandbox } from "./BaseSandbox.js?v=2.1";
import { MathEvaluator } from "../core/MathEvaluator.js?v=2.1";

export class Space3DSandbox extends BaseSandbox {
  constructor(canvas, concept, onStateChange, onInteract) {
    super(canvas, concept, onStateChange, onInteract);
    this.camYaw = -0.62;
    this.camPitch = 0.55;
    this.pitch = 22;
    this.yaw = 35;
    this.roll = 10;
    this.localYaw = 45;
    this.localPitch = 20;
    this.multOrderLocal = true;
    this.axisX = 0.2;
    this.axisY = 1.0;
    this.axisZ = 0.15;
    this.angleDeg = 60;
    this.slerpT = 0.5;
    this.rho = 1.9;
    this.thetaDeg = 45;
    this.phiDeg = 55;
    this.targetPos = { x: 1.5, y: 1.0, z: 1.4 };
    this.vecA3 = { x: 1.5, y: 0.3, z: 0.4 };
    this.vecB3 = { x: 0.2, y: 0.5, z: 1.5 };
    this.enginePreset = 0; // 0: Unity, 1: Godot, 2: Unreal
    this.frustumFov = 60;
    this.testPt = { x: 0.5, y: 0.3, z: 1.8 };
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    this.bindEvents();
    this.updateStateAndRender();
  }

  getControlsConfig() {
    const resetBtn = {
      type: "button",
      label: "Reset Caméra 3D",
      onClick: () => {
        this.camYaw = -0.62;
        this.camPitch = 0.55;
        this.render();
      }
    };

    if (this.mode === "euler") {
      return [
        { type: "range", key: "pitch", label: "Pitch X (°)", min: -90, max: 90, step: 1, value: this.pitch, onChange: (v) => { this.pitch = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "yaw", label: "Yaw Y (°)", min: -180, max: 180, step: 1, value: this.yaw, onChange: (v) => { this.yaw = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "roll", label: "Roll Z (°)", min: -180, max: 180, step: 1, value: this.roll, onChange: (v) => { this.roll = v; this.notifyInteract(); this.updateStateAndRender(); } },
        {
          type: "button",
          label: "Forcer Gimbal Lock (Pitch = 90°)",
          onClick: () => {
            this.pitch = 90;
            this.notifyInteract();
            this.updateStateAndRender();
          }
        },
        resetBtn
      ];
    }
    if (this.mode === "quatanatomy" || this.mode === "qangleaxis") {
      return [
        { type: "range", key: "angleDeg", label: "Angle θ (°)", min: 0, max: 360, step: 1, value: this.angleDeg, onChange: (v) => { this.angleDeg = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "axisX", label: "Axe X", min: -1, max: 1, step: 0.05, value: this.axisX, onChange: (v) => { this.axisX = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "axisY", label: "Axe Y", min: -1, max: 1, step: 0.05, value: this.axisY, onChange: (v) => { this.axisY = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "axisZ", label: "Axe Z", min: -1, max: 1, step: 0.05, value: this.axisZ, onChange: (v) => { this.axisZ = v; this.notifyInteract(); this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "qlookrotation" || this.mode === "basis") {
      return [
        { type: "range", key: "tx", label: "Cible X", min: -2.2, max: 2.2, step: 0.1, value: this.targetPos.x, onChange: (v) => { this.targetPos.x = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "ty", label: "Cible Y", min: -1.8, max: 2.2, step: 0.1, value: this.targetPos.y, onChange: (v) => { this.targetPos.y = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "tz", label: "Cible Z", min: -2.2, max: 2.2, step: 0.1, value: this.targetPos.z, onChange: (v) => { this.targetPos.z = v; this.notifyInteract(); this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "qslerp") {
      return [
        { type: "range", key: "slerpT", label: "Progression t (0 → 1)", min: 0, max: 1, step: 0.02, value: this.slerpT, onChange: (v) => { this.slerpT = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "yaw", label: "Arrivée Yaw (°)", min: -180, max: 180, step: 5, value: this.yaw, onChange: (v) => { this.yaw = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "pitch", label: "Arrivée Pitch (°)", min: -80, max: 80, step: 5, value: this.pitch, onChange: (v) => { this.pitch = v; this.notifyInteract(); this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "quatmult") {
      return [
        { type: "range", key: "yaw", label: "qA Yaw (°)", min: -180, max: 180, step: 5, value: this.yaw, onChange: (v) => { this.yaw = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "pitch", label: "qA Pitch (°)", min: -85, max: 85, step: 5, value: this.pitch, onChange: (v) => { this.pitch = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "localYaw", label: "qB Yaw (°)", min: -180, max: 180, step: 5, value: this.localYaw, onChange: (v) => { this.localYaw = v; this.notifyInteract(); this.updateStateAndRender(); } },
        {
          type: "button",
          label: "Ordre : qA * qB (Local)",
          onClick: (btn) => {
            this.multOrderLocal = !this.multOrderLocal;
            if (btn) btn.textContent = this.multOrderLocal ? "Ordre : qA * qB (Local)" : "Ordre : qB * qA (Monde)";
            this.notifyInteract();
            this.updateStateAndRender();
          }
        },
        resetBtn
      ];
    }
    if (this.mode === "quatinverse") {
      return [
        { type: "range", key: "pitch", label: "Pitch X (°)", min: -85, max: 85, step: 5, value: this.pitch, onChange: (v) => { this.pitch = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "yaw", label: "Yaw Y (°)", min: -180, max: 180, step: 5, value: this.yaw, onChange: (v) => { this.yaw = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "roll", label: "Roll Z (°)", min: -180, max: 180, step: 5, value: this.roll, onChange: (v) => { this.roll = v; this.notifyInteract(); this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "coord3d") {
      return [
        { type: "range", key: "rho", label: "Rayon ρ", min: 0.6, max: 2.4, step: 0.1, value: this.rho, onChange: (v) => { this.rho = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "thetaDeg", label: "Azimut θ (°)", min: 0, max: 360, step: 5, value: this.thetaDeg, onChange: (v) => { this.thetaDeg = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "phiDeg", label: "Polaire φ (°)", min: 5, max: 175, step: 5, value: this.phiDeg, onChange: (v) => { this.phiDeg = v; this.notifyInteract(); this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "cross3d") {
      return [
        { type: "range", key: "ay", label: "A.y", min: -1.5, max: 1.5, step: 0.1, value: this.vecA3.y, onChange: (v) => { this.vecA3.y = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "az", label: "A.z", min: -1.5, max: 1.5, step: 0.1, value: this.vecA3.z, onChange: (v) => { this.vecA3.z = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "bx", label: "B.x", min: -1.5, max: 1.5, step: 0.1, value: this.vecB3.x, onChange: (v) => { this.vecB3.x = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "by", label: "B.y", min: -1.5, max: 1.5, step: 0.1, value: this.vecB3.y, onChange: (v) => { this.vecB3.y = v; this.notifyInteract(); this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    if (this.mode === "coordsys") {
      return [
        {
          type: "button",
          label: "Moteur : Unity (LH Y-Up)",
          onClick: (btn) => {
            this.enginePreset = (this.enginePreset + 1) % 3;
            const labels = ["Unity (LH · Y-Up · +Z Fwd)", "Godot (RH · Y-Up · -Z Fwd)", "Unreal (LH · Z-Up · +X Fwd)"];
            if (btn) btn.textContent = `Moteur : ${labels[this.enginePreset]}`;
            this.notifyInteract();
            this.updateStateAndRender();
          }
        },
        resetBtn
      ];
    }
    if (this.mode === "frustum") {
      return [
        { type: "range", key: "fov", label: "FOV (°)", min: 30, max: 110, step: 5, value: this.frustumFov, onChange: (v) => { this.frustumFov = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "px", label: "Objet X", min: -2.5, max: 2.5, step: 0.1, value: this.testPt.x, onChange: (v) => { this.testPt.x = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "py", label: "Objet Y", min: -1.8, max: 1.8, step: 0.1, value: this.testPt.y, onChange: (v) => { this.testPt.y = v; this.notifyInteract(); this.updateStateAndRender(); } },
        { type: "range", key: "pz", label: "Profondeur Z", min: 0.2, max: 3.4, step: 0.1, value: this.testPt.z, onChange: (v) => { this.testPt.z = v; this.notifyInteract(); this.updateStateAndRender(); } },
        resetBtn
      ];
    }
    return [resetBtn];
  }

  bindEvents() {
    this.bindPointer(
      (pos) => {
        this.isDragging = true;
        this.lastMouse = pos;
      },
      (pos) => {
        if (!this.isDragging) return;
        const dx = pos.x - this.lastMouse.x;
        const dy = pos.y - this.lastMouse.y;
        this.lastMouse = pos;
        this.camYaw += dx * 0.009;
        this.camPitch = MathEvaluator.clamp(this.camPitch + dy * 0.009, -1.25, 1.25);
        this.render();
      },
      () => {
        this.isDragging = false;
      }
    );
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
    const half = (angleDeg * Math.PI) / 360;
    const s = Math.sin(half);
    return { x: (ax / len) * s, y: (ay / len) * s, z: (az / len) * s, w: Math.cos(half) };
  }

  slerpQuat(q1, q2, t) {
    let dot = q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
    let qb = { ...q2 };
    if (dot < 0) {
      qb = { x: -q2.x, y: -q2.y, z: -q2.z, w: -q2.w };
      dot = -dot;
    }
    if (dot > 0.999) {
      const r = { x: q1.x + t * (qb.x - q1.x), y: q1.y + t * (qb.y - q1.y), z: q1.z + t * (qb.z - q1.z), w: q1.w + t * (qb.w - q1.w) };
      const l = Math.hypot(r.x, r.y, r.z, r.w) || 1;
      return { x: r.x / l, y: r.y / l, z: r.z / l, w: r.w / l };
    }
    const theta = Math.acos(MathEvaluator.clamp(dot, -1, 1));
    const sinT = Math.sin(theta);
    const a = Math.sin((1 - t) * theta) / sinT;
    const b = Math.sin(t * theta) / sinT;
    return { x: q1.x * a + qb.x * b, y: q1.y * a + qb.y * b, z: q1.z * a + qb.z * b, w: q1.w * a + qb.w * b };
  }

  lookAtQuat(tx, ty, tz) {
    const len = Math.hypot(tx, ty, tz) || 1;
    const fx = tx / len, fy = ty / len, fz = tz / len;
    const yaw = (Math.atan2(fx, fz) * 180) / Math.PI;
    const pitch = (-Math.asin(MathEvaluator.clamp(fy, -1, 1)) * 180) / Math.PI;
    return this.eulerToQuat(pitch, yaw, 0);
  }

  rotateVec(v, q) {
    const ix = q.w * v.x + q.y * v.z - q.z * v.y;
    const iy = q.w * v.y + q.z * v.x - q.x * v.z;
    const iz = q.w * v.z + q.x * v.y - q.y * v.x;
    const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
    return {
      x: ix * q.w - iw * q.x - iy * q.z + iz * q.y,
      y: iy * q.w - iw * q.y - iz * q.x + ix * q.z,
      z: iz * q.w - iw * q.z - ix * q.y + iy * q.x
    };
  }

  multiplyQuat(q1, q2) {
    return {
      x: q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
      y: q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
      z: q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w,
      w: q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z
    };
  }

  project3D(p) {
    const cy = Math.cos(this.camYaw), sy = Math.sin(this.camYaw);
    const cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    const x1 = p.x * cy - p.z * sy;
    const z1 = p.x * sy + p.z * cy;
    const y2 = p.y * cp - z1 * sp;
    const z2 = p.y * sp + z1 * cp;
    const fov = Math.min(this.width, this.height) * 0.92;
    const dist = 5.6 + z2;
    const scale = fov / Math.max(0.8, dist);
    return { x: this.width / 2 + x1 * scale, y: this.height * 0.48 - y2 * scale, depth: z2 };
  }

  updateStateAndRender() {
    let q = { x: 0, y: 0, z: 0, w: 1 };
    if (this.mode === "euler") q = this.eulerToQuat(this.pitch, this.yaw, this.roll);
    else if (this.mode === "quatanatomy" || this.mode === "qangleaxis") q = this.axisAngleToQuat(this.axisX, this.axisY, this.axisZ, this.angleDeg);
    else if (this.mode === "qlookrotation" || this.mode === "basis") q = this.lookAtQuat(this.targetPos.x, this.targetPos.y, this.targetPos.z);
    else if (this.mode === "qslerp") {
      this.qStart = this.eulerToQuat(-10, -55, 0);
      this.qEnd = this.eulerToQuat(this.pitch, this.yaw, 20);
      q = this.slerpQuat(this.qStart, this.qEnd, this.slerpT);
    } else if (this.mode === "quatmult") {
      this.qParent = this.eulerToQuat(this.pitch, this.yaw, 0);
      this.qLocal = this.eulerToQuat(this.localPitch, this.localYaw, 0);
      q = this.multOrderLocal ? this.multiplyQuat(this.qParent, this.qLocal) : this.multiplyQuat(this.qLocal, this.qParent);
    } else if (this.mode === "quatinverse") {
      this.qBase = this.eulerToQuat(this.pitch, this.yaw, this.roll);
      q = { x: -this.qBase.x, y: -this.qBase.y, z: -this.qBase.z, w: this.qBase.w };
    }

    this.currentQuat = q;
    const th = (this.thetaDeg * Math.PI) / 180;
    const ph = (this.phiDeg * Math.PI) / 180;
    this.sphericalPt = {
      x: this.rho * Math.sin(ph) * Math.cos(th),
      y: this.rho * Math.cos(ph),
      z: this.rho * Math.sin(ph) * Math.sin(th)
    };

    const a = this.vecA3, b = this.vecB3;
    this.crossVec = {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };

    this.render();
    this.emitState({
      mode: this.mode,
      quat: q,
      euler: { x: this.pitch, y: this.yaw, z: this.roll },
      axis: { x: this.axisX, y: this.axisY, z: this.axisZ, angle: this.angleDeg },
      target: this.targetPos,
      slerpT: this.slerpT,
      coord3d: { rho: this.rho, theta: this.thetaDeg, phi: this.phiDeg, cart: this.sphericalPt },
      vecA: this.vecA3,
      vecB: this.vecB3,
      cross: this.crossVec,
      enginePreset: this.enginePreset,
      frustumFov: this.frustumFov,
      testPt: this.testPt
    });
  }

  drawLine3D(ctx, p1, p2, color, width = 1.6, dash = []) {
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

  drawArrow3D(ctx, p1, p2, color, width = 2.6, label = "", colors = null) {
    const a = this.project3D(p1);
    const b = this.project3D(p2);
    this.drawArrow(ctx, a.x, a.y, b.x, b.y, color, width);
    if (label && colors) {
      ctx.fillStyle = color;
      ctx.font = '700 11.5px "SF Mono", Consolas, monospace';
      ctx.fillText(label, b.x + 6, b.y - 4);
    }
  }

  drawFloor(ctx, colors) {
    for (let i = -2; i <= 2; i++) {
      this.drawLine3D(ctx, { x: i, y: 0, z: -2.2 }, { x: i, y: 0, z: 2.2 }, colors.grid, 1);
      this.drawLine3D(ctx, { x: -2.2, y: 0, z: i }, { x: 2.2, y: 0, z: i }, colors.grid, 1);
    }
    this.drawArrow3D(ctx, { x: 0, y: 0, z: 0 }, { x: 2.2, y: 0, z: 0 }, colors.x + "aa", 1.8, "+X", colors);
    this.drawArrow3D(ctx, { x: 0, y: 0, z: 0 }, { x: 0, y: 2.1, z: 0 }, colors.y + "aa", 1.8, "+Y", colors);
    this.drawArrow3D(ctx, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 2.2 }, colors.z + "aa", 1.8, "+Z", colors);
  }

  drawRing(ctx, radius, plane, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const pt = plane === "xz"
        ? { x: Math.cos(a) * radius, y: 0, z: Math.sin(a) * radius }
        : plane === "yz"
          ? { x: 0, y: Math.cos(a) * radius, z: Math.sin(a) * radius }
          : { x: Math.cos(a) * radius, y: Math.sin(a) * radius, z: 0 };
      const s = this.project3D(pt);
      if (i === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawCube(ctx, quat, size, strokeColor, alpha, colors) {
    const s = size;
    const raw = [
      { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
      { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s }
    ];
    const verts = raw.map((v) => this.rotateVec(v, quat));
    const proj = verts.map((v) => this.project3D(v));
    const faces = [
      { idx: [3, 2, 6, 7], col: `rgba(63,185,80,${0.26 * alpha})` },
      { idx: [4, 5, 6, 7], col: `rgba(88,166,255,${0.24 * alpha})` },
      { idx: [0, 3, 7, 4], col: `rgba(248,81,73,${0.14 * alpha})` },
      { idx: [1, 2, 6, 5], col: `rgba(248,81,73,${0.14 * alpha})` },
      { idx: [0, 1, 5, 4], col: `rgba(139,148,158,${0.12 * alpha})` },
      { idx: [0, 1, 2, 3], col: `rgba(139,148,158,${0.12 * alpha})` }
    ];
    faces.forEach((f) => { f.depth = f.idx.reduce((acc, i) => acc + proj[i].depth, 0) / 4; });
    faces.sort((a, b) => b.depth - a.depth);

    faces.forEach((f) => {
      ctx.fillStyle = f.col;
      ctx.beginPath();
      f.idx.forEach((id, k) => {
        if (k === 0) ctx.moveTo(proj[id].x, proj[id].y);
        else ctx.lineTo(proj[id].x, proj[id].y);
      });
      ctx.closePath();
      ctx.fill();
    });

    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    edges.forEach(([i, j]) => this.drawLine3D(ctx, verts[i], verts[j], strokeColor, 1.4));

    if (alpha > 0.6) {
      const o = { x: 0, y: 0, z: 0 };
      this.drawArrow3D(ctx, o, this.rotateVec({ x: s * 1.65, y: 0, z: 0 }, quat), colors.x, 2.2);
      this.drawArrow3D(ctx, o, this.rotateVec({ x: 0, y: s * 1.65, z: 0 }, quat), colors.y, 2.4);
      this.drawArrow3D(ctx, o, this.rotateVec({ x: 0, y: 0, z: s * 1.9 }, quat), colors.z, 2.8);
    }
  }

  render() {
    if (!this.ctx || !this.currentQuat) return;
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === "coordsys") return this.renderCoordSys(ctx, colors);
    if (this.mode === "frustum") return this.renderFrustum(ctx, colors);
    if (this.mode === "cross3d") return this.renderCross3D(ctx, colors);

    this.drawFloor(ctx, colors);

    if (this.mode === "coord3d") {
      this.drawRing(ctx, this.rho, "xz", colors.axis);
      const p = this.sphericalPt;
      const g = { x: p.x, y: 0, z: p.z };
      this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, g, colors.accent, 2, [4, 3]);
      this.drawLine3D(ctx, g, p, colors.y, 2.4, [4, 3]);
      this.drawArrow3D(ctx, { x: 0, y: 0, z: 0 }, p, colors.z, 3);
      const sp = this.project3D(p);
      this.drawHandle(ctx, sp.x, sp.y, colors.z, `P(${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`, colors);
      this.drawStatusBanner(ctx, `ρ=${this.rho.toFixed(1)} · θ=${this.thetaDeg}° · φ=${this.phiDeg}° | Glissez pour orbiter la vue 3D`, colors.z, colors);
      return;
    }

    if (this.mode === "basis") {
      const len = Math.hypot(this.targetPos.x, this.targetPos.y, this.targetPos.z) || 1;
      const f = { x: this.targetPos.x / len, y: this.targetPos.y / len, z: this.targetPos.z / len };
      const refUp = Math.abs(f.y) > 0.98 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
      const rx = refUp.y * f.z - refUp.z * f.y, ry = refUp.z * f.x - refUp.x * f.z, rz = refUp.x * f.y - refUp.y * f.x;
      const rLen = Math.hypot(rx, ry, rz) || 1;
      const r = { x: rx / rLen, y: ry / rLen, z: rz / rLen };
      const u = { x: f.y * r.z - f.z * r.y, y: f.z * r.x - f.x * r.z, z: f.x * r.y - f.y * r.x };

      const o = { x: 0, y: 0, z: 0 };
      this.drawArrow3D(ctx, o, { x: r.x * 1.6, y: r.y * 1.6, z: r.z * 1.6 }, colors.x, 3, "Right R̂", colors);
      this.drawArrow3D(ctx, o, { x: u.x * 1.6, y: u.y * 1.6, z: u.z * 1.6 }, colors.y, 3, "Up Û", colors);
      this.drawArrow3D(ctx, o, { x: f.x * 1.8, y: f.y * 1.8, z: f.z * 1.8 }, colors.z, 3.2, "Forward F̂", colors);
      this.drawStatusBanner(ctx, `Base Orthonormée : R̂·Û = 0, Û·F̂ = 0, F̂·R̂ = 0 (3 axes unitaires perpendiculaires)`, colors.y, colors);
      return;
    }

    if (this.mode === "euler") {
      this.drawRing(ctx, 1.5, "yz", colors.x + "88");
      this.drawRing(ctx, 1.68, "xz", colors.y + "88");
      this.drawRing(ctx, 1.86, "xy", colors.z + "88");
    }

    if (this.mode === "qangleaxis" || this.mode === "quatanatomy") {
      const len = Math.hypot(this.axisX, this.axisY, this.axisZ) || 1;
      const ax = (this.axisX / len) * 2.1, ay = (this.axisY / len) * 2.1, az = (this.axisZ / len) * 2.1;
      this.drawLine3D(ctx, { x: -ax, y: -ay, z: -az }, { x: ax, y: ay, z: az }, colors.accent, 2.4, [5, 4]);
    }

    if (this.mode === "qlookrotation") {
      this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, this.targetPos, colors.accent, 2, [4, 4]);
      const ts = this.project3D(this.targetPos);
      this.drawHandle(ctx, ts.x, ts.y, colors.accent, `Cible (${this.targetPos.x.toFixed(1)}, ${this.targetPos.y.toFixed(1)}, ${this.targetPos.z.toFixed(1)})`, colors);
    }

    if (this.mode === "qslerp" && this.qStart && this.qEnd) {
      this.drawCube(ctx, this.qStart, 0.65, colors.muted, 0.28, colors);
      this.drawCube(ctx, this.qEnd, 0.65, colors.accent, 0.28, colors);
    }
    if (this.mode === "quatmult" && this.qParent) {
      this.drawCube(ctx, this.qParent, 0.65, colors.muted, 0.35, colors);
    }
    if (this.mode === "quatinverse" && this.qBase) {
      this.drawCube(ctx, this.qBase, 0.65, colors.x, 0.35, colors);
    }

    this.drawCube(ctx, this.currentQuat, 0.78, colors.z, 1.0, colors);

    const q = this.currentQuat;
    let status = `q = (${q.x.toFixed(3)}, ${q.y.toFixed(3)}, ${q.z.toFixed(3)}, w=${q.w.toFixed(3)}) | Glissez pour pivoter la caméra`;
    let sCol = colors.text;
    if (this.mode === "euler" && Math.abs(this.pitch) >= 88) {
      status = `GIMBAL LOCK ACTIF (Pitch ≈ ±90°) : Yaw et Roll tournent sur le MÊME axe !`;
      sCol = colors.x;
    } else if (this.mode === "quatanatomy") {
      status = `Demi-angle θ/2 = ${(this.angleDeg / 2).toFixed(1)}° → w = cos(θ/2) = ${q.w.toFixed(3)} | ‖q‖ = ${Math.hypot(q.x, q.y, q.z, q.w).toFixed(3)}`;
      sCol = colors.z;
    }
    this.drawStatusBanner(ctx, status, sCol, colors);
  }

  renderCross3D(ctx, colors) {
    this.drawFloor(ctx, colors);
    const o = { x: 0, y: 0, z: 0 };
    const a = this.vecA3, b = this.vecB3, c = this.crossVec;

    // Parallelogram spanned by A and B
    const pO = this.project3D(o), pA = this.project3D(a), pB = this.project3D(b);
    const pAB = this.project3D({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
    ctx.fillStyle = colors.aux + "22";
    ctx.beginPath();
    ctx.moveTo(pO.x, pO.y); ctx.lineTo(pA.x, pA.y); ctx.lineTo(pAB.x, pAB.y); ctx.lineTo(pB.x, pB.y);
    ctx.closePath();
    ctx.fill();

    this.drawArrow3D(ctx, o, a, colors.x, 3, "A", colors);
    this.drawArrow3D(ctx, o, b, colors.z, 3, "B", colors);
    this.drawArrow3D(ctx, o, c, colors.y, 3.4, "A × B", colors);
    const area = Math.hypot(c.x, c.y, c.z);
    this.drawStatusBanner(ctx, `A × B = (${c.x.toFixed(2)}, ${c.y.toFixed(2)}, ${c.z.toFixed(2)}) | ‖A×B‖ = Aire = ${area.toFixed(2)} | Glissez pour tourner`, colors.y, colors);
  }

  renderCoordSys(ctx, colors) {
    for (let i = -2; i <= 2; i++) {
      this.drawLine3D(ctx, { x: i, y: 0, z: -2 }, { x: i, y: 0, z: 2 }, colors.grid, 1);
      this.drawLine3D(ctx, { x: -2, y: 0, z: i }, { x: 2, y: 0, z: i }, colors.grid, 1);
    }
    const o = { x: 0, y: 0, z: 0 };
    const configs = [
      {
        title: "Unity : Main Gauche (LH) · Y-Up · Forward = +Z · 1u = 1m",
        right: { v: { x: 2, y: 0, z: 0 }, lbl: "+X (Right)", col: colors.x },
        up: { v: { x: 0, y: 2, z: 0 }, lbl: "+Y (Up)", col: colors.y },
        fwd: { v: { x: 0, y: 0, z: 2 }, lbl: "+Z (Forward)", col: colors.z }
      },
      {
        title: "Godot 4 : Main Droite (RH) · Y-Up · Forward = -Z · 1u = 1m",
        right: { v: { x: 2, y: 0, z: 0 }, lbl: "+X (Right)", col: colors.x },
        up: { v: { x: 0, y: 2, z: 0 }, lbl: "+Y (Up)", col: colors.y },
        fwd: { v: { x: 0, y: 0, z: -2 }, lbl: "-Z (Forward)", col: colors.z }
      },
      {
        title: "Unreal Engine : Main Gauche (LH) · Z-Up · Forward = +X · 1u = 1cm",
        right: { v: { x: 2, y: 0, z: 0 }, lbl: "+Y (Right)", col: colors.y },
        up: { v: { x: 0, y: 2, z: 0 }, lbl: "+Z (Up)", col: colors.z },
        fwd: { v: { x: 0, y: 0, z: 2 }, lbl: "+X (Forward)", col: colors.x }
      }
    ];
    const cfg = configs[this.enginePreset];
    this.drawArrow3D(ctx, o, cfg.right.v, cfg.right.col, 3.4, cfg.right.lbl, colors);
    this.drawArrow3D(ctx, o, cfg.up.v, cfg.up.col, 3.4, cfg.up.lbl, colors);
    this.drawArrow3D(ctx, o, cfg.fwd.v, cfg.fwd.col, 3.4, cfg.fwd.lbl, colors);
    this.drawStatusBanner(ctx, cfg.title, colors.text, colors);
  }

  renderFrustum(ctx, colors) {
    this.drawFloor(ctx, colors);
    const near = 0.65, far = 2.8, aspect = 1.45;
    const tanH = Math.tan((this.frustumFov * Math.PI) / 360);
    const nh = near * tanH, nw = nh * aspect;
    const fh = far * tanH, fw = fh * aspect;

    const nPts = [
      { x: -nw, y: -nh, z: near }, { x: nw, y: -nh, z: near },
      { x: nw, y: nh, z: near }, { x: -nw, y: nh, z: near }
    ];
    const fPts = [
      { x: -fw, y: -fh, z: far }, { x: fw, y: -fh, z: far },
      { x: fw, y: fh, z: far }, { x: -fw, y: fh, z: far }
    ];

    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      this.drawLine3D(ctx, nPts[i], nPts[next], colors.y, 2);
      this.drawLine3D(ctx, fPts[i], fPts[next], colors.z, 2);
      this.drawLine3D(ctx, nPts[i], fPts[i], colors.z + "99", 1.5);
      this.drawLine3D(ctx, { x: 0, y: 0, z: 0 }, nPts[i], colors.muted, 1, [3, 3]);
    }

    const pt = this.testPt;
    const maxY = pt.z * tanH;
    const maxX = maxY * aspect;
    const inside = pt.z >= near && pt.z <= far && Math.abs(pt.x) <= maxX && Math.abs(pt.y) <= maxY;
    const ndcX = pt.x / Math.max(0.01, maxX);
    const ndcY = pt.y / Math.max(0.01, maxY);

    const sp = this.project3D(pt);
    this.drawHandle(ctx, sp.x, sp.y, inside ? colors.y : colors.x, inside ? "VISIBLE" : "CULLÉ", colors);
    this.drawStatusBanner(
      ctx,
      `${inside ? "DANS LE FRUSTUM (Rendu)" : "HORS FRUSTUM (Éliminé)"} | NDC = (${ndcX.toFixed(2)}, ${ndcY.toFixed(2)}) | Z=${pt.z.toFixed(1)} ∈ [${near}, ${far}]`,
      inside ? colors.y : colors.x,
      colors
    );
  }
}
