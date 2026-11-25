export class MathEvaluator {
  static clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  static clamp01(v) {
    return this.clamp(v, 0, 1);
  }

  static lerp(a, b, t) {
    return a + (b - a) * this.clamp01(t);
  }

  static lerpUnclamped(a, b, t) {
    return a + (b - a) * t;
  }

  static inverseLerp(a, b, v) {
    if (Math.abs(b - a) < 1e-6) return 0;
    return this.clamp01((v - a) / (b - a));
  }

  static repeat(t, len) {
    const l = Math.max(1e-4, len);
    return t - Math.floor(t / l) * l;
  }

  static pingPong(t, len) {
    const l = Math.max(1e-4, len);
    const r = this.repeat(t, l * 2);
    return l - Math.abs(r - l);
  }

  static deltaAngle(currentDeg, targetDeg) {
    let delta = (((targetDeg - currentDeg) % 360) + 540) % 360 - 180;
    return delta === -180 ? 180 : delta;
  }

  static smoothStep(t) {
    const u = this.clamp01(t);
    return u * u * (3 - 2 * u);
  }

  static smootherStep(t) {
    const u = this.clamp01(t);
    return u * u * u * (u * (u * 6 - 15) + 10);
  }

  static evaluateEasing(mode, t) {
    const u = this.clamp01(t);
    switch (Math.round(mode)) {
      case 0: // EaseOutCubic
        return 1 - Math.pow(1 - u, 3);
      case 1: // EaseInOutCubic
        return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      case 2: { // EaseOutBack
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
      }
      case 3: { // EaseOutElastic
        if (u === 0 || u === 1) return u;
        const c4 = (2 * Math.PI) / 3;
        return Math.pow(2, -10 * u) * Math.sin((u * 10 - 0.75) * c4) + 1;
      }
      case 4: { // EaseOutBounce
        const n1 = 7.5625;
        const d1 = 2.75;
        if (u < 1 / d1) return n1 * u * u;
        if (u < 2 / d1) { const k = u - 1.5 / d1; return n1 * k * k + 0.75; }
        if (u < 2.5 / d1) { const k = u - 2.25 / d1; return n1 * k * k + 0.9375; }
        const k = u - 2.625 / d1;
        return n1 * k * k + 0.984375;
      }
      default:
        return u;
    }
  }

  static evaluate1D(mode, x, params = {}) {
    const a = params.a !== undefined ? params.a : 1;
    const b = params.b !== undefined ? params.b : 1;

    switch (mode) {
      case "abs":
        return Math.abs(x);
      case "clamp":
        return this.clamp(x, Math.min(a, b), Math.max(a, b));
      case "round": {
        const step = Math.max(0.1, b);
        const m = Math.round(a);
        if (m === 1) return Math.floor(x / step) * step;
        if (m === 2) return Math.ceil(x / step) * step;
        return Math.round(x / step) * step;
      }
      case "repeat":
        return this.repeat(x, a);
      case "pingpong":
        return this.pingPong(x, a);
      case "pow": {
        const m = Math.round(b);
        if (m === 1) return x <= 0.05 ? -3 : Math.log(x);
        if (m === 2) return Math.exp(this.clamp(x, -4, 2.2));
        return x < 0 && a % 1 !== 0 ? 0 : Math.pow(Math.max(-3.5, Math.min(3.5, x)), a);
      }
      case "approximately":
        return Math.abs(x - a) <= b ? 1 : 0;
      case "lerp":
        return a + (b - a) * this.clamp01(x);
      case "inverselerp":
        return this.inverseLerp(a, b, x);
      case "smoothstep": {
        const s = this.smoothStep(x);
        return a + (b - a) * s;
      }
      case "easing":
        return this.evaluateEasing(a, x);
      case "movetowards": {
        const diff = a - x;
        if (Math.abs(diff) <= b) return a;
        return x + Math.sign(diff) * b;
      }
      case "expdamp": {
        const t = Math.max(0, x);
        return 1 - Math.exp(-a * t);
      }
      case "gaussian": {
        const std = Math.max(0.1, b);
        const factor = 1 / (std * Math.sqrt(2 * Math.PI));
        return factor * Math.exp(-0.5 * Math.pow((x - a) / std, 2));
      }
      case "balance": {
        const k = Math.max(10, a);
        const modeB = Math.round(b);
        const input = Math.max(0, x * 100);
        if (modeB === 1) {
          const lvl = Math.max(1, x * 10);
          return 0.1 * Math.pow(lvl, 1.85) / 10;
        }
        return k / (k + input);
      }
      default:
        return x;
    }
  }

  static evaluateTrig(mode, point, secondPoint, tParam = 0.5) {
    const rad = point.angleRad;
    const deg = point.angleDeg;
    const normX = this.clamp(point.x / Math.max(point.radius, 1e-4), -1, 1);
    const normY = this.clamp(point.y / Math.max(point.radius, 1e-4), -1, 1);
    const deg2 = secondPoint ? secondPoint.angleDeg : 0;

    switch (mode) {
      case "cos": return Math.cos(rad);
      case "sin": return Math.sin(rad);
      case "tan": return Math.tan(rad);
      case "sincos": return { sin: Math.sin(rad), cos: Math.cos(rad) };
      case "acos": return Math.acos(normX);
      case "asin": return Math.asin(normY);
      case "atan": return Math.atan(point.y / (point.x || 1e-4));
      case "atan2": return Math.atan2(point.y, point.x);
      case "deltaangle": return this.deltaAngle(deg, deg2);
      case "lerpangle": return deg + this.deltaAngle(deg, deg2) * this.clamp01(tParam);
      default: return Math.cos(rad);
    }
  }

  // Fast deterministic Squirrel3 hash (32-bit unsigned)
  static squirrel3(pos, seed = 0) {
    let h = Math.imul(pos | 0, 0xb5297a4d) >>> 0;
    h = (h + (seed >>> 0)) >>> 0;
    h ^= h >>> 8;
    h = (h + 0x68e31da4) >>> 0;
    h ^= h << 8;
    h = Math.imul(h, 0x1b56c4e9) >>> 0;
    h ^= h >>> 8;
    return h >>> 0;
  }

  static hash2D(ix, iy, seed = 1337) {
    return this.squirrel3((ix | 0) + Math.imul(iy | 0, 198491317), seed) / 4294967295;
  }

  static perlin2D(x, y, seed = 42) {
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => a + t * (b - a);
    const grad = (ix, iy, dx, dy) => {
      const a = this.hash2D(ix, iy, seed) * Math.PI * 2;
      return Math.cos(a) * dx + Math.sin(a) * dy;
    };

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const dx = x - x0;
    const dy = y - y0;
    const u = fade(dx);
    const v = fade(dy);

    const n00 = grad(x0, y0, dx, dy);
    const n10 = grad(x0 + 1, y0, dx - 1, dy);
    const n01 = grad(x0, y0 + 1, dx, dy - 1);
    const n11 = grad(x0 + 1, y0 + 1, dx - 1, dy - 1);

    const nx0 = lerp(n00, n10, u);
    const nx1 = lerp(n01, n11, u);
    return this.clamp01(lerp(nx0, nx1, v) * 0.72 + 0.5);
  }

  static fbm2D(x, y, octaves = 4, lacunarity = 2.0, persistence = 0.5, ridged = false, seed = 42) {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let maxAmp = 0;
    for (let i = 0; i < octaves; i++) {
      let n = this.perlin2D(x * freq, y * freq, seed + i * 97);
      if (ridged) {
        const r = 1 - Math.abs(n * 2 - 1);
        n = r * r;
      }
      sum += n * amp;
      maxAmp += amp;
      freq *= lacunarity;
      amp *= persistence;
    }
    return maxAmp > 0 ? sum / maxAmp : 0.5;
  }

  static kelvinToRGB(kelvin) {
    const temp = this.clamp(kelvin, 1000, 40000) / 100;
    let r, g, b;
    if (temp <= 66) {
      r = 255;
      g = 99.4708025861 * Math.log(temp) - 161.1195681661;
      b = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
    } else {
      r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
      g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
      b = 255;
    }
    return {
      r: this.clamp01(r / 255),
      g: this.clamp01(g / 255),
      b: this.clamp01(b / 255)
    };
  }

  static hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    const sector = Math.floor(h * 6) % 6;
    if (sector === 0) [r, g, b] = [c, x, 0];
    else if (sector === 1) [r, g, b] = [x, c, 0];
    else if (sector === 2) [r, g, b] = [0, c, x];
    else if (sector === 3) [r, g, b] = [0, x, c];
    else if (sector === 4) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return { r: r + m, g: g + m, b: b + m };
  }
}
