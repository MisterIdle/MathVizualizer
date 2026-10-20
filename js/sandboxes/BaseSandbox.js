export class BaseSandbox {
  constructor(canvas, funcItem, onStateChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.funcItem = funcItem;
    this.onStateChange = onStateChange;
    this.width = 100;
    this.height = 100;
    this.palette = ["#4cc2ff", "#ff6b6b", "#51cf66", "#fcc419", "#cc5de8", "#ff922b"];

    this.handleResize = this.resize.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  getMousePos(evt) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      bg: style.getPropertyValue("--bg-canvas").trim() || "#141414",
      grid: style.getPropertyValue("--grid-line").trim() || "#262626",
      axis: style.getPropertyValue("--grid-axis").trim() || "#525252",
      text: style.getPropertyValue("--text-primary").trim() || "#f3f2f1",
      muted: style.getPropertyValue("--text-muted").trim() || "#8a8886",
      colorX: style.getPropertyValue("--color-x").trim() || "#ff6b6b",
      colorY: style.getPropertyValue("--color-y").trim() || "#51cf66",
      colorZ: style.getPropertyValue("--color-z").trim() || "#4dabf7"
    };
  }

  emitState(state) {
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  render() {}

  destroy() {
    window.removeEventListener("resize", this.handleResize);
  }
}