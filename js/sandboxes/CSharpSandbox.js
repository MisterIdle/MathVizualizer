/**
 * Moteur C# Sandbox 2D/3D Temps Réel pour Math Vizualizer
 * Ajouts : Transpilateur Mathématique Profond (Parenthèses équilibrées, anti-crash), Autocomplétion, Vector3 statiques
 */

const BLANK_CODE = `// Page blanche — Code ici comme dans Unity !
// Glisse les points à la souris sur le visualiseur pour mettre à jour les valeurs.

Vector3 Joueur = new Vector3(-2, 1, 0);
Joueur.name = "Joueur";

Vector3 Cible = new Vector3(2, 0, 1.5);
Cible.name = "Cible";

// Trace automatiquement la ligne de direction
Vector3 direction = Cible.position - Joueur.position;
direction.name = "Direction";
`;

const EXAMPLES_LIST = [
  {
    id: "sincos",
    badge: "1. Trigonométrie",
    title: "Cercle SinCos (Paramétrique)",
    desc: "Calcul paramétrique x/y avec Centre, Cosinus, Sinus et Rayon dynamique.",
    code: `Vector3 Centre = new Vector3(-2.5, -1.0, 0);
Centre.name = "Origine";

float rayon = 2.0;
float vitesse = 2.0;
float angle = Time.time * vitesse;

// Calcul paramétrique parfait géré par le nouveau transpilateur
float x = Centre.x + Mathf.Cos(angle) * rayon;
float y = Centre.y + Mathf.Sin(angle) * rayon;

Vector3 Pos = new Vector3(x, y, 0);
Pos.name = "SinCos";
Pos.color = "#cc5de8";

DrawLine(Centre, Pos, "#cc5de8");`
  },
  {
    id: "directions",
    badge: "2. Vecteurs & Rotation",
    title: "Directions, Rotation & Rebond",
    desc: "Utilisation de Vector3.forward, rotation d'un vecteur avec un Quaternion, et rebond avec Vector3.Reflect.",
    code: `Vector3 Centre = Vector3.zero;
Centre.name = "Origine";

// Utilisation de la direction native (Z positif)
Vector3 baseDir = Vector3.forward * 2.5;

// Rotation du vecteur autour de l'axe Y (Haut) via Quaternion
Quaternion rot = Quaternion.AngleAxis(Time.time * 45, Vector3.up);
Vector3 radar = rot * baseDir;
radar.name = "Radar (Rotatif)";

// Réflexion sur un "Mur" (Normale orientée vers la gauche -X)
Vector3 normaleMur = Vector3.left;
Vector3 rebond = Vector3.Reflect(radar, normaleMur);
rebond.name = "Rebond";
rebond.color = "#fcc419";

DrawLine(Centre, radar, "#4cc2ff");
DrawLine(radar, radar + rebond, "#fcc419");`
  },
  {
    id: "cube3d",
    badge: "2. Quaternions & Gimbal",
    title: "Cube 3D & Angles d'Euler",
    desc: "Manipulation d'un Cube 3D via Quaternion.Euler(Pitch, Yaw, Roll) avec ses anneaux de rotation.",
    code: `// Quaternions & Cube 3D (Lié aux sliders Pitch/Yaw/Roll !)
Quaternion rot = Quaternion.Euler(Pitch, Yaw, Roll);
rot.name = "Cube 3D";

Vector3 Joueur = new Vector3(-2.5, 1.2, -1.5);
Joueur.name = "Joueur";

Vector3 Cible = new Vector3(2.5, 1.8, 2.0);
Cible.name = "Cible";

Vector3 visee = Cible.position - Joueur.position;
visee.name = "Visée";

float wave = Mathf.Sin(Time.time * 2.0) * 1.5;
Vector3 satellite = new Vector3(Mathf.Cos(Time.time) * 3, wave + 1.5, Mathf.Sin(Time.time) * 3);
satellite.name = "Satellite";

if (visee.magnitude > 5.0) {
    Joueur.color = "#ff6b6b";
} else {
    Joueur.color = "#51cf66";
}`
  },
  {
    id: "alkashi",
    badge: "3. Repères & IK",
    title: "Al-Kashi (Inverse Kinematics)",
    desc: "Bras articulé à deux segments calculé géométriquement par la loi des cosinus pour suivre une cible.",
    code: `Vector3 Epaule = new Vector3(-2.0, 0.0, 0.0);
Epaule.name = "Épaule";

Vector3 Main = new Vector3(1.8, 1.8, 0.0);
Main.name = "Main (Glisse-moi)";

Vector3 Coude = Mathf.AlKashi(Epaule, Main, 2.2, 2.0);
Coude.name = "Coude";

Vector3 Sol = new Vector3(3.0, 0.0, 0.0);
Vector3 proj = Mathf.ProjeteOrthogonal(Main, Sol);
proj.name = "Ombre sol";
DrawLine(Main, proj, "#fcc419");`
  },
  {
    id: "bezier",
    badge: "4. Algèbre & Courbes",
    title: "Courbe de Bézier Cubique",
    desc: "Polynôme de Bernstein à quatre points de contrôle avec parcours temporel d'une bille via PingPong.",
    code: `Vector3 P0 = new Vector3(-3.5, 0.0, 0.0);
P0.name = "P0 (Départ)";

Vector3 P1 = new Vector3(-1.8, 3.2, -1.0);
P1.name = "P1 (Contrôle)";

Vector3 P2 = new Vector3(1.8, 2.8, 1.0);
P2.name = "P2 (Contrôle)";

Vector3 P3 = new Vector3(3.5, 0.5, 0.0);
P3.name = "P3 (Arrivée)";

float t = Mathf.PingPong(Time.time * 0.6, 1.0);
Vector3 bille = Mathf.Bezier(P0, P1, P2, P3, t);
bille.name = "Bille Bézier";
bille.color = "#fcc419";`
  },
  {
    id: "physique",
    badge: "4. Physique Balistique",
    title: "Tir à l'arc (Parabole)",
    desc: "Simulation de trajectoire sous gravité avec projection de la flèche animée dans le temps.",
    code: `Vector3 Depart = new Vector3(-3.5, -1.0, 0.0);
Depart.name = "Archer";

Vector3 VitesseInitiale = new Vector3(3.2, 5.0, 0.0);

Vector3 fleche = Mathf.TirArc(Depart, VitesseInitiale, 9.81, Time.time);
fleche.name = "Flèche";
fleche.color = "#ff6b6b";`
  }
];

const AUTOCOMPLETE_CATALOG = [
  { label: "Vector3", insert: "Vector3 v = new Vector3(0, 1, 0);", kind: "Struct" },
  { label: "Vector2", insert: "Vector2 v = new Vector2(0, 0);", kind: "Struct" },
  { label: "Quaternion", insert: "Quaternion rot = Quaternion.Euler(20, 35, 10);", kind: "Struct" },
  { label: "if / else", insert: "if (condition) {\n    \n} else {\n    \n}", kind: "Keyword" },
  { label: "switch / case", insert: "switch (valeur) {\n    case 1:\n        break;\n    default:\n        break;\n}", kind: "Keyword" },
  { label: "return", insert: "return ", kind: "Keyword" },
  { label: "Time.time", insert: "Time.time", kind: "Time" },
  { label: "DrawLine()", insert: 'DrawLine(VectorA, VectorB, "#4cc2ff");', kind: "Draw" }
];

const SANDBOX_STYLES = `
<style>
  .cs-live-workspace { display: grid; grid-template-columns: minmax(380px, 1fr) minmax(440px, 1.15fr); gap: 18px; align-items: stretch; }
  @media (max-width: 1100px) { .cs-live-workspace { grid-template-columns: 1fr; } }
  .cs-editor-panel { display: flex; flex-direction: column; border: 1px solid var(--border-color); border-radius: 6px; background-color: #141414; overflow: hidden; box-shadow: var(--shadow-sm); }
  .cs-code-container { position: relative; flex: 1; min-height: 480px; background-color: #141414; overflow: hidden; }
  .cs-highlight-backdrop, .cs-textarea-overlay { position: absolute; inset: 0; margin: 0; padding: 16px; font-family: "Cascadia Code", Consolas, "Courier New", monospace; font-size: 13.5px; line-height: 1.6; tab-size: 4; white-space: pre-wrap; word-wrap: break-word; border: none; box-sizing: border-box; }
  .cs-highlight-backdrop { z-index: 1; color: #d4d4d4; overflow-y: auto; pointer-events: none; }
  .cs-textarea-overlay { z-index: 2; background: transparent; color: transparent; caret-color: #ffffff; resize: none; outline: none; overflow-y: auto; }
  .cs-textarea-overlay::selection { background-color: rgba(76, 194, 255, 0.28); color: transparent; }

  /* Couleurs C# officielles */
  .cs-hl-comment  { color: #6a9955; font-style: italic; }
  .cs-hl-keyword  { color: #569cd6; font-weight: 600; }
  .cs-hl-control  { color: #c586c0; font-weight: 600; }
  .cs-hl-type     { color: #4ec9b0; font-weight: 600; }
  .cs-hl-func     { color: #dcdcaa; }
  .cs-hl-string   { color: #ce9178; }
  .cs-hl-number   { color: #b5cea8; }
  .cs-hl-prop     { color: #9cdcfe; }

  .cs-sliders-bar { display: flex; flex-wrap: wrap; gap: 14px; padding: 10px 16px; background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color); align-items: center; }
  .cs-slider-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
  .cs-slider-item input[type="range"] { width: 100px; accent-color: #0078d4; cursor: pointer; }

  .cs-example-card { background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; transition: border-color 0.15s, transform 0.15s; }
  .cs-example-card:hover { border-color: var(--accent-primary); transform: translateY(-2px); }
</style>
`;

export function renderCSharpSandbox(container) {
  container.innerHTML = SANDBOX_STYLES + `
    <header class="ms-article-header">
      <h1 class="ms-article-title">Page Blanche — Laboratoire C# / Unity 2D & 3D</h1>
      <div class="ms-badge-row">
        <span class="ms-badge">Page Blanche Vierge</span>
        <span class="ms-badge">Vue 3D Orbitale & 2D</span>
        <span class="ms-badge">Ctrl + Espace Contextuel</span>
      </div>
      <p class="ms-article-summary">
        Codez librement en C#. Tapez <code>.</code> après un vecteur puis <b>Ctrl + Espace</b> pour voir ses propriétés.
      </p>
    </header>

    <section class="ms-section">
      <div class="cs-live-workspace">
        <div class="cs-editor-panel">
          <div class="ms-code-header" style="gap: 8px; flex-wrap: wrap;">
            <span>Code C# (Page Blanche)</span>
            <button id="cs-clear-code" class="ms-btn" type="button">🧹 Effacer (Page Blanche)</button>
          </div>

          <div class="cs-code-container">
            <div id="cs-highlight-backdrop" class="cs-highlight-backdrop" aria-hidden="true"></div>
            <textarea id="cs-code-input" class="cs-textarea-overlay" spellcheck="false" autocomplete="off" autocapitalize="off">${BLANK_CODE}</textarea>
            <ul id="cs-autocomplete-list" class="cs-autocomplete"></ul>
          </div>
          <div id="cs-status" class="cs-status-bar">✓ Compilation C# temps réel active</div>
        </div>

        <div class="ms-sandbox-card" style="display:flex; flex-direction:column;">
          <div class="ms-sandbox-toolbar">
            <button id="cs-mode-btn" class="ms-btn ms-btn-accent" type="button">🧊 Mode : Vue 3D</button>
            <button id="cs-reset-cam" class="ms-btn" type="button">Réinitialiser Caméra</button>
            <button id="cs-play-btn" class="ms-btn" type="button">⏸ Pause</button>
            <button id="cs-reset-time" class="ms-btn ms-btn-ghost" type="button">↺ Time=0</button>
            <div class="ms-control-group" style="margin-left:auto;">
              <span id="cs-time-val" class="ms-control-value">0.00s</span>
            </div>
          </div>

          <div class="cs-sliders-bar">
            <div class="cs-slider-item"><label>Pitch X (°)</label><input type="range" id="cs-pitch" min="-180" max="180" value="20"><span id="cs-pitch-val" class="ms-control-value">20</span></div>
            <div class="cs-slider-item"><label>Yaw Y (°)</label><input type="range" id="cs-yaw" min="-180" max="180" value="35"><span id="cs-yaw-val" class="ms-control-value">35</span></div>
            <div class="cs-slider-item"><label>Roll Z (°)</label><input type="range" id="cs-roll" min="-180" max="180" value="10"><span id="cs-roll-val" class="ms-control-value">10</span></div>
          </div>

          <div class="ms-canvas-container" style="flex:1; min-height:450px;">
            <canvas id="cs-live-canvas"></canvas>
          </div>

          <div class="ms-sandbox-footer">
            <span>🖱️ Glisser un point = réécrit ses coordonnées | Shift + Glisser = hauteur Y</span>
            <span>Glisser le vide = tourner la vue | Molette = Zoom</span>
          </div>
        </div>
      </div>
    </section>

    <section class="ms-section">
      <h2 class="ms-section-title">Points & Variables en direct</h2>
      <table class="ms-table">
        <thead>
          <tr><th>Variable</th><th>Nom (.name)</th><th>Type</th><th>Coordonnées (X, Y, Z / Euler)</th><th>Magnitude</th></tr>
        </thead>
        <tbody id="cs-vectors-tbody"></tbody>
      </table>
    </section>

    <section class="ms-section">
      <h2 class="ms-section-title">Exemples Prêts à l'Emploi</h2>
      <div class="ms-examples-grid">
        ${EXAMPLES_LIST.map((ex) => `
          <div class="cs-example-card">
            <div>
              <span class="ms-badge" style="margin-bottom: 8px;">${ex.badge}</span>
              <h3 class="ms-example-title">${ex.title}</h3>
              <p class="ms-example-desc">${ex.desc}</p>
            </div>
            <button class="ms-btn ms-btn-accent cs-load-example-btn" data-id="${ex.id}" style="margin-top: 14px;" type="button">
              ⚡ Charger cet exemple
            </button>
          </div>
        `).join("")}
      </div>
    </section>
  `;

  return initEngine();
}

function initEngine() {
  const textarea = document.getElementById("cs-code-input");
  const backdrop = document.getElementById("cs-highlight-backdrop");
  const statusEl = document.getElementById("cs-status");
  const acList = document.getElementById("cs-autocomplete-list");
  const canvas = document.getElementById("cs-live-canvas");
  const ctx = canvas.getContext("2d");

  const clearBtn = document.getElementById("cs-clear-code");
  const modeBtn = document.getElementById("cs-mode-btn");
  const resetCamBtn = document.getElementById("cs-reset-cam");
  const playBtn = document.getElementById("cs-play-btn");
  const resetTimeBtn = document.getElementById("cs-reset-time");
  const timeValEl = document.getElementById("cs-time-val");
  const tbody = document.getElementById("cs-vectors-tbody");

  const pitchInput = document.getElementById("cs-pitch");
  const yawInput = document.getElementById("cs-yaw");
  const rollInput = document.getElementById("cs-roll");

  let animationFrameId = null;
  let isPlaying = true;
  let is3DMode = true;
  let elapsedTime = 0;
  let lastTimestamp = performance.now();

  let camYaw = -0.65, camPitch = 0.42, scale = 52, panX = 0, panY = 15;
  let draggedVarName = null, isOrbiting = false, lastMouseX = 0, lastMouseY = 0;
  let currentObjects = [], currentLines = [], currentCurves = [];

  // ==========================================
  // COLORATION SYNTAXIQUE (TOKENIZER)
  // ==========================================
  const CSHARP_TOKEN_REGEX = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("[^"\n]*")|\b(if|else|switch|case|default|new|float|int|double|bool|string|void|var|true|false|null)\b|\b(return|break|continue|for|while|foreach)\b|\b(Vector2|Vector3|Quaternion|Mathf|Time)\b|\b([a-zA-Z_]\w*)(?=\s*\()|\.([a-zA-Z_]\w*)|\b(\d+(?:\.\d+)?)f?\b/g;

  function escapeHtml(str) { return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function highlight(code) {
    let out = "", last = 0;
    CSHARP_TOKEN_REGEX.lastIndex = 0;
    let m;
    while ((m = CSHARP_TOKEN_REGEX.exec(code)) !== null) {
      if (m.index > last) out += escapeHtml(code.slice(last, m.index));
      const [full, comment, str, kwBlue, kwPink, typeName, funcName, propName, num] = m;
      if (comment !== undefined) out += `<span class="cs-hl-comment">${escapeHtml(comment)}</span>`;
      else if (str !== undefined) out += `<span class="cs-hl-string">${escapeHtml(str)}</span>`;
      else if (kwBlue !== undefined) out += `<span class="cs-hl-keyword">${escapeHtml(kwBlue)}</span>`;
      else if (kwPink !== undefined) out += `<span class="cs-hl-control">${escapeHtml(kwPink)}</span>`;
      else if (typeName !== undefined) out += `<span class="cs-hl-type">${escapeHtml(typeName)}</span>`;
      else if (funcName !== undefined) out += `<span class="cs-hl-func">${escapeHtml(funcName)}</span>`;
      else if (propName !== undefined) out += `.<span class="cs-hl-prop">${escapeHtml(propName)}</span>`;
      else if (num !== undefined) out += `<span class="cs-hl-number">${escapeHtml(num)}</span>`;
      else out += escapeHtml(full);
      last = CSHARP_TOKEN_REGEX.lastIndex;
    }
    if (last < code.length) out += escapeHtml(code.slice(last));
    if (code.endsWith("\n")) out += "\n";
    backdrop.innerHTML = out;
  }

  textarea.addEventListener("input", () => highlight(textarea.value));
  textarea.addEventListener("scroll", () => { backdrop.scrollTop = textarea.scrollTop; backdrop.scrollLeft = textarea.scrollLeft; });
  highlight(textarea.value);

  clearBtn.addEventListener("click", () => { textarea.value = BLANK_CODE; elapsedTime = 0; highlight(textarea.value); });
  document.querySelectorAll(".cs-load-example-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ex = EXAMPLES_LIST.find((e) => e.id === btn.dataset.id);
      if (ex) { textarea.value = ex.code; elapsedTime = 0; highlight(textarea.value); window.scrollTo({ top: 0, behavior: "smooth" }); }
    });
  });

  [pitchInput, yawInput, rollInput].forEach((inp) => {
    inp.addEventListener("input", () => {
      document.getElementById("cs-pitch-val").textContent = pitchInput.value;
      document.getElementById("cs-yaw-val").textContent = yawInput.value;
      document.getElementById("cs-roll-val").textContent = rollInput.value;
    });
  });

  modeBtn.addEventListener("click", () => { is3DMode = !is3DMode; modeBtn.textContent = is3DMode ? "🧊 Mode : Vue 3D" : "📐 Mode : Vue 2D"; });
  resetCamBtn.addEventListener("click", () => { camYaw = -0.65; camPitch = 0.42; scale = 52; panX = 0; panY = 15; });
  playBtn.addEventListener("click", () => { isPlaying = !isPlaying; playBtn.textContent = isPlaying ? "⏸ Pause" : "▶ Lecture"; });
  resetTimeBtn.addEventListener("click", () => { elapsedTime = 0; });

  // ==========================================
  // MOCK TYPES UNITY C# (AVEC DIRECTIONS STATICS)
  // ==========================================
  class UnityVector2 {
    constructor(x = 0, y = 0, varName = "") { this.x = Number(x) || 0; this.y = Number(y) || 0; this.z = 0; this._varName = varName; this.name = ""; this.color = null; this.type = "Vector2"; }
    get position() { return this; }
    set position(v) { if (v) { this.x = Number(v.x) || 0; this.y = Number(v.y) || 0; } }
    get magnitude() { return Math.hypot(this.x, this.y); }
    get sqrMagnitude() { return this.x * this.x + this.y * this.y; }
    get normalized() { const m = this.magnitude; return m > 1e-6 ? new UnityVector2(this.x / m, this.y / m) : new UnityVector2(0, 0); }
    
    static get zero() { return new UnityVector2(0, 0); }
    static get one() { return new UnityVector2(1, 1); }
    static get up() { return new UnityVector2(0, 1); }
    static get down() { return new UnityVector2(0, -1); }
    static get right() { return new UnityVector2(1, 0); }
    static get left() { return new UnityVector2(-1, 0); }
    
    static Distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    static Dot(a, b) { return a.x * b.x + a.y * b.y; }
    static Lerp(a, b, t) { const c = Math.max(0, Math.min(1, t)); return new UnityVector2(a.x + (b.x - a.x) * c, a.y + (b.y - a.y) * c); }
    static Angle(from, to) {
      const den = Math.sqrt(from.sqrMagnitude * to.sqrMagnitude);
      if (den < 1e-15) return 0;
      return Math.acos(Math.max(-1, Math.min(1, UnityVector2.Dot(from, to) / den))) * (180 / Math.PI);
    }
    static Reflect(inDir, inNormal) {
      const n = inNormal.normalized;
      const factor = -2 * UnityVector2.Dot(n, inDir);
      return new UnityVector2(factor * n.x + inDir.x, factor * n.y + inDir.y);
    }
  }

  class UnityVector3 {
    constructor(x = 0, y = 0, z = 0, varName = "") { this.x = Number(x) || 0; this.y = Number(y) || 0; this.z = Number(z) || 0; this._varName = varName; this.name = ""; this.color = null; this.type = "Vector3"; }
    get position() { return this; }
    set position(v) { if (v) { this.x = Number(v.x) || 0; this.y = Number(v.y) || 0; this.z = Number(v.z) || 0; } }
    get magnitude() { return Math.hypot(this.x, this.y, this.z); }
    get sqrMagnitude() { return this.x * this.x + this.y * this.y + this.z * this.z; }
    get normalized() { const m = this.magnitude; return m > 1e-6 ? new UnityVector3(this.x / m, this.y / m, this.z / m) : new UnityVector3(0, 0, 0); }
    
    static get zero() { return new UnityVector3(0, 0, 0); }
    static get one() { return new UnityVector3(1, 1, 1); }
    static get up() { return new UnityVector3(0, 1, 0); }
    static get down() { return new UnityVector3(0, -1, 0); }
    static get right() { return new UnityVector3(1, 0, 0); }
    static get left() { return new UnityVector3(-1, 0, 0); }
    static get forward() { return new UnityVector3(0, 0, 1); }
    static get back() { return new UnityVector3(0, 0, -1); }
    
    static Dot(a, b) { return a.x * b.x + a.y * b.y + (a.z || 0) * (b.z || 0); }
    static Cross(a, b) { const az = a.z || 0, bz = b.z || 0; return new UnityVector3(a.y * bz - az * b.y, az * b.x - a.x * bz, a.x * b.y - a.y * b.x); }
    static Project(v, on) { const sqr = UnityVector3.Dot(on, on); if (sqr < 1e-6) return new UnityVector3(0, 0, 0); const dot = UnityVector3.Dot(v, on) / sqr; return new UnityVector3(on.x * dot, on.y * dot, (on.z || 0) * dot); }
    static Distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)); }
    static Lerp(a, b, t) { const c = Math.max(0, Math.min(1, t)); return new UnityVector3(a.x + (b.x - a.x) * c, a.y + (b.y - a.y) * c, (a.z || 0) + ((b.z || 0) - (a.z || 0)) * c); }
    
    static Angle(from, to) {
      const den = Math.sqrt(from.sqrMagnitude * to.sqrMagnitude);
      if (den < 1e-15) return 0;
      return Math.acos(Math.max(-1, Math.min(1, UnityVector3.Dot(from, to) / den))) * (180 / Math.PI);
    }
    static SignedAngle(from, to, axis) {
      const angle = UnityVector3.Angle(from, to);
      const sign = Math.sign(UnityVector3.Dot(axis, UnityVector3.Cross(from, to)));
      return angle * (sign === 0 ? 1 : sign);
    }
    static Reflect(inDir, inNormal) {
      const n = inNormal.normalized;
      const factor = -2 * UnityVector3.Dot(n, inDir);
      return new UnityVector3(factor * n.x + inDir.x, factor * n.y + inDir.y, factor * (n.z || 0) + (inDir.z || 0));
    }
  }

  class UnityQuaternion {
    constructor(x = 0, y = 0, z = 0, w = 1, euler = { x: 0, y: 0, z: 0 }) {
      this.x = x; this.y = y; this.z = z; this.w = w; this.eulerAngles = euler;
      this.position = new UnityVector3(0, 0, 0); this._varName = ""; this.name = "Cube 3D"; this.type = "Quaternion";
    }
    static get identity() { return new UnityQuaternion(0, 0, 0, 1, { x: 0, y: 0, z: 0 }); }
    static Euler(p = 0, y = 0, r = 0) {
      const rx = (p * Math.PI) / 360, ry = (y * Math.PI) / 360, rz = (r * Math.PI) / 360;
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
      return new UnityQuaternion(sx*cy*cz + cx*sy*sz, cx*sy*cz - sx*cy*sz, cx*cy*sz - sx*sy*cz, cx*cy*cz + sx*sy*sz, { x: p, y: y, z: r });
    }
    static AngleAxis(angleDeg = 0, axis) {
      const n = axis ? axis.normalized : new UnityVector3(0,1,0);
      const r = (angleDeg * Math.PI) / 180, s = Math.sin(r/2);
      return new UnityQuaternion(n.x*s, n.y*s, (n.z||0)*s, Math.cos(r/2), { x: n.x*angleDeg, y: n.y*angleDeg, z: (n.z||0)*angleDeg });
    }
    rotateVector(v) {
      const qx = this.x, qy = this.y, qz = this.z, qw = this.w;
      const vx = v.x, vy = v.y, vz = v.z || 0;
      const ix = qw * vx + qy * vz - qz * vy, iy = qw * vy + qz * vx - qx * vz, iz = qw * vz + qx * vy - qy * vx, iw = -qx * vx - qy * vy - qz * vz;
      return new UnityVector3(ix*qw + iw*-qx + iy*-qz - iz*-qy, iy*qw + iw*-qy + iz*-qx - ix*-qz, iz*qw + iw*-qz + ix*-qy - iy*-qx);
    }
  }

  // ==========================================
  // AUTOCOMPLÉTION CONTEXTUELLE INTÉLLIGENTE
  // ==========================================
  let acIndex = 0, acFiltered = [];

  function openAc() {
    const pos = textarea.selectionStart;
    const match = textarea.value.slice(0, pos).match(/([a-zA-Z_]\w*)(?:\.([a-zA-Z_]\w*)*)?$/);
    const query = match ? match[0] : "";
    acFiltered = [];

    if (query.includes(".")) {
      const [objName, propQuery] = query.split(".");
      const propQ = (propQuery || "").toLowerCase();

      const varsMatch = [...textarea.value.matchAll(/\b(Vector2|Vector3|Quaternion)\s+([a-zA-Z_]\w*)/g)];
      const varType = varsMatch.find(m => m[2] === objName)?.[1];

      if (varType) {
        const props = [
          { label: "x", insert: "x", kind: "Prop" }, { label: "y", insert: "y", kind: "Prop" }, { label: "z", insert: "z", kind: "Prop" },
          { label: "name", insert: 'name = ""', kind: "Prop" }, { label: "color", insert: 'color = "#4cc2ff"', kind: "Prop" },
          { label: "position", insert: "position", kind: "Prop" }, { label: "magnitude", insert: "magnitude", kind: "Prop" },
          { label: "sqrMagnitude", insert: "sqrMagnitude", kind: "Prop" }, { label: "normalized", insert: "normalized", kind: "Prop" }
        ];
        acFiltered = props.filter(p => p.label.toLowerCase().startsWith(propQ)).map(p => ({ label: "." + p.label, insert: objName + "." + p.insert, kind: p.kind }));
      } else if (objName === "Vector2" || objName === "Vector3") {
        const statics = ["up", "down", "left", "right", "forward", "back", "zero", "one", "Angle", "SignedAngle", "Distance", "Dot", "Cross", "Project", "Reflect", "Lerp"];
        acFiltered = statics.map(s => ({ label: s, insert: s + (s[0] === s[0].toUpperCase() ? "()" : ""), kind: "Static" }))
          .filter(p => p.label.toLowerCase().startsWith(propQ)).map(p => ({ label: "." + p.label, insert: objName + "." + p.insert, kind: p.kind }));
      } else if (objName === "Mathf") {
        const mathProps = ["Cos", "Sin", "Tan", "Lerp", "PingPong", "Clamp", "SmoothStep", "Atan2", "PI", "Abs", "Min", "Max", "Pow", "Sqrt", "PerlinNoise", "AlKashi", "Bezier", "TirArc", "ProjeteOrthogonal", "SinCos"];
        acFiltered = mathProps.map(s => ({ label: s, insert: s + (s !== "PI" ? "()" : ""), kind: "Mathf" }))
          .filter(p => p.label.toLowerCase().startsWith(propQ)).map(p => ({ label: "." + p.label, insert: objName + "." + p.insert, kind: p.kind }));
      } else if (objName === "Quaternion") {
        const qProps = ["Euler", "AngleAxis", "LookRotation", "Slerp", "identity"];
        acFiltered = qProps.map(s => ({ label: s, insert: s + (s !== "identity" ? "()" : ""), kind: "Quat" }))
          .filter(p => p.label.toLowerCase().startsWith(propQ)).map(p => ({ label: "." + p.label, insert: objName + "." + p.insert, kind: p.kind }));
      }
    } else {
      const vars = [...textarea.value.matchAll(/\b(Vector2|Vector3|Quaternion)\s+([a-zA-Z_]\w*)/g)].map((m) => ({ label: m[2], insert: m[2], kind: m[1] }));
      acFiltered = [...vars, ...AUTOCOMPLETE_CATALOG].filter((it) => it.label.toLowerCase().includes(query.toLowerCase()));
    }

    if (acFiltered.length === 0) { acList.classList.remove("is-open"); return; }
    acIndex = 0;
    acList.innerHTML = acFiltered.map((it, idx) => `<li class="cs-autocomplete-item ${idx === acIndex ? "is-selected" : ""}" data-idx="${idx}"><span>${it.label}</span><span class="cs-autocomplete-kind">${it.kind}</span></li>`).join("");
    acList.querySelectorAll(".cs-autocomplete-item").forEach((li) => {
      li.addEventListener("mousedown", (e) => { e.preventDefault(); applyAc(acFiltered[Number(li.dataset.idx)]); });
    });
    acList.style.top = "44px"; acList.style.left = "20px";
    acList.classList.add("is-open");
  }

  function applyAc(item) {
    const pos = textarea.selectionStart;
    const left = textarea.value.slice(0, pos).replace(/[\w.]+$/, item.insert);
    const right = textarea.value.slice(pos);
    textarea.value = left + right;
    textarea.selectionStart = textarea.selectionEnd = left.length;
    acList.classList.remove("is-open");
    highlight(textarea.value);
    textarea.focus();
  }

  textarea.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.code === "Space") { e.preventDefault(); openAc(); return; }
    if (acList.classList.contains("is-open")) {
      if (e.key === "ArrowDown") { e.preventDefault(); acIndex = (acIndex + 1) % acFiltered.length; openAc(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); acIndex = (acIndex - 1 + acFiltered.length) % acFiltered.length; openAc(); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); applyAc(acFiltered[acIndex]); }
      else if (e.key === "Escape") acList.classList.remove("is-open");
    }
  });

  // ==========================================
  // TRANSPILATION MATHÉMATIQUE SÉCURISÉE (PARENTHÈSES ÉQUILIBRÉES)
  // ==========================================
  function transpileMath(src) {
    let out = src;
    // Permet d'analyser jusqu'à 4 niveaux d'imbrication de parenthèses pour éviter de crasher sur les fonctions C# complexes
    const L0 = `[^()]*`;
    const L1 = `\\((?:${L0})*\\)`;
    const L2 = `\\((?:${L0}|${L1})*\\)`;
    const L3 = `\\((?:${L0}|${L2})*\\)`;
    const L4 = `\\((?:${L0}|${L3})*\\)`;

    // Un opérande peut être soit un groupe de parenthèses, soit un identifiant avec ses propriétés et appels, soit un nombre
    const operand = `(?:${L4}|[a-zA-Z_]\\w*(?:\\.[a-zA-Z_]\\w*)*${L4}?|-?\\d+(?:\\.\\d+)?)`;

    const replaceOp = (regex, opMap) => {
      for (let i = 0; i < 5; i++) {
        const prev = out;
        out = out.replace(regex, (match, l, op, r) => {
          const lTrim = l.trim().split(/\s/)[0];
          // On ne transpile pas les mots clés officiels du langage
          if (/^(?:if|else|return|switch|for|while|new|var|let|const|case|default)$/.test(lTrim)) return match;
          return `${opMap[op.trim()]}(${l}, ${r})`;
        });
        if (prev === out) break;
      }
    };

    replaceOp(new RegExp(`(${operand})\\s*([*\\/])\\s*(${operand})`, 'g'), { '*': '__mul', '/': '__div' });
    replaceOp(new RegExp(`(${operand})\\s*([+\\-])\\s*(${operand})`, 'g'), { '+': '__add', '-': '__sub' });

    return out;
  }

  function transpileCode(src) {
    let js = src.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    js = js.replace(/\b(\d+(?:\.\d+)?)f\b/g, "$1");
    js = js.replace(/\b(?:float|int|double|bool|string|void|Vector2|Vector3|Quaternion)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g, (match, fn, args) => {
      if (["if", "switch", "while", "for"].includes(fn)) return match;
      const cleanArgs = args.split(",").map((a) => a.trim().replace(/^(?:float|int|double|bool|string|Vector2|Vector3|Quaternion)\s+/, "")).join(", ");
      return `function ${fn}(${cleanArgs}) {`;
    });
    js = js.replace(/\bnew\s+Vector2\s*\(/g, "__newVec2(");
    js = js.replace(/\bnew\s+Vector3\s*\(/g, "__newVec3(");
    js = js.replace(/\bnew\s+Quaternion\s*\(/g, "__newQuat(");

    js = transpileMath(js); // Transpilation de tous les + - * / du script

    js = js.replace(/(^|[\n{;])\s*(Vector2|Vector3|Quaternion)\s+([a-zA-Z_]\w*)\s*;/g, '$1 let $3 = __declVec("$3", "$2");');
    js = js.replace(/(^|[\n{;])\s*(Vector2|Vector3|Quaternion)\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g, (_, pre, typ, vName, expr) => `${pre} let ${vName} = __assignVec("${vName}", "${typ}", ${expr});`);
    js = js.replace(/(^|[\n{;])\s*(?:float|int|double|bool|string|var)\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g, (_, pre, vName, expr) => `${pre} let ${vName} = ${expr};`);
    js = js.replace(/\b(float|int|double|bool|string|var)\s+([a-zA-Z_]\w*)/g, "let $2");
    
    return js;
  }

  // ==========================================
  // ÉVALUATION RUNTIME & SECURITE (ANTI-CRASH)
  // ==========================================
  function execute(time) {
    const objectsMap = new Map();
    const lines = [];
    const curves = [];

    const __newVec2 = (x = 0, y = 0) => new UnityVector2(x, y);
    const __newVec3 = (x = 0, y = 0, z = 0) => new UnityVector3(x, y, z);
    const __newQuat = (x = 0, y = 0, z = 0, w = 1) => new UnityQuaternion(x, y, z, w);

    const __declVec = (varName, type) => {
      const v = type === "Vector3" ? new UnityVector3(0, 0, 0, varName) : new UnityVector2(0, 0, varName);
      objectsMap.set(varName, v); return v;
    };

    const __assignVec = (varName, type, val) => {
      // Sécurité : Remplace les objets corrompus par de vrais Vecteurs pour ne jamais crasher l'interface
      if (!val || typeof val !== "object" || !('x' in val)) {
        val = type === "Vector3" ? new UnityVector3() : new UnityVector2();
      }
      val._varName = varName; 
      if (!val.type) val.type = type;
      objectsMap.set(varName, val); return val;
    };

    const isVec = (v) => v && (v.type === "Vector2" || v.type === "Vector3");

    const __sub = (a, b) => {
      if (isVec(a) && isVec(b)) {
        const res = a.type === "Vector3" || b.type === "Vector3" ? new UnityVector3(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)) : new UnityVector2(a.x - b.x, a.y - b.y);
        res._from = b; res._to = a; lines.push({ from: b, to: a, vec: res, color: "#cc5de8" }); return res;
      }
      return Number(a) - Number(b);
    };

    const __add = (a, b) => {
      if (isVec(a) && isVec(b)) return a.type === "Vector3" || b.type === "Vector3" ? new UnityVector3(a.x + b.x, a.y + b.y, (a.z || 0) + (b.z || 0)) : new UnityVector2(a.x + b.x, a.y + b.y);
      return typeof a === "string" || typeof b === "string" ? a + b : Number(a) + Number(b);
    };

    const __mul = (a, b) => {
      if (isVec(a) && typeof b === "number") return a.type === "Vector3" ? new UnityVector3(a.x * b, a.y * b, (a.z || 0) * b) : new UnityVector2(a.x * b, a.y * b);
      if (typeof a === "number" && isVec(b)) return b.type === "Vector3" ? new UnityVector3(b.x * a, b.y * a, (b.z || 0) * a) : new UnityVector2(b.x * a, b.y * a);
      if (a && a.type === "Quaternion" && isVec(b)) return a.rotateVector(b);
      return Number(a) * Number(b);
    };

    const __div = (a, b) => {
      if (isVec(a) && typeof b === "number" && b !== 0) return a.type === "Vector3" ? new UnityVector3(a.x / b, a.y / b, (a.z || 0) / b) : new UnityVector2(a.x / b, a.y / b);
      return Number(a) / Number(b);
    };

    const DrawLine = (a, b, color = "#4cc2ff") => { if (isVec(a) && isVec(b)) lines.push({ from: a, to: b, color }); };

    const Mathf = {
      PI: Math.PI, Deg2Rad: Math.PI / 180, Rad2Deg: 180 / Math.PI,
      Cos: Math.cos, Sin: Math.sin, Tan: Math.tan,
      SinCos: (rad) => new UnityVector3(Math.cos(rad), Math.sin(rad), 0),
      Acos: Math.acos, Asin: Math.asin, Atan: Math.atan, Atan2: Math.atan2,
      DeltaAngle: (c, t) => { let d = (t - c) % 360; if (d > 180) d -= 360; else if (d < -180) d += 360; return d; },
      Quaternion: UnityQuaternion,
      Dot: (a, b) => UnityVector3.Dot(a, b),
      Cross: (a, b) => UnityVector3.Cross(a, b),
      ProjeteOrthogonal: (v, on) => UnityVector3.Project(v, on),
      AlKashi: (origin, target, l1 = 2, l2 = 2) => {
        const dx = target.x - origin.x, dy = target.y - origin.y;
        const d = Math.max(0.001, Math.min(l1 + l2 - 0.001, Math.hypot(dx, dy)));
        const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
        const aCoude = Math.atan2(dy, dx) + Math.acos(Math.max(-1, Math.min(1, cosA)));
        const coude = new UnityVector3(origin.x + Math.cos(aCoude) * l1, origin.y + Math.sin(aCoude) * l1, origin.z || 0);
        lines.push({ from: origin, to: coude, color: "#4cc2ff" });
        lines.push({ from: coude, to: target, color: "#51cf66" });
        return coude;
      },
      Bezier: (p0, p1, p2, p3, t = 0.5) => {
        const pts = [];
        for (let i = 0; i <= 30; i++) {
          const s = i / 30, u = 1 - s;
          pts.push(new UnityVector3(
            u*u*u*p0.x + 3*u*u*s*p1.x + 3*u*s*s*p2.x + s*s*s*p3.x,
            u*u*u*p0.y + 3*u*u*s*p1.y + 3*u*s*s*p2.y + s*s*s*p3.y,
            u*u*u*(p0.z||0) + 3*u*u*s*(p1.z||0) + 3*u*s*s*(p2.z||0) + s*s*s*(p3.z||0)
          ));
        }
        curves.push({ points: pts, color: "#4cc2ff" });
        const c = Math.max(0, Math.min(1, t)), u = 1 - c;
        return new UnityVector3(
          u*u*u*p0.x + 3*u*u*c*p1.x + 3*u*c*c*p2.x + c*c*c*p3.x,
          u*u*u*p0.y + 3*u*u*c*p1.y + 3*u*c*c*p2.y + c*c*c*p3.y,
          u*u*u*(p0.z||0) + 3*u*u*c*(p1.z||0) + 3*u*c*c*(p2.z||0) + c*c*c*(p3.z||0)
        );
      },
      TirArc: (start, vel, g = 9.81, t = 1) => {
        const pts = [];
        for (let i = 0; i <= 30; i++) {
          const s = i * 0.1;
          pts.push(new UnityVector3(start.x + vel.x * s, start.y + vel.y * s - 0.5 * g * s * s, (start.z || 0) + (vel.z || 0) * s));
        }
        curves.push({ points: pts, color: "#ff6b6b" });
        const loopT = t % 2.5;
        return new UnityVector3(start.x + vel.x * loopT, start.y + vel.y * loopT - 0.5 * g * loopT * loopT, (start.z || 0) + (vel.z || 0) * loopT);
      },
      Lerp: (a, b, t) => typeof a === "number" ? a + (b - a) * Math.max(0, Math.min(1, t)) : (a.type ? new UnityVector3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, (a.z || 0) + ((b.z || 0) - (a.z || 0)) * t) : a),
      SmoothStep: (a, b, t) => { const c = Math.max(0, Math.min(1, t)); return a + (b - a) * (c * c * (3 - 2 * c)); },
      Clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
      PingPong: (t, l) => l === 0 ? 0 : l - Math.abs((Math.abs(t) % (2 * l)) - l),
      PerlinNoise: (x, y) => { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); },
      CorrelatedColorTemperatureToRGB: (kelvin = 6500) => {
        const t = Math.max(1000, Math.min(40000, kelvin)) / 100;
        let r = t <= 66 ? 255 : 329.6987 * Math.pow(t - 60, -0.1332);
        let g = t <= 66 ? 99.4708 * Math.log(t) - 161.1195 : 288.1221 * Math.pow(t - 60, -0.0755);
        let b = t <= 19 ? 0 : (t >= 66 ? 255 : 138.5177 * Math.log(t - 10) - 305.0447);
        const hex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
        return `#${hex(r)}${hex(g)}${hex(b)}`;
      }
    };

    const Time = { time, deltaTime: 0.016 };
    const Pitch = Number(pitchInput.value) || 0, Yaw = Number(yawInput.value) || 0, Roll = Number(rollInput.value) || 0;

    try {
      const runner = new Function(
        "__newVec2", "__newVec3", "__newQuat", "__declVec", "__assignVec",
        "__sub", "__add", "__mul", "__div", "DrawLine",
        "Vector2", "Vector3", "Quaternion", "Mathf", "Time", "Pitch", "Yaw", "Roll",
        `"use strict";\n{\n${transpileCode(textarea.value)}\n}`
      );
      runner(__newVec2, __newVec3, __newQuat, __declVec, __assignVec, __sub, __add, __mul, __div, DrawLine, UnityVector2, UnityVector3, UnityQuaternion, Mathf, Time, Pitch, Yaw, Roll);
      statusEl.textContent = "✓ Compilation C# temps réel active"; statusEl.className = "cs-status-bar";
      currentObjects = Array.from(objectsMap.values()); currentLines = lines; currentCurves = curves;
    } catch (err) {
      statusEl.textContent = "⚠ " + err.message; statusEl.className = "cs-status-bar is-error";
    }
  }

  // ==========================================
  // RENDU 3D / 2D & INTERACTION
  // ==========================================
  function projectPoint(wx, wy, wz = 0) {
    const cx = canvas.width / 2 + panX, cy = canvas.height / 2 + panY;
    if (!is3DMode) return { x: cx + wx * scale, y: cy - wy * scale };
    const cosY = Math.cos(camYaw), sinY = Math.sin(camYaw), cosP = Math.cos(camPitch), sinP = Math.sin(camPitch);
    const x1 = wx * cosY - wz * sinY, z1 = wx * sinY + wz * cosY, y2 = wy * cosP - z1 * sinP, z2 = wy * sinP + z1 * cosP;
    const fov = 14 / Math.max(4, 14 + z2 * 0.35);
    return { x: cx + x1 * scale * fov, y: cy - y2 * scale * fov, depth: z2 };
  }

  function updateSourceFromDrag(varName, nx, ny, nz) {
    const rx = Number(nx.toFixed(2)), ry = Number(ny.toFixed(2)), rz = Number((nz || 0).toFixed(2));
    let code = textarea.value;
    const reg3D = new RegExp(`(\\bVector3\\s+${varName}\\s*=)[^;]+;`);
    const reg2D = new RegExp(`(\\bVector2\\s+${varName}\\s*=)[^;]+;`);
    const regBare = new RegExp(`\\b(Vector2|Vector3)\\s+${varName}\\s*;`);
    if (reg3D.test(code)) textarea.value = code.replace(reg3D, `$1 new Vector3(${rx}, ${ry}, ${rz});`);
    else if (reg2D.test(code)) textarea.value = code.replace(reg2D, `$1 new Vector2(${rx}, ${ry});`);
    else if (regBare.test(code)) textarea.value = code.replace(regBare, (_, t) => t === "Vector3" ? `Vector3 ${varName} = new Vector3(${rx}, ${ry}, ${rz});` : `Vector2 ${varName} = new Vector2(${rx}, ${ry});`);
    highlight(textarea.value);
  }

  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    lastMouseX = mx; lastMouseY = my;
    for (const obj of currentObjects) {
      if (obj._from || obj.type === "Quaternion") continue;
      const vx = Number(obj.x) || 0, vy = Number(obj.y) || 0, vz = Number(obj.z) || 0;
      const p = projectPoint(vx, vy, vz);
      if (Math.hypot(p.x - mx, p.y - my) <= 15) { draggedVarName = obj._varName; return; }
    }
    isOrbiting = true;
  });

  window.addEventListener("mousemove", (e) => {
    if (!draggedVarName && !isOrbiting) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    if (draggedVarName) {
      const obj = currentObjects.find((o) => o._varName === draggedVarName);
      if (obj) {
        if (!is3DMode) { obj.x = (mx - (canvas.width / 2 + panX)) / scale; obj.y = (canvas.height / 2 + panY - my) / scale; }
        else if (e.shiftKey) obj.y += (lastMouseY - my) / scale;
        else {
          const dx = (mx - lastMouseX) / scale, dy = (my - lastMouseY) / scale, cosY = Math.cos(camYaw), sinY = Math.sin(camYaw);
          obj.x += dx * cosY + dy * sinY; obj.z += -dx * sinY + dy * cosY;
        }
        updateSourceFromDrag(draggedVarName, obj.x, obj.y, obj.z);
      }
    } else if (isOrbiting) {
      if (is3DMode) { camYaw += (mx - lastMouseX) * 0.008; camPitch = Math.max(-1.35, Math.min(1.4, camPitch + (my - lastMouseY) * 0.008)); }
      else { panX += mx - lastMouseX; panY += my - lastMouseY; }
    }
    lastMouseX = mx; lastMouseY = my;
  });

  window.addEventListener("mouseup", () => { draggedVarName = null; isOrbiting = false; });
  canvas.addEventListener("wheel", (e) => { e.preventDefault(); scale = Math.max(20, Math.min(130, scale - e.deltaY * 0.04)); }, { passive: false });

  function drawText(text, x, y, color = "#fff", font = "600 12.5px 'Segoe UI', sans-serif") {
    ctx.font = font; ctx.strokeStyle = "rgba(0, 0, 0, 0.88)"; ctx.lineWidth = 3.5;
    ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y);
  }

  function drawArrow(x1, y1, x2, y2, color, label = "") {
    const head = 12, angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill();
    if (label) drawText(label, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8, color);
  }

  function draw3DScene() {
    const grid = 4;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"; ctx.lineWidth = 1;
    for (let i = -grid; i <= grid; i++) {
      const a = projectPoint(i, 0, -grid), b = projectPoint(i, 0, grid); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      const c = projectPoint(-grid, 0, i), d = projectPoint(grid, 0, i); ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
    }
    const o = projectPoint(0, 0, 0), up = projectPoint(0, 3, 0), rx = projectPoint(3.4, 0, 0), fz = projectPoint(0, 0, 2.8);
    drawArrow(o.x, o.y, rx.x, rx.y, "#ff6b6b", "DROITE (+X)");
    drawArrow(o.x, o.y, up.x, up.y, "#51cf66", "▲ HAUT (+Y)");
    drawArrow(o.x, o.y, fz.x, fz.y, "#4dabf7", "DEVANT (+Z)");
  }

  function drawCubeQuat(quat) {
    const c = quat.position || new UnityVector3(), s = 1.1;
    const verts = [new UnityVector3(-s, -s, -s), new UnityVector3(s, -s, -s), new UnityVector3(s, s, -s), new UnityVector3(-s, s, -s), new UnityVector3(-s, -s, s), new UnityVector3(s, -s, s), new UnityVector3(s, s, s), new UnityVector3(-s, s, s)].map((v) => {
      const r = quat.rotateVector(v);
      return projectPoint((Number(c.x)||0) + (Number(r.x)||0), (Number(c.y)||0) + (Number(r.y)||0), (Number(c.z)||0) + (Number(r.z)||0));
    });
    ctx.fillStyle = "rgba(81, 207, 102, 0.25)"; ctx.beginPath(); [3, 2, 6, 7].forEach((i, idx) => (idx === 0 ? ctx.moveTo(verts[i].x, verts[i].y) : ctx.lineTo(verts[i].x, verts[i].y))); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(77, 171, 247, 0.25)"; ctx.beginPath(); [4, 5, 6, 7].forEach((i, idx) => (idx === 0 ? ctx.moveTo(verts[i].x, verts[i].y) : ctx.lineTo(verts[i].x, verts[i].y))); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#4dabf7"; ctx.lineWidth = 2; [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([i, j]) => { ctx.beginPath(); ctx.moveTo(verts[i].x, verts[i].y); ctx.lineTo(verts[j].x, verts[j].y); ctx.stroke(); });
  }

  function loop(now) {
    if (!document.getElementById("cs-live-canvas")) return;
    if (isPlaying) { elapsedTime += (now - lastTimestamp) / 1000; timeValEl.textContent = elapsedTime.toFixed(2) + "s"; }
    lastTimestamp = now;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
    execute(elapsedTime); ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (is3DMode) draw3DScene();
    else {
      const o = projectPoint(0, 0, 0); ctx.strokeStyle = "#262626"; ctx.lineWidth = 1;
      for (let x = o.x % scale; x < canvas.width; x += scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = o.y % scale; y < canvas.height; y += scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
      ctx.strokeStyle = "#525252"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(canvas.width, o.y); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, canvas.height); ctx.stroke();
    }

    for (const c of currentCurves) {
      ctx.strokeStyle = c.color || "#4cc2ff"; ctx.lineWidth = 2.5; ctx.beginPath();
      c.points.forEach((pt, idx) => { const p = projectPoint(Number(pt.x)||0, Number(pt.y)||0, Number(pt.z)||0); idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }); ctx.stroke();
    }
    for (const obj of currentObjects) if (obj.type === "Quaternion") drawCubeQuat(obj);
    for (const l of currentLines) drawArrow(projectPoint(Number(l.from.x)||0, Number(l.from.y)||0, Number(l.from.z)||0).x, projectPoint(Number(l.from.x)||0, Number(l.from.y)||0, Number(l.from.z)||0).y, projectPoint(Number(l.to.x)||0, Number(l.to.y)||0, Number(l.to.z)||0).x, projectPoint(Number(l.to.x)||0, Number(l.to.y)||0, Number(l.to.z)||0).y, l.color || "#cc5de8", l.vec ? l.vec.name || l.vec._varName : "");

    const colors = ["#4cc2ff", "#51cf66", "#ff6b6b", "#fcc419", "#cc5de8"];
    currentObjects.forEach((v, idx) => {
      if (v._from || v.type === "Quaternion") return;
      const vx = Number(v.x) || 0, vy = Number(v.y) || 0, vz = Number(v.z) || 0;
      const pos = projectPoint(vx, vy, vz);
      ctx.fillStyle = v.color || colors[idx % colors.length];
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 7.5, 0, Math.PI * 2); ctx.fill();
      const coords = v.type === "Vector3" ? `[${vx.toFixed(1)}, ${vy.toFixed(1)}, ${vz.toFixed(1)}]` : `[${vx.toFixed(1)}, ${vy.toFixed(1)}]`;
      drawText(v.name ? `${v.name} ${coords}` : `${v._varName} ${coords}`, pos.x + 10, pos.y - 8);
    });

    tbody.innerHTML = currentObjects.map((v) => {
      if (v.type === "Quaternion") {
        const ex = Number(v.eulerAngles?.x) || 0, ey = Number(v.eulerAngles?.y) || 0, ez = Number(v.eulerAngles?.z) || 0, w = Number(v.w) || 1;
        return `<tr><td><code>${v._varName}</code></td><td>${v.name}</td><td>Quaternion</td><td><code>Euler(${ex.toFixed(1)}°, ${ey.toFixed(1)}°, ${ez.toFixed(1)}°)</code></td><td>w=${w.toFixed(2)}</td></tr>`;
      }
      const vx = Number(v.x) || 0, vy = Number(v.y) || 0, vz = Number(v.z) || 0, mag = Number(v.magnitude) || 0;
      const cStr = v.type === "Vector3" ? `(${vx.toFixed(2)}, ${vy.toFixed(2)}, ${vz.toFixed(2)})` : `(${vx.toFixed(2)}, ${vy.toFixed(2)})`;
      return `<tr><td><code>${v._varName}</code></td><td>${v.name || "—"}</td><td>${v.type}</td><td><code>${cStr}</code></td><td><code>${mag.toFixed(2)}</code></td></tr>`;
    }).join("");

    animationFrameId = requestAnimationFrame(loop);
  }

  animationFrameId = requestAnimationFrame(loop);

  return { render() { execute(elapsedTime); }, destroy() { if (animationFrameId) cancelAnimationFrame(animationFrameId); } };
}