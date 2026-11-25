export const CATALOG_PROC_PROB = [
  // =========================================================================
  // 10. Procédural, Shaders & Couleurs
  // =========================================================================
  {
    id: "perlin-noise",
    glyph: "N₂D",
    name: "Bruit de Perlin 2D",
    subtitle: "Bruit de gradient continu pour terrains, nuages et camera shake",
    categoryId: "procedural",
    dimension: "2d",
    difficulty: 2,
    tags: ["Procédural", "Shaders & Rendu", "Caméra"],
    sandbox: "procedural",
    sandboxMode: "perlin",
    formula: "Perlin(x, y) = bilerp(g₀₀·d₀₀, g₁₀·d₁₀, g₀₁·d₀₁, g₁₁·d₁₁, fade(u), fade(v))",
    formulaVars: "g_ij : gradients pseudo-aléatoires aux coins de la cellule · fade(t) = 6t⁵ - 15t⁴ + 10t³",
    summary: "Associe un vecteur de pente pseudo-aléatoire à chaque nœud d'une grille entière puis interpole leurs produits scalaires avec la courbe SmootherStep. Contrairement au bruit blanc chaotique, deux points voisins produisent toujours des hauteurs cohérentes et organiques.",
    tldr: "Indispensable pour les reliefs procéduraux, le vent dans l'herbe et un Camera Shake fluide (échantillonnez `Perlin(time * freq, seed)` au lieu de `Random` !).",
    signatures: {
      unity: "float n = Mathf.PerlinNoise(x * freq, y * freq);",
      godotCs: "var noise = new FastNoiseLite(); float n = noise.GetNoise2D(x, y);",
      godotGd: "var noise = FastNoiseLite.new(); var n = noise.get_noise_2d(x, y)",
      unrealCpp: "float N = FMath::PerlinNoise2D(FVector2D(X, Y));  // [-1, 1]",
      unrealBp: "Make Perlin Noise 2D (Material: Noise Node)",
      csharp: "float n = Perlin2D(x * freq, y * freq);",
      cpp: "float n = glm::perlin(glm::vec2(x, y));"
    },
    examples: [
      {
        title: "Camera Shake organique basé sur Perlin (Trauma²)",
        desc: "Beaucoup plus naturel qu'un `Random.insideUnitCircle` qui fait vibrer l'image de manière agressive.",
        code: "float shake = trauma * trauma;\nfloat ox = (Mathf.PerlinNoise(Time.time * 22f, 0f) * 2f - 1f) * shake;"
      }
    ],
    pitfalls: [
      "PIÈGE D'INTERVALLE : Unity `Mathf.PerlinNoise` renvoie `[0, 1]` (et peut légèrement dépasser !), alors qu'Unreal, Godot et GLM renvoient `[-1, 1]` !",
      "Les coordonnées entières exactes `(1, 0), (2, 0)` valent TOUJOURS 0 (ou 0.5 en Unity) : ajoutez toujours un offset non entier ou une fréquence fractionnaire."
    ],
    related: ["fbm-octaves", "voronoi-worley", "smoothstep"]
  },
  {
    id: "fbm-octaves",
    glyph: "fBm",
    name: "fBm (Fractal Brownian Motion) & Octaves",
    subtitle: "Empiler fréquence (Lacunarity) et amplitude (Persistence) pour des montagnes",
    categoryId: "procedural",
    dimension: "2d",
    difficulty: 2,
    tags: ["Procédural", "Shaders & Rendu"],
    sandbox: "procedural",
    sandboxMode: "fbm",
    formula: "fBm(p) = Σᵢ₌₀ⁿ⁻¹  (persistenceⁱ) · Noise(p · lacunarityⁱ)",
    formulaVars: "Octaves : niveaux de détail · Lacunarity (~2.0) : multiplie la fréquence · Persistence (~0.5) : réduit l'amplitude",
    summary: "Un seul bruit de Perlin a l'air trop lisse et mou. Le fBm (mouvement brownien fractal) additionne plusieurs couches (« octaves ») de plus en plus fines et de moins en moins fortes : grandes chaînes de montagnes + collines + rochers + grain du sol.",
    tldr: "Montez les Octaves de 1 à 6 dans le Playground et ajustez Persistence (rugosité) pour voir un terrain plat se transformer en archipel détaillé !",
    signatures: {
      unity: "for(int i=0;i<oct;i++){ val += Perlin(x*f, y*f)*amp; f*=lac; amp*=pers; }",
      godotCs: "noise.FractalType = FastNoiseLite.FractalTypeEnum.Fbm; noise.FractalOctaves = 5;",
      godotGd: "noise.fractal_type = FastNoiseLite.FRACTAL_FBM; noise.fractal_octaves = 5",
      unrealCpp: "// Material Noise Node (Levels = Octaves) ou boucle FMath::PerlinNoise2D",
      unrealBp: "Material Editor: Noise (Turbulence / Levels)",
      csharp: "sum += Perlin2D(x * freq, y * freq) * amp; maxAmp += amp;",
      cpp: "sum += glm::perlin(p * freq) * amp; freq *= lacunarity; amp *= persistence;"
    },
    examples: [
      {
        title: "Crêtes montagneuses acérées (Ridged Noise)",
        desc: "Remplacez `noise` par `1 - abs(noise * 2 - 1)` à chaque octave pour sculpter des chaînes alpines tranchantes !",
        code: "float ridge = 1f - Mathf.Abs(perlin * 2f - 1f);\nval += ridge * ridge * amp;"
      }
    ],
    pitfalls: [
      "Divisez toujours la somme finale par `maxAmplitude` (somme des `amp`) pour garder le résultat normalisé dans `[0, 1]` quel que soit le nombre d'octaves !"
    ],
    related: ["perlin-noise", "voronoi-worley", "prng-hash-seeds"]
  },
  {
    id: "voronoi-worley",
    glyph: "Vor",
    name: "Diagramme de Voronoï & Bruit de Worley",
    subtitle: "Biomes, cellules, caustiques d'eau et fractures destructibles",
    categoryId: "procedural",
    dimension: "2d",
    difficulty: 2,
    tags: ["Procédural", "Shaders & Rendu", "Collisions"],
    sandbox: "procedural",
    sandboxMode: "voronoi",
    formula: "F₁(p) = min_k ‖p - site_k‖   |   Bordure (F₂ - F₁) ≈ 0",
    formulaVars: "F₁ : distance au point germe le plus proche · F₂ : distance au 2ème plus proche (crée les frontières !)",
    summary: "Partitionne l'espace en cellules autour de points germes (« sites ») : chaque pixel appartient au site le plus proche. `F₁` produit des caustiques d'eau et écailles organiques ; `F₂ - F₁` trace exactement les fissures de pierre ou les frontières nettes entre biomes/territoires !",
    tldr: "Testez les modes **Biomes (ID)**, **Distance F₁ (Caustiques)** et **Fissures (F₂ - F₁)** dans le Playground en déplaçant le curseur !",
    signatures: {
      unity: "ShaderGraph: Voronoi Node (Out = F1, Cells = CellID)",
      godotCs: "noise.NoiseType = FastNoiseLite.NoiseTypeEnum.Cellular;",
      godotGd: "noise.noise_type = FastNoiseLite.TYPE_CELLULAR",
      unrealCpp: "Material: Voronoi Noise (Distance / Distance to Edge)",
      unrealBp: "Material Editor: Voronoi Node",
      csharp: "// Grille cellulaire : tester uniquement les 3×3 cellules voisines (O(1))",
      cpp: "// Cellular Worley 3x3 neighborhood search"
    },
    examples: [
      {
        title: "Fracturation de mur destructible / glace brisée",
        desc: "Chaque cellule Voronoï devient un éclat convexe indépendant ; `F₂ - F₁ < width` dessine les fissures lumineuses.",
        code: "float crack = 1.0 - smoothstep(0.0, 0.06, f2 - f1);"
      }
    ],
    pitfalls: [
      "Ne calculez pas la distance contre TOUS les sites de la carte (O(N)) : placez 1 site jitteré par case d'une grille régulière et ne testez que les 9 cases voisines (3×3) en O(1) !"
    ],
    related: ["perlin-noise", "fbm-octaves", "sdf-2d"]
  },
  {
    id: "sdf-2d",
    glyph: "SDF",
    name: "SDF (Signed Distance Fields & Smooth Min)",
    subtitle: "Formes exactes infiniment nettes, UI vectorielle, metaballs et raymarching",
    categoryId: "procedural",
    dimension: "2d",
    difficulty: 3,
    tags: ["Shaders & Rendu", "Collisions", "UI & Game Feel", "Procédural"],
    sandbox: "procedural",
    sandboxMode: "sdf",
    formula: "d_circle = ‖p-c‖ - r  ·  Union: min(d₁,d₂)  ·  SmoothMin: min - h²·k/4",
    formulaVars: "d < 0 : à l'intérieur · d = 0 : bord exact · d > 0 : distance exacte à l'extérieur",
    summary: "Une SDF est une fonction qui renvoie pour tout point de l'espace sa distance signée au bord d'une forme. Combinées par des opérations booléennes ultra-simples (`min` = union, `max(a,-b)` = soustraction, `smin` = fusion gluante façon metaballs), les SDF propulsent les polices TextMeshPro, les UI nettes à tout zoom, les effets liquides et le raymarching 3D (Unreal Lumen / Clayxels).",
    tldr: "Déplacez les formes dans le Playground et augmentez le facteur **Smooth Min (k)** pour voir le cercle et la boîte fusionner organiquement !",
    signatures: {
      unity: "// HLSL: float sdCircle(float2 p, float r) { return length(p) - r; }",
      godotCs: "// Godot Shader: float sdBox(vec2 p, vec2 b) { vec2 d = abs(p)-b; return length(max(d,0.0)) + min(max(d.x,d.y),0.0); }",
      godotGd: "# Text / CanvasItem SDF shaders + SmoothMin",
      unrealCpp: "Global Distance Field (Lumen / Mesh Distance Fields)",
      unrealBp: "Material: DistanceToNearestSurface / SmoothMinimum",
      csharp: "float Smin(float a, float b, float k) { float h = Math.Max(k - Math.Abs(a-b), 0f) / k; return Math.Min(a,b) - h*h*k*0.25f; }",
      cpp: "float smin(float a, float b, float k) { float h = std::max(k - std::abs(a-b), 0.f) / k; return std::min(a,b) - h*h*k*0.25f; }"
    },
    examples: [
      {
        title: "Contour et ombre portée gratuits en 1 ligne de Shader",
        desc: "Comme `d` EST la distance en pixels au bord, un outline de 3px est simplement `abs(d) < 3.0` !",
        code: "float alpha = 1.0 - smoothstep(-aa, aa, d);\nfloat outline = 1.0 - smoothstep(border - aa, border + aa, abs(d));"
      }
    ],
    pitfalls: [
      "Un scale non uniforme déforme la métrique d'une SDF (elle ne donne plus la vraie distance) : appliquez uniquement un scale uniforme `d(p / s) * s`."
    ],
    related: ["circle-sphere-collision", "closest-point-segment-capsule", "smoothstep"]
  },
  {
    id: "color-spaces-kelvin",
    glyph: "RGB/K",
    name: "Espaces Couleur : sRGB, Linéaire, HSV & Kelvin",
    subtitle: "Correction Gamma (2.2), mélanges propres et lumière physique",
    categoryId: "procedural",
    dimension: "general",
    difficulty: 2,
    tags: ["Shaders & Rendu", "UI & Game Feel"],
    sandbox: "procedural",
    sandboxMode: "color",
    formula: "C_linear = C_sRGB ^ 2.2   |   C_sRGB = C_linear ^ (1/2.2)   |   T(K) → RGB",
    formulaVars: "1800K : bougie · 3200K : lampe chaude · 6500K : jour neutre · 12000K : ciel polaire",
    summary: "Nos écrans stockent les couleurs avec une courbe Gamma (~2.2) pour mieux coller à l'œil humain. Si vous additionnez des lumières ou mélangez du Rouge et du Vert directement en sRGB, le milieu devient un marron sombre sale ! Convertir en Linéaire (ou interpoler en HSV) corrige totalement l'éclairage et les dégradés. La température Kelvin génère des éclairages physiquement crédibles.",
    tldr: "Comparez dans le Playground le dégradé Rouge→Vert en **sRGB naïf** (bande boueuse au centre) vs **Linéaire / HSV** (jaune lumineux) + le curseur Kelvin !",
    signatures: {
      unity: "Color.HSVToRGB(h, s, v)  |  Mathf.CorrelatedColorTemperatureToRGB(k)  |  c.linear",
      godotCs: "Color.FromHsv(h, s, v)  |  c.SrgbToLinear()",
      godotGd: "Color.from_hsv(h, s, v)  # c.srgb_to_linear()",
      unrealCpp: "FLinearColor::MakeFromColorTemperature(Kelvin) / LinearRGBToHSV()",
      unrealBp: "Make Color From Temperature / HSV to RGB",
      csharp: "float lin = MathF.Pow(srgb, 2.2f);",
      cpp: "glm::vec3 lin = glm::pow(srgb, glm::vec3(2.2f));"
    },
    examples: [
      {
        title: "Cycle Jour / Nuit physiquement crédible",
        desc: "Interpolez la température en Kelvin (2200K aube → 6500K midi → 2000K coucher → 9500K lune) plutôt que des couleurs RGB au hasard.",
        code: "sunLight.color = Mathf.CorrelatedColorTemperatureToRGB(currentKelvin);"
      }
    ],
    pitfalls: [
      "Assurez-vous que votre projet Unity est bien configuré en **Linear Color Space** (et non Gamma), sinon toutes vos lumières PBR et vos shaders de post-processing sont physiquement faux."
    ],
    related: ["pow-sqrt-log", "lerp", "inverselerp-remap"]
  },

  // =========================================================================
  // 11. Probabilités, Aléatoire & Équilibrage
  // =========================================================================
  {
    id: "gaussian-normal",
    glyph: "𝒩(μ,σ)",
    name: "Loi Normale (Gauss / Box-Muller)",
    subtitle: "Dispersion réaliste d'armes et distributions naturelles",
    categoryId: "probability",
    dimension: "general",
    difficulty: 2,
    tags: ["Combat & Visée", "Équilibrage & RPG", "Procédural"],
    sandbox: "graph",
    sandboxMode: "gaussian",
    formula: "f(x) = (1 / σ√2π) · e^(-½((x-μ)/σ)²)   |   Box-Muller: z = √(-2·ln u₁)·cos(2π·u₂)",
    formulaVars: "μ : moyenne (centre) · σ : écart-type (68% dans ±1σ, 95% dans ±2σ, 99.7% dans ±3σ)",
    summary: "Contrairement à `Random.Range` (distribution uniforme plate), la courbe en cloche de Gauss concentre les résultats autour de la moyenne tout en autorisant de rares coups exceptionnels. La transformée de Box-Muller génère une gaussienne exacte à partir de deux tirages uniformes `[0, 1]`.",
    tldr: "Astuce rapide sans `log`/`cos` : la moyenne de 3 `Random.Range` (`(r1+r2+r3)/3`) approxime déjà très bien une courbe en cloche !",
    params: [
      { key: "a", label: "Moyenne μ (Centre)", min: -2.5, max: 2.5, step: 0.25, value: 0.0 },
      { key: "b", label: "Écart-type σ (Dispersion)", min: 0.25, max: 1.8, step: 0.05, value: 0.6 }
    ],
    signatures: {
      unity: "float z = Mathf.Sqrt(-2f * Mathf.Log(u1)) * Mathf.Cos(2f * Mathf.PI * u2);",
      godotCs: "float v = (float)GD.Randfn(mean, stdDev);",
      godotGd: "var v = randfn(mean, std_dev)",
      unrealCpp: "// Box-Muller avec FMath::FRand() ou FMath::VRandCone",
      unrealBp: "Box-Muller Custom / Random Float in Range (somme de 3)",
      csharp: "float z = MathF.Sqrt(-2f * MathF.Log(u1)) * MathF.Cos(2f * MathF.PI * u2);",
      cpp: "std::normal_distribution<float> dist(mean, stdDev);"
    },
    examples: [
      {
        title: "Dispersion naturelle d'un fusil d'assaut",
        desc: "La majorité des balles groupent au centre du réticule, avec de rares balles périphériques.",
        code: "float spreadX = Gaussian(0f, weaponSpread);\nfloat spreadY = Gaussian(0f, weaponSpread);"
      },
      {
        title: "Variation naturelle de taille d'arbres / PNJ",
        desc: "Évite l'effet artificiel où autant de géants et de nains apparaissent que de tailles moyennes.",
        code: "float height = Mathf.Clamp(Gaussian(1.75f, 0.12f), 1.45f, 2.05f);"
      }
    ],
    pitfalls: [
      "Dans Box-Muller, `u1` ne doit JAMAIS valoir exactement `0.0` car `log(0) = -Infinity` ! Utilisez `Mathf.Max(u1, 1e-7f)`.",
      "Une gaussienne est théoriquement non bornée (`-∞` à `+∞`) : clampez toujours le résultat si un négatif peut casser votre gameplay (ex: taille ou dégâts)."
    ],
    related: ["weighted-random-loot", "prng-hash-seeds", "damage-xp-curves"]
  },
  {
    id: "weighted-random-loot",
    glyph: "Σwᵢ",
    name: "Tables de Loot Pondérées & Fisher-Yates",
    subtitle: "Drop rates RPG (CDF), mélanges sans biais et anti-répétition",
    categoryId: "probability",
    dimension: "general",
    difficulty: 2,
    tags: ["Équilibrage & RPG", "Procédural", "UI & Game Feel"],
    sandbox: "graph",
    sandboxMode: "loot",
    formula: "P(item_i) = w_i / Σ w_j   |   Tirer r ∈ [0, Σw) et trouver le 1er cumul ≥ r",
    formulaVars: "w_i : poids relatif (pas besoin que la somme fasse 100 !) · Fisher-Yates : mélange uniforme en O(n)",
    summary: "Comment tirer un objet Commun (poids 60), Rare (25), Épique (12) ou Légendaire (3) proprement ? Additionnez les poids, tirez un réel `r` dans `[0, total]` et soustrayez chaque poids jusqu'à passer sous 0. Pour mélanger un deck de cartes ou une playlist sans biais, utilisez le Shuffle de Fisher-Yates.",
    tldr: "Utiliser des POIDS relatifs au lieu de pourcentages évite de devoir recalculer toute la table quand vous ajoutez un nouvel item !",
    params: [
      { key: "a", label: "Poids Légendaire", min: 1, max: 30, step: 1, value: 5 },
      { key: "b", label: "Poids Rare", min: 5, max: 60, step: 5, value: 25 }
    ],
    signatures: {
      unity: "float r = Random.value * totalWeight; foreach(var it in table){ if((r -= it.w) <= 0) return it; }",
      godotCs: "var r = GD.Randf() * totalWeight; // soustraire chaque poids",
      godotGd: "var r = randf() * total_weight  # ou array.shuffle() (Fisher-Yates)",
      unrealCpp: "// Parcourir TArray<FLootEntry> avec FMath::FRandRange(0.f, TotalWeight)",
      unrealBp: "Shuffle Array / Weighted Loop",
      csharp: "Random.Shared.Shuffle(span); // Fisher-Yates natif .NET 8+",
      cpp: "std::discrete_distribution<int> dist(weights.begin(), weights.end());"
    },
    examples: [
      {
        title: "Shuffle de Fisher-Yates (Deck de cartes / Bag Randomizer Tetris)",
        desc: "Garantit toutes les `n!` permutations avec la même probabilité exacte en `O(n)`.",
        code: "for (int i = list.Count - 1; i > 0; i--) {\n  int j = Random.Range(0, i + 1);\n  (list[i], list[j]) = (list[j], list[i]);\n}"
      }
    ],
    pitfalls: [
      "NE FAITES JAMAIS `list.Sort((a,b) => Random.Range(-1, 2))` pour mélanger un deck : c'est fortement biaisé et peut même planter l'algorithme de tri ! Utilisez toujours Fisher-Yates.",
      "Les joueurs perçoivent le vrai aléatoire comme « injuste » : utilisez un système de **Pity Timer** (augmente le poids légendaire à chaque échec) ou un **Bag Randomizer** (Tetris)."
    ],
    related: ["gaussian-normal", "prng-hash-seeds", "damage-xp-curves"]
  },
  {
    id: "prng-hash-seeds",
    glyph: "Hash",
    name: "PRNG, Seeds & Hachage Déterministe",
    subtitle: "Mondes reproductibles (Minecraft) et hasard sans état par coordonnée",
    categoryId: "probability",
    dimension: "general",
    difficulty: 2,
    tags: ["Procédural", "Optimisation", "Équilibrage & RPG"],
    sandbox: "graph",
    sandboxMode: "prng",
    formula: "Squirrel3(n, seed) : bit-mangling O(1)   |   2D: Hash(x + 198491317·y, seed)",
    formulaVars: "Seed : clé entière · Même (coordonnée, seed) → TOUJOURS le même nombre, dans n'importe quel ordre !",
    summary: "Un générateur aléatoire classique (`Random.value`) dépend de l'ORDRE d'appel : si un joueur explore un chunk à l'Est avant l'Ouest, le monde change ! Une fonction de hachage par coordonnée (Squirrel3 / SplitMix32) renvoie instantanément une valeur pseudo-aléatoire purement déterminée par `(x, y, seed)`.",
    tldr: "Même seed + mêmes coordonnées = exactement le même arbre, coffre ou donjon sur tous les PC, même en générant les chunks dans un ordre aléatoire ou en multithread !",
    signatures: {
      unity: "uint Squirrel3(int pos, uint seed) // stateless hash O(1)",
      godotCs: "var rng = new RandomNumberGenerator(); rng.Seed = mySeed;",
      godotGd: "var rng = RandomNumberGenerator.new(); rng.seed = my_seed",
      unrealCpp: "FRandomStream Stream(Seed);  // ou HashCombine(X, Y)",
      unrealBp: "Make Random Stream (Seed) -> Random Float from Stream",
      csharp: "uint h = (uint)n * 0xB5297A4Du; h ^= h >> 8; h += 0x68E31DA4u; ...",
      cpp: "uint32_t squirrel3(int32_t pos, uint32_t seed)"
    },
    examples: [
      {
        title: "Hachage Squirrel3 (GDC Squirrel Eiserloh)",
        desc: "Ultra-rapide, thread-safe, zéro état global et distribution statistique excellente.",
        code: "uint h = (uint)pos * 0xB5297A4Du + seed;\nh ^= (h >> 8); h += 0x68E31DA4u;\nh ^= (h << 8); h *= 0x1B56C4E9u;\nreturn h ^ (h >> 8);"
      }
    ],
    pitfalls: [
      "Ne modifiez JAMAIS le générateur global `UnityEngine.Random.InitState(seed)` pour un sous-système (ex: loot ou terrain) : n'importe quel autre script (particule, IA) qui appelle `Random` désynchronisera toute votre génération !"
    ],
    related: ["perlin-noise", "weighted-random-loot", "bitmasks-flags"]
  },
  {
    id: "damage-xp-curves",
    glyph: "EHP",
    name: "Courbes d'Équilibrage (Armure, EHP & XP)",
    subtitle: "Formule hyperbolique LoL/Dota, rendements décroissants et progression RPG",
    categoryId: "probability",
    dimension: "general",
    difficulty: 2,
    tags: ["Équilibrage & RPG", "Combat & Visée"],
    sandbox: "graph",
    sandboxMode: "balance",
    formula: "Mult_dégâts = K / (K + Armor)   ⟹   EHP = HP · (1 + Armor / K)",
    formulaVars: "K : constante d'armure (ex: 100 dans League of Legends) · Chaque +100 d'armure ajoute exactement +100% d'EHP !",
    summary: "Une réduction de dégâts linéaire (`dmg * (1 - armor%)`) explose vers l'invincibilité à 100%. La formule hyperbolique `K / (K + Armor)` (utilisée dans LoL, Dota, WoW, Path of Exile) ne franchit jamais 100% de réduction ET possède une propriété géniale : chaque point d'armure augmente la Vie Effective (EHP) de façon parfaitement LINÉAIRE !",
    tldr: "Avec `K = 100` : 100 armure = 50% réduction (2× EHP), 200 armure = 66.7% (3× EHP), 300 armure = 75% (4× EHP). Zéro invincibilité, équilibrage limpide !",
    params: [
      { key: "a", label: "Constante K (Pivot 50%)", min: 25, max: 200, step: 25, value: 100 },
      { key: "b", label: "Mode (0:Armure/EHP 1:XP RPG)", min: 0, max: 1, step: 1, value: 0 }
    ],
    signatures: {
      unity: "float dmgMult = armor >= 0 ? k / (k + armor) : 2f - k / (k - armor);",
      godotCs: "float dmgMult = k / (k + Mathf.Max(0f, armor));",
      godotGd: "var dmg_mult = k / (k + maxf(0.0, armor))",
      unrealCpp: "float DmgMult = K / (K + FMath::Max(0.f, Armor));",
      unrealBp: "Divide: K / (K + Armor)",
      csharp: "float xpForLevel = baseXp * MathF.Pow(level, exponent);",
      cpp: "float dmgMult = k / (k + std::max(0.0f, armor));"
    },
    examples: [
      {
        title: "Formule d'armure gérant l'armure NÉGATIVE (Shred)",
        desc: "Si l'armure passe sous 0 (ex: -50), `100 / (100 - 50) = 2.0` exploserait à `-100` ! La symétrie `2 - K/(K - armor)` reste bornée à ×2 max.",
        code: "float mult = armor >= 0f ? 100f / (100f + armor) : 2f - 100f / (100f - armor);"
      },
      {
        title: "Courbe d'XP RPG hybride (Polynôme + Exponentielle)",
        desc: "Début rapide pour accrocher le joueur, puis mur progressif en endgame.",
        code: "int xpNeeded = Mathf.RoundToInt(100f * Mathf.Pow(level, 1.85f));"
      }
    ],
    pitfalls: [
      "Beaucoup de joueurs pensent que `K/(K+Armor)` a des « rendements décroissants » sur la survie : c'est FAUX ! La réduction en % ralentit, mais la **Vie Effective (EHP)** croît rigoureusement en ligne droite (`+1% EHP` par point d'armure avec K=100)."
    ],
    related: ["pow-sqrt-log", "inverselerp-remap", "weighted-random-loot"]
  }
];
