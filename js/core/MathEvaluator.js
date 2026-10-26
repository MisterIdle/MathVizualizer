export class MathEvaluator {
  static snap(value, step) {
    if (!step || step <= 0) return value;
    return Math.round(value / step) * step;
  }

  static clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  static clamp01(v) {
    return this.clamp(v, 0, 1);
  }

  static deltaAngle(currentDeg, targetDeg) {
    let delta = ((targetDeg - currentDeg) % 360 + 540) % 360 - 180;
    return delta === -180 ? 180 : delta;
  }

  static evaluateTrig(funcId, point, secondPoint, tParam = 0.5) {
    const rad = point.angleRad;
    const deg = point.angleDeg;
    const normX = this.clamp(point.x / Math.max(point.radius, 0.0001), -1, 1);
    const normY = this.clamp(point.y / Math.max(point.radius, 0.0001), -1, 1);
    const deg2 = secondPoint ? secondPoint.angleDeg : 0;

    switch (funcId) {
      case "cos":
        return Math.cos(rad);
      case "sin":
        return Math.sin(rad);
      case "tan":
        return Math.tan(rad);
      case "sincos":
        return { sin: Math.sin(rad), cos: Math.cos(rad) };
      case "acos":
        return Math.acos(normX);
      case "asin":
        return Math.asin(normY);
      case "atan":
        return Math.atan(point.y / (point.x || 0.0001));
      case "atan2":
        return Math.atan2(point.y, point.x);
      case "deg2rad":
        return deg * (Math.PI / 180);
      case "rad2deg":
        return rad * (180 / Math.PI);
      case "deltaangle":
        return this.deltaAngle(deg, deg2);
      case "lerpangle":
        return deg + this.deltaAngle(deg, deg2) * this.clamp01(tParam);
      case "movetowardsangle": {
        const diff = this.deltaAngle(deg, deg2);
        const maxDelta = tParam * 180;
        if (Math.abs(diff) <= maxDelta) return deg2;
        return deg + Math.sign(diff) * maxDelta;
      }
      default:
        return Math.cos(rad);
    }
  }

  static evaluate1D(funcId, x, params = {}) {
    const a = params.a !== undefined ? params.a : 1;
    const b = params.b !== undefined ? params.b : 1;

    switch (funcId) {
      case "euclide":
        const modulo = Math.abs(a) < 0.001 ? 1 : a;
        let r = x % modulo;
        return r < 0 ? r + modulo : r;
      case "lerp":
        return a + (b - a) * this.clamp01(x);
      case "lerpunclamped":
        return a + (b - a) * x;
      case "inverselerp":
        return Math.abs(b - a) < 1e-5 ? 0 : this.clamp01((x - a) / (b - a));
      case "smoothstep": {
        const t = this.clamp01(x);
        const s = t * t * (3 - 2 * t);
        return a + (b - a) * s;
      }
      case "movetowards": {
        const diff = a - x;
        if (Math.abs(diff) <= b) return a;
        return x + Math.sign(diff) * b;
      }
      case "smoothdamp": {
        const smoothTime = Math.max(0.01, b);
        const factor = 1 - Math.exp(-Math.max(0, x) / smoothTime);
        return a * factor;
      }
      case "clamp":
        return this.clamp(x, Math.min(a, b), Math.max(a, b));
      case "clamp01":
        return this.clamp01(x);
      case "repeat": {
        const len = Math.max(0.1, a);
        return x - Math.floor(x / len) * len;
      }
      case "pingpong": {
        const len = Math.max(0.1, a);
        const rem = x - Math.floor(x / (len * 2)) * (len * 2);
        return len - Math.abs(rem - len);
      }
      case "abs":
        return Math.abs(x);
      case "sign":
        return x >= 0 ? 1 : -1;
      case "copysign":
        return Math.abs(x) * (a >= 0 ? 1 : -1);
      case "floor":
        return Math.floor(x);
      case "ceil":
        return Math.ceil(x);
      case "round":
        return Math.round(x);
      case "truncate":
        return Math.trunc(x);
      case "sqrt":
        return x < 0 ? 0 : Math.sqrt(x);
      case "cbrt":
        return Math.cbrt(x);
      case "pow":
        return x < 0 && a % 1 !== 0 ? 0 : Math.pow(x, a);
      case "exp":
        return Math.exp(this.clamp(x, -5, 3));
      case "log":
        return x <= 0.01 ? -4 : Math.log(x);
      case "log10":
        return x <= 0.01 ? -2 : Math.log10(x);
      case "log2":
        return x <= 0.01 ? -4 : Math.log2(x);
      case "sinh":
        if (Math.round(a) === 1) return Math.sinh(this.clamp(x, -2.5, 2.5));
        if (Math.round(a) === 2) return Math.cosh(this.clamp(x, -2.5, 2.5));
        return Math.tanh(x);
      case "min":
        return Math.round(b) === 0 ? Math.min(x, a) : Math.max(x, a);
      case "approximately":
        return Math.abs(x - a) <= b ? 1 : 0;
      case "poweroftwo": {
        const v = Math.max(1, Math.round(Math.abs(x) * 4));
        const lg = Math.log2(v);
        const exp = Math.round(a) === 0 ? Math.round(lg) : Math.ceil(lg);
        return Math.pow(2, exp) / 4;
      }
      case "gamma": {
        const v = this.clamp01(x);
        return Math.round(a) === 0 ? Math.pow(v, 2.2) : Math.pow(v, 1 / 2.2);
      }
      case "fma":
        return x * a + b;
      case "ieeeremainder": {
        const div = Math.max(0.2, a);
        return x - div * Math.round(x / div);
      }
      default:
        return x;
    }
  }

  static perlin2D(x, y) {
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => a + t * (b - a);
    const hash = (ix, iy) => {
      const h = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123;
      return (h - Math.floor(h)) * Math.PI * 2;
    };
    const grad = (ix, iy, dx, dy) => {
      const angle = hash(ix, iy);
      return Math.cos(angle) * dx + Math.sin(angle) * dy;
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
    return this.clamp01(lerp(nx0, nx1, v) * 0.7 + 0.5);
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
}