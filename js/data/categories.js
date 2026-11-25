export const DIMENSIONS = [
  { id: "all", label: "Tous" },
  { id: "general", label: "Généraliste" },
  { id: "2d", label: "2D" },
  { id: "3d", label: "3D" },
  { id: "2d-3d", label: "2D & 3D" }
];

export const DIMENSION_META = {
  general: { label: "Généraliste", badgeClass: "gb-tag-general" },
  "2d": { label: "2D", badgeClass: "gb-tag-2d" },
  "3d": { label: "3D", badgeClass: "gb-tag-3d" },
  "2d-3d": { label: "2D & 3D", badgeClass: "gb-tag-2d3d" }
};

export const DIFFICULTY_META = {
  1: { label: "Fondamental", badgeClass: "gb-tag-muted" },
  2: { label: "Intermédiaire", badgeClass: "gb-tag-muted" },
  3: { label: "Avancé", badgeClass: "gb-tag-muted" }
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
