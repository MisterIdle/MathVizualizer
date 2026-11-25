export const CATALOG_SCALARS_CURVES = [
  // =========================================================================
  // 01. Fondamentaux Scalaires & Arithmétique
  // =========================================================================
  {
    id: "abs-sign",
    glyph: "|x|",
    name: "Abs & Sign",
    subtitle: "Valeur absolue, magnitude 1D et direction signée",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 1,
    tags: ["3C & Mouvement", "UI & Game Feel"],
    sandbox: "graph",
    sandboxMode: "abs",
    formula: "|x| = x si x ≥ 0, sinon -x   |   sign(x) ∈ {-1, 0, +1}",
    formulaVars: "x : réel signé (vélocité, écart, entrée joystick)",
    summary: "Abs supprime le signe d'une valeur pour mesurer un écart pur sans se soucier du sens. Sign extrait uniquement la direction (-1 ou +1), idéal pour retourner un personnage 2D ou détecter le sens d'un mouvement.",
    tldr: "Abs(x) donne la distance à 0 (courbe en V). Sign(x) répond uniquement : gauche (-1) ou droite (+1) ?",
    signatures: {
      unity: "Mathf.Abs(x)  |  Mathf.Sign(x)",
      godotCs: "Mathf.Abs(x)  |  Mathf.Sign(x)",
      godotGd: "abs(x)  |  sign(x)",
      unrealCpp: "FMath::Abs(X)  |  FMath::Sign(X)",
      unrealBp: "Absolute (Float) / Sign (Float)",
      csharp: "MathF.Abs(x)  |  MathF.Sign(x)",
      cpp: "std::abs(x)  |  (x > 0) - (x < 0)"
    },
    examples: [
      {
        title: "Retourner un sprite 2D selon la vélocité",
        desc: "Évite les branches if/else verbeuses tout en conservant l'orientation quand la vitesse est nulle.",
        code: "if (Mathf.Abs(vel.x) > 0.05f) sprite.flipX = vel.x < 0f;"
      },
      {
        title: "Zone morte (deadzone) sur un axe",
        desc: "Ignorer le drift d'un stick analogique en vérifiant uniquement la magnitude absolue.",
        code: "float input = Mathf.Abs(rawAxis) < 0.15f ? 0f : rawAxis;"
      }
    ],
    pitfalls: [
      "Attention à Unity `Mathf.Sign(0f)` : il renvoie `+1f` et NON `0f` ! En revanche `System.Math.Sign(0f)`, Godot `Mathf.Sign(0f)` et Unreal `FMath::Sign(0f)` renvoient `0`.",
      "Évitez de faire `Mathf.Abs(a - b) == 0` sur des floats : préférez un seuil epsilon (`< 1e-4f`)."
    ],
    related: ["clamp", "approximately-epsilon", "hysteresis-deadzone"]
  },
  {
    id: "clamp",
    glyph: "[a,b]",
    name: "Clamp & Clamp01",
    subtitle: "Verrouiller une valeur dans une plage sûre",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 1,
    tags: ["3C & Mouvement", "Caméra", "Équilibrage & RPG"],
    sandbox: "graph",
    sandboxMode: "clamp",
    formula: "clamp(x, min, max) = max(min, min(max, x))",
    formulaVars: "x : valeur courante · min, max : bornes inférieure et supérieure",
    summary: "Sature une variable pour qu'elle ne descende jamais sous min et ne dépasse jamais max. Clamp01 est la variante spécialisée sur [0, 1], omniprésente pour les pourcentages, l'alpha UI et les shaders.",
    tldr: "Le garde-fou universel : HP entre 0 et MaxHP, Pitch caméra entre -85° et +85°, paramètres avant Acos/Asin entre -1 et +1.",
    params: [
      { key: "a", label: "Minimum", min: -3.5, max: 1.0, step: 0.25, value: -1.5 },
      { key: "b", label: "Maximum", min: -0.5, max: 3.5, step: 0.25, value: 1.75 }
    ],
    signatures: {
      unity: "Mathf.Clamp(v, min, max)  |  Mathf.Clamp01(v)",
      godotCs: "Mathf.Clamp(v, min, max)",
      godotGd: "clampf(v, min, max)",
      unrealCpp: "FMath::Clamp(V, Min, Max)",
      unrealBp: "Clamp (Float)",
      csharp: "Math.Clamp(v, min, max)",
      cpp: "std::clamp(v, min, max)"
    },
    examples: [
      {
        title: "Limiter le Pitch d'une caméra FPS",
        desc: "Empêche la caméra de se retourner à l'envers au-dessus de la tête du joueur.",
        code: "pitch = Mathf.Clamp(pitch - mouseY * sens, -85f, 85f);"
      },
      {
        title: "Sécuriser un Dot Product avant Acos",
        desc: "Les erreurs flottantes peuvent donner dot = 1.000001 et produire NaN dans Acos.",
        code: "float angle = Mathf.Acos(Mathf.Clamp(Vector3.Dot(a, b), -1f, 1f));"
      }
    ],
    pitfalls: [
      "Si `min > max`, `std::clamp` en C++ provoque un comportement indéfini (UB) et `Math.Clamp` en C# lève une `ArgumentException`.",
      "Ne confondez pas `Clamp` (sature aux bords) avec `Repeat` (boucle comme un cercle)."
    ],
    related: ["lerp", "inverselerp-remap", "acos"]
  },
  {
    id: "floor-ceil-round",
    glyph: "⌊x⌋",
    name: "Floor, Ceil, Round & Snap",
    subtitle: "Quantification, arrondis et aimantation sur grille",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 1,
    tags: ["3C & Mouvement", "Procédural", "UI & Game Feel"],
    sandbox: "graph",
    sandboxMode: "round",
    formula: "snap(x, step) = round(x / step) · step",
    formulaVars: "step : taille d'une cellule de grille ou d'un palier",
    summary: "Convertit une valeur réelle continue en paliers discrets. Floor arrondit vers -∞, Ceil vers +∞, Truncate vers 0, et Round vers l'entier le plus proche. Combinés à une division/multiplication, ils créent tout système de grille.",
    tldr: "Floor(x / cellSize) donne la case exacte d'un monde voxel ou d'une tilemap — même en coordonnées négatives !",
    params: [
      { key: "a", label: "Mode (0:Round 1:Floor 2:Ceil)", min: 0, max: 2, step: 1, value: 0 },
      { key: "b", label: "Pas de grille (Step)", min: 0.5, max: 2.0, step: 0.25, value: 1.0 }
    ],
    signatures: {
      unity: "Mathf.FloorToInt(x) / CeilToInt / RoundToInt",
      godotCs: "Mathf.FloorToInt(x) / Snapped(x, step)",
      godotGd: "floori(x) / snappedf(x, step)",
      unrealCpp: "FMath::FloorToInt(X) / GridSnap(X, Grid)",
      unrealBp: "Floor / Ceil / Round / Grid Snap",
      csharp: "MathF.Floor(x) / Ceiling / Round",
      cpp: "std::floor(x) / std::ceil(x) / std::round(x)"
    },
    examples: [
      {
        title: "Coordonnée de chunk / tuile en monde infini",
        desc: "Fonctionne sans décalage à zéro contrairement au cast `(int)` qui tronque vers 0.",
        code: "int chunkX = Mathf.FloorToInt(playerPos.x / chunkSize);"
      },
      {
        title: "Placement de bâtiment aimanté (City Builder)",
        desc: "Aligne la position monde de la souris au centre de la cellule la plus proche.",
        code: "float snapX = Mathf.Round(worldPos.x / gridSize) * gridSize;"
      }
    ],
    pitfalls: [
      "Ne faites JAMAIS `(int)(x / cellSize)` pour une grille avec coordonnées négatives : `(int)(-0.4)` vaut `0`, créant une cellule double-largeur autour de l'origine ! Utilisez toujours `FloorToInt`.",
      "C# `Math.Round` et Unity `Mathf.Round` utilisent par défaut l'arrondi bancaire (MidpointRounding.ToEven : `2.5 -> 2`, `3.5 -> 4`)."
    ],
    related: ["euclide-modulo", "repeat-wrap", "prng-hash-seeds"]
  },
  {
    id: "euclide-modulo",
    glyph: "a%b",
    name: "Division Euclidienne & Modulo (%)",
    subtitle: "Quotient, reste, inventaires et conversions 1D ↔ 2D",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 1,
    tags: ["UI & Game Feel", "Optimisation", "Procédural"],
    sandbox: "collision",
    sandboxMode: "euclide",
    formula: "A = B · Q + R   avec   Q = ⌊A / B⌋,  R = A mod B",
    formulaVars: "A : total d'unités · B : capacité d'un groupe/ligne · Q : groupes complets · R : reste",
    summary: "Décompose un entier en nombre de paquets complets (Quotient) et en unités restantes (Reste). Fondamental pour convertir un index linéaire de tableau plat en coordonnées (x, y) de grille et gérer des stacks d'inventaire.",
    tldr: "Sur une grille de largeur W : `col = index % W`, `row = index / W`, et inversement `index = row * W + col`.",
    signatures: {
      unity: "int q = a / b;  int r = a % b;",
      godotCs: "int q = a / b;  int r = Mathf.PosMod(a, b);",
      godotGd: "var q = a / b;  var r = posmod(a, b)",
      unrealCpp: "int32 Q = A / B;  int32 R = A % B;",
      unrealBp: "Percent (%) / Division (Whole and Remainder)",
      csharp: "(int q, int r) = Math.DivRem(a, b);",
      cpp: "auto [q, r] = std::div(a, b);"
    },
    examples: [
      {
        title: "Tableau 1D aplati pour carte 2D / 3D (cache-friendly)",
        desc: "Stocker une map 2D dans un `T[]` contigu améliore drastiquement les performances CPU.",
        code: "int x = idx % width; int y = idx / width;"
      },
      {
        title: "Affichage chronomètre MM:SS",
        desc: "Convertir un temps total en secondes en minutes et secondes restantes.",
        code: "int min = totalSec / 60; int sec = totalSec % 60;"
      }
    ],
    pitfalls: [
      "En C#, C++ et HLSL, l'opérateur `%` garde le signe du dividende : `-1 % 4 == -1` ! Pour cycler un index d'inventaire vers la gauche (`index - 1`), écrivez `((i % n) + n) % n` ou `Mathf.PosMod`.",
      "Attention à la division par zéro (`b == 0`) qui fait crasher le CPU sur les entiers."
    ],
    related: ["repeat-wrap", "floor-ceil-round", "bitmasks-flags"]
  },
  {
    id: "repeat-wrap",
    glyph: "↻",
    name: "Repeat / PosMod (Wrap)",
    subtitle: "Boucle positive continue (effet Pac-Man & cycles)",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 1,
    tags: ["3C & Mouvement", "UI & Game Feel", "Shaders & Rendu"],
    sandbox: "graph",
    sandboxMode: "repeat",
    formula: "repeat(t, L) = t - ⌊t / L⌋ · L  ∈ [0, L)",
    formulaVars: "t : valeur libre (même négative) · L : période de boucle (> 0)",
    summary: "Enroule continuellement n'importe quel réel (positif ou négatif) dans l'intervalle [0, L). C'est l'équivalent mathématique propre du modulo pour les flottants et les coordonnées de textures (UV wrapping).",
    tldr: "Contrairement à `t % L` qui passe en négatif sous 0, `Repeat(t, L)` reste toujours proprement dans [0, L).",
    params: [
      { key: "a", label: "Période (L)", min: 0.5, max: 4.0, step: 0.25, value: 2.0 }
    ],
    signatures: {
      unity: "Mathf.Repeat(t, length)",
      godotCs: "Mathf.PosMod(t, length)",
      godotGd: "fposmod(t, length)",
      unrealCpp: "FMath::Fmod(FMath::Fmod(T, L) + L, L)",
      unrealBp: "FMod (puis Wrap positif)",
      csharp: "t - MathF.Floor(t / len) * len",
      cpp: "t - std::floor(t / len) * len"
    },
    examples: [
      {
        title: "Écran toroïdal (Asteroids / Pac-Man)",
        desc: "Sortir par la gauche téléporte instantanément à droite sans aucune branche conditionnelle.",
        code: "pos.x = Mathf.Repeat(pos.x, worldWidth);"
      },
      {
        title: "Cycle jour/nuit sur 24 heures",
        desc: "Fait tourner l'heure en continu même si on remonte le temps.",
        code: "hour = Mathf.Repeat(hour + dt * timeScale, 24f);"
      }
    ],
    pitfalls: [
      "`FMath::Fmod` et `std::fmod` renvoient un nombre NÉGATIF si `t < 0`. Utilisez `t - floor(t / L) * L` ou `Mathf.Repeat` pour un vrai wrap positif."
    ],
    related: ["pingpong", "euclide-modulo", "deltaangle"]
  },
  {
    id: "pingpong",
    glyph: "⇄",
    name: "PingPong",
    subtitle: "Oscillation triangulaire aller-retour automatique",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 1,
    tags: ["3C & Mouvement", "UI & Game Feel"],
    sandbox: "graph",
    sandboxMode: "pingpong",
    formula: "pingpong(t, L) = L - |repeat(t, 2L) - L|  ∈ [0, L]",
    formulaVars: "t : temps ou distance parcourue · L : amplitude maximale",
    summary: "Fait monter linéairement une valeur de 0 à L puis redescendre de L à 0 à l'infini, formant une onde triangulaire continue à vitesse constante.",
    tldr: "Une plateforme mobile, un faisceau de garde ou une jauge de QTE en une seule ligne, sans booléen `goingForward`.",
    params: [
      { key: "a", label: "Amplitude (L)", min: 0.5, max: 3.5, step: 0.25, value: 2.0 }
    ],
    signatures: {
      unity: "Mathf.PingPong(t, length)",
      godotCs: "Mathf.PingPong(t, length)",
      godotGd: "pingpong(t, length)",
      unrealCpp: "FMath::PingPong(T, Length)",
      unrealBp: "Ping Pong",
      csharp: "len - MathF.Abs(((t % (len*2) + len*2) % (len*2)) - len)",
      cpp: "len - std::abs(repeat(t, len * 2.0f) - len)"
    },
    examples: [
      {
        title: "Plateforme mobile avec freinage doux aux extrémités",
        desc: "Combinez PingPong (0..1) avec SmoothStep pour un aller-retour qui ralentit en bout de course.",
        code: "float t = Mathf.SmoothStep(0f, 1f, Mathf.PingPong(Time.time * speed, 1f));"
      }
    ],
    pitfalls: [
      "PingPong pur inverse brutalement sa vitesse aux extrémités (dérivée discontinue). Passez sa sortie dans `SmoothStep` si vous voulez un demi-tour doux."
    ],
    related: ["repeat-wrap", "smoothstep", "sin"]
  },
  {
    id: "pow-sqrt-log",
    glyph: "xᵖ",
    name: "Pow, Sqrt & Logarithmes",
    subtitle: "Puissances, racines, décibels audio et courbes de progression",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 1,
    tags: ["Équilibrage & RPG", "Shaders & Rendu", "Optimisation"],
    sandbox: "graph",
    sandboxMode: "pow",
    formula: "y = xᵖ   |   √x = x^(1/2)   |   log_b(x) = ln(x) / ln(b)",
    formulaVars: "p : exposant (>1 accélère, <1 freine) · log : inverse exact de l'exponentielle",
    summary: "Les fonctions puissances et logarithmiques sculptent les réponses non linéaires : perception humaine du son (dB), atténuation lumineuse, sensibilité de joystick, et courbes d'XP/niveaux.",
    tldr: "`p > 1` creuse la courbe (précision près de 0) · `0 < p < 1` la bombe (gain rapide) · `log` compresse les très grands nombres.",
    params: [
      { key: "a", label: "Exposant (p)", min: 0.25, max: 4.0, step: 0.25, value: 2.0 },
      { key: "b", label: "Mode (0:Pow 1:Log 2:Exp)", min: 0, max: 2, step: 1, value: 0 }
    ],
    signatures: {
      unity: "Mathf.Pow(x, p) / Sqrt(x) / Log(x)",
      godotCs: "Mathf.Pow(x, p) / Sqrt(x) / Log(x)",
      godotGd: "pow(x, p) / sqrt(x) / log(x)",
      unrealCpp: "FMath::Pow(X, P) / Sqrt(X) / Loge(X)",
      unrealBp: "Power / Square Root / Log (e)",
      csharp: "MathF.Pow(x, p) / Sqrt(x) / Log(x)",
      cpp: "std::pow(x, p) / std::sqrt(x) / std::log(x)"
    },
    examples: [
      {
        title: "Slider de volume audio en Décibels",
        desc: "L'oreille humaine est logarithmique : un slider linéaire [0.0001..1] se convertit via `20 * log10(vol)`.",
        code: "mixer.SetFloat(\"MasterVol\", Mathf.Log10(Mathf.Max(slider, 0.0001f)) * 20f);"
      },
      {
        title: "Courbe de sensibilité joystick",
        desc: "Préserve le signe tout en donnant plus de finesse pour les petits mouvements de visée.",
        code: "float curved = Mathf.Sign(raw) * Mathf.Pow(Mathf.Abs(raw), 1.8f);"
      }
    ],
    pitfalls: [
      "`Pow(x, p)` avec `x < 0` et `p` non entier renvoie `NaN` ! Prenez toujours `Abs(x)` puis réappliquez `Sign(x)`.",
      "Pour `x²` ou `x³`, écrivez `x * x` au lieu de `Pow(x, 2)` : c'est 10× plus rapide.",
      "`Log(0)` renvoie `-Infinity` : bornez toujours l'entrée au-dessus de `0.0001f`."
    ],
    related: ["damage-xp-curves", "color-spaces-kelvin", "magnitude-sqrmagnitude"]
  },
  {
    id: "approximately-epsilon",
    glyph: "≈ε",
    name: "Approximately & Précision Flottante",
    subtitle: "IEEE 754, epsilon relatif et jitter en monde ouvert",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 2,
    tags: ["Optimisation", "Physique", "3C & Mouvement"],
    sandbox: "graph",
    sandboxMode: "approximately",
    formula: "|a - b| ≤ max(ε_rel · max(|a|, |b|), ε_abs)",
    formulaVars: "ε : tolérance de comparaison · float32 ≈ 7 chiffres significatifs (24 bits mantisse)",
    summary: "Un `float` (32 bits) ne peut pas représenter exactement 0.1 ou 0.2 en binaire. Plus un nombre est grand (ex: joueur à x = 100 000m), plus l'espacement entre deux floats consécutifs (ULP) grandit, causant tremblements de caméra et bugs de physique.",
    tldr: "Ne testez JAMAIS `a == b` entre deux floats calculés. Utilisez `Approximately` ou une tolérance adaptée à l'échelle.",
    params: [
      { key: "a", label: "Cible (a)", min: -3.0, max: 3.0, step: 0.25, value: 1.0 },
      { key: "b", label: "Tolérance (ε)", min: 0.05, max: 1.5, step: 0.05, value: 0.35 }
    ],
    signatures: {
      unity: "Mathf.Approximately(a, b)",
      godotCs: "Mathf.IsEqualApprox(a, b)",
      godotGd: "is_equal_approx(a, b)",
      unrealCpp: "FMath::IsNearlyEqual(A, B, 1e-4f)",
      unrealBp: "Nearly Equal (Float)",
      csharp: "MathF.Abs(a - b) <= 1e-5f",
      cpp: "std::abs(a - b) <= 1e-5f"
    },
    examples: [
      {
        title: "Éviter une division par zéro sur une normale",
        desc: "Vérifier que la norme au carré n'est pas quasi-nulle avant de normaliser.",
        code: "if (v.sqrMagnitude > 1e-8f) dir = v.normalized;"
      },
      {
        title: "Floating Origin en monde ouvert",
        desc: "Au-delà de ~5 km en float32, la précision tombe au millimètre : Unreal 5 utilise `double` (LWC) et Unity/Godot décalent l'origine du monde.",
        code: "if (player.position.magnitude > 2000f) RecenterWorld(player.position);"
      }
    ],
    pitfalls: [
      "En Unity, `Mathf.Epsilon` (~1.4e-45) est beaucoup trop petit pour des opérations géométriques : préférez `1e-5f` ou `Mathf.Approximately`.",
      "Un `NaN` n'est égal à RIEN, pas même à lui-même (`NaN != NaN` vaut `true`)."
    ],
    related: ["normalized", "clamp", "coordinate-systems"]
  },
  {
    id: "bitmasks-flags",
    glyph: "1<<n",
    name: "Masques Binaires & Bitflags",
    subtitle: "LayerMasks, états multiples et collisions en O(1)",
    categoryId: "scalars",
    dimension: "general",
    difficulty: 2,
    tags: ["Optimisation", "Collisions", "Combat & Visée"],
    sandbox: "graph",
    sandboxMode: "bitmask",
    formula: "Add: m |= (1<<k) · Remove: m &= ~(1<<k) · Has: (m & (1<<k)) != 0",
    formulaVars: "m : entier 32 bits (32 booléens condensés) · k : index du bit/layer [0..31]",
    summary: "Stocke jusqu'à 32 booléens (layers physiques, états de personnage, permissions, directions de tuiles auto-tiling) dans un seul entier de 4 octets, testable en 1 cycle CPU.",
    tldr: "Décaler `1 << layer` allume le bit du layer. `|` fusionne deux masques, `&` teste l'intersection, `~` inverse tout.",
    params: [
      { key: "a", label: "Masque A (0..255)", min: 0, max: 255, step: 1, value: 45 },
      { key: "b", label: "Masque B (0..255)", min: 0, max: 255, step: 1, value: 23 }
    ],
    signatures: {
      unity: "int mask = (1 << LayerMask.NameToLayer(\"Enemy\"));",
      godotCs: "uint mask = 1u << (layer - 1);",
      godotGd: "var mask = 1 << (layer - 1)",
      unrealCpp: "uint32 Flags |= (1 << static_cast<uint32>(EState::Stunned));",
      unrealBp: "Bitwise OR / AND / Make Bitmask",
      csharp: "[Flags] enum Status { None=0, Poison=1<<0, Burn=1<<1 }",
      cpp: "uint32_t mask = (1u << k);"
    },
    examples: [
      {
        title: "Filtrer un Raycast sur plusieurs Layers (Unity)",
        desc: "Combine plusieurs couches physiques sans aucune allocation mémoire.",
        code: "int mask = (1 << groundLayer) | (1 << enemyLayer);\nPhysics.Raycast(ray, out hit, 100f, mask);"
      },
      {
        title: "Auto-Tiling 4 voisins (Bitmasking 2D)",
        desc: "Encode Haut(1) + Droite(2) + Bas(4) + Gauche(8) en un index 0..15 qui choisit instantanément la bonne tuile.",
        code: "int tileId = (up?1:0) | (right?2:0) | (down?4:0) | (left?8:0);"
      }
    ],
    pitfalls: [
      "Priorité des opérateurs en C#/C++ : `==` passe AVANT `&` ! Écrivez toujours `(mask & flag) != 0` avec des parenthèses.",
      "Attention en Godot : les layers dans l'éditeur sont numérotés de 1 à 32, donc le bit correspondant est `1 << (layer - 1)`."
    ],
    related: ["euclide-modulo", "prng-hash-seeds", "aabb-collision"]
  },

  // =========================================================================
  // 02. Interpolations, Ressorts & Game Feel
  // =========================================================================
  {
    id: "lerp",
    glyph: "lerp",
    name: "Lerp & LerpUnclamped",
    subtitle: "Interpolation linéaire entre A et B (et extrapolation)",
    categoryId: "interpolation",
    dimension: "general",
    difficulty: 1,
    tags: ["UI & Game Feel", "3C & Mouvement", "Shaders & Rendu"],
    sandbox: "graph",
    sandboxMode: "lerp",
    formula: "lerp(a, b, t) = a + (b - a) · t = (1 - t)·a + t·b",
    formulaVars: "a : départ · b : arrivée · t : facteur d'avancement [0, 1]",
    summary: "Calcule un mélange linéaire exact entre A et B. À t=0 on est à A, à t=0.5 pile au milieu, à t=1 à B. La variante Unclamped autorise t < 0 ou t > 1 pour l'extrapolation (effet overshoot / anticipation).",
    tldr: "La brique numéro 1 du Game Dev : positions, couleurs, FOV, volumes, dégâts, shaders — tout s'interpole via Lerp.",
    params: [
      { key: "a", label: "Départ (a)", min: -3.5, max: 3.5, step: 0.25, value: -2.0 },
      { key: "b", label: "Arrivée (b)", min: -3.5, max: 3.5, step: 0.25, value: 2.5 }
    ],
    signatures: {
      unity: "Mathf.Lerp(a, b, t)  |  Mathf.LerpUnclamped(a, b, t)",
      godotCs: "Mathf.Lerp(a, b, t)",
      godotGd: "lerpf(a, b, t)",
      unrealCpp: "FMath::Lerp(A, B, Alpha)",
      unrealBp: "Lerp (Float / Vector)",
      csharp: "float.Lerp(a, b, t)",
      cpp: "std::lerp(a, b, t)"
    },
    examples: [
      {
        title: "Jauge de vie colorée dynamiquement",
        desc: "Passe du rouge critique au vert plein en fonction du ratio de PV.",
        code: "bar.color = Color.Lerp(Color.red, Color.green, hp / maxHp);"
      },
      {
        title: "Extrapolation avec LerpUnclamped",
        desc: "Indispensable pour les courbes d'easing qui dépassent 1.0 (ex: EaseOutBack).",
        code: "float scale = Mathf.LerpUnclamped(0f, 1f, easeOutBack(t));"
      }
    ],
    pitfalls: [
      "PIÈGE CLASSIQUE : `x = Lerp(x, target, speed * dt)` dépend du framerate ! À 30 FPS vs 144 FPS, la vitesse réelle change. Utilisez `1 - exp(-lambda * dt)` (voir Amortissement Indépendant du Framerate).",
      "Pour interpoler des angles, n'utilisez jamais `Lerp` (saut à 360°→0°) : utilisez `LerpAngle` ou `Quaternion.Slerp`."
    ],
    related: ["inverselerp-remap", "framerate-independent-damping", "smoothstep"]
  },
  {
    id: "inverselerp-remap",
    glyph: "t(x)",
    name: "InverseLerp & Remap",
    subtitle: "Convertir une plage quelconque [A, B] vers [C, D]",
    categoryId: "interpolation",
    dimension: "general",
    difficulty: 1,
    tags: ["UI & Game Feel", "Caméra", "Équilibrage & RPG"],
    sandbox: "graph",
    sandboxMode: "inverselerp",
    formula: "t = clamp01((x - a) / (b - a))   |   remap(x, a, b, c, d) = lerp(c, d, invLerp(a, b, x))",
    formulaVars: "[a, b] : plage source · [c, d] : plage cible",
    summary: "InverseLerp répond à « où se situe x en pourcentage [0..1] entre a et b ? ». En chaînant InverseLerp puis Lerp, on obtient Remap : l'outil ultime pour relier n'importe quelle donnée gameplay à un paramètre visuel ou audio.",
    tldr: "Remap transforme par exemple une vitesse [0..120 km/h] en FOV caméra [65°..95°] en une seule fonction propre.",
    params: [
      { key: "a", label: "Plage Min (a)", min: -3.5, max: 0.5, step: 0.25, value: -2.0 },
      { key: "b", label: "Plage Max (b)", min: 0.75, max: 3.5, step: 0.25, value: 2.0 }
    ],
    signatures: {
      unity: "Mathf.InverseLerp(a, b, v)  // Remap = Lerp(c, d, InverseLerp(a, b, v))",
      godotCs: "Mathf.Remap(v, inMin, inMax, outMin, outMax)",
      godotGd: "remap(v, in_min, in_max, out_min, out_max)",
      unrealCpp: "FMath::GetMappedRangeValueClamped({A, B}, {C, D}, V)",
      unrealBp: "Map Range Clamped",
      csharp: "Math.Clamp((v - a) / (b - a), 0f, 1f)",
      cpp: "std::clamp((v - a) / (b - a), 0.0f, 1.0f)"
    },
    examples: [
      {
        title: "FOV dynamique selon la vitesse du véhicule",
        desc: "Donne une sensation d'accélération immédiate sans constantes magiques.",
        code: "float t = Mathf.InverseLerp(10f, 80f, speed);\ncam.fieldOfView = Mathf.Lerp(60f, 92f, t);"
      },
      {
        title: "Atténuation des dégâts d'explosion",
        desc: "100% de dégâts au centre, 0% au bord du rayon d'explosion.",
        code: "float dmg = Mathf.Lerp(maxDmg, 0f, Mathf.InverseLerp(innerR, outerR, dist));"
      }
    ],
    pitfalls: [
      "Si `a == b`, `(v - a) / (b - a)` divise par zéro ! Protégez toujours votre fonction Remap custom avec `Mathf.Approximately(a, b)`.",
      "Godot `remap` et Unreal `MapRangeUnclamped` ne bornent PAS la sortie par défaut : utilisez `MapRangeClamped` ou `Clamp` si nécessaire."
    ],
    related: ["lerp", "smoothstep", "clamp"]
  },
  {
    id: "smoothstep",
    glyph: "S(t)",
    name: "SmoothStep & SmootherStep",
    subtitle: "Courbes en S (Hermite C¹ et Perlin C²)",
    categoryId: "interpolation",
    dimension: "general",
    difficulty: 1,
    tags: ["UI & Game Feel", "Shaders & Rendu", "Caméra"],
    sandbox: "graph",
    sandboxMode: "smoothstep",
    formula: "SmoothStep: 3t² - 2t³   |   SmootherStep (Perlin): 6t⁵ - 15t⁴ + 10t³",
    formulaVars: "t ∈ [0, 1] · dérivée nulle à t=0 et t=1 (départ & arrêt sans à-coup)",
    summary: "Remplace la ligne droite rigide de Lerp par une courbe en S dont la pente est parfaitement nulle au départ et à l'arrivée. SmootherStep annule même la dérivée seconde (accélération nulle aux bords), essentiel pour le bruit de Perlin et les transitions caméra.",
    tldr: "Le moyen le plus simple et le moins cher (3 multiplications) de rendre une transition UI, une porte ou un shader organique.",
    params: [
      { key: "a", label: "Départ (a)", min: -3.0, max: 0.5, step: 0.25, value: -1.75 },
      { key: "b", label: "Arrivée (b)", min: 0.5, max: 3.0, step: 0.25, value: 2.0 }
    ],
    signatures: {
      unity: "Mathf.SmoothStep(a, b, t)  // HLSL: smoothstep(edge0, edge1, x)",
      godotCs: "Mathf.SmoothStep(from, to, x)",
      godotGd: "smoothstep(from, to, x)",
      unrealCpp: "FMath::SmoothStep(A, B, X)",
      unrealBp: "SmoothStep / Ease (EaseInOut)",
      csharp: "t = Clamp01(t); return t * t * (3f - 2f * t);",
      cpp: "glm::smoothstep(edge0, edge1, x)"
    },
    examples: [
      {
        title: "Masque doux dans un Shader (Dissolve / Rim / Fog)",
        desc: "Crée un bord antialiasé au lieu d'un `step()` brutal et pixelisé.",
        code: "float mask = smoothstep(threshold - feather, threshold + feather, noise);"
      },
      {
        title: "Ouverture d'ascenseur ou de panneau UI",
        desc: "Accélère doucement au début puis freine naturellement à l'arrivée.",
        code: "posY = Mathf.SmoothStep(closedY, openY, elapsed / duration);"
      }
    ],
    pitfalls: [
      "PIÈGE D'API MAJEUR : En Unity C#, `Mathf.SmoothStep(from, to, t)` attend un `t` dans `[0, 1]` et retourne une valeur dans `[from, to]`. En HLSL/GLSL, Godot et Unreal, `smoothstep(edge0, edge1, x)` attend `x` dans `[edge0, edge1]` et retourne `[0, 1]` !"
    ],
    related: ["lerp", "easing-curves", "perlin-noise"]
  },
  {
    id: "easing-curves",
    glyph: "ƒ(t)",
    name: "Courbes d'Easing (Penner)",
    subtitle: "Quad, Cubic, Expo, Back, Elastic & Bounce pour le Game Feel",
    categoryId: "interpolation",
    dimension: "general",
    difficulty: 1,
    tags: ["UI & Game Feel", "Caméra"],
    sandbox: "graph",
    sandboxMode: "easing",
    formula: "EaseOutCubic: 1 - (1 - t)³  ·  EaseOutBack: 1 + c₃(t-1)³ + c₁(t-1)²",
    formulaVars: "t ∈ [0, 1] : temps normalisé · EaseIn (démarre lent), EaseOut (freine), EaseInOut",
    summary: "Les fonctions d'easing transforment un temps linéaire t ∈ [0, 1] en courbe d'animation expressive : départ nerveux (EaseOut), élan/anticipation (Back), rebond physique (Bounce) ou ressort (Elastic). Cœur de DOTween, PrimeTween et des animations procédurales.",
    tldr: "Pour une UI réactive : préférez toujours `EaseOut` (démarre vite dès le clic, atterrit en douceur). Réservez `EaseIn` aux sorties d'écran.",
    params: [
      { key: "a", label: "Courbe (0:OutCubic 1:InOutCubic 2:OutBack 3:OutElastic 4:OutBounce)", min: 0, max: 4, step: 1, value: 2 }
    ],
    signatures: {
      unity: "float e = EaseOutBack(t); pos = Vector3.LerpUnclamped(a, b, e);",
      godotCs: "Tween.SetEase(EaseType.Out).SetTrans(TransitionType.Back)",
      godotGd: "tween.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_BACK)",
      unrealCpp: "FMath::InterpEaseOut(A, B, Alpha, Exp)",
      unrealBp: "Ease (Function: Cubic / Elastic / Back)",
      csharp: "float EaseOutCubic(float t) => 1f - MathF.Pow(1f - t, 3f);",
      cpp: "float easeOutCubic(float t) { float u = 1.f - t; return 1.f - u*u*u; }"
    },
    examples: [
      {
        title: "Pop-in de coffre / carte UI (EaseOutBack)",
        desc: "Dépasse légèrement 1.0 puis se stabilise pour un ressenti tactile « Apple-like ».",
        code: "float s = EaseOutBack(t); card.localScale = Vector3.one * s;"
      },
      {
        title: "Impact de coup (Hit-punch)",
        desc: "EaseOutExpo offre un claquement immédiat suivi d'une récupération lente.",
        code: "float punch = 1f - Mathf.Pow(2f, -10f * t);"
      }
    ],
    pitfalls: [
      "Utilisez TOUJOURS `LerpUnclamped` avec `EaseOutBack` ou `EaseOutElastic`, sinon `Lerp` classique coupe l'overshoot au-dessus de 1.0 et tue l'effet !"
    ],
    related: ["smoothstep", "smoothdamp-spring", "lerp"]
  },
  {
    id: "movetowards",
    glyph: "→|",
    name: "MoveTowards",
    subtitle: "Déplacement à vitesse constante exacte sans overshoot",
    categoryId: "interpolation",
    dimension: "general",
    difficulty: 1,
    tags: ["3C & Mouvement", "IA & Navigation"],
    sandbox: "graph",
    sandboxMode: "movetowards",
    formula: "x' = target si |target - x| ≤ maxDelta, sinon x + sign(target - x) · maxDelta",
    formulaVars: "maxDelta = speed · dt : pas maximal autorisé cette frame",
    summary: "Avance la valeur courante vers la cible d'un pas fixe au maximum. Contrairement à Lerp qui ralentit indéfiniment sans jamais atteindre exactement la cible, MoveTowards garantit une vitesse linéaire stricte et une arrivée exacte.",
    tldr: "Indispensable pour l'accélération/décélération de personnages, les barres de cooldown et les déplacements de plateformes.",
    params: [
      { key: "a", label: "Cible (Target)", min: -3.0, max: 3.0, step: 0.25, value: 2.25 },
      { key: "b", label: "MaxDelta (Pas)", min: 0.2, max: 2.5, step: 0.1, value: 1.0 }
    ],
    signatures: {
      unity: "Mathf.MoveTowards(current, target, speed * Time.deltaTime)",
      godotCs: "Mathf.MoveToward(current, target, speed * dt)",
      godotGd: "move_toward(current, target, speed * delta)",
      unrealCpp: "FMath::FInterpConstantTo(Cur, Target, Dt, Speed)",
      unrealBp: "FInterp To Constant",
      csharp: "MathF.Abs(t - c) <= step ? t : c + MathF.Sign(t - c) * step",
      cpp: "std::abs(t - c) <= step ? t : c + std::copysign(step, t - c)"
    },
    examples: [
      {
        title: "Accélération et freinage précis d'un Platformer",
        desc: "Permet des valeurs différentes pour l'accélération au sol, le freinage et le contrôle aérien.",
        code: "float rate = inputX != 0 ? accel : decel;\nvel.x = Mathf.MoveTowards(vel.x, inputX * maxSpeed, rate * dt);"
      }
    ],
    pitfalls: [
      "En 2D/3D, utilisez `Vector3.MoveTowards` (et non `Mathf.MoveTowards` séparément sur X et Y), sinon la trajectoire fait un coude en arrivant sur un axe avant l'autre !"
    ],
    related: ["framerate-independent-damping", "friction-drag-acceleration", "lerpangle-movetowardsangle"]
  },
  {
    id: "framerate-independent-damping",
    glyph: "e⁻λt",
    name: "Amortissement Indépendant du Framerate",
    subtitle: "Corriger définitivement le bug de Lerp(a, b, k * dt)",
    categoryId: "interpolation",
    dimension: "general",
    difficulty: 2,
    tags: ["3C & Mouvement", "Caméra", "Physique", "UI & Game Feel"],
    sandbox: "graph",
    sandboxMode: "expdamp",
    formula: "x(t + dt) = lerp(x, target, 1 - e^(-λ · dt))",
    formulaVars: "λ (lambda) : vitesse de décroissance (ex: 8 à 16) · dt : deltaTime en secondes",
    summary: "L'erreur la plus répandue du jeu vidéo est d'écrire `Lerp(pos, target, speed * dt)`. Sur un écran 144 Hz vs 30 Hz, les trajectoires divergent (et à lag spike `speed * dt > 1` casse tout). La décroissance exponentielle `1 - exp(-λ·dt)` produit la courbe MATHÉMATIQUEMENT IDENTIQUE à tout framerate.",
    tldr: "Remplacez `Lerp(a, b, k * dt)` par `Lerp(a, b, 1 - Exp(-k * dt))`. Exact à 24, 60, 144 et 360 FPS !",
    params: [
      { key: "a", label: "Lambda (λ Réactivité)", min: 1.0, max: 16.0, step: 0.5, value: 6.0 },
      { key: "b", label: "FPS simulé bas", min: 10, max: 60, step: 5, value: 20 }
    ],
    signatures: {
      unity: "Mathf.Lerp(a, b, 1f - Mathf.Exp(-lambda * Time.deltaTime))",
      godotCs: "Mathf.Lerp(a, b, 1f - Mathf.Exp(-lambda * (float)delta))",
      godotGd: "lerpf(a, b, 1.0 - exp(-lambda * delta))",
      unrealCpp: "FMath::FInterpTo(Current, Target, DeltaTime, InterpSpeed)",
      unrealBp: "FInterp To (déjà exponentiel !)",
      csharp: "float.Lerp(a, b, 1f - MathF.Exp(-lambda * dt))",
      cpp: "std::lerp(a, b, 1.0f - std::exp(-lambda * dt))"
    },
    examples: [
      {
        title: "Formule équivalente par demi-vie (half-life)",
        desc: "Plus intuitif pour les game designers : « parcourir 50% de la distance en `h` secondes ».",
        code: "float t = 1f - Mathf.Pow(0.5f, dt / halfLife);\nval = Mathf.Lerp(val, target, t);"
      },
      {
        title: "Rotation de caméra 3D framerate-safe",
        desc: "S'applique identiquement à `Quaternion.Slerp`.",
        code: "rot = Quaternion.Slerp(rot, targetRot, 1f - Mathf.Exp(-10f * dt));"
      }
    ],
    pitfalls: [
      "Notez que `FMath::FInterpTo` d'Unreal Engine utilise déjà en interne une formule exponentielle sûre, contrairement à un `Mathf.Lerp(..., speed * dt)` manuel en Unity/Godot.",
      "À la différence d'un ressort amorti (SmoothDamp), l'amortissement exponentiel n'a aucune inertie : la vitesse change instantanément quand la cible bouge."
    ],
    related: ["smoothdamp-spring", "lerp", "movetowards"]
  },
  {
    id: "smoothdamp-spring",
    glyph: "ζ,ω",
    name: "Ressort Amorti & SmoothDamp",
    subtitle: "Inertie organique, recul d'arme et caméras cinématiques",
    categoryId: "interpolation",
    dimension: "general",
    difficulty: 2,
    tags: ["Caméra", "UI & Game Feel", "Physique"],
    sandbox: "graph",
    sandboxMode: "spring",
    formula: "x'' + 2·ζ·ω·x' + ω²·(x - target) = 0",
    formulaVars: "ω : fréquence angulaire (rapidité) · ζ : amortissement (<1 rebondit, =1 critique, >1 lent)",
    summary: "Simule une masse attachée à la cible par un ressort et un amortisseur. À ζ = 1 (amortissement critique = `Mathf.SmoothDamp`), l'objet atteint la cible le plus vite possible sans dépasser. À ζ < 1, il oscille avec un rebond organique (recul, UI, antenne de voiture).",
    tldr: "ζ < 1 = élastique avec rebond (Juice/Recul) · ζ = 1 = SmoothDamp parfait (Caméra) · ζ > 1 = lourd/visqueux.",
    params: [
      { key: "a", label: "Fréquence ω (Raideur)", min: 2.0, max: 18.0, step: 0.5, value: 8.0 },
      { key: "b", label: "Amortissement ζ (Damping)", min: 0.1, max: 1.8, step: 0.05, value: 0.45 }
    ],
    signatures: {
      unity: "Mathf.SmoothDamp(cur, target, ref vel, smoothTime)",
      godotCs: "SpringDamp(ref val, ref vel, target, omega, zeta, dt)",
      godotGd: "# Semi-implicit spring: vel += (-2*z*w*vel - w*w*(x-target))*dt",
      unrealCpp: "UKismetMathLibrary::FloatSpringInterp(Cur, Target, State, Stiffness, Damping, Dt)",
      unrealBp: "Float Spring Interp / Vector Spring Interp",
      csharp: "vel += (-2f * zeta * omega * vel - omega * omega * (x - target)) * dt; x += vel * dt;",
      cpp: "vel += (-2.f * z * w * vel - w * w * (x - target)) * dt; x += vel * dt;"
    },
    examples: [
      {
        title: "Recul procédural d'arme FPS",
        desc: "Sur chaque tir, ajoutez simplement une impulsion `recoilVel += kickImpulse` : le ressort ramène tout seul le viseur !",
        code: "recoilVel += 18f; // au tir — le ressort ramène l'arme vers 0"
      },
      {
        title: "Caméra de suivi sans à-coups",
        desc: "SmoothDamp conserve une vitesse continue même si le joueur fait brutalement demi-tour.",
        code: "cam.position = Vector3.SmoothDamp(cam.position, targetPos, ref camVel, 0.18f);"
      }
    ],
    pitfalls: [
      "Un ressort intégré par Euler explicite peut exploser si `omega * dt > 1` (lag spike). Utilisez la solution analytique exacte ou clamp `dt <= 0.05f`."
    ],
    related: ["framerate-independent-damping", "euler-verlet-integration", "easing-curves"]
  },
  {
    id: "hysteresis-deadzone",
    glyph: "◉",
    name: "Deadzone Radiale & Hystérésis",
    subtitle: "Filtrage de joystick analogique et anti-clignotement IA",
    categoryId: "interpolation",
    dimension: "2d",
    difficulty: 2,
    tags: ["3C & Mouvement", "IA & Navigation", "UI & Game Feel"],
    sandbox: "vector",
    sandboxMode: "deadzone",
    formula: "mag' = clamp01((‖v‖ - inner) / (outer - inner))  →  v_out = v̂ · mag'",
    formulaVars: "inner : rayon mort (drift) · outer : rayon de saturation maximale",
    summary: "Deux techniques cruciales de propreté gameplay : (1) la Deadzone Radiale Mise à l'Échelle élimine le drift du stick sans créer de saut brutal ni de « croix collante » sur les axes ; (2) l'Hystérésis utilise deux seuils (entrée ≠ sortie) pour empêcher un état IA/UI d'osciller 60 fois par seconde sur une frontière.",
    tldr: "Ne faites jamais une deadzone séparée sur X et Y (ça colle aux axes). Normalisez le rayon puis remappez `[deadzone, 1] → [0, 1]`.",
    signatures: {
      unity: "Vector2 ScaledRadialDeadzone(Vector2 v, float dz)",
      godotCs: "Input.GetVector(\"left\", \"right\", \"up\", \"down\", deadzone)",
      godotGd: "Input.get_vector(\"left\", \"right\", \"up\", \"down\", deadzone)",
      unrealCpp: "UInputModifierDeadZone (EDeadZoneType::Radial)",
      unrealBp: "Enhanced Input: Dead Zone (Radial)",
      csharp: "float m = v.Length(); v = m < dz ? Zero : (v/m) * ((m-dz)/(1-dz));",
      cpp: "float m = glm::length(v); v = m < dz ? vec2(0) : (v/m) * ((m-dz)/(1-dz));"
    },
    examples: [
      {
        title: "Hystérésis d'aggro d'un ennemi",
        desc: "L'ennemi détecte à 10m mais ne lâche la poursuite qu'à 14m : zéro clignotement à 10.0m.",
        code: "if (!chasing && dist < 10f) chasing = true;\nelse if (chasing && dist > 14f) chasing = false;"
      }
    ],
    pitfalls: [
      "Sans rescaling `(m - dz) / (1 - dz)`, la vitesse minimale de marche saute brusquement de 0 à 0.20, rendant la marche lente (stealth) impossible à la manette."
    ],
    related: ["normalized", "inverselerp-remap", "clamp"]
  },

  // =========================================================================
  // 09. Courbes & Splines
  // =========================================================================
  {
    id: "bezier-curves",
    glyph: "B(t)",
    name: "Courbes de Bézier & De Casteljau",
    subtitle: "Quadratique, Cubique, tangentes et construction géométrique",
    categoryId: "curves",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["UI & Game Feel", "Combat & Visée", "Caméra"],
    sandbox: "physics",
    sandboxMode: "bezier",
    formula: "B(t) = (1-t)³P₀ + 3(1-t)²t·P₁ + 3(1-t)t²·P₂ + t³P₃",
    formulaVars: "P₀, P₃ : ancres · P₁, P₂ : poignées de tangence · t ∈ [0, 1]",
    summary: "Construit une courbe polynomiale parfaitement lisse par interpolations linéaires imbriquées (algorithme de De Casteljau). La dérivée B'(t) fournit immédiatement la tangente pour orienter un missile ou un vaisseau dans le sens du mouvement.",
    tldr: "La courbe passe par P₀ et P₃, et est attirée par P₁ et P₂. Sa tangente en P₀ pointe exactement vers P₁.",
    signatures: {
      unity: "UnityEngine.Splines.CurveUtility.EvaluatePosition(curve, t)",
      godotCs: "p0.BezierInterpolate(p1, p2, p3, t)",
      godotGd: "p0.bezier_interpolate(p1, p2, p3, t)",
      unrealCpp: "FVector::EvaluateBezier(ControlPoints, NumPoints, OutPoints)",
      unrealBp: "Spline Component / Custom De Casteljau",
      csharp: "Vector3.Lerp(ab, bc, t) // De Casteljau récursif",
      cpp: "u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3"
    },
    examples: [
      {
        title: "Éventail de cartes (Slay the Spire / Hearthstone)",
        desc: "Place chaque carte sur une courbe de Bézier et l'incline selon la tangente B'(t).",
        code: "Vector2 pos = CubicBezier(p0, p1, p2, p3, cardT);\nVector2 tan = CubicBezierTangent(p0, p1, p2, p3, cardT);"
      },
      {
        title: "Missile à tête chercheuse stylisé",
        desc: "Part latéralement (poignée P₁) avant de plonger sur la cible mouvante (P₃).",
        code: "pos = QuadBezier(launchPos, sideOffset, enemy.position, t);"
      }
    ],
    pitfalls: [
      "Avancer `t` linéairement ne donne PAS une vitesse constante sur une Bézier ! Si P₁ est loin de P₀, l'objet accélère. Voir Reparamétrisation par Longueur d'Arc."
    ],
    related: ["catmull-rom-spline", "arc-length-reparam", "lerp"]
  },
  {
    id: "catmull-rom-spline",
    glyph: "CR(t)",
    name: "Splines Catmull-Rom",
    subtitle: "Courbe lisse passant obligatoirement par chaque waypoint",
    categoryId: "curves",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["Caméra", "IA & Navigation", "Procédural"],
    sandbox: "physics",
    sandboxMode: "catmullrom",
    formula: "P(t) = ½·[2P₁ + (-P₀+P₂)t + (2P₀-5P₁+4P₂-P₃)t² + (-P₀+3P₁-3P₂+P₃)t³]",
    formulaVars: "P₁→P₂ : segment tracé · P₀, P₃ : voisins qui dictent les tangentes d'entrée et sortie",
    summary: "À la différence de Bézier où les points intermédiaires attirent la courbe à distance, Catmull-Rom traverse EXACTEMENT tous les waypoints posés par le level designer tout en garantissant une continuité C¹ fluide.",
    tldr: "L'outil roi des circuits de course, rails de caméra cinématique (Dolly Track) et vols de dragons.",
    signatures: {
      unity: "SplineContainer (TangentMode.AutoSmooth / CatmullRom)",
      godotCs: "Curve3D.SampleBaked(offset)",
      godotGd: "curve_3d.sample_baked(offset)",
      unrealCpp: "FMath::CubicCRSplineInterp(P0, P1, P2, P3, T)",
      unrealBp: "USplineComponent -> Get Location at Spline Input Key",
      csharp: "Vector3.CatmullRom(p0, p1, p2, p3, t)",
      cpp: "glm::catmullRom(p0, p1, p2, p3, t)"
    },
    examples: [
      {
        title: "Génération de route ou rivière procédurale",
        desc: "Posez quelques points de passage sur le terrain et échantillonnez un mesh continu entre eux.",
        code: "Vector3 pt = CatmullRom(pts[i-1], pts[i], pts[i+1], pts[i+2], localT);"
      }
    ],
    pitfalls: [
      "La version uniforme peut créer des boucles parasites quand deux waypoints sont très proches puis très éloignés : la variante Centripetal (α = 0.5) supprime totalement ces boucles et rebroussements."
    ],
    related: ["bezier-curves", "arc-length-reparam", "orthonormal-basis"]
  },
  {
    id: "arc-length-reparam",
    glyph: "s(t)",
    name: "Longueur d'Arc (LUT Vitesse Constante)",
    subtitle: "Corriger les variations de vitesse le long d'une spline",
    categoryId: "curves",
    dimension: "2d-3d",
    difficulty: 3,
    tags: ["Caméra", "3C & Mouvement", "Procédural"],
    sandbox: "physics",
    sandboxMode: "arclength",
    formula: "s(t) = ∫₀ᵗ ‖B'(u)‖ du   →   t = LUT⁻¹(distance)",
    formulaVars: "s : distance cumulée en mètres · LUT : table d'échantillonnage (32 à 128 segments)",
    summary: "Sur toute spline paramétrique, des pas égaux de `t` produisent des pas INÉGAUX en distance monde : un train ou une caméra ralentit dans les virages serrés et accélère dans les lignes droites. Pré-calculer une Look-Up Table (LUT) de distances cumulées permet de convertir une distance en mètres en `t` exact.",
    tldr: "Comparez les deux mobiles dans le Playground : le rouge (t uniforme) saccade en vitesse, le vert (LUT) glisse à vitesse constante exacte.",
    signatures: {
      unity: "SplineUtility.EvaluatePosition(spline, normalizedDist) // SplineSlice",
      godotCs: "curve.SampleBaked(distanceInMeters)",
      godotGd: "curve.sample_baked(distance_in_meters)",
      unrealCpp: "SplineComp->GetLocationAtDistanceAlongSpline(Dist, ESplineCoordinateSpace::World)",
      unrealBp: "Get Location at Distance Along Spline",
      csharp: "float t = DistToT(lut, targetDist); // recherche binaire + lerp",
      cpp: "auto it = std::lower_bound(lut.begin(), lut.end(), targetDist);"
    },
    examples: [
      {
        title: "Placement régulier de poteaux ou traverses de rails",
        desc: "Garantit un espacement exact de 2.0m quel que soit le rayon de courbure du circuit.",
        code: "for (float d = 0; d < totalLen; d += 2f) SpawnPost(SampleAtDistance(d));"
      }
    ],
    pitfalls: [
      "Ne recalculez pas la LUT chaque frame : reconstruisez-la uniquement lorsqu'un point de contrôle bouge (ou utilisez `SampleBaked` dans Godot / `DistanceAlongSpline` dans Unreal qui la maintiennent déjà en cache)."
    ],
    related: ["bezier-curves", "catmull-rom-spline", "inverselerp-remap"]
  }
];
