export const DIMENSIONS = [
  { id: "all", label: "Tout", short: "Tous" },
  { id: "general", label: "Généraliste", short: "Généraliste" },
  { id: "2d", label: "2D", short: "2D" },
  { id: "3d", label: "3D", short: "3D" },
  { id: "2d-3d", label: "2D & 3D", short: "2D & 3D" }
];

export const DIMENSION_META = {
  general: { label: "Généraliste", badgeClass: "mv-badge-dim-general" },
  "2d": { label: "2D", badgeClass: "mv-badge-dim-2d" },
  "3d": { label: "3D", badgeClass: "mv-badge-dim-3d" },
  "2d-3d": { label: "2D & 3D", badgeClass: "mv-badge-dim-2d-3d" }
};

export const DIFFICULTY_META = {
  1: { label: "Fondamental", badgeClass: "mv-badge-diff-1" },
  2: { label: "Intermédiaire", badgeClass: "mv-badge-diff-2" },
  3: { label: "Avancé", badgeClass: "mv-badge-diff-3" }
};

export const CATEGORIES = [
  {
    id: "scalars",
    index: "01",
    name: "Fondamentaux Scalaires & Arithmétique",
    shortName: "Scalaires & Arithmétique",
    desc: "Bornages, arrondis sur grille, modulos, puissances, précision IEEE 754 et masques binaires."
  },
  {
    id: "interpolation",
    index: "02",
    name: "Interpolations, Ressorts & Game Feel",
    shortName: "Interpolations & Game Feel",
    desc: "Lerp, Remap, Easing, amortissement indépendant du framerate, ressorts critiques et deadzones."
  },
  {
    id: "trigonometry",
    index: "03",
    name: "Trigonométrie & Angles",
    shortName: "Trigonométrie & Angles",
    desc: "Cercle unitaire, coordonnées polaires, visée 360° Atan2, plus court chemin angulaire et rotations 2D."
  },
  {
    id: "vectors",
    index: "04",
    name: "Vecteurs & Algèbre Linéaire",
    shortName: "Vecteurs & Algèbre",
    desc: "Directions, normalisation, distances optimisées, produit scalaire, produit vectoriel, déterminant et projections."
  },
  {
    id: "quaternions",
    index: "05",
    name: "Quaternions & Rotations 3D",
    shortName: "Quaternions & 3D",
    desc: "Euler vs Gimbal Lock, anatomie (x,y,z,w), AngleAxis, LookRotation, Slerp/Nlerp et composition 3D."
  },
  {
    id: "spaces",
    index: "06",
    name: "Espaces, Matrices & Caméra",
    shortName: "Espaces & Matrices",
    desc: "Repères Unity/Godot/Unreal, local vs monde, matrices TRS 4×4, coordonnées sphériques, frustum et bases orthonormées."
  },
  {
    id: "collisions",
    index: "07",
    name: "Géométrie, Collisions & Raycasting",
    shortName: "Collisions & Raycast",
    desc: "AABB, Cercles/Sphères, OBB & SAT, Capsules, Ray-Plane, Ray-Sphere, Slabs, Barycentriques et Cinématique Inverse."
  },
  {
    id: "physics",
    index: "08",
    name: "Physique, Cinématique & IA",
    shortName: "Physique & IA",
    desc: "Rebonds, balistique, sauts calibrés, tir d'anticipation, intégration Verlet, friction, Steering et Boids/Flow Fields."
  },
  {
    id: "curves",
    index: "09",
    name: "Courbes & Splines",
    shortName: "Courbes & Splines",
    desc: "Bézier quadratique/cubique (De Casteljau), Catmull-Rom et reparamétrisation par longueur d'arc à vitesse constante."
  },
  {
    id: "procedural",
    index: "10",
    name: "Procédural, Shaders & Couleurs",
    shortName: "Procédural & Shaders",
    desc: "Bruit de Perlin, fBm multi-octaves, Voronoï/Worley, Signed Distance Fields (SDF) et espaces couleur linéaires/Kelvin."
  },
  {
    id: "probability",
    index: "11",
    name: "Probabilités, Aléatoire & Équilibrage",
    shortName: "Probabilités & Équilibrage",
    desc: "Loi normale (Gauss), tables de loot pondérées, Fisher-Yates, seeds déterministes et courbes d'armure/XP."
  }
];

export const GAMEPLAY_TAGS = [
  "3C & Mouvement",
  "Caméra",
  "Combat & Visée",
  "IA & Navigation",
  "Physique",
  "Collisions",
  "Rotations 3D",
  "UI & Game Feel",
  "Procédural",
  "Shaders & Rendu",
  "Équilibrage & RPG",
  "Optimisation"
];

export const LEARNING_PATHS = [
  {
    id: "path-3c",
    title: "Fondations 3C (Character, Camera, Controls)",
    desc: "Le socle quotidien d'un Gameplay Programmer : déplacements propres, caméras fluides et sensations de contrôle.",
    concepts: [
      "direction", "normalized", "clamp", "hysteresis-deadzone",
      "atan-vs-atan2", "project-projectonplane", "framerate-independent-damping",
      "smoothdamp-spring", "spherical-cylindrical"
    ]
  },
  {
    id: "path-combat-ai",
    title: "Combat, Détection & IA Gameplay",
    desc: "Cônes de vision, détection gauche/droite, portées optimisées, balistique, anticipation de cible et Steering.",
    concepts: [
      "magnitude-sqrmagnitude", "dot-product", "determinant-2d", "deltaangle",
      "ballistic-trajectory", "lead-target-interception", "steering-behaviors",
      "boids-flocking", "ray-sphere"
    ]
  },
  {
    id: "path-3d-rot",
    title: "Maîtrise 3D, Matrices & Quaternions",
    desc: "Comprendre les repères moteurs, éviter le Gimbal Lock et manipuler les quaternions et matrices sans deviner.",
    concepts: [
      "coordinate-systems", "cross-product", "transform-local-world", "matrix-trs",
      "euler-gimbal-lock", "quaternion-anatomy", "quaternion-lookrotation",
      "quaternion-slerp-nlerp", "quaternion-multiply", "orthonormal-basis"
    ]
  },
  {
    id: "path-collisions",
    title: "Moteur de Collisions & Physique Custom",
    desc: "Écrire ses propres détections de collision, raycasts mathématiques, rebonds, IK et cordes Verlet.",
    concepts: [
      "aabb-collision", "circle-sphere-collision", "obb-sat",
      "closest-point-segment-capsule", "ray-plane", "ray-aabb-slab",
      "reflect-rebound", "euler-verlet-integration", "ik-alkashi-fabrik"
    ]
  },
  {
    id: "path-juice",
    title: "Game Feel, Courbes & Cinématiques",
    desc: "Polir un jeu avec des courbes d'easing, splines à vitesse constante, remapping et transitions organiques.",
    concepts: [
      "lerp", "inverselerp-remap", "smoothstep", "easing-curves",
      "movetowards", "bezier-curves", "catmull-rom-spline", "arc-length-reparam"
    ]
  },
  {
    id: "path-proc",
    title: "Génération Procédurale, Shaders & RPG",
    desc: "Terrains fBm, biomes Voronoï, SDF, couleurs linéaires, bruit reproductible par seed et économie de jeu.",
    concepts: [
      "perlin-noise", "fbm-octaves", "voronoi-worley", "sdf-2d",
      "color-spaces-kelvin", "gaussian-normal", "weighted-random-loot",
      "prng-hash-seeds", "damage-xp-curves"
    ]
  }
];

export const RANKS = [
  { level: 1, name: "Apprenti Vectoriel", minXp: 0 },
  { level: 2, name: "Scripteur Gameplay", minXp: 150 },
  { level: 3, name: "Développeur 2D/3D", minXp: 450 },
  { level: 4, name: "Ingénieur 3C", minXp: 900 },
  { level: 5, name: "Architecte Physique", minXp: 1500 },
  { level: 6, name: "Maître Quaternions", minXp: 2300 },
  { level: 7, name: "Architecte Moteur", minXp: 3200 }
];

export const MILESTONES = [
  {
    id: "first-steps",
    title: "Premier Contact",
    desc: "Explorer 5 playgrounds interactifs.",
    check: (stats) => stats.exploredCount >= 5
  },
  {
    id: "trig-master",
    title: "Sniper Trigonométrique",
    desc: "Assimiler tous les concepts de Trigonométrie.",
    check: (stats) => stats.categoryRatio("trigonometry") === 1
  },
  {
    id: "vector-master",
    title: "Algébriste Terrain",
    desc: "Assimiler tous les concepts de Vecteurs & Algèbre.",
    check: (stats) => stats.categoryRatio("vectors") === 1
  },
  {
    id: "zero-gimbal",
    title: "Zéro Gimbal Lock",
    desc: "Assimiler tous les concepts de Quaternions & 3D.",
    check: (stats) => stats.categoryRatio("quaternions") === 1
  },
  {
    id: "collision-architect",
    title: "Architecte Collisions",
    desc: "Assimiler tous les concepts de Collisions & Raycasting.",
    check: (stats) => stats.categoryRatio("collisions") === 1
  },
  {
    id: "game-feel-craft",
    title: "Artisan du Game Feel",
    desc: "Assimiler toutes les Interpolations & Ressorts.",
    check: (stats) => stats.categoryRatio("interpolation") === 1
  },
  {
    id: "proc-crafter",
    title: "Forgeur Procédural",
    desc: "Assimiler tous les concepts Procédural & Shaders.",
    check: (stats) => stats.categoryRatio("procedural") === 1
  },
  {
    id: "half-bible",
    title: "Demi-Bible",
    desc: "Assimiler au moins 50% de la Bible Mathématique.",
    check: (stats) => stats.masteredCount >= Math.ceil(stats.totalCount * 0.5)
  },
  {
    id: "full-bible",
    title: "Bible Complète",
    desc: "Assimiler 100% des concepts du catalogue.",
    check: (stats) => stats.masteredCount >= stats.totalCount && stats.totalCount > 0
  }
];
