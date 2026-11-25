export const CATALOG_TRIG_VECTORS = [
  // =========================================================================
  // 03. Trigonométrie & Angles
  // =========================================================================
  {
    id: "cos",
    glyph: "cos",
    name: "Cosinus (Cos)",
    subtitle: "Projection horizontale X sur le cercle unitaire",
    categoryId: "trigonometry",
    dimension: "2d",
    difficulty: 1,
    tags: ["3C & Mouvement", "Combat & Visée", "Shaders & Rendu"],
    sandbox: "trig",
    sandboxMode: "cos",
    formula: "x = cos(θ)  ∈ [-1, 1]   |   θ en radians",
    formulaVars: "θ : angle (0° → +1, 90° → 0, 180° → -1, 270° → 0)",
    summary: "Projette un point du cercle unitaire sur l'axe horizontal X. Le cosinus relie directement les angles aux directions : c'est aussi le cœur du Produit Scalaire (A·B = cos θ) pour tester les cônes de vision.",
    tldr: "Cos = Horizontal (X). Pour convertir un demi-angle de vision (ex: 45°) en seuil de Dot Product, calculez simplement `cos(45°)` ≈ 0.707.",
    signatures: {
      unity: "Mathf.Cos(angleRad)",
      godotCs: "Mathf.Cos(angleRad)",
      godotGd: "cos(angle_rad)",
      unrealCpp: "FMath::Cos(AngleRad)",
      unrealBp: "Cos (Radians) / Cosd (Degrees)",
      csharp: "MathF.Cos(angleRad)",
      cpp: "std::cos(angleRad)"
    },
    examples: [
      {
        title: "Seuil de cône de vision depuis un FOV en degrés",
        desc: "Évite tout appel à Acos dans la boucle d'update de l'IA.",
        code: "float cosHalfFov = Mathf.Cos(fovDeg * 0.5f * Mathf.Deg2Rad);\nbool seen = Vector3.Dot(fwd, toPlayer) >= cosHalfFov;"
      },
      {
        title: "Orbite circulaire autour d'un pivot",
        desc: "Associé à Sin sur Y ou Z pour tourner à rayon constant.",
        code: "pos.x = center.x + Mathf.Cos(angle) * radius;"
      }
    ],
    pitfalls: [
      "Presque toutes les API code (`Mathf.Cos`, `FMath::Cos`, `std::cos`) attendent des RADIANS, jamais des degrés ! Multipliez par `Deg2Rad` (`π/180`)."
    ],
    related: ["sin", "sincos-polar", "dot-product"]
  },
  {
    id: "sin",
    glyph: "sin",
    name: "Sinus (Sin)",
    subtitle: "Hauteur verticale Y, vagues et oscillations organiques",
    categoryId: "trigonometry",
    dimension: "2d",
    difficulty: 1,
    tags: ["UI & Game Feel", "Shaders & Rendu", "Caméra"],
    sandbox: "trig",
    sandboxMode: "sin",
    formula: "y = sin(θ)  ∈ [-1, 1]   |   f(t) = A · sin(2π·f·t + φ)",
    formulaVars: "A : amplitude · f : fréquence (Hz) · φ : déphasage",
    summary: "Projette un point du cercle unitaire sur l'axe vertical Y. Génère la courbe harmonique la plus douce de la nature : flottement d'objets de loot, respiration de caméra (head-bob), houle d'océan et pulsations lumineuses.",
    tldr: "Sin = Vertical (Y). Pour remapper `sin(t)` de `[-1, 1]` vers `[0, 1]` (ex: opacité UI), faites `sin(t) * 0.5f + 0.5f`.",
    signatures: {
      unity: "Mathf.Sin(angleRad)",
      godotCs: "Mathf.Sin(angleRad)",
      godotGd: "sin(angle_rad)",
      unrealCpp: "FMath::Sin(AngleRad)",
      unrealBp: "Sin (Radians) / Sind (Degrees)",
      csharp: "MathF.Sin(angleRad)",
      cpp: "std::sin(angleRad)"
    },
    examples: [
      {
        title: "Head-bobbing de marche FPS",
        desc: "Synchronise un balancement vertical doux à la cadence des pas.",
        code: "camLocalY = baseY + Mathf.Sin(walkCycle * freq) * bobAmp;"
      },
      {
        title: "Flottement d'objet collectible",
        desc: "Ajoutez un déphasage aléatoire par objet pour éviter qu'ils bougent tous en chœur.",
        code: "y = startY + Mathf.Sin(Time.time * 3f + phaseOffset) * 0.25f;"
      }
    ],
    pitfalls: [
      "En shader ou gameplay long (plusieurs heures), `Time.time` devient grand et `sin(Time.time)` perd en précision flottante : wrappez l'angle modulo `2π`."
    ],
    related: ["cos", "sincos-polar", "pingpong"]
  },
  {
    id: "tan",
    glyph: "tan",
    name: "Tangente (Tan)",
    subtitle: "Pente, dispersion conique et hauteur de Frustum (FOV)",
    categoryId: "trigonometry",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["Caméra", "Combat & Visée", "Shaders & Rendu"],
    sandbox: "trig",
    sandboxMode: "tan",
    formula: "tan(θ) = sin(θ) / cos(θ) = Opposé / Adjacent",
    formulaVars: "À distance d, la demi-hauteur d'un cône d'angle θ vaut d · tan(θ)",
    summary: "Mesure la hauteur d'impact d'un rayon sur un mur placé à distance 1. Indispensable pour calculer la taille visible d'un écran à une distance Z de la caméra (Frustum), la pente d'un escalier ou le rayon de dispersion d'une arme.",
    tldr: "Demi-hauteur visible par une caméra à distance `d` = `d * tan(FOV / 2)`. Tend vers l'infini à ±90° !",
    signatures: {
      unity: "Mathf.Tan(angleRad)",
      godotCs: "Mathf.Tan(angleRad)",
      godotGd: "tan(angle_rad)",
      unrealCpp: "FMath::Tan(AngleRad)",
      unrealBp: "Tan (Radians) / Tand (Degrees)",
      csharp: "MathF.Tan(angleRad)",
      cpp: "std::tan(angleRad)"
    },
    examples: [
      {
        title: "Hauteur du Frustum caméra à distance d",
        desc: "Permet d'ajuster un quad ou de cadrer automatiquement un boss à l'écran.",
        code: "float frustumH = 2f * dist * Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);"
      },
      {
        title: "Rayon de dispersion d'un fusil à pompe",
        desc: "Calcule la taille exacte du cercle de dispersion à une portée donnée.",
        code: "float spreadR = distance * Mathf.Tan(spreadDeg * Mathf.Deg2Rad);"
      }
    ],
    pitfalls: [
      "Singularité asymptotique à `±90°` (`cos(90°) = 0`) : `Tan` explose vers ±∞ ! Bornez toujours le FOV caméra en dessous de ~170°."
    ],
    related: ["view-projection-frustum", "thales", "atan-vs-atan2"]
  },
  {
    id: "sincos-polar",
    glyph: "(r,θ)",
    name: "Coordonnées Polaires & SinCos",
    subtitle: "Conversion (r, θ) ↔ (x, y) et patterns circulaires",
    categoryId: "trigonometry",
    dimension: "2d",
    difficulty: 1,
    tags: ["Combat & Visée", "Procédural", "3C & Mouvement"],
    sandbox: "trig",
    sandboxMode: "sincos",
    formula: "x = r·cos(θ),  y = r·sin(θ)   ↔   r = √(x²+y²),  θ = atan2(y, x)",
    formulaVars: "r : distance radiale · θ : angle polaire en radians",
    summary: "Représente une position 2D par une distance et un angle plutôt que par (X, Y). `SinCos` calcule simultanément sinus et cosinus dans une seule instruction matérielle : idéal pour spawner des ennemis, des projectiles Bullet-Hell ou des menus radiaux.",
    tldr: "Pour répartir N objets en cercle parfait : `angle = i * (2π / N)`, puis `(cos(angle), sin(angle)) * radius`.",
    signatures: {
      unity: "new Vector2(Mathf.Cos(a), Mathf.Sin(a)) * r",
      godotCs: "Vector2.FromAngle(a) * r",
      godotGd: "Vector2.from_angle(a) * r",
      unrealCpp: "float S, C; FMath::SinCos(&S, &C, AngleRad);",
      unrealBp: "Sin & Cos -> Make Vector2D",
      csharp: "(float s, float c) = MathF.SinCos(a);",
      cpp: "glm::vec2(std::cos(a), std::sin(a)) * r"
    },
    examples: [
      {
        title: "Salve radiale Bullet-Hell / AoE",
        desc: "Répartit équitablement N projectiles sur 360° autour du boss.",
        code: "for (int i = 0; i < count; i++) {\n  float a = i * Mathf.PI * 2f / count;\n  SpawnBullet(new Vector2(Mathf.Cos(a), Mathf.Sin(a)));\n}"
      },
      {
        title: "Point aléatoire uniforme dans un disque",
        desc: "PIÈGE : il faut prendre `r = sqrt(rand) * R` et NON `rand * R`, sinon les points s'entassent au centre !",
        code: "float a = Random.value * Mathf.PI * 2f;\nfloat r = Mathf.Sqrt(Random.value) * maxRadius;"
      }
    ],
    pitfalls: [
      "Pour tirer un point aléatoire uniforme dans un cercle, prenez `sqrt(Random()) * R` : l'aire croît avec `r²`, sans racine carrée vous sur-densifiez le centre !"
    ],
    related: ["cos", "sin", "spherical-cylindrical"]
  },
  {
    id: "acos",
    glyph: "cos⁻¹",
    name: "ArcCosinus (Acos)",
    subtitle: "Retrouver l'angle [0°, 180°] depuis un cosinus ou Dot Product",
    categoryId: "trigonometry",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["Combat & Visée", "IA & Navigation", "Physique"],
    sandbox: "trig",
    sandboxMode: "acos",
    formula: "θ = arccos(x) ∈ [0, π]   avec   x ∈ [-1, 1]",
    formulaVars: "x : cosinus (souvent le Dot Product de deux vecteurs unitaires)",
    summary: "Inverse de Cos : convertit un produit scalaire (compris entre -1 et +1) en angle non signé entre 0° et 180°. Utile quand vous avez besoin de la valeur exacte en degrés (UI, IK Al-Kashi, limite angulaire).",
    tldr: "Clampez TOUJOURS l'entrée dans `[-1, 1]` avant Acos, et évitez-le si une simple comparaison de cosinus suffit !",
    signatures: {
      unity: "Mathf.Acos(Mathf.Clamp(dot, -1f, 1f)) * Mathf.Rad2Deg",
      godotCs: "Mathf.RadToDeg(Mathf.Acos(Mathf.Clamp(dot, -1f, 1f)))",
      godotGd: "rad_to_deg(acos(clampf(dot, -1.0, 1.0)))",
      unrealCpp: "FMath::RadiansToDegrees(FMath::Acos(FMath::Clamp(Dot, -1.f, 1.f)))",
      unrealBp: "Acosd (Degrees)",
      csharp: "MathF.Acos(Math.Clamp(dot, -1f, 1f))",
      cpp: "std::acos(std::clamp(dot, -1.0f, 1.0f))"
    },
    examples: [
      {
        title: "Mesurer l'inclinaison d'une pente (Slope Angle)",
        desc: "Compare la normale du sol à l'axe vertical Up pour savoir si le joueur glisse.",
        code: "float slopeDeg = Mathf.Acos(Mathf.Clamp(hit.normal.y, -1f, 1f)) * Mathf.Rad2Deg;"
      }
    ],
    pitfalls: [
      "`Acos(1.0000001f)` renvoie `NaN`, ce qui peut faire disparaître un personnage entier de la scène ! Clampez systématiquement dans `[-1, 1]`.",
      "Acos ne distingue pas la gauche de la droite (renvoie toujours un angle positif dans [0°, 180°]). Combinez-le avec Cross/Det 2D pour un angle signé."
    ],
    related: ["dot-product", "asin", "ik-alkashi-fabrik"]
  },
  {
    id: "asin",
    glyph: "sin⁻¹",
    name: "ArcSinus (Asin)",
    subtitle: "Retrouver l'élévation / Pitch [-90°, +90°] depuis Y",
    categoryId: "trigonometry",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["Caméra", "3C & Mouvement", "Combat & Visée"],
    sandbox: "trig",
    sandboxMode: "asin",
    formula: "θ = arcsin(y) ∈ [-π/2, +π/2]   avec   y ∈ [-1, 1]",
    formulaVars: "y : composante verticale normalisée d'une direction 3D",
    summary: "Inverse de Sin : retrouve l'angle vertical d'élévation (Pitch) entre -90° (plein bas) et +90° (plein haut) à partir de la composante verticale Y d'un vecteur unitaire.",
    tldr: "Sur une direction 3D normalisée `dir`, `pitch = Asin(dir.y)` donne immédiatement l'angle de cabrage (avion, tourelle, visée verticale).",
    signatures: {
      unity: "Mathf.Asin(Mathf.Clamp(dir.y, -1f, 1f)) * Mathf.Rad2Deg",
      godotCs: "Mathf.RadToDeg(Mathf.Asin(Mathf.Clamp(dir.Y, -1f, 1f)))",
      godotGd: "rad_to_deg(asin(clampf(dir.y, -1.0, 1.0)))",
      unrealCpp: "FMath::RadiansToDegrees(FMath::Asin(FMath::Clamp(Dir.Z, -1.f, 1.f)))",
      unrealBp: "Asind (Degrees)",
      csharp: "MathF.Asin(Math.Clamp(y, -1f, 1f))",
      cpp: "std::asin(std::clamp(y, -1.0f, 1.0f))"
    },
    examples: [
      {
        title: "Assiette (Pitch) d'un avion ou vaisseau spatial",
        desc: "Affiche l'horizon artificiel sur le HUD à partir du vecteur forward.",
        code: "float pitchDeg = Mathf.Asin(Mathf.Clamp(transform.forward.y, -1f, 1f)) * Mathf.Rad2Deg;"
      }
    ],
    pitfalls: [
      "Comme `Acos`, `Asin` exige une entrée strictement dans `[-1, 1]` sous peine de `NaN`.",
      "Attention à Unreal Engine : l'axe vertical est `Z` (`Dir.Z`), pas `Y` !"
    ],
    related: ["acos", "atan-vs-atan2", "spherical-cylindrical"]
  },
  {
    id: "atan-vs-atan2",
    glyph: "atan2",
    name: "Atan vs Atan2 (Visée 360°)",
    subtitle: "Pourquoi Atan(y/x) échoue à gauche et comment Atan2 résout tout",
    categoryId: "trigonometry",
    dimension: "2d",
    difficulty: 1,
    tags: ["Combat & Visée", "3C & Mouvement", "Caméra"],
    sandbox: "trig",
    sandboxMode: "atan2",
    formula: "θ = atan2(y, x) ∈ (-π, +π]   (4 quadrants complets)",
    formulaVars: "y : composante verticale EN PREMIER · x : composante horizontale EN SECOND",
    summary: "Atan(y/x) perd les signes individuels de x et y dans la division : (-y)/(-x) = (+y)/(+x), donc une tourelle tire à 180° à l'envers dès que la cible passe à gauche ! Atan2(y, x) reçoit y et x séparément et couvre proprement les 360° sans division par zéro.",
    tldr: "N'utilisez JAMAIS `Atan(y / x)` pour orienter un objet. Utilisez TOUJOURS `Atan2(dir.y, dir.x)` (attention : Y d'abord, X ensuite !).",
    signatures: {
      unity: "float deg = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg;",
      godotCs: "float rad = dir.Angle();  // ou Mathf.Atan2(dir.Y, dir.X)",
      godotGd: "var rad = dir.angle()  # ou atan2(dir.y, dir.x)",
      unrealCpp: "float Deg = FMath::RadiansToDegrees(FMath::Atan2(Dir.Y, Dir.X));",
      unrealBp: "Atan2 (Degrees)",
      csharp: "float rad = MathF.Atan2(dir.Y, dir.X);",
      cpp: "float rad = std::atan2(dir.y, dir.x);"
    },
    examples: [
      {
        title: "Orienter une arme 2D vers la souris",
        desc: "Calcule le vecteur direction puis le convertit en rotation Z.",
        code: "Vector2 dir = mouseWorld - gun.position;\nfloat deg = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg;\ngun.rotation = Quaternion.Euler(0, 0, deg);"
      },
      {
        title: "Extraire le Yaw horizontal en 3D (Unity Y-Up)",
        desc: "Sur le plan XZ, `Atan2(dir.x, dir.z)` donne le cap par rapport au Nord (+Z).",
        code: "float yawDeg = Mathf.Atan2(dir.x, dir.z) * Mathf.Rad2Deg;"
      }
    ],
    pitfalls: [
      "Ordre des paramètres : c'est `Atan2(Y, X)` et NON `(X, Y)` ! Inverser les deux fait tourner l'angle de 90° et inverse le sens.",
      "Utilisez le bouton de bascule dans le Playground pour comparer en direct le bug d'Atan vs Atan2 !"
    ],
    related: ["deltaangle", "lerpangle-movetowardsangle", "quaternion-lookrotation"]
  },
  {
    id: "deltaangle",
    glyph: "Δθ",
    name: "DeltaAngle",
    subtitle: "Écart angulaire signé le plus court dans [-180°, +180°]",
    categoryId: "trigonometry",
    dimension: "2d",
    difficulty: 1,
    tags: ["Combat & Visée", "3C & Mouvement", "IA & Navigation"],
    sandbox: "trig",
    sandboxMode: "deltaangle",
    formula: "Δθ = ((target - current + 180) mod 360) - 180  ∈ [-180°, +180°]",
    formulaVars: "current, target : angles quelconques (même > 360° ou négatifs)",
    summary: "Calcule la plus petite différence angulaire signée pour aller de l'angle A vers l'angle B. Entre 350° et 10°, une soustraction naïve donne -340° (tour quasi complet !) alors que DeltaAngle renvoie +20°.",
    tldr: "Le signe de DeltaAngle vous dit immédiatement s'il faut tourner à gauche (+) ou à droite (-) pour rejoindre la cible au plus court.",
    signatures: {
      unity: "Mathf.DeltaAngle(currentDeg, targetDeg)",
      godotCs: "Mathf.AngleDifference(fromRad, toRad)",
      godotGd: "angle_difference(from_rad, to_rad)",
      unrealCpp: "FMath::FindDeltaAngleDegrees(A1, A2)",
      unrealBp: "Delta (Rotator) / Find Delta Angle Degrees",
      csharp: "MathF.IEEERemainder(target - current, 360f)",
      cpp: "std::remainder(target - current, 360.0f)"
    },
    examples: [
      {
        title: "Tourelle à vitesse angulaire limitée",
        desc: "Permet de savoir si la cible est dans la tolérance de tir (ex: < 5°).",
        code: "float diff = Mathf.DeltaAngle(turretYaw, targetYaw);\nif (Mathf.Abs(diff) < 5f) Fire();"
      }
    ],
    pitfalls: [
      "Attention aux unités : Unity `Mathf.DeltaAngle` travaille en DEGRÉS, tandis que Godot `Mathf.AngleDifference` travaille en RADIANS !"
    ],
    related: ["lerpangle-movetowardsangle", "atan-vs-atan2", "repeat-wrap"]
  },
  {
    id: "lerpangle-movetowardsangle",
    glyph: "↻θ",
    name: "LerpAngle & MoveTowardsAngle",
    subtitle: "Interpolation et rotation bornée sans saut 359° → 0°",
    categoryId: "trigonometry",
    dimension: "2d",
    difficulty: 1,
    tags: ["3C & Mouvement", "Combat & Visée", "Caméra"],
    sandbox: "trig",
    sandboxMode: "lerpangle",
    formula: "LerpAngle(a, b, t) = a + DeltaAngle(a, b) · clamp01(t)",
    formulaVars: "a : angle actuel · b : angle cible · t : progression [0, 1]",
    summary: "Interpole deux angles en empruntant systématiquement l'arc le plus court autour du cercle. MoveTowardsAngle tourne à vitesse angulaire maximale fixe (ex: 180°/sec) pour les tourelles et personnages lourds.",
    tldr: "Remplace `Lerp` dès qu'une variable représente un angle. Empêche le personnage de faire un 360° fou en passant le Nord.",
    signatures: {
      unity: "Mathf.LerpAngle(a, b, t)  |  Mathf.MoveTowardsAngle(a, b, maxDeg)",
      godotCs: "Mathf.LerpAngle(aRad, bRad, t)",
      godotGd: "lerp_angle(a_rad, b_rad, t)",
      unrealCpp: "FMath::RInterpTo(CurRot, TargetRot, Dt, Speed)",
      unrealBp: "RLerp (Shortest Path = true) / RInterp To",
      csharp: "a + MathF.IEEERemainder(b - a, 360f) * t",
      cpp: "a + std::remainder(b - a, 360.0f) * t"
    },
    examples: [
      {
        title: "Rotation framerate-safe d'un personnage top-down",
        desc: "Combine LerpAngle et décroissance exponentielle pour une sensation fluide à tout FPS.",
        code: "yaw = Mathf.LerpAngle(yaw, targetYaw, 1f - Mathf.Exp(-12f * dt));"
      }
    ],
    pitfalls: [
      "Dans Unreal Blueprint, pensez à cocher la case **Shortest Path** sur le nœud `RLerp` (Lerp Rotator) sinon il interpole naïvement chaque axe !"
    ],
    related: ["deltaangle", "framerate-independent-damping", "quaternion-slerp-nlerp"]
  },

  // =========================================================================
  // 04. Vecteurs & Algèbre Linéaire
  // =========================================================================
  {
    id: "direction",
    glyph: "B-A",
    name: "Vecteur Direction (Target - Origin)",
    subtitle: "Pointer d'un objet A vers une cible B",
    categoryId: "vectors",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["3C & Mouvement", "Combat & Visée", "IA & Navigation"],
    sandbox: "vector",
    sandboxMode: "direction",
    formula: "v = B - A = (Bx - Ax, By - Ay, Bz - Az)",
    formulaVars: "A : point de départ (Origine) · B : point d'arrivée (Cible)",
    summary: "La soustraction de deux positions donne le vecteur de déplacement qui mène exactement de A vers B. Sa norme vaut la distance entre les deux objets et son orientation indique la ligne de mire.",
    tldr: "TOUJOURS `Arrivée - Départ` (B - A). Si vous faites `Départ - Arrivée`, vous obtenez le vecteur de fuite / recul (knockback) !",
    signatures: {
      unity: "Vector3 dir = target.position - transform.position;",
      godotCs: "Vector3 dir = target.GlobalPosition - GlobalPosition;",
      godotGd: "var dir = target.global_position - global_position",
      unrealCpp: "FVector Dir = TargetLocation - ActorLocation;",
      unrealBp: "Vector - Vector (Subtract)",
      csharp: "Vector3 dir = target - origin;",
      cpp: "glm::vec3 dir = target - origin;"
    },
    examples: [
      {
        title: "Knockback radial depuis une explosion",
        desc: "Ici on veut fuir le centre : `Joueur - Explosion`.",
        code: "Vector3 pushDir = (player.position - bomb.position).normalized;"
      },
      {
        title: "Milieu exact entre deux joueurs (Caméra Coop)",
        desc: "Équivalent à `(A + B) * 0.5f`.",
        code: "Vector3 mid = posA + (posB - posA) * 0.5f;"
      }
    ],
    pitfalls: [
      "N'oubliez pas de normaliser `B - A` avant de le multiplier par une vitesse, sinon un ennemi lointain ira 10× plus vite qu'un ennemi proche !"
    ],
    related: ["normalized", "magnitude-sqrmagnitude", "dot-product"]
  },
  {
    id: "normalized",
    glyph: "v̂",
    name: "Normalisation (Vecteur Unitaire)",
    subtitle: "Conserver la direction avec une longueur exacte de 1",
    categoryId: "vectors",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["3C & Mouvement", "Physique", "Combat & Visée"],
    sandbox: "collision",
    sandboxMode: "normalized",
    formula: "v̂ = v / ‖v‖   avec   ‖v̂‖ = 1",
    formulaVars: "v : vecteur brut non nul · ‖v‖ : sa longueur euclidienne",
    summary: "Divise chaque composante d'un vecteur par sa propre longueur pour le projeter exactement sur le cercle (ou la sphère) de rayon 1. C'est la représentation standard de toute direction pure ou normale de surface.",
    tldr: "Sans normalisation sur un clavier ZQSD, appuyer sur Haut + Droite donne longueur √2 ≈ 1.414 : le joueur court 41% plus vite en diagonale !",
    signatures: {
      unity: "Vector3 dir = vec.normalized;  // ou Vector3.ClampMagnitude(in, 1f)",
      godotCs: "Vector3 dir = vec.Normalized();",
      godotGd: "var dir = vec.normalized()",
      unrealCpp: "FVector Dir = Vec.GetSafeNormal();",
      unrealBp: "Normalize (Vector)",
      csharp: "Vector3 dir = Vector3.Normalize(vec);",
      cpp: "glm::vec3 dir = glm::normalize(vec);"
    },
    examples: [
      {
        title: "Déplacement analogique propre (Clavier + Manette)",
        desc: "Utilisez `ClampMagnitude(input, 1f)` plutôt que `.normalized` pour garder la marche lente à la manette tout en bridant la diagonale clavier !",
        code: "Vector2 move = Vector2.ClampMagnitude(rawInput, 1f) * maxSpeed;"
      }
    ],
    pitfalls: [
      "Normaliser le vecteur nul `(0, 0, 0)` divise par zéro (`NaN`) en C++ `glm::normalize` et .NET `Vector3.Normalize` ! Unity `.normalized` et Unreal `.GetSafeNormal()` protègent contre ça.",
      "À la manette, normaliser un stick légèrement incliné `(0.1, 0)` le force à `(1.0, 0)` (vitesse max) : préférez `ClampMagnitude`."
    ],
    related: ["direction", "magnitude-sqrmagnitude", "hysteresis-deadzone"]
  },
  {
    id: "magnitude-sqrmagnitude",
    glyph: "‖v‖²",
    name: "Magnitude, Distance & SqrMagnitude",
    subtitle: "Distances euclidienne, au carré (rapide), Manhattan et Chebyshev",
    categoryId: "vectors",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["Optimisation", "Combat & Visée", "IA & Navigation"],
    sandbox: "vector",
    sandboxMode: "magnitude",
    formula: "‖v‖ = √(x² + y² + z²)   |   ‖v‖² = x² + y² + z²   |   L₁ = |x| + |y|",
    formulaVars: "SqrMagnitude évite √ · L₁ (Manhattan) pour grilles 4-dir · L∞ (Chebyshev) pour 8-dir",
    summary: "Mesure la distance entre deux points. Pour comparer des portées (radar, aggro, tri d'ennemis les plus proches), comparer les distances AU CARRÉ (`sqrDist < range * range`) évite la racine carrée tout en donnant le même résultat exact.",
    tldr: "Test de portée optimisé : `(target - pos).sqrMagnitude <= range * range`. Pour les jeux sur grille (Tactical RPG / A*), utilisez Manhattan (`|dx|+|dy|`) ou Chebyshev (`max(|dx|,|dy|)`).",
    signatures: {
      unity: "float d = Vector3.Distance(a, b);  float d2 = (b - a).sqrMagnitude;",
      godotCs: "float d = a.DistanceTo(b);  float d2 = a.DistanceSquaredTo(b);",
      godotGd: "var d = a.distance_to(b);  var d2 = a.distance_squared_to(b)",
      unrealCpp: "FVector::Dist(A, B)  |  FVector::DistSquared(A, B)",
      unrealBp: "Vector Length / Vector Length Squared",
      csharp: "Vector3.Distance(a, b)  |  Vector3.DistanceSquared(a, b)",
      cpp: "glm::distance(a, b)  |  glm::distance2(a, b)"
    },
    examples: [
      {
        title: "Trouver l'ennemi le plus proche parmi 500 cibles",
        desc: "Aucune racine carrée dans la boucle ; on ne fait `Sqrt` qu'à la fin si besoin d'afficher la distance.",
        code: "float bestSq = float.MaxValue;\nforeach (var e in enemies) {\n  float sq = (e.pos - pos).sqrMagnitude;\n  if (sq < bestSq) { bestSq = sq; closest = e; }\n}"
      }
    ],
    pitfalls: [
      "N'oubliez pas d'élever aussi la portée au carré (`range * range`) ! Comparer `sqrMagnitude < range` est un bug classique.",
      "Pour une distance 2D au sol dans un jeu 3D (ignorer la hauteur), annulez Y (`dy = 0`) ou utilisez `FVector::Dist2D`."
    ],
    related: ["pythagore", "direction", "circle-sphere-collision"]
  },
  {
    id: "pythagore",
    glyph: "a²+b²",
    name: "Théorème de Pythagore",
    subtitle: "Hypoténuse, triangles rectangles et métrique euclidienne",
    categoryId: "vectors",
    dimension: "2d",
    difficulty: 1,
    tags: ["Collisions", "3C & Mouvement", "Optimisation"],
    sandbox: "collision",
    sandboxMode: "pythagore",
    formula: "c² = a² + b²   ⟹   c = √(Δx² + Δy²)",
    formulaVars: "a, b : côtés perpendiculaires (Δx, Δy) · c : hypoténuse (distance directe)",
    summary: "Le pilier géométrique de tout espace euclidien 2D et 3D (c² = Δx² + Δy² + Δz²). Chaque appel à `Distance`, `Magnitude`, `Normalize` ou collision circulaire exécute Pythagore sous le capot.",
    tldr: "Déplacez les sommets dans le Playground : l'hypoténuse bleue est exactement la distance calculée par votre moteur de jeu.",
    signatures: {
      unity: "Mathf.Sqrt(dx * dx + dy * dy)",
      godotCs: "Mathf.Sqrt(dx * dx + dy * dy)",
      godotGd: "sqrt(dx * dx + dy * dy)",
      unrealCpp: "FMath::Sqrt(dx * dx + dy * dy)",
      unrealBp: "Square Root",
      csharp: "MathF.Sqrt(dx * dx + dy * dy)",
      cpp: "std::hypot(dx, dy)"
    },
    examples: [
      {
        title: "Hauteur de la corde d'un arc / détection circulaire",
        desc: "Détermine si un point `(px, py)` est à l'intérieur d'un cercle de centre `(cx, cy)` et rayon `R`.",
        code: "bool inside = (px - cx)*(px - cx) + (py - cy)*(py - cy) <= R * R;"
      }
    ],
    pitfalls: [
      "Pythagore ne s'applique qu'aux triangles RECTANGLES (angle de 90°). Pour un triangle quelconque (bras en IK), utilisez Al-Kashi !"
    ],
    related: ["magnitude-sqrmagnitude", "ik-alkashi-fabrik", "circle-sphere-collision"]
  },
  {
    id: "thales",
    glyph: "h/d",
    name: "Théorème de Thalès & Perspective",
    subtitle: "Proportions, ombres projetées et taille apparente caméra",
    categoryId: "vectors",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["Caméra", "Shaders & Rendu", "UI & Game Feel"],
    sandbox: "collision",
    sandboxMode: "thales",
    formula: "h_proche / d_proche = H_loin / D_loin   ⟹   x_écran = f · (X / Z)",
    formulaVars: "d : distance à la caméra · h : taille réelle · division par Z = projection perspective",
    summary: "Les triangles semblables gouvernent la projection perspective de toute caméra 3D : un objet 2× plus loin paraît exactement 2× plus petit. C'est la mathématique directe derrière les ombres portées, la taille constante de gizmos à l'écran et les puzzles à perspective forcée (Superliminal).",
    tldr: "Pour garder une icône 3D (ou un gizmo) à taille visuelle constante à l'écran, multipliez sa scale proportionnellement à sa distance Z à la caméra.",
    signatures: {
      unity: "float worldScale = distToCam * targetScreenRatio;",
      godotCs: "float worldScale = distToCam * targetScreenRatio;",
      godotGd: "var world_scale = dist_to_cam * target_screen_ratio",
      unrealCpp: "float WorldScale = DistToCam * TargetScreenRatio;",
      unrealBp: "Multiply / Divide (Perspective Ratio)",
      csharp: "float hBig = (hSmall * distBig) / distSmall;",
      cpp: "float hBig = (hSmall * distBig) / distSmall;"
    },
    examples: [
      {
        title: "Mécanique de perspective forcée (type Superliminal)",
        desc: "Quand le joueur lâche un objet plus loin, on le redimensionne selon le ratio `newDist / oldDist` pour qu'il garde la même taille apparente !",
        code: "obj.localScale = grabbedScale * (newDist / grabbedDist);"
      }
    ],
    pitfalls: [
      "Protégez toujours contre `d_proche == 0` (objet collé sur le plan near de la caméra)."
    ],
    related: ["view-projection-frustum", "tan", "ray-plane"]
  },
  {
    id: "dot-product",
    glyph: "A·B",
    name: "Produit Scalaire (Dot Product)",
    subtitle: "Alignement, cône de vision IA, backstab et éclairage Lambert",
    categoryId: "vectors",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["Combat & Visée", "IA & Navigation", "Shaders & Rendu", "Physique"],
    sandbox: "vector",
    sandboxMode: "dot",
    formula: "A · B = Ax·Bx + Ay·By + Az·Bz = ‖A‖·‖B‖·cos(θ)",
    formulaVars: "Si unitaires : +1 = même sens · 0 = perpendiculaires (90°) · -1 = opposés (180°)",
    summary: "L'opération la plus polyvalente de toute la programmation de jeux vidéo. Avec deux vecteurs normalisés, le Dot Product mesure à quel point ils pointent dans la même direction : vision d'un garde, coup dans le dos, inclinaison de pente, freinage en virage et intensité lumineuse d'une surface.",
    tldr: "Dot > 0 : devant · Dot = 0 : pile à 90° sur le flanc · Dot < 0 : dans le dos. En plus, `A · B̂` donne la longueur projetée de A sur B !",
    signatures: {
      unity: "float d = Vector3.Dot(a, b);",
      godotCs: "float d = a.Dot(b);",
      godotGd: "var d = a.dot(b)",
      unrealCpp: "double D = FVector::DotProduct(A, B);",
      unrealBp: "Dot Product",
      csharp: "float d = Vector3.Dot(a, b);",
      cpp: "float d = glm::dot(a, b);"
    },
    examples: [
      {
        title: "Cône de vision & Backstab (Infiltration)",
        desc: "Teste l'angle sans jamais appeler `Acos` ni `Atan2`.",
        code: "float dot = Vector3.Dot(enemy.forward, (player.pos - enemy.pos).normalized);\nif (dot > 0.7f) Alert();   // dans le cône ~90°\nif (dot < -0.5f) Backstab(); // dans le dos"
      },
      {
        title: "Éclairage diffus de Lambert (Shader)",
        desc: "Intensité lumineuse proportionnelle à l'alignement entre normale N et lumière L.",
        code: "float diffuse = max(0.0, dot(normal, lightDir));"
      }
    ],
    pitfalls: [
      "Oublier de normaliser A et B avant de comparer le Dot à `0.7f` : si B a une longueur de 10, le Dot va jusqu'à 10 et casse le seuil !",
      "Le Dot est symétrique (`A·B == B·A`) : il ne dit pas si B est à GAUCHE ou à DROITE de A. Utilisez le Déterminant 2D ou Cross pour le côté."
    ],
    related: ["cross-product", "determinant-2d", "project-projectonplane", "acos"]
  },
  {
    id: "cross-product",
    glyph: "A×B",
    name: "Produit Vectoriel (Cross Product 3D)",
    subtitle: "Vecteur perpendiculaire, normales de mesh et couple (Torque)",
    categoryId: "vectors",
    dimension: "3d",
    difficulty: 2,
    tags: ["Rotations 3D", "Physique", "Shaders & Rendu", "Caméra"],
    sandbox: "space3d",
    sandboxMode: "cross3d",
    formula: "A × B = (AyBz - AzBy, AzBx - AxBz, AxBy - AyBx)   |   ‖A×B‖ = ‖A‖‖B‖sin(θ)",
    formulaVars: "Résultat perpendiculaire au plan formé par A et B · Anti-commutatif : B × A = -(A × B)",
    summary: "Génère un 3ème vecteur 3D strictement orthogonal à A et B. Sa longueur vaut l'aire du parallélogramme (A, B). Essentiel pour calculer la normale d'un triangle 3D, construire l'axe Right d'une caméra ou appliquer un couple de rotation physique.",
    tldr: "Attention à l'ordre ! `A × B` et `B × A` pointent en sens opposés, et la règle (main gauche Unity/Unreal vs main droite Godot) inverse le sens !",
    signatures: {
      unity: "Vector3 n = Vector3.Cross(a, b);  // Left-Handed",
      godotCs: "Vector3 n = a.Cross(b);  // Right-Handed",
      godotGd: "var n = a.cross(b)  # Right-Handed",
      unrealCpp: "FVector N = FVector::CrossProduct(A, B);  // Left-Handed Z-Up",
      unrealBp: "Cross Product",
      csharp: "Vector3 n = Vector3.Cross(a, b);",
      cpp: "glm::vec3 n = glm::cross(a, b);"
    },
    examples: [
      {
        title: "Normale d'un triangle procédural (P0, P1, P2)",
        desc: "Indispensable pour éclairer un mesh généré par code.",
        code: "Vector3 normal = Vector3.Cross(p1 - p0, p2 - p0).normalized;"
      },
      {
        title: "Vecteur Right perpendiculaire à une pente",
        desc: "Aligne un véhicule ou snowboarder à la fois sur sa direction et la normale du sol.",
        code: "Vector3 right = Vector3.Cross(groundNormal, forward).normalized;\nVector3 alignedFwd = Vector3.Cross(right, groundNormal);"
      }
    ],
    pitfalls: [
      "Si A et B sont parallèles (colinéaires), `A × B = (0, 0, 0)` ! Vérifiez toujours que `sqrMagnitude > 1e-6f` avant de normaliser (ex: caméra regardant pile vers le haut `Vector3.up`).",
      "En Unity (Left-Handed) : `Cross(Up, Forward) = Right`. En Godot/OpenGL (Right-Handed) : `Cross(Forward, Up) = Right` !"
    ],
    related: ["dot-product", "orthonormal-basis", "coordinate-systems", "determinant-2d"]
  },
  {
    id: "determinant-2d",
    glyph: "det2",
    name: "Déterminant 2D (PerpDot / Wedge)",
    subtitle: "Savoir instantanément si une cible est à gauche ou à droite",
    categoryId: "vectors",
    dimension: "2d",
    difficulty: 2,
    tags: ["IA & Navigation", "Combat & Visée", "Collisions"],
    sandbox: "vector",
    sandboxMode: "matrix",
    formula: "det(A, B) = A ×₂D B = Ax·By - Ay·Bx = ‖A‖·‖B‖·sin(θ)",
    formulaVars: "Positif : B est à gauche (sens anti-horaire) · Négatif : B est à droite (sens horaire)",
    summary: "L'équivalent 2D du produit vectoriel : un scalaire qui mesure l'aire signée du parallélogramme formé par A et B. En une multiplication-soustraction sans trigonométrie, vous savez de quel côté braquer ou de quel côté d'une ligne se trouve un point.",
    tldr: "Dot dit Devant/Derrière · Det 2D dit Gauche/Droite ! Ensemble, ils remplacent 90% des calculs d'angles en IA.",
    signatures: {
      unity: "float det = a.x * b.y - a.y * b.x;",
      godotCs: "float det = a.Cross(b);",
      godotGd: "var det = a.cross(b)",
      unrealCpp: "double Det = FVector2D::CrossProduct(A, B);",
      unrealBp: "Cross Product 2D",
      csharp: "float det = a.X * b.Y - a.Y * b.X;",
      cpp: "float det = a.x * b.y - a.y * b.x;"
    },
    examples: [
      {
        title: "Braquage d'une voiture IA vers un waypoint",
        desc: "Renvoie directement la direction de braquage sans calculer d'angle.",
        code: "float cross = fwd.x * toWp.y - fwd.y * toWp.x;\nfloat steer = Mathf.Clamp(cross, -1f, 1f);"
      },
      {
        title: "Test de sens d'enroulement (Winding Order / Backface Culling)",
        desc: "Détermine si un triangle 2D (A, B, C) est orienté horaire ou anti-horaire.",
        code: "bool ccw = ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) > 0f;"
      }
    ],
    pitfalls: [
      "En repère écran 2D où Y descend (Canvas HTML, Godot 2D, UI), le signe gauche/droite est inversé par rapport au repère cartésien Y-Up !"
    ],
    related: ["dot-product", "cross-product", "point-in-triangle-barycentric"]
  },
  {
    id: "project-projectonplane",
    glyph: "Proj",
    name: "Projection & ProjectOnPlane",
    subtitle: "Glissement fluide sur murs, pentes et rails",
    categoryId: "vectors",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["3C & Mouvement", "Physique", "Collisions"],
    sandbox: "vector",
    sandboxMode: "projectonplane",
    formula: "Proj_B(A) = ((A·B)/‖B‖²)·B   |   ProjPlane(V, N̂) = V - (V·N̂)·N̂",
    formulaVars: "V : vecteur vitesse/mouvement · N̂ : normale unitaire du mur ou de la pente",
    summary: "Décompose un vecteur en sa composante le long d'un axe (Project) ou parallèlement à une surface (ProjectOnPlane). En retirant la part qui s'enfonce dans un mur, le personnage glisse naturellement le long de l'obstacle au lieu de s'arrêter net.",
    tldr: "Le secret d'un bon Character Controller : `slideVelocity = ProjectOnPlane(velocity, hit.normal)` (ou `vel.Slide(normal)` en Godot).",
    signatures: {
      unity: "Vector3.Project(a, b)  |  Vector3.ProjectOnPlane(v, normal)",
      godotCs: "v.Project(b)  |  v.Slide(normal)",
      godotGd: "v.project(b)  |  v.slide(normal)",
      unrealCpp: "V.ProjectOnTo(B)  |  FVector::VectorPlaneProject(V, Normal)",
      unrealBp: "Project Vector on to Vector / Project Vector on to Plane",
      csharp: "v - Vector3.Dot(v, n) * n",
      cpp: "v - glm::dot(v, n) * n"
    },
    examples: [
      {
        title: "Marcher sur une pente sans rebondir en descente",
        desc: "Aligne la direction horizontale d'entrée sur le plan exact du sol sous les pieds.",
        code: "Vector3 slopeDir = Vector3.ProjectOnPlane(moveInput, groundHit.normal).normalized;"
      },
      {
        title: "Composante de vitesse dans le sens de la route (Drift)",
        desc: "Sépare la vitesse longitudinale (avant) de la vitesse latérale (glisse des pneus).",
        code: "Vector3 fwdVel = Vector3.Project(rb.velocity, transform.forward);\nVector3 latVel = rb.velocity - fwdVel;"
      }
    ],
    pitfalls: [
      "Pour `v - dot(v, n) * n`, la normale `n` DOIT être normalisée ! Sinon la soustraction est faussée (ou divisez par `dot(n, n)`).",
      "Projeter un vecteur horizontal sur une pente raide raccourcit sa longueur : renormalisez ensuite si vous voulez conserver la vitesse de marche."
    ],
    related: ["dot-product", "reflect-rebound", "ray-plane"]
  }
];
