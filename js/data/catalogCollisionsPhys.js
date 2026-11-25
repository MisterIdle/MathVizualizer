export const CATALOG_COLLISIONS_PHYS = [
  // =========================================================================
  // 07. Géométrie, Collisions & Raycasting
  // =========================================================================
  {
    id: "aabb-collision",
    glyph: "AABB",
    name: "AABB (Axis-Aligned Bounding Box)",
    subtitle: "Détection ultra-rapide, overlap et vecteur de séparation (MTV)",
    categoryId: "collisions",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["Collisions", "Optimisation", "Physique"],
    sandbox: "collision",
    sandboxMode: "aabb",
    formula: "Overlap ⟺ (A.minX ≤ B.maxX ∧ A.maxX ≥ B.minX) ∧ (A.minY ≤ B.maxY ∧ A.maxY ≥ B.minY)",
    formulaVars: "MTV : axe de pénétration minimale pour repousser proprement les deux boîtes",
    summary: "Deux boîtes alignées sur les axes du monde se chevauchent si et seulement si leurs intervalles se recouvrent sur CHAQUE axe (X, Y et Z). C'est le test de collision le moins coûteux qui existe : 4 comparaisons en 2D, 6 en 3D — la base de la Broadphase, des Quadtrees et des BVH.",
    tldr: "Pour résoudre la collision (repousser le joueur hors d'un bloc), calculez l'overlap sur X et sur Y puis repoussez le long du PLUS PETIT overlap (MTV).",
    signatures: {
      unity: "boundsA.Intersects(boundsB)",
      godotCs: "rectA.Intersects(rectB)  |  aabbA.Intersects(aabbB)",
      godotGd: "rect_a.intersects(rect_b)  # aabb_a.intersects(aabb_b)",
      unrealCpp: "BoxA.Intersect(BoxB)",
      unrealBp: "Box Overlap / Test AABB Overlap",
      csharp: "a.MinX <= b.MaxX && a.MaxX >= b.MinX && a.MinY <= b.MaxY && a.MaxY >= b.MinY",
      cpp: "a.min.x <= b.max.x && a.max.x >= b.min.x && a.min.y <= b.max.y && a.max.y >= b.min.y"
    },
    examples: [
      {
        title: "Minkowski Sum : grossir B de la demi-taille de A",
        desc: "Transformer un test Boîte-Boîte en test Point-Boîte simplifie énormément le swept AABB (platformer 2D).",
        code: "bool hit = Mathf.Abs(a.x - b.x) <= (a.halfW + b.halfW) && Mathf.Abs(a.y - b.y) <= (a.halfH + b.halfH);"
      }
    ],
    pitfalls: [
      "Un objet rapide peut traverser un mur fin entre deux frames (Tunneling) : utilisez un Swept AABB ou des sous-étapes (substeps) quand `speed * dt > halfWidth`.",
      "L'AABB ne tourne pas : pour une boîte orientée (voiture, épée), passez à OBB + SAT."
    ],
    related: ["obb-sat", "circle-sphere-collision", "ray-aabb-slab"]
  },
  {
    id: "circle-sphere-collision",
    glyph: "◯∩□",
    name: "Collisions Cercle / Sphère & Cercle-AABB",
    subtitle: "Hitboxes radiales, AoE et clamp du point le plus proche",
    categoryId: "collisions",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["Collisions", "Combat & Visée", "Optimisation"],
    sandbox: "collision",
    sandboxMode: "circlesphere",
    formula: "Cercle-Cercle: ‖C₁-C₂‖² ≤ (r₁+r₂)²   |   Cercle-AABB: P_near = clamp(C, box.min, box.max)",
    formulaVars: "P_near : point de la boîte le plus proche du centre du cercle · Collision si ‖C - P_near‖² ≤ r²",
    summary: "Deux cercles/sphères se touchent dès que la distance au carré entre leurs centres est inférieure à la somme de leurs rayons au carré. Et pour tester un Cercle contre une Boîte AABB (balle de Breakout, personnage circulaire contre mur), il suffit de clamper le centre du cercle dans les bornes de la boîte !",
    tldr: "L'astuce Cercle-AABB en 2 lignes : `closest = Clamp(circleCenter, boxMin, boxMax)` puis `DistanceSquared(circleCenter, closest) <= r * r` !",
    signatures: {
      unity: "Vector3 closest = bounds.ClosestPoint(center); bool hit = (closest - center).sqrMagnitude <= r*r;",
      godotCs: "Vector2 closest = center.Clamp(rect.Position, rect.End);",
      godotGd: "var closest = center.clamp(rect.position, rect.end)",
      unrealCpp: "FVector Closest = Box.GetClosestPointTo(Center); bool bHit = FVector::DistSquared(Center, Closest) <= R*R;",
      unrealBp: "Sphere Overlap / Clamp Vector to Box",
      csharp: "Vector2 cl = Vector2.Clamp(c, bMin, bMax); bool hit = Vector2.DistanceSquared(c, cl) <= r*r;",
      cpp: "vec2 cl = glm::clamp(c, bMin, bMax); bool hit = glm::distance2(c, cl) <= r*r;"
    },
    examples: [
      {
        title: "Résolution de rebond Cercle contre Mur AABB",
        desc: "La normale exacte de rebond (même sur les coins !) est simplement `normalize(center - closest)`.",
        code: "Vector2 push = center - closest;\nVector2 normal = push.normalized;\nvelocity = Vector2.Reflect(velocity, normal);"
      }
    ],
    pitfalls: [
      "Si le centre du cercle pénètre complètement à l'intérieur de la boîte, `closest == center` et `push == (0, 0)` : gérez ce cas en poussant vers la face la plus proche."
    ],
    related: ["aabb-collision", "magnitude-sqrmagnitude", "closest-point-segment-capsule"]
  },
  {
    id: "obb-sat",
    glyph: "SAT",
    name: "OBB & Théorème des Axes Séparateurs (SAT)",
    subtitle: "Collisions de boîtes orientées et polygones convexes avec MTV",
    categoryId: "collisions",
    dimension: "2d",
    difficulty: 3,
    tags: ["Collisions", "Physique", "Combat & Visée"],
    sandbox: "collision",
    sandboxMode: "sat",
    formula: "Séparés ⟺ ∃ axe n̂ tel que max(Proj_A) < min(Proj_B) ∨ max(Proj_B) < min(Proj_A)",
    formulaVars: "Axes à tester (OBB 2D) : les 2 normales de A + les 2 normales de B (4 axes au total)",
    summary: "Deux formes convexes (OBB, triangles, polygones) NE se touchent PAS s'il existe au moins un axe de projection (parmi les normales de leurs faces) sur lequel leurs ombres ne se recouvrent pas. S'il y a recouvrement sur TOUS les axes, il y a collision et le plus petit overlap donne le vecteur de séparation exact (MTV) !",
    tldr: "Faites tourner les boîtes dans le Playground : observez les projections sur chaque axe normal — dès qu'un écart (gap) apparaît, les boîtes sont séparées !",
    signatures: {
      unity: "Physics.ComputePenetration(colA, posA, rotA, colB, posB, rotB, out dir, out dist)",
      godotCs: "shapeA.CollideAndGetContacts(xformA, shapeB, xformB)",
      godotGd: "shape_a.collide_and_get_contacts(xform_a, shape_b, xform_b)",
      unrealCpp: "FCollisionShape::MakeBox(HalfExtent) // PhysX/Chaos SAT",
      unrealBp: "Component Overlap / SAT Custom",
      csharp: "foreach (var axis in axes) { Project(polyA, axis); Project(polyB, axis); ... }",
      cpp: "// Projeter les sommets sur les normales des arêtes via glm::dot"
    },
    examples: [
      {
        title: "Hitbox orientée d'épée ou voiture top-down",
        desc: "SAT en 2D entre deux OBB ne nécessite que 4 axes (16 dot products) et donne le vecteur de poussée exact.",
        code: "if (overlap < minOverlap) { minOverlap = overlap; mtvAxis = axis; }"
      }
    ],
    pitfalls: [
      "SAT ne fonctionne QUE sur des polygones CONVEXES. Pour une forme concave (L, étoile), découpez-la d'abord en triangles ou morceaux convexes.",
      "En 3D (OBB vs OBB), il faut tester 15 axes : 3 normales de A + 3 normales de B + 9 produits vectoriels d'arêtes (3×3)."
    ],
    related: ["aabb-collision", "dot-product", "project-projectonplane"]
  },
  {
    id: "closest-point-segment-capsule",
    glyph: "P→AB",
    name: "Point le Plus Proche sur Segment & Capsule",
    subtitle: "Hitboxes de personnages, lasers épais et rails 2D/3D",
    categoryId: "collisions",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["Collisions", "Combat & Visée", "3C & Mouvement"],
    sandbox: "collision",
    sandboxMode: "capsule",
    formula: "t = clamp01(((P - A) · (B - A)) / ‖B - A‖²)   →   Closest = A + t·(B - A)",
    formulaVars: "AB : segment de la capsule/laser · P : point testé · Collision capsule si ‖P - Closest‖ ≤ R",
    summary: "Projette un point P sur la droite (AB) et borne le paramètre `t` dans `[0, 1]` pour rester sur le segment. Une Capsule (la hitbox universelle des personnages 3D et des rayons laser épais) n'est mathématiquement rien d'autre qu'un segment muni d'un rayon R !",
    tldr: "Une Capsule = « tous les points à distance ≤ R d'un segment AB ». Un test Point-Capsule prend littéralement 4 lignes de maths !",
    signatures: {
      unity: "float t = Mathf.Clamp01(Vector3.Dot(p - a, ab) / ab.sqrMagnitude); Vector3 c = a + ab * t;",
      godotCs: "Geometry3D.GetClosestPointToSegment(p, a, b)",
      godotGd: "Geometry3D.get_closest_point_to_segment(p, a, b)",
      unrealCpp: "FMath::ClosestPointOnSegment(P, A, B)",
      unrealBp: "Find Closest Point on Segment",
      csharp: "float t = Math.Clamp(Vector3.Dot(p - a, ab) / ab.LengthSquared(), 0f, 1f);",
      cpp: "float t = glm::clamp(glm::dot(p - a, ab) / glm::dot(ab, ab), 0.f, 1.f);"
    },
    examples: [
      {
        title: "Faisceau laser épais (Beam Weapon) sans Physics engine",
        desc: "Teste chaque ennemi contre le segment du laser avec `dist <= beamRadius + enemyRadius`.",
        code: "Vector3 near = ClosestOnSegment(enemyPos, beamStart, beamEnd);\nif ((enemyPos - near).sqrMagnitude <= (beamR + enemyR)*(beamR + enemyR)) Hit(enemy);"
      }
    ],
    pitfalls: [
      "Si `A == B` (segment dégénéré de longueur 0), `ab.sqrMagnitude == 0` provoque une division par zéro : renvoyez directement `A`."
    ],
    related: ["project-projectonplane", "circle-sphere-collision", "sdf-2d"]
  },
  {
    id: "ray-plane",
    glyph: "R∩Π",
    name: "Intersection Rayon–Plan",
    subtitle: "Picking souris RTS / Hack'n'Slash / Isométrique sans collider",
    categoryId: "collisions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Collisions", "Caméra", "3C & Mouvement"],
    sandbox: "vector",
    sandboxMode: "rayplane",
    formula: "t = ((P₀ - O) · N̂) / (D · N̂)   →   Hit = O + t · D   (si t ≥ 0)",
    formulaVars: "O : origine du rayon (caméra) · D : direction du rayon · P₀, N̂ : point et normale du plan",
    summary: "Calcule en 2 produits scalaires le point exact où un rayon caméra perce un plan géométrique infini (ex: le sol `y = 0`). Ultra-rapide et indépendant de la géométrie du terrain : idéal pour viser à la souris dans un RTS, MOBA, Diablo-like ou éditeur de niveau.",
    tldr: "Si `D · N̂ ≈ 0`, le rayon est parallèle au plan (aucun impact). Si `t < 0`, l'impact est DERRIÈRE l'origine du rayon !",
    signatures: {
      unity: "Plane p = new Plane(Vector3.up, 0); if (p.Raycast(ray, out float t)) hit = ray.GetPoint(t);",
      godotCs: "Vector3? hit = new Plane(Vector3.Up, 0).IntersectsRay(origin, dir);",
      godotGd: "var hit = Plane(Vector3.UP, 0).intersects_ray(origin, dir)",
      unrealCpp: "FVector Hit = FMath::RayPlaneIntersection(Origin, Dir, FPlane(P0, Normal));",
      unrealBp: "Line Plane Intersection",
      csharp: "float denom = Vector3.Dot(dir, n); float t = Vector3.Dot(p0 - origin, n) / denom;",
      cpp: "float t = glm::dot(p0 - o, n) / glm::dot(d, n);"
    },
    examples: [
      {
        title: "Viser au sol dans un Twin-Stick / Hack'n'Slash (y = player.y)",
        desc: "Crée un plan horizontal à hauteur de l'arme du joueur pour une visée sans décalage de parallaxe.",
        code: "Plane aimPlane = new Plane(Vector3.up, gunTip.position);\nif (aimPlane.Raycast(cam.ScreenPointToRay(mouse), out float t)) AimAt(ray.GetPoint(t));"
      }
    ],
    pitfalls: [
      "Vérifiez toujours `Mathf.Abs(denom) > 1e-6f` (rayon parallèle au plan) ET `t >= 0` (pour ne pas détecter un plan derrière la caméra)."
    ],
    related: ["ray-sphere", "ray-aabb-slab", "dot-product"]
  },
  {
    id: "ray-sphere",
    glyph: "R∩◯",
    name: "Intersection Rayon–Sphère",
    subtitle: "Hitscan analytique, sélection d'objets et équation du 2nd degré",
    categoryId: "collisions",
    dimension: "3d",
    difficulty: 2,
    tags: ["Collisions", "Combat & Visée", "Shaders & Rendu"],
    sandbox: "collision",
    sandboxMode: "raysphere",
    formula: "L = O - C,  b = L·D̂,  c = L·L - R²,  Δ = b² - c   →   t = -b ± √Δ",
    formulaVars: "Δ < 0 : raté · Δ = 0 : tangent · Δ > 0 : 2 impacts (entrée t₁ = -b-√Δ, sortie t₂ = -b+√Δ)",
    summary: "Résout analytiquement le croisement entre un rayon et une sphère via le discriminant Δ. C'est le premier test de tout raytracer, des outils de sélection 3D (gizmos), et des tirs hitscan ultra-rapides sur des hitboxes sphériques (tête, boucliers).",
    tldr: "Le signe du discriminant `Δ = b² - c` répond instantanément : `< 0` raté, `≥ 0` touché ! `t₁` est le point d'entrée, `t₂` le point de sortie.",
    signatures: {
      unity: "Vector3 l = ray.origin - center; float b = Vector3.Dot(l, ray.direction); float d = b*b - (l.sqrMagnitude - r*r);",
      godotCs: "Geometry3D.SegmentIntersectsSphere(from, to, center, radius)",
      godotGd: "Geometry3D.segment_intersects_sphere(from, to, center, radius)",
      unrealCpp: "FMath::LineSphereIntersection(Origin, Dir, Length, Center, Radius)",
      unrealBp: "Line Trace / Ray-Sphere Custom",
      csharp: "float b = Vector3.Dot(o - c, d); float disc = b*b - (Vector3.Dot(o-c, o-c) - r*r);",
      cpp: "float b = glm::dot(o - c, d); float disc = b*b - (glm::dot(o-c, o-c) - r*r);"
    },
    examples: [
      {
        title: "Épaisseur traversée dans un bouclier / nuage volumétrique",
        desc: "Connaissant l'entrée `t₁` et la sortie `t₂`, la distance traversée dans la sphère vaut `t₂ - max(0, t₁)` !",
        code: "float thickness = t2 - Mathf.Max(0f, t1);"
      }
    ],
    pitfalls: [
      "La direction du rayon `D̂` DOIT être normalisée pour cette forme simplifiée (`a = D·D = 1`).",
      "Si `t₁ < 0` mais `t₂ > 0`, l'origine du rayon est À L'INTÉRIEUR de la sphère !"
    ],
    related: ["ray-plane", "ray-aabb-slab", "circle-sphere-collision"]
  },
  {
    id: "ray-aabb-slab",
    glyph: "Slab",
    name: "Intersection Rayon–AABB (Slabs)",
    subtitle: "Algorithme de Kay-Kajiya : cœur des BVH, Octrees et Voxels",
    categoryId: "collisions",
    dimension: "2d-3d",
    difficulty: 3,
    tags: ["Collisions", "Optimisation", "Shaders & Rendu"],
    sandbox: "collision",
    sandboxMode: "rayslab",
    formula: "t_enter = max(tx_min, ty_min),  t_exit = min(tx_max, ty_max)   |   Hit ⟺ t_exit ≥ max(0, t_enter)",
    formulaVars: "Chaque paire de faces parallèles forme une tranche (slab) [t_min, t_max]",
    summary: "Décompose une boîte AABB en 2 (ou 3) bandes parallèles (slabs). Le rayon intersecte la boîte si et seulement si l'intervalle d'entrée/sortie sur X chevauche celui sur Y (et Z) devant l'origine. C'est l'algorithme branchless qui propulse tous les moteurs de raycasting et raytracing modernes.",
    tldr: "L'astuce perf : pré-calculer `invDir = 1 / dir` UNE fois par rayon pour remplacer toutes les divisions par des multiplications SIMD !",
    signatures: {
      unity: "bounds.IntersectRay(ray, out float dist)",
      godotCs: "aabb.IntersectsRay(from, dir)",
      godotGd: "aabb.intersects_ray(from, dir)",
      unrealCpp: "FMath::LineBoxIntersection(Box, Start, End, Dir)",
      unrealBp: "Line Box Intersection",
      csharp: "float t1 = (min.X - o.X) * invD.X; // répéter sur Y, Z puis comparer max(tmin) <= min(tmax)",
      cpp: "vec3 t0 = (bMin - o) * invD, t1 = (bMax - o) * invD; float tmin = compMax(min(t0,t1));"
    },
    examples: [
      {
        title: "Connaître la face touchée d'un bloc Voxel (Minecraft)",
        desc: "L'axe qui a produit le plus grand `t_enter` est EXACTEMENT l'axe de la face percutée !",
        code: "Vector3 normal = txMin > tyMin ? new Vector3(-Mathf.Sign(d.x), 0, 0) : new Vector3(0, -Mathf.Sign(d.y), 0);"
      }
    ],
    pitfalls: [
      "Attention à `dir.x == 0` : en IEEE 754 `1.0f / 0.0f = +Infinity`, ce qui fonctionne bien SI `o.x` n'est pas exactement égal à `bMin.x` (`0 * Inf = NaN` !). Utilisez `min`/`max` IEEE-safe."
    ],
    related: ["aabb-collision", "ray-sphere", "ray-plane"]
  },
  {
    id: "point-in-triangle-barycentric",
    glyph: "u,v,w",
    name: "Coordonnées Barycentriques & Triangle",
    subtitle: "Point dans triangle, interpolation de terrain, UV et centre de masse",
    categoryId: "collisions",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["Collisions", "Shaders & Rendu", "Caméra"],
    sandbox: "collision",
    sandboxMode: "barycentric",
    formula: "P = u·A + v·B + w·C   avec   u + v + w = 1   |   Dedans ⟺ u, v, w ≥ 0",
    formulaVars: "u, v, w : poids normalisés des 3 sommets (proportionnels aux aires des sous-triangles)",
    summary: "Exprime tout point P comme un mélange pondéré des 3 sommets A, B, C d'un triangle. Si u, v et w sont tous positifs, P est à l'intérieur du triangle ! De plus, les mêmes poids `(u, v, w)` interpolent instantanément la hauteur d'un terrain, les UV d'une texture, la couleur ou la normale.",
    tldr: "Le GPU utilise les coordonnées barycentriques pour chaque pixel rasterisé. En gameplay, ça donne la hauteur exacte d'un personnage sur une face de Heightmap sans Raycast !",
    signatures: {
      unity: "RaycastHit.barycentricCoordinate  // (u, v, w)",
      godotCs: "Geometry2D.PointIsInsideTriangle(p, a, b, c)",
      godotGd: "Geometry2D.point_is_inside_triangle(p, a, b, c)",
      unrealCpp: "FMath::ComputeBaryCentric2D(Point, A, B, C)",
      unrealBp: "Compute Barycentric Coordinates",
      csharp: "float h = u * a.Y + v * b.Y + w * c.Y;",
      cpp: "glm::vec3 interp = u * attrA + v * attrB + w * attrC;"
    },
    examples: [
      {
        title: "Hauteur exacte sur un terrain triangulé sans Physics.Raycast",
        desc: "Calcule `(u, v, w)` en 2D sur XZ, puis interpole `y = u*A.y + v*B.y + w*C.y`.",
        code: "float groundY = u * vA.y + v * vB.y + w * vC.y;"
      },
      {
        title: "Caméra multijoueur pondérée (Barycentre)",
        desc: "Donne plus de poids au leader ou au boss dans le cadrage.",
        code: "Vector3 camTarget = (wA * pA + wB * pB + wC * pC) / (wA + wB + wC);"
      }
    ],
    pitfalls: [
      "Si les 3 sommets A, B, C sont alignés (triangle dégénéré d'aire 0), le dénominateur s'annule : protégez toujours contre `|area| < 1e-6f`."
    ],
    related: ["determinant-2d", "ray-plane", "bezier-curves"]
  },
  {
    id: "ik-alkashi-fabrik",
    glyph: "IK",
    name: "Cinématique Inverse (Al-Kashi 2-Bone & FABRIK)",
    subtitle: "Plier un bras, Foot IK sur escaliers et chaînes multi-os",
    categoryId: "collisions",
    dimension: "2d-3d",
    difficulty: 3,
    tags: ["3C & Mouvement", "Physique", "Rotations 3D"],
    sandbox: "collision",
    sandboxMode: "ik",
    formula: "Al-Kashi: c² = a² + b² - 2ab·cos(γ)  ⟹  γ = arccos((a² + b² - c²) / 2ab)",
    formulaVars: "a, b : longueurs des 2 os · c : distance Épaule→Cible · FABRIK : passes itératives avant/arrière",
    summary: "Résout la question inverse de l'animation : « sachant où je veux poser la main ou le pied, quels angles doivent prendre l'épaule et le coude ? ». Pour 2 os (bras/jambe), la loi des cosinus d'Al-Kashi donne la solution analytique exacte en 1 étape. Pour N segments (tentacule, queue, bras robotique), l'algorithme FABRIK converge en 3 à 5 itérations !",
    tldr: "Basculez entre **2-Bone Al-Kashi** et **Chaîne FABRIK (5 os)** dans le Playground et glissez la cible jaune pour voir l'IK travailler en direct !",
    signatures: {
      unity: "TwoBoneIKConstraint (Animation Rigging) / Custom FABRIK",
      godotCs: "SkeletonIK3D / FABRIK3D",
      godotGd: "# 2-Bone: acos(clamp((a*a + b*b - c*c) / (2*a*b), -1, 1))",
      unrealCpp: "Control Rig: Basic IK / FABRIK Node",
      unrealBp: "AnimGraph: Two Bone IK / FABRIK",
      csharp: "float cosG = Math.Clamp((a*a + b*b - c*c) / (2f*a*b), -1f, 1f);",
      cpp: "float gamma = std::acos(std::clamp((a*a + b*b - c*c) / (2*a*b), -1.f, 1.f));"
    },
    examples: [
      {
        title: "Foot IK sur escaliers & terrains accidentés",
        desc: "Tire un raycast sous chaque pied, récupère la cible au sol, puis résout le genou via 2-Bone Al-Kashi.",
        code: "float dist = Mathf.Clamp((target - hip).magnitude, 0.01f, thighLen + shinLen - 0.001f);"
      }
    ],
    pitfalls: [
      "Clampez la distance cible strictement sous `a + b - epsilon` (jambe légèrement fléchie) pour éviter le « knee pop » brutal quand le membre se tend à 180°.",
      "En 3D, un 2-Bone IK a besoin d'un **Pole Vector** (direction vers où pointe le genou/coude) pour lever l'ambiguïté de rotation autour de l'axe Hanche→Pied."
    ],
    related: ["acos", "pythagore", "euler-verlet-integration"]
  },

  // =========================================================================
  // 08. Physique, Cinématique & IA
  // =========================================================================
  {
    id: "reflect-rebound",
    glyph: "R(v,n)",
    name: "Réflexion, Rebonds & Restitution",
    subtitle: "Lasers, billard, ricochets et rebonds amortis avec friction",
    categoryId: "physics",
    dimension: "2d-3d",
    difficulty: 1,
    tags: ["Physique", "Combat & Visée", "Collisions"],
    sandbox: "vector",
    sandboxMode: "reflect",
    formula: "R = V - 2·(V · N̂)·N̂   |   Avec restitution e ∈ [0,1]: V' = V_t·(1-μ) - e·V_n",
    formulaVars: "V : vecteur incident · N̂ : normale unitaire du mur · e : élasticité (1=parfait, 0=glisse)",
    summary: "Inverse la composante normale de la vitesse par rapport à la surface pour créer un rebond symétrique (angle d'incidence = angle de réflexion). En ajoutant le coefficient de restitution `e` et la friction `μ`, vous modélisez aussi bien un rayon laser qu'une grenade ou une balle de tennis.",
    tldr: "Décomposer `V = V_n + V_t` (avec `V_n = (V·N̂)N̂`) permet de contrôler séparément le rebond (`-e·V_n`) et le freinage par frottement (`(1-μ)·V_t`) !",
    signatures: {
      unity: "Vector3.Reflect(velocity, hit.normal)",
      godotCs: "velocity.Bounce(normal)",
      godotGd: "velocity.bounce(normal)",
      unrealCpp: "FMath::GetReflectionVector(Velocity, Normal)",
      unrealBp: "Get Reflection Vector / Mirror Vector by Normal",
      csharp: "Vector3.Reflect(v, n)",
      cpp: "glm::reflect(v, n)"
    },
    examples: [
      {
        title: "Rebond de grenade avec amortissement réaliste",
        desc: "Perd 45% de rebond vertical et 20% de vitesse horizontale à chaque impact.",
        code: "Vector3 vn = Vector3.Dot(vel, n) * n;\nVector3 vt = vel - vn;\nvel = vt * 0.8f - vn * 0.55f;"
      }
    ],
    pitfalls: [
      "Assurez-vous que `V · N̂ < 0` (l'objet va VERS le mur) avant de refléter, sinon un objet déjà en train de s'éloigner peut rester piégé dans le mur !"
    ],
    related: ["project-projectonplane", "dot-product", "circle-sphere-collision"]
  },
  {
    id: "ballistic-trajectory",
    glyph: "½gt²",
    name: "Parabole Balistique & Saut Calibré",
    subtitle: "Prédiction de grenades, flèches et design exact de saut platformer",
    categoryId: "physics",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["Physique", "3C & Mouvement", "Combat & Visée"],
    sandbox: "physics",
    sandboxMode: "ballistic",
    formula: "P(t) = P₀ + V₀·t + ½·g·t²   |   Saut exact: v₀ = 2H / t_apex,  g = -2H / t_apex²",
    formulaVars: "H : hauteur de saut désirée (m) · t_apex : durée jusqu'au sommet (s) — réglable par les Game Designers !",
    summary: "Décrit exactement la trajectoire parabolique sous gravité constante. En Gameplay Programming, inverser cette équation est une arme secrète : au lieu de tâtonner avec `jumpForce = 420` et `gravity = 25`, le Game Designer choisit directement **Hauteur = 3.5m** et **Durée = 0.4s** et le code calcule `v₀` et `g` exacts !",
    tldr: "Formule magique du saut platformer (Celeste / Mario) : `v0 = 2 * H / tApex` et `gravity = -2 * H / (tApex * tApex)` — plus jamais de nombres magiques !",
    signatures: {
      unity: "Vector3 pos = p0 + v0 * t + 0.5f * Physics.gravity * t * t;",
      godotCs: "Vector3 pos = p0 + v0 * t + 0.5f * gravity * t * t;",
      godotGd: "var pos = p0 + v0 * t + 0.5 * gravity * t * t",
      unrealCpp: "UGameplayStatics::PredictProjectilePath(World, Params, Result)",
      unrealBp: "Predict Projectile Path (By TraceChannel)",
      csharp: "Vector2 p = p0 + v0 * t + 0.5f * g * t * t;",
      cpp: "glm::vec3 p = p0 + v0 * t + 0.5f * g * t * t;"
    },
    examples: [
      {
        title: "Saut calibré avec chute plus lourde (Game Feel)",
        desc: "Multipliez la gravité par `1.5f` dès que `vel.y < 0` pour une redescente nerveuse et zéro effet « lunaire ».",
        code: "float v0 = 2f * jumpHeight / timeToApex;\nfloat gUp = -2f * jumpHeight / (timeToApex * timeToApex);\nfloat gDown = gUp * 1.6f;"
      }
    ],
    pitfalls: [
      "Pour une prédiction visuelle qui colle à 100% au moteur physique (RigidBody), utilisez la même gravité et tenez compte du `linearDamping` (drag), sinon l'arc de visée diverge de la vraie grenade !"
    ],
    related: ["lead-target-interception", "euler-verlet-integration", "friction-drag-acceleration"]
  },
  {
    id: "lead-target-interception",
    glyph: "Δt*",
    name: "Tir d'Anticipation (Lead Target)",
    subtitle: "Toucher une cible EN MOUVEMENT en résolvant une équation quadratique",
    categoryId: "physics",
    dimension: "2d-3d",
    difficulty: 3,
    tags: ["Combat & Visée", "IA & Navigation", "Physique"],
    sandbox: "physics",
    sandboxMode: "leadtarget",
    formula: "(‖V_t‖² - s²)·t² + 2(D·V_t)·t + ‖D‖² = 0   →   AimPoint = P_t + V_t · t",
    formulaVars: "D = P_target - P_shooter · V_t : vitesse cible · s : vitesse du projectile · t > 0 : temps d'impact",
    summary: "Si une tourelle tire vers la position actuelle d'un vaisseau ou d'un joueur en train de sprinter, le projectile passe toujours derrière lui ! En résolvant `‖(P_t + V_t·t) - P_s‖ = s·t` (équation du 2nd degré en `t`), la tourelle calcule le point futur EXACT d'interception.",
    tldr: "Observez dans le Playground : le tir blanc (visée naïve) rate systématiquement, tandis que le tir vert (Lead Target) intercepte la cible en plein vol !",
    signatures: {
      unity: "bool TryGetInterceptTime(Vector3 d, Vector3 vTarget, float bulletSpeed, out float t)",
      godotCs: "// a = vt.Dot(vt) - s*s; b = 2*d.Dot(vt); c = d.Dot(d); résoudre a*t²+b*t+c=0",
      godotGd: "# Résoudre a*t*t + b*t + c = 0, prendre le plus petit t > 0",
      unrealCpp: "// a = V.SizeSquared() - S*S; b = 2*FVector::DotProduct(D, V); c = D.SizeSquared();",
      unrealBp: "Custom Pure Function: Calculate Lead Intercept",
      csharp: "float a = Vector3.Dot(vt, vt) - s*s; float b = 2f*Vector3.Dot(d, vt); float c = Vector3.Dot(d, d);",
      cpp: "float disc = b*b - 4*a*c; // choisir le plus petit t > 0"
    },
    examples: [
      {
        title: "Tourelle antiaérienne ou archer IA précis",
        desc: "Ajoutez un léger bruit gaussien sur `t` ou `aimPoint` selon la difficulté pour que l'IA ne soit pas un aimbot frustrant.",
        code: "if (TryIntercept(targetPos - pos, targetVel, arrowSpeed, out float t)) {\n  Vector3 aim = targetPos + targetVel * t;\n  FireTowards(aim);\n}"
      }
    ],
    pitfalls: [
      "Cas limite `a ≈ 0` (vitesse cible == vitesse projectile) : l'équation devient linéaire `b·t + c = 0`, donc `t = -c / b` (évite la division par `2a = 0` !).",
      "Si `disc < 0` ou si les deux racines `t` sont négatives, la cible est trop rapide et hors de portée d'interception."
    ],
    related: ["ballistic-trajectory", "ray-sphere", "steering-behaviors"]
  },
  {
    id: "euler-verlet-integration",
    glyph: "∫dt",
    name: "Intégration Physique : Euler vs Verlet",
    subtitle: "Stabilité de simulation, cordes, capes, chaînes et ragdolls",
    categoryId: "physics",
    dimension: "2d-3d",
    difficulty: 3,
    tags: ["Physique", "UI & Game Feel", "Optimisation"],
    sandbox: "physics",
    sandboxMode: "verlet",
    formula: "Semi-Implicite: v' = v + a·dt, x' = x + v'·dt   |   Verlet: x' = x + (x - x_prev)·d + a·dt²",
    formulaVars: "Euler Explicite accumule de l'énergie (explose) · Verlet encode la vitesse dans (x - x_prev) → contraintes triviales !",
    summary: "Comment faire avancer un système physique frame après frame sans qu'il explose ? L'intégration Semi-Implicite (Symplectic Euler) est le standard des corps rigides. L'intégration de Verlet stocke `(pos, prevPos)` au lieu de la vitesse : imposer une longueur de corde ou une collision revient simplement à déplacer les points !",
    tldr: "Agitez la corde Verlet dans le Playground ! 15 lignes de code suffisent pour simuler capes, chaînes, grappins, plantes et tissus à 60 FPS.",
    signatures: {
      unity: "Vector3 vel = (pos - prevPos) * damping; prevPos = pos; pos += vel + accel * dt * dt;",
      godotCs: "Vector2 vel = (pos - prevPos) * damping; prevPos = pos; pos += vel + accel * dt * dt;",
      godotGd: "var vel = (pos - prev_pos) * damping; prev_pos = pos; pos += vel + accel * dt * dt",
      unrealCpp: "FVector Vel = (Pos - PrevPos) * Damping; PrevPos = Pos; Pos += Vel + Accel * Dt * Dt;",
      unrealBp: "Physics / Custom Verlet Solver Component",
      csharp: "// Contrainte distance (itérer 4-8×): delta = (p2-p1); corr = (len-target)/len * 0.5f;",
      cpp: "// Semi-implicit: v += a * dt; p += v * dt; (toujours mettre à jour v AVANT p !)"
    },
    examples: [
      {
        title: "Résoudre une contrainte de longueur de corde (Stick Constraint)",
        desc: "Répété 5 à 10 fois par frame, chaque segment maintient sa longueur exacte de manière ultra-stable.",
        code: "Vector2 diff = p2 - p1;\nfloat err = (diff.magnitude - restLen) / diff.magnitude;\np1 += diff * (0.5f * err); p2 -= diff * (0.5f * err);"
      }
    ],
    pitfalls: [
      "Utilisez TOUJOURS un pas de temps fixe (`FixedUpdate` / accumulateur `fixedDt = 1/60`) avec Verlet ! Si `dt` varie brusquement, `(x - prevPos)` fausse la vitesse implicite.",
      "Dans Euler Semi-Implicite, mettez TOUJOURS à jour `vel` AVANT `pos` (inverser les deux lignes donne Euler Explicite, qui diverge et explose)."
    ],
    related: ["smoothdamp-spring", "ballistic-trajectory", "ik-alkashi-fabrik"]
  },
  {
    id: "friction-drag-acceleration",
    glyph: "F=ma",
    name: "Accélération, Friction & Vitesse Terminale",
    subtitle: "Contrôleur nerveux, drag aérodynamique et virages sans patinage",
    categoryId: "physics",
    dimension: "2d-3d",
    difficulty: 2,
    tags: ["3C & Mouvement", "Physique"],
    sandbox: "physics",
    sandboxMode: "kinematics",
    formula: "a = F/m - k_drag·v   |   v_max = F / (m · k_drag)   |   v' = v · e^(-drag·dt)",
    formulaVars: "k_drag : résistance fluide · Friction sèche : décélération constante vers 0 (MoveTowards)",
    summary: "Un bon Character Controller ne se résume pas à `pos += input * speed * dt`. Combiner une accélération élevée, une friction sèche plus forte au freinage et un bonus de contre-braquage (turn-around boost) donne cette sensation précise et réactive des meilleurs jeux d'action.",
    tldr: "Friction fluide (`v *= exp(-drag*dt)`) pour les véhicules/espace/glace · Friction sèche (`MoveTowards(v, 0, decel*dt)`) pour des arrêts nets au sol.",
    signatures: {
      unity: "vel = Vector2.MoveTowards(vel, input * maxSpeed, rate * dt);",
      godotCs: "vel = vel.MoveToward(input * maxSpeed, rate * (float)delta);",
      godotGd: "velocity = velocity.move_toward(input * max_speed, rate * delta)",
      unrealCpp: "Velocity = FMath::VInterpConstantTo(Velocity, TargetVel, Dt, Rate);",
      unrealBp: "CharacterMovementComponent (Braking Deceleration / Ground Friction)",
      csharp: "vel *= MathF.Exp(-drag * dt); // amortissement fluide framerate-safe",
      cpp: "vel *= std::exp(-drag * dt);"
    },
    examples: [
      {
        title: "Contre-braquage nerveux (Turn Boost)",
        desc: "Si le joueur pousse le stick à l'opposé de sa vitesse (`Dot < 0`), on double la décélération !",
        code: "float rate = Vector2.Dot(input, vel) < 0f ? turnAccel : runAccel;\nvel = Vector2.MoveTowards(vel, input * maxSpeed, rate * dt);"
      }
    ],
    pitfalls: [
      "Ne faites jamais `vel *= 0.9f;` dans `Update()` : à 120 FPS le freinage sera 2× plus fort qu'à 60 FPS ! Utilisez `vel *= Mathf.Exp(-drag * dt)`."
    ],
    related: ["movetowards", "framerate-independent-damping", "dot-product"]
  },
  {
    id: "steering-behaviors",
    glyph: "Steer",
    name: "Steering Behaviors (Craig Reynolds)",
    subtitle: "Seek, Flee, Arrive, Pursuit et Wander pour des IA organiques",
    categoryId: "physics",
    dimension: "2d",
    difficulty: 2,
    tags: ["IA & Navigation", "Physique", "3C & Mouvement"],
    sandbox: "physics",
    sandboxMode: "steering",
    formula: "F_steer = clamp(V_desired - V_current, maxForce)   |   Arrive: speed = maxSpeed · clamp01(d / slowR)",
    formulaVars: "V_desired : vitesse idéale vers/loin de la cible · maxForce : agilité de virage",
    summary: "Au lieu de téléporter la direction d'une IA vers le joueur, les Steering Behaviors calculent une force de braquage (`Desired - Current`) bornée par `maxForce`. En combinant 5 briques simples (Seek, Flee, Arrive, Evade, Wander), les ennemis, véhicules et compagnons prennent instantanément vie.",
    tldr: "Formule unique de Reynolds : `steering = desiredVelocity - currentVelocity`. Pour `Arrive`, réduisez linéairement la vitesse désirée dans le rayon de freinage !",
    signatures: {
      unity: "Vector2 steer = Vector2.ClampMagnitude(desired - vel, maxForce);",
      godotCs: "Vector2 steer = (desired - vel).LimitLength(maxForce);",
      godotGd: "var steer = (desired - vel).limit_length(max_force)",
      unrealCpp: "FVector Steer = (Desired - Vel).GetClampedToMaxSize(MaxForce);",
      unrealBp: "Clamp Vector Size (Desired - Velocity)",
      csharp: "Vector2 steer = ClampMagnitude(desired - vel, maxForce);",
      cpp: "glm::vec2 steer = clampLen(desired - vel, maxForce);"
    },
    examples: [
      {
        title: "Arrive : approcher sans osciller autour de la cible",
        desc: "Réduit progressivement la vitesse désirée dès que l'agent entre dans le cercle `slowRadius`.",
        code: "float speed = dist < slowR ? maxSpeed * (dist / slowR) : maxSpeed;\nVector2 desired = toTarget.normalized * speed;"
      }
    ],
    pitfalls: [
      "En sommant plusieurs forces (Seek + Avoidance), donnez une priorité stricte à l'évitement d'obstacles, sinon un ennemi poursuivant le joueur peut s'encastrer dans un mur."
    ],
    related: ["boids-flocking", "lead-target-interception", "friction-drag-acceleration"]
  },
  {
    id: "boids-flocking",
    glyph: "∇F",
    name: "Boids (Flocking) & Flow Fields",
    subtitle: "Séparation, Alignement, Cohésion et champs vectoriels de foule",
    categoryId: "physics",
    dimension: "2d",
    difficulty: 3,
    tags: ["IA & Navigation", "Physique", "Optimisation"],
    sandbox: "physics",
    sandboxMode: "boids",
    formula: "F_boid = w₁·Sep + w₂·Align + w₃·Coh   |   FlowField(x,y) = -∇Cost + Vortex",
    formulaVars: "3 règles locales créent un comportement collectif complexe · Flow Field = 1 grille pour 10 000 unités !",
    summary: "Réunit deux piliers de la simulation de foules : les **Boids** (nuées d'oiseaux, bancs de poissons, hordes) régis par 3 forces locales, et les **Champs Vectoriels / Flow Fields** (RTS, Vampire Survivors) où chaque case de la carte stocke un vecteur de direction partagé par des milliers d'agents sans recalculer A* !",
    tldr: "Cliquez dans le Playground pour attirer la nuée et basculez entre **Boids (Flocking)** et **Champ Vectoriel / Vortex Nabla** !",
    signatures: {
      unity: "Vector2 force = sep * wSep + align * wAlign + coh * wCoh;",
      godotCs: "Vector2 flow = flowGrid[cellX, cellY];",
      godotGd: "var force = sep * w_sep + align * w_align + coh * w_coh",
      unrealCpp: "FVector Flow = SampleVectorField(Location); // Niagara / MassAI",
      unrealBp: "Niagara Vector Field / Mass Entity Steering",
      csharp: "Vector2 vortex = new Vector2(-dy, dx) * swirl + (target - pos) * pull;",
      cpp: "glm::vec2 vortex = glm::vec2(-dy, dx) * swirl;"
    },
    examples: [
      {
        title: "Horde de 5 000 ennemis à 60 FPS (Spatial Hashing + Flow Field)",
        desc: "Au lieu de boucler sur tous les voisins en O(N²), on n'inspecte que les 9 cases de grille voisines (O(N)).",
        code: "int cellKey = (floor(x / cellSize) * 73856093) ^ (floor(y / cellSize) * 19349663);"
      }
    ],
    pitfalls: [
      "Tester tous les Boids contre tous les Boids est en `O(N²)` : dès 500 agents, utilisez une grille spatiale (Spatial Hash Grid) ou un Quadtree."
    ],
    related: ["steering-behaviors", "direction", "perlin-noise"]
  }
];
