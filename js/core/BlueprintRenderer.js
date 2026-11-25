const PIN_COLORS = {
  exec: "var(--ue-pin-exec)",
  bool: "var(--ue-pin-bool)",
  int: "var(--ue-pin-int)",
  float: "var(--ue-pin-float)",
  vector: "var(--ue-pin-vector)",
  rotator: "var(--ue-pin-rotator)",
  quat: "var(--ue-pin-quat)",
  transform: "var(--ue-pin-transform)",
  color: "var(--ue-pin-color)",
  struct: "var(--ue-pin-struct)"
};

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export class BlueprintRenderer {
  static render(nodeSpec) {
    const title = esc(nodeSpec.title || "Math Function");
    const subtitle = esc(nodeSpec.subtitle || "Target is Kismet Math Library");
    const isImpure = Boolean(nodeSpec.impure);
    const inputs = nodeSpec.inputs || [];
    const outputs = nodeSpec.outputs || [];

    const renderPin = (pin, isOut) => {
      const col = PIN_COLORS[pin.type] || PIN_COLORS.float;
      const isExec = pin.type === "exec";
      const dot = `<span class="bp-pin-dot ${isExec ? "is-exec" : ""}" style="--pin-color:${col}"></span>`;
      const val = pin.value !== undefined && pin.value !== "" ? `<span class="bp-pin-val">${esc(pin.value)}</span>` : "";
      const name = `<span>${esc(pin.name)}</span>`;
      return isOut
        ? `<div class="bp-pin">${val}${name}${dot}</div>`
        : `<div class="bp-pin">${dot}${name}${val}</div>`;
    };

    return `
      <div class="bp-canvas">
        <div class="bp-node">
          <div class="bp-node-head ${isImpure ? "is-impure" : ""}">
            <div>
              <div class="bp-node-title">${title}</div>
              <div class="bp-node-subtitle">${subtitle}</div>
            </div>
          </div>
          <div class="bp-node-body">
            <div class="bp-pins-col">
              ${inputs.map((p) => renderPin(p, false)).join("")}
            </div>
            <div class="bp-pins-col bp-pins-out">
              ${outputs.map((p) => renderPin(p, true)).join("")}
            </div>
          </div>
        </div>
        ${nodeSpec.note ? `<div class="bp-node-note">// ${esc(nodeSpec.note)}</div>` : ""}
      </div>
    `;
  }
}
