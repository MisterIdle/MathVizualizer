export const ENGINE_TABS = [
  { id: "unity", label: "Unity (C#)", dot: "#e6edf3" },
  { id: "godotCs", label: "Godot (C#)", dot: "#478cbf" },
  { id: "godotGd", label: "Godot (GDScript)", dot: "#58a6ff" },
  { id: "unrealCpp", label: "Unreal (C++)", dot: "#a371f7" },
  { id: "unrealBp", label: "Unreal (Blueprint)", dot: "#3fb950" },
  { id: "csharp", label: "C# (.NET)", dot: "#bc8cff" },
  { id: "cpp", label: "C++ (GLM / std)", dot: "#f0883e" }
];

function f(n, d = 3) {
  return Number(n || 0).toFixed(d);
}

function v2(v) {
  return `${f(v?.x, 2)}f, ${f(v?.y, 2)}f`;
}

function v3(v) {
  return `${f(v?.x, 2)}f, ${f(v?.y, 2)}f, ${f(v?.z || 0, 2)}f`;
}

export class CodeSnippetBuilder {
  static build(concept, state = {}) {
    const mode = concept.sandboxMode || concept.id;
    const sb = concept.sandbox;

    if (sb === "space3d") return this.build3D(concept, mode, state);
    if (sb === "trig") return this.buildTrig(concept, mode, state);
    if (sb === "vector") return this.buildVector(concept, mode, state);
    if (sb === "collision") return this.buildCollision(concept, mode, state);
    if (sb === "physics") return this.buildPhysics(concept, mode, state);
    if (sb === "procedural") return this.buildProcedural(concept, mode, state);
    return this.buildGraph(concept, mode, state);
  }

  static buildGraph(concept, mode, state) {
    const probe = (state.probes && state.probes[0]) || { x: 0.5, y: 0.5 };
    const x = f(probe.x, 3);
    const y = f(probe.y, 3);
    const a = f(state.params?.a ?? 1, 2);
    const b = f(state.params?.b ?? 1, 2);

    if (mode === "clamp") {
      const mn = Math.min(Number(a), Number(b)).toFixed(2);
      const mx = Math.max(Number(a), Number(b)).toFixed(2);
      return {
        unity: `float val = Mathf.Clamp(${x}f, ${mn}f, ${mx}f);\n// Résultat = ${y}f`,
        godotCs: `float val = Mathf.Clamp(${x}f, ${mn}f, ${mx}f); // ${y}`,
        godotGd: `var val := clampf(${x}, ${mn}, ${mx}) # ${y}`,
        unrealCpp: `float Val = FMath::Clamp(${x}f, ${mn}f, ${mx}f); // ${y}`,
        unrealBp: {
          title: "Clamp (Float)",
          inputs: [
            { name: "Value", type: "float", value: x },
            { name: "Min", type: "float", value: mn },
            { name: "Max", type: "float", value: mx }
          ],
          outputs: [{ name: "Return Value", type: "float", value: y }]
        },
        csharp: `float val = Math.Clamp(${x}f, ${mn}f, ${mx}f); // ${y}`,
        cpp: `float val = std::clamp(${x}f, ${mn}f, ${mx}f); // ${y}`
      };
    }

    if (mode === "lerp" || mode === "smoothstep") {
      const isSmooth = mode === "smoothstep";
      const fn = isSmooth ? "SmoothStep" : "Lerp";
      return {
        unity: `float res = Mathf.${fn}(${a}f, ${b}f, ${x}f);\n// Sortie = ${y}f`,
        godotCs: `float res = Mathf.${fn}(${a}f, ${b}f, ${x}f); // ${y}`,
        godotGd: isSmooth
          ? `var s := smoothstep(0.0, 1.0, ${x})\nvar res := lerpf(${a}, ${b}, s) # ${y}`
          : `var res := lerpf(${a}, ${b}, ${x}) # ${y}`,
        unrealCpp: isSmooth
          ? `float S = FMath::SmoothStep(0.f, 1.f, ${x}f);\nfloat Res = FMath::Lerp(${a}f, ${b}f, S); // ${y}`
          : `float Res = FMath::Lerp(${a}f, ${b}f, ${x}f); // ${y}`,
        unrealBp: {
          title: isSmooth ? "Ease (EaseInOut)" : "Lerp",
          inputs: [
            { name: "A", type: "float", value: a },
            { name: "B", type: "float", value: b },
            { name: "Alpha", type: "float", value: x }
          ],
          outputs: [{ name: "Return Value", type: "float", value: y }]
        },
        csharp: isSmooth
          ? `float t = Math.Clamp(${x}f, 0f, 1f);\nfloat res = float.Lerp(${a}f, ${b}f, t * t * (3f - 2f * t)); // ${y}`
          : `float res = float.Lerp(${a}f, ${b}f, Math.Clamp(${x}f, 0f, 1f)); // ${y}`,
        cpp: isSmooth
          ? `float s = glm::smoothstep(0.f, 1.f, ${x}f);\nfloat res = std::lerp(${a}f, ${b}f, s); // ${y}`
          : `float res = std::lerp(${a}f, ${b}f, std::clamp(${x}f, 0.f, 1.f)); // ${y}`
      };
    }

    if (mode === "expdamp") {
      return {
        unity: `float lambda = ${a}f;\nfloat alpha = 1f - Mathf.Exp(-lambda * Time.deltaTime);\nvalue = Mathf.Lerp(value, target, alpha);\n// À t = ${x}s → progression = ${(Number(y) * 100).toFixed(1)}%`,
        godotCs: `float alpha = 1f - Mathf.Exp(-${a}f * (float)delta);\nvalue = Mathf.Lerp(value, target, alpha);`,
        godotGd: `var alpha := 1.0 - exp(-${a} * delta)\nvalue = lerpf(value, target, alpha)`,
        unrealCpp: `Value = FMath::FInterpTo(Value, Target, DeltaTime, ${a}f);\n// FInterpTo est nativement exponentiel !`,
        unrealBp: {
          title: "FInterp To",
          inputs: [
            { name: "Current", type: "float", value: "0.00" },
            { name: "Target", type: "float", value: "1.00" },
            { name: "Delta Time", type: "float", value: x },
            { name: "Interp Speed (λ)", type: "float", value: a }
          ],
          outputs: [{ name: "Return Value", type: "float", value: y }],
          note: "Indépendant du framerate à 30, 60 et 144 FPS"
        },
        csharp: `float alpha = 1f - MathF.Exp(-${a}f * dt);\nval = float.Lerp(val, target, alpha);`,
        cpp: `float alpha = 1.0f - std::exp(-${a}f * dt);\nval = std::lerp(val, target, alpha);`
      };
    }

    if (mode === "spring") {
      return {
        unity: `// Ressort amorti : ω = ${a}, ζ = ${b}\nfloat accel = -2f * ${b}f * ${a}f * vel - (${a}f * ${a}f) * (pos - ${x}f);\nvel += accel * dt;\npos += vel * dt; // pos = ${y}f`,
        godotCs: `float accel = -2f * ${b}f * ${a}f * vel - (${a}f * ${a}f) * (pos - ${x}f);\nvel += accel * dt; pos += vel * dt;`,
        godotGd: `var accel := -2.0 * ${b} * ${a} * vel - (${a} * ${a}) * (pos - ${x})\nvel += accel * delta; pos += vel * delta`,
        unrealCpp: `Pos = UKismetMathLibrary::FloatSpringInterp(Pos, ${x}f, SpringState, ${a}f, ${b}f, DeltaTime);`,
        unrealBp: {
          title: "Float Spring Interp",
          inputs: [
            { name: "Current", type: "float", value: y },
            { name: "Target", type: "float", value: x },
            { name: "Stiffness (ω)", type: "float", value: a },
            { name: "Critical Damping (ζ)", type: "float", value: b }
          ],
          outputs: [{ name: "Return Value", type: "float", value: y }]
        },
        csharp: `vel += (-2f * ${b}f * ${a}f * vel - ${a}f * ${a}f * (pos - ${x}f)) * dt;\npos += vel * dt;`,
        cpp: `vel += (-2.f * ${b}f * ${a}f * vel - ${a}f * ${a}f * (pos - ${x}f)) * dt;\npos += vel * dt;`
      };
    }

    if (mode === "bitmask") {
      const ia = Math.round(state.params?.a ?? 45);
      const ib = Math.round(state.params?.b ?? 23);
      return {
        unity: `int maskA = ${ia}; // 0b${ia.toString(2).padStart(8, "0")}\nint maskB = ${ib}; // 0b${ib.toString(2).padStart(8, "0")}\nbool collides = (maskA & maskB) != 0; // ${(ia & ib) !== 0}`,
        godotCs: `uint maskA = ${ia}u, maskB = ${ib}u;\nbool collides = (maskA & maskB) != 0; // ${(ia & ib) !== 0}`,
        godotGd: `var collides: bool = (${ia} & ${ib}) != 0 # ${(ia & ib) !== 0}`,
        unrealCpp: `const bool bCollides = (${ia} & ${ib}) != 0; // ${(ia & ib) !== 0}`,
        unrealBp: {
          title: "Bitwise AND (&)",
          inputs: [
            { name: "A", type: "int", value: String(ia) },
            { name: "B", type: "int", value: String(ib) }
          ],
          outputs: [
            { name: "A & B", type: "int", value: String(ia & ib) },
            { name: "!= 0", type: "bool", value: String((ia & ib) !== 0) }
          ]
        },
        csharp: `int combined = ${ia} | ${ib}; // ${ia | ib}\nbool hasCommon = (${ia} & ${ib}) != 0; // ${(ia & ib) !== 0}`,
        cpp: `uint32_t inter = ${ia}u & ${ib}u; // ${ia & ib}`
      };
    }

    if (mode === "prng") {
      const seed = state.seed || 1337;
      const cell = state.prngCell || { x: 4, y: 3 };
      const val = f(state.prngVal ?? 0.5, 4);
      return {
        unity: `uint h = Squirrel3(${cell.x} + ${cell.y} * 198491317, ${seed}u);\nfloat norm = h / (float)uint.MaxValue; // ${val}f`,
        godotCs: `var rng = new RandomNumberGenerator { Seed = ${seed}ul };\n// Stateless 2D hash(${cell.x}, ${cell.y}) = ${val}`,
        godotGd: `var rng := RandomNumberGenerator.new()\nrng.seed = ${seed} # Cell(${cell.x},${cell.y}) -> ${val}`,
        unrealCpp: `FRandomStream Stream(${seed});\n// Déterministe par coordonnée (${cell.x}, ${cell.y}) = ${val}`,
        unrealBp: {
          title: "Random Float from Stream",
          inputs: [
            { name: "Seed", type: "int", value: String(seed) },
            { name: "Coord", type: "vector", value: `(${cell.x}, ${cell.y})` }
          ],
          outputs: [{ name: "Return Value", type: "float", value: val }]
        },
        csharp: `uint h = Squirrel3(${cell.x} + ${cell.y} * 198491317, ${seed}u); // ${val}`,
        cpp: `uint32_t h = squirrel3(${cell.x} + ${cell.y} * 198491317, ${seed}u); // ${val}`
      };
    }

    if (mode === "balance") {
      const k = Math.round(state.params?.a ?? 100);
      const armor = Math.round(Math.max(0, Number(probe.x) * 100));
      const mult = (k / (k + armor)).toFixed(3);
      return {
        unity: `float armor = ${armor}f, k = ${k}f;\nfloat dmgMult = k / (k + armor); // ${mult}f (${(Number(mult) * 100).toFixed(1)}% dégâts)\nfloat ehp = baseHp * (1f + armor / k);`,
        godotCs: `float dmgMult = ${k}f / (${k}f + ${armor}f); // ${mult}f`,
        godotGd: `var dmg_mult := ${k}.0 / (${k}.0 + ${armor}.0) # ${mult}`,
        unrealCpp: `float DmgMult = ${k}.f / (${k}.f + ${armor}.f); // ${mult}f`,
        unrealBp: {
          title: "Armor Reduction K / (K + Armor)",
          inputs: [
            { name: "K (Pivot 50%)", type: "float", value: String(k) },
            { name: "Armor", type: "float", value: String(armor) }
          ],
          outputs: [
            { name: "Dmg Multiplier", type: "float", value: mult },
            { name: "EHP Factor", type: "float", value: `×${(1 + armor / k).toFixed(2)}` }
          ]
        },
        csharp: `float dmgMult = ${k}f / (${k}f + ${armor}f); // ${mult}`,
        cpp: `float dmgMult = ${k}.0f / (${k}.0f + ${armor}.0f); // ${mult}`
      };
    }

    return {
      unity: `// x = ${x}f → f(x) = ${y}f\n${concept.signatures.unity}`,
      godotCs: `// x = ${x}f → f(x) = ${y}f\n${concept.signatures.godotCs}`,
      godotGd: `# x = ${x} -> f(x) = ${y}\n${concept.signatures.godotGd}`,
      unrealCpp: `// X = ${x}f → Out = ${y}f\n${concept.signatures.unrealCpp}`,
      unrealBp: {
        title: concept.signatures.unrealBp,
        inputs: [
          { name: "X", type: "float", value: x },
          ...(concept.params || []).map((p) => ({ name: p.label.split(" ")[0], type: "float", value: f(state.params?.[p.key] ?? p.value, 2) }))
        ],
        outputs: [{ name: "Return Value", type: "float", value: y }]
      },
      csharp: `// x = ${x}f → f(x) = ${y}f\n${concept.signatures.csharp}`,
      cpp: `// x = ${x}f → f(x) = ${y}f\n${concept.signatures.cpp}`
    };
  }

  static buildTrig(concept, mode, state) {
    const pts = state.points || [{ angleRad: 0.785, angleDeg: 45, x: 0.707, y: 0.707, out: 0.707 }];
    const p1 = pts[0];
    const p2 = pts[1];
    const rad = f(p1.angleRad, 3);
    const deg = f(p1.angleDeg, 1);
    const outStr = typeof p1.out === "object" ? `sin=${f(p1.out.sin, 2)}, cos=${f(p1.out.cos, 2)}` : f(p1.out, 3);

    if (mode === "atan2" || mode === "atan") {
      const isBug = Boolean(state.useBuggyAtan);
      const resDeg = f((Number(p1.out) * 180) / Math.PI, 1);
      return {
        unity: isBug
          ? `// BUG ATAN(y/x) quand x < 0 :\nfloat deg = Mathf.Atan(${f(p1.y, 2)}f / ${f(p1.x, 2)}f) * Mathf.Rad2Deg; // ${resDeg}°`
          : `float deg = Mathf.Atan2(${f(p1.y, 2)}f, ${f(p1.x, 2)}f) * Mathf.Rad2Deg; // ${resDeg}°`,
        godotCs: `float rad = Mathf.Atan2(${f(p1.y, 2)}f, ${f(p1.x, 2)}f); // ${resDeg}°`,
        godotGd: `var deg := rad_to_deg(atan2(${f(p1.y, 2)}, ${f(p1.x, 2)})) # ${resDeg}°`,
        unrealCpp: `float Deg = FMath::RadiansToDegrees(FMath::Atan2(${f(p1.y, 2)}f, ${f(p1.x, 2)}f)); // ${resDeg}°`,
        unrealBp: {
          title: isBug ? "Atan (Degrees) [BUG]" : "Atan2 (Degrees)",
          inputs: isBug
            ? [{ name: "Y / X", type: "float", value: f(p1.y / (p1.x || 1e-4), 2) }]
            : [{ name: "Y", type: "float", value: f(p1.y, 2) }, { name: "X", type: "float", value: f(p1.x, 2) }],
          outputs: [{ name: "Angle (Deg)", type: "float", value: `${resDeg}°` }]
        },
        csharp: `float rad = MathF.Atan2(${f(p1.y, 2)}f, ${f(p1.x, 2)}f); // ${resDeg}°`,
        cpp: `float rad = std::atan2(${f(p1.y, 2)}f, ${f(p1.x, 2)}f); // ${resDeg}°`
      };
    }

    if ((mode === "deltaangle" || mode === "lerpangle") && p2) {
      const a = f(p1.angleDeg, 1), b = f(p2.angleDeg, 1), t = f(state.lerpT ?? 0.5, 2);
      const isLerp = mode === "lerpangle";
      return {
        unity: isLerp
          ? `float ang = Mathf.LerpAngle(${a}f, ${b}f, ${t}f); // ${outStr}°`
          : `float delta = Mathf.DeltaAngle(${a}f, ${b}f); // ${outStr}°`,
        godotCs: isLerp
          ? `float rad = Mathf.LerpAngle(${f(p1.angleRad, 2)}f, ${f(p2.angleRad, 2)}f, ${t}f);`
          : `float diff = Mathf.AngleDifference(${f(p1.angleRad, 2)}f, ${f(p2.angleRad, 2)}f);`,
        godotGd: isLerp
          ? `var rad := lerp_angle(${f(p1.angleRad, 2)}, ${f(p2.angleRad, 2)}, ${t})`
          : `var diff := angle_difference(${f(p1.angleRad, 2)}, ${f(p2.angleRad, 2)})`,
        unrealCpp: isLerp
          ? `float Delta = FMath::FindDeltaAngleDegrees(${a}f, ${b}f);\nfloat Ang = ${a}f + Delta * ${t}f; // ${outStr}°`
          : `float Delta = FMath::FindDeltaAngleDegrees(${a}f, ${b}f); // ${outStr}°`,
        unrealBp: {
          title: isLerp ? "Lerp (Rotator) [Shortest Path]" : "Find Delta Angle Degrees",
          inputs: [
            { name: "A", type: "float", value: `${a}°` },
            { name: "B", type: "float", value: `${b}°` },
            ...(isLerp ? [{ name: "Alpha", type: "float", value: t }] : [])
          ],
          outputs: [{ name: "Return Value", type: "float", value: `${outStr}°` }]
        },
        csharp: `float delta = MathF.IEEERemainder(${b}f - ${a}f, 360f); // ${outStr}°`,
        cpp: `float delta = std::remainder(${b}f - ${a}f, 360.0f); // ${outStr}°`
      };
    }

    const fnName = mode === "acos" ? "Acos" : mode === "asin" ? "Asin" : mode === "tan" ? "Tan" : mode === "sin" ? "Sin" : "Cos";
    const inVal = mode === "acos" ? f(p1.x, 3) : mode === "asin" ? f(p1.y, 3) : rad;
    return {
      unity: `float res = Mathf.${fnName}(${inVal}f);\n// Angle = ${deg}° → Sortie = ${outStr}`,
      godotCs: `float res = Mathf.${fnName}(${inVal}f); // ${outStr}`,
      godotGd: `var res := ${fnName.toLowerCase()}(${inVal}) # ${outStr}`,
      unrealCpp: `float Res = FMath::${fnName}(${inVal}f); // ${outStr}`,
      unrealBp: {
        title: `${fnName} (Radians)`,
        inputs: [{ name: mode === "acos" ? "X" : mode === "asin" ? "Y" : "Angle (Rad)", type: "float", value: inVal }],
        outputs: [{ name: "Return Value", type: "float", value: outStr }]
      },
      csharp: `float res = MathF.${fnName}(${inVal}f); // ${outStr}`,
      cpp: `float res = std::${fnName.toLowerCase()}(${inVal}f); // ${outStr}`
    };
  }

  static buildVector(concept, mode, state) {
    const a = state.vecA || { x: 1, y: 1, z: 0 };
    const b = state.vecB || { x: 0, y: 1, z: 0 };
    const dot = f(state.dot, 3);
    const det = f(state.det, 3);

    if (mode === "dot") {
      return {
        unity: `Vector3 a = new Vector3(${v3(a)});\nVector3 b = new Vector3(${v3(b)});\nfloat dot = Vector3.Dot(a, b); // ${dot}f`,
        godotCs: `Vector3 a = new(${v3(a)}), b = new(${v3(b)});\nfloat dot = a.Dot(b); // ${dot}f`,
        godotGd: `var dot := Vector3(${f(a.x,2)}, ${f(a.y,2)}, 0.0).dot(Vector3(${f(b.x,2)}, ${f(b.y,2)}, 0.0)) # ${dot}`,
        unrealCpp: `double Dot = FVector::DotProduct(FVector(${v3(a)}), FVector(${v3(b)})); // ${dot}`,
        unrealBp: {
          title: "Dot Product",
          inputs: [
            { name: "A", type: "vector", value: `(${f(a.x,2)}, ${f(a.y,2)}, 0)` },
            { name: "B", type: "vector", value: `(${f(b.x,2)}, ${f(b.y,2)}, 0)` }
          ],
          outputs: [{ name: "Return Value", type: "float", value: dot }]
        },
        csharp: `float dot = Vector3.Dot(new(${v3(a)}), new(${v3(b)})); // ${dot}f`,
        cpp: `float dot = glm::dot(glm::vec3(${v3(a)}), glm::vec3(${v3(b)})); // ${dot}f`
      };
    }

    if (mode === "direction") {
      const dx = f(b.x - a.x, 2), dy = f(b.y - a.y, 2);
      return {
        unity: `Vector2 dir = targetPos - originPos;\n// (${f(b.x,2)}, ${f(b.y,2)}) - (${f(a.x,2)}, ${f(a.y,2)}) = (${dx}, ${dy})`,
        godotCs: `Vector2 dir = targetPos - originPos; // (${dx}, ${dy})`,
        godotGd: `var dir := target_pos - origin_pos # (${dx}, ${dy})`,
        unrealCpp: `FVector2D Dir = TargetPos - OriginPos; // (${dx}, ${dy})`,
        unrealBp: {
          title: "Vector - Vector (Subtract)",
          inputs: [
            { name: "Target (B)", type: "vector", value: `(${f(b.x,2)}, ${f(b.y,2)})` },
            { name: "Origin (A)", type: "vector", value: `(${f(a.x,2)}, ${f(a.y,2)})` }
          ],
          outputs: [{ name: "Direction", type: "vector", value: `(${dx}, ${dy})` }]
        },
        csharp: `Vector2 dir = new Vector2(${v2(b)}) - new Vector2(${v2(a)}); // (${dx}, ${dy})`,
        cpp: `glm::vec2 dir = target - origin; // (${dx}, ${dy})`
      };
    }

    if (mode === "deadzone") {
      const raw = state.rawStick || { x: 0.4, y: 0.3 };
      const sc = state.scaledStick || { x: 0.2, y: 0.15, mag: 0.25 };
      const dz = f(state.innerDeadzone ?? 0.28, 2);
      return {
        unity: `Vector2 raw = new Vector2(${v2(raw)});\nfloat m = raw.magnitude;\nVector2 clean = m < ${dz}f ? Vector2.zero : (raw / m) * Mathf.Clamp01((m - ${dz}f) / (1f - ${dz}f));\n// Sortie = (${f(sc.x,2)}, ${f(sc.y,2)})`,
        godotCs: `Vector2 move = Input.GetVector("left", "right", "up", "down", ${dz}f);`,
        godotGd: `var move := Input.get_vector("left", "right", "up", "down", ${dz})`,
        unrealCpp: `// Enhanced Input: UInputModifierDeadZone (Type = Radial, LowerThreshold = ${dz}f)`,
        unrealBp: {
          title: "Scaled Radial Deadzone",
          inputs: [
            { name: "Raw Stick", type: "vector", value: `(${f(raw.x,2)}, ${f(raw.y,2)})` },
            { name: "Deadzone", type: "float", value: dz }
          ],
          outputs: [{ name: "Clean Input", type: "vector", value: `(${f(sc.x,2)}, ${f(sc.y,2)})` }]
        },
        csharp: `float m = raw.Length();\nVector2 clean = m < ${dz}f ? Vector2.Zero : (raw / m) * Math.Clamp((m - ${dz}f) / (1f - ${dz}f), 0f, 1f);`,
        cpp: `float m = glm::length(raw);\nvec2 clean = m < ${dz}f ? vec2(0) : (raw / m) * glm::clamp((m - ${dz}f) / (1.f - ${dz}f), 0.f, 1.f);`
      };
    }

    return {
      unity: `// A=(${f(a.x,2)}, ${f(a.y,2)}) | B=(${f(b.x,2)}, ${f(b.y,2)}) | Dot=${dot}, Det=${det}\n${concept.signatures.unity}`,
      godotCs: `// A=(${f(a.x,2)}, ${f(a.y,2)}) | B=(${f(b.x,2)}, ${f(b.y,2)})\n${concept.signatures.godotCs}`,
      godotGd: `# A=(${f(a.x,2)}, ${f(a.y,2)}) | B=(${f(b.x,2)}, ${f(b.y,2)})\n${concept.signatures.godotGd}`,
      unrealCpp: `// A=(${f(a.x,2)}, ${f(a.y,2)}) | B=(${f(b.x,2)}, ${f(b.y,2)})\n${concept.signatures.unrealCpp}`,
      unrealBp: {
        title: concept.signatures.unrealBp,
        inputs: [
          { name: "Vector A", type: "vector", value: `(${f(a.x,2)}, ${f(a.y,2)})` },
          { name: "Vector B", type: "vector", value: `(${f(b.x,2)}, ${f(b.y,2)})` }
        ],
        outputs: [{ name: "Result", type: "float", value: mode === "matrix" ? det : dot }]
      },
      csharp: `${concept.signatures.csharp}\n// Dot=${dot}, Det2D=${det}`,
      cpp: `${concept.signatures.cpp}\n// Dot=${dot}, Det2D=${det}`
    };
  }

  static build3D(concept, mode, state) {
    const q = state.quat || { x: 0, y: 0, z: 0, w: 1 };
    const eu = state.euler || { x: 20, y: 35, z: 10 };
    const ax = state.axis || { x: 0, y: 1, z: 0, angle: 60 };
    const tg = state.target || { x: 1.5, y: 1.0, z: 1.4 };

    if (mode === "qangleaxis" || mode === "quatanatomy") {
      return {
        unity: `Vector3 axis = new Vector3(${v3(ax)}).normalized;\nQuaternion q = Quaternion.AngleAxis(${ax.angle}f, axis);\n// q = (${f(q.x,3)}, ${f(q.y,3)}, ${f(q.z,3)}, w=${f(q.w,3)})`,
        godotCs: `Quaternion q = new Quaternion(new Vector3(${v3(ax)}).Normalized(), Mathf.DegToRad(${ax.angle}f));`,
        godotGd: `var q := Quaternion(Vector3(${f(ax.x,2)}, ${f(ax.y,2)}, ${f(ax.z,2)}).normalized(), deg_to_rad(${ax.angle}))`,
        unrealCpp: `FQuat Q(FVector(${v3(ax)}).GetSafeNormal(), FMath::DegreesToRadians(${ax.angle}f));`,
        unrealBp: {
          title: "Quaternion from Axis and Angle",
          inputs: [
            { name: "Axis", type: "vector", value: `(${f(ax.x,2)}, ${f(ax.y,2)}, ${f(ax.z,2)})` },
            { name: "Angle (Deg)", type: "float", value: `${ax.angle}°` }
          ],
          outputs: [{ name: "Quat", type: "quat", value: `(${f(q.x,2)}, ${f(q.y,2)}, ${f(q.z,2)}, ${f(q.w,2)})` }]
        },
        csharp: `Quaternion q = Quaternion.CreateFromAxisAngle(Vector3.Normalize(new(${v3(ax)})), ${f((ax.angle * Math.PI) / 180, 3)}f);`,
        cpp: `glm::quat q = glm::angleAxis(glm::radians(${ax.angle}.0f), glm::normalize(glm::vec3(${v3(ax)})));`
      };
    }

    if (mode === "qlookrotation") {
      return {
        unity: `Vector3 dir = new Vector3(${v3(tg)});\nQuaternion q = Quaternion.LookRotation(dir, Vector3.up);`,
        godotCs: `Quaternion q = Basis.LookingAt(new Vector3(${v3(tg)})).GetRotationQuaternion();`,
        godotGd: `var q := Basis.looking_at(Vector3(${f(tg.x,2)}, ${f(tg.y,2)}, ${f(tg.z,2)})).get_rotation_quaternion()`,
        unrealCpp: `FQuat Q = FRotationMatrix::MakeFromXZ(FVector(${v3(tg)}), FVector::UpVector).ToQuat();`,
        unrealBp: {
          title: "Find Look at Rotation",
          inputs: [
            { name: "Start", type: "vector", value: "(0, 0, 0)" },
            { name: "Target", type: "vector", value: `(${f(tg.x,2)}, ${f(tg.y,2)}, ${f(tg.z,2)})` }
          ],
          outputs: [{ name: "Return Value", type: "rotator", value: `Quat(${f(q.x,2)}, ${f(q.y,2)}, ${f(q.z,2)}, ${f(q.w,2)})` }]
        },
        csharp: `var m = Matrix4x4.CreateLookAt(Vector3.Zero, new(${v3(tg)}), Vector3.UnitY);\nvar q = Quaternion.CreateFromRotationMatrix(m);`,
        cpp: `glm::quat q = glm::quatLookAt(glm::normalize(glm::vec3(${v3(tg)})), glm::vec3(0,1,0));`
      };
    }

    if (mode === "qslerp") {
      const t = f(state.slerpT ?? 0.5, 2);
      return {
        unity: `Quaternion q = Quaternion.Slerp(qStart, qEnd, ${t}f);\n// q = (${f(q.x,3)}, ${f(q.y,3)}, ${f(q.z,3)}, ${f(q.w,3)})`,
        godotCs: `Quaternion q = qStart.Slerp(qEnd, ${t}f);`,
        godotGd: `var q := q_start.slerp(q_end, ${t})`,
        unrealCpp: `FQuat Q = FQuat::Slerp(QStart, QEnd, ${t}f);`,
        unrealBp: {
          title: "Lerp (Quat) / Slerp",
          inputs: [
            { name: "A", type: "quat", value: "QStart" },
            { name: "B", type: "quat", value: "QEnd" },
            { name: "Alpha", type: "float", value: t }
          ],
          outputs: [{ name: "Return Value", type: "quat", value: `(${f(q.x,2)}, ${f(q.y,2)}, ${f(q.z,2)}, ${f(q.w,2)})` }]
        },
        csharp: `Quaternion q = Quaternion.Slerp(qStart, qEnd, ${t}f);`,
        cpp: `glm::quat q = glm::slerp(qStart, qEnd, ${t}f);`
      };
    }

    if (mode === "coord3d") {
      const c = state.coord3d?.cart || { x: 1, y: 1, z: 1 };
      const rho = f(state.coord3d?.rho ?? 1.9, 1);
      return {
        unity: `// ρ=${rho}, θ=${state.coord3d?.theta ?? 45}°, φ=${state.coord3d?.phi ?? 55}°\nVector3 camPos = new Vector3(${v3(c)});`,
        godotCs: `Vector3 camPos = new Vector3(${v3(c)});`,
        godotGd: `var cam_pos := Vector3(${f(c.x,2)}, ${f(c.y,2)}, ${f(c.z,2)})`,
        unrealCpp: `FVector Pos = FVector2D(PhiRad, ThetaRad).SphericalToUnitCartesian() * ${rho}f;`,
        unrealBp: {
          title: "Spherical to Unit Cartesian",
          inputs: [
            { name: "Phi / Theta", type: "vector", value: `(${state.coord3d?.phi ?? 55}°, ${state.coord3d?.theta ?? 45}°)` },
            { name: "Radius (ρ)", type: "float", value: rho }
          ],
          outputs: [{ name: "Position 3D", type: "vector", value: `(${f(c.x,2)}, ${f(c.y,2)}, ${f(c.z,2)})` }]
        },
        csharp: `var pos = new Vector3(${v3(c)});`,
        cpp: `glm::vec3 pos(${v3(c)});`
      };
    }

    if (mode === "cross3d") {
      const a = state.vecA || { x: 1.5, y: 0.3, z: 0.4 };
      const b = state.vecB || { x: 0.2, y: 0.5, z: 1.5 };
      const c = state.cross || { x: 0, y: 1, z: 0 };
      return {
        unity: `Vector3 n = Vector3.Cross(new(${v3(a)}), new(${v3(b)}));\n// A × B = (${f(c.x,2)}, ${f(c.y,2)}, ${f(c.z,2)})`,
        godotCs: `Vector3 n = a.Cross(b); // (${f(c.x,2)}, ${f(c.y,2)}, ${f(c.z,2)})`,
        godotGd: `var n := a.cross(b) # (${f(c.x,2)}, ${f(c.y,2)}, ${f(c.z,2)})`,
        unrealCpp: `FVector N = FVector::CrossProduct(A, B); // (${f(c.x,2)}, ${f(c.y,2)}, ${f(c.z,2)})`,
        unrealBp: {
          title: "Cross Product",
          inputs: [
            { name: "A", type: "vector", value: `(${f(a.x,1)}, ${f(a.y,1)}, ${f(a.z,1)})` },
            { name: "B", type: "vector", value: `(${f(b.x,1)}, ${f(b.y,1)}, ${f(b.z,1)})` }
          ],
          outputs: [{ name: "A × B", type: "vector", value: `(${f(c.x,2)}, ${f(c.y,2)}, ${f(c.z,2)})` }]
        },
        csharp: `Vector3 n = Vector3.Cross(a, b);`,
        cpp: `glm::vec3 n = glm::cross(a, b);`
      };
    }

    if (mode === "coordsys") {
      const names = ["Unity (LH · Y-Up · +Z Fwd)", "Godot (RH · Y-Up · -Z Fwd)", "Unreal (LH · Z-Up · +X Fwd)"];
      const cur = names[state.enginePreset || 0];
      return {
        unity: `// Repère actif : ${cur}\n// Unity: Right=+X, Up=+Y, Forward=+Z (1u = 1m, Main Gauche)\nVector3 fwd = transform.forward;`,
        godotCs: `// Godot 4: Right=+X, Up=+Y, Forward=-Z (1u = 1m, Main Droite)\nVector3 fwd = -GlobalTransform.Basis.Z;`,
        godotGd: `# Godot 4: Right=+X, Up=+Y, Forward=-Z (Main Droite)\nvar fwd := -global_transform.basis.z`,
        unrealCpp: `// Unreal Engine: Forward=+X, Right=+Y, Up=+Z (1u = 1cm, Main Gauche)\nFVector Fwd = GetActorForwardVector();`,
        unrealBp: {
          title: "Get Actor Forward / Right / Up Vector",
          inputs: [{ name: "Target", type: "struct", value: "Self (Actor)" }],
          outputs: [
            { name: "Forward (+X)", type: "vector", value: "(1, 0, 0)" },
            { name: "Right (+Y)", type: "vector", value: "(0, 1, 0)" },
            { name: "Up (+Z)", type: "vector", value: "(0, 0, 1)" }
          ]
        },
        csharp: `// Conversion Unity → Unreal (cm) : new(u.Z * 100, u.X * 100, u.Y * 100);`,
        cpp: `// Conversion Unity (LH) → OpenGL/GLM (RH) : glm::vec3(u.x, u.y, -u.z);`
      };
    }

    if (mode === "frustum") {
      const fov = state.frustumFov ?? 60;
      const pt = state.testPt || { x: 0.5, y: 0.3, z: 1.8 };
      return {
        unity: `// FOV = ${fov}°, Objet = (${v3(pt)})\nVector3 sp = Camera.main.WorldToScreenPoint(new Vector3(${v3(pt)}));\nbool inFront = sp.z > 0f;`,
        godotCs: `bool visible = cam.IsPositionInFrustum(new Vector3(${v3(pt)}));`,
        godotGd: `var visible := cam.is_position_in_frustum(Vector3(${f(pt.x,2)}, ${f(pt.y,2)}, ${f(pt.z,2)}))`,
        unrealCpp: `UGameplayStatics::ProjectWorldToScreen(PC, FVector(${v3(pt)}), ScreenPos);`,
        unrealBp: {
          title: "Project World Location to Screen",
          inputs: [
            { name: "World Location", type: "vector", value: `(${f(pt.x,2)}, ${f(pt.y,2)}, ${f(pt.z,2)})` },
            { name: "FOV", type: "float", value: `${fov}°` }
          ],
          outputs: [
            { name: "Screen Position", type: "vector", value: "2D Pixel" },
            { name: "In Frustum", type: "bool", value: "Live" }
          ]
        },
        csharp: `var proj = Matrix4x4.CreatePerspectiveFieldOfView(${f((fov * Math.PI) / 180, 3)}f, 1.45f, 0.65f, 2.8f);`,
        cpp: `glm::mat4 proj = glm::perspective(glm::radians(${fov}.0f), 1.45f, 0.65f, 2.8f);`
      };
    }

    if (mode === "basis") {
      return {
        unity: `Vector3 f = new Vector3(${v3(tg)}).normalized;\nVector3 r = Vector3.Cross(Vector3.up, f).normalized;\nVector3 u = Vector3.Cross(f, r);`,
        godotCs: `Basis b = Basis.LookingAt(new Vector3(${v3(tg)})).Orthonormalized();`,
        godotGd: `var b := Basis.looking_at(Vector3(${f(tg.x,2)}, ${f(tg.y,2)}, ${f(tg.z,2)})).orthonormalized()`,
        unrealCpp: `FVector X, Y, Z;\nFVector::CreateOrthonormalBasis(X, Y, Z);`,
        unrealBp: {
          title: "Make Rot from XZ",
          inputs: [
            { name: "X (Forward)", type: "vector", value: `(${f(tg.x,2)}, ${f(tg.y,2)}, ${f(tg.z,2)})` },
            { name: "Z (Up Ref)", type: "vector", value: "(0, 0, 1)" }
          ],
          outputs: [{ name: "Orthonormal Rot", type: "rotator", value: "Right, Up, Fwd" }]
        },
        csharp: `Vector3 r = Vector3.Normalize(Vector3.Cross(Vector3.UnitY, f));\nVector3 u = Vector3.Cross(f, r);`,
        cpp: `glm::vec3 r = glm::normalize(glm::cross(glm::vec3(0,1,0), f));\nglm::vec3 u = glm::cross(f, r);`
      };
    }

    if (mode === "quatmult") {
      return {
        unity: `Quaternion qResult = qParent * qLocal;\n// q = (${f(q.x,3)}, ${f(q.y,3)}, ${f(q.z,3)}, w=${f(q.w,3)})`,
        godotCs: `Quaternion qResult = qParent * qLocal;`,
        godotGd: `var q_result := q_parent * q_local`,
        unrealCpp: `FQuat QResult = QParent * QLocal;`,
        unrealBp: {
          title: "Combine Rotators / Multiply (Quat)",
          inputs: [
            { name: "A (Parent)", type: "quat", value: `Yaw ${eu.y}°` },
            { name: "B (Local)", type: "quat", value: "Local" }
          ],
          outputs: [{ name: "Result", type: "quat", value: `(${f(q.x,2)}, ${f(q.y,2)}, ${f(q.z,2)}, ${f(q.w,2)})` }]
        },
        csharp: `Quaternion qResult = qParent * qLocal;`,
        cpp: `glm::quat qResult = qParent * qLocal;`
      };
    }

    if (mode === "quatinverse") {
      return {
        unity: `Quaternion qInv = Quaternion.Inverse(q);\n// q⁻¹ = (${f(q.x,3)}, ${f(q.y,3)}, ${f(q.z,3)}, w=${f(q.w,3)})`,
        godotCs: `Quaternion qInv = q.Inverse();`,
        godotGd: `var q_inv := q.inverse()`,
        unrealCpp: `FQuat QInv = Q.Inverse();`,
        unrealBp: {
          title: "Invert Quat / Invert Rotator",
          inputs: [{ name: "In Quat", type: "quat", value: `(${f(-q.x,2)}, ${f(-q.y,2)}, ${f(-q.z,2)}, ${f(q.w,2)})` }],
          outputs: [{ name: "Inverse q⁻¹", type: "quat", value: `(${f(q.x,2)}, ${f(q.y,2)}, ${f(q.z,2)}, ${f(q.w,2)})` }]
        },
        csharp: `Quaternion qInv = Quaternion.Inverse(q);`,
        cpp: `glm::quat qInv = glm::inverse(q);`
      };
    }

    return {
      unity: `Quaternion q = Quaternion.Euler(${eu.x}f, ${eu.y}f, ${eu.z}f);\n// q = (${f(q.x,3)}, ${f(q.y,3)}, ${f(q.z,3)}, w=${f(q.w,3)})`,
      godotCs: `Quaternion q = Quaternion.FromEuler(new Vector3(Mathf.DegToRad(${eu.x}f), Mathf.DegToRad(${eu.y}f), Mathf.DegToRad(${eu.z}f)));`,
      godotGd: `var q := Quaternion.from_euler(Vector3(deg_to_rad(${eu.x}), deg_to_rad(${eu.y}), deg_to_rad(${eu.z})))`,
      unrealCpp: `FQuat Q = FRotator(${eu.x}f, ${eu.y}f, ${eu.z}f).Quaternion();`,
      unrealBp: {
        title: concept.signatures.unrealBp,
        inputs: [
          { name: "Pitch", type: "float", value: `${eu.x}°` },
          { name: "Yaw", type: "float", value: `${eu.y}°` },
          { name: "Roll", type: "float", value: `${eu.z}°` }
        ],
        outputs: [{ name: "Quat", type: "quat", value: `(${f(q.x,2)}, ${f(q.y,2)}, ${f(q.z,2)}, ${f(q.w,2)})` }]
      },
      csharp: `Quaternion q = Quaternion.CreateFromYawPitchRoll(${f((eu.y * Math.PI) / 180, 2)}f, ${f((eu.x * Math.PI) / 180, 2)}f, ${f((eu.z * Math.PI) / 180, 2)}f);`,
      cpp: `glm::quat q(glm::radians(glm::vec3(${eu.x}.f, ${eu.y}.f, ${eu.z}.f)));`
    };
  }

  static buildCollision(concept, mode, state) {
    if (mode === "euclide") {
      const tot = state.totalItems ?? 17;
      const stk = state.stackSize ?? 5;
      const q = Math.floor(tot / stk), r = tot % stk;
      return {
        unity: `int stacks = ${tot} / ${stk};    // Quotient = ${q}\nint remainder = ${tot} % ${stk}; // Reste = ${r}`,
        godotCs: `int stacks = ${tot} / ${stk}; // ${q}\nint rem = Mathf.PosMod(${tot}, ${stk}); // ${r}`,
        godotGd: `var stacks := ${tot} / ${stk} # ${q}\nvar rem := posmod(${tot}, ${stk}) # ${r}`,
        unrealCpp: `int32 Stacks = ${tot} / ${stk}; // ${q}\nint32 Rem = ${tot} % ${stk}; // ${r}`,
        unrealBp: {
          title: "Division (Whole and Remainder)",
          inputs: [{ name: "Dividend (A)", type: "int", value: String(tot) }, { name: "Divisor (B)", type: "int", value: String(stk) }],
          outputs: [{ name: "Quotient", type: "int", value: String(q) }, { name: "Remainder", type: "int", value: String(r) }]
        },
        csharp: `(int q, int r) = Math.DivRem(${tot}, ${stk}); // (${q}, ${r})`,
        cpp: `auto [q, r] = std::div(${tot}, ${stk}); // (${q}, ${r})`
      };
    }

    const a = state.vecA || { x: 0, y: 0 }, b = state.vecB || { x: 1, y: 1 };
    return {
      unity: `// A=(${f(a.x,2)}, ${f(a.y,2)}) · B=(${f(b.x,2)}, ${f(b.y,2)})\n${concept.signatures.unity}`,
      godotCs: `${concept.signatures.godotCs}`,
      godotGd: `${concept.signatures.godotGd}`,
      unrealCpp: `${concept.signatures.unrealCpp}`,
      unrealBp: {
        title: concept.signatures.unrealBp,
        inputs: [
          { name: "A", type: "vector", value: `(${f(a.x,2)}, ${f(a.y,2)})` },
          { name: "B", type: "vector", value: `(${f(b.x,2)}, ${f(b.y,2)})` }
        ],
        outputs: [{ name: "Out", type: "bool", value: "Live" }]
      },
      csharp: `${concept.signatures.csharp}`,
      cpp: `${concept.signatures.cpp}`
    };
  }

  static buildPhysics(concept, mode, state) {
    const g = f(state.gravity ?? 9.81, 2);
    const t = f(state.curveT ?? 0.5, 2);
    if (mode === "ballistic") {
      const h = f(state.jumpHeight ?? 3.2, 1), ta = f(state.timeToApex ?? 0.45, 2);
      const v0y = ((2 * Number(h)) / Number(ta)).toFixed(2);
      const grav = ((2 * Number(h)) / (Number(ta) * Number(ta))).toFixed(2);
      return {
        unity: `// Saut calibré (H=${h}m, tApex=${ta}s) :\nfloat jumpVel = 2f * ${h}f / ${ta}f;        // ${v0y} m/s\nfloat gravity = -2f * ${h}f / (${ta}f * ${ta}f); // -${grav} m/s²`,
        godotCs: `float jumpVel = 2f * ${h}f / ${ta}f; // ${v0y} m/s\nfloat gravity = 2f * ${h}f / (${ta}f * ${ta}f); // ${grav} m/s²`,
        godotGd: `var jump_vel := 2.0 * ${h} / ${ta} # ${v0y}\nvar gravity := 2.0 * ${h} / (${ta} * ${ta}) # ${grav}`,
        unrealCpp: `UGameplayStatics::PredictProjectilePath(this, PredictParams, PredictResult);`,
        unrealBp: {
          title: "Predict Projectile Path",
          impure: true,
          inputs: [
            { name: "Exec", type: "exec" },
            { name: "Launch Velocity", type: "vector", value: `(${f((state.v0?.x ?? 2) * 3, 1)}, ${v0y})` },
            { name: "Gravity Z", type: "float", value: `-${g}` }
          ],
          outputs: [
            { name: "Out", type: "exec" },
            { name: "Path Positions", type: "struct", value: "Array<FVector>" }
          ]
        },
        csharp: `Vector2 pos = p0 + v0 * t + 0.5f * new Vector2(0, -${g}f) * t * t;`,
        cpp: `glm::vec2 pos = p0 + v0 * t + 0.5f * glm::vec2(0.f, -${g}f) * t * t;`
      };
    }

    return {
      unity: `// Paramètre live t = ${t}\n${concept.signatures.unity}`,
      godotCs: `${concept.signatures.godotCs}`,
      godotGd: `${concept.signatures.godotGd}`,
      unrealCpp: `${concept.signatures.unrealCpp}`,
      unrealBp: {
        title: concept.signatures.unrealBp,
        inputs: [{ name: "Alpha / Dt", type: "float", value: t }],
        outputs: [{ name: "Position / Force", type: "vector", value: "Live" }]
      },
      csharp: `${concept.signatures.csharp}`,
      cpp: `${concept.signatures.cpp}`
    };
  }

  static buildProcedural(concept, mode, state) {
    const p = state.probe || { x: 0.5, y: 0.5, val: 0.5 };
    if (mode === "color") {
      const k = Math.round(state.kelvin ?? 6500);
      const c = state.rgb || { r: 1, g: 1, b: 1 };
      return {
        unity: `Color c = Mathf.CorrelatedColorTemperatureToRGB(${k}f);\n// RGB(${f(c.r,2)}, ${f(c.g,2)}, ${f(c.b,2)})`,
        godotCs: `Color lin = color.SrgbToLinear(); // Kelvin ${k}K`,
        godotGd: `var lin := color.srgb_to_linear() # Kelvin ${k}K`,
        unrealCpp: `FLinearColor C = FLinearColor::MakeFromColorTemperature(${k}.0f);`,
        unrealBp: {
          title: "Make Color From Temperature",
          inputs: [{ name: "Temp (Kelvin)", type: "float", value: `${k} K` }],
          outputs: [{ name: "Linear Color", type: "color", value: `(${f(c.r,2)}, ${f(c.g,2)}, ${f(c.b,2)})` }]
        },
        csharp: `Vector3 linear = new(MathF.Pow(r, 2.2f), MathF.Pow(g, 2.2f), MathF.Pow(b, 2.2f));`,
        cpp: `glm::vec3 lin = glm::pow(srgb, glm::vec3(2.2f));`
      };
    }
    if (mode === "sdf") {
      const k = f(state.sdfK ?? 0.35, 2);
      return {
        unity: `// HLSL Smooth Minimum (Metaballs / UI SDF)\nfloat h = max(${k} - abs(d1 - d2), 0.0) / ${k};\nfloat d = min(d1, d2) - h * h * ${k} * 0.25;`,
        godotCs: `float h = Mathf.Max(${k}f - Mathf.Abs(d1 - d2), 0f) / ${k}f;\nfloat d = Mathf.Min(d1, d2) - h * h * ${k}f * 0.25f;`,
        godotGd: `var h := maxf(${k} - absf(d1 - d2), 0.0) / ${k}\nvar d := minf(d1, d2) - h * h * ${k} * 0.25`,
        unrealCpp: `// Material Graph: SmoothMinimum(A, B, Smoothness=${k})`,
        unrealBp: {
          title: "Smooth Minimum (SDF)",
          subtitle: "Material Function",
          inputs: [
            { name: "Distance A", type: "float", value: "dBox" },
            { name: "Distance B", type: "float", value: "dCircle" },
            { name: "Smoothness (k)", type: "float", value: k }
          ],
          outputs: [{ name: "SDF Distance", type: "float", value: f(p.val, 3) }]
        },
        csharp: `float h = Math.Max(${k}f - Math.Abs(d1 - d2), 0f) / ${k}f;\nfloat d = Math.Min(d1, d2) - h * h * ${k}f * 0.25f;`,
        cpp: `float h = std::max(${k}f - std::abs(d1 - d2), 0.f) / ${k}f;\nfloat d = std::min(d1, d2) - h * h * ${k}f * 0.25f;`
      };
    }

    const fr = f(state.freq ?? 3.5, 1);
    return {
      unity: `float n = Mathf.PerlinNoise(${f(p.x * Number(fr), 2)}f, ${f(p.y * Number(fr), 2)}f); // ${f(p.val, 3)}f`,
      godotCs: `var noise = new FastNoiseLite { FractalOctaves = ${state.octaves ?? 4} };\nfloat n = noise.GetNoise2D(${f(p.x * 100, 1)}f, ${f(p.y * 100, 1)}f);`,
      godotGd: `var noise := FastNoiseLite.new()\nnoise.fractal_octaves = ${state.octaves ?? 4}\nvar n := noise.get_noise_2d(${f(p.x * 100, 1)}, ${f(p.y * 100, 1)})`,
      unrealCpp: `float N = FMath::PerlinNoise2D(FVector2D(${f(p.x * Number(fr), 2)}f, ${f(p.y * Number(fr), 2)}f));`,
      unrealBp: {
        title: concept.signatures.unrealBp,
        inputs: [
          { name: "Position", type: "vector", value: `(${f(p.x, 2)}, ${f(p.y, 2)})` },
          { name: "Octaves / Freq", type: "float", value: String(state.octaves ?? fr) }
        ],
        outputs: [{ name: "Noise", type: "float", value: f(p.val, 3) }]
      },
      csharp: `${concept.signatures.csharp}`,
      cpp: `${concept.signatures.cpp}`
    };
  }

  static highlight(code) {
    const escaped = String(code || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped
      .split("\n")
      .map((line) => {
        const cmIdx = line.search(/(\/\/|#)/);
        const body = cmIdx >= 0 ? line.slice(0, cmIdx) : line;
        const comment = cmIdx >= 0 ? `<span class="hl-cm">${line.slice(cmIdx)}</span>` : "";

        const hi = body
          .replace(/\b(float|double|int|uint|uint32_t|int32|bool|var|const|new|return|if|else|for|foreach|in|out|ref|auto|enum)\b/g, '<span class="hl-kw">$1</span>')
          .replace(/\b(Vector2|Vector3|Quaternion|Matrix4x4|Mathf|MathF|Math|FVector|FVector2D|FQuat|FRotator|FMath|FLinearColor|FTransform|Basis|Transform3D|Plane|Color|FastNoiseLite|RandomNumberGenerator|FRandomStream|UGameplayStatics|UKismetMathLibrary|glm|std)\b/g, '<span class="hl-type">$1</span>')
          .replace(/\b(-?\d+(?:\.\d+)?[fu]?)\b/g, '<span class="hl-num">$1</span>');
        return hi + comment;
      })
      .join("\n");
  }
}
