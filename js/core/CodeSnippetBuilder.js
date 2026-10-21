export class CodeSnippetBuilder {
  static fmt(num) {
    return Number(num || 0).toFixed(3);
  }

  static build(funcItem, state) {
    if (funcItem.sandbox === "space3d") return this.buildSpace3D(funcItem, state);
    if (funcItem.sandbox === "trig") return this.buildTrig(funcItem, state);
    if (funcItem.sandbox === "dot" || funcItem.sandbox === "project" || funcItem.sandbox === "alkashi") return this.buildDot(funcItem, state);
    if (funcItem.sandbox === "cross" || funcItem.sandbox === "matrix" || funcItem.sandbox === "barycentre" || funcItem.sandbox === "ballistic" || funcItem.sandbox === "vectorfield") return this.buildCross(funcItem, state);
    if (funcItem.sandbox === "perlin") return this.buildPerlin(state);
    if (funcItem.sandbox === "colortemp") return this.buildColorTemp(state);
    
    // On englobe Graph ET Geometry ici car ils utilisent le même système de fallback statique
    if (funcItem.sandbox === "graph" || funcItem.sandbox === "geometry") return this.buildGraph(funcItem, state);
    
    // Fallback par défaut si rien ne matche
    return { unity: "// Vide", dotnet: "// Vide", godotCs: "// Vide", cpp: "// Vide", unreal: "// Vide", blueprint: "[Node: Unspecified]", python: "# Vide" };
  }

  static buildSpace3D(funcItem, state) {
    const q = state.quat || { x: 0, y: 0, z: 0, w: 1 };
    const eu = state.euler || { x: 0, y: 0, z: 0 };
    const ax = state.axis || { x: 0, y: 1, z: 0, angle: 45 };
    const tg = state.target || { x: 1, y: 1, z: 1 };

    if (funcItem.id === "coord3d") {
      const c = state.coord3d.cart;
      return {
        unity: `float x = rho * Mathf.Sin(phi) * Mathf.Cos(theta);\nVector3 pos = new Vector3(${this.fmt(c.x)}f, ${this.fmt(c.y)}f, ${this.fmt(c.z)}f);`,
        godotCs: `Vector3 pos = new Vector3(${this.fmt(c.x)}f, ${this.fmt(c.y)}f, ${this.fmt(c.z)}f);`,
        dotnet: `var pos = new Vector3(${this.fmt(c.x)}f, ${this.fmt(c.y)}f, ${this.fmt(c.z)}f);`,
        cpp: `glm::vec3 pos(${this.fmt(c.x)}f, ${this.fmt(c.y)}f, ${this.fmt(c.z)}f);`,
        unreal: `FVector Pos = FVector2D(Phi, Theta).SphericalToUnitCartesian() * ${this.fmt(state.coord3d.rho)}f;`,
        blueprint: `[Node: Spherical to Unit Cartesian]\n ➥ Out: (${this.fmt(c.x)}, ${this.fmt(c.y)}, ${this.fmt(c.z)})`,
        python: `import math\npos = [rho * math.sin(phi) * math.cos(theta), rho * math.cos(phi), rho * math.sin(phi) * math.sin(theta)]`
      };
    }

    if (funcItem.id === "qangleaxis") {
      return {
        unity: `Vector3 axis = new Vector3(${this.fmt(ax.x)}f, ${this.fmt(ax.y)}f, ${this.fmt(ax.z)}f).normalized;\nQuaternion q = Quaternion.AngleAxis(${ax.angle}f, axis);`,
        godotCs: `Vector3 axis = new Vector3(${this.fmt(ax.x)}f, ${this.fmt(ax.y)}f, ${this.fmt(ax.z)}f).Normalized();\nQuaternion q = new Quaternion(axis, Mathf.DegToRad(${ax.angle}f));`,
        dotnet: `Quaternion q = Quaternion.CreateFromAxisAngle(axis, ${this.fmt((ax.angle * Math.PI) / 180)}f);`,
        cpp: `glm::quat q = glm::angleAxis(glm::radians(${ax.angle}.0f), glm::normalize(axis));`,
        unreal: `FQuat Q(FVector(${this.fmt(ax.x)}f, ${this.fmt(ax.y)}f, ${this.fmt(ax.z)}f).GetSafeNormal(), FMath::DegreesToRadians(${ax.angle}f));`,
        blueprint: `[Node: Rotator from Axis and Angle]\n ├─ Axis: (${this.fmt(ax.x)}, ${this.fmt(ax.y)}, ${this.fmt(ax.z)})\n └─ Angle: ${ax.angle}°`,
        python: `# scipy.spatial.transform import Rotation\nq = Rotation.from_rotvec(${ax.angle} * axis)`
      };
    }

    if (funcItem.id === "qlookrotation") {
      return {
        unity: `Vector3 dir = new Vector3(${this.fmt(tg.x)}f, ${this.fmt(tg.y)}f, ${this.fmt(tg.z)}f);\nQuaternion q = Quaternion.LookRotation(dir, Vector3.up);`,
        godotCs: `Basis b = Basis.LookingAt(new Vector3(${this.fmt(tg.x)}f, ${this.fmt(tg.y)}f, ${this.fmt(tg.z)}f));\nQuaternion q = b.GetRotationQuaternion();`,
        dotnet: `Matrix4x4 m = Matrix4x4.CreateLookAt(Vector3.Zero, target, Vector3.UnitY);\nQuaternion q = Quaternion.CreateFromRotationMatrix(m);`,
        cpp: `glm::quat q = glm::quatLookAt(glm::normalize(target), glm::vec3(0, 1, 0));`,
        unreal: `FQuat Q = FRotationMatrix::MakeFromXZ(TargetDir, FVector::UpVector).ToQuat();`,
        blueprint: `[Node: Find Look at Rotation]\n ├─ Start: (0, 0, 0)\n └─ Target: (${this.fmt(tg.x)}, ${this.fmt(tg.y)}, ${this.fmt(tg.z)})`,
        python: `# Utilise math.atan2 pour calculer yaw et pitch`
      };
    }

    if (funcItem.id === "qslerp") {
      return {
        unity: `Quaternion q = Quaternion.Slerp(qStart, qEnd, ${this.fmt(state.slerpT)}f);`,
        godotCs: `Quaternion q = qStart.Slerp(qEnd, ${this.fmt(state.slerpT)}f);`,
        dotnet: `Quaternion q = Quaternion.Slerp(qStart, qEnd, ${this.fmt(state.slerpT)}f);`,
        cpp: `glm::quat q = glm::slerp(qStart, qEnd, ${this.fmt(state.slerpT)}f);`,
        unreal: `FQuat Q = FQuat::Slerp(QStart, QEnd, ${this.fmt(state.slerpT)}f);`,
        blueprint: `[Node: Lerp (Quat)]\n ├─ A: QStart | B: QEnd\n └─ Alpha: ${this.fmt(state.slerpT)}`,
        python: `# Slerp via scipy.spatial.transform.Slerp`
      };
    }

    return {
      unity: `Quaternion q = Quaternion.Euler(${eu.x}f, ${eu.y}f, ${eu.z}f);\n// q = (${this.fmt(q.x)}, ${this.fmt(q.y)}, ${this.fmt(q.z)}, ${this.fmt(q.w)})`,
      godotCs: `Quaternion q = Quaternion.FromEuler(new Vector3(Mathf.DegToRad(${eu.x}f), Mathf.DegToRad(${eu.y}f), Mathf.DegToRad(${eu.z}f)));`,
      dotnet: `Quaternion q = Quaternion.CreateFromYawPitchRoll(${this.fmt((eu.y * Math.PI) / 180)}f, ${this.fmt((eu.x * Math.PI) / 180)}f, ${this.fmt((eu.z * Math.PI) / 180)}f);`,
      cpp: `glm::quat q(glm::radians(glm::vec3(${eu.x}.f, ${eu.y}.f, ${eu.z}.f)));`,
      unreal: `FQuat Q = FRotator(${eu.x}f, ${eu.y}f, ${eu.z}f).Quaternion();`,
      blueprint: `[Node: Make Rotator -> To Quat]\n ├─ Pitch: ${eu.x}° | Yaw: ${eu.y}° | Roll: ${eu.z}°\n ➥ Quat: (${this.fmt(q.x)}, ${this.fmt(q.y)}, ${this.fmt(q.z)}, ${this.fmt(q.w)})`,
      python: `q = Rotation.from_euler('xyz', [${eu.x}, ${eu.y}, ${eu.z}], degrees=True)`
    };
  }

  static buildTrig(funcItem, state) {
    const pts = state.points || [];
    const p1 = pts[0] || { angleRad: 0, angleDeg: 0, radius: 1, x: 1, y: 0, out: 1 };
    const p2 = pts[1] || { angleRad: 1, angleDeg: 57.3, radius: 1, x: 0.54, y: 0.84, out: 0.54 };
    const id = funcItem.id;

    if (id === "deltaangle" || id === "lerpangle") {
      return {
        unity: `float a = ${this.fmt(p1.angleDeg)}f;\nfloat b = ${this.fmt(p2.angleDeg)}f;\nfloat res = Mathf.${funcItem.name}(a, b${id === "lerpangle" ? ", 0.5f" : ""});`,
        dotnet: `float delta = MathF.IEEERemainder(${this.fmt(p2.angleDeg)}f - ${this.fmt(p1.angleDeg)}f, 360f);`,
        godotCs: `float res = Mathf.${id === "deltaangle" ? "AngleDifference" : "LerpAngle"}(${this.fmt(p1.angleRad)}f, ${this.fmt(p2.angleRad)}f${id === "lerpangle" ? ", 0.5f" : ""});`,
        cpp: `float res = std::remainder(${this.fmt(p2.angleDeg)}f - ${this.fmt(p1.angleDeg)}f, 360.0f);`,
        unreal: `float res = FMath::FindDeltaAngleDegrees(${this.fmt(p1.angleDeg)}f, ${this.fmt(p2.angleDeg)}f);`,
        blueprint: `[Node: Find Delta Angle Degrees]\n ├─ A: ${this.fmt(p1.angleDeg)}° | B: ${this.fmt(p2.angleDeg)}°\n ➥ Return: ${this.fmt(p1.out)}°`,
        python: `res = math.remainder(${this.fmt(p2.angleDeg)} - ${this.fmt(p1.angleDeg)}, 360)`
      };
    }

    const un = pts.map((p, i) => `float r${i + 1} = Mathf.${funcItem.name}(${this.fmt(p.angleRad)}f);`).join("\n");
    const dn = pts.map((p, i) => `float r${i + 1} = MathF.${funcItem.name}(${this.fmt(p.angleRad)}f);`).join("\n");
    const gc = pts.map((p, i) => `float r${i + 1} = Mathf.${funcItem.name}(${this.fmt(p.angleRad)}f);`).join("\n");
    const cp = pts.map((p, i) => `float r${i + 1} = std::${funcItem.id}(${this.fmt(p.angleRad)}f);`).join("\n");
    const ue = pts.map((p, i) => `float r${i + 1} = FMath::${funcItem.name}(${this.fmt(p.angleRad)}f);`).join("\n");
    const bp = pts.map((p, i) => `[Node: ${funcItem.name}]\n ├─ In: ${this.fmt(p.angleRad)} rad\n ➥ Out: ${typeof p.out === "number" ? this.fmt(p.out) : "SinCos"}`).join("\n\n");
    const py = pts.map((p, i) => `r${i + 1} = math.${funcItem.id}(${this.fmt(p.angleRad)})`).join("\n");

    return { unity: un, dotnet: dn, godotCs: gc, cpp: cp, unreal: ue, blueprint: bp, python: py };
  }

  static buildDot(funcItem, state) {
    const a = state.vecA || {x: 0, y: 0, z: 0};
    const b = state.vecB || {x: 0, y: 0, z: 0};
    const sA = `${this.fmt(a.x)}f, ${this.fmt(a.y)}f, ${this.fmt(a.z || 0)}f`;
    const sB = `${this.fmt(b.x)}f, ${this.fmt(b.y)}f, ${this.fmt(b.z || 0)}f`;

    // Si on est dans le mode statique Direction, Magnitude ou Reflect
    if (["direction", "magnitude", "reflect"].includes(funcItem.id)) {
       return {
          unity: `${funcItem.unitySig ? funcItem.unitySig.split('\n')[0] : "// Non défini"}`,
          dotnet: `${funcItem.dotnetSig ? funcItem.dotnetSig.split('\n')[0] : "// Non défini"}`,
          godotCs: `${funcItem.godotCsSig ? funcItem.godotCsSig.split('\n')[0] : "// Non défini"}`,
          cpp: `${funcItem.cppSig ? funcItem.cppSig.split('\n')[0] : "// Non défini"}`,
          unreal: `${funcItem.unrealSig ? funcItem.unrealSig.split('\n')[0] : "// Non défini"}`,
          blueprint: `[Node: ${funcItem.bpSig || "Unknown"}]\n ├─ A: (${sA})\n └─ B: (${sB})`,
          python: `${funcItem.pySig ? funcItem.pySig.split('\n')[0] : "# numpy array ops"}`
        };
    }

    const dot = state.dot || 0;
    return {
      unity: `Vector3 a = new Vector3(${sA});\nVector3 b = new Vector3(${sB});\nfloat dot = Vector3.Dot(a, b);`,
      dotnet: `var a = new Vector3(${sA});\nvar b = new Vector3(${sB});\nfloat dot = Vector3.Dot(a, b);`,
      godotCs: `Vector3 a = new Vector3(${sA});\nVector3 b = new Vector3(${sB});\nfloat dot = a.Dot(b);`,
      cpp: `float dot = glm::dot(a, b);`,
      unreal: `double Dot = FVector::DotProduct(A, B);`,
      blueprint: `[Node: ${funcItem.bpSig}]\n ├─ A: (${sA})\n ├─ B: (${sB})\n ➥ Return: ${this.fmt(dot)}`,
      python: `dot = numpy.dot(a, b)`
    };
  }

  static buildCross(funcItem, state) {
    const a = state.vecA || {x: 0, y: 0, z: 0};
    const b = state.vecB || {x: 0, y: 0, z: 0};
    const sA = `${this.fmt(a.x)}f, ${this.fmt(a.y)}f, ${this.fmt(a.z || 0)}f`;
    const sB = `${this.fmt(b.x)}f, ${this.fmt(b.y)}f, ${this.fmt(b.z || 0)}f`;

    return {
      unity: `${funcItem.unitySig || "// Non défini"};`,
      dotnet: `${funcItem.dotnetSig || "// Non défini"};`,
      godotCs: `${funcItem.godotCsSig || "// Non défini"};`,
      cpp: `${funcItem.cppSig || "// Non défini"};`,
      unreal: `${funcItem.unrealSig || "// Non défini"};`,
      blueprint: `[Node: ${funcItem.bpSig}]\n ├─ A: (${sA})\n └─ B: (${sB})`,
      python: `${funcItem.pySig || "numpy.cross(a, b)"}`
    };
  }

  static buildPerlin(state) {
    const p = (state.probes && state.probes[0]) || { x: 0.5, y: 0.5, val: 0.5 };
    return {
      unity: `float n = Mathf.PerlinNoise(${this.fmt(p.x)}f, ${this.fmt(p.y)}f);`,
      dotnet: `float n = CustomPerlin2D(${this.fmt(p.x)}f, ${this.fmt(p.y)}f);`,
      godotCs: `var noise = new FastNoiseLite();\nfloat n = noise.GetNoise2D(${this.fmt(p.x)}f, ${this.fmt(p.y)}f);`,
      cpp: `float n = perlin_noise_2d(${this.fmt(p.x)}f, ${this.fmt(p.y)}f);`,
      unreal: `float n = FMath::PerlinNoise2D(FVector2D(${this.fmt(p.x)}f, ${this.fmt(p.y)}f));`,
      blueprint: `[Node: Make Perlin Noise 2D]\n ├─ X: ${this.fmt(p.x)} | Y: ${this.fmt(p.y)}\n ➥ Return: ${this.fmt(p.val)}`,
      python: `import noise\nn = noise.pnoise2(${this.fmt(p.x)}, ${this.fmt(p.y)})`
    };
  }

  static buildColorTemp(state) {
    const k = Math.round(state.kelvin || 6500);
    return {
      unity: `Color c = Mathf.CorrelatedColorTemperatureToRGB(${k}f);`,
      dotnet: `Vector3 rgb = KelvinToRgb(${k}f);`,
      godotCs: `Color c = ColorFromKelvin(${k}f);`,
      cpp: `Vec3 rgb = kelvin_to_rgb(${k}f);`,
      unreal: `FLinearColor C = FLinearColor::MakeFromColorTemperature(${k}f);`,
      blueprint: `[Node: Make Color From Temperature]\n ├─ Temp: ${k}K\n ➥ Return: LinearColor`,
      python: `# ColorTempToRGB(${k})`
    };
  }

  static buildGraph(funcItem, state) {
    if (["normalized", "pythagore", "thales", "euclide", "abs", "repeat", "round"].includes(funcItem.id)) {
        return {
          unity: `${funcItem.unitySig ? funcItem.unitySig.split('\n')[0] : "// Non défini"}`,
          dotnet: `${funcItem.dotnetSig ? funcItem.dotnetSig.split('\n')[0] : "// Non défini"}`,
          godotCs: `${funcItem.godotCsSig ? funcItem.godotCsSig.split('\n')[0] : "// Non défini"}`,
          cpp: `${funcItem.cppSig ? funcItem.cppSig.split('\n')[0] : "// Non défini"}`,
          unreal: `${funcItem.unrealSig ? funcItem.unrealSig.split('\n')[0] : "// Non défini"}`,
          blueprint: `[Node: ${funcItem.bpSig || "Unspecified"}]`,
          python: `${funcItem.pySig ? funcItem.pySig.split('\n')[0] : "# numpy ou math"}`
        };
    }

    const pr = state.probes || [];
    const id = funcItem.id;
    const name = funcItem.name.split(" ")[0];

    if (pr.length > 0) {
      const un = pr.map((p, i) => `float r${i + 1} = Mathf.${name}(${this.fmt(p.x)}f);`).join("\n");
      const dn = pr.map((p, i) => `float r${i + 1} = MathF.${name}(${this.fmt(p.x)}f);`).join("\n");
      const gc = pr.map((p, i) => `float r${i + 1} = Mathf.${name}(${this.fmt(p.x)}f);`).join("\n");
      const cp = pr.map((p, i) => `float r${i + 1} = std::${id}(${this.fmt(p.x)}f);`).join("\n");
      const ue = pr.map((p, i) => `float r${i + 1} = FMath::${name}(${this.fmt(p.x)}f);`).join("\n");
      const bp = pr.map((p, i) => `[Node: ${name}]\n ├─ In: ${this.fmt(p.x)}\n ➥ Out: ${this.fmt(p.y)}`).join("\n\n");
      const py = pr.map((p, i) => `r${i + 1} = math.${id}(${this.fmt(p.x)})`).join("\n");
      return { unity: un, dotnet: dn, godotCs: gc, cpp: cp, unreal: ue, blueprint: bp, python: py };
    }

    return { unity: "// Vide", dotnet: "// Vide", godotCs: "// Vide", cpp: "// Vide", unreal: "// Vide", blueprint: "[Node: Vide]", python: "# Vide" };
  }
}