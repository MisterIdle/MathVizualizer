// Ambient Apple-style mesh background + subtle drifting Game Math outlines (Music DNA)
export function mountAmbientLayer() {
  if (document.getElementById("mv-ambient-layer")) return;
  const wrap = document.createElement("div");
  wrap.id = "mv-ambient-layer";
  wrap.className = "apple-ambient-wrap";
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = `
    <div class="apple-ambient-bg"></div>

    <!-- Unit circle + angle (top-left) -->
    <div class="ambient-glyph ambient-g1">
      <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="1.6"/>
        <path d="M6 24h36M24 6v36" stroke="currentColor" stroke-width="1.1" stroke-dasharray="3 3"/>
        <path d="M24 24L37 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="37" cy="12" r="2.6" fill="currentColor"/>
      </svg>
    </div>

    <!-- 3D wireframe cube (top-right) -->
    <div class="ambient-glyph ambient-g2">
      <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
        <polygon points="24,6 40,15 40,33 24,42 8,33 8,15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M24 24V42M24 24L40 15M24 24L8 15" stroke="currentColor" stroke-width="1.3"/>
      </svg>
    </div>

    <!-- Sine wave (mid-left) -->
    <div class="ambient-glyph ambient-g3">
      <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
        <path d="M2 18C9 4 17 4 24 18C31 32 39 32 46 18C49 12 52 9 54 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M2 18h52" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
      </svg>
    </div>

    <!-- Right triangle Pythagoras (mid-right) -->
    <div class="ambient-glyph ambient-g4">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <polygon points="8,38 40,38 8,10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M8 30h8v8" stroke="currentColor" stroke-width="1.3"/>
      </svg>
    </div>

    <!-- 3D axes gizmo (bottom-left) -->
    <div class="ambient-glyph ambient-g5">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 26V8M24 26L40 34M24 26L8 34" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <circle cx="24" cy="26" r="2.5" fill="currentColor"/>
      </svg>
    </div>

    <!-- Cubic Bezier curve (bottom-right) -->
    <div class="ambient-glyph ambient-g6">
      <svg width="54" height="44" viewBox="0 0 54 44" fill="none">
        <path d="M6 36C14 8 40 8 48 36" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M6 36L16 10M48 36L38 10" stroke="currentColor" stroke-width="1.1" stroke-dasharray="3 3"/>
        <circle cx="16" cy="10" r="2.4" fill="currentColor"/>
        <circle cx="38" cy="10" r="2.4" fill="currentColor"/>
      </svg>
    </div>
  `;
  document.body.prepend(wrap);
}
