export class BaseSandbox {
  constructor(canvas, concept, onStateChange, onInteract) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.concept = concept;
    this.mode = concept.sandboxMode || concept.id;
    this.onStateChange = onStateChange;
    this.onInteract = onInteract;
    this.hasInteracted = false;
    this.width = 640;
    this.height = 460;
    this._listeners = [];
    this._rafId = null;

    this.palette = ["#58a6ff", "#f85149", "#3fb950", "#e3b341", "#bc8cff", "#f0883e"];

    this.addManagedListener(window, "resize", () => this.resize(true));
    this.resize(false);
  }

  addManagedListener(target, type, handler, opts) {
    target.addEventListener(type, handler, opts);
    this._listeners.push({ target, type, handler, opts });
  }

  notifyInteract() {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      if (this.onInteract) this.onInteract();
    }
  }

  resize(shouldRender = true) {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(260, rect.width);
    this.height = Math.max(260, rect.height);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (shouldRender) this.render();
  }

  getPointerPos(evt) {
    const rect = this.canvas.getBoundingClientRect();
    const src = evt.touches && evt.touches[0] ? evt.touches[0] : evt;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top
    };
  }

  bindPointer(onDown, onMove, onUp) {
    const downWrap = (e) => {
      if (e.type === "touchstart") e.preventDefault();
      this.notifyInteract();
      onDown(this.getPointerPos(e), e);
    };
    const moveWrap = (e) => {
      onMove(this.getPointerPos(e), e);
    };
    const upWrap = (e) => {
      if (onUp) onUp(e);
    };

    this.addManagedListener(this.canvas, "mousedown", downWrap);
    this.addManagedListener(window, "mousemove", moveWrap);
    this.addManagedListener(window, "mouseup", upWrap);
    this.addManagedListener(this.canvas, "touchstart", downWrap, { passive: false });
    this.addManagedListener(window, "touchmove", moveWrap, { passive: false });
    this.addManagedListener(window, "touchend", upWrap);
  }

  getThemeColors() {
    const s = getComputedStyle(document.documentElement);
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    return {
      isLight,
      bg: s.getPropertyValue("--bg-sandbox").trim() || (isLight ? "#fafbfc" : "#0b0f14"),
      surface: s.getPropertyValue("--bg-surface").trim() || (isLight ? "#f6f8fa" : "#161b22"),
      border: s.getPropertyValue("--border-default").trim() || (isLight ? "#d0d7de" : "#30363d"),
      grid: s.getPropertyValue("--math-grid").trim() || (isLight ? "#eaeef2" : "#1b222c"),
      axis: s.getPropertyValue("--math-axis").trim() || (isLight ? "#aeb7c2" : "#3b4452"),
      text: s.getPropertyValue("--text-primary").trim() || (isLight ? "#1f2328" : "#e6edf3"),
      secondary: s.getPropertyValue("--text-secondary").trim() || (isLight ? "#59636e" : "#8b949e"),
      muted: s.getPropertyValue("--text-muted").trim() || (isLight ? "#6e7781" : "#6e7681"),
      x: s.getPropertyValue("--math-x").trim() || "#f85149",
      y: s.getPropertyValue("--math-y").trim() || "#3fb950",
      z: s.getPropertyValue("--math-z").trim() || "#58a6ff",
      accent: s.getPropertyValue("--math-accent").trim() || "#e3b341",
      aux: s.getPropertyValue("--math-aux").trim() || "#bc8cff"
    };
  }

  drawGrid(ctx, cx, cy, scale, colors, showLabels = true) {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    const maxCols = Math.ceil(this.width / scale) + 2;
    const maxRows = Math.ceil(this.height / scale) + 2;

    ctx.beginPath();
    for (let i = -maxCols; i <= maxCols; i++) {
      const gx = cx + i * scale;
      if (gx >= 0 && gx <= this.width) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, this.height);
      }
    }
    for (let j = -maxRows; j <= maxRows; j++) {
      const gy = cy + j * scale;
      if (gy >= 0 && gy <= this.height) {
        ctx.moveTo(0, gy);
        ctx.lineTo(this.width, gy);
      }
    }
    ctx.stroke();

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(this.width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.height);
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = colors.muted;
      ctx.font = '11px "SF Mono", Consolas, monospace';
      for (let i = -8; i <= 8; i++) {
        if (i === 0) continue;
        const gx = cx + i * scale;
        if (gx > 20 && gx < this.width - 20) {
          ctx.fillText(String(i), gx - 4, Math.min(this.height - 6, Math.max(14, cy + 14)));
        }
      }
    }
  }

  drawHandle(ctx, x, y, color, label, colors, offsetX = 13, offsetY = -8) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 8.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.bg;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 12.5, 0, Math.PI * 2);
    ctx.strokeStyle = color + "44";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (label) {
      ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const w = ctx.measureText(label).width;
      const lx = Math.min(this.width - w - 14, Math.max(8, x + offsetX));
      const ly = Math.min(this.height - 34, Math.max(20, y + offsetY));
      ctx.fillStyle = colors.isLight ? "rgba(255,255,255,0.88)" : "rgba(13,17,23,0.84)";
      ctx.fillRect(lx - 4, ly - 12, w + 8, 17);
      ctx.fillStyle = color;
      ctx.fillText(label, lx, ly);
    }
    ctx.restore();
  }

  drawArrow(ctx, x1, y1, x2, y2, color, width = 2.6, dashed = false) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 2) return;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(11, len * 0.35);

    ctx.save();
    if (dashed) ctx.setLineDash([5, 4]);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  drawStatusBanner(ctx, text, color, colors) {
    ctx.save();
    ctx.font = '600 12.5px "SF Mono", Consolas, monospace';
    const padX = 12;
    const h = 28;
    const y = this.height - h - 10;
    const w = Math.min(this.width - 24, ctx.measureText(text).width + padX * 2);
    ctx.fillStyle = colors.isLight ? "rgba(255,255,255,0.92)" : "rgba(22,27,34,0.92)";
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    this.roundRect(ctx, 12, y, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color || colors.text;
    ctx.fillText(text, 12 + padX, y + 18, this.width - 48);
    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  getControlsConfig() {
    return [];
  }

  emitState(state) {
    if (this.onStateChange) this.onStateChange(state);
  }

  render() {}

  destroy() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._listeners.forEach(({ target, type, handler, opts }) => {
      target.removeEventListener(type, handler, opts);
    });
    this._listeners = [];
  }
}
