export const CATALOG_3D_MATRICES = [
  // =========================================================================
  // 05. Quaternions & Rotations 3D
  // =========================================================================
  {
    id: "euler-gimbal-lock",
    glyph: "XYZ°",
    name: "Angles d'Euler & Gimbal Lock",
    subtitle: "Pitch, Yaw, Roll, ordre de rotation et blocage de cardan",
    categoryId: "quaternions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Rotations 3D", "Caméra", "3C & Mouvement"],
    sandbox: "space3d",
    sandboxMode: "euler",
    formula: "R_Unity = Ry(Yaw) · Rx(Pitch) · Rz(Roll)   |   Gimbal Lock à Pitch = ±90°",
    formulaVars: "Pitch (X) : haut/bas · Yaw (Y) : gauche/droite · Roll (Z) : roulis",
    summary: "Les angles d'Euler décrivent une orientation par 3 rotations successives autour des axes X, Y, Z. Très intuitifs dans un inspecteur, mais ils souffrent du Gimbal Lock : lorsque l'axe intermédiaire (Pitch) atteint ±90°, les anneaux de Yaw et de Roll s'alignent et l'on perd 1 degré de liberté !",
    tldr: "Mettez Pitch = 90° dans le Playground et bougez Yaw puis Roll : les deux anneaux tournent sur le MÊME axe ! Stockez vos rotations en Quaternions.",
    signatures: {
      unity: "Quaternion.Euler(pitchX, yawY, rollZ)  // Ordre Z-X-Y",
      godotCs: "Quaternion.FromEuler(new Vector3(pitchRad, yawRad, rollRad))  // Ordre Y-X-Z",
      godotGd: "Quaternion.from_euler(Vector3(pitch_rad, yaw_rad, roll_rad))",
      unrealCpp: "FRotator(Pitch, Yaw, Roll).Quaternion()",
      unrealBp: "Make Rotator -> Rotator to Quat",
      csharp: "Quaternion.CreateFromYawPitchRoll(yawRad, pitchRad, rollRad)",
      cpp: "glm::quat(glm::radians(glm::vec3(pitch, yaw, roll)))"
    },
    examples: [
      {
        title: "Caméra FPS sûre (pourquoi ça marche sans Gimbal Lock)",
        desc: "En bornant strictement Pitch dans `[-85°, +85°]` et en appliquant Yaw puis Pitch, on n'atteint jamais ±90°.",
        code: "transform.rotation = Quaternion.Euler(0f, yaw, 0f) * Quaternion.Euler(pitch, 0f, 0f);"
      }
    ],
    pitfalls: [
      "Ne modifiez JAMAIS directement `transform.eulerAngles.x += 5f` ! L'extraction Euler d'un quaternion est ambiguë (90° vs 270°) et provoque des blocages/flips brutaux. Maintenez vos angles dans des `float` séparés ou multipliez des quaternions.",
      "L'ordre des paramètres diffère : Unity `Euler(X, Y, Z)`, Unreal `FRotator(Pitch=Y, Yaw=Z, Roll=X)`, .NET `(Yaw, Pitch, Roll)`."
    ],
    related: ["quaternion-anatomy", "quaternion-angleaxis", "quaternion-multiply"]
  },
  {
    id: "quaternion-anatomy",
    glyph: "q(w,v)",
    name: "Anatomie d'un Quaternion (x, y, z, w)",
    subtitle: "Hypersphère 4D unitaire, demi-angle θ/2 et double recouvrement",
    categoryId: "quaternions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Rotations 3D", "Physique", "Caméra"],
    sandbox: "space3d",
    sandboxMode: "quatanatomy",
    formula: "q = (n̂ · sin(θ/2), cos(θ/2))   avec   x² + y² + z² + w² = 1",
    formulaVars: "n̂ : axe unitaire de rotation · θ/2 : demi-angle · Identité = (0, 0, 0, 1)",
    summary: "Un quaternion de rotation est un vecteur 4D de longueur 1 qui encode simultanément un axe 3D `(x, y, z)` et le cosinus d'un demi-angle `w`. Aucun Gimbal Lock, interpolation sphérique parfaite et composition rapide en 16 multiplications.",
    tldr: "Identité = `(0, 0, 0, 1)`. Pourquoi le demi-angle `θ/2` ? Parce que tourner un vecteur utilise la formule sandwich `q · v · q⁻¹`, qui applique deux fois `θ/2` !",
    signatures: {
      unity: "Quaternion q = Quaternion.identity;  // (0, 0, 0, 1)",
      godotCs: "Quaternion q = Quaternion.Identity;",
      godotGd: "var q := Quaternion.IDENTITY",
      unrealCpp: "FQuat Q = FQuat::Identity;",
      unrealBp: "Make Quat (0, 0, 0, 1)",
      csharp: "Quaternion q = Quaternion.Identity;",
      cpp: "glm::quat q = glm::identity<glm::quat>(); // GLM: (w, x, y, z) !"
    },
    examples: [
      {
        title: "Normaliser après de nombreuses multiplications",
        desc: "Les erreurs flottantes font lentement dériver `‖q‖` loin de 1, ce qui déforme (scale/skew) l'objet.",
        code: "q = Quaternion.Normalize(q); // ou q.Normalized() en Godot"
      }
    ],
    pitfalls: [
      "PIÈGE C++ GLM : le constructeur `glm::quat(w, x, y, z)` met `W` EN PREMIER, alors que Unity, Godot, Unreal et C# mettent `(x, y, z, w)` !",
      "Double cover : `q` et `-q` représentent EXACTEMENT la même rotation 3D. Si `Dot(q1, q2) < 0`, inversez `-q2` avant d'interpoler sinon l'objet fait un tour complet inutile !"
    ],
    related: ["euler-gimbal-lock", "quaternion-angleaxis", "quaternion-slerp-nlerp"]
  },
  {
    id: "quaternion-angleaxis",
    glyph: "R(u,θ)",
    name: "Quaternion.AngleAxis",
    subtitle: "Rotation propre autour d'un axe 3D arbitraire",
    categoryId: "quaternions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Rotations 3D", "Physique", "3C & Mouvement"],
    sandbox: "space3d",
    sandboxMode: "qangleaxis",
    formula: "q = (û · sin(θ/2),  cos(θ/2))",
    formulaVars: "û : axe de rotation normalisé · θ : angle de rotation autour de cet axe",
    summary: "Plante un axe libre n'importe où dans l'espace 3D et fait pivoter l'objet autour de cet axe d'un angle θ. C'est la manière la plus géométrique, lisible et sans ambiguïté de construire une rotation 3D.",
    tldr: "Parfait pour une roue autour de son essieu, un vaisseau spatial (6-DOF), une planète inclinée ou une porte oblique.",
    signatures: {
      unity: "Quaternion.AngleAxis(angleDeg, axis)",
      godotCs: "new Quaternion(axis.Normalized(), Mathf.DegToRad(angleDeg))",
      godotGd: "Quaternion(axis.normalized(), deg_to_rad(angle_deg))",
      unrealCpp: "FQuat(Axis.GetSafeNormal(), FMath::DegreesToRadians(AngleDeg))",
      unrealBp: "Rotator from Axis and Angle / Quaternion from Axis and Angle",
      csharp: "Quaternion.CreateFromAxisAngle(Vector3.Normalize(axis), angleRad)",
      cpp: "glm::angleAxis(glm::radians(angleDeg), glm::normalize(axis))"
    },
    examples: [
      {
        title: "Faire tourner un vecteur 3D autour d'un axe (ex: cône de tir)",
        desc: "Multipliez le quaternion AngleAxis par le vecteur directement.",
        code: "Vector3 deflected = Quaternion.AngleAxis(spreadDeg, upAxis) * forward;"
      },
      {
        title: "Rotation de roue de véhicule",
        desc: "Tourne autour de l'axe local X proportionnellement à la distance parcourue `d / radius`.",
        code: "wheelSpin += (speed * dt / wheelRadius) * Mathf.Rad2Deg;\nwheel.localRotation = Quaternion.AngleAxis(wheelSpin, Vector3.right);"
      }
    ],
    pitfalls: [
      "L'axe DOIT être normalisé (surtout en Godot, Unreal C++, .NET et GLM). Un axe nul `(0, 0, 0)` produit des `NaN` !"
    ],
    related: ["quaternion-anatomy", "quaternion-multiply", "quaternion-inverse-fromtorotation"]
  },
  {
    id: "quaternion-lookrotation",
    glyph: "Look",
    name: "Quaternion.LookRotation & Basis",
    subtitle: "Verrouiller la face avant vers une cible 3D",
    categoryId: "quaternions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Combat & Visée", "Caméra", "Rotations 3D", "IA & Navigation"],
    sandbox: "space3d",
    sandboxMode: "qlookrotation",
    formula: "F = normalize(Target - Pos),  R = normalize(Up × F),  U = F × R",
    formulaVars: "F : direction avant · Up : référence verticale (défaut (0,1,0)) · construit une base orthonormée",
    summary: "L'équivalent 3D de `Atan2` : calcule l'orientation complète pour que l'axe avant de l'objet pointe exactement vers une cible tout en gardant le haut aligné sur `up` (sans roulis parasite).",
    tldr: "Combinez `LookRotation(target - pos)` avec `Slerp` pour obtenir n'importe quelle tourelle 3D, tête de personnage ou caméra cinématique.",
    signatures: {
      unity: "Quaternion.LookRotation(dir, Vector3.up)",
      godotCs: "Basis.LookingAt(dir, Vector3.Up).GetRotationQuaternion()",
      godotGd: "Basis.looking_at(dir, Vector3.UP).get_rotation_quaternion()",
      unrealCpp: "FRotationMatrix::MakeFromXZ(Dir, FVector::UpVector).ToQuat()",
      unrealBp: "Find Look at Rotation",
      csharp: "Quaternion.CreateFromRotationMatrix(Matrix4x4.CreateLookAt(pos, target, up))",
      cpp: "glm::quatLookAt(glm::normalize(dir), glm::vec3(0, 1, 0))"
    },
    examples: [
      {
        title: "Orienter un personnage uniquement sur le plan horizontal (Yaw)",
        desc: "Mettez `dir.y = 0` avant `LookRotation` pour éviter que le personnage ne penche vers le ciel ou le sol.",
        code: "Vector3 flat = target.position - transform.position;\nflat.y = 0f;\nif (flat.sqrMagnitude > 0.001f) rot = Quaternion.LookRotation(flat);"
      }
    ],
    pitfalls: [
      "Si `dir` est nul `(0, 0, 0)` ou colinéaire à `Vector3.up` (cible pile au-dessus de la tête), le produit vectoriel `Up × F` s'annule et l'orientation devient instable.",
      "Convention Godot : `Basis.looking_at(dir)` aligne l'axe `-Z` (et non `+Z` comme Unity) vers `dir` !"
    ],
    related: ["quaternion-slerp-nlerp", "orthonormal-basis", "atan-vs-atan2"]
  },
  {
    id: "quaternion-slerp-nlerp",
    glyph: "Slerp",
    name: "Quaternion Slerp vs Nlerp",
    subtitle: "Interpolation sphérique à vitesse angulaire constante",
    categoryId: "quaternions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Rotations 3D", "Caméra", "3C & Mouvement", "Optimisation"],
    sandbox: "space3d",
    sandboxMode: "qslerp",
    formula: "Slerp(q₁, q₂, t) = [sin((1-t)Ω)·q₁ + sin(tΩ)·q₂] / sin(Ω)   avec   cos(Ω) = q₁·q₂",
    formulaVars: "Ω : demi-angle entre les rotations · Nlerp = normalize(lerp(q₁, q₂, t))",
    summary: "Slerp (Spherical Linear Interpolation) suit le grand cercle le plus court sur l'hypersphère 4D, garantissant une vitesse angulaire rigoureusement constante. Nlerp (Normalized Lerp) est beaucoup plus rapide (aucun `sin`/`acos`), reste sur le même chemin le plus court et est quasiment indiscernable pour des petits pas de frame.",
    tldr: "Utilisez `Slerp` pour les animations clés/caméras à vitesse stricte, `Nlerp` pour le skinning de squelettes (100+ os/frame), et `RotateTowards` pour une vitesse max en °/s !",
    signatures: {
      unity: "Quaternion.Slerp(qA, qB, t)  |  Quaternion.RotateTowards(qA, qB, maxDeg)",
      godotCs: "qA.Slerp(qB, t)",
      godotGd: "q_a.slerp(q_b, t)",
      unrealCpp: "FQuat::Slerp(QA, QB, Alpha)  |  FQuat::FastLerp(QA, QB, Alpha).GetNormalized()",
      unrealBp: "Lerp (Quat) / RInterp To",
      csharp: "Quaternion.Slerp(qA, qB, t)  |  Quaternion.Lerp(qA, qB, t)",
      cpp: "glm::slerp(qA, qB, t)  |  glm::normalize(glm::lerp(qA, qB, t))"
    },
    examples: [
      {
        title: "Tourelle 3D fluide indépendante du framerate",
        desc: "Combine LookRotation, Slerp et décroissance exponentielle.",
        code: "Quaternion goal = Quaternion.LookRotation(target - pos);\ntransform.rotation = Quaternion.Slerp(transform.rotation, goal, 1f - Mathf.Exp(-8f * dt));"
      }
    ],
    pitfalls: [
      "Pour éviter de prendre le « grand tour » (300° au lieu de 60°), vérifiez toujours `dot(q1, q2) < 0 ? -q2 : q2` dans un Slerp/Nlerp maison (les moteurs le font déjà dans `Slerp`)."
    ],
    related: ["quaternion-lookrotation", "framerate-independent-damping", "lerpangle-movetowardsangle"]
  },
  {
    id: "quaternion-multiply",
    glyph: "q₁·q₂",
    name: "Multiplication de Quaternions",
    subtitle: "Composer des rotations 3D et faire tourner un vecteur",
    categoryId: "quaternions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Rotations 3D", "3C & Mouvement", "Physique"],
    sandbox: "space3d",
    sandboxMode: "quatmult",
    formula: "q_total = q_parent · q_local   |   v' = q · v · q⁻¹   |   q₁·q₂ ≠ q₂·q₁",
    formulaVars: "Non-commutatif : l'ordre détermine si la rotation est en espace Monde ou Local !",
    summary: "On n'additionne jamais deux quaternions : on les MULTIPLIE pour enchaîner des rotations. Multiplier à DROITE (`current * delta`) applique une rotation autour des axes LOCAUX de l'objet ; multiplier à GAUCHE (`delta * current`) applique la rotation autour des axes du MONDE.",
    tldr: "Règle d'or : `q_world * q_current` = tourner dans le repère MONDE · `q_current * q_local` = tourner dans le repère LOCAL (comme un avion).",
    signatures: {
      unity: "Quaternion q = qParent * qLocal;  Vector3 v2 = q * v;",
      godotCs: "Quaternion q = qParent * qLocal;  Vector3 v2 = q * v;",
      godotGd: "var q = q_parent * q_local;  var v2 = q * v",
      unrealCpp: "FQuat Q = QParent * QLocal;  FVector V2 = Q.RotateVector(V);",
      unrealBp: "Combine Rotators / Multiply (Quat) / Rotate Vector",
      csharp: "Quaternion q = qParent * qLocal;  Vector3 v2 = Vector3.Transform(v, q);",
      cpp: "glm::quat q = qParent * qLocal;  glm::vec3 v2 = q * v;"
    },
    examples: [
      {
        title: "Contrôle d'un vaisseau spatial 6-DOF (Pitch/Yaw/Roll locaux)",
        desc: "Multiplie à DROITE pour que le tangage se fasse toujours par rapport aux ailes du vaisseau.",
        code: "rot = rot * Quaternion.Euler(pitchInput * dt, yawInput * dt, rollInput * dt);"
      },
      {
        title: "Tourner une direction de déplacement selon la caméra",
        desc: "Projette l'input ZQSD dans le sens où regarde la caméra.",
        code: "Vector3 worldMove = Quaternion.Euler(0, camYaw, 0) * new Vector3(inX, 0, inZ);"
      }
    ],
    pitfalls: [
      "PIÈGE UNREAL BLUEPRINT : Le nœud `Combine Rotators(A, B)` applique A PUIS B (équivalent à `B * A` en notation quaternion) ! Vérifiez toujours l'ordre quand vous mixez C++ et Blueprint."
    ],
    related: ["quaternion-inverse-fromtorotation", "euler-gimbal-lock", "transform-local-world"]
  },
  {
    id: "quaternion-inverse-fromtorotation",
    glyph: "q⁻¹",
    name: "Quaternion Inverse & FromToRotation",
    subtitle: "Rotation opposée, différence relative et alignement sur pente",
    categoryId: "quaternions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Rotations 3D", "3C & Mouvement", "Physique"],
    sandbox: "space3d",
    sandboxMode: "quatinverse",
    formula: "q⁻¹ = (-x, -y, -z, w)   |   q_delta = q_target · q_current⁻¹",
    formulaVars: "Pour un quaternion unitaire, l'inverse vaut simplement son conjugué (-x,-y,-z,w) !",
    summary: "L'inverse d'un quaternion annule exactement sa rotation en inversant seulement le signe de (x, y, z) — coût quasi nul ! Associé à `FromToRotation(fromDir, toDir)`, il permet d'extraire une rotation locale, de calculer un couple PID ou de plaquer un personnage sur une planète sphérique.",
    tldr: "Extraire la rotation locale depuis le monde : `q_local = Inverse(parent.rot) * worldRot`. Aligner sur une pente : `FromToRotation(up, hit.normal) * rot`.",
    signatures: {
      unity: "Quaternion.Inverse(q)  |  Quaternion.FromToRotation(from, to)",
      godotCs: "q.Inverse()  |  new Quaternion(from, to)",
      godotGd: "q.inverse()  # FromTo: Quaternion(from_dir, to_dir)",
      unrealCpp: "Q.Inverse()  |  FQuat::FindBetweenNormals(From, To)",
      unrealBp: "Invert Rotator / Find Between Normals (Quat)",
      csharp: "Quaternion.Inverse(q)",
      cpp: "glm::inverse(q)  // ou glm::conjugate(q) si unitaire"
    },
    examples: [
      {
        title: "Aligner un véhicule / personnage sur la normale du sol (Mario Galaxy)",
        desc: "Préserve la direction avant (Yaw) tout en inclinant le haut (Up) sur la pente.",
        code: "Quaternion tilt = Quaternion.FromToRotation(transform.up, hit.normal);\ntransform.rotation = Quaternion.Slerp(rot, tilt * rot, 1f - Mathf.Exp(-10f * dt));"
      }
    ],
    pitfalls: [
      "Pour `FromToRotation(from, to)` quand `from` et `to` sont exactement opposés (180°, `dot ≈ -1`), il existe une infinité d'axes de rotation : assurez-vous d'utiliser une implémentation qui choisit un axe orthogonal de secours."
    ],
    related: ["quaternion-multiply", "quaternion-angleaxis", "project-projectonplane"]
  },

  // =========================================================================
  // 06. Espaces, Matrices & Caméra
  // =========================================================================
  {
    id: "coordinate-systems",
    glyph: "XYZ",
    name: "Repères Moteurs (Unity / Godot / Unreal)",
    subtitle: "Main gauche vs Main droite, Y-Up vs Z-Up et conversion",
    categoryId: "spaces",
    dimension: "3d",
    difficulty: 1,
    tags: ["Rotations 3D", "Caméra", "3C & Mouvement"],
    sandbox: "space3d",
    sandboxMode: "coordsys",
    formula: "Unity: LH Y-Up (+Z fwd) · Godot: RH Y-Up (-Z fwd) · Unreal: LH Z-Up (+X fwd)",
    formulaVars: "LH = Left-Handed (main gauche) · RH = Right-Handed (main droite)",
    summary: "Chaque grand moteur 3D utilise une convention d'axes différente ! Comprendre exactement où pointent Forward, Right et Up évite 90% des bugs de portage de formules mathématiques, d'import de modèles 3D et de caméras inversées.",
    tldr: "Unity : +X Droite, +Y Haut, +Z Devant (1u = 1m) · Godot : +X Droite, +Y Haut, -Z Devant (1u = 1m) · Unreal : +X Devant, +Y Droite, +Z Haut (1u = 1cm !).",
    signatures: {
      unity: "Right=+X, Up=+Y, Forward=+Z  (Left-Handed, 1 unit = 1m)",
      godotCs: "Right=+X, Up=+Y, Forward=-Z  (Right-Handed, 1 unit = 1m)",
      godotGd: "Vector3.RIGHT(+X), Vector3.UP(+Y), Vector3.FORWARD(-Z)",
      unrealCpp: "Forward=+X, Right=+Y, Up=+Z  (Left-Handed, 1 unit = 1cm)",
      unrealBp: "Get Actor Forward (+X) / Right (+Y) / Up (+Z)",
      csharp: "System.Numerics: Right-Handed Y-Up (-Z forward par convention)",
      cpp: "GLM / OpenGL: Right-Handed Y-Up (-Z forward)"
    },
    examples: [
      {
        title: "Convertir un point Unity (Y-Up, m) vers Unreal (Z-Up, cm)",
        desc: "Permute les axes et applique le facteur d'échelle ×100 (mètres → centimètres).",
        code: "FVector uePos(unity.z * 100f, unity.x * 100f, unity.y * 100f);"
      },
      {
        title: "Convertir un point Unity (LH) vers Godot (RH)",
        desc: "Il suffit d'inverser l'axe Z (ou de tourner de 180° autour de Y).",
        code: "Vector3 godotPos = new Vector3(unity.x, unity.y, -unity.z);"
      }
    ],
    pitfalls: [
      "En Unreal Engine, la gravité vaut `-980 cm/s²` (pas `-9.81`) car 1 unité Unreal = 1 centimètre !",
      "En Godot 3D, `Vector3.FORWARD` vaut `(0, 0, -1)` et non `(0, 0, +1)`."
    ],
    related: ["cross-product", "transform-local-world", "orthonormal-basis"]
  },
  {
    id: "transform-local-world",
    glyph: "L↔W",
    name: "Espace Local ↔ Monde (TransformPoint)",
    subtitle: "Différence cruciale entre TransformPoint, Direction et Vector",
    categoryId: "spaces",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["3C & Mouvement", "Combat & Visée", "Caméra"],
    sandbox: "collision",
    sandboxMode: "transformpoint",
    formula: "P_world = Pos + R·(S ⊙ P_local)   |   Dir_world = R · Dir_local",
    formulaVars: "Point (w=1) subit Translation+Rotation+Scale · Direction (w=0) subit uniquement Rotation !",
    summary: "Convertit des coordonnées relatives à un objet (« 2m devant et 1m à droite du joueur ») en coordonnées globales de la scène, et inversement. Faire la distinction entre un Point (affecté par la position et l'échelle) et une Direction (affectée uniquement par la rotation) est critique.",
    tldr: "`TransformPoint` = position (T+R+S) · `TransformDirection` = direction pure (R seulement) · `InverseTransformPoint` = savoir où est l'ennemi par rapport à MOI.",
    signatures: {
      unity: "transform.TransformPoint(p)  |  transform.InverseTransformPoint(w)",
      godotCs: "ToGlobal(localPos)  |  ToLocal(worldPos)",
      godotGd: "to_global(local_pos)  |  to_local(world_pos)",
      unrealCpp: "GetActorTransform().TransformPosition(Local) / InverseTransformPosition(World)",
      unrealBp: "Transform Location / Inverse Transform Location",
      csharp: "Vector3.Transform(localPos, worldMatrix)",
      cpp: "glm::vec3(worldMatrix * glm::vec4(localPos, 1.0f))"
    },
    examples: [
      {
        title: "Savoir instantanément où est un ennemi par rapport au joueur",
        desc: "En espace local du joueur : `local.z > 0` = devant, `local.x > 0` = à droite, `local.y > 0` = au-dessus !",
        code: "Vector3 rel = player.InverseTransformPoint(enemy.position);\nbool isRight = rel.x > 0f; bool isFront = rel.z > 0f;"
      },
      {
        title: "Spawner une balle au bout du canon",
        desc: "Évite de placer des GameObjects vides partout quand un offset local suffit.",
        code: "Vector3 muzzle = gun.TransformPoint(new Vector3(0f, 0.12f, 0.85f));"
      }
    ],
    pitfalls: [
      "Utiliser `TransformPoint` sur une vélocité ou une normale ajoute la position de l'objet et l'échelle ! Pour une direction, utilisez TOUJOURS `TransformDirection` (w = 0).",
      "Pour transformer une normale de surface avec une échelle non uniforme `(2, 1, 1)`, il faut la matrice transposée inverse `(M⁻¹)ᵀ`, pas `M` !"
    ],
    related: ["matrix-trs", "coordinate-systems", "quaternion-multiply"]
  },
  {
    id: "matrix-trs",
    glyph: "M₄ₓ₄",
    name: "Matrices 2D/3D & Transformation TRS",
    subtitle: "Translation, Rotation, Scale en matrice homogène et ordre T·R·S",
    categoryId: "spaces",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["Rotations 3D", "Shaders & Rendu", "Optimisation"],
    sandbox: "vector",
    sandboxMode: "matrixtrs",
    formula: "M = T · R · S   |   v_world = M · [x, y, z, 1]ᵀ",
    formulaVars: "T : translation (colonne 4) · R : rotation (3×3 orthonormée) · S : mise à l'échelle · w=1 point / w=0 vecteur",
    summary: "Une seule matrice 4×4 (ou 3×2 en 2D) encode simultanément la position, l'orientation et la taille d'un objet, ainsi que toute la hiérarchie parent/enfant (`M_world = M_parent · M_local`). Les 3 premières colonnes sont littéralement les axes Right, Up et Forward de l'objet !",
    tldr: "L'ordre se lit de droite à gauche : `T · R · S · p` applique d'abord Scale, puis Rotation, puis Translation. Inverser `T` et `R` fait orbiter l'objet autour de l'origine !",
    signatures: {
      unity: "Matrix4x4.TRS(pos, rot, scale)",
      godotCs: "new Transform3D(Basis.FromScale(scale) * new Basis(rot), pos)",
      godotGd: "Transform3D(Basis(rot).scaled(scale), pos)",
      unrealCpp: "FTransform(Rot, Pos, Scale).ToMatrixWithScale()",
      unrealBp: "Make Transform -> Conv Transform to Matrix",
      csharp: "Matrix4x4.CreateScale(s) * Matrix4x4.CreateFromQuaternion(r) * Matrix4x4.CreateTranslation(t)",
      cpp: "glm::translate(I, t) * glm::mat4_cast(r) * glm::scale(I, s)"
    },
    examples: [
      {
        title: "GPU Instancing de 10 000 arbres en 1 Draw Call",
        desc: "Chaque instance est simplement une `Matrix4x4.TRS` envoyée dans un buffer GPU.",
        code: "matrices[i] = Matrix4x4.TRS(treePos, treeRot, treeScale);\nGraphics.RenderMeshInstanced(rp, mesh, 0, matrices);"
      }
    ],
    pitfalls: [
      "PIÈGE CONVENTION LIGNE vs COLONNE : Unity, Godot et GLM sont column-major (`M * v`), tandis que `System.Numerics.Matrix4x4` (.NET) et DirectX/Unreal `FMatrix` sont row-major (`v * M`) — l'ordre de multiplication `S * R * T` s'y inverse !",
      "Un scale non uniforme sur un parent crée du cisaillement (Shear) quand un enfant tourne."
    ],
    related: ["transform-local-world", "view-projection-frustum", "orthonormal-basis"]
  },
  {
    id: "spherical-cylindrical",
    glyph: "ρ,θ,φ",
    name: "Coordonnées Sphériques & Cylindriques",
    subtitle: "Caméra orbitale 3ème personne (TPS) et tourelles 3D",
    categoryId: "spaces",
    dimension: "3d",
    difficulty: 2,
    tags: ["Caméra", "3C & Mouvement", "Combat & Visée"],
    sandbox: "space3d",
    sandboxMode: "coord3d",
    formula: "x = ρ·sin(φ)·cos(θ),  y = ρ·cos(φ),  z = ρ·sin(φ)·sin(θ)",
    formulaVars: "ρ (rho) : distance/zoom · θ (theta) : azimut horizontal [0..360°] · φ (phi) : angle polaire [5°..175°]",
    summary: "Positionne un point autour d'une cible en utilisant un rayon (zoom) et deux angles (souris X et souris Y). C'est l'équation exacte des caméras orbitales TPS (Elden Ring, GTA, Zelda) et du placement d'objets sur une planète.",
    tldr: "Clampez toujours l'angle vertical `φ` entre `5°` et `175°` (jamais 0° ou 180° pile) pour éviter que la caméra ne se retourne au pôle !",
    signatures: {
      unity: "new Vector3(r*Sin(phi)*Cos(th), r*Cos(phi), r*Sin(phi)*Sin(th))",
      godotCs: "new Vector3(r*Sin(phi)*Cos(th), r*Cos(phi), r*Sin(phi)*Sin(th))",
      godotGd: "Vector3(r*sin(phi)*cos(th), r*cos(phi), r*sin(phi)*sin(th))",
      unrealCpp: "FVector2D(Phi, Theta).SphericalToUnitCartesian() * Rho",
      unrealBp: "Spherical to Unit Cartesian (FVector2D)",
      csharp: "new Vector3(r*Sin(phi)*Cos(th), r*Cos(phi), r*Sin(phi)*Sin(th))",
      cpp: "glm::vec3(r*sin(phi)*cos(th), r*cos(phi), r*sin(phi)*sin(th))"
    },
    examples: [
      {
        title: "Caméra TPS orbitale + anti-clipping mural",
        desc: "Calcule la position sphérique désirée puis tire un SphereCast depuis le joueur pour réduire `ρ` si un mur bloque.",
        code: "Vector3 desired = pivot + Spherical(rho, yaw, pitch);\nif (Physics.SphereCast(pivot, 0.25f, dir, out hit, rho)) desired = hit.point;"
      }
    ],
    pitfalls: [
      "Pour générer des points aléatoires uniformément sur une sphère (ex: étoiles, particules 3D), ne tirez PAS `φ` uniformément : les pôles seront surchargés ! Utilisez `cos(φ) = Random(-1, 1)`."
    ],
    related: ["sincos-polar", "quaternion-lookrotation", "view-projection-frustum"]
  },
  {
    id: "view-projection-frustum",
    glyph: "MVP",
    name: "Caméra : View, Projection & Frustum Culling",
    subtitle: "Pipeline Monde → Vue → Clip → Écran et test de visibilité",
    categoryId: "spaces",
    dimension: "3d",
    difficulty: 3,
    tags: ["Caméra", "Shaders & Rendu", "Optimisation"],
    sandbox: "space3d",
    sandboxMode: "frustum",
    formula: "P_clip = P_proj · V_view · M_model · P_local   →   P_ndc = P_clip.xyz / P_clip.w",
    formulaVars: "FOV : angle d'ouverture · Aspect : W/H · Near/Far : plans de découpe · 6 plans du Frustum",
    summary: "Décrit comment tout point 3D finit en pixel 2D sur votre écran (matrice MVP + division perspective par `w`) et comment le moteur élimine instantanément tous les objets hors champ en les testant contre les 6 plans de la pyramide tronquée (Frustum Culling).",
    tldr: "Un point est visible à l'écran ssi ses coordonnées NDC vérifient `-1 ≤ x, y ≤ 1` et `0 ≤ z ≤ 1` (ou `-1..1` OpenGL) avec `w > 0` (devant la caméra !).",
    signatures: {
      unity: "cam.WorldToScreenPoint(pos)  |  GeometryUtility.CalculateFrustumPlanes(cam)",
      godotCs: "cam.UnprojectPosition(pos)  |  cam.IsPositionInFrustum(pos)",
      godotGd: "cam.unproject_position(pos)  # cam.is_position_in_frustum(pos)",
      unrealCpp: "UGameplayStatics::ProjectWorldToScreen(PC, WorldPos, ScreenPos)",
      unrealBp: "Project World Location to Screen",
      csharp: "Matrix4x4.CreatePerspectiveFieldOfView(fovRad, aspect, near, far)",
      cpp: "glm::perspective(fovRad, aspect, near, far) * glm::lookAt(eye, target, up)"
    },
    examples: [
      {
        title: "Marqueur HUD sur un ennemi 3D (avec gestion derrière caméra)",
        desc: "Vérifiez `screenPos.z > 0` sinon l'icône d'un ennemi DANS votre dos réapparaît inversée à l'écran !",
        code: "Vector3 sp = cam.WorldToScreenPoint(enemy.position);\nbool inFront = sp.z > 0f;\nmarker.gameObject.SetActive(inFront);"
      }
    ],
    pitfalls: [
      "Régler `Near Clip = 0.001` et `Far = 100000` détruit la précision du Depth Buffer (Z-fighting !). Gardez `Near` aussi grand que possible (ex: `0.1` à `0.3m`) car 90% de la précision Z est concentrée près du plan Near.",
      "Oublier de tester `z > 0` après `WorldToScreenPoint` fait apparaître des barres de vie d'ennemis situés derrière la caméra !"
    ],
    related: ["matrix-trs", "tan", "thales", "aabb-collision"]
  },
  {
    id: "orthonormal-basis",
    glyph: "R,U,F",
    name: "Base Orthonormée (Gram-Schmidt)",
    subtitle: "Construire un repère 3D (Right, Up, Forward) sans déformation",
    categoryId: "spaces",
    dimension: "3d",
    difficulty: 3,
    tags: ["Rotations 3D", "Caméra", "Shaders & Rendu"],
    sandbox: "space3d",
    sandboxMode: "basis",
    formula: "F̂ = normalize(F),  R̂ = normalize(U_ref × F̂),  Û = F̂ × R̂",
    formulaVars: "3 vecteurs unitaires mutuellement perpendiculaires : R̂·Û = Û·F̂ = F̂·R̂ = 0",
    summary: "À partir d'une seule direction principale (ex: normale d'impact pour un decal, ou tangente d'une spline pour un rail), le procédé de Gram-Schmidt / produit vectoriel double construit un repère 3D complet strictement orthogonal et unitaire.",
    tldr: "Indispensable pour orienter des decals d'impact de balles, des rails de grand huit (Frenet/Parallel Transport) ou un espace tangent (TBN) en shader.",
    signatures: {
      unity: "Vector3.OrthoNormalize(ref normal, ref tangent, ref binormal);",
      godotCs: "basis = basis.Orthonormalized();",
      godotGd: "basis = basis.orthonormalized()",
      unrealCpp: "FVector::CreateOrthonormalBasis(XAxis, YAxis, ZAxis);",
      unrealBp: "Make Rot from XZ / Make Rot from ZX",
      csharp: "r = Normalize(Cross(up, f)); u = Cross(f, r);",
      cpp: "r = glm::normalize(glm::cross(up, f)); u = glm::cross(f, r);"
    },
    examples: [
      {
        title: "Placer un impact de balle (Decal) sur n'importe quel mur/plafond",
        desc: "Choisit un vecteur auxiliaire non colinéaire à la normale pour éviter toute singularité au plafond.",
        code: "Vector3 refUp = Mathf.Abs(normal.y) > 0.99f ? Vector3.right : Vector3.up;\nVector3 tangent = Vector3.Cross(refUp, normal).normalized;"
      }
    ],
    pitfalls: [
      "Si votre direction principale s'aligne avec `refUp` (ex: sol parfaitement plat ou looping de rollercoaster), `Cross(refUp, dir)` devient `(0,0,0)` : basculez sur un axe de secours dès que `|dot| > 0.99`."
    ],
    related: ["cross-product", "quaternion-lookrotation", "matrix-trs"]
  }
];
